import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { workoutsAPI, nutritionAPI, medicalAPI, clientsAPI } from "../api/client";
import {
  Card, Badge, Spinner, MacroRing, ProgressBar, TopBar,
  Empty, CompletionBanner, Btn, Input, SectionHeader,
  goalColor, goalIcon, bmi, bmiCat, ibw
} from "../components/UI";
import { WeightGraph } from "../components/WeightGraph";
import { ClientWorkoutTab } from "./WorkoutTab";
import BottomNav from "../components/BottomNav";

const CLIENT_TABS = [
  { id:"home",      label:"Home",      icon:"🏠", path:"/client" },
  { id:"workouts",  label:"Workouts",  icon:"🏋️", path:"/client/workouts" },
  { id:"nutrition", label:"Nutrition", icon:"🍎", path:"/client/nutrition" },
  { id:"medical",   label:"Medical",   icon:"🏥", path:"/client/medical" },
  { id:"profile",   label:"Profile",   icon:"👤", path:"/client/profile" },
];

// ─── Shared data hook for client ─────────────────────────────────────────────
function useClientData() {
  const { user, token, loading: authLoading } = useAuth();
  const [workout,       setWorkout]       = useState(null);
  const [nutrition,     setNutrition]     = useState(null);
  const [logs,          setLogs]          = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [medical,       setMedical]       = useState([]);
  const [equipment,     setEquipment]     = useState([]);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    if (authLoading || !user?.id || !token) return;
    try {
      const [w, n, l, wh, med, eq] = await Promise.all([
        workoutsAPI.getPlan(user.id, token).catch(() => null),
        nutritionAPI.getPlan(user.id, token).catch(() => null),
        workoutsAPI.getLogs(user.id, token).catch(() => []),
        clientsAPI.weightHistory(user.id, token).catch(() => []),
        medicalAPI.list(user.id, token).catch(() => []),
        clientsAPI.getEquipment(user.id, token).catch(() => []),
      ]);
      setWorkout(w); setNutrition(n);
      setLogs(Array.isArray(l) ? l : []);
      setWeightHistory(Array.isArray(wh) ? wh : []);
      setMedical(Array.isArray(med) ? med : med?.data || []);
      setEquipment(Array.isArray(eq) ? eq : []);
    } catch {} finally { setLoading(false); }
  }, [user?.id, token, authLoading]);

  useEffect(() => { if (!authLoading) load(); }, [load, authLoading]);

  return { user, token, workout, nutrition, logs, weightHistory, medical, equipment, loading, reload: load };
}

