import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { workoutsAPI, nutritionAPI, medicalAPI, clientsAPI, mealLogAPI } from "../api/client";
import {
  Card, Badge, Spinner, MacroRing, ProgressBar, TopBar,
  Empty, CompletionBanner, Btn, Input, Textarea, SectionHeader
} from "../components/UI";
import { WeightGraph } from "../components/WeightGraph";
import { ClientWorkoutTab } from "./WorkoutTab";
import { Modal } from "../components/Modal";
import { kgToLbs, displayHeight, calcBMI, calcIBW, bmiCategory, lbsToKg } from "../utils/units";
import BottomNav from "../components/BottomNav";

const CLIENT_TABS = [
  { id:"home",      label:"Home",      icon:"🏠", path:"/client" },
  { id:"workouts",  label:"Workouts",  icon:"🏋️", path:"/client/workouts" },
  { id:"nutrition", label:"Nutrition", icon:"🍎", path:"/client/nutrition" },
  { id:"medical",   label:"Medical",   icon:"🏥", path:"/client/medical" },
  { id:"profile",   label:"Profile",   icon:"👤", path:"/client/profile" },
];

// ─── Client Home ──────────────────────────────────────────────────────────────
export function ClientHome() {
  const navigate = useNavigate();
  const { user, token, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [workout,    setWorkout]    = useState(null);
  const [nutrition,  setNutrition]  = useState(null);
  const [logs,       setLogs]       = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [logWeight,  setLogWeight]  = useState("");
  const [logSaving,  setLogSaving]  = useState(false);

  useEffect(() => {
    if (authLoading || !user?.id || !token || dataLoaded) return;
    Promise.all([
      workoutsAPI.getPlan(user.id, token).catch(() => null),
      nutritionAPI.getPlan(user.id, token).catch(() => null),
      workoutsAPI.getLogs(user.id, token).catch(() => []),
    ]).then(([w, n, l]) => {
      setWorkout(w); setNutrition(n);
      setLogs(Array.isArray(l) ? l : []);
      setDataLoaded(true);
    });
  }, [user?.id, token, authLoading, dataLoaded]);

  const submitWeight = async () => {
    const lbs = parseFloat(logWeight);
    if (!lbs || lbs < 50 || lbs > 900) { toast.error("Enter a valid weight in lbs"); return; }
    setLogSaving(true);
    try {
      await clientsAPI.logWeight(user.id, lbsToKg(lbs), token);
      setLogWeight("");
      toast.success(`Weight logged: ${lbs} lbs`);
      await refreshUser();
    } catch { toast.error("Failed to log weight"); }
    finally { setLogSaving(false); }
  };

  const today     = workout?.days?.[0];
  const todayStr  = new Date().toISOString().slice(0, 10);
  const todayLogs = logs.filter(l => l.logged_at?.slice(0, 10) === todayStr);
  const doneCnt   = today?.exercises?.filter(e => todayLogs.some(l => l.exercise_id === e.id && l.completed)).length || 0;
  const totalCnt  = today?.exercises?.length || 0;
  const allDone   = totalCnt > 0 && doneCnt === totalCnt;
  const firstName = user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "there";
  const n         = nutrition;

  const weightKg = user?.weight_kg;
  const heightCm = user?.height_cm;
  const bmiVal   = calcBMI(weightKg, heightCm);
  const cat      = bmiCategory(bmiVal);

  const stats = [
    { label:"Weight", value: weightKg ? `${kgToLbs(weightKg)}` : "—", unit:"lbs",    color:"var(--royal)" },
    { label:"Height", value: displayHeight(heightCm) || "—",           unit:"",       color:"var(--text2)" },
    { label:"BMI",    value: bmiVal,                                    unit:cat.label, color:cat.c },
    { label:"IBW",    value: calcIBW(heightCm) ? `${kgToLbs(calcIBW(heightCm))}` : "—", unit:"lbs", color:"var(--emerald)" },
  ];

  return (
    <div className="page">
      <div style={{ background:"linear-gradient(150deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)", padding:"52px 24px 24px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", top:-120, right:-80, pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:"0 0 3px" }}>Welcome back 👋</p>
          <h1 style={{ color:"#fff", margin:0, fontSize:27, fontWeight:800, letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>{firstName}</h1>
        </div>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {/* Stats — always visible immediately */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:14 }}>
          {stats.map(s => (
            <Card key={s.label} style={{ padding:"11px 8px", textAlign:"center" }}>
              <div style={{ fontSize:15, fontWeight:800, color:s.color, fontFamily:"var(--font-display)", letterSpacing:"-0.02em", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:9, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:3 }}>{s.label}</div>
              {s.unit && <div style={{ fontSize:9, color:s.color, fontWeight:600, marginTop:1, opacity:0.8 }}>{s.unit}</div>}
            </Card>
          ))}
        </div>

        {/* Quick weight log */}
        <Card style={{ marginBottom:14, padding:"12px 14px" }}>
          <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:7 }}>Log Weight</div>
          <div style={{ display:"flex", gap:8 }}>
            <input value={logWeight} onChange={e => setLogWeight(e.target.value)} type="number" placeholder="lbs (e.g. 162)"
              style={{ flex:1, border:"1.5px solid var(--line)", borderRadius:"var(--radius-sm)", padding:"9px 12px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", background:"var(--bg)", transition:"all 0.15s", boxSizing:"border-box" }}
              onFocus={e => { e.target.style.borderColor="var(--royal)"; e.target.style.boxShadow="0 0 0 3px var(--royal-glow)"; }}
              onBlur={e => { e.target.style.borderColor="var(--line)"; e.target.style.boxShadow="none"; }}
              onKeyDown={e => e.key === "Enter" && submitWeight()} />
            <Btn variant="primary" onClick={submitWeight} loading={logSaving} size="sm">Log</Btn>
          </div>
        </Card>

        {/* Workout + Nutrition cards */}
        {!dataLoaded ? (
          <div style={{ height:100, background:"var(--line)", borderRadius:"var(--radius)", animation:"shimmer 1.5s infinite", backgroundSize:"200% 100%", backgroundImage:"linear-gradient(90deg, var(--line) 25%, var(--bg2) 50%, var(--line) 75%)", marginBottom:14 }} />
        ) : (
          <>
            <CompletionBanner show={allDone} />
            {today ? (
              <Card style={{ marginBottom:14, cursor:"pointer", borderTop:"3px solid var(--royal)" }} onClick={() => navigate("/client/workouts")}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Today's Workout</div>
                    <div style={{ fontWeight:800, fontSize:16, color:"var(--text)", marginTop:3, fontFamily:"var(--font-display)" }}>{today.day_label}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{today.day_focus}</div>
                  </div>
                  <Badge label={`${doneCnt}/${totalCnt}`} color={allDone ? "var(--emerald)" : "var(--royal)"} />
                </div>
                <ProgressBar value={totalCnt ? (doneCnt/totalCnt)*100 : 0} color={allDone ? "var(--emerald)" : "var(--royal)"} height={7} />
                <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0" }}>
                  {totalCnt === 0 ? "No exercises" : allDone ? "🎉 All done!" : `${totalCnt - doneCnt} remaining`}
                </p>
              </Card>
            ) : (
              <Card style={{ marginBottom:14 }}>
                <Empty icon="🏋️" title="No workout assigned yet" subtitle="Your coach will add your training plan soon." />
              </Card>
            )}

            {n && (
              <Card style={{ cursor:"pointer" }} onClick={() => navigate("/client/nutrition")}>
                <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Daily Nutrition</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:30, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>{n.calories}</span>
                  <span style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>kcal / day</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                  {[{l:"Protein",v:n.protein_g,c:"var(--royal)"},{l:"Carbs",v:n.carbs_g,c:"var(--amber)"},{l:"Fats",v:n.fats_g,c:"#8B5CF6"}].map(m => (
                    <div key={m.l} style={{ background:"var(--bg)", borderRadius:9, padding:"8px 9px" }}>
                      <div style={{ fontSize:14, fontWeight:800, color:m.c, fontFamily:"var(--font-display)" }}>{m.v}g</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:1 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Workouts ──────────────────────────────────────────────────────────
export function ClientWorkouts() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [workout,  setWorkout]  = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const [w, l] = await Promise.all([
        workoutsAPI.getPlan(user.id, token),
        workoutsAPI.getLogs(user.id, token),
      ]);
      setWorkout(w); setLogs(Array.isArray(l) ? l : []);
    } catch {} finally { setLoading(false); }
  }, [user?.id, token]);

  useEffect(() => { if (!authLoading) load(); }, [load, authLoading]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const toggleDone = async (exId) => {
    const done = logs.some(l => l.exercise_id === exId && l.completed && l.logged_at?.slice(0,10) === todayStr);
    setToggling(exId);
    try { await workoutsAPI.logExercise(exId, !done, token); await load(); }
    catch { toast.error("Couldn't update — try again"); }
    finally { setToggling(null); }
  };

  const days    = workout?.days || [];
  const allDone = days.length > 0 && days.every(d => d.exercises?.every(e =>
    logs.some(l => l.exercise_id === e.id && l.completed && l.logged_at?.slice(0,10) === todayStr)
  ));

  return (
    <div className="page">
      <TopBar title="My Workouts" subtitle="Training Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : (
          <><CompletionBanner show={allDone} />
          <ClientWorkoutTab workout={workout} logs={logs} onToggle={toggleDone} toggling={toggling} /></>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Nutrition — real backend logging ──────────────────────────────────
export function ClientNutrition() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [nutrition,   setNutrition]   = useState(null);
  const [mealLogs,    setMealLogs]    = useState([]);   // from backend
  const [loading,     setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0, 10));
  const [addModal,    setAddModal]    = useState(false);
  const [logSaving,   setLogSaving]   = useState(false);
  const [newEntry, setNewEntry] = useState({ name:"", calories:"", protein:"", carbs:"", fats:"", notes:"" });

  const load = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const [n, logs] = await Promise.all([
        nutritionAPI.getPlan(user.id, token).catch(() => null),
        mealLogAPI.getDay(user.id, selectedDay, token).catch(() => []),
      ]);
      setNutrition(n);
      setMealLogs(Array.isArray(logs) ? logs : []);
    } catch {} finally { setLoading(false); }
  }, [user?.id, token, selectedDay]);

  useEffect(() => { if (!authLoading) load(); }, [load, authLoading]);

  // Toggle a planned meal (log or un-log)
  const toggleMeal = async (meal) => {
    const existing = mealLogs.find(l => l.meal_id === meal.id && !l.is_custom);
    if (existing) {
      // Remove the log
      try {
        await mealLogAPI.remove(existing.id, token);
        setMealLogs(p => p.filter(l => l.id !== existing.id));
        toast.success("Meal un-logged");
      } catch { toast.error("Failed to update"); }
    } else {
      // Add the log
      try {
        const entry = await mealLogAPI.log({
          mealId: meal.id, date: selectedDay,
          name: meal.name, calories: meal.calories,
          proteinG: meal.protein_g, carbsG: meal.carbs_g, fatsG: meal.fats_g,
          isCustom: false,
        }, token);
        setMealLogs(p => [...p, entry]);
        toast.success("Meal logged ✓");
      } catch { toast.error("Failed to log meal"); }
    }
  };

  // Add a custom entry
  const addCustomEntry = async () => {
    if (!newEntry.name.trim()) return;
    setLogSaving(true);
    try {
      const entry = await mealLogAPI.log({
        date: selectedDay, name: newEntry.name,
        calories: +newEntry.calories || 0, proteinG: +newEntry.protein || 0,
        carbsG: +newEntry.carbs || 0, fatsG: +newEntry.fats || 0,
        isCustom: true, notes: newEntry.notes,
      }, token);
      setMealLogs(p => [...p, entry]);
      setNewEntry({ name:"", calories:"", protein:"", carbs:"", fats:"", notes:"" });
      setAddModal(false);
      toast.success("Entry added");
    } catch { toast.error("Failed to add entry"); }
    finally { setLogSaving(false); }
  };

  const removeLog = async (logId) => {
    try {
      await mealLogAPI.remove(logId, token);
      setMealLogs(p => p.filter(l => l.id !== logId));
      toast.success("Removed");
    } catch { toast.error("Failed to remove"); }
  };

  const n = nutrition;
  const loggedCal     = mealLogs.reduce((s, l) => s + (l.calories || 0), 0);
  const loggedProtein = mealLogs.reduce((s, l) => s + (l.protein_g || 0), 0);
  const loggedCarbs   = mealLogs.reduce((s, l) => s + (l.carbs_g || 0), 0);
  const loggedFats    = mealLogs.reduce((s, l) => s + (l.fats_g || 0), 0);
  const customLogs    = mealLogs.filter(l => l.is_custom);

  const dayOptions = Array.from({ length:7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i);
    const val = d.toISOString().slice(0, 10);
    const label = i === 0 ? "Today" : i === 1 ? "Yesterday"
      : d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
    return { value:val, label };
  });

  return (
    <div className="page">
      <TopBar title="My Nutrition" subtitle="Daily Plan"
        right={
          <button onClick={() => setAddModal(true)}
            style={{ background:"var(--royal)", color:"#fff", border:"none", borderRadius:9, padding:"7px 12px", cursor:"pointer", fontWeight:600, fontSize:13, fontFamily:"var(--font-body)" }}>
            + Log
          </button>
        }
      />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !n ? (
          <Empty icon="🍎" title="No nutrition plan yet" subtitle="Your coach is preparing your meal plan." />
        ) : (
          <>
            {/* Day selector */}
            <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)}
              style={{ width:"100%", border:"1.5px solid var(--line)", borderRadius:"var(--radius-sm)", padding:"10px 14px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", background:"var(--white)", appearance:"none", backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2364748B' d='M5 6L0 0h10z'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", marginBottom:14 }}>
              {dayOptions.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>

            {/* Daily totals */}
            <Card style={{ marginBottom:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:26, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
                    {loggedCal} <span style={{ fontSize:14, fontWeight:500, color:"var(--muted)" }}>/ {n.calories} kcal</span>
                  </div>
                  <div style={{ fontSize:12, color: loggedCal > n.calories ? "var(--rose)" : "var(--muted)", marginTop:2 }}>
                    {loggedCal > n.calories ? `${loggedCal - n.calories} kcal over` : `${n.calories - loggedCal} kcal remaining`}
                  </div>
                </div>
                {loggedCal > 0 && mealLogs.length === (n.meals?.length || 0) && <span style={{ fontSize:20 }}>🎉</span>}
              </div>
              <ProgressBar value={(loggedCal / n.calories) * 100} color={loggedCal > n.calories ? "var(--rose)" : "var(--royal)"} height={7} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginTop:12 }}>
                {[
                  { l:"Protein", v:loggedProtein, t:n.protein_g, c:"var(--royal)" },
                  { l:"Carbs",   v:loggedCarbs,   t:n.carbs_g,   c:"var(--amber)" },
                  { l:"Fats",    v:loggedFats,     t:n.fats_g,    c:"#8B5CF6" },
                ].map(m => (
                  <div key={m.l} style={{ background:"var(--bg)", borderRadius:9, padding:"8px 9px" }}>
                    <div style={{ fontSize:13, fontWeight:800, color:m.c, fontFamily:"var(--font-display)" }}>
                      {m.v}g <span style={{ fontSize:10, fontWeight:500, color:"var(--muted)" }}>/ {m.t}g</span>
                    </div>
                    <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:2 }}>{m.l}</div>
                    <ProgressBar value={(m.v / m.t) * 100} color={m.c} height={3} />
                  </div>
                ))}
              </div>
            </Card>

            {/* Planned meals — tap to log/un-log */}
            <SectionHeader title="Scheduled Meals" />
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:12 }}>Tap to mark as eaten</p>
            {n.meals?.map(meal => {
              const logged = mealLogs.find(l => l.meal_id === meal.id);
              return (
                <Card key={meal.id} style={{ marginBottom:10, opacity:logged ? 0.6 : 1, cursor:"pointer", transition:"opacity 0.25s" }} onClick={() => toggleMeal(meal)}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:logged ? "var(--emerald)" : "transparent", border:`2px solid ${logged ? "var(--emerald)" : "var(--line2)"}`, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, transition:"all 0.2s" }}>
                      {logged && <span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:18 }}>{meal.icon}</span>
                        <span style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)", textDecoration:logged ? "line-through" : "none" }}>{meal.name}</span>
                        {logged && <Badge label="Logged" color="var(--emerald)" />}
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:2, lineHeight:1.5 }}>{meal.foods}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:7 }}>
                        <Badge label={`${meal.calories} kcal`} color="var(--amber)" />
                        <Badge label={`P ${meal.protein_g}g`}  color="var(--royal)" />
                        <Badge label={`C ${meal.carbs_g}g`}    color="var(--emerald)" />
                        <Badge label={`F ${meal.fats_g}g`}     color="#8B5CF6" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Custom logged entries */}
            {customLogs.length > 0 && (
              <>
                <SectionHeader title="Added by You" />
                {customLogs.map(entry => (
                  <Card key={entry.id} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{entry.name}</div>
                        {entry.notes && <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{entry.notes}</div>}
                        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:7 }}>
                          {entry.calories > 0 && <Badge label={`${entry.calories} kcal`} color="var(--amber)" />}
                          {entry.protein_g > 0 && <Badge label={`P ${entry.protein_g}g`} color="var(--royal)" />}
                          {entry.carbs_g > 0   && <Badge label={`C ${entry.carbs_g}g`}   color="var(--emerald)" />}
                          {entry.fats_g > 0    && <Badge label={`F ${entry.fats_g}g`}    color="#8B5CF6" />}
                        </div>
                      </div>
                      <button onClick={() => removeLog(entry.id)}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted2)", padding:4 }}
                        onMouseEnter={e => e.target.style.color="var(--rose)"}
                        onMouseLeave={e => e.target.style.color="var(--muted2)"}>✕</button>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Add custom entry modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title="Log Food or Meal">
        <p style={{ fontSize:13, color:"var(--muted)", marginBottom:14, lineHeight:1.6 }}>
          Add anything extra you ate — snacks, substitutions, or additional meals.
        </p>
        <Input label="What did you eat?" value={newEntry.name} onChange={e => setNewEntry(p => ({...p, name:e.target.value}))} placeholder="e.g. Protein shake, extra salad" autoFocus />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <Input label="Calories" value={newEntry.calories} type="number" onChange={e => setNewEntry(p => ({...p, calories:e.target.value}))} placeholder="0" />
          <Input label="Protein (g)" value={newEntry.protein} type="number" onChange={e => setNewEntry(p => ({...p, protein:e.target.value}))} placeholder="0" />
          <Input label="Carbs (g)" value={newEntry.carbs} type="number" onChange={e => setNewEntry(p => ({...p, carbs:e.target.value}))} placeholder="0" />
          <Input label="Fats (g)" value={newEntry.fats} type="number" onChange={e => setNewEntry(p => ({...p, fats:e.target.value}))} placeholder="0" />
        </div>
        <Textarea label="Notes (optional)" value={newEntry.notes} onChange={e => setNewEntry(p => ({...p, notes:e.target.value}))} placeholder="e.g. Replaced lunch with this" rows={2} />
        <div style={{ display:"flex", gap:10 }}>
          <Btn variant="secondary" onClick={() => setAddModal(false)} full>Cancel</Btn>
          <Btn variant="primary" onClick={addCustomEntry} loading={logSaving} full>Add Entry</Btn>
        </div>
      </Modal>

      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Medical ───────────────────────────────────────────────────────────
export function ClientMedical() {
  const { user, token, loading: authLoading } = useAuth();
  const [medical, setMedical] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id || !token) return;
    medicalAPI.list(user.id, token)
      .then(d => setMedical(Array.isArray(d) ? d : d?.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, token, authLoading]);

  const META = {
    note:        { icon:"📋", color:"var(--royal)",  bg:"var(--royal-pale)" },
    injury:      { icon:"🩹", color:"var(--amber)",  bg:"var(--amber-pale)" },
    restriction: { icon:"⚠️", color:"var(--rose)",   bg:"var(--rose-pale)"  },
  };

  return (
    <div className="page">
      <TopBar title="Medical Notes" subtitle="From your coach" />
      <div style={{ padding:"16px 20px" }}>
        {loading ? <Spinner /> : medical.length === 0 ? (
          <Empty icon="🏥" title="No medical notes" subtitle="Your coach hasn't added any medical notes yet." />
        ) : (
          <>
            <div style={{ background:"var(--amber-pale)", borderRadius:"var(--radius)", border:"1px solid #FCD34D30", padding:"12px 16px", marginBottom:16 }}>
              <p style={{ margin:0, fontSize:13, color:"#92400E", fontWeight:600, lineHeight:1.6 }}>
                ⚠️ Please read these notes carefully — they are important for your training safety.
              </p>
            </div>
            {medical.map(m => {
              const meta = META[m.type] || META.note;
              return (
                <Card key={m.id} style={{ marginBottom:12, borderLeft:`4px solid ${meta.color}`, paddingLeft:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{meta.icon}</div>
                    <Badge label={m.type.charAt(0).toUpperCase() + m.type.slice(1)} color={meta.color} />
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"var(--text2)", lineHeight:1.7 }}>{m.text}</p>
                  <p style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>
                    {new Date(m.created_at).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" })}
                  </p>
                </Card>
              );
            })}
          </>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Profile ───────────────────────────────────────────────────────────
export function ClientProfile() {
  const { user, token, logout, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [tab,           setTab]           = useState("progress");
  const [weightHistory, setWeightHistory] = useState([]);
  const [equipment,     setEquipment]     = useState([]);
  const [logWeight,     setLogWeight]     = useState("");
  const [logSaving,     setLogSaving]     = useState(false);
  const [dataLoaded,    setDataLoaded]    = useState(false);

  useEffect(() => {
    if (authLoading || !user?.id || !token || dataLoaded) return;
    Promise.all([
      clientsAPI.weightHistory(user.id, token).catch(() => []),
      clientsAPI.getEquipment(user.id, token).catch(() => []),
    ]).then(([wh, eq]) => {
      setWeightHistory(Array.isArray(wh) ? wh : []);
      setEquipment(Array.isArray(eq) ? eq : []);
      setDataLoaded(true);
    });
  }, [user?.id, token, authLoading, dataLoaded]);

  const submitWeight = async () => {
    const lbs = parseFloat(logWeight);
    if (!lbs || lbs < 50 || lbs > 900) { toast.error("Enter a valid weight in lbs"); return; }
    setLogSaving(true);
    try {
      await clientsAPI.logWeight(user.id, lbsToKg(lbs), token);
      setLogWeight(""); toast.success(`Weight logged: ${lbs} lbs`);
      await refreshUser();
      const wh = await clientsAPI.weightHistory(user.id, token).catch(() => []);
      setWeightHistory(Array.isArray(wh) ? wh : []);
    } catch { toast.error("Failed to log weight"); }
    finally { setLogSaving(false); }
  };

  const sorted   = [...weightHistory].sort((a,b) => new Date(a.logged_at) - new Date(b.logged_at));
  const latest   = sorted[sorted.length - 1];
  const first    = sorted[0];
  const changeKg = latest && first && sorted.length > 1 ? latest.weight_kg - first.weight_kg : null;
  const sortedLbs = sorted.map(e => ({ ...e, weight_kg: kgToLbs(e.weight_kg) }));

  const TABS = [
    { id:"progress",  label:"📈 Progress" },
    { id:"equipment", label:"🔧 Equipment" },
    { id:"account",   label:"👤 Account" },
  ];

  return (
    <div className="page">
      <TopBar title="My Profile" />
      <div style={{ padding:"0 20px 24px" }}>
        <div style={{ background:"linear-gradient(145deg, #1E40AF, #2563EB)", borderRadius:"var(--radius-lg)", padding:"24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:14, alignItems:"center", position:"relative" }}>
            <div style={{ width:56, height:56, borderRadius:17, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)" }}>
              {(user?.full_name || user?.fullName || "?").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:19, color:"#fff", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{user?.full_name || user?.fullName}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:"flex", background:"var(--bg2)", borderRadius:12, padding:3, marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex:1, borderRadius:9, border:"none", cursor:"pointer", padding:"9px 6px", background:tab===t.id?"var(--white)":"transparent", boxShadow:tab===t.id?"var(--shadow-sm)":"none", fontWeight:tab===t.id?700:500, fontSize:12, color:tab===t.id?"var(--royal)":"var(--muted)", fontFamily:"var(--font-body)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "progress" && (
          <div>
            <Card style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Weight History</div>
                  {latest && <div style={{ fontSize:26, fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginTop:4 }}>
                    {kgToLbs(latest.weight_kg)} <span style={{ fontSize:14, fontWeight:500, color:"var(--muted)" }}>lbs</span>
                  </div>}
                </div>
                {changeKg !== null && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:changeKg < 0 ? "var(--emerald)" : changeKg > 0 ? "var(--rose)" : "var(--muted)", fontFamily:"var(--font-display)" }}>
                      {changeKg > 0 ? "+" : "-"}{kgToLbs(Math.abs(changeKg))} lbs
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>total change</div>
                  </div>
                )}
              </div>
              <WeightGraph data={sortedLbs} unit="lbs" />
            </Card>

            <Card style={{ marginBottom:16 }}>
              <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:13, fontFamily:"var(--font-display)" }}>Log Weight</p>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, alignItems:"flex-end" }}>
                <Input label="Weight (lbs)" value={logWeight} onChange={e => setLogWeight(e.target.value)} type="number" placeholder="e.g. 162" />
                <Btn variant="primary" onClick={submitWeight} loading={logSaving} style={{ marginBottom:13 }}>Log</Btn>
              </div>
            </Card>

            {sorted.length > 0 && (
              <>
                <SectionHeader title="History" />
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[...sorted].reverse().slice(0, 15).map((entry, i, arr) => {
                    const prev    = arr[i + 1];
                    const diffKg  = prev ? entry.weight_kg - prev.weight_kg : null;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", background:"var(--white)", borderRadius:"var(--radius-sm)", border:"1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{kgToLbs(entry.weight_kg)} lbs</div>
                          <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{new Date(entry.logged_at).toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" })}</div>
                        </div>
                        {diffKg !== null && (
                          <span style={{ fontSize:12, fontWeight:700, color:diffKg < 0 ? "var(--emerald)" : diffKg > 0 ? "var(--rose)" : "var(--muted)" }}>
                            {diffKg > 0 ? "+" : "-"}{kgToLbs(Math.abs(diffKg))} lbs
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "equipment" && (
          equipment.length === 0
            ? <Empty icon="🔧" title="No equipment listed" subtitle="Your coach will set up your equipment profile." />
            : <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {equipment.map(item => (
                  <div key={item} style={{ background:"var(--royal-pale)", border:"1.5px solid var(--royal-pale2)", color:"var(--royal)", borderRadius:10, padding:"9px 16px", fontSize:13, fontWeight:600 }}>✓ {item}</div>
                ))}
              </div>
        )}

        {tab === "account" && (
          <div>
            <div style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", padding:"16px", marginBottom:12 }}>
              <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>Your workout and nutrition plan are managed by your coach. Contact them directly to request changes.</p>
            </div>
            <button onClick={logout} style={{ width:"100%", marginTop:8, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)" }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}
