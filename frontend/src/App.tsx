import { useEffect, useState } from "react";
import { login, register } from "./api";
import OnboardingWizard from "./components/OnboardingWizard"; // <-- use wizard

export default function App() {
  const [email, setEmail] = useState("newtesttt@example.com");
  const [password, setPassword] = useState("Passw0rd!");
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) setToken(t);
    console.log("API =", import.meta.env.VITE_API_URL);
  }, []);

  const doLogin = async () => {
    setBusy(true); setMsg("");
    try {
      const { token } = await login(email, password);
      setToken(token);
      localStorage.setItem("token", token);
      setMsg("Logged in ✅");
    } catch (e: any) {
      console.error(e);
      setMsg(e.message || "Login failed");
    } finally { setBusy(false); }
  };

  const doRegister = async () => {
    setBusy(true); setMsg("");
    try {
      await register("Test", email, password);
      await doLogin();
    } catch (e: any) {
      console.error(e);
      setMsg(e.message || "Register failed");
    } finally { setBusy(false); }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setMsg("Logged out");
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif" }}>
      <h1>Onboarding Preferences</h1>

      {!token ? (
        <>
          <label>Email<br/>
            <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:"100%"}} />
          </label>
          <br/><br/>
          <label>Password<br/>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:"100%"}} />
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
          <OnboardingWizard token={token} /> {/* <-- show wizard */}
          <p>{msg}</p>
        </>
      )}
    </div>
  );
}
