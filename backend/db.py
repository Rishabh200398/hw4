"""SQLite access for the Campus Customs catalogue and inventory."""

import hashlib
import json
import sqlite3
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DB_PATH = DATA_DIR / "campus_customs.db"

SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _inventory_by_product(conn: sqlite3.Connection) -> dict[str, list[dict]]:
    stock: dict[str, list[dict]] = {}
    for row in conn.execute("SELECT product_id, size, quantity FROM inventory"):
        stock.setdefault(row["product_id"], []).append({"size": row["size"], "quantity": row["quantity"]})
    for sizes in stock.values():
        sizes.sort(key=lambda s: SIZE_ORDER.index(s["size"]) if s["size"] in SIZE_ORDER else len(SIZE_ORDER))
    return stock


def _social_proof(product_id: str, user_count: int) -> dict:
    """Deterministic 'social proof' numbers for a product.

    `in_carts` is derived from how many shoppers have registered a login (the assignment's
    assumption), so it scales with the user base; `purchased_last_week` is a stable
    per-product figure. Both are seeded from a hash of the product id so they don't jump
    around between requests.
    """
    h = int(hashlib.md5(product_id.encode()).hexdigest(), 16)
    in_carts = h % (user_count + 1)  # 0..user_count, tied to registered logins
    purchased_last_week = (h // 7) % 50 + 1  # a stable 1..50
    return {"in_carts": in_carts, "purchased_last_week": purchased_last_week}


def _to_product(row: sqlite3.Row, inventory: list[dict], user_count: int) -> dict:
    return {
        "product_id": row["product_id"],
        "name": row["name"],
        "garment_type": row["garment_type"],
        "description": row["description"],
        "colors": json.loads(row["colors"]),
        "search_tags": json.loads(row["search_tags"]),
        "image_file_path": row["image_file_path"],
        # image_file_path is relative to data/, which is mounted at /media.
        "image_url": f"/media/{row['image_file_path']}",
        "price": row["price"],
        "inventory": inventory,
        "total_stock": sum(s["quantity"] for s in inventory),
        "social": _social_proof(row["product_id"], user_count),
    }


# ---------- In-memory catalogue cache ----------
# The catalogue and inventory are static for this app, so we read them from SQLite once
# and serve every later lookup from memory. The agent's tools call list_products on every
# search; without this each call re-opened the database and ran two queries. The cache
# turns those repeated reads into dictionary lookups (big speed/cost win on chat turns).
_CACHE: list[dict] | None = None
_BY_ID: dict[str, dict] = {}


def _build_cache() -> None:
    global _CACHE, _BY_ID
    with connect() as conn:
        stock = _inventory_by_product(conn)
        user_count = conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        rows = conn.execute("SELECT * FROM catalogue ORDER BY name").fetchall()
        products = [_to_product(r, stock.get(r["product_id"], []), user_count) for r in rows]
    _CACHE = products
    _BY_ID = {p["product_id"]: p for p in products}


def refresh_cache() -> None:
    """Rebuild the in-memory catalogue (call if the database changes)."""
    _build_cache()


def list_products() -> list[dict]:
    if _CACHE is None:
        _build_cache()
    return _CACHE  # type: ignore[return-value]


def get_product(product_id: str) -> dict | None:
    if _CACHE is None:
        _build_cache()
    return _BY_ID.get(product_id)
