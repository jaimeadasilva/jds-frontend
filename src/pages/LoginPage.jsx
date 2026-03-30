import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Btn, Input, ErrorMsg } from "../components/UI";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await login(email, password);
      navigate(data.user.role === "coach" ? "/coach" : "/client");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(160deg, #EFF6FF 0%, #F8FAFC 50%, #F0FDF4 100%)",
      padding: "0 24px",
    }}>
      {/* Top decoration */}
      <div style={{ position: "fixed", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "var(--royal)", opacity: 0.06, pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: 60, left: -80, width: 200, height: 200, borderRadius: "50%", background: "var(--royal)", opacity: 0.04, pointerEvents: "none" }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", maxWidth: 380, margin: "0 auto", width: "100%" }}>
        {/* Logo mark */}
        <div className="fade-up" style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{
            width: 68, height: 68, borderRadius: 20,
            background: "linear-gradient(145deg, var(--royal), var(--royal-deep))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 18px",
            boxShadow: "var(--shadow-blue)",
          }}>⚕️</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.04em", margin: "0 0 4px", fontFamily: "var(--font-display)" }}>JDS Clinic</h1>
          <p style={{ color: "var(--muted)", fontSize: 14, fontWeight: 400 }}>Fitness & Wellness Platform</p>
        </div>

        {/* Card */}
        <div className="scale-in" style={{
          width: "100%",
          background: "var(--white)",
          borderRadius: "var(--radius-lg)",
          padding: "28px 26px",
          boxShadow: "var(--shadow-lg)",
          border: "1px solid var(--line)",
        }}>
          <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--text)", marginBottom: 22, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Welcome back</h2>

          <ErrorMsg msg={error} />

          <form onSubmit={submit}>
            <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required />
            <Input label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
            <Btn type="submit" full disabled={loading} size="lg" style={{ marginTop: 6, borderRadius: 12 }}>
              {loading ? "Signing in…" : "Sign In →"}
            </Btn>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 20, textAlign: "center", padding: "14px 18px", background: "rgba(37,99,235,0.05)", borderRadius: 12, border: "1px solid var(--royal-pale2)", width: "100%" }}>
          <p style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>Demo Accounts</p>
          <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.8 }}>
            Coach: coach@jdsclinic.com · <strong>Coach123!</strong><br />
            Client: sarah@example.com · <strong>Client123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
