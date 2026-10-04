"""Saving and loading a logged-in shopper's chat history in chat_messages.

Only called for logged-in shoppers; guests' chats are never written to the database.
The table (already in the seed db) is:
    chat_messages(id, user_id, role, content, products_json, created_at)
We store the assistant's surfaced products as JSON in products_json so the same cards
can be shown again when the shopper returns.
"""

import json

import db


def save_turn(user_id: int, user_message: str, assistant_reply: str, products: list[dict]) -> None:
    """Append one chat turn (the shopper's message + the assistant's reply)."""
    with db.connect() as conn:
        conn.execute(
            "INSERT INTO chat_messages (user_id, role, content, products_json) VALUES (?, 'user', ?, NULL)",
            (user_id, user_message),
        )
        conn.execute(
            "INSERT INTO chat_messages (user_id, role, content, products_json) VALUES (?, 'assistant', ?, ?)",
            (user_id, assistant_reply, json.dumps(products) if products else None),
        )
        conn.commit()


def load_history(user_id: int, limit: int = 100) -> list[dict]:
    """The shopper's saved messages, oldest first, with products parsed back out."""
    with db.connect() as conn:
        rows = conn.execute(
            "SELECT role, content, products_json FROM chat_messages WHERE user_id = ? ORDER BY id LIMIT ?",
            (user_id, limit),
        ).fetchall()
    history = []
    for r in rows:
        history.append(
            {
                "role": r["role"],
                "content": r["content"],
                "products": json.loads(r["products_json"]) if r["products_json"] else [],
            }
        )
    return history
