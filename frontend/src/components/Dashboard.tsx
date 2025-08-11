import { useEffect, useState } from "react";
import { getDashboard } from "../api";

type Sections = {
  prices?: Array<{ symbol: string; name?: string; usd?: number }>;
  news?: Array<{ id: string; title: string; url: string; source?: string }>;
  insight?: { id: string; text: string };
  meme?: { id: string; text?: string; image?: string } | null;
};

export default function Dashboard({ token }: { token: string }) {
  const [data, setData] = useState<Sections | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");
        const r = await getDashboard(token);
        if (alive) setData(r.sections);
      } catch (e: any) {
        if (alive) setErr(e.message || "Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  if (loading) return <p>Loading dashboard…</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;
  if (!data) return <p>No data.</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section>
        <h3>Coin Prices</h3>
        <ul>
          {data.prices?.map(p => (
            <li key={p.symbol}>
              {p.symbol}: {Number.isFinite(p.usd as number) ? `$${p.usd}` : "—"}
            </li>
          )) || <li>—</li>}
        </ul>
      </section>

      <section>
        <h3>Market News</h3>
        <ul>
          {data.news?.map(n => (
            <li key={n.id}>
              <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>
              {n.source ? <small> ({n.source})</small> : null}
            </li>
          )) || <li>—</li>}
        </ul>
      </section>

      <section>
        <h3>AI Insight of the Day</h3>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8 }}>
{data.insight?.text || "—"}
        </pre>
      </section>

      {data.meme && (
        <section>
          <h3>Fun Crypto Meme</h3>
          {data.meme.image
            ? <img src={data.meme.image} alt="meme" style={{ maxWidth: 360 }} />
            : <p>{data.meme.text}</p>}
        </section>
      )}
    </div>
  );
}
