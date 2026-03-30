import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { workoutsAPI, nutritionAPI } from "../api/client";
import { Card, Badge, Spinner, MacroRing, ProgressBar, TopBar, goalColor, goalIcon, bmi, bmiCat, ibw } from "../components/UI";
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
    ]).then(([w, n, l]) => { setWorkout(w); setNutrition(n); setLogs(l); })
      .finally(() => setLoading(false));
  }, [user]);

  const today = workout?.days?.[0];
  const todayLogs = logs.filter(l => l.logged_at?.slice(0,10) === new Date().toISOString().slice(0,10));
  const todayDone = today?.exercises?.filter(e => todayLogs.some(l => l.exercise_id === e.id && l.completed)) || [];
  const n = nutrition;

  return (
    <div className="page">
      {/* Hero */}
      <div style={{ background:`linear-gradient(145deg, var(--navy) 0%, var(--blue) 100%)`, padding:"52px 24px 28px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", width:200, height:200, borderRadius:"50%", background:"#fff", opacity:0.05, top:-50, right:-40 }} />
        <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, margin:"0 0 4px" }}>Welcome back 👋</p>
        <h1 style={{ color:"#fff", margin:"0 0 4px", fontSize:26, fontWeight:900, letterSpacing:"-0.03em" }}>
          {user?.full_name?.split(" ")[0] || "There"}
        </h1>
      </div>

      <div style={{ padding:"20px" }}>
        {loading ? <Spinner /> : (
          <>
            {/* Today's workout */}
            {today && (
              <Card style={{ padding:18, marginBottom:16, borderTop:"3px solid var(--blue)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase" }}>Today's Workout</div>
                    <div style={{ fontWeight:800, fontSize:17, color:"var(--text)", marginTop:2 }}>{today.day_label} · {today.day_focus}</div>
                  </div>
                  <Badge label={`${todayDone.length}/${today.exercises?.length||0}`} color={todayDone.length===today.exercises?.length && today.exercises?.length>0?"var(--green)":"var(--blue)"} />
                </div>
                <ProgressBar value={today.exercises?.length ? (todayDone.length/today.exercises.length)*100 : 0} color="var(--blue)" height={8} />
                <p style={{ fontSize:12, color:"var(--muted)", margin:"8px 0 0" }}>
                  {!today.exercises?.length ? "No exercises assigned" : todayDone.length===today.exercises.length ? "🎉 All done!" : `${today.exercises.length-todayDone.length} exercises remaining`}
                </p>
              </Card>
            )}

            {/* Calories */}
            {n && (
              <Card style={{ padding:18, marginBottom:16, borderTop:"3px solid var(--orange)" }}>
                <div style={{ fontSize:11, color:"var(--muted)", fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:8 }}>Daily Calories</div>
                <div style={{ display:"flex", alignItems:"flex-end", gap:8, marginBottom:10 }}>
                  <span style={{ fontSize:36, fontWeight:900, color:"var(--text)", letterSpacing:"-0.03em" }}>{n.calories}</span>
                  <span style={{ fontSize:14, color:"var(--muted)", marginBottom:6 }}>kcal target</span>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                  {[{label:"Protein",v:n.protein_g,c:"var(--blue)"},{label:"Carbs",v:n.carbs_g,c:"var(--orange)"},{label:"Fats",v:n.fats_g,c:"var(--blue-light)"}].map(m => (
                    <div key={m.label} style={{ background:m.c.replace("var(--","").replace(")","")+"12"||"#eee", borderRadius:10, padding:"8px 10px", background:"var(--bg)" }}>
                      <div style={{ fontSize:16, fontWeight:900, color:m.c }}>{m.v}g</div>
                      <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600 }}>{m.label}</div>
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
  const { user, token } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(0);

  const load = async () => {
    const [w, l] = await Promise.all([workoutsAPI.getPlan(user.id, token), workoutsAPI.getLogs(user.id, token)]);
    setWorkout(w); setLogs(l);
    setLoading(false);
  };

  useEffect(() => { if (user) load(); }, [user]);

  const isExDone = (exId) => {
    const today = new Date().toISOString().slice(0,10);
    return logs.some(l => l.exercise_id === exId && l.completed && l.logged_at?.slice(0,10) === today);
  };

  const toggleDone = async (exId) => {
    const done = isExDone(exId);
    await workoutsAPI.logExercise(exId, !done, token);
    load();
  };

  return (
    <div className="page">
      <TopBar title="My Workout" subtitle="Training Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !workout ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:48 }}>🏋️</div>
            <p style={{ fontWeight:700, marginTop:10 }}>No workout plan assigned yet</p>
          </div>
        ) : workout.days?.map((day, dayIdx) => {
          const done  = day.exercises?.filter(e => isExDone(e.id)).length || 0;
          const total = day.exercises?.length || 0;
          const isOpen = expanded === dayIdx;
          return (
            <Card key={day.id} style={{ marginBottom:12, overflow:"hidden", padding:0 }}>
              <button onClick={() => setExpanded(isOpen?-1:dayIdx)}
                style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                  <div style={{ width:36, height:36, borderRadius:11, background: done===total&&total>0?"var(--green)20":"var(--blue-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color: done===total&&total>0?"var(--green)":"var(--blue)" }}>
                    {done===total&&total>0?"✓":dayIdx+1}
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:15, color:"var(--text)" }}>{day.day_label}</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>{day.day_focus}</div>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:11, color: done===total&&total>0?"var(--green)":"var(--muted)", fontWeight:700 }}>{done}/{total}</div>
                    <ProgressBar value={total?(done/total)*100:0} color={done===total&&total>0?"var(--green)":"var(--blue)"} height={4} />
                  </div>
                  <span style={{ color:"var(--blue)", fontSize:18 }}>{isOpen?"⌃":"⌄"}</span>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop:"1px solid var(--line)", padding:"12px 18px" }}>
                  {day.exercises?.map(ex => {
                    const done = isExDone(ex.id);
                    return (
                      <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 0", borderBottom:"1px solid var(--line)", opacity: done?0.5:1, transition:"opacity 0.2s" }}>
                        <button onClick={() => toggleDone(ex.id)}
                          style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:1, background: done?"var(--blue)":"transparent", border:`2px solid ${done?"var(--blue)":"var(--line)"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
                          {done && <span style={{ color:"#fff", fontSize:12, fontWeight:900 }}>✓</span>}
                        </button>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", textDecoration: done?"line-through":"none" }}>{ex.name}</div>
                          <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                            <span style={{ fontWeight:700, color:"var(--blue)" }}>{ex.sets}</span> sets × <span style={{ fontWeight:700, color:"var(--blue)" }}>{ex.reps}</span> reps
                            {ex.notes && <span style={{ fontStyle:"italic" }}> · {ex.notes}</span>}
                          </div>
                          {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:5, marginTop:6, background:"var(--orange)", color:"#fff", borderRadius:8, padding:"5px 12px", fontSize:12, fontWeight:700, textDecoration:"none" }}>▶ Watch Demo</a>}
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

  return (
    <div className="page">
      <TopBar title="My Nutrition" subtitle="Daily Plan" />
      <div style={{ padding:20 }}>
        {loading ? <Spinner /> : !n ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:"var(--muted)" }}>
            <div style={{ fontSize:48 }}>🍎</div>
            <p style={{ fontWeight:700, marginTop:10 }}>No nutrition plan assigned yet</p>
          </div>
        ) : (
          <>
            {/* Macro rings */}
            <Card style={{ padding:"20px 16px", marginBottom:16 }}>
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:32, fontWeight:900, color:"var(--text)", letterSpacing:"-0.03em" }}>{n.calories}<span style={{ fontSize:16, fontWeight:600, color:"var(--muted)" }}> kcal</span></div>
                <div style={{ fontSize:12, color:"var(--muted)" }}>Daily target</div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, justifyItems:"center" }}>
                <MacroRing label="Protein" value={n.protein_g} color="var(--blue)" />
                <MacroRing label="Carbs"   value={n.carbs_g}   color="var(--orange)" />
                <MacroRing label="Fats"    value={n.fats_g}    color="var(--blue-light)" />
              </div>
            </Card>

            {/* Meals */}
            <div style={{ fontWeight:800, fontSize:16, color:"var(--text)", marginBottom:12 }}>Meal Plan</div>
            {n.meals?.map(meal => (
              <Card key={meal.id} style={{ padding:"14px 16px", marginBottom:10 }}>
                <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:"var(--blue-pale)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{meal.icon}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:"var(--text)" }}>{meal.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:2, lineHeight:1.5 }}>{meal.foods}</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:8 }}>
                      <Badge label={`${meal.calories} kcal`} color="var(--orange)" />
                      <Badge label={`P ${meal.protein_g}g`}  color="var(--blue)" />
                      <Badge label={`C ${meal.carbs_g}g`}    color="var(--blue-mid)" />
                      <Badge label={`F ${meal.fats_g}g`}     color="var(--muted)" />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </>
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
        <div style={{ background:`linear-gradient(145deg, var(--navy), var(--blue))`, borderRadius:20, padding:"28px 24px", marginTop:20, marginBottom:20, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", width:150, height:150, borderRadius:"50%", background:"#fff", opacity:0.05, top:-40, right:-30 }} />
          <div style={{ display:"flex", gap:16, alignItems:"center", position:"relative" }}>
            <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.35)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:22, color:"#fff" }}>
              {user?.full_name?.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:900, fontSize:20, color:"#fff" }}>{user?.full_name}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{user?.email}</div>
            </div>
          </div>
        </div>

        <div style={{ background:"var(--white)", borderRadius:14, border:"1px solid var(--line)", padding:"16px 18px", marginBottom:8 }}>
          <p style={{ margin:0, fontSize:13, color:"var(--muted)", lineHeight:1.6 }}>
            Your coach manages your workout and nutrition plan. Contact them to make changes.
          </p>
        </div>

        <button onClick={logout}
          style={{ width:"100%", marginTop:20, background:"#FEF0F0", color:"var(--red)", border:"1px solid #FCCFCF", borderRadius:14, padding:14, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font)" }}>
          Sign Out
        </button>
      </div>
      <BottomNav tabs={CLIENT_TABS} />
    </div>
  );
}
