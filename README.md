# ClientBrief AI

**Turn a messy client conversation into a build-ready WooCommerce project brief — in seconds.**

## The problem

Freelance WordPress/WooCommerce developers (like me) constantly get client messages like *"I want an online store for my clothes"* — and nothing else. Turning that into pages, plugins, a realistic budget tier, and a timeline takes real back-and-forth before you can even quote the project.

**ClientBrief AI** fixes this: I fill in a short guided intake form about the client's business, and it instantly generates a structured, professional project brief I can use to scope and pitch the work — built specifically for WooCommerce freelancers working with small businesses in Pakistan.

**Who it's for:** freelance WordPress/WooCommerce developers and agencies who need to quickly turn a vague client idea into a scoped, quotable brief.

## 🔗 Live app

**[https://YOUR-PROJECT-NAME.vercel.app](https://YOUR-PROJECT-NAME.vercel.app)** ← replace with your real Vercel URL after deploying

## Features

- Guided intake form covering business type, offering, target audience, budget (PKR ranges), must-have features, brand style, and timeline
- One-click **"Try sample data"** button to demo the app instantly without typing
- AI-generated project brief covering: project overview, target audience, recommended pages, recommended features & plugins (with reasoning for each), budget tier guidance, a phased timeline, and concrete next steps
- **Copy brief** to clipboard and **Download as .txt** for sending straight to a client or teammate
- **Brief history** saved locally in the browser (last 10), so past briefs can be reopened anytime
- Fully responsive, accessible (visible keyboard focus, respects reduced-motion) ticket-style UI designed around the "project brief as a spec sheet" concept

## The AI feature

When the form is submitted, the app calls the **Google Gemini API** (`gemini-2.5-flash`) from a serverless backend function (`/api/generate`) — the API key never reaches the browser.

The model is given this system prompt, written for this project:

> You are an expert WordPress & WooCommerce project consultant. Your job is to turn a freelancer's rough notes about a prospective client's business into a clear, structured project brief that the freelancer can use to scope, quote, and pitch the build.
>
> Read the client details you are given, then respond with ONLY a valid JSON object (no markdown, no commentary) containing: overview, audience, pages, features (with reasoning per feature), budgetTier, timeline (phased), and nextSteps.
>
> Rules: tailor every section specifically to the business described, only recommend features realistic for the stated budget, keep the tone professional and practical, never mention being an AI.

The full prompt is in [`api/generate.js`](./api/generate.js). The model is forced to return structured JSON (`responseMimeType: "application/json"`), which the frontend renders directly into the ticket layout.

## Tools, services & models used

- **Frontend:** plain HTML, CSS, and JavaScript (no framework/build step)
- **Backend:** a single Vercel serverless function (Node.js)
- **AI model:** Google Gemini API — `gemini-2.5-flash`
- **Hosting/deployment:** Vercel
- **Version control:** GitHub
- **Design:** built with Claude (Anthropic) as a pair-programmer for planning, code, and design direction

## Screenshots

<!-- Add 3+ screenshots below. In GitHub, drag image files directly into this editor and it will
     auto-upload them and insert the markdown for you. -->

![Hero and intake form](./screenshots/screenshot-1.png)
![Generated brief](./screenshots/screenshot-2.png)
![Brief history](./screenshots/screenshot-3.png)

## How to run it locally

```bash
git clone https://github.com/YOUR-USERNAME/clientbrief-ai.git
cd clientbrief-ai

# Install the Vercel CLI if you don't have it
npm install -g vercel

# Add your own Gemini API key (get one free at https://aistudio.google.com/apikey)
cp .env.example .env
# then edit .env and paste your key

vercel dev
```

Open the local URL Vercel prints (usually `http://localhost:3000`).

No build step, no dependencies to install for the app itself — it's plain HTML/CSS/JS plus one serverless function.

## Deployment notes

- Deployed on Vercel by importing this GitHub repo directly.
- The `GEMINI_API_KEY` is set as an **environment variable in the Vercel project settings** — it is not committed anywhere in this repo.

---

Built by **Muhammad Awais**, BS-IT student, as a final capstone project.
