import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { useHoldPress } from "../hooks/useHoldPress";
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

function ClientCard({ client, onNavigate, onDeleteRequest }) {
  const { progress, handlers } = useHoldPress(() => onDeleteRequest(client), 700);
  const b   = bmi(client.weight_kg, client.height_cm);
  const cat = bmiCat(+b);
  const isHolding = progress > 0;

  return (
    <div style={{ position:"relative" }}>
      <Card
        onClick={() => !isHolding && onNavigate(client.id)}
        style={{ overflow:"hidden", transition:"all 0.2s", transform:isHolding?"scale(0.985)":"scale(1)" }}>
        {/* Hold progress bar at top */}
        {isHolding && (
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"var(--line)", zIndex:10, overflow:"hidden" }}>
            <div style={{ width:`${progress}%`, height:"100%", background:"var(--rose)", transition:"width 0.05s linear" }} />
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:13 }}>
          <Avatar initials={client.avatar_initials||client.full_name?.slice(0,2)||"?"} size={48} color={goalColor(client.goal)} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.01em" }}>{client.full_name}</span>
              <Badge label={client.goal} color={goalColor(client.goal)} icon={goalIcon(client.goal)} />
            </div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
              {client.age}y · {client.height_cm}cm · {client.weight_kg}kg
            </div>
            <div style={{ marginTop:7 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                <span style={{ fontSize:10, color:"var(--muted)", fontWeight:600, letterSpacing:"0.04em" }}>PROGRESS</span>
                <span style={{ fontSize:10, fontWeight:700, color:goalColor(client.goal) }}>{client.progress_pct}%</span>
              </div>
              <ProgressBar value={client.progress_pct} color={goalColor(client.goal)} height={4} />
            </div>
          </div>

          {/* Hold-to-delete button */}
          <div {...handlers}
            style={{ width:38, height:38, borderRadius:10, background:isHolding?"var(--rose-pale)":"var(--bg2)", border:`1.5px solid ${isHolding?"#FECDD3":"var(--line)"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.15s", userSelect:"none", WebkitUserSelect:"none", touchAction:"none" }}
            title="Hold to delete">
            <span style={{ fontSize:16, opacity:isHolding?1:0.45, transition:"opacity 0.15s" }}>🗑</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:8, marginTop:11, paddingTop:10, borderTop:"1px solid var(--line)", alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:11, color:cat.c, fontWeight:700 }}>BMI {b} · {cat.label}</span>
          <span style={{ color:"var(--line2)" }}>·</span>
          <span style={{ fontSize:11, color:"var(--muted)" }}>IBW {ibw(client.height_cm)} kg</span>
          {client.medical?.length > 0 && (
            <><span style={{ color:"var(--line2)" }}>·</span>
            <span style={{ fontSize:11, color:"var(--rose)", fontWeight:600 }}>⚠️ Medical</span></>
          )}
        </div>

        {isHolding && (
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(254,241,242,0.7)", borderRadius:"var(--radius)", backdropFilter:"blur(2px)", pointerEvents:"none" }}>
            <div style={{ background:"var(--rose)", color:"#fff", borderRadius:10, padding:"7px 16px", fontSize:13, fontWeight:700 }}>
              Keep holding to delete…
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function ClientsListPage() {
  const { token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");
  const [deleting,   setDeleting]   = useState(null);
  const [delLoading, setDelLoading] = useState(false);

  const load = useCallback(() => {
    if (authLoading) return;
    if (!token) { setLoading(false); return; }
    clientsAPI.list(token)
      .then(data => setClients(Array.isArray(data) ? data : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, [token, authLoading]);

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
      await fetch(`https://jds-backend-production.up.railway.app/api/clients/${deleting.id}`, {
        method:"DELETE", headers:{ Authorization:`Bearer ${token}` }
      });
      setClients(p => p.filter(c => c.id !== deleting.id));
      toast.success(`${deleting.full_name} removed`);
      setDeleting(null);
    } catch { toast.error("Could not delete client"); }
    finally { setDelLoading(false); }
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
        <div style={{ position:"relative", marginBottom:12 }}>
          <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", fontSize:14, color:"var(--muted2)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
            style={{ width:"100%", border:"1.5px solid var(--line)", borderRadius:"var(--radius-sm)", padding:"10px 14px 10px 34px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", background:"var(--white)", boxSizing:"border-box" }}
            onFocus={e => { e.target.style.borderColor="var(--royal)"; e.target.style.boxShadow="0 0 0 3px var(--royal-glow)"; }}
            onBlur={e => { e.target.style.borderColor="var(--line)"; e.target.style.boxShadow="none"; }} />
        </div>

        <div style={{ display:"flex", gap:7, marginBottom:16, overflowX:"auto", paddingBottom:2 }}>
          {["All","Fat Loss","Muscle Gain","Maintenance"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ borderRadius:99, border:`1.5px solid ${filter===f?"var(--royal)":"var(--line)"}`, background:filter===f?"var(--royal)":"var(--white)", color:filter===f?"#fff":"var(--muted)", padding:"6px 14px", fontSize:12, fontWeight:filter===f?700:500, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"var(--font-body)", transition:"all 0.15s", flexShrink:0 }}>
              {f}
            </button>
          ))}
        </div>

        {!loading && filtered.length > 0 && (
          <p style={{ fontSize:11, color:"var(--muted2)", marginBottom:12, textAlign:"center" }}>
            💡 Hold the 🗑 button to delete
          </p>
        )}

        {(loading || authLoading) ? <Spinner /> : filtered.length === 0 ? (
          <Empty icon="👥" title={search ? "No clients found" : "No clients yet"}
            subtitle={search ? "Try a different search." : "Add your first client to get started."}
            action={!search ? () => navigate("/coach/clients/new") : undefined}
            actionLabel="+ Add Client" />
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
            {filtered.map(c => (
              <ClientCard key={c.id} client={c}
                onNavigate={id => navigate(`/coach/clients/${id}`)}
                onDeleteRequest={setDeleting} />
            ))}
          </div>
        )}
      </div>

      <ConfirmModal open={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete}
        loading={delLoading} title="Remove Client"
        message={`Are you sure you want to permanently remove ${deleting?.full_name}? All their data will be deleted. This cannot be undone.`}
        confirmLabel="Remove Client" />

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
