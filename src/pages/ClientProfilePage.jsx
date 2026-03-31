import { CoachWorkoutTab } from "./WorkoutTab";
import { WeightGraph } from "../components/WeightGraph";
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { clientsAPI, workoutsAPI, nutritionAPI, medicalAPI } from "../api/client";
import {
  Card, Avatar, Badge, Spinner, Btn, Input, Select, Textarea,
  MacroRing, ProgressBar, TopBar, SectionHeader, Empty, ErrorMsg, PillTabs,
  goalColor, goalIcon
} from "../components/UI";
import { Modal, ConfirmModal } from "../components/Modal";
import { kgToLbs, displayHeight, calcIBW, calcBMI, bmiCategory } from "../utils/units";
import BottomNav from "../components/BottomNav";

const COACH_TABS = [
  { id:"home",    label:"Home",    icon:"🏠", path:"/coach" },
  { id:"clients", label:"Clients", icon:"👥", path:"/coach/clients" },
  { id:"plans",   label:"Plans",   icon:"📋", path:"/coach/plans" },
  { id:"profile", label:"Profile", icon:"👤", path:"/coach/profile" },
];

export default function ClientProfilePage() {
  const { id } = useParams();
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate  = useNavigate();

  const [client,    setClient]    = useState(null);
  const [weightHistory, setWeightHistory] = useState([]);
  const [workoutLogs,   setWorkoutLogs]   = useState([]);
  const [workout,   setWorkout]   = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [medical,   setMedical]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("workout");
  const [editModal, setEditModal] = useState(false);

  const load = useCallback(async () => {
    const wh = await clientsAPI.weightHistory(id, token).catch(() => []);
      const wl = await workoutsAPI.getLogs(id, token).catch(() => []);
      setWorkoutLogs(Array.isArray(wl) ? wl : []);
    setWeightHistory(Array.isArray(wh) ? wh : []);
    try {
      const [c, w, n, m] = await Promise.all([
        clientsAPI.get(id, token),
        workoutsAPI.getPlan(id, token),
        nutritionAPI.getPlan(id, token),
        medicalAPI.list(id, token),
      ]);
      setClient(c); setWorkout(w); setNutrition(n);
      setMedical(Array.isArray(m) ? m : m?.data || []);
    } finally { setLoading(false); }
  }, [id, token]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="page" style={{ display:"flex", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!client)  return <Empty icon="❓" title="Client not found" subtitle="This client may have been removed." action={() => navigate("/coach/clients")} actionLabel="Back to Clients" />;

  const TABS = [
    { id:"workout",   label:"💪 Workout" },
    { id:"nutrition", label:"🍎 Nutrition" },
    { id:"progress",  label:"📈 Progress" },
    { id:"medical",   label:"🏥 Medical" },
    { id:"equipment", label:"🔧 Equipment" },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background:"linear-gradient(145deg, #1E40AF 0%, var(--royal) 65%, #3B82F6 100%)", padding:"16px 20px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", background:"#fff", opacity:0.05, top:-70, right:-50, pointerEvents:"none" }} />

        <div style={{ position:"relative", zIndex:1 }}>
          <button onClick={() => navigate("/coach/clients")}
            style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:10, padding:"7px 12px", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:600, marginBottom:16, fontFamily:"var(--font-body)" }}>
            ← Clients
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
            <div style={{ width:56, height:56, borderRadius:16, background:"rgba(255,255,255,0.18)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)" }}>
              {client.avatar_initials || client.full_name?.slice(0,2)}
            </div>
            <div style={{ flex:1 }}>
              <h2 style={{ color:"#fff", margin:0, fontSize:21, fontWeight:800, fontFamily:"var(--font-display)", letterSpacing:"-0.03em" }}>{client.full_name}</h2>
              <div style={{ marginTop:5, display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
                <Badge label={client.goal} color="rgba(255,255,255,0.9)" icon={goalIcon(client.goal)} />
                {medical.length > 0 && <Badge label="Medical" color="#FCA5A5" icon="⚠️" />}
              </div>
            </div>
            <button onClick={() => setEditModal(true)}
              style={{ background:"rgba(255,255,255,0.14)", border:"1px solid rgba(255,255,255,0.22)", borderRadius:10, padding:"8px 12px", cursor:"pointer", color:"#fff", fontSize:13, fontWeight:600, fontFamily:"var(--font-body)" }}>
              Edit
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:20 }}>
            {[
              { label:"Weight", value:`${kgToLbs(client.weight_kg)}`, unit:"lbs" },
              { label:"Height", value:displayHeight(client.height_cm), unit:"" },
              { label:"BMI",    value:calcBMI(client.weight_kg, client.height_cm), sub:bmiCategory(calcBMI(client.weight_kg,client.height_cm)).label, color: bmiCategory(calcBMI(client.weight_kg,client.height_cm)).c === "var(--emerald)" ? "#4ADE80" : bmiCategory(calcBMI(client.weight_kg,client.height_cm)).c === "var(--amber)" ? "#FCD34D" : "#FCA5A5" },
              { label:"IBW",    value:`${kgToLbs(calcIBW(client.height_cm))}`, unit:"lbs" },
            ].map(s => (
              <div key={s.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:11, padding:"10px 8px", textAlign:"center", border:"1px solid rgba(255,255,255,0.14)" }}>
                <div style={{ fontSize:14, fontWeight:800, color: s.color || "#fff", fontFamily:"var(--font-display)" }}>{s.value}</div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.6)", fontWeight:600, marginTop:2, textTransform:"uppercase", letterSpacing:"0.04em" }}>{s.label}</div>
                {s.unit && <div style={{ fontSize:9, color:"rgba(255,255,255,0.55)", marginTop:1 }}>{s.unit}</div>}{s.sub && <div style={{ fontSize:9, fontWeight:700, color: s.color || "#4ADE80", marginTop:1 }}>{s.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ position:"relative", zIndex:1, marginLeft:-20, marginRight:-20 }}>
          {/* Fade indicator showing more tabs to the right */}
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:40, background:"linear-gradient(to right, transparent, rgba(30,64,175,0.95))", pointerEvents:"none", zIndex:2 }} />
          <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.14)", paddingLeft:20, overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background:"none", border:"none", cursor:"pointer", padding:"12px 14px 10px", fontWeight: tab===t.id ? 700 : 500, fontSize:13, color: tab===t.id ? "#fff" : "rgba(255,255,255,0.5)", borderBottom: tab===t.id ? "2.5px solid #fff" : "2.5px solid transparent", whiteSpace:"nowrap", fontFamily:"var(--font-body)", transition:"all 0.15s", flexShrink:0 }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {tab==="workout"   && <CoachWorkoutTab workout={workout} clientId={id} token={token} reload={load} toast={toast} />}
        {tab==="nutrition" && <NutritionTab nutrition={nutrition} clientId={id} token={token} reload={load} toast={toast} />}
        {tab==="equipment" && <EquipmentTab clientId={id} token={token} equipment={client.equipment || []} reload={load} toast={toast} />}
        {tab==="medical"   && <MedicalTab   medical={medical}   clientId={id} token={token} reload={load} toast={toast} />}
        {tab==="progress"  && <ProgressTab  weightHistory={weightHistory} workoutLogs={workoutLogs} client={client} clientId={id} token={token} reload={load} toast={toast} />}
      </div>

      {/* Edit Client Modal */}
      <EditClientModal open={editModal} onClose={() => setEditModal(false)} client={client} token={token} onSaved={(updated) => { setClient(updated); toast.success("Profile updated"); setEditModal(false); }} />

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Edit Client Modal ────────────────────────────────────────────────────────
function EditClientModal({ open, onClose, client, token, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (client) setForm({ age: client.age||"", height_cm: client.height_cm||"", weight_kg: client.weight_kg||"", goal: client.goal||"Fat Loss", progress_pct: client.progress_pct||0 });
  }, [client]);

  const save = async () => {
    setSaving(true); setError("");
    try {
      const updated = await clientsAPI.update(client.id, { age:+form.age, heightCm:+form.height_cm, weightKg:+form.weight_kg, goal:form.goal, progress_pct:+form.progress_pct }, token);
      onSaved(updated);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <Modal open={open} onClose={onClose} title={`Edit ${client?.full_name?.split(" ")[0]}`}>
      <ErrorMsg msg={error} />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <Input label="Age" value={form.age||""} type="number" onChange={set("age")} />
        <Input label="Height (cm)" value={form.height_cm||""} type="number" onChange={set("height_cm")} />
      </div>
      <Input label="Weight (kg)" value={form.weight_kg||""} type="number" onChange={set("weight_kg")} />
      <Select label="Goal" value={form.goal||""} onChange={set("goal")} options={["Fat Loss","Muscle Gain","Maintenance"]} />
      <Input label="Progress %" value={form.progress_pct||""} type="number" onChange={set("progress_pct")} />
      <div style={{ display:"flex", gap:10, paddingTop:4 }}>
        <Btn variant="secondary" onClick={onClose} full>Cancel</Btn>
        <Btn variant="primary" onClick={save} loading={saving} full>Save Changes</Btn>
      </div>
    </Modal>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────

// ─── Nutrition Tab ────────────────────────────────────────────────────────────
function NutritionTab({ nutrition, clientId, token, reload, toast }) {
  const [editTargets, setEditTargets] = useState(false);
  const [targets, setTargets] = useState({ calories:nutrition?.calories||2000, proteinG:nutrition?.protein_g||150, carbsG:nutrition?.carbs_g||200, fatsG:nutrition?.fats_g||65 });
  const [addingMeal, setAddingMeal] = useState(false);
  const [editMeal,   setEditMeal]   = useState(null);
  const [newMeal, setNewMeal] = useState({ name:"", icon:"🍽️", foods:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
  const [saving, setSaving] = useState(false);
  const [confirmDelMeal, setConfirmDelMeal] = useState(null);

  useEffect(() => {
    if (nutrition) setTargets({ calories:nutrition.calories, proteinG:nutrition.protein_g, carbsG:nutrition.carbs_g, fatsG:nutrition.fats_g });
  }, [nutrition]);

  const saveTargets = async () => {
    setSaving(true);
    try {
      if (nutrition) await nutritionAPI.updatePlan(nutrition.id, targets, token);
      else await nutritionAPI.createPlan(clientId, targets, token);
      setEditTargets(false); toast.success("Targets saved"); reload();
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const addMeal = async () => {
    if (!newMeal.name.trim()) return;
    setSaving(true);
    try {
      let planId = nutrition?.id;
      if (!planId) { const p = await nutritionAPI.createPlan(clientId, targets, token); planId = p.id; }
      await nutritionAPI.addMeal(planId, newMeal, token);
      setAddingMeal(false); setNewMeal({ name:"", icon:"🍽️", foods:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
      toast.success("Meal added"); reload();
    } catch { toast.error("Failed to add meal"); }
    finally { setSaving(false); }
  };

  const saveMealEdit = async () => {
    setSaving(true);
    try {
      await nutritionAPI.updateMeal(editMeal.id, { name:editMeal.name, icon:editMeal.icon, foods:editMeal.foods, calories:+editMeal.calories, proteinG:+editMeal.protein_g, carbsG:+editMeal.carbs_g, fatsG:+editMeal.fats_g }, token);
      setEditMeal(null); toast.success("Meal updated"); reload();
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  const deleteMeal = async () => {
    try { await nutritionAPI.removeMeal(confirmDelMeal.id, token); toast.success("Meal removed"); reload(); }
    catch { toast.error("Failed to remove"); }
    finally { setConfirmDelMeal(null); }
  };

  const n = nutrition;
  const totalCal = n?.meals?.reduce((s,m) => s+m.calories, 0) || 0;

  return (
    <div>
      {/* Targets card */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:30, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
              {n?.calories || "—"}<span style={{ fontSize:15, fontWeight:500, color:"var(--muted)" }}> kcal</span>
            </div>
            <div style={{ fontSize:12, color: totalCal > (n?.calories||0) ? "var(--rose)" : "var(--emerald)", fontWeight:600, marginTop:2 }}>
              {totalCal} kcal planned {totalCal > (n?.calories||0) ? "⚠️ over target" : "✓"}
            </div>
          </div>
          <Btn variant="ghost" size="sm" onClick={() => setEditTargets(!editTargets)}>{editTargets ? "Cancel" : "Edit Targets"}</Btn>
        </div>

        {editTargets ? (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Input label="Calories" value={targets.calories} type="number" onChange={e=>setTargets(p=>({...p,calories:e.target.value}))} />
              <Input label="Protein (g)" value={targets.proteinG} type="number" onChange={e=>setTargets(p=>({...p,proteinG:e.target.value}))} />
              <Input label="Carbs (g)" value={targets.carbsG} type="number" onChange={e=>setTargets(p=>({...p,carbsG:e.target.value}))} />
              <Input label="Fats (g)" value={targets.fatsG} type="number" onChange={e=>setTargets(p=>({...p,fatsG:e.target.value}))} />
            </div>
            <Btn variant="primary" onClick={saveTargets} loading={saving} full>Save Targets</Btn>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, justifyItems:"center" }}>
            <MacroRing label="Protein" value={n?.protein_g||0} color="var(--royal)" />
            <MacroRing label="Carbs"   value={n?.carbs_g||0}   color="var(--amber)" />
            <MacroRing label="Fats"    value={n?.fats_g||0}    color="#8B5CF6" />
          </div>
        )}
      </Card>

      {/* Calorie bar */}
      {n && (
        <div style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", padding:"12px 16px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>Planned: {totalCal} kcal</span>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--royal)" }}>Target: {n.calories} kcal</span>
          </div>
          <ProgressBar value={(totalCal/n.calories)*100} color={totalCal > n.calories ? "var(--rose)" : "var(--royal)"} height={7} />
        </div>
      )}

      <SectionHeader title="Meals" />

      {(!n || n.meals?.length === 0) && !addingMeal && (
        <Empty icon="🍎" title="No meals added" subtitle="Build this client's daily meal plan." action={() => setAddingMeal(true)} actionLabel="+ Add Meal" />
      )}

      {n?.meals?.map(meal => (
        <Card key={meal.id} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:38, height:38, borderRadius:11, background:"var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{meal.icon}</div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{meal.name}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:2, lineHeight:1.5 }}>{meal.foods}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                  <Badge label={`${meal.calories} kcal`} color="var(--amber)" />
                  <Badge label={`P ${meal.protein_g}g`}  color="var(--royal)" />
                  <Badge label={`C ${meal.carbs_g}g`}    color="var(--emerald)" />
                  <Badge label={`F ${meal.fats_g}g`}     color="#8B5CF6" />
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:4, flexShrink:0 }}>
              <button onClick={() => setEditMeal({ ...meal })}
                style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:7, padding:"5px 8px", cursor:"pointer", fontSize:12, color:"var(--text2)" }}>✏️</button>
              <button onClick={() => setConfirmDelMeal(meal)}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"var(--muted2)", padding:4 }}
                onMouseEnter={e => e.target.style.color="var(--rose)"}
                onMouseLeave={e => e.target.style.color="var(--muted2)"}>✕</button>
            </div>
          </div>
        </Card>
      ))}

      {addingMeal ? (
        <Card style={{ marginTop:8 }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Meal</p>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr", gap:10 }}>
            <Input label="Meal Name" value={newMeal.name} onChange={e=>setNewMeal(p=>({...p,name:e.target.value}))} placeholder="Breakfast" autoFocus />
            <Input label="Icon" value={newMeal.icon} onChange={e=>setNewMeal(p=>({...p,icon:e.target.value}))} />
          </div>
          <Input label="Foods" value={newMeal.foods} onChange={e=>setNewMeal(p=>({...p,foods:e.target.value}))} placeholder="Eggs, oats, banana" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Calories" value={newMeal.calories} type="number" onChange={e=>setNewMeal(p=>({...p,calories:e.target.value}))} />
            <Input label="Protein (g)" value={newMeal.proteinG} type="number" onChange={e=>setNewMeal(p=>({...p,proteinG:e.target.value}))} />
            <Input label="Carbs (g)" value={newMeal.carbsG} type="number" onChange={e=>setNewMeal(p=>({...p,carbsG:e.target.value}))} />
            <Input label="Fats (g)" value={newMeal.fatsG} type="number" onChange={e=>setNewMeal(p=>({...p,fatsG:e.target.value}))} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="primary" onClick={addMeal} loading={saving} full>Add Meal</Btn>
            <Btn variant="secondary" onClick={() => setAddingMeal(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        n?.meals?.length > 0 && <Btn variant="secondary" onClick={() => setAddingMeal(true)} full style={{ marginTop:8, borderRadius:12 }}>+ Add Meal</Btn>
      )}

      {/* Edit meal modal */}
      <Modal open={!!editMeal} onClose={() => setEditMeal(null)} title="Edit Meal">
        {editMeal && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr", gap:10 }}>
              <Input label="Meal Name" value={editMeal.name} onChange={e=>setEditMeal(p=>({...p,name:e.target.value}))} />
              <Input label="Icon" value={editMeal.icon} onChange={e=>setEditMeal(p=>({...p,icon:e.target.value}))} />
            </div>
            <Input label="Foods" value={editMeal.foods||""} onChange={e=>setEditMeal(p=>({...p,foods:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Input label="Calories" value={editMeal.calories} type="number" onChange={e=>setEditMeal(p=>({...p,calories:e.target.value}))} />
              <Input label="Protein (g)" value={editMeal.protein_g} type="number" onChange={e=>setEditMeal(p=>({...p,protein_g:e.target.value}))} />
              <Input label="Carbs (g)" value={editMeal.carbs_g} type="number" onChange={e=>setEditMeal(p=>({...p,carbs_g:e.target.value}))} />
              <Input label="Fats (g)" value={editMeal.fats_g} type="number" onChange={e=>setEditMeal(p=>({...p,fats_g:e.target.value}))} />
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={() => setEditMeal(null)} full>Cancel</Btn>
              <Btn variant="primary" onClick={saveMealEdit} loading={saving} full>Save Changes</Btn>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmModal open={!!confirmDelMeal} onClose={() => setConfirmDelMeal(null)} onConfirm={deleteMeal} title="Remove Meal" message={`Remove "${confirmDelMeal?.name}" from the plan?`} confirmLabel="Remove Meal" />
    </div>
  );
}

// ─── Equipment Tab ────────────────────────────────────────────────────────────
function EquipmentTab({ clientId, token, equipment, reload, toast }) {
  const [selected, setSelected] = useState(equipment || []);
  const [saving, setSaving] = useState(false);
  const ITEMS = [
    { label:"Dumbbells", icon:"🏋️" },{ label:"Barbell", icon:"⚡" },
    { label:"Machines", icon:"⚙️" },{ label:"Resistance Bands", icon:"🔄" },
    { label:"Pull-Up Bar", icon:"🏅" },{ label:"Kettlebells", icon:"🔔" },
    { label:"Cable Machine", icon:"📡" },{ label:"Foam Roller", icon:"🧻" },
  ];
  const LOCATIONS = [{ label:"Home", icon:"🏠" }, { label:"Gym", icon:"🏟️" }, { label:"Outdoor", icon:"🌲" }];

  const toggle = (item) => setSelected(p => p.includes(item) ? p.filter(e=>e!==item) : [...p,item]);

  const save = async () => {
    setSaving(true);
    try { await clientsAPI.setEquipment(clientId, selected, token); toast.success("Equipment saved"); reload(); }
    catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--muted)", marginBottom:18, lineHeight:1.6 }}>Select available equipment to customise workout recommendations.</p>

      <SectionHeader title="Training Location" />
      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        {LOCATIONS.map(loc => {
          const active = selected.includes(loc.label);
          return (
            <button key={loc.label} onClick={() => toggle(loc.label)}
              style={{ flex:1, borderRadius:"var(--radius)", border:`2px solid ${active ? "var(--royal)" : "var(--line)"}`, background: active ? "var(--royal-pale)" : "var(--white)", color: active ? "var(--royal)" : "var(--muted)", padding:"14px 8px", fontSize:13, fontWeight: active ? 700 : 500, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.15s", display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:22 }}>{loc.icon}</span>
              <span style={{ fontSize:12 }}>{loc.label}</span>
            </button>
          );
        })}
      </div>

      <SectionHeader title="Equipment Available" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        {ITEMS.map(item => {
          const active = selected.includes(item.label);
          return (
            <button key={item.label} onClick={() => toggle(item.label)}
              style={{ borderRadius:"var(--radius)", border:`1.5px solid ${active ? "var(--royal)" : "var(--line)"}`, background: active ? "var(--royal-pale)" : "var(--white)", color: active ? "var(--royal)" : "var(--text2)", padding:"13px 12px", fontSize:13, fontWeight: active ? 700 : 500, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.15s", display:"flex", alignItems:"center", gap:8, textAlign:"left" }}>
              <span style={{ fontSize:20 }}>{item.icon}</span>
              {active && <span style={{ fontSize:11 }}>✓ </span>}{item.label}
            </button>
          );
        })}
      </div>
      <Btn variant="primary" onClick={save} loading={saving} full style={{ borderRadius:12 }}>Save Equipment</Btn>
    </div>
  );
}

// ─── Medical Tab ──────────────────────────────────────────────────────────────
function MedicalTab({ medical, clientId, token, reload, toast }) {
  const [adding, setAdding] = useState(false);
  const [editRec, setEditRec] = useState(null);
  const [form,    setForm]   = useState({ type:"note", text:"" });
  const [saving,  setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const add = async () => {
    if (!form.text.trim()) return;
    setSaving(true);
    try { await medicalAPI.add(clientId, form, token); setAdding(false); setForm({ type:"note", text:"" }); toast.success("Record added"); reload(); }
    catch { toast.error("Failed to add record"); }
    finally { setSaving(false); }
  };

  const deleteRec = async () => {
    try { await medicalAPI.remove(confirmDel.id, token); toast.success("Record removed"); reload(); }
    catch { toast.error("Failed to remove"); }
    finally { setConfirmDel(null); }
  };

  const META = {
    note:        { icon:"📋", color:"var(--royal)",   bg:"var(--royal-pale)" },
    injury:      { icon:"🩹", color:"var(--amber)",   bg:"var(--amber-pale)" },
    restriction: { icon:"⚠️", color:"var(--rose)",    bg:"var(--rose-pale)" },
  };

  return (
    <div>
      {medical.length === 0 && !adding && (
        <Empty icon="🏥" title="No medical records" subtitle="Add notes, injuries, or restrictions for this client." action={() => setAdding(true)} actionLabel="+ Add Record" />
      )}

      {medical.map(m => {
        const meta = META[m.type] || META.note;
        return (
          <Card key={m.id} style={{ marginBottom:10, borderLeft:`4px solid ${meta.color}`, paddingLeft:16 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>{meta.icon}</div>
                  <Badge label={m.type.charAt(0).toUpperCase()+m.type.slice(1)} color={meta.color} />
                </div>
                <p style={{ margin:0, fontSize:14, color:"var(--text2)", lineHeight:1.65 }}>{m.text}</p>
                <p style={{ fontSize:11, color:"var(--muted)", marginTop:6 }}>{new Date(m.created_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}</p>
              </div>
              <button onClick={() => setConfirmDel(m)}
                style={{ background:"none", border:"none", cursor:"pointer", fontSize:15, color:"var(--muted2)", marginLeft:8, padding:4, flexShrink:0 }}
                onMouseEnter={e => e.target.style.color="var(--rose)"}
                onMouseLeave={e => e.target.style.color="var(--muted2)"}>✕</button>
            </div>
          </Card>
        );
      })}

      {adding ? (
        <Card style={{ marginTop:8 }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Medical Record</p>
          <Select label="Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} options={["note","injury","restriction"]} />
          <Textarea label="Details" value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))} placeholder="Describe the note, injury, or restriction…" required rows={4} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="primary" onClick={add} loading={saving} full>Save Record</Btn>
            <Btn variant="secondary" onClick={() => setAdding(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        medical.length > 0 && <Btn variant="secondary" onClick={() => setAdding(true)} full style={{ marginTop:8, borderRadius:12 }}>+ Add Medical Record</Btn>
      )}

      <ConfirmModal open={!!confirmDel} onClose={() => setConfirmDel(null)} onConfirm={deleteRec} title="Remove Record" message={`Remove this ${confirmDel?.type}? This cannot be undone.`} confirmLabel="Remove" />
    </div>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────
function ProgressTab({ weightHistory, workoutLogs, client, clientId, token, reload, toast }) {
  const [logWeight,  setLogWeight]  = useState("");
  const [logNote,    setLogNote]    = useState("");
  const [saving,     setSaving]     = useState(false);

  const submitWeight = async () => {
    const lbs = parseFloat(logWeight);
    const kg = lbs ? Math.round(lbs / 2.20462 * 10) / 10 : null;
    if (!kg || lbs < 50 || lbs > 900) { toast.error("Enter a valid weight in lbs"); return; }
    setSaving(true);
    try {
      await clientsAPI.logWeight(clientId, kg, token);
      setLogWeight("");
      toast.success(`Weight logged: ${lbs} lbs`);
      reload();
    } catch { toast.error("Failed to log weight"); }
    finally { setSaving(false); }
  };

  const sorted = [...weightHistory].sort((a,b) => new Date(a.logged_at) - new Date(b.logged_at));
  const latest = sorted[sorted.length - 1];
  const first  = sorted[0];
  const change = latest && first && sorted.length > 1 ? (latest.weight_kg - first.weight_kg).toFixed(1) : null;

  return (
    <div>
      {/* Weight graph */}
      <Card style={{ marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Weight History</div>
            {latest && (
              <div style={{ fontSize:26, fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginTop:4 }}>
                {kgToLbs(latest.weight_kg)} <span style={{ fontSize:14, fontWeight:500, color:"var(--muted)" }}>lbs</span>
              </div>
            )}
          </div>
          {change !== null && (
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:15, fontWeight:800, color: +change < 0 ? "var(--emerald)" : +change > 0 ? "var(--rose)" : "var(--muted)", fontFamily:"var(--font-display)" }}>
                {+change > 0 ? "+" : ""}{kgToLbs(Math.abs(+change))} lbs
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>since start</div>
            </div>
          )}
        </div>
        <WeightGraph data={sorted} />
      </Card>

      {/* Log weight */}
      <Card style={{ marginBottom:16 }}>
        <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>Log New Weight</p>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, alignItems:"flex-end" }}>
          <Input label="Weight (lbs)" value={logWeight} onChange={e=>setLogWeight(e.target.value)} type="number" placeholder="e.g. 162" />
          <Btn variant="primary" onClick={submitWeight} loading={saving} style={{ marginBottom:13, borderRadius:"var(--radius-sm)" }}>Log</Btn>
        </div>
      </Card>

      {/* History list */}
      {sorted.length > 0 && (
        <>
          <SectionHeader title="Weight Log" />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[...sorted].reverse().slice(0,10).map((entry, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", background:"var(--white)", borderRadius:"var(--radius-sm)", border:"1px solid var(--line)" }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{kgToLbs(entry.weight_kg)} lbs</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
                    {new Date(entry.logged_at).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
                  </div>
                </div>
                {i > 0 && sorted.length > 1 && (() => {
                  const prev = [...sorted].reverse()[i+1];
                  if (!prev) return null;
                  const diff = (entry.weight_kg - prev?.weight_kg).toFixed(1);
                  return (
                    <span style={{ fontSize:12, fontWeight:700, color: +diff < 0 ? "var(--emerald)" : +diff > 0 ? "var(--rose)" : "var(--muted)" }}>
                      {+diff > 0 ? "+" : (Math.abs(+diff) > 0 ? "-" : "")}{kgToLbs(Math.abs(+diff))} lbs
                    </span>
                  );
                })()}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
