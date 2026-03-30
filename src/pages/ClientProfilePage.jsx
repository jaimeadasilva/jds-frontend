import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { clientsAPI, workoutsAPI, nutritionAPI, medicalAPI } from "../api/client";
import { Card, Avatar, Badge, Spinner, Btn, Input, Select, MacroRing, ProgressBar, TopBar, SectionHeader, goalColor, goalIcon, bmi, bmiCat, ibw } from "../components/UI";
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
  const navigate  = useNavigate();

  const [client,    setClient]    = useState(null);
  const [workout,   setWorkout]   = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [medical,   setMedical]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("workout");

  const load = async () => {
    try {
      const [c, w, n, m] = await Promise.all([
        clientsAPI.get(id, token),
        workoutsAPI.getPlan(id, token),
        nutritionAPI.getPlan(id, token),
        medicalAPI.list(id, token),
      ]);
      setClient(c); setWorkout(w); setNutrition(n); setMedical(m);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="page"><Spinner /></div>;
  if (!client)  return <div style={{ padding:40, textAlign:"center", color:"var(--muted)" }}>Client not found.</div>;

  const b   = bmi(client.weight_kg, client.height_cm);
  const cat = bmiCat(+b);

  const TABS = [
    { id:"workout",   label:"Workout",   icon:"🏋️" },
    { id:"nutrition", label:"Nutrition", icon:"🍎" },
    { id:"equipment", label:"Equipment", icon:"🔧" },
    { id:"medical",   label:"Medical",   icon:"🏥" },
  ];

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background:`linear-gradient(145deg, #1E40AF 0%, var(--royal) 100%)`, padding:"16px 20px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"#fff", opacity:0.05, top:-60, right:-40 }} />
        <button onClick={() => navigate("/coach/clients")}
          style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", borderRadius:10, padding:"8px 12px", cursor:"pointer", color:"#fff", fontSize:14, fontWeight:600, marginBottom:16, fontFamily:"var(--font-body)" }}>
          ← Clients
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, position:"relative", zIndex:1 }}>
          <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:"#fff" }}>
            {client.avatar_initials || client.full_name?.slice(0,2)}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ color:"#fff", margin:0, fontSize:22, fontWeight:900, letterSpacing:"-0.03em", fontFamily:"var(--font-display)" }}>{client.full_name}</h2>
            <div style={{ marginTop:4 }}>
              <Badge label={client.goal} color="rgba(255,255,255,0.9)" icon={goalIcon(client.goal)} />
            </div>
          </div>
        </div>
        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:20 }}>
          {[
            { label:"Weight", value:`${client.weight_kg}kg` },
            { label:"BMI",    value:b, sub:cat.label },
            { label:"IBW",    value:`${ibw(client.height_cm)}kg` },
            { label:"Height", value:`${client.height_cm}cm` },
          ].map(s => (
            <div key={s.label} style={{ background:"rgba(255,255,255,0.12)", borderRadius:12, padding:"10px 8px", textAlign:"center", border:"1px solid rgba(255,255,255,0.15)" }}>
              <div style={{ fontSize:14, fontWeight:900, color:"#fff" }}>{s.value}</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.65)", fontWeight:600, marginTop:2 }}>{s.label}</div>
              {s.sub && <div style={{ fontSize:9, fontWeight:700, color: +b>=25?"#FBD144":"#4ADE80" }}>{s.sub}</div>}
            </div>
          ))}
        </div>
        {/* Tab bar */}
        <div style={{ display:"flex", borderTop:"1px solid rgba(255,255,255,0.15)", marginLeft:-20, marginRight:-20, paddingLeft:20, overflowX:"auto" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ background:"none", border:"none", cursor:"pointer", padding:"12px 14px 10px", fontWeight: tab===t.id?800:500, fontSize:13, color: tab===t.id?"#fff":"rgba(255,255,255,0.5)", borderBottom: tab===t.id?"2.5px solid #fff":"2.5px solid transparent", whiteSpace:"nowrap", fontFamily:"var(--font-body)", transition:"all 0.15s", flexShrink:0 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {tab==="workout"   && <WorkoutTab   workout={workout}   clientId={id} token={token} reload={load} />}
        {tab==="nutrition" && <NutritionTab nutrition={nutrition} clientId={id} token={token} reload={load} />}
        {tab==="equipment" && <EquipmentTab clientId={id} token={token} equipment={client.equipment || []} reload={load} />}
        {tab==="medical"   && <MedicalTab   medical={medical}   clientId={id} token={token} reload={load} />}
      </div>

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────
function WorkoutTab({ workout, clientId, token, reload }) {
  const [expanded,  setExpanded]  = useState(0);
  const [addingDay, setAddingDay] = useState(false);
  const [addingEx,  setAddingEx]  = useState(null);
  const [newDay,    setNewDay]    = useState({ dayLabel:"", dayFocus:"" });
  const [newEx,     setNewEx]     = useState({ name:"", sets:"3", reps:"10", notes:"", videoUrl:"" });

  const createPlanThenDay = async () => {
    if (!newDay.dayLabel) return;
    let planId = workout?.id;
    if (!planId) {
      const plan = await workoutsAPI.createPlan(clientId, { name:"Training Plan" }, token);
      planId = plan.id;
    }
    await workoutsAPI.addDay(planId, newDay, token);
    setAddingDay(false); setNewDay({ dayLabel:"", dayFocus:"" }); reload();
  };

  const addExercise = async (dayId) => {
    if (!newEx.name) return;
    await workoutsAPI.addExercise(dayId, { ...newEx, sets: +newEx.sets }, token);
    setAddingEx(null); setNewEx({ name:"", sets:"3", reps:"10", notes:"", videoUrl:"" }); reload();
  };

  const removeDay = async (dayId) => {
    await workoutsAPI.removeDay(dayId, token); reload();
  };

  const removeEx = async (exId) => {
    await workoutsAPI.removeExercise(exId, token); reload();
  };

  const days = workout?.days || [];

  return (
    <div>
      {days.length === 0 && !addingDay && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
          <div style={{ fontSize:48 }}>🏋️</div>
          <p style={{ fontWeight:700, marginTop:10 }}>No workout plan yet</p>
        </div>
      )}
      {days.map((day, dayIdx) => (
        <Card key={day.id} style={{ marginBottom:12, overflow:"hidden", padding:0 }}>
          <button onClick={() => setExpanded(expanded===dayIdx?-1:dayIdx)}
            style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font-body)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
              <div style={{ width:32, height:32, borderRadius:10, background:"var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:"var(--royal)", flexShrink:0 }}>{dayIdx+1}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>{day.day_label}</div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>{day.day_focus}</div>
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, color:"var(--muted)" }}>{day.exercises?.length || 0} exercises</span>
              <button onClick={e=>{e.stopPropagation();removeDay(day.id)}} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted)" }}>🗑</button>
              <span style={{ color:"var(--royal)", fontSize:18 }}>{expanded===dayIdx?"⌃":"⌄"}</span>
            </div>
          </button>

          {expanded===dayIdx && (
            <div style={{ borderTop:"1px solid var(--line)", padding:"12px 18px" }}>
              {day.exercises?.map(ex => (
                <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 0", borderBottom:"1px solid var(--line)" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{ex.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                      <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> sets × <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span> reps
                      {ex.notes && <span style={{ fontStyle:"italic" }}> · {ex.notes}</span>}
                    </div>
                    {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, background:"var(--amber)", color:"#fff", borderRadius:8, padding:"4px 10px", fontSize:11, fontWeight:700, textDecoration:"none" }}>▶ Demo</a>}
                  </div>
                  <button onClick={() => removeEx(ex.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"var(--muted)" }}>✕</button>
                </div>
              ))}

              {addingEx===day.id ? (
                <div style={{ background:"var(--royal-pale)", borderRadius:14, padding:16, marginTop:10 }}>
                  <Input label="Exercise Name" value={newEx.name} onChange={e=>setNewEx(p=>({...p,name:e.target.value}))} />
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <Input label="Sets" value={newEx.sets} type="number" onChange={e=>setNewEx(p=>({...p,sets:e.target.value}))} />
                    <Input label="Reps" value={newEx.reps} onChange={e=>setNewEx(p=>({...p,reps:e.target.value}))} />
                  </div>
                  <Input label="Notes" value={newEx.notes} onChange={e=>setNewEx(p=>({...p,notes:e.target.value}))} />
                  <Input label="Video URL" value={newEx.videoUrl} onChange={e=>setNewEx(p=>({...p,videoUrl:e.target.value}))} />
                  <div style={{ display:"flex", gap:8 }}>
                    <Btn variant="primary" onClick={() => addExercise(day.id)} full>Add</Btn>
                    <Btn variant="secondary" onClick={() => setAddingEx(null)} full>Cancel</Btn>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingEx(day.id)}
                  style={{ width:"100%", background:"none", border:"1.5px dashed var(--line)", borderRadius:10, padding:10, cursor:"pointer", color:"var(--royal)", fontWeight:700, fontSize:13, marginTop:10, fontFamily:"var(--font-body)" }}>
                  + Add Exercise
                </button>
              )}
            </div>
          )}
        </Card>
      ))}

      {addingDay ? (
        <Card style={{ padding:18, marginTop:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Day" value={newDay.dayLabel} onChange={e=>setNewDay(p=>({...p,dayLabel:e.target.value}))} placeholder="Day 1" />
            <Input label="Focus" value={newDay.dayFocus} onChange={e=>setNewDay(p=>({...p,dayFocus:e.target.value}))} placeholder="Upper Body" />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="primary" onClick={createPlanThenDay} full>Add Day</Btn>
            <Btn variant="secondary" onClick={() => setAddingDay(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <Btn variant="secondary" onClick={() => setAddingDay(true)} full style={{ marginTop:8, borderRadius:14 }}>+ Add Training Day</Btn>
      )}
    </div>
  );
}

// ─── Nutrition Tab ────────────────────────────────────────────────────────────
function NutritionTab({ nutrition, clientId, token, reload }) {
  const [editTargets, setEditTargets] = useState(false);
  const [targets, setTargets] = useState({ calories: nutrition?.calories||2000, proteinG: nutrition?.protein_g||150, carbsG: nutrition?.carbs_g||200, fatsG: nutrition?.fats_g||65 });
  const [addingMeal, setAddingMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({ name:"", icon:"🍽️", foods:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });

  const saveTargets = async () => {
    if (nutrition) {
      await nutritionAPI.updatePlan(nutrition.id, targets, token);
    } else {
      await nutritionAPI.createPlan(clientId, targets, token);
    }
    setEditTargets(false); reload();
  };

  const addMeal = async () => {
    if (!newMeal.name) return;
    let planId = nutrition?.id;
    if (!planId) {
      const plan = await nutritionAPI.createPlan(clientId, targets, token);
      planId = plan.id;
    }
    await nutritionAPI.addMeal(planId, newMeal, token);
    setAddingMeal(false); setNewMeal({ name:"", icon:"🍽️", foods:"", calories:"", proteinG:"", carbsG:"", fatsG:"" }); reload();
  };

  const removeMeal = async (mealId) => {
    await nutritionAPI.removeMeal(mealId, token); reload();
  };

  const n = nutrition;

  return (
    <div>
      <Card style={{ padding:"20px 16px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:32, fontWeight:900, color:"var(--text)", letterSpacing:"-0.03em" }}>
              {n?.calories || "—"}<span style={{ fontSize:16, fontWeight:600, color:"var(--muted)" }}> kcal</span>
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Daily target</div>
          </div>
          <Btn variant="ghost" onClick={() => setEditTargets(!editTargets)} style={{ fontSize:13 }}>{editTargets?"Cancel":"Edit"}</Btn>
        </div>

        {editTargets ? (
          <div>
            {[["calories","Calories (kcal)"],["proteinG","Protein (g)"],["carbsG","Carbs (g)"],["fatsG","Fats (g)"]].map(([k,l]) => (
              <Input key={k} label={l} value={targets[k]} type="number" onChange={e=>setTargets(p=>({...p,[k]:e.target.value}))} />
            ))}
            <Btn variant="primary" onClick={saveTargets} full>Save Targets</Btn>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, justifyItems:"center" }}>
            <MacroRing label="Protein" value={n?.protein_g||0} color="var(--royal)" />
            <MacroRing label="Carbs"   value={n?.carbs_g||0}   color="var(--amber)" />
            <MacroRing label="Fats"    value={n?.fats_g||0}    color="var(--royal-pale2)" />
          </div>
        )}
      </Card>

      <SectionHeader title="Meals" />
      {n?.meals?.map(meal => (
        <Card key={meal.id} style={{ padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:38, height:38, borderRadius:11, background:"var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{meal.icon}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:14, color:"var(--text)" }}>{meal.name}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{meal.foods}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                  <Badge label={`${meal.calories} kcal`} color="var(--amber)" />
                  <Badge label={`P ${meal.protein_g}g`}  color="var(--royal)" />
                  <Badge label={`C ${meal.carbs_g}g`}    color="var(--royal)" />
                  <Badge label={`F ${meal.fats_g}g`}     color="var(--muted)" />
                </div>
              </div>
            </div>
            <button onClick={() => removeMeal(meal.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted)" }}>✕</button>
          </div>
        </Card>
      ))}

      {addingMeal ? (
        <Card style={{ padding:18, marginTop:8 }}>
          <div style={{ display:"grid", gridTemplateColumns:"3fr 1fr", gap:10 }}>
            <Input label="Meal Name" value={newMeal.name} onChange={e=>setNewMeal(p=>({...p,name:e.target.value}))} placeholder="Breakfast" />
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
            <Btn variant="primary" onClick={addMeal} full>Add Meal</Btn>
            <Btn variant="secondary" onClick={() => setAddingMeal(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <Btn variant="secondary" onClick={() => setAddingMeal(true)} full style={{ marginTop:8, borderRadius:14 }}>+ Add Meal</Btn>
      )}
    </div>
  );
}

// ─── Equipment Tab ────────────────────────────────────────────────────────────
function EquipmentTab({ clientId, token, equipment, reload }) {
  const [selected, setSelected] = useState(equipment);
  const ITEMS = ["Dumbbells","Barbell","Machines","Resistance Bands","Pull-Up Bar","Kettlebells","Cable Machine","Foam Roller","Home","Gym","Outdoor"];

  const toggle = (item) => setSelected(p => p.includes(item) ? p.filter(e=>e!==item) : [...p, item]);

  const save = async () => {
    await clientsAPI.setEquipment(clientId, selected, token); reload();
  };

  return (
    <div>
      <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16, lineHeight:1.6 }}>Tap to toggle available equipment.</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
        {ITEMS.map(item => {
          const active = selected.includes(item);
          return (
            <button key={item} onClick={() => toggle(item)}
              style={{ borderRadius:14, border:`2px solid ${active?"var(--royal)":"var(--line)"}`, background: active?"var(--royal-pale)":"var(--white)", color: active?"var(--royal)":"var(--text2)", padding:"12px", fontSize:13, fontWeight: active?800:500, cursor:"pointer", fontFamily:"var(--font-body)", transition:"all 0.15s", textAlign:"left" }}>
              {active?"✓ ":""}{item}
            </button>
          );
        })}
      </div>
      <Btn variant="primary" onClick={save} full style={{ borderRadius:14 }}>Save Equipment</Btn>
    </div>
  );
}

// ─── Medical Tab ──────────────────────────────────────────────────────────────
function MedicalTab({ medical, clientId, token, reload }) {
  const [adding, setAdding] = useState(false);
  const [form,   setForm]   = useState({ type:"note", text:"" });

  const add = async () => {
    if (!form.text) return;
    await medicalAPI.add(clientId, form, token);
    setAdding(false); setForm({ type:"note", text:"" }); reload();
  };

  const remove = async (id) => {
    await medicalAPI.remove(id, token); reload();
  };

  const META = {
    note:        { icon:"📋", color:"var(--royal)" },
    injury:      { icon:"🩹", color:"var(--amber)" },
    restriction: { icon:"⚠️", color:"var(--rose)" },
  };

  return (
    <div>
      {medical.length === 0 && !adding && (
        <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
          <div style={{ fontSize:48 }}>🏥</div>
          <p style={{ fontWeight:700, marginTop:10 }}>No medical records</p>
        </div>
      )}
      {medical.map(m => {
        const meta = META[m.type] || META.note;
        return (
          <Card key={m.id} style={{ padding:"16px 18px", marginBottom:10, borderLeft:`4px solid ${meta.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:18 }}>{meta.icon}</span>
                  <Badge label={m.type.charAt(0).toUpperCase()+m.type.slice(1)} color={meta.color} />
                </div>
                <p style={{ margin:0, fontSize:14, color:"var(--text)", lineHeight:1.6 }}>{m.text}</p>
              </div>
              <button onClick={() => remove(m.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted)", marginLeft:8 }}>✕</button>
            </div>
          </Card>
        );
      })}
      {adding ? (
        <Card style={{ padding:18, marginTop:8 }}>
          <Select label="Type" value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} options={["note","injury","restriction"]} />
          <div style={{ marginBottom:12 }}>
            <label style={{ display:"block", fontSize:11, color:"var(--muted)", fontWeight:700, marginBottom:5, letterSpacing:"0.05em", textTransform:"uppercase" }}>Details</label>
            <textarea value={form.text} onChange={e=>setForm(p=>({...p,text:e.target.value}))} rows={4}
              style={{ width:"100%", border:"1.5px solid var(--line)", borderRadius:11, padding:"10px 14px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", resize:"vertical", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor="var(--royal)"} onBlur={e=>e.target.style.borderColor="var(--line)"} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="primary" onClick={add} full>Save</Btn>
            <Btn variant="secondary" onClick={() => setAdding(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        <Btn variant="secondary" onClick={() => setAdding(true)} full style={{ marginTop:8, borderRadius:14 }}>+ Add Medical Record</Btn>
      )}
    </div>
  );
}
