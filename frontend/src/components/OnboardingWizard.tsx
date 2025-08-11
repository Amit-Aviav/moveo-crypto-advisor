// frontend/src/components/OnboardingWizard.tsx
import { useEffect, useMemo, useState } from "react";
import { getPrefs, savePrefs } from "../api";

type Prefs = {
  investorType: string;          // keep flexible
  assets: string[];
  contentTypes: string[];
};

const INVESTOR_TYPES = ["HODLer", "Day Trader", "NFT Collector"] as const;

// legacy mapping (must come AFTER INVESTOR_TYPES is declared)
const LEGACY_TO_NEW: Record<string, typeof INVESTOR_TYPES[number]> = {
  beginner: "HODLer",
  intermediate: "Day Trader",
  advanced: "NFT Collector",
};

const ALL_ASSETS = ["BTC", "ETH", "SOL", "BNB", "ADA"];
const CONTENT_OPTIONS = [
  { value: "news",   label: "Market News" },
  { value: "charts", label: "Charts" },
  { value: "social", label: "Social" },
  { value: "fun",    label: "Fun" },
];

export default function OnboardingWizard({
  token,
  onComplete,
}: { token: string; onComplete?: () => void }) {
  const [step, setStep] = useState(0); // 0..3
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Prefs>({
    investorType: INVESTOR_TYPES[0],
    assets: [],
    contentTypes: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getPrefs(token);
        const p = res?.preferences;
        if (p) {
          const raw = String(p.investorType ?? "");
          const mapped = LEGACY_TO_NEW[raw] ?? raw;
          const normalized = INVESTOR_TYPES.includes(mapped as any)
            ? (mapped as typeof INVESTOR_TYPES[number])
            : INVESTOR_TYPES[0];

          setForm({
            investorType: normalized,
            assets: Array.isArray(p.assets) ? p.assets : [],
            contentTypes: Array.isArray(p.contentTypes) ? p.contentTypes : [],
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const totalSteps = 4;
  const canNext = useMemo(() => {
    if (step === 0) return !!form.investorType;
    if (step === 1) return form.assets.length > 0;
    if (step === 2) return form.contentTypes.length > 0;
    return true;
  }, [step, form]);

  const toggle = (key: "assets" | "contentTypes", value: string) => {
    setForm(f => {
      const s = new Set(f[key]);
      s.has(value) ? s.delete(value) : s.add(value);
      return { ...f, [key]: Array.from(s) };
    });
  };

  const next = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const back = () => setStep(s => Math.max(s - 1, 0));

  const doSave = async () => {
    setSaving(true); setMsg("");
    try {
      await savePrefs(token, form);
      setMsg("Saved ✅");
      onComplete?.(); // notify parent to switch to dashboard
    } catch (e: any) {
      setMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <strong>Step {step + 1} of {totalSteps}</strong>
        <div style={{ height: 6, background: "#eee", borderRadius: 999, flex: 1 }}>
          <div style={{
            height: "100%",
            width: `${((step + 1) / totalSteps) * 100}%`,
            background: "#2563eb",
            borderRadius: 999,
            transition: "width .25s",
          }} />
        </div>
      </div>

      {step === 0 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            What type of investor are you?
          </legend>
          {INVESTOR_TYPES.map(v => (
            <label key={v} style={{ marginRight: 16, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="radio"
                name="investorType"
                value={v}
                checked={form.investorType === v}
                onChange={() => setForm(f => ({ ...f, investorType: v }))}
              />
              {v}
            </label>
          ))}
        </fieldset>
      )}

      {step === 1 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            What crypto assets are you interested in?
          </legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {ALL_ASSETS.map(a => (
              <label key={a} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.assets.includes(a)}
                  onChange={() => toggle("assets", a)}
                />
                {a}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
            What kind of content would you like to see?
          </legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {CONTENT_OPTIONS.map(c => (
              <label key={c.value} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.contentTypes.includes(c.value)}
                  onChange={() => toggle("contentTypes", c.value)}
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {step === 3 && (
        <div>
          <h3 style={{ margin: 0 }}>Review</h3>
          <ul>
            <li><b>Investor type:</b> {form.investorType}</li>
            <li><b>Assets:</b> {form.assets.join(", ") || "—"}</li>
            <li>
              <b>Content types:</b>{" "}
              {form.contentTypes
                .map(v => CONTENT_OPTIONS.find(o => o.value === v)?.label ?? v)
                .join(", ") || "—"}
            </li>
          </ul>
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={back} disabled={step === 0}>Back</button>
        {step < totalSteps - 1 ? (
          <button onClick={next} disabled={!canNext}>Next</button>
        ) : (
          <button onClick={doSave} disabled={saving || !canNext}>
            {saving ? "Saving…" : "Save & Finish"}
          </button>
        )}
      </div>

      {msg && <p>{msg}</p>}
    </div>
  );
}
