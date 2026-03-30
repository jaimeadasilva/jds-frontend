import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { clientsAPI, templatesAPI } from "../api/client";
import { Card, Btn, Input, Select, TopBar, ErrorMsg, SectionHeader, Empty, Badge, Spinner, PillTabs } from "../components/UI";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

// ─── Add Client Page ──────────────────────────────────────────────────────────
export function AddClientPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email:"", fullName:"", age:"", heightCm:"", weightKg:"", goal:"Fat Loss" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async () => {
    if (!form.email || !form.fullName) { setError("Name and email are required."); return; }
    setLoading(true); setError("");
    try {
      await clientsAPI.create({ ...form, age:+form.age, heightCm:+form.heightCm, weightKg:+form.weightKg }, token);
      toast.success(`${form.fullName} added successfully`);
      navigate("/coach/clients");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="page">
      <TopBar title="New Client" subtitle="Add to roster" back={() => navigate("/coach/clients")} />
      <div style={{ padding:"24px 20px" }}>
        <Card>
          <ErrorMsg msg={error} />
          <Input label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="e.g. Sarah Al-Hassan" required autoFocus />
          <Input label="Email" value={form.email} onChange={set("email")} type="email" placeholder="client@email.com" required />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Age" value={form.age} type="number" onChange={set("age")} placeholder="32" />
            <Input label="Height (cm)" value={form.heightCm} type="number" onChange={set("heightCm")} placeholder="165" />
          </div>
          <Input label="Weight (kg)" value={form.weightKg} type="number" onChange={set("weightKg")} placeholder="70" />
          <Select label="Goal" value={form.goal} onChange={set("goal")} options={["Fat Loss","Muscle Gain","Maintenance"]} />
          <div style={{ padding:"10px 0 6px", borderTop:"1px solid var(--line)", marginTop:4 }}>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>Default login password: <strong>Client123!</strong> — client can change it after first login.</p>
            <Btn variant="primary" onClick={submit} loading={loading} full size="lg" style={{ borderRadius:12 }}>
              Create Client Profile
            </Btn>
          </div>
        </Card>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Plans Page ───────────────────────────────────────────────────────────────
export function PlansPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [section,     setSection]     = useState("workout");
  const [wTemplates,  setWTemplates]  = useState([]);
  const [nTemplates,  setNTemplates]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showNewW,    setShowNewW]    = useState(false);
  const [showNewN,    setShowNewN]    = useState(false);
  const [newW, setNewW] = useState({ name:"", days:"3", focus:"" });
  const [newN, setNewN] = useState({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([templatesAPI.workoutList(token), templatesAPI.nutritionList(token)])
      .then(([w,n]) => { setWTemplates(w); setNTemplates(n); })
      .finally(() => setLoading(false));
  }, [token]);

  const createW = async () => {
    if (!newW.name.trim()) return;
    setSaving(true);
    try {
      const t = await templatesAPI.createWorkout({ name:newW.name, days:+newW.days, focus:newW.focus }, token);
      setWTemplates(p => [...p,t]); setShowNewW(false); setNewW({ name:"", days:"3", focus:"" });
      toast.success("Template created");
    } catch { toast.error("Failed to create"); }
    finally { setSaving(false); }
  };

  const createN = async () => {
    if (!newN.name.trim()) return;
    setSaving(true);
    try {
      const t = await templatesAPI.createNutrition({ name:newN.name, calories:+newN.calories, proteinG:+newN.proteinG, carbsG:+newN.carbsG, fatsG:+newN.fatsG }, token);
      setNTemplates(p => [...p,t]); setShowNewN(false); setNewN({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
      toast.success("Template created");
    } catch { toast.error("Failed to create"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <TopBar title="Plans" subtitle="Templates & Programs" />
      <div style={{ padding:"16px 20px" }}>
        <div style={{ marginBottom:22 }}>
          <PillTabs tabs={[{id:"workout",label:"🏋️  Workouts"},{id:"nutrition",label:"🍎  Nutrition"}]} active={section} onChange={setSection} />
        </div>

        {loading ? <Spinner /> : section==="workout" ? (
          <>
            <SectionHeader title={`${wTemplates.length} Workout Templates`} />
            {wTemplates.length === 0 && !showNewW && (
              <Empty icon="📋" title="No templates yet" subtitle="Create reusable workout templates to assign to clients quickly." />
            )}
            {wTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{t.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{t.days} days/week · {t.focus||"General"}</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn variant="secondary" size="sm">Assign</Btn>
                    <Btn variant="ghost" size="sm">Copy</Btn>
                  </div>
                </div>
              </Card>
            ))}
            {showNewW ? (
              <Card style={{ marginTop:8 }}>
                <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Workout Template</p>
                <Input label="Template Name" value={newW.name} onChange={e=>setNewW(p=>({...p,name:e.target.value}))} autoFocus />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Days/week" value={newW.days} type="number" onChange={e=>setNewW(p=>({...p,days:e.target.value}))} />
                  <Input label="Focus" value={newW.focus} onChange={e=>setNewW(p=>({...p,focus:e.target.value}))} placeholder="Full Body" />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createW} loading={saving} full>Create</Btn>
                  <Btn variant="secondary" onClick={() => setShowNewW(false)} full>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Btn variant="primary" onClick={() => setShowNewW(true)} full style={{ marginTop:8, borderRadius:12 }}>+ New Workout Template</Btn>
            )}
          </>
        ) : (
          <>
            <SectionHeader title={`${nTemplates.length} Nutrition Templates`} />
            {nTemplates.length === 0 && !showNewN && (
              <Empty icon="🥗" title="No nutrition templates" subtitle="Create calorie and macro templates to assign to clients." />
            )}
            {nTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{t.name}</div>
                    <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                      <Badge label={`${t.calories} kcal`} color="var(--amber)" />
                      <Badge label={`${t.protein_g}g protein`} color="var(--royal)" />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn variant="secondary" size="sm">Assign</Btn>
                    <Btn variant="ghost" size="sm">Copy</Btn>
                  </div>
                </div>
              </Card>
            ))}
            {showNewN ? (
              <Card style={{ marginTop:8 }}>
                <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Nutrition Template</p>
                <Input label="Template Name" value={newN.name} onChange={e=>setNewN(p=>({...p,name:e.target.value}))} autoFocus />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Calories" value={newN.calories} type="number" onChange={e=>setNewN(p=>({...p,calories:e.target.value}))} />
                  <Input label="Protein (g)" value={newN.proteinG} type="number" onChange={e=>setNewN(p=>({...p,proteinG:e.target.value}))} />
                  <Input label="Carbs (g)" value={newN.carbsG} type="number" onChange={e=>setNewN(p=>({...p,carbsG:e.target.value}))} />
                  <Input label="Fats (g)" value={newN.fatsG} type="number" onChange={e=>setNewN(p=>({...p,fatsG:e.target.value}))} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createN} loading={saving} full>Create</Btn>
                  <Btn variant="secondary" onClick={() => setShowNewN(false)} full>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Btn variant="primary" onClick={() => setShowNewN(true)} full style={{ marginTop:8, borderRadius:12 }}>+ New Nutrition Template</Btn>
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

  const menuItems = [
    { icon:"👥", label:"Manage Clients",     sub:"View and edit all client profiles",  action: () => navigate("/coach/clients") },
    { icon:"📋", label:"Plans & Templates",  sub:"Workout and nutrition templates",     action: () => navigate("/coach/plans") },
    { icon:"🔔", label:"Notifications",      sub:"Manage alerts and reminders" },
    { icon:"🔒", label:"Privacy & Security", sub:"Password, data, account settings" },
    { icon:"💬", label:"Support",            sub:"Help centre and contact" },
  ];

  return (
    <div className="page">
      <TopBar title="Profile" subtitle="JDS Clinic" />
      <div style={{ padding:"0 20px 24px" }}>
        {/* Profile hero */}
        <div style={{ background:"linear-gradient(145deg, #1E40AF, var(--royal))", borderRadius:"var(--radius-lg)", padding:"28px 24px", marginTop:20, marginBottom:22, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"#fff", opacity:0.05, top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:16, alignItems:"center", position:"relative" }}>
            <div style={{ width:64, height:64, borderRadius:20, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🩺</div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{user?.full_name || "Dr. Da Silva"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>Coach · JDS Clinic</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Menu list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {menuItems.map(item => (
            <div key={item.label} onClick={item.action}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", cursor: item.action?"pointer":"default", transition:"all 0.15s", boxShadow:"var(--shadow-xs)" }}
              onMouseEnter={e => item.action && (e.currentTarget.style.borderColor="var(--royal-pale2)")}
              onMouseLeave={e => item.action && (e.currentTarget.style.borderColor="var(--line)")}>
              <div style={{ width:36, height:36, borderRadius:10, background:"var(--bg2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{item.label}</div>
                {item.sub && <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>{item.sub}</div>}
              </div>
              {item.action && <span style={{ color:"var(--muted2)", fontSize:18 }}>›</span>}
            </div>
          ))}
        </div>

        <button onClick={logout}
          style={{ width:"100%", marginTop:20, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)", transition:"all 0.15s" }}>
          Sign Out
        </button>

        <p style={{ textAlign:"center", fontSize:11, color:"var(--muted2)", marginTop:20 }}>JDS Fitness Platform · v2.0</p>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
