"""Campus Customs FastAPI backend.

Run from the backend/ folder:  uvicorn main:app --reload --port 8000
"""

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import auth
import chat_store
import db
from models import (
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)

app = FastAPI(title="Campus Customs API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def current_user(authorization: str | None = Header(default=None)) -> dict | None:
    """The logged-in shopper from the Bearer token, or None for a guest.

    Reads `Authorization: Bearer <token>`; a valid token's user id is trusted because
    the client can't forge its signature.
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    token = authorization.split(" ", 1)[1].strip()
    user_id = auth.user_id_from_token(token)
    if user_id is None:
        return None
    row = auth.user_by_id(user_id)
    return auth.public_user(row) if row is not None else None


@app.post("/api/auth/register", response_model=UserResponse, status_code=201)
def register(body: RegisterRequest):
    if auth.find_user(body.email):
        raise HTTPException(status_code=409, detail="An account with that email already exists.")
    user = auth.create_user(body.first_name, body.last_name, body.email, body.password)
    return {**user, "token": auth.make_token(user["id"])}


@app.post("/api/auth/login", response_model=UserResponse)
def login(body: LoginRequest):
    row = auth.find_user(body.email)
    if row is None or not auth.verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    user = auth.public_user(row)
    return {**user, "token": auth.make_token(user["id"])}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, user: dict | None = Depends(current_user)):
    # Imported lazily so the rest of the API still boots if the agent deps/key are missing.
    import agent

    try:
        result = await agent.reply_to_message(body, user=user)
    except RuntimeError as exc:
        # Most likely a missing PORTKEY_API_KEY.
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - surface a clean message to the widget
        raise HTTPException(status_code=502, detail=f"The assistant had trouble: {exc}") from exc

    # Only logged-in shoppers get their chat history saved.
    if user is not None:
        products = [p.model_dump() for p in result.products]
        chat_store.save_turn(user["id"], body.message, result.reply, products)
    return result


@app.get("/api/chat/history", response_model=HistoryResponse)
def chat_history(user: dict | None = Depends(current_user)):
    if user is None:
        raise HTTPException(status_code=401, detail="Log in to see your chat history.")
    return {"messages": chat_store.load_history(user["id"])}


@app.get("/api/products")
def list_products():
    return db.list_products()


@app.get("/api/products/{product_id}")
def get_product(product_id: str):
    product = db.get_product(product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Serve only the product images (never the rest of data/, which holds the database).
# catalogue.image_file_path is relative to data/, e.g. products/x.jpg -> /media/products/x.jpg
app.mount("/media/products", StaticFiles(directory=db.DATA_DIR / "products"), name="product-images")
