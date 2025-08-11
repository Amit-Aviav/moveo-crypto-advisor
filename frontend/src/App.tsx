import { useEffect, useState } from "react";
import { login, register, getPrefs } from "./api";
import OnboardingWizard from "./components/OnboardingWizard";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [email, setEmail] = useState("newtesttt@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [token, setToken] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // wizard gating
  const [checking, setChecking] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  // load token on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
  }, []);

  const doLogin = async () => {
    setBusy(true); setMsg("");
    try {
      const r = await login(email, password);
      setToken(r.token);
      localStorage.setItem("token", r.token);
      setMsg("Logged in ✅");
    } catch (e: any) {
      setMsg(e.message || "Login failed");
    } finally { setBusy(false); }
  };

  const doRegister = async () => {
    setBusy(true); setMsg("");
    try {
      await register("Test", email, password);
      await doLogin();
    } catch (e: any) {
      setMsg(e.message || "Register failed");
    } finally { setBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setShowWizard(false);
    setMsg("Logged out");
  };

  // check if prefs are complete
  const prefsComplete = (p: any | null) =>
    !!p &&
    !!p.investorType &&
    Array.isArray(p.assets) && p.assets.length > 0 &&
    Array.isArray(p.contentTypes) && p.contentTypes.length > 0;

  useEffect(() => {
    if (!token) return;
    setChecking(true);
    (async () => {
      try {
        const res = await getPrefs(token);
        setShowWizard(!prefsComplete(res?.preferences ?? null));
      } catch {
        setShowWizard(true);
      } finally {
        setChecking(false);
      }
    })();
  }, [token]);

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 12px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Onboarding Preferences</h1>

      {!token ? (
        <>
          <label>Email<br/>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width: "100%" }} />
          </label>
          <br/><br/>
          <label>Password<br/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width: "100%" }} />
          </label>
          <br/><br/>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={doLogin} disabled={busy}>Login</button>
            <button onClick={doRegister} disabled={busy}>Register</button>
          </div>
          <p>{msg}</p>
        </>
      ) : (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 8 }}>
            {import.meta.env.DEV && <code>token: {token.slice(0,28)}…</code>}
            <button onClick={logout}>Logout</button>
          </div>
          <hr/>

          {checking ? (
            <p>Loading your preferences…</p>
          ) : showWizard ? (
            <OnboardingWizard
              token={token}
              onComplete={() => setShowWizard(false)}
            />
          ) : (
            <>
              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom: 12 }}>
                <button onClick={() => setShowWizard(true)}>Edit preferences</button>
              </div>
              <Dashboard token={token} />
            </>
          )}

          <p>{msg}</p>
        </>
      )}
    </div>
  );
}
