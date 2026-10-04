"""Tools the shop agent can call, plus the shared dependencies it carries.

Every tool reads live data from campus_customs.db through db.py, so the agent's
answers about description, price and stock are always true to the database. Tools
return typed models from models.py (never loose numbers the agent could misread),
and they never compute or invent prices or quantities — those come straight from
the catalogue and inventory tables.
"""

from dataclasses import dataclass, field

import db
from models import (
    ChatProduct,
    ProductDetail,
    ProductSummary,
    SizeAvailability,
    SizeStockResult,
    ToolError,
)


@dataclass
class ShopDeps:
    """Carried through a single chat turn — the per-request context the agent and its
    tools can read.

    Identity fields describe the logged-in shopper (empty/False for a guest) so the
    agent can greet them and knows who it's helping. `page` is what the shopper is
    currently viewing, so "do you have this in pink?" can be resolved to a product.
    `shown` collects every product the agent surfaces so the API can display them on
    the page next to the chat.
    """

    first_name: str = ""
    last_name: str = ""
    email: str = ""
    logged_in: bool = False
    page: object = None  # a models.PageContext, or None
    shown: dict[str, dict] = field(default_factory=dict)


def _available_sizes(product: dict) -> list[str]:
    return [s["size"] for s in product["inventory"] if s["quantity"] > 0]


def _score(product: dict, terms: list[str]) -> int:
    """Count how many query words appear in a product's searchable text."""
    haystack = " ".join(
        [
            product["name"],
            product["garment_type"],
            product["description"],
            " ".join(product["colors"]),
            " ".join(product["search_tags"]),
        ]
    ).lower()
    return sum(1 for t in terms if t in haystack)


def search_products(deps: ShopDeps, query: str, max_price: float | None = None) -> list[ProductSummary]:
    """Find catalogue items matching a shopper's words (optionally under a price)."""
    # Lower-case words, drop tiny ones, and strip a trailing plural "s" so
    # "hoodies" matches "hoodie" and "tees" matches "tee".
    terms = [
        t[:-1] if t.endswith("s") and len(t) > 4 else t
        for t in (w.strip(".,!?") for w in query.lower().split())
        if len(t) > 2
    ]
    candidates = [p for p in db.list_products() if max_price is None or p["price"] <= max_price]

    if not terms:
        scored = [(1, p) for p in candidates]
    else:
        scored = [(_score(p, terms), p) for p in candidates]
        # Prefer products that match every query word; fall back to partial matches
        # only if nothing matches all of them, so the page stays relevant.
        full = [(s, p) for s, p in scored if s == len(terms)]
        scored = full if full else [(s, p) for s, p in scored if s > 0]

    scored.sort(key=lambda r: (-r[0], -r[1]["total_stock"]))
    top = [p for _, p in scored[:6]]

    summaries = []
    for p in top:
        deps.shown[p["product_id"]] = p  # remember for the page
        summaries.append(
            ProductSummary(
                product_id=p["product_id"],
                name=p["name"],
                garment_type=p["garment_type"],
                price=p["price"],
                colors=p["colors"],
                available_sizes=_available_sizes(p),
                total_stock=p["total_stock"],
            )
        )
    return summaries


def get_product_details(deps: ShopDeps, product_id: str) -> ProductDetail | ToolError:
    """Full description, price, colors and per-size stock for one product."""
    product = db.get_product(product_id)
    if product is None:
        return ToolError(error=f"No product with id '{product_id}'. Use search_products to find the right id.")
    deps.shown[product["product_id"]] = product  # show it on the page too
    sizes = [
        SizeAvailability(size=s["size"], quantity=s["quantity"], in_stock=s["quantity"] > 0)
        for s in product["inventory"]
    ]
    return ProductDetail(
        product_id=product["product_id"],
        name=product["name"],
        garment_type=product["garment_type"],
        description=product["description"],
        colors=product["colors"],
        price=product["price"],
        sizes=sizes,
        available_sizes=[s.size for s in sizes if s.in_stock],
        out_of_stock_sizes=[s.size for s in sizes if not s.in_stock],
        total_stock=product["total_stock"],
    )


