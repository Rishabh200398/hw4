# AI Prompts Log

The prompts I typed into the vibe coder while working on this assignment, one section per problem.

---

## Project Overview / Setup

**Prompt:**
> We are gonna be making this. there are 10 steps. Make a folder were all the code will be and get ready

**Follow-up prompt:**
> make this outside classwork folder as we are doing an homework

**What was lacking after the first prompt:** The AI created the project folder inside my `AI Classwork 09-29` folder, so I had to ask it to move the project out to its own homework folder (`AI-Assignement 4`).

**Prompt:**
> yes get the api key and put it in the folder

**Prompt:**
> I just downloaded the folder in downloads. Ger it from there

**Prompt:**
> help me download noad.js

---

## Problem 1: AI Prompts Log

**Prompt:**
> Do you remember how we created AI-prompts.md earlier in the hw?

**Follow-up prompt:**
> yes create a similar AI-prmpts.md file for this folder too

---

## Problem 2: Understand the Database and Start the Harness

**Prompt:**
> I want to look at the campius_customs.db and understand the fields of each table.

**Prompt:**
> Okay, now create harness.md. Write down each table and its fields and one line on why that field matters to the shop or the chatbot

**Follow-up prompt:**
> yes it needs to be in output and yes it needs to keep growing

**What was lacking after the first prompt:** The AI put `harness.md` in the project root instead of `output/`, so I had to ask it to move it.

---

## Problem 3: React + Vite + TypeScript Front End

**Prompt:**
> I want you to create a react+vite+typescrpt front end for campus customs. Put the nav bar the at the top that links to the main pages. These are home,. products, about us, login and create account, Can you scanvenge through the yalebulldogblue.com and identify how the home and about us page is worded and then write these pages in your own words. Do not copy the original site text

---

## Problem 3 (cont.): Products Page, Shop Now Dialog, Single Item Page and Chat Panel

**Prompt:**
> On the products page, show all the products images from the cataloghue. Use the image pathes in the database. Each product should have a name of it underneath it, along with the price. Keep a small description of it too. The box should also contain a clickable button called shop now that opens a dialogue box that shows the image (a larger version of it) along with options to pay, add to cart and choose the size of it, choose the number of items taht needs to go into the cart. It should also contain a cross sign at the top right to be able to exit that view. Now coming back to the product site. the box that contains the images should also be clickaable. When clicked a new page should open up that is a single item page (large image on one side, full product text on the other- desictipion, price, sizes/stock when have the iteam) The main product page along with all the other pages should have a chat interface in the bottom right of the site. This should be a floating caht panel. It does not need to talk to an agent now. we will deal with that later

---

## Problem 4: Login / Create Account with Secure Passwords

**Prompt:**
> Okay now we need to create a login page/creat account page. In the create account page, as for first name, last name, email, passowrd and confirm password. The password should be hidden with a button in the right to unhide the password. The password should indicate if its a strong password or not. for instance it should be atleast 8 characters long, should not contain part of your name or last name, should not be a sequence of numbers. The useflow of this should be userfriendly and very smooth to handle

**Follow-up prompt (mid-task):**
> As soon as the user account is created, strore the users to the users table. make sure that the passwords are stored securely so hackers both human or AI cannot access them

---

## Problem 4 (cont.): Let the Seed Test User Log In

**Prompt:**
> The seed database already has a test user. I want to be able to use that to login too

**Follow-up prompt:**
> Can you not use it without having to change its format. It does not follow the similar format as a strong password, but i still want to use it

**Follow-up prompt:**
> i dont understand, why you need it? explain it to me simpluy

**Follow-up prompt:**
> the password is password

**What was lacking:** The seed test user's hash is an older format with no iteration count stored, so the login code couldn't verify it and I couldn't know the password (which must not be guessed). Once the account owner supplied the password (`password`), I detected the seed's iteration count (120,000) and taught the login code to read the older 3-part format — no database change.

