import { useEffect, useState } from "react";
import { getDashboard } from "../api";

type Sections = {
  prices?: Array<{ symbol: string; name?: string; usd?: number }>;
  news?: Array<{ id: string; title: string; url: string; source?: string }>;
  insight?: { id: string; text: string };
  meme?: { id: string; text?: string; image?: string } | null;
};

const fmtUSD = (n?: number) => {
  if (n == null || !Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  }).format(n);
};

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginTop: 12 } as const,
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, boxShadow: "0 6px 16px rgba(15,23,42,.04)" } as const,
  list: { listStyle: "none", padding: 0, margin: 0 } as const,
  muted: { color: "#6b7280", fontSize: 12 } as const,
  pre: { background: "#f7f7f8", border: "1px solid #ececec", borderRadius: 10, padding: 12, whiteSpace: "pre-wrap", margin: 0 } as const,
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
    <div style={styles.grid}>
      {/* Prices */}
      <section style={styles.card}>
        <h3>Coin Prices</h3>
        <ul style={styles.list}>
          {data.prices?.length ? (
            data.prices.map(p => (
              <li key={p.symbol}>
                <strong>{p.symbol}</strong>{" "}
                <span style={styles.muted}>({p.name})</span>: {fmtUSD(p.usd)}
              </li>
            ))
          ) : (
            <li style={styles.muted}>No prices yet.</li>
          )}
        </ul>
      </section>

      {/* News */}
      <section style={styles.card}>
        <h3>Market News</h3>
        <ul style={styles.list}>
          {data.news?.length ? (
            data.news.map(n => (
              <li key={n.id}>
                <a href={n.url} target="_blank" rel="noreferrer">{n.title}</a>{" "}
                {n.source ? <span style={styles.muted}>({n.source})</span> : null}
              </li>
            ))
          ) : (
            <li style={styles.muted}>No news right now.</li>
          )}
        </ul>
      </section>

      {/* Insight */}
      <section style={styles.card}>
        <h3>AI Insight of the Day</h3>
        <pre style={styles.pre}>{data.insight?.text || "—"}</pre>
      </section>

      {/* Meme */}
        <section style={{ ...styles.card, overflow: "hidden" }}>
        <h3>Fun Crypto Meme</h3>
        {data.meme ? (
            data.meme.image ? (
            <img
                src={data.meme.image}
                alt="meme"
                style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }}
            />
            ) : (
            <p style={{ margin: 0 }}>{data.meme.text}</p>
            )
        ) : (
            <p style={{ ...styles.muted, margin: 0 }}>No meme today 😅</p>
        )}
</section>

    </div>

    
  );
}
