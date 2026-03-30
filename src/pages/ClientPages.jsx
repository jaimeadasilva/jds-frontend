/**
 * Client-facing pages — Home, Workouts, Nutrition, Profile
 * Simple, clean, zero clutter. Client only sees what they need.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { workoutsAPI, nutritionAPI } from "../api/client";
import { Card, Badge, Spinner, MacroRing, ProgressBar, TopBar, Empty, CompletionBanner, goalColor, goalIcon, bmi, bmiCat, ibw } from "../components/UI";
import BottomNav from "../components/BottomNav";

const CLIENT_TABS = [
  { id:"home",      label:"Home",      icon:"🏠", path:"/client" },
  { id:"workouts",  label:"Workouts",  icon:"🏋️", path:"/client/workouts" },
  { id:"nutrition", label:"Nutrition", icon:"🍎", path:"/client/nutrition" },
  { id:"profile",   label:"Profile",   icon:"👤", path:"/client/profile" },
];

// ─── Client Home ──────────────────────────────────────────────────────────────
export function ClientHome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [workout,   setWorkout]   = useState(null);
  const [nutrition, setNutrition] = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      workoutsAPI.getPlan(user.id, token),
      nutritionAPI.getPlan(user.id, token),
      workoutsAPI.getLogs(user.id, token),
    ]).then(([w,n,l]) => { setWorkout(w); setNutrition(n); setLogs(Array.isArray(l)?l:[]); })
      .finally(() => setLoading(false));
  }, [user]);

  const today = workout?.days?.[0];
  const todayStr  = new Date().toISOString().slice(0,10);
  const todayLogs = logs.filter(l => l.logged_at?.slice(0,10) === todayStr);
  const doneCnt   = today?.exercises?.filter(e => todayLogs.some(l => l.exercise_id===e.id && l.completed)).length || 0;
  const totalCnt  = today?.exercises?.length || 0;
  const allDone   = totalCnt > 0 && doneCnt === totalCnt;
  const n = nutrition;

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background:"linear-gradient(145deg, #1E40AF 0%, var(--royal) 65%, #3B82F6 100%)", padding:"52px 24px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"#fff", opacity:0.05, top:-50, right:-40, pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize:"22px 22px", pointerEvents:"none" }} />
        <div style={{ position:"relative" }}>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:"0 0 3px" }}>Welcome back 👋</p>
          <h1 style={{ color:"#fff", margin:0, fontSize:27, fontWeight:800, letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
            {user?.full_name?.split(" ")[0] || "There"}
          </h1>
        </div>
      </div>

      <div style={{ padding:"20px" }}>
        {loading ? <Spinner /> : (
          <div className="stagger">
            {/* Completion banner */}
            <CompletionBanner show={allDone} />

            {/* Today's workout */}
            {today ? (
              <Card className="fade-up" style={{ marginBottom:14, cursor:"pointer" }} onClick={() => navigate("/client/workouts")}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>Today's Workout</div>
                    <div style={{ fontWeight:800, fontSize:17, color:"var(--text)", marginTop:3, fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{today.day_label}</div>
                    <div style={{ fontSize:13, color:"var(--muted)", marginTop:1 }}>{today.day_focus}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <Badge label={`${doneCnt}/${totalCnt}`} color={allDone ? "var(--emerald)" : "var(--royal)"} />
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{totalCnt===0 ? "No exercises" : allDone ? "Complete 🎉" : `${totalCnt-doneCnt} remaining`}</div>
                  </div>
                </div>
                <ProgressBar value={totalCnt ? (doneCnt/totalCnt)*100 : 0} color={allDone ? "var(--emerald)" : "var(--royal)"} height={7} />
              </Card>
            ) : (
              <Card className="fade-up" style={{ marginBottom:14 }}>
                <Empty icon="🏋️" title="No workout assigned" subtitle="Your coach will add your training plan soon." />
              </Card>
            )}

            {/* Nutrition summary */}
            {n ? (
              <Card className="fade-up" style={{ marginBottom:14, cursor:"pointer" }} onClick={() => navigate("/client/nutrition")}>
                <div style={{ fontSize:10, color:"var(--muted)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Daily Nutrition</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:12 }}>
                  <span style={{ fontSize:32, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>{n.calories}</span>
                  <span style={{ fontSize:14, color:"var(--muted)", marginBottom:4 }}>kcal / day</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[
                    { label:"Protein", v:n.protein_g, c:"var(--royal)" },
                    { label:"Carbs",   v:n.carbs_g,   c:"var(--amber)" },
                    { label:"Fats",    v:n.fats_g,    c:"#8B5CF6" },
                  ].map(m => (
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

            {/* BMI quick stat */}
            {user && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="fade-up">
                {[
                  { icon:"⚖️", label:"Current Weight", value:`${user.weight_kg||"—"} kg`, color:"var(--royal)" },
                  { icon:"📊", label:"Goal", value: user.goal || "—", color:goalColor(user.goal) },
                ].map(s => (
                  <Card key={s.label} style={{ padding:"15px" }}>
                    <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                    <div style={{ fontSize:17, fontWeight:800, color:s.color, fontFamily:"var(--font-display)" }}>{s.value}</div>
                    <div style={{ fontSize:11, color:"var(--muted)", fontWeight:600, marginTop:2 }}>{s.label}</div>
                  </Card>
                ))}
              </div>
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
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [workout,  setWorkout]  = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(0);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [w, l] = await Promise.all([workoutsAPI.getPlan(user.id, token), workoutsAPI.getLogs(user.id, token)]);
    setWorkout(w); setLogs(Array.isArray(l) ? l : []);
    setLoading(false);
  }, [user, token]);

  useEffect(() => { load(); }, [load]);

  const todayStr = new Date().toISOString().slice(0,10);
  const isExDone = (exId) => logs.some(l => l.exercise_id===exId && l.completed && l.logged_at?.slice(0,10)===todayStr);

  const toggleDone = async (exId) => {
    setToggling(exId);
    try {
      await workoutsAPI.logExercise(exId, !isExDone(exId), token);
      await load();
    } catch { toast.error("Couldn't update"); }
    finally { setToggling(null); }
  };

  const days = workout?.days || [];
  const allDaysDone = days.length > 0 && days.every(d => d.exercises?.length > 0 && d.exercises?.every(e => isExDone(e.id)));

  return (
    <div className="page">
      <TopBar title="My Workouts" subtitle="Training Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : days.length === 0 ? (
          <Empty icon="🏋️" title="No workout plan yet" subtitle="Your coach is preparing your personalised program. Check back soon!" />
        ) : (
          <div className="stagger">
            <CompletionBanner show={allDaysDone} />
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
                      <div style={{ width:36, height:36, borderRadius:11, background: dayDone ? "var(--emerald)20" : "var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, color: dayDone ? "var(--emerald)" : "var(--royal)", flexShrink:0, transition:"all 0.3s" }}>
                        {dayDone ? "✓" : dayIdx+1}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{day.day_label}</div>
                        <div style={{ fontSize:12, color:"var(--muted)", marginTop:1 }}>{day.day_focus}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, fontWeight:700, color: dayDone ? "var(--emerald)" : "var(--muted)" }}>{doneCount}/{totalCount}</div>
                        <ProgressBar value={totalCount?(doneCount/totalCount)*100:0} color={dayDone?"var(--emerald)":"var(--royal)"} height={4} />
                      </div>
                      <span style={{ color:"var(--muted)", fontSize:14 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop:"1px solid var(--line)", padding:"12px 18px" }}>
                      {day.exercises?.map(ex => {
                        const done = isExDone(ex.id);
                        const isToggling = toggling === ex.id;
                        return (
                          <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:13, padding:"12px 0", borderBottom:"1px solid var(--line)", opacity: done ? 0.55 : 1, transition:"opacity 0.25s" }}>
                            {/* Checkbox */}
                            <button onClick={() => toggleDone(ex.id)} disabled={isToggling}
                              style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:1, background: done ? "var(--royal)" : "transparent", border:`2px solid ${done ? "var(--royal)" : "var(--line2)"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                              {isToggling ? <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid #fff", borderTopColor:"transparent", animation:"spin 0.5s linear infinite", display:"block" }} /> : done && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>}
                            </button>
                            <div style={{ flex:1 }}>
                              <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", textDecoration: done?"line-through":"none", transition:"text-decoration 0.2s" }}>{ex.name}</div>
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

// ─── Client Nutrition ─────────────────────────────────────────────────────────
export function ClientNutrition() {
  const { user, token } = useAuth();
  const [nutrition, setNutrition] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (user) nutritionAPI.getPlan(user.id, token).then(setNutrition).finally(() => setLoading(false));
  }, [user]);

  const n = nutrition;
  const totalCal = n?.meals?.reduce((s,m) => s+m.calories, 0) || 0;

  return (
    <div className="page">
      <TopBar title="My Nutrition" subtitle="Daily Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !n ? (
          <Empty icon="🍎" title="No nutrition plan yet" subtitle="Your coach is preparing your personalised meal plan. Check back soon!" />
        ) : (
          <div className="stagger">
            {/* Targets */}
            <Card className="fade-up" style={{ marginBottom:16 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:32, fontWeight:800, color:"var(--text)", letterSpacing:"-0.04em", fontFamily:"var(--font-display)" }}>
                  {n.calories}<span style={{ fontSize:16, fontWeight:500, color:"var(--muted)" }}> kcal</span>
                </div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>Daily calorie target</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, justifyItems:"center" }}>
                <MacroRing label="Protein" value={n.protein_g} color="var(--royal)" />
                <MacroRing label="Carbs"   value={n.carbs_g}   color="var(--amber)" />
                <MacroRing label="Fats"    value={n.fats_g}    color="#8B5CF6" />
              </div>
            </Card>

            {/* Planned vs target bar */}
            <Card className="fade-up" style={{ padding:"13px 16px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
                <span style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>Meals planned: {totalCal} kcal</span>
                <span style={{ fontSize:12, fontWeight:600, color:"var(--royal)" }}>Target: {n.calories} kcal</span>
              </div>
              <ProgressBar value={(totalCal/n.calories)*100} color={totalCal > n.calories ? "var(--rose)" : "var(--royal)"} height={7} />
            </Card>

            {/* Meals */}
            <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", marginBottom:12, fontFamily:"var(--font-display)" }}>Meal Plan</div>
            {n.meals?.map((meal, i) => (
              <Card key={meal.id} className="fade-up" style={{ marginBottom:10, animationDelay:`${i*0.05}s` }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:"var(--royal-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{meal.icon}</div>
                  <div style={{ flex:1 }}>
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
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}

// ─── Client Profile ───────────────────────────────────────────────────────────
export function ClientProfile() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <TopBar title="My Profile" />
      <div style={{ padding:"0 20px 24px" }}>
        <div style={{ background:"linear-gradient(145deg, #1E40AF, var(--royal))", borderRadius:"var(--radius-lg)", padding:"28px 24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"#fff", opacity:0.05, top:-40, right:-30, pointerEvents:"none" }} />
          <div style={{ display:"flex", gap:16, alignItems:"center", position:"relative" }}>
            <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"1.5px solid rgba(255,255,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, color:"#fff", fontFamily:"var(--font-display)" }}>
              {user?.full_name?.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:"#fff", fontFamily:"var(--font-display)", letterSpacing:"-0.02em" }}>{user?.full_name}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <div style={{ background:"var(--white)", borderRadius:"var(--radius)", border:"1px solid var(--line)", padding:"16px 18px", marginBottom:8 }}>
          <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>
            Your workout and nutrition plan are managed by your coach. Contact them directly to request changes or updates to your program.
          </p>
        </div>

        <button onClick={logout}
          style={{ width:"100%", marginTop:20, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)", transition:"all 0.15s" }}>
          Sign Out
        </button>
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}
