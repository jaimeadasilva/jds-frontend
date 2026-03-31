import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { clientsAPI, templatesAPI } from "../api/client";
import { Card, Btn, Input, Select, Textarea, TopBar, ErrorMsg, SectionHeader, Empty, Badge, Spinner, PillTabs } from "../components/UI";
import { Modal, ConfirmModal } from "../components/Modal";
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
    if (!form.email?.trim() || !form.fullName?.trim()) { setError("Name and email are required."); return; }
    if (!form.email.includes("@")) { setError("Please enter a valid email address."); return; }
    setLoading(true); setError("");
    try {
      await clientsAPI.create({
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        age: form.age ? +form.age : undefined,
        heightCm: form.heightCm ? +form.heightCm : undefined,
        weightKg: form.weightKg ? +form.weightKg : undefined,
        goal: form.goal || "Fat Loss",
      }, token);
      toast.success(`${form.fullName.trim()} added successfully`);
      navigate("/coach/clients");
    } catch (err) {
      setError(err.message || "Failed to create client. The email may already be in use.");
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <TopBar title="New Client" subtitle="Add to roster" back={() => navigate("/coach/clients")} />
      <div style={{ padding:"24px 20px" }}>
        <Card>
          <ErrorMsg msg={error} />
          <Input label="Full Name" value={form.fullName} onChange={set("fullName")} placeholder="e.g. Sarah Al-Hassan" required autoFocus />
          <Input label="Email Address" value={form.email} onChange={set("email")} type="email" placeholder="client@email.com" required hint="They'll use this to log in" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Age" value={form.age} type="number" onChange={set("age")} placeholder="32" />
            <Input label="Height (cm)" value={form.heightCm} type="number" onChange={set("heightCm")} placeholder="165" />
          </div>
          <Input label="Weight (kg)" value={form.weightKg} type="number" onChange={set("weightKg")} placeholder="70" />
          <Select label="Goal" value={form.goal} onChange={set("goal")} options={["Fat Loss","Muscle Gain","Maintenance"]} />
          <div style={{ padding:"12px 0 4px", borderTop:"1px solid var(--line)", marginTop:6 }}>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14, lineHeight:1.6 }}>
              Default password: <strong>Client123!</strong><br />The client can change it after their first login.
            </p>
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
  const [section,    setSection]    = useState("workout");
  const [wTemplates, setWTemplates] = useState([]);
  const [nTemplates, setNTemplates] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [viewTemplate, setViewTemplate] = useState(null); // full workout template builder
  const [showNewN,   setShowNewN]   = useState(false);
  const [newN, setNewN] = useState({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
  const [saving, setSaving] = useState(false);

  const loadTemplates = () => {
    Promise.all([templatesAPI.workoutList(token), templatesAPI.nutritionList(token)])
      .then(([w,n]) => { setWTemplates(w); setNTemplates(n); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadTemplates(); }, [token]);

  const createN = async () => {
    if (!newN.name.trim()) return;
    setSaving(true);
    try {
      const t = await templatesAPI.createNutrition({ name:newN.name, calories:+newN.calories, proteinG:+newN.proteinG, carbsG:+newN.carbsG, fatsG:+newN.fatsG }, token);
      setNTemplates(p => [...p, t]); setShowNewN(false);
      setNewN({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
      toast.success("Nutrition template created");
    } catch { toast.error("Failed to create template"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <TopBar title="Plans" subtitle="Templates & Programs" />
      <div style={{ padding:"16px 20px" }}>
        <div style={{ marginBottom:22 }}>
          <PillTabs tabs={[{id:"workout",label:"🏋️  Workouts"},{id:"nutrition",label:"🍎  Nutrition"}]} active={section} onChange={setSection} />
        </div>

        {loading ? <Spinner /> : section === "workout" ? (
          <>
            <SectionHeader title={`${wTemplates.length} Workout Templates`} />
            {wTemplates.length === 0 && (
              <Empty icon="📋" title="No templates yet" subtitle="Create reusable workout templates with full exercise details." />
            )}
            {wTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{t.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>{t.days} days/week · {t.focus || "General"}</div>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <Btn variant="secondary" size="sm" onClick={() => setViewTemplate(t)}>View</Btn>
                    <Btn variant="ghost" size="sm">Assign</Btn>
                  </div>
                </div>
              </Card>
            ))}
            <Btn variant="primary" onClick={() => setViewTemplate({ id:"new", name:"", days:3, focus:"" })} full style={{ marginTop:8, borderRadius:12 }}>
              + New Workout Template
            </Btn>
          </>
        ) : (
          <>
            <SectionHeader title={`${nTemplates.length} Nutrition Templates`} />
            {nTemplates.length === 0 && !showNewN && (
              <Empty icon="🥗" title="No nutrition templates" subtitle="Create calorie and macro templates to assign to clients quickly." />
            )}
            {nTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:10 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{t.name}</div>
                    <div style={{ display:"flex", gap:6, marginTop:7, flexWrap:"wrap" }}>
                      <Badge label={`${t.calories} kcal`} color="var(--amber)" />
                      <Badge label={`P ${t.protein_g}g`} color="var(--royal)" />
                      <Badge label={`C ${t.carbs_g}g`} color="var(--emerald)" />
                      <Badge label={`F ${t.fats_g}g`} color="#8B5CF6" />
                    </div>
                  </div>
                  <Btn variant="ghost" size="sm">Assign</Btn>
                </div>
              </Card>
            ))}
            {showNewN ? (
              <Card style={{ marginTop:8 }}>
                <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Nutrition Template</p>
                <Input label="Template Name" value={newN.name} onChange={e=>setNewN(p=>({...p,name:e.target.value}))} placeholder="e.g. 1700 kcal Fat Loss" autoFocus />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Calories (kcal)" value={newN.calories} type="number" onChange={e=>setNewN(p=>({...p,calories:e.target.value}))} />
                  <Input label="Protein (g)" value={newN.proteinG} type="number" onChange={e=>setNewN(p=>({...p,proteinG:e.target.value}))} />
                  <Input label="Carbs (g)" value={newN.carbsG} type="number" onChange={e=>setNewN(p=>({...p,carbsG:e.target.value}))} />
                  <Input label="Fats (g)" value={newN.fatsG} type="number" onChange={e=>setNewN(p=>({...p,fatsG:e.target.value}))} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createN} loading={saving} full>Create Template</Btn>
                  <Btn variant="secondary" onClick={() => setShowNewN(false)} full>Cancel</Btn>
                </div>
              </Card>
            ) : (
              <Btn variant="primary" onClick={() => setShowNewN(true)} full style={{ marginTop:8, borderRadius:12 }}>
                + New Nutrition Template
              </Btn>
            )}
          </>
        )}
      </div>

      {/* Full-screen workout template builder */}
      {viewTemplate && (
        <WorkoutTemplateBuilder
          template={viewTemplate}
          token={token}
          toast={toast}
          onClose={() => { setViewTemplate(null); loadTemplates(); }}
        />
      )}

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Workout Template Builder (full-screen) ───────────────────────────────────
function WorkoutTemplateBuilder({ template, token, toast, onClose }) {
  const isNew = template.id === "new";
  const [name,     setName]    = useState(template.name || "");
  const [days,     setDays]    = useState(template.days || 3);
  const [focus,    setFocus]   = useState(template.focus || "");
  const [exercises, setExercises] = useState([]);
  const [addingEx, setAddingEx] = useState(false);
  const [editEx,   setEditEx]  = useState(null);
  const [saving,   setSaving]  = useState(false);

  // Exercise form state
  const blankEx = { name:"", sets:"3", reps:"10", tempo:"", notes:"", videoUrl:"" };
  const [exForm, setExForm] = useState(blankEx);
  const setE = k => e => setExForm(p => ({ ...p, [k]: e.target.value }));

  const saveTemplate = async () => {
    if (!name.trim()) { toast.error("Please add a template name"); return; }
    setSaving(true);
    try {
      await templatesAPI.createWorkout({ name, days:+days, focus }, token);
      toast.success("Template saved");
      onClose();
    } catch { toast.error("Failed to save template"); setSaving(false); }
  };

  const addEx = () => {
    if (!exForm.name.trim()) return;
    setExercises(p => [...p, { ...exForm, id: Date.now() }]);
    setExForm(blankEx); setAddingEx(false);
  };

  const removeEx = (id) => setExercises(p => p.filter(e => e.id !== id));

  const saveEditEx = () => {
    setExercises(p => p.map(e => e.id === editEx.id ? editEx : e));
    setEditEx(null);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:500, overflow:"auto", display:"flex", flexDirection:"column" }}>
      {/* Header */}
      <div style={{ background:"var(--white)", borderBottom:"1px solid var(--line)", padding:"14px 20px", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:10 }}>
        <button onClick={onClose} style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:9, padding:"7px 12px", cursor:"pointer", fontSize:13, fontWeight:600, color:"var(--text2)", fontFamily:"var(--font-body)" }}>← Back</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>Workout Template</div>
          <div style={{ fontWeight:700, fontSize:16, color:"var(--text)", fontFamily:"var(--font-display)" }}>{name || "New Template"}</div>
        </div>
        <Btn variant="primary" onClick={saveTemplate} loading={saving} size="sm">Save</Btn>
      </div>

      <div style={{ padding:"20px", maxWidth:500, margin:"0 auto", width:"100%" }}>
        {/* Meta */}
        <Card style={{ marginBottom:16 }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>Template Details</p>
          <Input label="Template Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fat Loss Circuit A" autoFocus />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Days per Week" value={days} type="number" onChange={e => setDays(e.target.value)} />
            <Input label="Focus / Type" value={focus} onChange={e => setFocus(e.target.value)} placeholder="Full Body" />
          </div>
        </Card>

        {/* Exercise list */}
        <SectionHeader title={`Exercises (${exercises.length})`} />

        {exercises.length === 0 && !addingEx && (
          <Empty icon="💪" title="No exercises yet" subtitle="Add exercises with sets, reps, tempo, and notes." />
        )}

        {exercises.map((ex, i) => (
          <Card key={ex.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{i+1}. {ex.name}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                  <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> sets × <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span> reps
                  {ex.tempo && <span> · Tempo: <strong>{ex.tempo}</strong></span>}
                  {ex.notes && <div style={{ fontStyle:"italic", marginTop:2 }}>{ex.notes}</div>}
                </div>
                {ex.videoUrl && <a href={ex.videoUrl} target="_blank" rel="noreferrer" style={{ fontSize:11, color:"var(--royal)", fontWeight:600, marginTop:4, display:"block" }}>▶ Demo link</a>}
              </div>
              <div style={{ display:"flex", gap:5 }}>
                <button onClick={() => setEditEx({ ...ex })} style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:7, padding:"5px 8px", cursor:"pointer", fontSize:12 }}>✏️</button>
                <button onClick={() => removeEx(ex.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"var(--muted2)", padding:4 }}
                  onMouseEnter={e => e.target.style.color="var(--rose)"} onMouseLeave={e => e.target.style.color="var(--muted2)"}>✕</button>
              </div>
            </div>
          </Card>
        ))}

        {addingEx ? (
          <Card style={{ marginTop:8 }}>
            <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>Add Exercise</p>
            <Input label="Exercise Name" value={exForm.name} onChange={setE("name")} placeholder="e.g. Barbell Bench Press" autoFocus />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <Input label="Sets" value={exForm.sets} type="number" onChange={setE("sets")} />
              <Input label="Reps" value={exForm.reps} onChange={setE("reps")} placeholder="8–12" />
              <Input label="Tempo" value={exForm.tempo} onChange={setE("tempo")} placeholder="3-1-1-0" hint="Ecc-Pause-Con-Top" />
            </div>
            <Textarea label="Notes / Coaching Cues" value={exForm.notes} onChange={setE("notes")} placeholder="e.g. Keep elbows at 45°, pause at chest" rows={2} />
            <Input label="Video Demo URL (optional)" value={exForm.videoUrl} onChange={setE("videoUrl")} placeholder="https://youtube.com/..." />
            <div style={{ display:"flex", gap:8 }}>
              <Btn variant="primary" onClick={addEx} full>Add Exercise</Btn>
              <Btn variant="secondary" onClick={() => { setAddingEx(false); setExForm(blankEx); }} full>Cancel</Btn>
            </div>
          </Card>
        ) : (
          <Btn variant="secondary" onClick={() => setAddingEx(true)} full style={{ marginTop:8, borderRadius:12 }}>
            + Add Exercise
          </Btn>
        )}
      </div>

      {/* Edit Exercise Modal */}
      <Modal open={!!editEx} onClose={() => setEditEx(null)} title="Edit Exercise">
        {editEx && (
          <div>
            <Input label="Exercise Name" value={editEx.name} onChange={e=>setEditEx(p=>({...p,name:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <Input label="Sets" value={editEx.sets} type="number" onChange={e=>setEditEx(p=>({...p,sets:e.target.value}))} />
              <Input label="Reps" value={editEx.reps} onChange={e=>setEditEx(p=>({...p,reps:e.target.value}))} />
              <Input label="Tempo" value={editEx.tempo||""} onChange={e=>setEditEx(p=>({...p,tempo:e.target.value}))} placeholder="3-1-1-0" />
            </div>
            <Textarea label="Notes / Coaching Cues" value={editEx.notes||""} onChange={e=>setEditEx(p=>({...p,notes:e.target.value}))} rows={2} />
            <Input label="Video URL" value={editEx.videoUrl||editEx.video_url||""} onChange={e=>setEditEx(p=>({...p,videoUrl:e.target.value}))} />
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={() => setEditEx(null)} full>Cancel</Btn>
              <Btn variant="primary" onClick={saveEditEx} full>Save Changes</Btn>
            </div>
          </div>
        )}
      </Modal>
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
    { icon:"🔔", label:"Notifications", sub:"Push notifications", action: () => {} },
    { icon:"🔒", label:"Privacy & Security", sub:"Password, data, account settings" },
    { icon:"💬", label:"Support",            sub:"Help centre and contact" },
  ];

  return (
    <div className="page">
      <TopBar title="Profile" subtitle="JDS Clinic" />
      <div style={{ padding:"0 20px 24px" }}>
        {/* Profile hero */}
        <div style={{ background:"linear-gradient(145deg, #1E40AF, #2563EB)", borderRadius:"var(--radius-lg)", padding:"28px 24px", marginTop:20, marginBottom:22, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:180, height:180, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:16, alignItems:"center", position:"relative" }}>
            <div style={{ width:64, height:64, borderRadius:20, background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.28)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🩺</div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>Dr. Da Silva</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>Coach · JDS Clinic</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.48)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {menuItems.map(item => (
            <div key={item.label} onClick={item.action}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", cursor:item.action?"pointer":"default", boxShadow:"var(--shadow-xs)", transition:"all 0.15s" }}
              onMouseEnter={e => item.action && (e.currentTarget.style.borderColor="var(--royal-pale2)", e.currentTarget.style.boxShadow="var(--shadow)")}
              onMouseLeave={e => item.action && (e.currentTarget.style.borderColor="var(--line)", e.currentTarget.style.boxShadow="var(--shadow-xs)")}>
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
          style={{ width:"100%", marginTop:20, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)" }}>
          Sign Out
        </button>
        <p style={{ textAlign:"center", fontSize:11, color:"var(--muted2)", marginTop:16 }}>JDS Fitness Platform · v2.0</p>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
