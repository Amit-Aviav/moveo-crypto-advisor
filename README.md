# Moveo Crypto Advisor

A personalized crypto investor dashboard. The app onboards the user with a short quiz and then shows a daily dashboard tailored to their preferences. Users can upvote/downvote items to improve future recommendations. A fun meme is also shown each day.

## Live URLs
- **Backend (Railway):** https://YOUR-API.up.railway.app
- **Frontend (Netlify/Vercel):** https://YOUR-FRONTEND.app
> Set `VITE_API_URL` on the frontend host to point to the backend URL (no trailing slash).

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

## Tech
- **Frontend:** React + Vite (TypeScript)
- **Backend:** Node.js + Express (TypeScript)
- **DB:** PostgreSQL (Prisma ORM)
- **Deploy:** Railway (backend), Netlify/Vercel (frontend)

## Monorepo layout