# Words that tend to suit each kind of gift recipient, used to curate suggestions.
_AUDIENCE_HINTS: dict[str, list[str]] = {
    "dad": ["quarter-zip", "crewneck", "bulldog", "classic"],
    "father": ["quarter-zip", "crewneck", "bulldog", "classic"],
    "mom": ["crewneck", "bulldog", "quarter-zip"],
    "mother": ["crewneck", "bulldog", "quarter-zip"],
    "student": ["hoodie", "t-shirt", "college", "crewneck"],
    "freshman": ["hoodie", "t-shirt", "college"],
    "alum": ["vintage", "crewneck", "classic", "bulldog"],
    "alumni": ["vintage", "crewneck", "classic", "bulldog"],
    "reunion": ["vintage", "crewneck", "classic"],
    "fan": ["football", "the game", "hockey", "basketball", "sports"],
    "grad": ["quarter-zip", "crewneck"],
    "graduation": ["quarter-zip", "crewneck"],
}


def suggest_gift(deps: ShopDeps, audience: str, max_price: float | None = None) -> list[ProductSummary]:
    """Curate a few in-stock gift ideas for a described recipient, within budget.

    `audience` is who the gift is for ("Yale dad", "new student", "alum", "sports fan").
    Picks items whose tags/description suit that recipient, that are in stock and within
    `max_price`, and records them so they appear on the page. Falls back to popular
    in-stock items if nothing matches, so there's always something to suggest.
    """
    text = audience.lower()
    terms = {w.strip(".,!?") for w in text.split() if len(w) > 2}
    for key, hints in _AUDIENCE_HINTS.items():
        if key in text:
            terms.update(hints)

    in_budget = [
        p
        for p in db.list_products()
        if p["total_stock"] > 0 and (max_price is None or p["price"] <= max_price)
    ]
    scored = [(_score(p, list(terms)), p) for p in in_budget]
    matched = [(s, p) for s, p in scored if s > 0]
    # Best matches first; if nothing matched the audience, suggest well-stocked staples.
    chosen = matched if matched else scored
    chosen.sort(key=lambda r: (-r[0], -r[1]["total_stock"]))
    top = [p for _, p in chosen[:4]]

    out = []
    for p in top:
        deps.shown[p["product_id"]] = p
        out.append(
            ProductSummary(
                product_id=p["product_id"],
                name=p["name"],
                garment_type=p["garment_type"],
                price=p["price"],
                colors=p["colors"],
                available_sizes=_available_sizes(p),
                total_stock=p["total_stock"],
            )
        )
    return out


def check_size_stock(product_id: str, size: str) -> SizeStockResult | ToolError:
    """Exact stock for one product in one size (for 'do you have X in size M?')."""
    product = db.get_product(product_id)
    if product is None:
        return ToolError(error=f"No product with id '{product_id}'. Use search_products to find the right id.")
    wanted = size.strip().upper()
    match = next((s for s in product["inventory"] if s["size"].upper() == wanted), None)
    if match is None:
        sizes = ", ".join(s["size"] for s in product["inventory"])
        return ToolError(error=f"'{product['name']}' has no size '{size}'. It comes in: {sizes}.")
    return SizeStockResult(
        product_id=product["product_id"],
        name=product["name"],
        size=match["size"],
        quantity=match["quantity"],
        in_stock=match["quantity"] > 0,
        price=product["price"],
        available_sizes=_available_sizes(product),
    )


def shown_products(deps: ShopDeps) -> list[ChatProduct]:
    """The products the agent surfaced this turn, as full cards for the page.

    Same shape as a /api/products item, so the website renders them with its existing
    product-card UI (image, price, sizes, "Shop now", click-through to the detail page).
    """
    return [
        ChatProduct(
            product_id=p["product_id"],
            name=p["name"],
            garment_type=p["garment_type"],
            description=p["description"],
            colors=p["colors"],
            search_tags=p["search_tags"],
            image_file_path=p["image_file_path"],
            price=p["price"],
            image_url=p["image_url"],
            inventory=[
                SizeAvailability(size=s["size"], quantity=s["quantity"], in_stock=s["quantity"] > 0)
                for s in p["inventory"]
            ],
            total_stock=p["total_stock"],
        )
        for p in deps.shown.values()
    ]
