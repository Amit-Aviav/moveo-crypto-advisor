# Moveo Crypto Advisor

A personalized crypto investor dashboard. The app onboards the user with a short quiz and then shows a daily dashboard tailored to their preferences. Users can upvote/downvote items to improve future recommendations. A fun meme is also shown each day.

## Live URLs
- **Backend (Railway):** https://moveo-crypto-advisor-production.up.railway.app/
- **Frontend (Netlify/Vercel):** https://moveo-crypto-advisor-amit-aviavs-projects.vercel.app/

## Features
- **Auth:** email/password register & login (JWT)
- **Onboarding:** 
  - What crypto assets are you interested in?
  - What type of investor are you? (e.g., HODLer, Day Trader, NFT Collector)
  - What kind of content would you like to see? (Market News, Charts, Social, Fun)
  - Preferences are stored in DB (PostgreSQL via Prisma)
- **Daily Dashboard (4 sections):**
  - **Coin Prices** (CoinGecko; with graceful fallback)
  - **Market News** (CryptoPanic if token is set; static fallback otherwise)
  - **AI Insight of the Day** (rule-based text; can be swapped to a free LLM)
  - **Fun Crypto Meme** (memegen.link image)
- **Feedback:** 👍/👎 votes stored per user for each item

## Usage
Onboarding flow & editing preferences:
- After login, the app checks `/api/preferences/me`.
- If preferences are incomplete (no investor type, no assets, or no content types), the **Onboarding Wizard** opens automatically.
- When you click **Save & Finish**, the app switches to the **Daily Dashboard**.
- You can reopen the wizard anytime from the dashboard via **Edit preferences** (top-right).

## Voting
Each dashboard item supports simple up/down voting:
- **Prices** → vote per symbol (e.g., BTC, ETH)
- **News** → vote per story
- **Insight** and **Meme** → vote per daily item

Votes are stored per user in the DB (`Vote` model). Totals endpoint exists
(`/api/votes/summary`) but the UI currently hides counts to keep the flow simple.

## Tech
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Node.js + Express (TypeScript)
- **DB:** PostgreSQL (Prisma ORM)
- **Deploy:** Railway (backend), Netlify/Vercel (frontend)

## Bonus / Future work
- **LLM Insight**: replace rule-based insight with a free LLM (OpenRouter / HF Inference) using user assets + content types as context.
- **Vote totals & highlighting**: show ↑ / ↓ counts and tint my current vote; add optimistic updates.
- **News sources**: plug real CryptoPanic (set `CRYPTOPANIC_TOKEN`) and add filters by selected assets.
- **Charts**: if user chose “Charts”, embed simple sparkline or link to TradingView per asset.
- **Error tolerance**: graceful backoffs when third-party APIs rate-limit.