**Prompt:**
> Update harness.md with how auth works (what you store for a user and how passwords are protected)

**Follow-up prompt:**
> are you updating prompts.md?

**What was lacking:** I had updated `harness.md` but not `AI_prompts.md` with the recent prompts, so I was reminded to keep the prompts log current.

---

## Problem 5: Shop Chatbot (PydanticAI Agent Behind FastAPI)

**Prompt:**
> Build a shop chatbot (pydantic AI agent) behind the fast api. This bot should be plugged into the front end chat widget. Put the API app in backend/main.py. This is the file i will be running with uvicorn. The agent will have the following foue files next to it.  backend/prompts/prompt.d, backend/agent.py, backend/tools.py, backedn/models.py. The idea is similar to how we did hw 3 together. In the main.py build it such taht a message from the webiste returns a repl from the agent . The hw says 'you will need your ai model api key for the agent' i dont know what this means. so explain

---

**Follow-up prompt:**
> are saftey basics insterted into prompt.md? update harness,md, note how the front end talks to fastapi and how the agent is loaded

**Follow-up prompt (mid-task):**
> make sure the backend runs from the backend/ folder like this: uvicorn main:app --reload --port 8000

## Problem 6: Database-Lookup Tools for the Agent

**Prompt:**
> Give the agent tools that looks up real info from the databse like product description, price and how many are in stocks. As you already know, never ever invnt new prices or quantity. If a size is out of stock say so. Update prompt.md so that the agent know how to use and call these tools for various information. Add or update return types in models.py. update harness.md and list each tool in it. Explain which model fields you choose for lookup results and why. this is problem 6

---

## Problem 7: Chat Matches Render as Product Cards on the Page

**Prompt:**
> On to problem 7. In the chat bot when the customer asks about the type of item , for example what hoodies you have etc, then the agent should be able to search the catalogue and the website should dynammically show those matching items as product cards. This is like an API contract, the agent returns the structured product matches and the webiste should render that

**Follow-up prompt (mid-task):**
> When you build this feature, ensure that the single item page feature still works (that is i should be able to click ont he prioduct card and its should open up the detail veiw when clicked

**Follow-up prompt (mid-task):**
> update prompt.md and harness.md

---

## Problem 8: Chat History, Customer Identity, and Page Context

**Prompt:**
> Problem 8: When and only when a shopper is logged in, save their chat history in the db in the appropriate tbale. Reload it when they return. The agent should know who it is chatting with (name, email) . what does this mean 'put that in agent deps and/or tools the agent can call'? Once this is done, also ensure that the agent has access tot eh page context. That is if someone is on the products page and ask 'do you this in pink' then the agent should know which product the person is talking about.

**Follow-up prompt (mid-task):**
> updated harness.md with how chat histroy was stored, the custoemr fields the agent sees and how page context is passed

---

## Problem 9: Usability Improvements (front end)

**Prompt:**
> Onto problem 9. the hw asks me to make 2 front end usability improvements and 2 agent/backedn improvements. The front end improvement are: 1) I want a filter added to the products page.. The filter should be a drop down of check boxes for the product type. When apply filter is clicked, the product that matches the product type should be showed. Next the filter should also work for prices. I want a checkbox of all the price ranges and based on the filter, show the product on the page. The second improvement is make a male/female model wear the product and show that on the catalogue card when the larger view is shown. The model can be a manequin

**Follow-up prompt (mid-task):**
> Give me hints on what the backend improvement could be like. the examples given are new agent tools or things that make agent run faster or cheapter

---

**Follow-up prompt:**
> The manequin looks badddd, it needs to feel as if the manequin is wearing it. Do you think you can render such image. Let me know if that cannot be done without a image given to you

