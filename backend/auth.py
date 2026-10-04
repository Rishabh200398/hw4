"""Password hashing and user auth against the users table.

New accounts are stored as PBKDF2-SHA256 with the iteration count embedded:
    pbkdf2_sha256$<iterations>$<salt>$<hex-hash>

The seed database ships one test user in an older PBKDF2-SHA256 format that
omits the iteration count (a fixed count was used instead):
    pbkdf2_sha256$<salt>$<hex-hash>
verify_password() reads both so the seed test user can log in without us
rewriting its row.
"""

import base64
import hashlib
import hmac
import os
import sqlite3

import db

ALGO = "pbkdf2_sha256"
ITERATIONS = 390000
# Iteration count the seed used for its legacy 3-part hashes (no count stored).
LEGACY_ITERATIONS = 120000

# Secret used to sign login tokens. Set SESSION_SECRET in .env for a stable value;
# the dev fallback is fine locally (tokens just invalidate if it changes).
_SESSION_SECRET = os.getenv("SESSION_SECRET", "campus-customs-dev-session-secret").encode()


def make_token(user_id: int) -> str:
    """A signed token proving a login. Format: <user_id>.<hmac-sig>.

    The server can trust the user_id because the browser can't forge the signature
    without the secret. This avoids trusting a raw user id sent by the client.
    """
    body = str(user_id).encode()
    sig = hmac.new(_SESSION_SECRET, body, hashlib.sha256).digest()
    return f"{user_id}.{base64.urlsafe_b64encode(sig).decode().rstrip('=')}"


def user_id_from_token(token: str | None) -> int | None:
    """Return the user id a token vouches for, or None if it's missing/invalid."""
    if not token:
        return None
    try:
        user_part, _, _ = token.partition(".")
        expected = make_token(int(user_part))
        if hmac.compare_digest(expected, token):
            return int(user_part)
    except (ValueError, AttributeError):
        pass
    return None


def user_by_id(user_id: int) -> sqlite3.Row | None:
    with db.connect() as conn:
        return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), ITERATIONS).hex()
    return f"{ALGO}${ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        parts = stored.split("$")
        if len(parts) == 4:
            algo, iterations, salt, digest = parts
            iterations = int(iterations)
        elif len(parts) == 3:
            # Legacy seed format: no iteration count stored, use the fixed one.
            algo, salt, digest = parts
            iterations = LEGACY_ITERATIONS
        else:
            return False
        if algo != ALGO:
            return False
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), iterations).hex()
        return hmac.compare_digest(check, digest)
    except (ValueError, AttributeError):
        return False


def find_user(email: str) -> sqlite3.Row | None:
    with db.connect() as conn:
        return conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()


def create_user(first_name: str, last_name: str, email: str, password: str) -> dict:
    with db.connect() as conn:
        conn.execute(
            """INSERT INTO users (name, email, password_hash, first_name, last_name)
               VALUES (?, ?, ?, ?, ?)""",
            (f"{first_name} {last_name}".strip(), email.lower(), hash_password(password), first_name, last_name),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email.lower(),)).fetchone()
    # Social-proof "in carts" numbers scale with the number of registered logins, so
    # rebuild the cached catalogue to reflect this new account.
    db.refresh_cache()
    return public_user(row)


def public_user(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "email": row["email"],
        "first_name": row["first_name"] or "",
        "last_name": row["last_name"] or "",
        "name": row["name"],
    }
