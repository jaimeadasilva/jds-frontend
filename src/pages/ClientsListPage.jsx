import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI } from "../api/client";
import { Card, Avatar, Badge, ProgressBar, Spinner, TopBar, goalColor, goalIcon, bmi, bmiCat, ibw } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

export default function ClientsListPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("All");

  useEffect(() => {
    clientsAPI.list(token).then(setClients).finally(() => setLoading(false));
  }, [token]);

  const filtered = clients.filter(c => {
    const matchSearch = c.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.goal === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="page">
      <TopBar title="Clients" subtitle="JDS Clinic"
        right={
          <button onClick={() => navigate("/coach/clients/new")}
            style={{ background:"var(--blue)", color:"#fff", border:"none", borderRadius:10, padding:"8px 14px", cursor:"pointer", fontWeight:700, fontSize:13, fontFamily:"var(--font)" }}>
            + Add
          </button>
        }
      />

      <div style={{ padding:"16px 20px" }}>
        {/* Search */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:16, color:"var(--muted)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
            style={{ width:"100%", border:"1.5px solid var(--line)", borderRadius:12, padding:"11px 14px 11px 38px", fontSize:14, outline:"none", fontFamily:"var(--font)", color:"var(--text)", background:"var(--white)", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="var(--blue)"}
            onBlur={e => e.target.style.borderColor="var(--line)"} />
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:8, marginBottom:20, overflowX:"auto", paddingBottom:4 }}>
          {["All","Fat Loss","Muscle Gain","Maintenance"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ borderRadius:20, border:`1.5px solid ${filter===f?"var(--blue)":"var(--line)"}`, background: filter===f?"var(--blue-pale)":"var(--white)", color: filter===f?"var(--blue)":"var(--muted)", padding:"7px 14px", fontSize:12, fontWeight: filter===f?800:500, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"var(--font)", transition:"all 0.15s", flexShrink:0 }}>{f}</button>
          ))}
        </div>

        {loading ? <Spinner /> : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(c => {
              const b   = bmi(c.weight_kg, c.height_cm);
              const cat = bmiCat(+b);
              return (
                <Card key={c.id} onClick={() => navigate(`/coach/clients/${c.id}`)} style={{ padding:"18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <Avatar initials={c.avatar_initials || c.full_name?.slice(0,2)} size={50} color={goalColor(c.goal)} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:800, fontSize:16, color:"var(--text)" }}>{c.full_name}</span>
                        <Badge label={c.goal} color={goalColor(c.goal)} icon={goalIcon(c.goal)} />
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                        {c.age}y · {c.height_cm}cm · {c.weight_kg}kg
                      </div>
                      <div style={{ marginTop:8 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:11, color:"var(--muted)" }}>Progress</span>
                          <span style={{ fontSize:11, fontWeight:700, color:goalColor(c.goal) }}>{c.progress_pct}%</span>
                        </div>
                        <ProgressBar value={c.progress_pct} color={goalColor(c.goal)} height={5} />
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6, marginTop:12, paddingTop:10, borderTop:"1px solid var(--line)", flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:cat.c, fontWeight:700 }}>BMI {b} · {cat.label}</span>
                    <span style={{ color:"var(--line)" }}>·</span>
                    <span style={{ fontSize:12, color:"var(--muted)" }}>IBW {ibw(c.height_cm)} kg</span>
                    {c.medical?.length > 0 && <><span style={{ color:"var(--line)" }}>·</span><span style={{ fontSize:12, color:"var(--red)" }}>⚠️ Medical</span></>}
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
                <div style={{ fontSize:40 }}>👥</div>
                <p style={{ fontWeight:700, marginTop:10 }}>No clients found</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
