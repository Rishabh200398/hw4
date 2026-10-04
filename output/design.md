# Problem 10 — Creative Design: making it feel like a real Campus Customs storefront

The goal of this problem is for the site to *feel* like the real Campus Customs / Yale
Bulldog Blue store, not a class demo. This file records the design decisions that give it
that storefront feel, and the delight touches that make it feel alive.

How to run (both servers):

```bash
cd backend && source .venv/bin/activate && uvicorn main:app --reload --port 8000
cd frontend && npm run dev   # http://localhost:5173
```

---

## Brand & look (modeled on yalebulldogblue.com)

- **Yale navy** (`#00366b`) as the primary brand colour, a coral-red accent (`#f04f36`, the
  real site's call-to-action hover colour), dark ink on light-gray sections — so the palette
  reads as the real store.
- **Open Sans** type, the font the real site uses.
- A thin **announcement bar** above the nav ("Official Yale-licensed apparel · Printed and
  stitched in New Haven"), echoing the real store's licensed-merch banner.
- A bold navy **hero**, shop-by-category tiles, and audience sections (students, family,
  alumni, fans) that mirror how the real store organises itself.
- Copy written in-house from research on the real store (New Haven at 57 Broadway, on-site
  screen printing/embroidery) — storefront voice, not placeholder text.

## Delight touches that make it feel like a live store

### Social proof on each product

The detail page and Shop Now dialog show, under the price, how many shoppers have the item
**in their cart** and how many **bought it in the past week** (e.g. "🛒 4 shoppers have this
in their cart", "🔥 15 bought this in the past week"). The "in cart" figure is derived from
the number of registered logins, so it scales with the user base and moves when a new account
is created; the weekly-buys figure is a stable per-product number. Both are computed
deterministically from the product id so they don't flicker between page loads.
Files: `backend/db.py` (`_social_proof`), `frontend/src/components/SocialProof.tsx`.

*Storefront effect:* real shops show "others are buying this"; it adds life and gentle
urgency, and reassures the shopper they're picking something popular.

### Confetti "added to cart", with no accidental duplicates

Adding an item fires a **confetti burst** and a "🎉 Product added to cart!" toast, and the
button becomes a disabled **In cart**. Clicking again without changing the quantity does
nothing (no duplicate add); raising the quantity lets you add more, with another celebration.
Files: `frontend/src/utils/celebrate.ts`, `frontend/src/components/PurchaseOptions.tsx`,
`frontend/src/cart.tsx`.

*Storefront effect:* satisfying, tactile feedback — the moment of "yes, it's in my bag" — and
a cart that reflects exactly what the shopper wanted.

### Other storefront-feel details already in the app

- A **floating chat assistant** on every page, like a store associate.
- **"From your chat" product band** — ask the assistant for hoodies and the matching items
  appear on the page as cards.
- **Live stock** per size with sold-out sizes crossed out; honest "X left" counts.
- Password strength meter, a cart with a count badge, smooth scroll-to-top on navigation.

## Handsome Dan — the bulldog mascot chat guide (implemented)

The chat assistant is now **Handsome Dan**, Yale's bulldog mascot, acting as the store guide.
He has a hand-drawn bulldog avatar (`components/BulldogAvatar.tsx`) on the floating launcher
button and in the chat header ("Handsome Dan — Your Campus Customs guide"), a woof-y welcome
message, and a personality defined in `prompts/prompt.md`: warm, Yale-spirited, with the
occasional light dog touch kept rare and tasteful, and he never breaks character to say he's
an AI. All the honesty/stock/safety rules still apply underneath.

*Storefront effect:* a named, on-brand mascot makes the shop memorable and gives the chat a
personality instead of a generic bot — exactly the kind of imaginative, Yale-specific touch
that sets the storefront apart. Verified: asked "who are you?" he replies "I'm Handsome Dan,
Yale's bulldog mascot and your Campus Customs shopping guide… Woof! 🐾".

## About page themed for SOM + YSE (implemented)

The About page has a new section, "From one corner of Yale to another," with an original
illustrated campus scene (`components/YaleCampusArt.tsx`): the **Yale School of Management**
as a navy glass building and the **Yale School of the Environment** as a timber building with
leaves, a tree and a sun. A short caption celebrates the dual-degree students bridging
business and the planet. (It's an original SVG illustration, not a copyrighted photo, so it's
safe to ship; a real photo file could be dropped in later if desired.)

*Storefront effect:* grounds the shop in a real, specific Yale community and personalizes the
storefront around the schools behind this build.

---

## Do these qualify as creative design? (honest take)

Yes — social proof and the confetti/anti-duplicate flow are legitimately "storefront feel"
features: they're the kind of delight and trust cues real e-commerce sites use, not just
plumbing. They're a good start for Problem 10. But on their own they're fairly common; to
score well on *imagination* the site would benefit from a few more distinctive, Yale-specific
touches (below).

## Recommendations to go further (ranked, pick what you like)

1. **Yale residential-college & team theming** — let a shopper pick their college (Branford,
   Saybrook, …) or team; accent the site and sort/boost matching gear. Very on-brand and
   unique to Yale. (Medium effort, high imagination.)
2. **"Harvard–Yale / The Game" seasonal mode** — a playful banner + rivalry palette that
   highlights Game-day gear. Ties to the real 2025 Harvard–Yale product. (Low–medium effort.)
3. ~~**Bulldog mascot personality for the chat**~~ ✅ **done** — — give the assistant a name ("Handsome Dan,
   your Campus Customs guide"), a mascot avatar, and a bit of Yale voice. (Low effort, memorable.)
4. **"Back in stock / low stock" urgency badges** on cards — "Only 2 left!" when a size is
   nearly gone (we already have the stock data). (Low effort, real storefront cue.)
5. **Recently viewed / "pairs well with" strip** on the product page — cross-sell like a real
   shop. (Medium effort.)
6. **Micro-interactions & polish** — hover lift on cards (have some), a cart fly-to-cart
   animation on add, skeleton loaders while products load, a subtle Yale crest watermark.
   (Low–medium effort, lots of perceived polish.)
7. **A New Haven "visit us" map/photo** on the About page (partly done — SOM/YSE campus illustration added) to
   ground it as a real local store. (Low effort.)

My pick for best points-per-effort: **#3 (mascot chat personality)** + **#1 or #2 (Yale
college/Game theming)** — both are imaginative and distinctly Yale. Tell me which to build
and I'll implement them and document them here.
