/**
 * Client-facing pages — Home, Workouts, Nutrition (with meal tracking), Profile
 * Clients also get read-only Medical and Equipment views
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { workoutsAPI, nutritionAPI, medicalAPI, clientsAPI } from "../api/client";
import {
  Card, Badge, Spinner, MacroRing, ProgressBar, TopBar,
  Empty, CompletionBanner, goalColor, goalIcon, bmi, bmiCat, ibw
} from "../components/UI";
import BottomNav from "../components/BottomNav";

const CLIENT_TABS = [
  { id:"home",      label:"Home",      icon:"🏠", path:"/client" },
  { id:"workouts",  label:"Workouts",  icon:"🏋️", path:"/client/workouts" },
  { id:"nutrition", label:"Nutrition", icon:"🍎", path:"/client/nutrition" },
  { id:"profile",   label:"Profile",   icon:"👤", path:"/client/profile" },
];

// ─── Client Home ──────────────────────────────────────────────────────────────
export function ClientHome() {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [workout,   setWorkout]   = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (authLoading || !user?.id || !token) return;
    Promise.all([
      workoutsAPI.getPlan(user.id, token),
      nutritionAPI.getPlan(user.id, token),
      workoutsAPI.getLogs(user.id, token),
    ])
      .then(([w,n,l]) => { setWorkout(w); setNutrition(n); setLogs(Array.isArray(l)?l:[]); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, token, authLoading]);

  const today      = workout?.days?.[0];
  const todayStr   = new Date().toISOString().slice(0,10);
  const todayLogs  = logs.filter(l => l.logged_at?.slice(0,10) === todayStr);
  const doneCnt    = today?.exercises?.filter(e => todayLogs.some(l => l.exercise_id===e.id && l.completed)).length || 0;
  const totalCnt   = today?.exercises?.length || 0;
  const allDone    = totalCnt > 0 && doneCnt === totalCnt;
  const firstName  = user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "there";
  const n          = nutrition;

  return (
    <div className="page">
      <div style={{
        background:"linear-gradient(150deg, #1E3A8A 0%, #2563EB 55%, #3B82F6 100%)",
        padding:"52px 24px 28px", position:"relative", overflow:"hidden",
      }}>
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

            {/* Today's workout card */}
            {today ? (
              <Card className="fade-up" style={{ marginBottom:14, cursor:"pointer", borderTop:"3px solid var(--royal)" }} onClick={() => navigate("/client/workouts")}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Today's Workout</div>
                    <div style={{ fontWeight:800, fontSize:17, color:"var(--text)", marginTop:3, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{today.day_label}</div>
                    <div style={{ fontSize:13, color:"var(--muted)", marginTop:1 }}>{today.day_focus}</div>
                  </div>
                  <Badge label={`${doneCnt}/${totalCnt}`} color={allDone?"var(--emerald)":"var(--royal)"} />
                </div>
                <ProgressBar value={totalCnt?(doneCnt/totalCnt)*100:0} color={allDone?"var(--emerald)":"var(--royal)"} height={7} />
                <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0" }}>
                  {totalCnt===0 ? "No exercises assigned" : allDone ? "🎉 All done!" : `${totalCnt-doneCnt} exercise${totalCnt-doneCnt!==1?"s":""} remaining`}
                </p>
              </Card>
            ) : (
              <Card className="fade-up" style={{ marginBottom:14 }}>
                <Empty icon="🏋️" title="No workout assigned yet" subtitle="Your coach will add your training plan soon." />
              </Card>
            )}

            {/* Nutrition summary */}
            {n ? (
              <Card className="fade-up" style={{ marginBottom:14, cursor:"pointer", borderTop:"3px solid var(--amber)" }} onClick={() => navigate("/client/nutrition")}>
                <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Daily Nutrition</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:32, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>{n.calories}</span>
                  <span style={{ fontSize:14, color:"var(--muted)", marginBottom:4 }}>kcal / day</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[{label:"Protein",v:n.protein_g,c:"var(--royal)"},{label:"Carbs",v:n.carbs_g,c:"var(--amber)"},{label:"Fats",v:n.fats_g,c:"#8B5CF6"}].map(m => (
                    <div key={m.label} style={{ background:"var(--bg)", borderRadius:10, padding:"9px 10px" }}>
                      <div style={{ fontSize:16, fontWeight:800, color:m.c, fontFamily:"var(--font-display)" }}>{m.v}g</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, marginTop:1 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card className="fade-up" style={{ marginBottom:14 }}>
                <Empty icon="🍎" title="No nutrition plan yet" subtitle="Your coach will add your meal plan soon." />
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
  const [expanded, setExpanded] = useState(0);
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

  const todayStr = new Date().toISOString().slice(0,10);
  const isExDone = (exId) => logs.some(l => l.exercise_id===exId && l.completed && l.logged_at?.slice(0,10)===todayStr);

  const toggleDone = async (exId) => {
    setToggling(exId);
    try {
      await workoutsAPI.logExercise(exId, !isExDone(exId), token);
      await load();
    } catch { toast.error("Couldn't update — try again"); }
    finally { setToggling(null); }
  };

  const days     = workout?.days || [];
  const allDone  = days.length > 0 && days.every(d => d.exercises?.every(e => isExDone(e.id)));

  return (
    <div className="page">
      <TopBar title="My Workouts" subtitle="Training Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : days.length === 0 ? (
          <Empty icon="🏋️" title="No workout plan yet" subtitle="Your coach is preparing your personalised program. Check back soon!" />
        ) : (
          <div className="stagger">
            <CompletionBanner show={allDone} />
            {days.map((day, dayIdx) => {
              const doneCount  = day.exercises?.filter(e => isExDone(e.id)).length || 0;
              const totalCount = day.exercises?.length || 0;
              const dayDone    = totalCount > 0 && doneCount === totalCount;
              const isOpen     = expanded === dayIdx;
              return (
                <Card key={day.id} noPad className="fade-up" style={{ marginBottom:12 }}>
                  <button onClick={() => setExpanded(isOpen ? -1 : dayIdx)}
                    style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"15px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font-body)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, textAlign:"left" }}>
                      <div style={{ width:36, height:36, borderRadius:11, background:dayDone?"var(--emerald)20":"var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color:dayDone?"var(--emerald)":"var(--royal)", flexShrink:0, transition:"all 0.3s" }}>
                        {dayDone ? "✓" : dayIdx+1}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{day.day_label}</div>
                        <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{day.day_focus}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, fontWeight:700, color:dayDone?"var(--emerald)":"var(--muted)" }}>{doneCount}/{totalCount}</div>
                        <ProgressBar value={totalCount?(doneCount/totalCount)*100:0} color={dayDone?"var(--emerald)":"var(--royal)"} height={4} />
                      </div>
                      <span style={{ color:"var(--muted)", fontSize:14 }}>{isOpen?"▲":"▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop:"1px solid var(--line)", padding:"12px 18px" }}>
                      {day.exercises?.map(ex => {
                        const done  = isExDone(ex.id);
                        const busy  = toggling === ex.id;
                        return (
                          <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:13, padding:"12px 0", borderBottom:"1px solid var(--line)", opacity:done?0.55:1, transition:"opacity 0.25s" }}>
                            <button onClick={() => toggleDone(ex.id)} disabled={busy}
                              style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:1, background:done?"var(--royal)":"transparent", border:`2px solid ${done?"var(--royal)":"var(--line2)"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                              {busy
                                ? <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid currentColor", borderTopColor:"transparent", animation:"spin 0.5s linear infinite", display:"block" }} />
                                : done && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>
                              }
                            </button>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", textDecoration:done?"line-through":"none", transition:"text-decoration 0.2s" }}>{ex.name}</div>
                              <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                                <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> sets × <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span> reps
                                {ex.notes && <span style={{ fontStyle:"italic" }}> · {ex.notes}</span>}
                              </div>
                              {ex.video_url && (
                                <a href={ex.video_url} target="_blank" rel="noreferrer"
                                  style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:7, background:"var(--amber)", color:"#fff", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, textDecoration:"none" }}>
                                  ▶ Watch Demo
                                </a>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

// ─── Client Nutrition — with meal check-off tracking ─────────────────────────
export function ClientNutrition() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [nutrition, setNutrition] = useState(null);
  const [loading,   setLoading]   = useState(true);
  // Simple local meal completion state (resets daily — stored in localStorage by date)
  const todayKey = `meal_log_${new Date().toISOString().slice(0,10)}`;
  const [logged, setLogged] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey) || "{}"); }
    catch { return {}; }
  });

  useEffect(() => {
    if (authLoading || !user?.id || !token) return;
    nutritionAPI.getPlan(user.id, token)
      .then(setNutrition)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id, token, authLoading]);

  const toggleMeal = (mealId) => {
    const updated = { ...logged, [mealId]: !logged[mealId] };
    setLogged(updated);
    localStorage.setItem(todayKey, JSON.stringify(updated));
    if (!logged[mealId]) toast.success("Meal logged ✓");
  };

  const n = nutrition;
  const loggedCount = n?.meals?.filter(m => logged[m.id]).length || 0;
  const totalMeals  = n?.meals?.length || 0;
  const totalCal    = n?.meals?.reduce((s,m) => s+m.calories, 0) || 0;
  const loggedCal   = n?.meals?.filter(m => logged[m.id]).reduce((s,m) => s+m.calories, 0) || 0;

  return (
    <div className="page">
      <TopBar title="My Nutrition" subtitle="Daily Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !n ? (
          <Empty icon="🍎" title="No nutrition plan yet" subtitle="Your coach is preparing your personalised meal plan." />
        ) : (
          <div className="stagger">
            {/* Macro targets */}
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

            {/* Daily progress */}
            <Card className="fade-up" style={{ padding:"13px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>Today's Progress</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{loggedCount}/{totalMeals} meals logged · {loggedCal} kcal</div>
                </div>
                {loggedCount === totalMeals && totalMeals > 0 && (
                  <span style={{ fontSize:20 }}>🎉</span>
                )}
              </div>
              <ProgressBar value={totalMeals?(loggedCount/totalMeals)*100:0} color="var(--emerald)" height={7} />
            </Card>

            {/* Meals — tap to log */}
            <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:12, fontFamily:"var(--font-display)" }}>
              Meal Plan
            </div>
            <p style={{ fontSize:12, color:"var(--muted)", marginBottom:14 }}>
              Tap a meal to mark it as eaten today
            </p>
            {n.meals?.map((meal, i) => {
              const done = !!logged[meal.id];
              return (
                <Card key={meal.id} className="fade-up"
                  style={{ marginBottom:10, animationDelay:`${i*0.05}s`, opacity:done?0.65:1, transition:"opacity 0.3s", cursor:"pointer" }}
                  onClick={() => toggleMeal(meal.id)}>
                  <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                    {/* Check circle */}
                    <div style={{ width:28, height:28, borderRadius:"50%", flexShrink:0, background:done?"var(--emerald)":"transparent", border:`2px solid ${done?"var(--emerald)":"var(--line2)"}`, display:"flex", alignItems:"center", justifyContent:"center", marginTop:2, transition:"all 0.2s" }}>
                      {done && <span style={{ color:"#fff", fontSize:13, fontWeight:800 }}>✓</span>}
                    </div>

                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:20 }}>{meal.icon}</span>
                        <span style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)", textDecoration:done?"line-through":"none" }}>{meal.name}</span>
                        {done && <Badge label="Logged" color="var(--emerald)" />}
                      </div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:3, lineHeight:1.5 }}>{meal.foods}</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
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
          </div>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Profile — with Medical + Equipment read-only tabs ─────────────────
export function ClientProfile() {
  const { user, token, logout, loading: authLoading } = useAuth();
  const [tab, setTab] = useState("overview");
  const [medical,   setMedical]   = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (authLoading || !user?.id || !token || dataLoaded) return;
    Promise.all([
      medicalAPI.list(user.id, token).catch(() => []),
      clientsAPI.getEquipment(user.id, token).catch(() => []),
    ]).then(([m, e]) => {
      setMedical(Array.isArray(m) ? m : m?.data || []);
      setEquipment(Array.isArray(e) ? e : []);
      setDataLoaded(true);
    });
  }, [user?.id, token, authLoading, dataLoaded]);

  const firstName = user?.full_name?.split(" ")[0] || user?.fullName?.split(" ")[0] || "";

  const TABS = [
    { id:"overview",  label:"Overview" },
    { id:"medical",   label:"Medical" },
    { id:"equipment", label:"Equipment" },
  ];

  const META = {
    note:        { icon:"📋", color:"var(--royal)" },
    injury:      { icon:"🩹", color:"var(--amber)" },
    restriction: { icon:"⚠️", color:"var(--rose)" },
  };

  return (
    <div className="page">
      <TopBar title="My Profile" />
      <div style={{ padding:"0 20px 24px" }}>

        {/* Profile hero */}
        <div style={{ background:"linear-gradient(145deg, #1E40AF, #2563EB)", borderRadius:"var(--radius-lg)", padding:"24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)", top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:14, alignItems:"center", position:"relative" }}>
            <div style={{ width:56, height:56, borderRadius:17, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)" }}>
              {(user?.full_name || user?.fullName || "?").slice(0,2).toUpperCase()}
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
              style={{ flex:1, borderRadius:9, border:"none", cursor:"pointer", padding:"9px 8px", background:tab===t.id?"var(--white)":"transparent", boxShadow:tab===t.id?"var(--shadow-sm)":"none", fontWeight:tab===t.id?700:500, fontSize:13, color:tab===t.id?"var(--royal)":"var(--muted)", fontFamily:"var(--font-body)", transition:"all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div>
            <div style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", padding:"16px", marginBottom:12 }}>
              <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>
                Your workout and nutrition plan are managed by your coach. Contact them directly to request any changes to your programme.
              </p>
            </div>
            {medical.length > 0 && (
              <div style={{ background:"var(--rose-pale)", borderRadius:"var(--radius)", border:"1px solid #FECDD3", padding:"13px 16px", marginBottom:12 }}>
                <div style={{ fontWeight:700, fontSize:13, color:"var(--rose)", marginBottom:4 }}>⚠️ Medical Notes Active</div>
                <p style={{ margin:0, fontSize:12, color:"var(--rose)", opacity:0.85 }}>You have {medical.length} medical note{medical.length!==1?"s":""} on your profile. View them in the Medical tab.</p>
              </div>
            )}
            <button onClick={logout}
              style={{ width:"100%", marginTop:8, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)" }}>
              Sign Out
            </button>
          </div>
        )}

        {/* Medical — read-only */}
        {tab === "medical" && (
          <div>
            {medical.length === 0 ? (
              <Empty icon="🏥" title="No medical notes" subtitle="Your coach hasn't added any medical notes yet." />
            ) : (
              <>
                <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16, lineHeight:1.6 }}>
                  These are notes from your coach regarding your health and training safety.
                </p>
                {medical.map(m => {
                  const meta = META[m.type] || META.note;
                  return (
                    <Card key={m.id} style={{ marginBottom:10, borderLeft:`4px solid ${meta.color}`, paddingLeft:16 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ fontSize:18 }}>{meta.icon}</span>
                        <Badge label={m.type.charAt(0).toUpperCase()+m.type.slice(1)} color={meta.color} />
                      </div>
                      <p style={{ margin:0, fontSize:14, color:"var(--text2)", lineHeight:1.65 }}>{m.text}</p>
                    </Card>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* Equipment — read-only */}
        {tab === "equipment" && (
          <div>
            {equipment.length === 0 ? (
              <Empty icon="🔧" title="No equipment listed" subtitle="Your coach hasn't set up your equipment profile yet." />
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
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}
