# Campus Customs (hw4)

A customer storefront for **Campus Customs** (officially licensed Yale apparel) with a
PydanticAI shopping chatbot. React + Vite + TypeScript front end, Python FastAPI back end.

## Layout

- `frontend/` — React + Vite + TypeScript app
- `backend/` — FastAPI app (`main.py`) + the agent (`agent.py`, `tools.py`, `models.py`,
  `prompts/prompt.md`) and helpers (`db.py`, `auth.py`, `chat_store.py`, `model_config.py`,
  `audit.py`)
- `output/` — deliverables: `harness.md`, `design.md`, `usability.md`, `app_check.html`
  (+ `app_check_images/`), `audit_trail.json`
- `AI_prompts.md` — the prompts used while building this
- `data/` — the data pack (**not in git**): `campus_customs.db` and `products/`

## Setup

1. **Data pack:** place the provided `data/` folder at the repo root so you have
   `data/campus_customs.db` and `data/products/` (the catalogue images).
2. **Secrets:** copy `.env.example` to `.env` and set your `PORTKEY_API_KEY`
   (the key the agent uses to reach its model through Portkey).

## Run the back end (from `backend/`)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API serves at http://localhost:8000 (products, auth, chat) and the product images at
`/media/products/...`.

## Run the front end

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server proxies `/api` and `/media` to the back end
on port 8000, so start both.

## Notes

- `.env`, `data/` (database + product images), `node_modules/`, and `.venv/` are git-ignored
  and never committed. `.env.example` holds placeholders only.
- The chatbot answers only from the local database (honest price/stock) and never changes the
  data; see `backend/prompts/prompt.md` for its safety rules and `output/harness.md` for the
  full write-up.
