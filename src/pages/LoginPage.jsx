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
      setError(err.message || "Login failed. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", background: "var(--bg)" }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: 22,
          background: `linear-gradient(145deg, var(--navy), var(--blue))`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 16px", boxShadow: "var(--shadow-md)",
        }}>⚕️</div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "var(--text)", letterSpacing: "-0.03em", margin: 0 }}>JDS Clinic</h1>
        <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>Fitness & Wellness Platform</p>
      </div>

      {/* Card */}
      <div style={{ width: "100%", maxWidth: 380, background: "var(--white)", borderRadius: 20, padding: "28px 24px", boxShadow: "var(--shadow-md)", border: "1px solid var(--line)" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text)", marginBottom: 20 }}>Sign In</h2>

        <ErrorMsg msg={error} />

        <form onSubmit={submit}>
          <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required />
          <Input label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
          <Btn type="submit" full disabled={loading} style={{ marginTop: 8, padding: "14px", borderRadius: 14, fontSize: 15 }}>
            {loading ? "Signing in…" : "Sign In →"}
          </Btn>
        </form>

        <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
          Coach: coach@jdsclinic.com<br />
          Client: sarah@example.com<br />
          Password: Coach123! / Client123!
        </p>
      </div>
    </div>
  );
}
