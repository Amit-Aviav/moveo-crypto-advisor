// backend/src/controllers/dashboardController.ts
import type { Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import axios from "axios";
import { prisma } from "../utils/prisma";

const CG_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  ADA: "cardano",
};

const FALLBACK_NEWS = [
  { id: "n1", title: "Bitcoin holds key level into the week", url: "https://example.com/bitcoinkey", source: "Static" },
  { id: "n2", title: "ETH dev update: progress on scaling", url: "https://example.com/ethscaling", source: "Static" },
];

function memegen(top: string, bottom: string, template = "doge") {
    const enc = (s: string) => encodeURIComponent(s.replace(/ /g, "_"));
    return `https://api.memegen.link/images/${template}/${enc(top)}/${enc(bottom)}.png?font=impact`;
  }
  
  // Replace your current FALLBACK_MEMES with this:
  const FALLBACK_MEMES = [
    {
      id: "m1",
      text: "WAGMI 🚀 (but set stop-loss)",
      image: memegen("WAGMI 🚀", "but set stop-loss", "doge"),
    },
    {
      id: "m2",
      text: "HODL strategy: do nothing, but with conviction.",
      image: memegen("HODL", "with conviction", "stonks"),
    },
    {
      id: "m3",
      text: "FOMO is not a strategy.",
      image: memegen("FOMO", "is not a strategy", "gru"),
    },
  ];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

export async function getDashboard(req: AuthedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    // 1) prefs
    const prefs = await prisma.preference.findUnique({ where: { userId: req.user.id } });
    const assets = prefs?.assets ?? ["BTC","ETH"];
    const wantsNews = (prefs?.contentTypes ?? []).includes("news") || true; // show by default
    const wantsCharts = (prefs?.contentTypes ?? []).includes("charts");
    const wantsSocial = (prefs?.contentTypes ?? []).includes("social");
    const wantsFun = (prefs?.contentTypes ?? []).includes("fun") || true; // show by default

   

    // 2) prices (CoinGecko, no key required)
    const ids = assets.map(s => CG_IDS[s]).filter(Boolean);
    let prices: Array<{ symbol: string; name: string; usd: number }> = [];
    if (ids.length) {
      try {
        const r = await axios.get("https://api.coingecko.com/api/v3/simple/price", {
          params: { ids: ids.join(","), vs_currencies: "usd" },
          timeout: 5000,
        });
        prices = assets
          .filter(s => CG_IDS[s])
          .map(s => ({ symbol: s, name: CG_IDS[s], usd: r.data?.[CG_IDS[s]]?.usd ?? null }))
          .filter(p => p.usd !== null);
      } catch {
        prices = assets.map(s => ({ symbol: s, name: CG_IDS[s] ?? s, usd: NaN })); // fallback
      }
    }

    // 3) news (CryptoPanic if token, else fallback)
    let news = FALLBACK_NEWS;
    const token = process.env.CRYPTOPANIC_TOKEN;
    if (token && wantsNews && assets.length) {
      try {
        const currencies = assets.join(",");
        const r = await axios.get("https://cryptopanic.com/api/v1/posts/", {
          params: { auth_token: token, currencies, filter: "rising", public: "true" },
          timeout: 5000,
        });
        news = (r.data?.results ?? []).slice(0, 6).map((p: any) => ({
          id: String(p.id),
          title: p.title,
          url: p.url,
          source: p.source?.title ?? "CryptoPanic",
        }));
      } catch { /* keep fallback */ }
    }

    // 4) insight (מינימום חכם ללא מודל – מחר/LLM אופציונלי)
    const insight = {
      id: "insight-" + new Date().toISOString().slice(0,10),
      text:
        `Today's focus: ${assets.slice(0,2).join(" & ") || "BTC & ETH"}.\n` +
        `Consider watching funding rates, liquidity around round numbers, and macro prints.\n` +
        (wantsCharts ? "You asked for charts – check local S/R and 20/50/200 MAs.\n" : "") +
        (wantsSocial ? "Social spikes can fake out – confirm with volume.\n" : "") +
        "Not financial advice. DYOR. 🧠",
    };

    // 5) meme (טקסט/תמונה סטטית)
    const meme = wantsFun ? pick(FALLBACK_MEMES) : null;

    return res.json({
      ok: true,
      sections: {
        prices,
        news,
        insight,
        meme,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: "Failed to build dashboard" });
  }
}

export default getDashboard;
