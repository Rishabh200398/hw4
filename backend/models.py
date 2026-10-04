"""Pydantic request/response models for the Campus Customs API."""

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    name: str
    token: str | None = None  # signed login token the client sends back to identify itself


# ---------- Chat / agent models ----------

from typing import Literal


class ChatProduct(BaseModel):
    """A product the agent surfaced, in the same shape the website already renders
    (identical to a /api/products item), so the page can show a full product card —
    image, price, sizes and a working "Shop now" — straight from a chat reply."""

    product_id: str
    name: str
    garment_type: str
    description: str
    colors: list[str]
    search_tags: list[str]
    image_file_path: str
    price: float
    image_url: str
    inventory: list["SizeAvailability"]
    total_stock: int


# ---------- Agent tool return types ----------
# These are what the database-lookup tools hand back to the agent. Keeping them as
# typed models (not loose dicts) means the agent always receives the same named fields,
# so it can quote price and stock accurately and never has to guess.


class SizeAvailability(BaseModel):
    """Stock for one size of one product."""

    size: str  # XS, S, M, L, XL, XXL
    quantity: int  # exact units on hand, straight from the inventory table
    in_stock: bool  # quantity > 0, so the agent can say "out of stock" without doing math


class ProductSummary(BaseModel):
    """A lightweight search hit — enough to list options and compare them."""

    product_id: str  # stable id used to look up details / show the card on the page
    name: str
    garment_type: str  # lets the agent group/describe ("hoodie", "crewneck")
    price: float  # the real catalogue price, USD
    colors: list[str]
    available_sizes: list[str]  # only sizes currently in stock, for quick answers
    total_stock: int  # units across all sizes; 0 means fully sold out


class ProductDetail(BaseModel):
    """Everything the agent needs to talk about a single product in depth."""

    product_id: str
    name: str
    garment_type: str
    description: str  # the real catalogue description, so the agent describes it truthfully
    colors: list[str]
    price: float  # the real catalogue price, USD
    sizes: list[SizeAvailability]  # per-size stock, every size, so nothing is hidden
    available_sizes: list[str]  # convenience: sizes with stock
    out_of_stock_sizes: list[str]  # convenience: sizes at zero, so it can say so plainly
    total_stock: int


class SizeStockResult(BaseModel):
    """Answer to 'is <product> available in <size>?'."""

    product_id: str
    name: str
    size: str
    quantity: int  # exact units of that size
    in_stock: bool
    price: float
    available_sizes: list[str]  # other in-stock sizes to offer if this one is out


class ToolError(BaseModel):
    """Returned when a product_id or size can't be found, so the agent fails honestly."""

    error: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class PageContext(BaseModel):
    """What the shopper is looking at when they send a message, so the agent can resolve
    'this' / 'it'. Sent by the front end with each chat message."""

    route: str | None = None  # e.g. "/products/basic-hoodie-big-yale"
    product_id: str | None = None  # the product on a detail page they're viewing
    product_name: str | None = None
    visible_product_ids: list[str] = Field(default_factory=list)  # items shown on a listing page


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default_factory=list)
    page_context: PageContext | None = None


class ChatResponse(BaseModel):
    reply: str
    products: list[ChatProduct] = Field(default_factory=list)


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    # Stored product snapshots, replayed as-is. Kept as loose dicts because older seed
    # rows use a slightly different product shape than the current ChatProduct; the front
    # end only needs product_id / name / price / image_url / inventory to render a card.
    products: list[dict] = Field(default_factory=list)


class HistoryResponse(BaseModel):
    messages: list[HistoryMessage] = Field(default_factory=list)


# ChatProduct references SizeAvailability (defined below it); resolve the forward ref.
ChatProduct.model_rebuild()
