/**
 * WorkoutTab — shared between coach (editable) and client (read-only with checkboxes)
 * Structure: Week N → Day N (label + focus) → Exercises
 */
import { useState } from "react";
import { workoutsAPI } from "../api/client";
import { Card, Btn, Input, ProgressBar, Empty } from "../components/UI";
import { Modal, ConfirmModal } from "../components/Modal";

// Group days into weeks
function groupByWeek(days) {
  const weeks = {};
  for (const day of days) {
    const wk = day.week_number || 1;
    if (!weeks[wk]) weeks[wk] = [];
    weeks[wk].push(day);
  }
  return Object.entries(weeks)
    .sort(([a],[b]) => +a - +b)
    .map(([wk, ds]) => ({ weekNumber: +wk, days: ds }));
}

// ─── Coach Workout Tab ────────────────────────────────────────────────────────
export function CoachWorkoutTab({ workout, clientId, token, reload, toast }) {
  const [openWeeks, setOpenWeeks] = useState({ 1: true });
  const [openDays,  setOpenDays]  = useState({});
  const [addingDay, setAddingDay] = useState(false);
  const [addingEx,  setAddingEx]  = useState(null);
  const [editEx,    setEditEx]    = useState(null);
  const [newDay,    setNewDay]    = useState({ dayLabel:"", dayFocus:"", weekNumber:"1" });
  const [newEx,     setNewEx]     = useState({ name:"", sets:"3", reps:"10", notes:"", videoUrl:"" });
  const [saving,    setSaving]    = useState(false);
  const [confirmDelDay, setConfirmDelDay] = useState(null);
  const [confirmDelEx,  setConfirmDelEx]  = useState(null);

  const toggleWeek = (wk) => setOpenWeeks(p => ({ ...p, [wk]: !p[wk] }));
  const toggleDay  = (id) => setOpenDays(p => ({ ...p, [id]: !p[id] }));

  const createPlanThenDay = async () => {
    if (!newDay.dayLabel.trim()) return;
    setSaving(true);
    try {
      let planId = workout?.id;
      if (!planId) {
        const plan = await workoutsAPI.createPlan(clientId, { name:"Training Plan" }, token);
        planId = plan.id;
      }
      await workoutsAPI.addDay(planId, {
        dayLabel: newDay.dayLabel,
        dayFocus: newDay.dayFocus,
        weekNumber: +newDay.weekNumber || 1,
      }, token);
      setAddingDay(false);
      setNewDay({ dayLabel:"", dayFocus:"", weekNumber:"1" });
      toast.success("Day added");
      reload();
    } catch { toast.error("Failed to add day"); }
    finally { setSaving(false); }
  };

  const addExercise = async (dayId) => {
    if (!newEx.name.trim()) return;
    setSaving(true);
    try {
      await workoutsAPI.addExercise(dayId, { ...newEx, sets:+newEx.sets }, token);
      setAddingEx(null);
      setNewEx({ name:"", sets:"3", reps:"10", notes:"", videoUrl:"" });
      toast.success("Exercise added");
      reload();
    } catch { toast.error("Failed to add exercise"); }
    finally { setSaving(false); }
  };

  const saveEditEx = async () => {
    setSaving(true);
    try {
      await workoutsAPI.updateExercise(editEx.id, {
        name: editEx.name, sets:+editEx.sets, reps:editEx.reps,
        notes:editEx.notes, videoUrl:editEx.video_url,
      }, token);
      setEditEx(null); toast.success("Exercise updated"); reload();
    } catch { toast.error("Failed to update"); }
    finally { setSaving(false); }
  };

  const deleteDay = async () => {
    try { await workoutsAPI.removeDay(confirmDelDay.id, token); toast.success("Day removed"); reload(); }
    catch { toast.error("Failed"); }
    finally { setConfirmDelDay(null); }
  };

  const deleteEx = async () => {
    try { await workoutsAPI.removeExercise(confirmDelEx.id, token); toast.success("Exercise removed"); reload(); }
    catch { toast.error("Failed"); }
    finally { setConfirmDelEx(null); }
  };

  const days  = workout?.days || [];
  const weeks = groupByWeek(days);

  // How many unique weeks exist (to suggest next week number)
  const maxWeek = weeks.length > 0 ? Math.max(...weeks.map(w => w.weekNumber)) : 0;

  return (
    <div>
      {days.length === 0 && !addingDay && (
        <Empty icon="🏋️" title="No workout plan yet"
          subtitle="Add training days organised by week."
          action={() => setAddingDay(true)} actionLabel="+ Add Training Day" />
      )}

      {/* Week accordion */}
      {weeks.map(({ weekNumber, days: wDays }) => (
        <div key={weekNumber} style={{ marginBottom:14 }}>
          {/* Week header */}
          <button onClick={() => toggleWeek(weekNumber)}
            style={{ width:"100%", background:`linear-gradient(135deg, var(--royal-pale), var(--royal-pale2))`, border:"1.5px solid var(--royal-pale2)", borderRadius:"var(--radius)", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"var(--font-body)", marginBottom: openWeeks[weekNumber] ? 8 : 0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"var(--royal)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800 }}>{weekNumber}</div>
              <span style={{ fontWeight:800, fontSize:15, color:"var(--royal)", fontFamily:"var(--font-display)" }}>Week {weekNumber}</span>
              <span style={{ fontSize:12, color:"var(--muted)" }}>{wDays.length} day{wDays.length!==1?"s":""}</span>
            </div>
            <span style={{ color:"var(--royal)", fontSize:16 }}>{openWeeks[weekNumber]?"▲":"▼"}</span>
          </button>

          {/* Days inside week */}
          {openWeeks[weekNumber] && (
            <div style={{ paddingLeft:12 }}>
              {wDays.map((day, dayIdx) => (
                <Card key={day.id} noPad style={{ marginBottom:10, borderLeft:"3px solid var(--royal-pale2)" }}>
                  <button onClick={() => toggleDay(day.id)}
                    style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font-body)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                      <div style={{ width:30, height:30, borderRadius:9, background:"var(--bg2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"var(--text2)" }}>
                        {dayIdx+1}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{day.day_label}</div>
                        <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>{day.day_focus || "—"} · {day.exercises?.length||0} exercises</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <button onClick={e => { e.stopPropagation(); setConfirmDelDay(day); }}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"var(--muted2)", padding:4 }}
                        onMouseEnter={e=>e.target.style.color="var(--rose)"} onMouseLeave={e=>e.target.style.color="var(--muted2)"}>🗑</button>
                      <span style={{ color:"var(--muted)", fontSize:13 }}>{openDays[day.id]?"▲":"▼"}</span>
                    </div>
                  </button>

                  {openDays[day.id] && (
                    <div style={{ borderTop:"1px solid var(--line)", padding:"12px 16px" }}>
                      {day.exercises?.length === 0 && (
                        <p style={{ fontSize:13, color:"var(--muted)", textAlign:"center", padding:"8px 0" }}>No exercises yet.</p>
                      )}
                      {day.exercises?.map(ex => (
                        <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 0", borderBottom:"1px solid var(--line)" }}>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:600, fontSize:14, color:"var(--text)" }}>{ex.name}</div>
                            <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                              <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> × <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span>
                              {ex.notes && <span style={{ fontStyle:"italic" }}> · {ex.notes}</span>}
                            </div>
                            {ex.video_url && <a href={ex.video_url} target="_blank" rel="noreferrer" style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:5, background:"var(--amber)", color:"#fff", borderRadius:7, padding:"3px 9px", fontSize:11, fontWeight:700, textDecoration:"none" }}>▶ Demo</a>}
                          </div>
                          <div style={{ display:"flex", gap:4 }}>
                            <button onClick={() => setEditEx({...ex})} style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:7, padding:"5px 8px", cursor:"pointer", fontSize:12 }}>✏️</button>
                            <button onClick={() => setConfirmDelEx(ex)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"var(--muted2)", padding:4 }}
                              onMouseEnter={e=>e.target.style.color="var(--rose)"} onMouseLeave={e=>e.target.style.color="var(--muted2)"}>✕</button>
                          </div>
                        </div>
                      ))}

                      {addingEx===day.id ? (
                        <div style={{ background:"var(--royal-pale)", borderRadius:12, padding:14, marginTop:12 }}>
                          <Input label="Exercise Name" value={newEx.name} onChange={e=>setNewEx(p=>({...p,name:e.target.value}))} autoFocus />
                          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                            <Input label="Sets" value={newEx.sets} type="number" onChange={e=>setNewEx(p=>({...p,sets:e.target.value}))} />
                            <Input label="Reps" value={newEx.reps} onChange={e=>setNewEx(p=>({...p,reps:e.target.value}))} />
                          </div>
                          <Input label="Notes (optional)" value={newEx.notes} onChange={e=>setNewEx(p=>({...p,notes:e.target.value}))} />
                          <Input label="Video URL (optional)" value={newEx.videoUrl} onChange={e=>setNewEx(p=>({...p,videoUrl:e.target.value}))} />
                          <div style={{ display:"flex", gap:8 }}>
                            <Btn variant="primary" onClick={()=>addExercise(day.id)} loading={saving} full>Add</Btn>
                            <Btn variant="secondary" onClick={()=>setAddingEx(null)} full>Cancel</Btn>
                          </div>
                        </div>
                      ) : (
                        <button onClick={()=>{ setAddingEx(day.id); setNewEx({name:"",sets:"3",reps:"10",notes:"",videoUrl:""}); }}
                          style={{ width:"100%", background:"none", border:"1.5px dashed var(--line2)", borderRadius:10, padding:9, cursor:"pointer", color:"var(--royal)", fontWeight:600, fontSize:13, marginTop:10, fontFamily:"var(--font-body)" }}>
                          + Add Exercise
                        </button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Add Day form */}
      {addingDay ? (
        <Card style={{ marginTop:8 }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>New Training Day</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Day Label" value={newDay.dayLabel} onChange={e=>setNewDay(p=>({...p,dayLabel:e.target.value}))} placeholder="Day 1" autoFocus />
            <Input label="Focus" value={newDay.dayFocus} onChange={e=>setNewDay(p=>({...p,dayFocus:e.target.value}))} placeholder="Upper Body" />
          </div>
          <Input label="Week Number" value={newDay.weekNumber} type="number" onChange={e=>setNewDay(p=>({...p,weekNumber:e.target.value}))} hint={`Currently ${maxWeek} week${maxWeek!==1?"s":""} — enter ${maxWeek+1} to add a new week`} />
          <div style={{ display:"flex", gap:8 }}>
            <Btn variant="primary" onClick={createPlanThenDay} loading={saving} full>Add Day</Btn>
            <Btn variant="secondary" onClick={()=>setAddingDay(false)} full>Cancel</Btn>
          </div>
        </Card>
      ) : (
        days.length > 0 && (
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            <Btn variant="secondary" onClick={()=>{ setAddingDay(true); setNewDay({ dayLabel:"", dayFocus:"", weekNumber: String(maxWeek||1) }); }} full style={{ borderRadius:12 }}>
              + Add Day to Week {maxWeek||1}
            </Btn>
            <Btn variant="ghost" onClick={()=>{ setAddingDay(true); setNewDay({ dayLabel:"", dayFocus:"", weekNumber: String(maxWeek+1) }); }} style={{ borderRadius:12, whiteSpace:"nowrap" }}>
              + New Week
            </Btn>
          </div>
        )
      )}

      {/* Edit Exercise Modal */}
      <Modal open={!!editEx} onClose={()=>setEditEx(null)} title="Edit Exercise">
        {editEx && (
          <div>
            <Input label="Exercise Name" value={editEx.name} onChange={e=>setEditEx(p=>({...p,name:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Input label="Sets" value={editEx.sets} type="number" onChange={e=>setEditEx(p=>({...p,sets:e.target.value}))} />
              <Input label="Reps" value={editEx.reps} onChange={e=>setEditEx(p=>({...p,reps:e.target.value}))} />
            </div>
            <Input label="Notes" value={editEx.notes||""} onChange={e=>setEditEx(p=>({...p,notes:e.target.value}))} />
            <Input label="Video URL" value={editEx.video_url||""} onChange={e=>setEditEx(p=>({...p,video_url:e.target.value}))} />
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={()=>setEditEx(null)} full>Cancel</Btn>
              <Btn variant="primary" onClick={saveEditEx} loading={saving} full>Save</Btn>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal open={!!confirmDelDay} onClose={()=>setConfirmDelDay(null)} onConfirm={deleteDay} title="Remove Day" message={`Remove "${confirmDelDay?.day_label}" and all its exercises?`} confirmLabel="Remove Day" />
      <ConfirmModal open={!!confirmDelEx} onClose={()=>setConfirmDelEx(null)} onConfirm={deleteEx} title="Remove Exercise" message={`Remove "${confirmDelEx?.name}"?`} confirmLabel="Remove" />
    </div>
  );
}

// ─── Client Workout Tab (read-only + checkboxes) ──────────────────────────────
export function ClientWorkoutTab({ workout, logs, onToggle, toggling }) {
  const [openWeeks, setOpenWeeks] = useState({ 1: true });
  const [openDays,  setOpenDays]  = useState({ 0: true }); // first day open by default

  const todayStr = new Date().toISOString().slice(0,10);
  const isExDone = (exId) => logs.some(l => l.exercise_id===exId && l.completed && l.logged_at?.slice(0,10)===todayStr);

  const days  = workout?.days || [];
  const weeks = groupByWeek(days);

  if (days.length === 0) {
    return <Empty icon="🏋️" title="No workout plan yet" subtitle="Your coach is preparing your programme. Check back soon!" />;
  }

  return (
    <div>
      {weeks.map(({ weekNumber, days: wDays }) => {
        const weekDone = wDays.every(d => d.exercises?.length > 0 && d.exercises?.every(e => isExDone(e.id)));
        return (
          <div key={weekNumber} style={{ marginBottom:14 }}>
            <button onClick={() => setOpenWeeks(p => ({...p,[weekNumber]:!p[weekNumber]}))}
              style={{ width:"100%", background:`linear-gradient(135deg, var(--royal-pale), var(--royal-pale2))`, border:`1.5px solid ${weekDone?"var(--emerald)20":"var(--royal-pale2)"}`, borderRadius:"var(--radius)", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", fontFamily:"var(--font-body)", marginBottom:openWeeks[weekNumber]?8:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:28, height:28, borderRadius:8, background:weekDone?"var(--emerald)":"var(--royal)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:800 }}>
                  {weekDone?"✓":weekNumber}
                </div>
                <span style={{ fontWeight:800, fontSize:15, color:weekDone?"var(--emerald)":"var(--royal)", fontFamily:"var(--font-display)" }}>Week {weekNumber}</span>
                <span style={{ fontSize:12, color:"var(--muted)" }}>{wDays.length} day{wDays.length!==1?"s":""}</span>
              </div>
              <span style={{ color:"var(--royal)", fontSize:16 }}>{openWeeks[weekNumber]?"▲":"▼"}</span>
            </button>

            {openWeeks[weekNumber] && (
              <div style={{ paddingLeft:12 }}>
                {wDays.map((day, dayIdx) => {
                  const doneCount  = day.exercises?.filter(e => isExDone(e.id)).length || 0;
                  const totalCount = day.exercises?.length || 0;
                  const dayDone    = totalCount > 0 && doneCount === totalCount;
                  const isOpen     = openDays[day.id];

                  return (
                    <Card key={day.id} noPad style={{ marginBottom:10, borderLeft:`3px solid ${dayDone?"var(--emerald)":"var(--royal-pale2)"}` }}>
                      <button onClick={() => setOpenDays(p => ({...p,[day.id]:!p[day.id]}))}
                        style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"13px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", fontFamily:"var(--font-body)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:10, textAlign:"left" }}>
                          <div style={{ width:30, height:30, borderRadius:9, background:dayDone?"var(--emerald)18":"var(--bg2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:dayDone?"var(--emerald)":"var(--text2)" }}>
                            {dayDone?"✓":dayIdx+1}
                          </div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:14, color:"var(--text)", fontFamily:"var(--font-display)" }}>{day.day_label}</div>
                            <div style={{ fontSize:11, color:"var(--muted)", marginTop:1 }}>{day.day_focus}</div>
                          </div>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:11, fontWeight:700, color:dayDone?"var(--emerald)":"var(--muted)" }}>{doneCount}/{totalCount}</div>
                            <ProgressBar value={totalCount?(doneCount/totalCount)*100:0} color={dayDone?"var(--emerald)":"var(--royal)"} height={4} />
                          </div>
                          <span style={{ color:"var(--muted)", fontSize:13 }}>{isOpen?"▲":"▼"}</span>
                        </div>
                      </button>

                      {isOpen && (
                        <div style={{ borderTop:"1px solid var(--line)", padding:"12px 16px" }}>
                          {day.exercises?.map(ex => {
                            const done = isExDone(ex.id);
                            const busy = toggling === ex.id;
                            return (
                              <div key={ex.id} style={{ display:"flex", alignItems:"flex-start", gap:13, padding:"11px 0", borderBottom:"1px solid var(--line)", opacity:done?0.55:1, transition:"opacity 0.25s" }}>
                                <button onClick={() => onToggle(ex.id)} disabled={busy}
                                  style={{ width:26, height:26, borderRadius:8, flexShrink:0, marginTop:1, background:done?"var(--royal)":"transparent", border:`2px solid ${done?"var(--royal)":"var(--line2)"}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
                                  {busy
                                    ? <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid currentColor", borderTopColor:"transparent", animation:"spin 0.5s linear infinite", display:"block" }} />
                                    : done && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>}
                                </button>
                                <div style={{ flex:1 }}>
                                  <div style={{ fontWeight:600, fontSize:14, color:"var(--text)", textDecoration:done?"line-through":"none" }}>{ex.name}</div>
                                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>
                                    <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> sets × <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span>
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
        );
      })}
    </div>
  );
}
