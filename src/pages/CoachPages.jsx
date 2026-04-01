import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { clientsAPI, templatesAPI } from "../api/client";
import {
  Card, Btn, Input, Select, Textarea, TopBar, ErrorMsg,
  SectionHeader, Empty, Badge, Spinner, PillTabs
} from "../components/UI";
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
  const [section,      setSection]      = useState("workout");
  const [wTemplates,   setWTemplates]   = useState([]);
  const [nTemplates,   setNTemplates]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [editTemplate, setEditTemplate] = useState(null); // null | template object
  const [showNewN,     setShowNewN]     = useState(false);
  const [newN,         setNewN]         = useState({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
  const [savingN,      setSavingN]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting,      setDeleting]     = useState(false);

  const load = useCallback(async () => {
    try {
      const [w, n] = await Promise.all([
        templatesAPI.workoutList(token),
        templatesAPI.nutritionList(token),
      ]);
      setWTemplates(Array.isArray(w) ? w : []);
      setNTemplates(Array.isArray(n) ? n : []);
    } catch { toast.error("Failed to load templates"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const createN = async () => {
    if (!newN.name.trim()) return;
    setSavingN(true);
    try {
      const t = await templatesAPI.createNutrition({
        name: newN.name,
        calories: +newN.calories || 2000,
        proteinG: +newN.proteinG || 150,
        carbsG:   +newN.carbsG   || 200,
        fatsG:    +newN.fatsG    || 65,
      }, token);
      setNTemplates(p => [t, ...p]);
      setShowNewN(false);
      setNewN({ name:"", calories:"", proteinG:"", carbsG:"", fatsG:"" });
      toast.success("Nutrition template created");
    } catch { toast.error("Failed to create template"); }
    finally { setSavingN(false); }
  };

  const deleteTemplate = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.type === "workout") {
        await templatesAPI.deleteWorkout(confirmDelete.id, token);
        setWTemplates(p => p.filter(t => t.id !== confirmDelete.id));
      } else {
        await templatesAPI.deleteNutrition(confirmDelete.id, token);
        setNTemplates(p => p.filter(t => t.id !== confirmDelete.id));
      }
      toast.success("Template deleted");
      setConfirmDelete(null);
    } catch { toast.error("Failed to delete template"); }
    finally { setDeleting(false); }
  };

  // If we're in the template builder, render it full-screen
  if (editTemplate !== null) {
    return (
      <WorkoutTemplateBuilder
        template={editTemplate}
        token={token}
        toast={toast}
        onSaved={(updated) => {
          setWTemplates(p => {
            const idx = p.findIndex(t => t.id === updated.id);
            if (idx >= 0) { const n = [...p]; n[idx] = updated; return n; }
            return [updated, ...p];
          });
          setEditTemplate(null);
        }}
        onClose={() => setEditTemplate(null)}
      />
    );
  }

  return (
    <div className="page">
      <TopBar title="Plans" subtitle="Templates & Programs" />
      <div style={{ padding:"16px 20px" }}>
        <div style={{ marginBottom:22 }}>
          <PillTabs
            tabs={[{ id:"workout", label:"🏋️  Workouts" }, { id:"nutrition", label:"🍎  Nutrition" }]}
            active={section}
            onChange={setSection}
          />
        </div>

        {loading ? <Spinner /> : section === "workout" ? (
          <>
            <SectionHeader title={`${wTemplates.length} Workout Template${wTemplates.length !== 1 ? "s" : ""}`} />
            {wTemplates.length === 0 && (
              <Empty icon="📋" title="No workout templates yet"
                subtitle="Create reusable programmes with full exercise details — sets, reps, tempo, and coaching notes." />
            )}

            {wTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:"var(--text)", fontFamily:"var(--font-display)" }}>{t.name}</div>
                    <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                      {t.days} days/week{t.focus ? ` · ${t.focus}` : ""}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
                      <Badge
                        label={`${t.exercises?.length || 0} exercise${(t.exercises?.length || 0) !== 1 ? "s" : ""}`}
                        color="var(--royal)"
                      />
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    <Btn variant="secondary" size="sm" onClick={() => setEditTemplate(t)}>
                      ✏️ Edit
                    </Btn>
                    <button
                      onClick={() => setConfirmDelete({ id:t.id, name:t.name, type:"workout" })}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted2)", padding:"4px 6px" }}
                      onMouseEnter={e => e.target.style.color="var(--rose)"}
                      onMouseLeave={e => e.target.style.color="var(--muted2)"}>
                      🗑
                    </button>
                  </div>
                </div>

                {/* Exercise preview */}
                {t.exercises?.length > 0 && (
                  <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid var(--line)" }}>
                    {t.exercises.slice(0, 3).map((ex, i) => (
                      <div key={ex.id} style={{ display:"flex", gap:10, padding:"5px 0", borderBottom:"1px solid var(--line)" }}>
                        <span style={{ fontSize:12, color:"var(--muted2)", width:18, flexShrink:0 }}>{i+1}.</span>
                        <div>
                          <span style={{ fontSize:13, fontWeight:600, color:"var(--text2)" }}>{ex.name}</span>
                          <span style={{ fontSize:12, color:"var(--muted)", marginLeft:8 }}>
                            {ex.sets} × {ex.reps}{ex.tempo ? ` · ${ex.tempo}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                    {t.exercises.length > 3 && (
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:6, fontStyle:"italic" }}>
                        +{t.exercises.length - 3} more exercise{t.exercises.length - 3 !== 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}

            <Btn variant="primary" onClick={() => setEditTemplate({ id:"new" })} full style={{ marginTop:8, borderRadius:12 }}>
              + New Workout Template
            </Btn>
          </>
        ) : (
          <>
            <SectionHeader title={`${nTemplates.length} Nutrition Template${nTemplates.length !== 1 ? "s" : ""}`} />
            {nTemplates.length === 0 && !showNewN && (
              <Empty icon="🥗" title="No nutrition templates"
                subtitle="Create calorie and macro templates to assign to clients quickly." />
            )}
            {nTemplates.map(t => (
              <Card key={t.id} style={{ marginBottom:12 }}>
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
                  <button
                    onClick={() => setConfirmDelete({ id:t.id, name:t.name, type:"nutrition" })}
                    style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--muted2)", padding:"4px 6px" }}
                    onMouseEnter={e => e.target.style.color="var(--rose)"}
                    onMouseLeave={e => e.target.style.color="var(--muted2)"}>
                    🗑
                  </button>
                </div>
              </Card>
            ))}

            {showNewN ? (
              <Card style={{ marginTop:8 }}>
                <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>
                  New Nutrition Template
                </p>
                <Input label="Template Name" value={newN.name} onChange={e => setNewN(p => ({...p, name:e.target.value}))} placeholder="e.g. 1700 kcal Fat Loss" autoFocus />
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  <Input label="Calories (kcal)" value={newN.calories} type="number" onChange={e => setNewN(p => ({...p, calories:e.target.value}))} />
                  <Input label="Protein (g)" value={newN.proteinG} type="number" onChange={e => setNewN(p => ({...p, proteinG:e.target.value}))} />
                  <Input label="Carbs (g)" value={newN.carbsG} type="number" onChange={e => setNewN(p => ({...p, carbsG:e.target.value}))} />
                  <Input label="Fats (g)" value={newN.fatsG} type="number" onChange={e => setNewN(p => ({...p, fatsG:e.target.value}))} />
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn variant="primary" onClick={createN} loading={savingN} full>Create Template</Btn>
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

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={deleteTemplate}
        loading={deleting}
        title="Delete Template"
        message={`Delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete Template"
      />

      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}

// ─── Workout Template Builder ─────────────────────────────────────────────────
function WorkoutTemplateBuilder({ template, token, toast, onSaved, onClose }) {
  const isNew = template.id === "new";

  // Meta state
  const [name,  setName]  = useState(template.name  || "");
  const [days,  setDays]  = useState(template.days  || 3);
  const [focus, setFocus] = useState(template.focus || "");

  // Exercises — loaded from DB for existing, empty for new
  const [exercises, setExercises] = useState(template.exercises || []);
  const [loading,   setLoading]   = useState(!isNew && (!template.exercises));
  const [saving,    setSaving]    = useState(false);

  // Exercise form
  const blankEx = { name:"", sets:"3", reps:"10", tempo:"", notes:"", videoUrl:"" };
  const [addingEx,  setAddingEx]  = useState(false);
  const [exForm,    setExForm]    = useState(blankEx);
  const [editEx,    setEditEx]    = useState(null);
  const [exSaving,  setExSaving]  = useState(false);
  const [confirmDelEx, setConfirmDelEx] = useState(null);

  const setE = k => e => setExForm(p => ({ ...p, [k]: e.target.value }));

  // Load existing template exercises if not already loaded
  useEffect(() => {
    if (!isNew && !template.exercises) {
      templatesAPI.workoutGet(template.id, token)
        .then(t => { setExercises(t.exercises || []); })
        .catch(() => toast.error("Failed to load template"))
        .finally(() => setLoading(false));
    }
  }, []);

  // ── Save template meta + all exercises (for new templates) ─────────────────
  const saveNew = async () => {
    if (!name.trim()) { toast.error("Please add a template name"); return; }
    setSaving(true);
    try {
      const saved = await templatesAPI.createWorkout({
        name: name.trim(),
        days: +days,
        focus,
        exercises: exercises.map((ex, i) => ({ ...ex, sortOrder: i })),
      }, token);
      toast.success("Template saved ✓");
      onSaved(saved);
    } catch { toast.error("Failed to save template"); setSaving(false); }
  };

  // ── Save meta update (for existing templates) ──────────────────────────────
  const saveMeta = async () => {
    if (!name.trim()) { toast.error("Please add a template name"); return; }
    setSaving(true);
    try {
      const updated = await templatesAPI.updateWorkout(template.id, { name: name.trim(), days: +days, focus }, token);
      // Get fresh data with exercises
      const full = await templatesAPI.workoutGet(template.id, token);
      toast.success("Template updated ✓");
      onSaved(full);
    } catch { toast.error("Failed to update template"); setSaving(false); }
  };

  // ── Add exercise to existing template (live DB save) ──────────────────────
  const addExercise = async () => {
    if (!exForm.name.trim()) return;
    setExSaving(true);
    try {
      if (isNew) {
        // For new templates, just accumulate in state (saved all at once later)
        setExercises(p => [...p, { ...exForm, id: `local_${Date.now()}` }]);
        setExForm(blankEx); setAddingEx(false);
      } else {
        // For existing templates, save immediately to DB
        const saved = await templatesAPI.addExercise(template.id, {
          name: exForm.name.trim(), sets: +exForm.sets, reps: exForm.reps,
          tempo: exForm.tempo, notes: exForm.notes, videoUrl: exForm.videoUrl,
        }, token);
        setExercises(p => [...p, saved]);
        setExForm(blankEx); setAddingEx(false);
        toast.success("Exercise added");
      }
    } catch { toast.error("Failed to add exercise"); }
    finally { setExSaving(false); }
  };

  // ── Update exercise ────────────────────────────────────────────────────────
  const saveEditEx = async () => {
    if (!editEx.name?.trim()) return;
    setExSaving(true);
    try {
      if (isNew || editEx.id?.startsWith("local_")) {
        // Local state only
        setExercises(p => p.map(e => e.id === editEx.id ? editEx : e));
        setEditEx(null);
      } else {
        const updated = await templatesAPI.updateExercise(template.id, editEx.id, {
          name: editEx.name.trim(), sets: +editEx.sets, reps: editEx.reps,
          tempo: editEx.tempo, notes: editEx.notes, videoUrl: editEx.video_url,
        }, token);
        setExercises(p => p.map(e => e.id === updated.id ? updated : e));
        setEditEx(null);
        toast.success("Exercise updated");
      }
    } catch { toast.error("Failed to update exercise"); }
    finally { setExSaving(false); }
  };

  // ── Delete exercise ────────────────────────────────────────────────────────
  const deleteExercise = async () => {
    const ex = confirmDelEx;
    if (!ex) return;
    try {
      if (!isNew && !ex.id?.startsWith("local_")) {
        await templatesAPI.deleteExercise(template.id, ex.id, token);
        toast.success("Exercise removed");
      }
      setExercises(p => p.filter(e => e.id !== ex.id));
      setConfirmDelEx(null);
    } catch { toast.error("Failed to delete exercise"); }
  };

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:60 }}><div style={{ width:28, height:28, borderRadius:"50%", border:"2.5px solid var(--line)", borderTopColor:"var(--royal)", animation:"spin 0.65s linear infinite" }} /></div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--bg)", zIndex:500, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ background:"var(--white)", borderBottom:"1px solid var(--line)", padding:"14px 20px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <button onClick={onClose}
          style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:9, padding:"7px 12px", cursor:"pointer", fontSize:13, fontWeight:600, color:"var(--text2)", fontFamily:"var(--font-body)", whiteSpace:"nowrap" }}>
          ← Back
        </button>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:10, color:"var(--muted)", fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase" }}>
            {isNew ? "New Template" : "Edit Template"}
          </div>
          <div style={{ fontWeight:700, fontSize:16, color:"var(--text)", fontFamily:"var(--font-display)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
            {name || "Untitled"}
          </div>
        </div>
        <Btn variant="primary" onClick={isNew ? saveNew : saveMeta} loading={saving} size="sm">
          {isNew ? "Save Template" : "Save Changes"}
        </Btn>
      </div>

      {/* Scrollable content */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
        {/* Meta */}
        <Card style={{ marginBottom:20 }}>
          <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>Template Details</p>
          <Input label="Template Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. 3-Day Full Body Strength" autoFocus />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Input label="Days / Week" value={days} type="number" onChange={e => setDays(e.target.value)} />
            <Input label="Focus / Type" value={focus} onChange={e => setFocus(e.target.value)} placeholder="Full Body, Upper/Lower…" />
          </div>
          {!isNew && (
            <p style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>
              💡 Exercises save immediately when added or edited
            </p>
          )}
        </Card>

        {/* Exercises */}
        <SectionHeader title={`Exercises (${exercises.length})`} />

        {exercises.length === 0 && !addingEx && (
          <Empty icon="💪" title="No exercises yet"
            subtitle="Add exercises with sets, reps, tempo, and coaching notes." />
        )}

        {exercises.map((ex, i) => (
          <Card key={ex.id} style={{ marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:"var(--muted2)", fontWeight:600 }}>{i+1}.</span>
                  <span style={{ fontWeight:700, fontSize:14, color:"var(--text)" }}>{ex.name}</span>
                </div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>
                  <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.sets}</span> sets ×{" "}
                  <span style={{ fontWeight:700, color:"var(--royal)" }}>{ex.reps}</span> reps
                  {ex.tempo && <span style={{ marginLeft:8 }}>· Tempo: <strong>{ex.tempo}</strong></span>}
                </div>
                {ex.notes && (
                  <div style={{ fontSize:12, color:"var(--text2)", marginTop:4, fontStyle:"italic" }}>
                    📌 {ex.notes}
                  </div>
                )}
                {(ex.videoUrl || ex.video_url) && (
                  <a href={ex.videoUrl || ex.video_url} target="_blank" rel="noreferrer"
                    style={{ display:"inline-flex", alignItems:"center", gap:4, marginTop:6, background:"var(--amber)", color:"#fff", borderRadius:7, padding:"3px 10px", fontSize:11, fontWeight:700, textDecoration:"none" }}>
                    ▶ Demo
                  </a>
                )}
              </div>
              <div style={{ display:"flex", gap:5, flexShrink:0 }}>
                <button onClick={() => setEditEx({ ...ex })}
                  style={{ background:"var(--bg2)", border:"1px solid var(--line)", borderRadius:7, padding:"5px 8px", cursor:"pointer", fontSize:12 }}>
                  ✏️
                </button>
                <button onClick={() => setConfirmDelEx(ex)}
                  style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, color:"var(--muted2)", padding:4 }}
                  onMouseEnter={e => e.target.style.color="var(--rose)"}
                  onMouseLeave={e => e.target.style.color="var(--muted2)"}>
                  ✕
                </button>
              </div>
            </div>
          </Card>
        ))}

        {/* Add exercise form */}
        {addingEx ? (
          <Card style={{ marginTop:8, background:"var(--royal-pale)", border:"1.5px solid var(--royal-pale2)" }}>
            <p style={{ fontWeight:700, fontSize:14, color:"var(--text)", marginBottom:14, fontFamily:"var(--font-display)" }}>
              Add Exercise
            </p>
            <Input label="Exercise Name *" value={exForm.name} onChange={setE("name")} placeholder="e.g. Barbell Back Squat" autoFocus />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <Input label="Sets" value={exForm.sets} type="number" onChange={setE("sets")} />
              <Input label="Reps" value={exForm.reps} onChange={setE("reps")} placeholder="8–12" />
              <Input label="Tempo" value={exForm.tempo} onChange={setE("tempo")} placeholder="3-1-1-0" hint="Ecc-Pause-Con-Top" />
            </div>
            <Textarea label="Coaching Notes (optional)" value={exForm.notes} onChange={setE("notes")} placeholder="e.g. Keep chest up, brace core throughout" rows={2} />
            <Input label="Video Demo URL (optional)" value={exForm.videoUrl} onChange={setE("videoUrl")} placeholder="https://youtube.com/..." />
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <Btn variant="primary" onClick={addExercise} loading={exSaving} full>
                {isNew ? "Add to List" : "Add & Save"}
              </Btn>
              <Btn variant="secondary" onClick={() => { setAddingEx(false); setExForm(blankEx); }} full>
                Cancel
              </Btn>
            </div>
          </Card>
        ) : (
          <button onClick={() => setAddingEx(true)}
            style={{ width:"100%", background:"none", border:"1.5px dashed var(--line2)", borderRadius:"var(--radius)", padding:12, cursor:"pointer", color:"var(--royal)", fontWeight:600, fontSize:14, marginTop:8, fontFamily:"var(--font-body)", transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background="var(--royal-pale)"}
            onMouseLeave={e => e.currentTarget.style.background="none"}>
            + Add Exercise
          </button>
        )}

        {/* Bottom save button for visibility */}
        <div style={{ marginTop:24, paddingTop:16, borderTop:"1px solid var(--line)" }}>
          <Btn variant="primary" onClick={isNew ? saveNew : saveMeta} loading={saving} full size="lg" style={{ borderRadius:12 }}>
            {isNew ? "💾 Save Template" : "💾 Save Changes"}
          </Btn>
        </div>
      </div>

      {/* Edit Exercise Modal */}
      <Modal open={!!editEx} onClose={() => setEditEx(null)} title="Edit Exercise">
        {editEx && (
          <div>
            <Input label="Exercise Name" value={editEx.name} onChange={e => setEditEx(p => ({...p, name:e.target.value}))} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              <Input label="Sets" value={editEx.sets} type="number" onChange={e => setEditEx(p => ({...p, sets:e.target.value}))} />
              <Input label="Reps" value={editEx.reps} onChange={e => setEditEx(p => ({...p, reps:e.target.value}))} />
              <Input label="Tempo" value={editEx.tempo||""} onChange={e => setEditEx(p => ({...p, tempo:e.target.value}))} placeholder="3-1-1-0" />
            </div>
            <Textarea label="Coaching Notes" value={editEx.notes||""} onChange={e => setEditEx(p => ({...p, notes:e.target.value}))} rows={2} />
            <Input label="Video URL" value={editEx.videoUrl || editEx.video_url || ""} onChange={e => setEditEx(p => ({...p, video_url:e.target.value, videoUrl:e.target.value}))} />
            <div style={{ display:"flex", gap:10 }}>
              <Btn variant="secondary" onClick={() => setEditEx(null)} full>Cancel</Btn>
              <Btn variant="primary" onClick={saveEditEx} loading={exSaving} full>Save Changes</Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm delete exercise */}
      <ConfirmModal
        open={!!confirmDelEx}
        onClose={() => setConfirmDelEx(null)}
        onConfirm={deleteExercise}
        title="Remove Exercise"
        message={`Remove "${confirmDelEx?.name}" from this template?`}
        confirmLabel="Remove"
      />
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
    { icon:"🔒", label:"Privacy & Security", sub:"Password, data, account settings" },
    { icon:"💬", label:"Support",            sub:"Help centre and contact" },
  ];

  return (
    <div className="page">
      <TopBar title="Profile" subtitle="JDS Clinic" />
      <div style={{ padding:"0 20px 24px" }}>
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
          style={{ width:"100%", marginTop:20, background:"var(--rose-pale)", color:"var(--rose)", border:"1px solid #FECDD3", borderRadius:"var(--radius)", padding:15, cursor:"pointer", fontWeight:700, fontSize:15, fontFamily:"var(--font-body)" }}>
          Sign Out
        </button>
        <p style={{ textAlign:"center", fontSize:11, color:"var(--muted2)", marginTop:16 }}>JDS Fitness Platform · v2.0</p>
      </div>
      <BottomNav tabs={COACH_TABS} />
    </div>
  );
}
