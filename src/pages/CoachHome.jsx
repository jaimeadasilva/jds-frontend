import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI } from "../api/client";
import { Card, Avatar, Badge, ProgressBar, Spinner, goalColor, goalIcon, StatCard } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

const ACTIVITY = [
  { text: "Sarah completed Day 1 workout", time: "2h ago", icon: "✅", color: "var(--emerald)" },
  { text: "Mohammed updated weight to 80 kg", time: "5h ago", icon: "⚖️", color: "var(--royal)" },
  { text: "Layla logged today's meals", time: "Yesterday", icon: "🍎", color: "var(--amber)" },
];

export default function CoachHome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsAPI.list(token).then(setClients).finally(() => setLoading(false));
  }, [token]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        background: "linear-gradient(145deg, #1E40AF 0%, var(--royal) 60%, #3B82F6 100%)",
        padding: "56px 24px 32px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position:"absolute", width:260, height:260, borderRadius:"50%", background:"#fff", opacity:0.05, top:-80, right:-60, pointerEvents:"none" }} />
        <div style={{ position:"absolute", width:140, height:140, borderRadius:"50%", background:"#fff", opacity:0.05, bottom:-30, left:-20, pointerEvents:"none" }} />
        {/* Subtle grid */}
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize:"24px 24px", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.65)", fontSize:13, fontWeight:500, margin:"0 0 4px", letterSpacing:"0.01em" }}>{greeting()},</p>
              <h1 style={{ color:"#fff", margin:0, fontSize:26, fontWeight:800, letterSpacing:"-0.04em", fontFamily:"var(--font-display)", lineHeight:1.15 }}>
                Dr. {user?.full_name?.split(" ").pop() || "Da Silva"} 👋
              </h1>
              <p style={{ color:"rgba(255,255,255,0.55)", margin:"6px 0 0", fontSize:13 }}>
                <span style={{ color:"#fff", fontWeight:700 }}>{clients.length} active clients</span> this week
              </p>
            </div>
            <div style={{
              width:42, height:42, borderRadius:13,
              background:"rgba(255,255,255,0.14)",
              border:"1.5px solid rgba(255,255,255,0.22)",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            }}>🩺</div>
          </div>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:22 }}>
            {[
              { label:"Clients", value: clients.length, icon:"👥" },
              { label:"Fat Loss", value: clients.filter(c=>c.goal==="Fat Loss").length, icon:"🔥" },
              { label:"Muscle", value: clients.filter(c=>c.goal==="Muscle Gain").length, icon:"💪" },
            ].map(s => (
              <div key={s.label} className="glass" style={{ borderRadius:14, padding:"12px 12px" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"var(--font-display)" }}>{s.value}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", fontWeight:600, marginTop:1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"22px 20px" }}>
        {/* Quick Actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
          <button onClick={() => navigate("/coach/clients/new")}
            style={{
              background:"linear-gradient(135deg, var(--royal), var(--royal-deep))",
              color:"#fff", border:"none", borderRadius:"var(--radius)", padding:"16px 14px",
              cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)",
              boxShadow:"var(--shadow-blue)", textAlign:"left", display:"flex", flexDirection:"column", gap:4,
            }}>
            <span style={{ fontSize:20 }}>➕</span>
            <span>Add Client</span>
          </button>
          <button onClick={() => navigate("/coach/plans")}
            style={{
              background:"var(--white)", color:"var(--text)", border:"1px solid var(--line)",
              borderRadius:"var(--radius)", padding:"16px 14px",
              cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)",
              boxShadow:"var(--shadow-sm)", textAlign:"left", display:"flex", flexDirection:"column", gap:4,
            }}>
            <span style={{ fontSize:20 }}>📋</span>
            <span>Plans</span>
          </button>
        </div>

        {/* Recent Clients */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>Recent Clients</h3>
          <button onClick={() => navigate("/coach/clients")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--royal)", fontWeight:600, fontFamily:"var(--font-body)" }}>See all →</button>
        </div>

        {loading ? <Spinner /> : (
          <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            {clients.slice(0,3).map(c => (
              <Card key={c.id} onClick={() => navigate(`/coach/clients/${c.id}`)} className="fade-up">
                <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                  <Avatar initials={c.avatar_initials || c.full_name?.slice(0,2)} color={goalColor(c.goal)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>{c.full_name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{c.weight_kg} kg · {c.goal}</div>
                    <div style={{ marginTop:7 }}>
                      <ProgressBar value={c.progress_pct} color={goalColor(c.goal)} />
                    </div>
                  </div>
                  <Badge label={`${c.progress_pct}%`} color={goalColor(c.goal)} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Activity */}
        <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>Activity</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", boxShadow:"var(--shadow-xs)" }}>
              <div style={{ width:34, height:34, borderRadius:10, background: a.color + "12", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"var(--text2)", fontWeight:500 }}>{a.text}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
