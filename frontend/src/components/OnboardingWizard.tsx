import { useEffect, useMemo, useState } from "react";
import { getPrefs, savePrefs } from "../api";

type Prefs = {
  investorType: "beginner" | "intermediate" | "advanced";
  assets: string[];
  contentTypes: string[];
};

const ALL_ASSETS = ["BTC", "ETH", "SOL", "BNB", "ADA"];
const ALL_CONTENT = ["news", "signals", "charts", "social", "fun"];

export default function OnboardingWizard({ token }: { token: string }) {
  const [step, setStep] = useState(0); // 0..3
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState<Prefs>({
    investorType: "beginner",
    assets: [],
    contentTypes: [],
  });

  // Prefill from server
  useEffect(() => {
    (async () => {
      try {
        const res = await getPrefs(token);
        const p = res?.preferences;
        if (p) {
          setForm({
            investorType: (p.investorType as Prefs["investorType"]) ?? "beginner",
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
    if (step === 1) return form.assets.length > 0;        // require at least 1 asset (tweak if you want)
    if (step === 2) return form.contentTypes.length > 0;  // require at least 1 content type
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
    } catch (e: any) {
      setMsg(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>Step {step + 1} of {totalSteps}</strong>
        <div style={{ height: 6, background: "#eee", borderRadius: 999, flex: 1, marginLeft: 12 }}>
          <div style={{
            height: "100%",
            width: `${((step + 1) / totalSteps) * 100}%`,
            background: "#2563eb",
            borderRadius: 999,
            transition: "width .25s",
          }} />
        </div>
      </div>

      {/* Step screens */}
      {step === 0 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>What’s your investor type?</legend>
          {(["beginner","intermediate","advanced"] as Prefs["investorType"][]).map(v => (
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
          <p style={{ color: "#64748b", marginTop: 8 }}>Pick the option that best describes your experience level.</p>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Which assets are you into?</legend>
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
          <p style={{ color: "#64748b", marginTop: 8 }}>Choose at least one to personalize recommendations.</p>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>What content do you want more of?</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {ALL_CONTENT.map(c => (
              <label key={c} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={form.contentTypes.includes(c)}
                  onChange={() => toggle("contentTypes", c)}
                />
                {c}
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
            <li><b>Content types:</b> {form.contentTypes.join(", ") || "—"}</li>
          </ul>
        </div>
      )}

      {/* Nav */}
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
