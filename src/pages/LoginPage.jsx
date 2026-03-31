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
      background: "linear-gradient(160deg, #EFF6FF 0%, #F8FAFC 60%, #F0FDF4 100%)",
      padding: "0 24px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Soft background blobs — no hard edges */}
      <div style={{ position:"fixed", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, #DBEAFE 0%, transparent 70%)", top:-100, right:-100, pointerEvents:"none", zIndex:0 }} />
      <div style={{ position:"fixed", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, #D1FAE5 0%, transparent 70%)", bottom:-80, left:-80, pointerEvents:"none", zIndex:0 }} />

      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", maxWidth:380, margin:"0 auto", width:"100%", position:"relative", zIndex:1 }}>
        {/* Logo — white icon on solid blue, crisp */}
        <div className="fade-up" style={{ marginBottom:40, textAlign:"center" }}>
          <div style={{
            width:72, height:72, borderRadius:22,
            background:"linear-gradient(145deg, #1E40AF, #2563EB)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:34, margin:"0 auto 18px",
            boxShadow:"0 12px 32px rgba(37,99,235,0.30)",
          }}>
            {/* White medical cross — pure white on blue */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="15" y="6" width="6" height="24" rx="2" fill="white" />
              <rect x="6" y="15" width="24" height="6" rx="2" fill="white" />
            </svg>
          </div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", margin:"0 0 4px", fontFamily:"var(--font-display)" }}>JDS Clinic</h1>
          <p style={{ color:"var(--muted)", fontSize:14, fontWeight:400 }}>Fitness & Wellness Platform</p>
        </div>

        {/* Login card */}
        <div className="scale-in" style={{
          width:"100%",
          background:"rgba(255,255,255,0.85)",
          backdropFilter:"blur(24px)",
          WebkitBackdropFilter:"blur(24px)",
          borderRadius:"var(--radius-xl)",
          padding:"28px 26px",
          boxShadow:"0 8px 40px rgba(15,23,42,0.10), 0 1px 3px rgba(15,23,42,0.06)",
          border:"1px solid rgba(255,255,255,0.7)",
        }}>
          <h2 style={{ fontSize:19, fontWeight:700, color:"var(--text)", marginBottom:22, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>Welcome back</h2>
          <ErrorMsg msg={error} />
          <form onSubmit={submit}>
            <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required />
            <Input label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" required />
            <Btn type="submit" full disabled={loading} size="lg" style={{ marginTop:6, borderRadius:12 }}>
              {loading ? "Signing in…" : "Sign In →"}
            </Btn>
          </form>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop:18, textAlign:"center", padding:"12px 16px", background:"rgba(37,99,235,0.06)", borderRadius:12, border:"1px solid rgba(37,99,235,0.12)", width:"100%" }}>
          <p style={{ fontSize:11, color:"var(--muted)", fontWeight:600, letterSpacing:"0.04em", textTransform:"uppercase", marginBottom:5 }}>Demo</p>
          <p style={{ fontSize:12, color:"var(--text2)", lineHeight:1.8 }}>
            Coach: coach@jdsclinic.com · <strong>Coach123!</strong><br />
            Client: sarah@example.com · <strong>Client123!</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
