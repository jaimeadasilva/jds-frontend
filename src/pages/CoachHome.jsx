import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI } from "../api/client";
import { Card, Avatar, Badge, ProgressBar, Spinner, goalColor, goalIcon } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

const ACTIVITY = [
  { text:"Sarah completed Day 1 workout",       time:"2h ago",    icon:"✅", color:"var(--emerald)" },
  { text:"Mohammed updated weight to 80 kg",    time:"5h ago",    icon:"⚖️", color:"var(--royal)" },
  { text:"Layla logged today's meals",          time:"Yesterday", icon:"🍎", color:"var(--amber)" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function CoachHome() {
  const { token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to resolve before firing API call
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    clientsAPI.list(token)
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

  const avgProgress = clients.length
    ? Math.round(clients.reduce((s,c) => s + (c.progress_pct||0), 0) / clients.length)
    : 0;

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        background:"linear-gradient(150deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)",
        padding:"56px 24px 32px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", top:-160, right:-120, pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to bottom, transparent, rgba(30,58,138,0.18))", pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:500, margin:"0 0 4px" }}>{greeting()},</p>
              <h1 style={{ color:"#fff", margin:0, fontSize:27, fontWeight:800, letterSpacing:"-0.04em", fontFamily:"var(--font-display)", lineHeight:1.15 }}>
                Dr. Da Silva 👋
              </h1>
              <p style={{ color:"rgba(255,255,255,0.55)", margin:"6px 0 0", fontSize:13 }}>
                <span style={{ color:"#fff", fontWeight:700 }}>{clients.length} active client{clients.length !== 1 ? "s" : ""}</span> on your roster
              </p>
            </div>
            <div style={{ width:42, height:42, borderRadius:13, background:"rgba(255,255,255,0.14)", border:"1.5px solid rgba(255,255,255,0.22)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🩺</div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginTop:22 }}>
            {[
              { label:"Total Clients", value:clients.length,    icon:"👥" },
              { label:"Avg Progress",  value:`${avgProgress}%`, icon:"📈" },
              { label:"This Week",     value:clients.length,    icon:"🗓" },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.11)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.16)", borderRadius:14, padding:"12px 10px" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{s.icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color:"#fff", fontFamily:"var(--font-display)" }}>{s.value}</div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.58)", fontWeight:600, marginTop:1, letterSpacing:"0.02em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding:"22px 20px" }}>
        {/* Quick Actions */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:28 }}>
          <button onClick={() => navigate("/coach/clients/new")}
            style={{ background:"linear-gradient(135deg, var(--royal), var(--royal-deep))", color:"#fff", border:"none", borderRadius:"var(--radius)", padding:"16px 14px", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)", boxShadow:"var(--shadow-blue)", textAlign:"left", display:"flex", flexDirection:"column", gap:5 }}>
            <span style={{ fontSize:20 }}>➕</span>
            <span>Add Client</span>
          </button>
          <button onClick={() => navigate("/coach/plans")}
            style={{ background:"var(--white)", color:"var(--text)", border:"1px solid var(--line)", borderRadius:"var(--radius)", padding:"16px 14px", cursor:"pointer", fontWeight:700, fontSize:14, fontFamily:"var(--font-body)", boxShadow:"var(--shadow-sm)", textAlign:"left", display:"flex", flexDirection:"column", gap:5 }}>
            <span style={{ fontSize:20 }}>📋</span>
            <span>Plans</span>
          </button>
        </div>

        {/* Recent Clients */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)" }}>Recent Clients</h3>
          <button onClick={() => navigate("/coach/clients")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--royal)", fontWeight:600, fontFamily:"var(--font-body)" }}>See all →</button>
        </div>

        {loading ? <Spinner /> : clients.length === 0 ? (
          <div style={{ textAlign:"center", padding:"32px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:36, opacity:0.4, marginBottom:8 }}>👥</div>
            <p style={{ fontWeight:600, color:"var(--text2)" }}>No clients yet.</p>
            <button onClick={() => navigate("/coach/clients/new")} style={{ marginTop:12, background:"var(--royal)", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontWeight:600, fontSize:14, fontFamily:"var(--font-body)" }}>
              Add your first client →
            </button>
          </div>
        ) : (
          <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:28 }}>
            {clients.slice(0,3).map((c,i) => (
              <Card key={c.id} onClick={() => navigate(`/coach/clients/${c.id}`)} className="fade-up" style={{ animationDelay:`${i*0.05}s` }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar initials={c.avatar_initials||c.full_name?.slice(0,2)||"?"} color={goalColor(c.goal)} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{c.full_name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{c.weight_kg} kg · {c.goal}</div>
                    <div style={{ marginTop:7 }}><ProgressBar value={c.progress_pct} color={goalColor(c.goal)} /></div>
                  </div>
                  <Badge label={`${c.progress_pct}%`} color={goalColor(c.goal)} />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <h3 style={{ margin:"0 0 12px", fontSize:15, fontWeight:700, color:"var(--text)", fontFamily:"var(--font-display)" }}>Recent Activity</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {ACTIVITY.map((a,i) => (
            <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 14px", background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", boxShadow:"var(--shadow-xs)" }}>
              <div style={{ width:34, height:34, borderRadius:10, background:a.color+"12", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{a.icon}</div>
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
