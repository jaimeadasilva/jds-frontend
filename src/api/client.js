/**
 * src/api/client.js
 * Central API client. All backend calls go through here.
 * Change API_BASE to switch between local and production.
 */

export const API_BASE = import.meta.env.VITE_API_URL || "https://jds-backend-production.up.railway.app";

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data.data ?? data;
}

const get  = (path, token)        => request("GET",    path, null,  token);
const post = (path, body, token)  => request("POST",   path, body,  token);
const patch= (path, body, token)  => request("PATCH",  path, body,  token);
const del  = (path, token)        => request("DELETE", path, null,  token);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          (email, password)      => post("/api/auth/login", { email, password }),
  me:             (token)                => get("/api/auth/me", token),
  changePassword: (body, token)          => post("/api/auth/change-password", body, token),
};

// ─── Clients ──────────────────────────────────────────────────────────────────
export const clientsAPI = {
  list:           (token)                => get("/api/clients", token),
  get:            (id, token)            => get(`/api/clients/${id}`, token),
  create:         (body, token)          => post("/api/clients", body, token),
  update:         (id, body, token)      => patch(`/api/clients/${id}`, body, token),
  summary:        (id, token)            => get(`/api/clients/${id}/summary`, token),
  getEquipment:   (id, token)            => get(`/api/clients/${id}/equipment`, token),
  setEquipment:   (id, items, token)     => request("PUT", `/api/clients/${id}/equipment`, { items }, token),
  logWeight:      (id, kg, token)        => post(`/api/clients/${id}/weight`, { weightKg: kg }, token),
  weightHistory:  (id, token)            => get(`/api/clients/${id}/weight`, token),
};

// ─── Workouts ─────────────────────────────────────────────────────────────────
export const workoutsAPI = {
  getPlan:        (clientId, token)      => get(`/api/workouts/client/${clientId}`, token),
  createPlan:     (clientId, body, token)=> post(`/api/workouts/client/${clientId}`, body, token),
  addDay:         (planId, body, token)  => post(`/api/workouts/plans/${planId}/days`, body, token),
  removeDay:      (dayId, token)         => del(`/api/workouts/days/${dayId}`, token),
  addExercise:    (dayId, body, token)   => post(`/api/workouts/days/${dayId}/exercises`, body, token),
  updateExercise: (exId, body, token)    => patch(`/api/workouts/exercises/${exId}`, body, token),
  removeExercise: (exId, token)          => del(`/api/workouts/exercises/${exId}`, token),
  logExercise:    (exId, done, token)    => post(`/api/workouts/exercises/${exId}/log`, { completed: done }, token),
  getLogs:        (clientId, token)      => get(`/api/workouts/client/${clientId}/logs`, token),
};

// ─── Nutrition ────────────────────────────────────────────────────────────────
export const nutritionAPI = {
  getPlan:        (clientId, token)      => get(`/api/nutrition/client/${clientId}`, token),
  createPlan:     (clientId, body, token)=> post(`/api/nutrition/client/${clientId}`, body, token),
  updatePlan:     (planId, body, token)  => patch(`/api/nutrition/plans/${planId}`, body, token),
  addMeal:        (planId, body, token)  => post(`/api/nutrition/plans/${planId}/meals`, body, token),
  updateMeal:     (mealId, body, token)  => patch(`/api/nutrition/meals/${mealId}`, body, token),
  removeMeal:     (mealId, token)        => del(`/api/nutrition/meals/${mealId}`, token),
};

// ─── Medical ──────────────────────────────────────────────────────────────────
export const medicalAPI = {
  list:           (clientId, token)      => get(`/api/medical/${clientId}`, token),
  add:            (clientId, body, token)=> post(`/api/medical/${clientId}`, body, token),
  remove:         (recordId, token)      => del(`/api/medical/record/${recordId}`, token),
};

// ─── Templates ────────────────────────────────────────────────────────────────
export const templatesAPI = {
  workoutList:    (token)                => get("/api/templates/workout", token),
  nutritionList:  (token)                => get("/api/templates/nutrition", token),
  createWorkout:  (body, token)          => post("/api/templates/workout", body, token),
  createNutrition:(body, token)          => post("/api/templates/nutrition", body, token),
};
