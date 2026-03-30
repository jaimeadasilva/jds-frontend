import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { clientsAPI } from "../api/client";
import { Card, Avatar, Badge, ProgressBar, Spinner, TopBar, goalColor, goalIcon, bmi, bmiCat, ibw, Empty } from "../components/UI";
import { ConfirmModal } from "../components/Modal";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

export default function ClientsListPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [clients,  setClients]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [deleting, setDeleting] = useState(null); // client to delete
  const [delLoading, setDelLoading] = useState(false);

  const load = useCallback(() => {
    clientsAPI.list(token).then(setClients).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter(c => {
    const matchSearch = c.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.goal === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async () => {
    if (!deleting) return;
    setDelLoading(true);
    try {
      await clientsAPI.delete?.(deleting.id, token) || 
        fetch(`https://jds-backend-production.up.railway.app/api/clients/${deleting.id}`, { method:"DELETE", headers:{ Authorization:`Bearer ${token}` } });
      setClients(p => p.filter(c => c.id !== deleting.id));
      toast.success(`${deleting.full_name} removed`);
      setDeleting(null);
    } catch {
      toast.error("Could not delete client");
    } finally { setDelLoading(false); }
  };

  return (
    <div className="page">
      <TopBar title="Clients" subtitle="JDS Clinic"
        right={
          <button onClick={() => navigate("/coach/clients/new")}
            style={{ background:"var(--royal)", color:"#fff", border:"none", borderRadius:9, padding:"7px 14px", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"var(--font-body)", boxShadow:"var(--shadow-blue)" }}>
            + Add
          </button>
        }
      />

      <div style={{ padding:"16px 20px" }}>
        {/* Search */}
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--muted2)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            style={{ width:"100%", border:"1.5px solid var(--line)", borderRadius:"var(--radius-sm)", padding:"10px 14px 10px 34px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", background:"var(--white)", boxSizing:"border-box", transition:"all 0.15s" }}
            onFocus={e => { e.target.style.borderColor="var(--royal)"; e.target.style.boxShadow="0 0 0 3px var(--royal-glow)"; }}
            onBlur={e => { e.target.style.borderColor="var(--line)"; e.target.style.boxShadow="none"; }} />
        </div>

        {/* Filter pills */}
        <div style={{ display:"flex", gap:7, marginBottom:20, overflowX:"auto", paddingBottom:2 }}>
          {["All","Fat Loss","Muscle Gain","Maintenance"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ borderRadius:99, border:`1.5px solid ${filter===f ? "var(--royal)" : "var(--line)"}`, background: filter===f ? "var(--royal)" : "var(--white)", color: filter===f ? "#fff" : "var(--muted)", padding:"6px 14px", fontSize:12, fontWeight: filter===f ? 700 : 500, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"var(--font-body)", transition:"all 0.15s", flexShrink:0 }}>
              {f}
            </button>
          ))}
        </div>

        {/* Count */}
        {!loading && (
          <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14, fontWeight:500 }}>
            {filtered.length} {filtered.length === 1 ? "client" : "clients"}
            {filter !== "All" && ` · ${filter}`}
          </p>
        )}

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="👥" title="No clients yet" subtitle="Add your first client to get started." action={() => navigate("/coach/clients/new")} actionLabel="+ Add Client" />
        ) : (
          <div className="stagger" style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {filtered.map((c, i) => {
              const b   = bmi(c.weight_kg, c.height_cm);
              const cat = bmiCat(+b);
              return (
                <Card key={c.id} onClick={() => navigate(`/coach/clients/${c.id}`)} className="fade-up" style={{ animationDelay:`${i*0.04}s` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:13 }}>
                    <Avatar initials={c.avatar_initials || c.full_name?.slice(0,2)} size={48} color={goalColor(c.goal)} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                        <span style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>{c.full_name}</span>
                        <Badge label={c.goal} color={goalColor(c.goal)} icon={goalIcon(c.goal)} />
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                        {c.age}y · {c.height_cm}cm · {c.weight_kg}kg
                      </div>
                      <div style={{ marginTop:7 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:10, color:"var(--muted)", fontWeight:600, letterSpacing:"0.04em" }}>PROGRESS</span>
                          <span style={{ fontSize:10, fontWeight:700, color:goalColor(c.goal) }}>{c.progress_pct}%</span>
                        </div>
                        <ProgressBar value={c.progress_pct} color={goalColor(c.goal)} height={4} />
                      </div>
                    </div>
                    {/* Quick delete */}
                    <button onClick={e => { e.stopPropagation(); setDeleting(c); }}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted2)", padding:"4px", borderRadius:6, flexShrink:0, transition:"color 0.15s" }}
                      onMouseEnter={e => e.target.style.color="var(--rose)"}
                      onMouseLeave={e => e.target.style.color="var(--muted2)"}>🗑</button>
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:11, paddingTop:10, borderTop:"1px solid var(--line)", alignItems:"center" }}>
                    <span style={{ fontSize:11, color:cat.c, fontWeight:700 }}>BMI {b} · {cat.label}</span>
                    <span style={{ color:"var(--line2)" }}>·</span>
                    <span style={{ fontSize:11, color:"var(--muted)" }}>IBW {ibw(c.height_cm)} kg</span>
                    {c.medical?.length > 0 && <><span style={{ color:"var(--line2)" }}>·</span><span style={{ fontSize:11, color:"var(--rose)", fontWeight:600 }}>⚠️ Medical</span></>}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={delLoading}
        title="Remove Client"
        message={`Are you sure you want to remove ${deleting?.full_name}? This will permanently delete all their data.`}
        confirmLabel="Remove Client"
      />

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
