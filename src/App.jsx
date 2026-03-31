import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Spinner } from "./components/UI";

import LoginPage         from "./pages/LoginPage";
import CoachHome         from "./pages/CoachHome";
import ClientsListPage   from "./pages/ClientsListPage";
import ClientProfilePage from "./pages/ClientProfilePage";
import { AddClientPage, PlansPage, CoachProfilePage } from "./pages/CoachPages";
import { ClientHome, ClientWorkouts, ClientNutrition, ClientMedical, ClientProfile } from "./pages/ClientPages";

function Guard({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role==="coach"?"/coach":"/client"} replace />;
  return children;
}

function Root() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:"flex", height:"100vh", alignItems:"center", justifyContent:"center" }}><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role==="coach"?"/coach":"/client"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Routes>
            <Route path="/"      element={<Root />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Coach */}
            <Route path="/coach"              element={<Guard role="coach"><CoachHome /></Guard>} />
            <Route path="/coach/clients"      element={<Guard role="coach"><ClientsListPage /></Guard>} />
            <Route path="/coach/clients/new"  element={<Guard role="coach"><AddClientPage /></Guard>} />
            <Route path="/coach/clients/:id"  element={<Guard role="coach"><ClientProfilePage /></Guard>} />
            <Route path="/coach/plans"        element={<Guard role="coach"><PlansPage /></Guard>} />
            <Route path="/coach/profile"      element={<Guard role="coach"><CoachProfilePage /></Guard>} />

            {/* Client */}
            <Route path="/client"             element={<Guard role="client"><ClientHome /></Guard>} />
            <Route path="/client/workouts"    element={<Guard role="client"><ClientWorkouts /></Guard>} />
            <Route path="/client/nutrition"   element={<Guard role="client"><ClientNutrition /></Guard>} />
            <Route path="/client/medical"     element={<Guard role="client"><ClientMedical /></Guard>} />
            <Route path="/client/profile"     element={<Guard role="client"><ClientProfile /></Guard>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
