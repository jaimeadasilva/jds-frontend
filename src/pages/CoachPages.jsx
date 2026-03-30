// ─── Add Client Page ──────────────────────────────────────────────────────────
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI } from "../api/client";
import { Card, Btn, Input, Select, TopBar, ErrorMsg } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

export function AddClientPage() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email:"", fullName:"", age:"", heightCm:"", weightKg:"", goal:"Fat Loss" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.fullName) { setError("Name and email are required."); return; }
    setLoading(true); setError("");
    try {
      await clientsAPI.create({ ...form, age: +form.age, heightCm: +form.heightCm, weightKg: +form.weightKg }, token);
      navigate("/coach/clients");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <TopBar title="New Client" subtitle="Add to roster" back={() => navigate("/coach/clients")} />
      <div style={{ padding:"24px 20px" }}>
        <Card style={{ padding:22 }}>
          <ErrorMsg msg={error} />
          <Input label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="e.g. João Silva" required />
          <Input label="Email" value={form.email} onChange={set("email")} type="email" placeholder="client@email.com" required />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Age" value={form.age} type="number" onChange={set("age")} />
            <Input label="Height (cm)" value={form.heightCm} type="number" onChange={set("heightCm")} />
          </div>
          <Input label="Weight (kg)" value={form.weightKg} type="number" onChange={set("weightKg")} />
          <Select label="Goal" value={form.goal} onChange={set("goal")} options={["Fat Loss","Muscle Gain","Maintenance"]} />
          <p style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>Default password: <strong>Client123!</strong> — client can change it after login.</p>
          <Btn variant="primary" onClick={submit} disabled={loading} full style={{ padding:14, borderRadius:14, fontSize:15 }}>
            {loading ? "Creating…" : "Create Client Profile"}
          </Btn>
        </Card>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Plans Page ───────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { templatesAPI } from "../api/client";
import { SectionHeader, Empty } from "../components/UI";

export function PlansPage() {
  const { token } = useAuth();
  const [section,  setSection]  = useState("workout");
  const [wTemplates, setWTemplates] = useState([]);
  const [nTemplates, setNTemplates] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showNewW, setShowNewW] = useState(false);
  const [showNewN, setShowNewN] = useState(false);
  const [newW, setNewW] = useState({ name:"", days:"3", focus:"" });
  const [newN, setNewN] = useState({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });

  useEffect(() => {
    Promise.all([templatesAPI.workoutList(token), templatesAPI.nutritionList(token)])
      .then(([w, n]) => { setWTemplates(w); setNTemplates(n); })
      .finally(() => setLoading(false));
  }, [token]);

  const createW = async () => {
    const t = await templatesAPI.createWorkout({ name: newW.name, days: +newW.days, focus: newW.focus }, token);
    setWTemplates(p => [...p, t]); setShowNewW(false); setNewW({ name:"", days:"3", focus:"" });
  };

  const createN = async () => {
    const t = await templatesAPI.createNutrition({ name: newN.name, calories: +newN.calories, proteinG: +newN.proteinG, carbsG: +newN.carbsG, fatsG: +newN.fatsG }, token);
    setNTemplates(p => [...p, t]); setShowNewN(false); setNewN({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
  };

  return (
    <div className="page">
      <TopBar title="Plans" subtitle="Templates & Programs" />
      <div style={{ padding:"16px 20px" }}>
        {/* Toggle */}
        <div style={{ display:"flex", background:"var(--line)", borderRadius:14, padding:3, marginBottom:24 }}>
          {[["workout","🏋️ Workouts"],["nutrition","🍎 Nutrition"]].map(([id,label]) => (
            <button key={id} onClick={() => setSection(id)}
              style={{ flex:1, borderRadius:11, border:"none", cursor:"pointer", padding:10, background: section===id?"var(--white)":"transparent", boxShadow: section===id?"var(--shadow)":"none", fontWeight: section===id?800:500, fontSize:13, color: section===id?"var(--royal)":"var(--muted)", fontFamily:"var(--font-body)", transition:"all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        {section==="workout" && (
          <>
            <SectionHeader title={`${wTemplates.length} Workout Templates`} />
            {wTemplates.map(t => (
              <Card key={t.id} style={{ padding:"16px 18px", marginBottom:10 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>{t.name}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{t.days} days/week · {t.focus}</div>
              </Card>
            ))}
            {showNewW ? (
              <Card style={{ padding:18, marginTop:8 }}>
                <Input label="Template Name" value={newW.name} onChange={e=>setNewW(p=>({...p,name:e.target.value}))} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Days/week" value={newW.days} type="number" onChange={e=>setNewW(p=>({...p,days:e.target.value}))} />
                  <Input label="Focus" value={newW.focus} onChange={e=>setNewW(p=>({...p,focus:e.target.value}))} placeholder="Full Body" />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createW} full>Create</Btn>
                  <Btn variant="secondary" onClick={() => setShowNewW(false)} full>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Btn variant="primary" onClick={() => setShowNewW(true)} full style={{ marginTop:8, borderRadius:14 }}>+ New Workout Template</Btn>
            )}
          </>
        )}

        {section==="nutrition" && (
          <>
            <SectionHeader title={`${nTemplates.length} Nutrition Templates`} />
            {nTemplates.map(t => (
              <Card key={t.id} style={{ padding:"16px 18px", marginBottom:10 }}>
                <div style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>{t.name}</div>
                <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap" }}>
                  <span style={{ fontSize:12, background:"var(--amber-pale)", color:"var(--amber)", borderRadius:20, padding:"3px 10px", fontWeight:700 }}>{t.calories} kcal</span>
                  <span style={{ fontSize:12, background:"var(--royal-pale)", color:"var(--royal)", borderRadius:20, padding:"3px 10px", fontWeight:700 }}>{t.protein_g}g protein</span>
                </div>
              </Card>
            ))}
            {showNewN ? (
              <Card style={{ padding:18, marginTop:8 }}>
                <Input label="Template Name" value={newN.name} onChange={e=>setNewN(p=>({...p,name:e.target.value}))} />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Calories" value={newN.calories} type="number" onChange={e=>setNewN(p=>({...p,calories:e.target.value}))} />
                  <Input label="Protein (g)" value={newN.proteinG} type="number" onChange={e=>setNewN(p=>({...p,proteinG:e.target.value}))} />
                  <Input label="Carbs (g)" value={newN.carbsG} type="number" onChange={e=>setNewN(p=>({...p,carbsG:e.target.value}))} />
                  <Input label="Fats (g)" value={newN.fatsG} type="number" onChange={e=>setNewN(p=>({...p,fatsG:e.target.value}))} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createN} full>Create</Btn>
                  <Btn variant="secondary" onClick={() => setShowNewN(false)} full>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Btn variant="primary" onClick={() => setShowNewN(true)} full style={{ marginTop:8, borderRadius:14 }}>+ New Nutrition Template</Btn>
            )}
          </>
        )}
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Coach Profile Page ───────────────────────────────────────────────────────
export function CoachProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page">
      <TopBar title="Profile" subtitle="JDS Clinic" />
      <div style={{ padding:"0 20px 24px" }}>
        <div style={{ background:`linear-gradient(145deg, var(--royal-rich), var(--royal))`, borderRadius:20, padding:"28px 24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"#fff", opacity:0.05, top:-40, right:-30 }} />
          <div style={{ display:"flex", gap:16, alignItems:"center", position:"relative" }}>
            <div style={{ width:64, height:64, borderRadius:20, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🩺</div>
            <div>
              <div style={{ fontWeight:900, fontSize:20, color:"#fff" }}>{user?.full_name || "Dr. Da Silva"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>Coach · JDS Clinic</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {[
          { icon:"👥", label:"Manage Clients", action: () => navigate("/coach/clients") },
          { icon:"📋", label:"Plans & Templates", action: () => navigate("/coach/plans") },
          { icon:"💬", label:"Support" },
        ].map(item => (
          <div key={item.label} onClick={item.action} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", background:"var(--white)", borderRadius:14, border:"1px solid var(--line)", marginBottom:8, cursor: item.action?"pointer":"default" }}>
            <span style={{ fontSize:20 }}>{item.icon}</span>
            <span style={{ fontWeight:600, fontSize:15, color:"var(--text)", flex:1 }}>{item.label}</span>
            <span style={{ color:"var(--muted)", fontSize:18 }}>›</span>
          </div>
        ))}

        <Btn variant="danger" onClick={logout} full style={{ marginTop:20, borderRadius:14, padding:14 }}>Sign Out</Btn>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
