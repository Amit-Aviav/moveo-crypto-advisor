import { useEffect, useState } from "react";
import { login, register, getPrefs } from "./api";
import OnboardingWizard from "./components/OnboardingWizard";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [email, setEmail] = useState("newtesttt@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  // onboarding gating
  const [checking, setChecking] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

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
    setToken("");
    setMsg("Logged out");
  };

  // decide wizard vs dashboard
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
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
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
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <code>token: {token.slice(0,28)}…</code>
            <button onClick={logout}>Logout</button>
          </div>
          <hr/>

          {checking ? (
            <p>Loading your preferences…</p>
          ) : showWizard ? (
            <OnboardingWizard token={token} onComplete={() => setShowWizard(false)} />
          ) : (
            <Dashboard token={token} />
          )}

          <p>{msg}</p>
        </>
      )}
    </div>
  );
}