**What was lacking:** The first mannequin clipped the flat photo (black background included) to a torso shape, which looked bad. I explained a photorealistic try-on needs an image-gen/try-on model or real model photos, but that I could remove the photo's background and place the garment cutout on a mannequin figure. Chosen and implemented (WornImage.tsx) — now it reads as the mannequin wearing the actual garment.

**Follow-up prompt:**
> My suggestion for a clean, demonstrable pair: (a) in-memory catalogue cache ... + (b) one new tool like cheapest_in_category or suggest_gift. I like this idea. the new tool can be suggest_gift

**Follow-up prompt (mid-task):**
> Also do one thing, I dont like the manequin idea. Instead lets add a new feature where the user is able to zoom in the image. ... magnifying glass icon ... zoom in to the different parts ... smoothly navigate ... and also zoom out

**Follow-up prompt:**
> Once these are done, for each improvement say what you added, and why it helps a campus customers shopper or the business. Tell me what you added and then add it into output/usability.md. Graders will be reading this file.

**Follow-up prompt:**
> I want a feature where you tell me for each product how many other people have it in their carts (assume from number of logins), and how many bought it in the past week. Show this on the catalogue card / shop now. Also: if an item is added to cart, re-adding the same quantity should say "already in cart" — only raising the quantity adds more — and adding should bring up confetti saying product added. Log these into usability.md too.

## Problem 10: Creative Design / Storefront Feel

**Prompt:**
> actually add the last two front end changes i mentioned into output/design.md. As per problem 10, i should add creative design that makes it feel like a real campus customs storefront. I get more points if i am imaginative. Do you think these qualify for getting added into design.md? Suggest some recommendations too.

**Follow-up prompt:**
> I love the idea of the bulldog mascot chat personality. Do that. Also I like the Yale photo in the about us page. I want the theme to be Yale School of the Environment and School of Management because I am doing a dual degree there and I think they are the coolest people.

## Problem 11: Live Site Check (app_check.html)

**Prompt:**
> Moving to problem 11. Site checking. Test the site live and document it in output/app_check.html. This is a page that should open when double clicked. This doc should have clear screenshots of the website and short captions of 1. chat checking the inventory level of an item (honest stock/price from the db) 2) dynamic search result cards appearing after a category question and one of the usability features we added in problem 9. This html will be used by graders so make it easy to read. The screenshot image files should be put in output/app_check_images/ and linked from app_check.html with relative paths.

## Problem 12: Audit Trail + Safety Rules

**Prompt:**
> Onto problem 12. Keep an append only output/audit_trail.json of agent loop activity that contains time, tool name, short arg/result, stop reason. Also ensure safety rules like never guess password, never share env file, never guess things that are not in db, never let the user add/edit or delete any items in the db, never allow the chat bot to fetch things online, never let the chat bot be racial or judge people etc on the prompts/prompt.md file.

**Follow-up prompt (mid-task):**
> Finish output/harness.md with the following fields: Model fields in models.py and why you chose them; Tools and abilities; Safety rules; Specs (loop limits, result caps, models, how to run front + back).

## Problem 13: Push to GitHub

**Prompt:**
> Onto problem 13. I want to put this in github. I have a github account. Help me push this into github.

**Follow-up prompt:**
> Where are you gonna be committing? Because I don't think I have given you access to github yet. Let me know before you do anything.

**Follow-up prompt:**
> (installed the GitHub CLI and logged in) Yes I have logged in.

**What happened:** Prepared the repo to match the expected hw4 layout (root `requirements.txt`, README run steps, `.claude/` ignored) and made a local-only commit first — confirmed no `.env`, database, product images, `node_modules`, or `.venv` were staged. Installed the GitHub CLI to `~/.local/bin` (no admin password). The user ran `gh auth login` themselves (credentials stayed with them). Then created a public repo and pushed:

```
gh repo create hw4 --public --source=. --remote=origin --push
```

Repo URL (submitted on Canvas): https://github.com/Rishabh200398/hw4
Verified public, remote main matches local, and no secrets on the remote.
