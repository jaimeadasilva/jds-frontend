import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/UI";

import LoginPage        from "./pages/LoginPage";
import CoachHome        from "./pages/CoachHome";
import ClientsListPage  from "./pages/ClientsListPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import { AddClientPage, PlansPage, CoachProfilePage } from "./pages/CoachPages";
import { ClientHome, ClientWorkouts, ClientNutrition, ClientProfile } from "./pages/ClientPages";

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to={user.role === "coach" ? "/coach" : "/client"} replace />;
  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "coach" ? "/coach" : "/client"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/"      element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Coach routes */}
            <Route path="/coach" element={<ProtectedRoute requiredRole="coach"><CoachHome /></ProtectedRoute>} />
            <Route path="/coach/clients" element={<ProtectedRoute requiredRole="coach"><ClientsListPage /></ProtectedRoute>} />
            <Route path="/coach/clients/new" element={<ProtectedRoute requiredRole="coach"><AddClientPage /></ProtectedRoute>} />
            <Route path="/coach/clients/:id" element={<ProtectedRoute requiredRole="coach"><ClientProfilePage /></ProtectedRoute>} />
            <Route path="/coach/plans"   element={<ProtectedRoute requiredRole="coach"><PlansPage /></ProtectedRoute>} />
            <Route path="/coach/profile" element={<ProtectedRoute requiredRole="coach"><CoachProfilePage /></ProtectedRoute>} />

            {/* Client routes */}
            <Route path="/client"           element={<ProtectedRoute requiredRole="client"><ClientHome /></ProtectedRoute>} />
            <Route path="/client/workouts"  element={<ProtectedRoute requiredRole="client"><ClientWorkouts /></ProtectedRoute>} />
            <Route path="/client/nutrition" element={<ProtectedRoute requiredRole="client"><ClientNutrition /></ProtectedRoute>} />
            <Route path="/client/profile"   element={<ProtectedRoute requiredRole="client"><ClientProfile /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