// ─── Client Home ──────────────────────────────────────────────────────────────
export function ClientHome() {
  const navigate = useNavigate();
  const { user, token, workout, nutrition, logs, loading } = useClientData();
  const { toast } = useToast();
  const [logWeight,  setLogWeight]  = useState("");
  const [logSaving,  setLogSaving]  = useState(false);

  const today      = workout?.days?.[0];
  const todayStr   = new Date().toISOString().slice(0,10);
  const todayLogs  = logs.filter(l => l.logged_at?.slice(0,10) === todayStr);
  const doneCnt    = today?.exercises?.filter(e => todayLogs.some(l => l.exercise_id===e.id && l.completed)).length || 0;
  const totalCnt   = today?.exercises?.length || 0;
  const allDone    = totalCnt > 0 && doneCnt === totalCnt;
  const firstName  = user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "there";
  const n          = nutrition;
  const clientBMI  = bmi(user?.weight_kg, user?.height_cm);
  const cat        = bmiCat(+clientBMI);

  const submitWeight = async () => {
    const kg = parseFloat(logWeight);
    if (!kg || kg < 20 || kg > 400) { toast.error("Enter a valid weight (20–400 kg)"); return; }
    setLogSaving(true);
    try {
      await clientsAPI.logWeight(user.id, kg, token);
      setLogWeight(""); toast.success(`Weight logged: ${kg} kg`);
    } catch { toast.error("Failed to log weight"); }
    finally { setLogSaving(false); }
  };

  return (
    <div className="page">
      <div style={{ background:"linear-gradient(150deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)", padding:"52px 24px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", top:-120, right:-80, pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:"0 0 3px" }}>Welcome back 👋</p>
          <h1 style={{ color:"#fff", margin:0, fontSize:27, fontWeight:800, letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
            {firstName}
          </h1>
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {loading ? <Spinner /> : (
          <div className="stagger">
            <CompletionBanner show={allDone} />

            {/* Stats row: Weight · Height · BMI · IBW */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {[
                { label:"Weight",  value:`${user?.weight_kg||"—"}`, unit:"kg",  color:"var(--royal)" },
                { label:"Height",  value:`${user?.height_cm||"—"}`, unit:"cm",  color:"var(--text2)" },
                { label:"BMI",     value:clientBMI,                 unit:cat.label, color:cat.c },
                { label:"IBW",     value:`${ibw(user?.height_cm)||"—"}`, unit:"kg", color:"var(--emerald)" },
              ].map(s => (
                <Card key={s.label} style={{ padding:"11px 10px", textAlign:"center" }}>
                  <div style={{ fontSize:16, fontWeight:800, color:s.color, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{s.value}</div>
                  <div style={{ fontSize:9, color:"var(--muted)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", marginTop:2 }}>{s.label}</div>
                  <div style={{ fontSize:9, color:s.color, fontWeight:600, marginTop:1 }}>{s.unit}</div>
                </Card>
              ))}
            </div>

            {/* Quick weight log */}
            <Card style={{ marginBottom:16, padding:"13px 16px" }}>
              <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:8 }}>Log Today's Weight</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <input value={logWeight} onChange={e=>setLogWeight(e.target.value)} type="number" placeholder="e.g. 73.5 kg"
                  style={{ flex:1, border:"1.5px solid var(--line)", borderRadius:"var(--radius-sm)", padding:"9px 12px", fontSize:14, outline:"none", fontFamily:"var(--font-body)", color:"var(--text)", background:"var(--bg)", transition:"all 0.15s" }}
                  onFocus={e=>{e.target.style.borderColor="var(--royal)"; e.target.style.boxShadow="0 0 0 3px var(--royal-glow)";}}
                  onBlur={e=>{e.target.style.borderColor="var(--line)"; e.target.style.boxShadow="none";}}
                  onKeyDown={e=>e.key==="Enter"&&submitWeight()} />
                <Btn variant="primary" onClick={submitWeight} loading={logSaving} style={{ flexShrink:0 }}>Log</Btn>
              </div>
            </Card>

            {/* Today's workout */}
            {today ? (
              <Card className="fade-up" style={{ marginBottom:14, cursor:"pointer", borderTop:"3px solid var(--royal)" }} onClick={() => navigate("/client/workouts")}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Today's Workout</div>
                    <div style={{ fontWeight:800, fontSize:16, color:"var(--text)", marginTop:3, fontFamily:"var(--font-display)" }}>{today.day_label}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{today.day_focus}</div>
                  </div>
                  <Badge label={`${doneCnt}/${totalCnt}`} color={allDone?"var(--emerald)":"var(--royal)"} />
                </div>
                <ProgressBar value={totalCnt?(doneCnt/totalCnt)*100:0} color={allDone?"var(--emerald)":"var(--royal)"} height={7} />
                <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0" }}>
                  {totalCnt===0?"No exercises assigned":allDone?"🎉 All done!":`${totalCnt-doneCnt} remaining`}
                </p>
              </Card>
            ) : (
              <Card style={{ marginBottom:14 }}>
                <Empty icon="🏋️" title="No workout assigned yet" subtitle="Your coach will add your training plan soon." />
              </Card>
            )}

            {/* Nutrition summary */}
            {n && (
              <Card className="fade-up" style={{ cursor:"pointer" }} onClick={() => navigate("/client/nutrition")}>
                <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Daily Nutrition</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:30, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>{n.calories}</span>
                  <span style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>kcal / day</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
                  {[{l:"Protein",v:n.protein_g,c:"var(--royal)"},{l:"Carbs",v:n.carbs_g,c:"var(--amber)"},{l:"Fats",v:n.fats_g,c:"#8B5CF6"}].map(m => (
                    <div key={m.l} style={{ background:"var(--bg)", borderRadius:9, padding:"8px 9px" }}>
                      <div style={{ fontSize:15, fontWeight:800, color:m.c, fontFamily:"var(--font-display)" }}>{m.v}g</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:1 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
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

  const toggleDone = async (exId) => {
    const todayStr = new Date().toISOString().slice(0,10);
    const done = logs.some(l => l.exercise_id===exId && l.completed && l.logged_at?.slice(0,10)===todayStr);
    setToggling(exId);
    try { await workoutsAPI.logExercise(exId, !done, token); await load(); }
    catch { toast.error("Couldn't update — try again"); }
    finally { setToggling(null); }
  };

  const days    = workout?.days || [];
  const todayStr = new Date().toISOString().slice(0,10);
  const allDone  = days.length > 0 && days.every(d => d.exercises?.every(e => logs.some(l => l.exercise_id===e.id && l.completed && l.logged_at?.slice(0,10)===todayStr)));

  return (
    <div className="page">
      <TopBar title="My Workouts" subtitle="Training Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : (
          <>
            <CompletionBanner show={allDone} />
            <ClientWorkoutTab workout={workout} logs={logs} onToggle={toggleDone} toggling={toggling} />
          </>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Nutrition ─────────────────────────────────────────────────────────
export function ClientNutrition() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [nutrition, setNutrition] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const todayKey = `meal_log_${new Date().toISOString().slice(0,10)}`;
  const [logged, setLogged] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey)||"{}"); } catch { return {}; }
  });

  useEffect(() => {
    if (authLoading || !user?.id || !token) return;
    nutritionAPI.getPlan(user.id, token).then(setNutrition).catch(()=>{}).finally(()=>setLoading(false));
  }, [user?.id, token, authLoading]);

  const toggleMeal = (id) => {
    const updated = { ...logged, [id]: !logged[id] };
    setLogged(updated);
    localStorage.setItem(todayKey, JSON.stringify(updated));
    if (!logged[id]) toast.success("Meal logged ✓");
  };

  const n = nutrition;
  const loggedCount = n?.meals?.filter(m => logged[m.id]).length || 0;
  const totalMeals  = n?.meals?.length || 0;
  const loggedCal   = n?.meals?.filter(m => logged[m.id]).reduce((s,m)=>s+m.calories,0) || 0;

  return (
    <div className="page">
      <TopBar title="My Nutrition" subtitle="Daily Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !n ? (
          <Empty icon="🍎" title="No nutrition plan yet" subtitle="Your coach is preparing your meal plan." />
        ) : (
          <div className="stagger">
            <Card className="fade-up" style={{ marginBottom:16 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:32, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
                  {n.calories}<span style={{ fontSize:16, fontWeight:500, color:"var(--muted)" }}> kcal</span>
                </div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>Daily target</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, justifyItems:"center" }}>
                <MacroRing label="Protein" value={n.protein_g} color="var(--royal)" />
                <MacroRing label="Carbs"   value={n.carbs_g}   color="var(--amber)" />
                <MacroRing label="Fats"    value={n.fats_g}    color="#8B5CF6" />
              </div>
            </Card>

            <Card className="fade-up" style={{ padding:"13px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>Today's Progress</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{loggedCount}/{totalMeals} meals · {loggedCal} kcal consumed</div>
                </div>
                {loggedCount===totalMeals&&totalMeals>0&&<span style={{ fontSize:20 }}>🎉</span>}
              </div>
              <ProgressBar value={totalMeals?(loggedCount/totalMeals)*100:0} color="var(--emerald)" height={7} />
            </Card>

            <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:8, fontFamily:"var(--font-display)" }}>Meal Plan</div>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>Tap a meal to mark it as eaten</p>

            {n.meals?.map((meal,i) => {
              const done = !!logged[meal.id];
              return (
                <Card key={meal.id} className="fade-up" style={{ marginBottom:10, animationDelay:`${i*0.05}s`, opacity:done?0.6:1, transition:"opacity 0.3s", cursor:"pointer" }} onClick={()=>toggleMeal(meal.id)}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:done?"var(--emerald)":"transparent", border:`2px solid ${done?"var(--emerald)":"var(--line2)"}`, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, transition:"all 0.2s" }}>
                      {done&&<span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>✓</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:20 }}>{meal.icon}</span>
                        <span style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)", textDecoration:done?"line-through":"none" }}>{meal.name}</span>
                        {done&&<Badge label="Logged" color="var(--emerald)" />}
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:3, lineHeight:1.5 }}>{meal.foods}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                        <Badge label={`${meal.calories} kcal`} color="var(--amber)" />
                        <Badge label={`P ${meal.protein_g}g`} color="var(--royal)" />
                        <Badge label={`C ${meal.carbs_g}g`} color="var(--emerald)" />
                        <Badge label={`F ${meal.fats_g}g`} color="#8B5CF6" />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Medical — own full tab ────────────────────────────────────────────
export function ClientMedical() {
  const { user, token, loading: authLoading } = useAuth();
  const [medical,  setMedical]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id || !token) return;
    medicalAPI.list(user.id, token)
      .then(d => setMedical(Array.isArray(d) ? d : d?.data || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [user?.id, token, authLoading]);

  const META = {
    note:        { icon:"📋", color:"var(--royal)",  bg:"var(--royal-pale)" },
    injury:      { icon:"🩹", color:"var(--amber)",  bg:"var(--amber-pale)" },
    restriction: { icon:"⚠️", color:"var(--rose)",   bg:"var(--rose-pale)" },
  };

  return (
    <div className="page">
      <TopBar title="Medical Notes" subtitle="From your coach" />
      <div style={{ padding:"16px 20px" }}>
        {loading ? <Spinner /> : medical.length === 0 ? (
          <Empty icon="🏥" title="No medical notes" subtitle="Your coach hasn't added any medical notes to your profile yet." />
        ) : (
          <>
            <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16, lineHeight:1.7 }}>
              These notes from your coach are important for your training safety. Please read them carefully.
            </p>
            {medical.map(m => {
              const meta = META[m.type] || META.note;
              return (
                <Card key={m.id} style={{ marginBottom:12, borderLeft:`4px solid ${meta.color}`, paddingLeft:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:30, height:30, borderRadius:9, background:meta.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>{meta.icon}</div>
                    <Badge label={m.type.charAt(0).toUpperCase()+m.type.slice(1)} color={meta.color} />
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"var(--text2)", lineHeight:1.7 }}>{m.text}</p>
                  <p style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>
                    {new Date(m.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
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

// ─── Client Profile — with Progress tab ──────────────────────────────────────
export function ClientProfile() {
  const { user, token, logout, loading: authLoading } = useAuth();
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
      clientsAPI.weightHistory(user.id, token).catch(()=>[]),
      clientsAPI.getEquipment(user.id, token).catch(()=>[]),
    ]).then(([wh, eq]) => {
      setWeightHistory(Array.isArray(wh) ? wh : []);
      setEquipment(Array.isArray(eq) ? eq : []);
      setDataLoaded(true);
    });
  }, [user?.id, token, authLoading, dataLoaded]);

  const submitWeight = async () => {
    const kg = parseFloat(logWeight);
    if (!kg || kg < 20 || kg > 400) { toast.error("Enter a valid weight (20–400 kg)"); return; }
    setLogSaving(true);
    try {
      await clientsAPI.logWeight(user.id, kg, token);
      setLogWeight(""); toast.success(`Weight logged: ${kg} kg`);
      // Refresh weight history
      const wh = await clientsAPI.weightHistory(user.id, token).catch(()=>[]);
      setWeightHistory(Array.isArray(wh) ? wh : []);
    } catch { toast.error("Failed to log weight"); }
    finally { setLogSaving(false); }
  };

  const sorted   = [...weightHistory].sort((a,b)=>new Date(a.logged_at)-new Date(b.logged_at));
  const latest   = sorted[sorted.length-1];
  const first    = sorted[0];
  const change   = latest&&first&&sorted.length>1 ? (latest.weight_kg-first.weight_kg).toFixed(1) : null;
  const firstName = user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "";

  const TABS = [
    { id:"progress",  label:"📈 Progress" },
    { id:"equipment", label:"🔧 Equipment" },
    { id:"account",   label:"👤 Account" },
  ];

  return (
    <div className="page">
      <TopBar title="My Profile" />
      <div style={{ padding:"0 20px 24px" }}>
        {/* Profile hero */}
        <div style={{ background:"linear-gradient(145deg, #1E40AF, #2563EB)", borderRadius:"var(--radius-lg)", padding:"24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:14, alignItems:"center", position:"relative" }}>
            <div style={{ width:56, height:56, borderRadius:17, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)" }}>
              {(user?.full_name||user?.fullName||"?").slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:19, color:"#fff", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{user?.full_name||user?.fullName}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Sub-tabs */}
        <div style={{ display:"flex", background:"var(--bg2)", borderRadius:12, padding:3, marginBottom:20 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:1, borderRadius:9, border:"none", cursor:"pointer", padding:"9px 6px", background:tab===t.id?"var(--white)":"transparent", boxShadow:tab===t.id?"var(--shadow-sm)":"none", fontWeight:tab===t.id?700:500, fontSize:12, color:tab===t.id?"var(--royal)":"var(--muted)", fontFamily:"var(--font-body)", transition:"all 0.2s", whiteSpace:"nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Progress tab */}
        {tab==="progress" && (
          <div>
            <Card style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" }}>Weight History</div>
                  {latest && (
                    <div style={{ fontSize:28, fontWeight:800, color:"var(--text)", fontFamily:"var(--font-display)", letterSpacing:"-0.03em", marginTop:4 }}>
                      {latest.weight_kg} <span style={{ fontSize:14, fontWeight:500, color:"var(--muted)" }}>kg</span>
                    </div>
                  )}
                </div>
                {change!==null && (
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:16, fontWeight:800, color:+change<0?"var(--emerald)":+change>0?"var(--rose)":"var(--muted)", fontFamily:"var(--font-display)" }}>
                      {+change>0?"+":""}{change} kg
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>total change</div>
                  </div>
                )}
              </div>
              <WeightGraph data={sorted} />
            </Card>

            {/* Log weight */}
            <Card style={{ marginBottom:16 }}>
              <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:13, fontFamily:"var(--font-display)" }}>Log Weight</p>
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:10, alignItems:"flex-end" }}>
                <Input label="Weight (kg)" value={logWeight} onChange={e=>setLogWeight(e.target.value)} type="number" placeholder="e.g. 73.5" />
                <Btn variant="primary" onClick={submitWeight} loading={logSaving} style={{ marginBottom:13 }}>Log</Btn>
              </div>
            </Card>

            {/* History list */}
            {sorted.length > 0 && (
              <>
                <SectionHeader title="History" />
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {[...sorted].reverse().slice(0,15).map((entry,i,arr) => {
                    const prev = arr[i+1];
                    const diff = prev ? (entry.weight_kg - prev.weight_kg).toFixed(1) : null;
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"11px 14px", background:"var(--white)", borderRadius:"var(--radius-sm)", border:"1px solid var(--line)" }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{entry.weight_kg} kg</div>
                          <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>
                            {new Date(entry.logged_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}
                          </div>
                        </div>
                        {diff!==null && (
                          <span style={{ fontSize:12, fontWeight:700, color:+diff<0?"var(--emerald)":+diff>0?"var(--rose)":"var(--muted)" }}>
                            {+diff>0?"+":""}{diff} kg
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

        {/* Equipment tab */}
        {tab==="equipment" && (
          <div>
            {equipment.length===0 ? (
              <Empty icon="🔧" title="No equipment listed" subtitle="Your coach will set up your equipment profile soon." />
            ) : (
              <>
                <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16, lineHeight:1.6 }}>
                  Your workouts are tailored to this equipment.
                </p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {equipment.map(item => (
                    <div key={item} style={{ background:"var(--royal-pale)", border:"1.5px solid var(--royal-pale2)", color:"var(--royal)", borderRadius:10, padding:"9px 16px", fontSize:13, fontWeight:600 }}>
                      ✓ {item}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Account tab */}
        {tab==="account" && (
          <div>
            <div style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", padding:"16px", marginBottom:12 }}>
              <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>
                Your workout and nutrition plan are managed by your coach. Contact them to request changes.
              </p>
            </div>
            <button onClick={logout}
              style={{ width:"100%", marginTop:8, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)" }}>
              Sign Out
            </button>
          </div>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}
