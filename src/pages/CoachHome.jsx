import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI } from "../api/client";
import { Card, Avatar, Badge, ProgressBar, Spinner, goalColor, goalIcon, bmi, bmiCat } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id: "home",    label: "Home",    icon: "🏠", path: "/coach" },
  { id: "clients", label: "Clients", icon: "👥", path: "/coach/clients" },
  { id: "plans",   label: "Plans",   icon: "📋", path: "/coach/plans" },
  { id: "profile", label: "Profile", icon: "👤", path: "/coach/profile" },
];

export default function CoachHome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientsAPI.list(token).then(setClients).finally(() => setLoading(false));
  }, [token]);

  const activity = [
    { text: "Sarah completed Day 1 workout", time: "2h ago", icon: "✅" },
    { text: "Mohammed updated his weight", time: "5h ago", icon: "⚖️" },
    { text: "Layla logged today's meals", time: "Yesterday", icon: "🍎" },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background: `linear-gradient(145deg, var(--navy) 0%, var(--blue) 100%)`, padding: "52px 24px 32px", position: "relative", overflow: "hidden" }}>
        {[{ s:180,t:-40,r:-40,o:0.06 },{ s:120,t:20,r:30,o:0.08 }].map((c,i) => (
          <div key={i} style={{ position:"absolute", width:c.s, height:c.s, borderRadius:"50%", background:"#fff", opacity:c.o, top:c.t, right:c.r, pointerEvents:"none" }} />
        ))}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative", zIndex:1 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#4ADE80" }} />
              <span style={{ color:"rgba(255,255,255,0.65)", fontSize:12, fontWeight:600 }}>JDS Clinic</span>
            </div>
            <h1 style={{ color:"#fff", margin:0, fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>
              Good morning,<br />{user?.full_name || "Dr. Da Silva"} 👋
            </h1>
            <p style={{ color:"rgba(255,255,255,0.6)", margin:"8px 0 0", fontSize:14 }}>
              You have <strong style={{ color:"#fff" }}>{clients.length} active clients</strong>
            </p>
          </div>
          <div style={{ width:44, height:44, borderRadius:14, background:"rgba(255,255,255,0.15)", border:"1.5px solid rgba(255,255,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🩺</div>
        </div>
        {/* Quick stats */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:24, position:"relative", zIndex:1 }}>
          {[
            { label:"Active",     value: clients.length,                                         icon:"👥" },
            { label:"Fat Loss",   value: clients.filter(c=>c.goal==="Fat Loss").length,           icon:"🔥" },
            { label:"Muscle Gain",value: clients.filter(c=>c.goal==="Muscle Gain").length,        icon:"💪" },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:14, padding:"12px 10px", border:"1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize:18 }}>{s.icon}</div>
              <div style={{ fontSize:20, fontWeight:900, color:"#fff", margin:"4px 0 0" }}>{s.value}</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.6)", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"24px 20px" }}>
        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:28 }}>
          <button onClick={() => navigate("/coach/clients/new")}
            style={{ background:`linear-gradient(135deg, var(--blue), var(--navy))`, color:"#fff", border:"none", borderRadius:14, padding:16, cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font)", boxShadow:"var(--shadow)" }}>
            ➕ Add Client
          </button>
          <button onClick={() => navigate("/coach/plans")}
            style={{ background:"var(--blue-pale)", color:"var(--blue)", border:"1px solid var(--blue-pale2)", borderRadius:14, padding:16, cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font)" }}>
            📋 Plans
          </button>
        </div>

        {/* Recent clients */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:"var(--text)" }}>Recent Clients</h3>
          <button onClick={() => navigate("/coach/clients")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--blue)", fontWeight:700, fontFamily:"var(--font)" }}>See all →</button>
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            {clients.slice(0,3).map(c => (
              <Card key={c.id} onClick={() => navigate(`/coach/clients/${c.id}`)} style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar initials={c.avatar_initials || c.full_name?.slice(0,2)} color={goalColor(c.goal)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>{c.full_name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{c.weight_kg} kg · {c.goal}</div>
                    <div style={{ marginTop:6 }}>
                      <ProgressBar value={c.progress_pct} color={goalColor(c.goal)} />
                    </div>
                  </div>
                  <Badge label={`${c.progress_pct}%`} color={goalColor(c.goal)} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Activity feed */}
        <h3 style={{ margin:"0 0 12px", fontSize:16, fontWeight:800, color:"var(--text)" }}>Recent Activity</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {activity.map((a,i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 14px", background:"var(--white)", borderRadius:12, border:"1px solid var(--line)" }}>
              <div style={{ fontSize:20, flexShrink:0 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:"var(--text)", fontWeight:600 }}>{a.text}</div>
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
