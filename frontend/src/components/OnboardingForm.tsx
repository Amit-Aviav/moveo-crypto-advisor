import { useEffect, useState } from "react";
import { getPrefs, savePrefs } from "../api";

type Prefs = {
  investorType: "beginner" | "intermediate" | "advanced";
  assets: string[];
  contentTypes: string[];
};

const ALL_ASSETS = ["BTC", "ETH", "SOL", "BNB", "ADA"];
const ALL_CONTENT = ["news", "signals", "charts", "social", "fun"];

export default function OnboardingForm({ token }: { token: string }) {
  const [form, setForm] = useState<Prefs>({
    investorType: "beginner",
    assets: [],
    contentTypes: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getPrefs(token);
        const p = res?.preferences ?? null;
        if (alive && p) {
          setForm({
            investorType: (p.investorType as Prefs["investorType"]) ?? "beginner",
            assets: Array.isArray(p.assets) ? p.assets : [],
            contentTypes: Array.isArray(p.contentTypes) ? p.contentTypes : [],
          });
        }
      } catch (e) {
        console.warn("getPrefs failed (first load is fine):", e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [token]);

  const toggle = (key: "assets" | "contentTypes", value: string) => {
    setForm((f) => {
      const set = new Set(f[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [key]: Array.from(set) };
    });
  };

  const save = async () => {
    setSaving(true); setMsg("");
    try {
      await savePrefs(token, form);
      setMsg("Saved ✅");
    } catch (e: any) {
      console.error(e);
      setMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h3 style={{ margin: 0 }}>Investor type</h3>
        {(["beginner","intermediate","advanced"] as Prefs["investorType"][]).map(v => (
          <label key={v} style={{ marginRight: 12 }}>
            <input
              type="radio"
              name="investorType"
              value={v}
              checked={form.investorType === v}
              onChange={() => setForm((f) => ({ ...f, investorType: v }))}
            />{" "}
            {v}
          </label>
        ))}
      </div>

      <div>
        <h3 style={{ margin: 0 }}>Assets</h3>
        {ALL_ASSETS.map(a => (
          <label key={a} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={form.assets.includes(a)}
              onChange={() => toggle("assets", a)}
            />{" "}
            {a}
          </label>
        ))}
      </div>

      <div>
        <h3 style={{ margin: 0 }}>Content types</h3>
        {ALL_CONTENT.map(c => (
          <label key={c} style={{ marginRight: 12 }}>
            <input
              type="checkbox"
              checked={form.contentTypes.includes(c)}
              onChange={() => toggle("contentTypes", c)}
            />{" "}
            {c}
          </label>
        ))}
      </div>

      <button onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save preferences"}
      </button>

      <p>{msg}</p>
    </div>
  );
}
