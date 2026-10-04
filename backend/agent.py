"""The Campus Customs shop agent (PydanticAI).

Pieces, as in HW3:
  prompts/prompt.md  - the system prompt (how the agent should behave)
  tools.py           - the tools it can call (search catalogue, check stock)
  models.py          - the typed inputs/outputs (ChatRequest/ChatResponse, etc.)
  model_config.py    - builds the LLM (OpenAI via Portkey)

`reply_to_message` runs one chat turn: it feeds the conversation to the agent, lets it
call tools, and returns the agent's text reply plus any products it surfaced.
"""

import uuid

from pydantic_ai import Agent, RunContext
from pydantic_ai.exceptions import ModelHTTPError
from pydantic_ai.messages import (
    ModelMessage,
    ModelRequest,
    ModelResponse,
    TextPart,
    ToolCallPart,
    ToolReturnPart,
    UserPromptPart,
)
from pydantic_ai.usage import UsageLimits

import audit
import tools
from model_config import build_model
from models import ChatMessage, ChatProduct, ChatRequest, ChatResponse
from prompts import PROMPT  # loaded from prompts/prompt.md

# Agent loop limits (documented in the harness).
REQUEST_LIMIT = 6  # max model requests per chat turn

agent = Agent(
    build_model(),
    deps_type=tools.ShopDeps,
    output_type=str,
    instructions=PROMPT,
)


@agent.instructions
def who_and_where(ctx: RunContext[tools.ShopDeps]) -> str:
    """Per-request context added to the system prompt: who the shopper is and what
    they're looking at. This is the 'deps' half of the answer to the assignment's
    question — identity and page context are known when the request arrives, so we
    attach them to the run (deps) and surface them here, rather than making the agent
    call a tool to discover them."""
    d = ctx.deps
    lines: list[str] = []
    if d.logged_in:
        who = f"{d.first_name} {d.last_name}".strip() or d.first_name
        lines.append(f"You are chatting with a logged-in shopper: {who} (email: {d.email}). Greet them by first name.")
    else:
        lines.append("The shopper is browsing as a guest; you don't know their name.")

    page = d.page
    if page is not None and getattr(page, "product_id", None):
        lines.append(
            f"The shopper is currently viewing the product page for '{page.product_name}' "
            f"(product_id: {page.product_id}). If they say 'this', 'it', or 'this one', they mean "
            f"that product — call get_product_details or check_size_stock with product_id "
            f"'{page.product_id}' instead of asking which item."
        )
    elif page is not None and getattr(page, "visible_product_ids", None):
        ids = ", ".join(page.visible_product_ids[:12])
        lines.append(f"The shopper is on a listing page currently showing these product_ids: {ids}.")
    return "\n".join(lines)


@agent.tool
def search_products(ctx: RunContext[tools.ShopDeps], query: str, max_price: float | None = None):
    """Search the catalogue for merch matching the shopper's words.

    Use this first when a shopper describes what they want ("gray hoodie", "something
    for a Yale dad", "crewnecks under $60"). `max_price` is an optional USD cap. Returns
    a short list of matches with price, colors, in-stock sizes and total stock. The
    results are also shown on the page next to the chat.
    """
    return tools.search_products(ctx.deps, query, max_price)


@agent.tool
def suggest_gift(ctx: RunContext[tools.ShopDeps], audience: str, max_price: float | None = None):
    """Curate a few in-stock gift ideas for a described recipient, within budget.

    Use this when a shopper is shopping for someone else ("a gift for my Yale dad",
    "something for a new student under $50"). Pass who it's for as `audience` and an
    optional USD `max_price`. Returns a short, curated list (also shown on the page).
    """
    return tools.suggest_gift(ctx.deps, audience, max_price)


@agent.tool
def get_product_details(ctx: RunContext[tools.ShopDeps], product_id: str):
    """Look up one product's full description, price, colors and per-size stock.

    Use this when a shopper wants to know more about a specific item, or before
    describing it in detail. Takes the `product_id` from a search result.
    """
    return tools.get_product_details(ctx.deps, product_id)


@agent.tool_plain
def check_size_stock(product_id: str, size: str):
    """Check exact stock for one product in one size (e.g. "a medium?").

    Takes the `product_id` from a search result and a size (XS, S, M, L, XL, XXL).
    Returns the exact quantity, whether it's in stock, and the other in-stock sizes.
    """
    return tools.check_size_stock(product_id, size)


def _to_history(history: list[ChatMessage]) -> list[ModelMessage]:
    """Turn stored chat messages into PydanticAI message history."""
    out: list[ModelMessage] = []
    for m in history:
        if m.role == "user":
            out.append(ModelRequest(parts=[UserPromptPart(content=m.content)]))
        else:
            out.append(ModelResponse(parts=[TextPart(content=m.content)]))
    return out


async def reply_to_message(req: ChatRequest, user: dict | None = None) -> ChatResponse:
    """Run one chat turn and return the agent's reply plus products to show.

    `user` is the logged-in shopper (or None for a guest). Their name/email and the
    shopper's page context are attached as deps, so the agent (via who_and_where) knows
    who it's helping and what they're looking at.
    """
    deps = tools.ShopDeps(
        first_name=(user or {}).get("first_name", ""),
        last_name=(user or {}).get("last_name", ""),
        email=(user or {}).get("email", ""),
        logged_in=user is not None,
        page=req.page_context,
    )
    run_id = uuid.uuid4().hex[:8]
    try:
        result = await agent.run(
            req.message,
            deps=deps,
            message_history=_to_history(req.history),
            usage_limits=UsageLimits(request_limit=REQUEST_LIMIT),
        )
    except ModelHTTPError as exc:
        # The model provider's own content filter can reject a prompt (e.g. a jailbreak
        # attempt). Treat that as a polite refusal rather than a server error.
        if "content_filter" in str(exc).lower() or exc.status_code == 400:
            audit.record_stop(run_id, "content_filter")
            return ChatResponse(
                reply=(
                    "Sorry, I can't help with that. I'm here to help you shop for Campus "
                    "Customs Yale gear — ask me about our hoodies, tees, prices or sizes!"
                ),
                products=[],
            )
        audit.record_stop(run_id, "model_error")
        raise
    except Exception:
        audit.record_stop(run_id, "error")
        raise

    _audit_run(run_id, result)
    return ChatResponse(reply=result.output, products=tools.shown_products(deps))


def _audit_run(run_id: str, result) -> None:
    """Write the run's tool calls and stop reason to the append-only audit trail."""
    returns: dict[str, object] = {}
    for message in result.all_messages():
        for part in getattr(message, "parts", []):
            if isinstance(part, ToolReturnPart):
                returns[part.tool_call_id] = part.content
    for message in result.all_messages():
        for part in getattr(message, "parts", []):
            if isinstance(part, ToolCallPart):
                audit.record_tool_call(run_id, part.tool_name, part.args, returns.get(part.tool_call_id, ""))
    audit.record_stop(run_id, "completed")
