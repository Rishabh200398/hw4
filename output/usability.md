# Problem 9 — Usability & Agent Improvements

Four improvements: two on the front end and two on the backend/agent. For each, what was
added, why it helps a Campus Customs shopper or the business, and how a grader can see it
working in the running app.

How to run the app (both servers):

```bash
# backend
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000
# frontend (new terminal)
cd frontend && npm run dev   # http://localhost:5173
```

---

## Front-end improvement #1 — Filters on the Products page

**What I added.** On the Products page there are two filter dropdowns of checkboxes plus an
**Apply filters** button (and a Clear):
- **Product type** — the catalogue's 22 inconsistent `garment_type` values are grouped into
  clean categories (Hoodies, Crewnecks, T-Shirts, Quarter-Zips, Jackets & Fleece, Other).
- **Price** — Under $40, $40–$59, $60–$79, $80 & up.
Filters apply only when **Apply filters** is clicked, combine with the search box, and Clear
resets them. Files: `components/ProductFilters.tsx`, `productMeta.ts`, `pages/Products.tsx`.

**Why it helps.** With 102 products, a shopper looking for "a hoodie I can afford" can narrow
the grid in two clicks instead of scrolling the whole catalogue. For the business, easier
browsing means shoppers find something to buy faster, and the price filter surfaces options
inside a budget.

**How to verify.** Go to **/products** (102 items). Open **Product type → Hoodies → Apply
filters**: the grid drops to 27 hoodies. Add **Price → Under $40 → Apply filters**: 0 items
(hoodies are $58+). Click **Clear**: back to 102.

## Front-end improvement #2 — Zoom into the product image

**What I added.** In the larger product view (the **Shop now** dialog and the **product
detail page**), the image supports hover-to-zoom: hovering shows a magnifier hint, clicking
or scrolling zooms in at the cursor, moving the mouse pans around the garment, and a −/+
control (with a % readout) or leaving the image zooms back out. File:
`components/ProductImageViewer.tsx`.

**Why it helps.** Online shoppers can't feel the fabric, so detail matters. Zooming lets them
inspect the print quality, lettering and stitching up close before buying. For the business,
clearer product inspection builds confidence and reduces returns from "not what I expected".

**How to verify.** Open any product (e.g. **/products/basic-hoodie-big-yale**), or click
**Shop now** on a card. Hover the image — a "🔍 Click or scroll to zoom" hint appears. Click
the chest lettering: it zooms to 250% there. Move the mouse: the view pans across the
garment. Click **−** (or click the image again) to zoom back out.

---

## Backend improvement #1 — In-memory catalogue cache (faster & cheaper)

**What I added.** `db.py` previously re-opened SQLite and ran two queries on every call, and
the agent's tools call `list_products()` on every search. Since the catalogue and inventory
are static, `db.py` now loads them **once into memory** and serves every lookup from there
(`refresh_cache()` rebuilds it if the data changes). Files: `backend/db.py`.

**Why it helps.** Each chat turn can trigger several catalogue reads; serving them from memory
makes the assistant respond faster and do less work per message. For the business, that's
lower latency for shoppers and less compute per conversation.

**How to verify.** Measured in `backend/`: 500 `list_products()` calls took ~345 ms when
re-reading the database each time vs. effectively instant from the cache, with identical
results (102 products). In the app, the chatbot answers product questions snappily.

## Backend improvement #2 — New agent tool `suggest_gift`

**What I added.** A new tool `suggest_gift(audience, max_price?)` the chatbot can call when a
shopper is buying for someone else. It maps the recipient to suitable keywords (e.g. Yale
dad → crewneck/bulldog/classic; new student → hoodie/tee/college; fan → football/the game/
hockey), returns a few **in-stock** picks within budget, and shows them on the page. Files:
`backend/tools.py`, `backend/agent.py`, `backend/prompts/prompt.md`.

**Why it helps.** Gift shoppers often don't know the catalogue and just know who it's for.
This turns "something for my Yale dad under $60" into a curated, in-stock, on-budget shortlist
instead of a generic search — a friendlier experience that nudges a sale.

**How to verify.** Open the chat (bottom-right on any page) and ask: **"I need a gift for my
Yale dad, keep it under $60."** The assistant returns a few $58 in-stock crewnecks and they
appear on the page as product cards. Try **"a gift for a new student under $50"** → $32 tees.
