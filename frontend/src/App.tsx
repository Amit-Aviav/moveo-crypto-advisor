import { useState } from "react";
import { login, getPrefs, savePrefs } from "./api";

export default function App() {
  const [email, setEmail] = useState("newtesttt@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [token, setToken] = useState("");
  const [prefs, setPrefs] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const doLogin = async () => {
    setBusy(true); setMsg("");
    try {
      const { token } = await login(email, password);
      setToken(token);
      setMsg("Logged in ✅");
    } catch (e: any) { setMsg(e.message || "Login failed"); }
    finally { setBusy(false); }
  };

  const fetchPrefs = async () => {
    setBusy(true); setMsg("");
    try {
      const res = await getPrefs(token);
      setPrefs(res.preferences ?? null);
      setMsg("Fetched preferences ✅");
    } catch (e: any) { setMsg(e.message || "Fetch failed"); }
    finally { setBusy(false); }
  };

  const saveSample = async () => {
    setBusy(true); setMsg("");
    try {
      await savePrefs(token, {
        investorType: "beginner",
        assets: ["BTC", "ETH"],
        contentTypes: ["news", "signals"],
      });
      await fetchPrefs();
      setMsg("Saved ✅");
    } catch (e: any) { setMsg(e.message || "Save failed"); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Onboarding Preferences (Demo)</h1>

      <label>Email<br />
        <input value={email} onChange={(e)=>setEmail(e.target.value)} style={{width:"100%"}} />
      </label>
      <br /><br />
      <label>Password<br />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} style={{width:"100%"}} />
      </label>
      <br /><br />

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={doLogin} disabled={busy}>Login</button>
        <button onClick={fetchPrefs} disabled={!token || busy}>Get Prefs</button>
        <button onClick={saveSample} disabled={!token || busy}>Save Sample</button>
      </div>

      <p>{msg}</p>

      <pre style={{ background:"#111", color:"#0f0", padding:12, borderRadius:8 }}>
        token: {token ? token.slice(0,28) + "…" : "(none)"}
      </pre>

      <pre style={{ background:"#f6f6f6", padding:12, borderRadius:8, minHeight:120 }}>
        {JSON.stringify(prefs, null, 2)}
      </pre>
    </div>
  );
}
