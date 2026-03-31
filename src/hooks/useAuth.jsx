import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

function normaliseUser(user, clientProfile) {
  if (!user) return null;
  // Merge clientProfile fields into user so weight_kg, height_cm, goal are accessible everywhere
  return {
    ...clientProfile,   // weight_kg, height_cm, goal, progress_pct, avatar_initials
    ...user,            // id, email, role, full_name — overrides any clientProfile fields with same name
    full_name: user.full_name || user.fullName || clientProfile?.full_name || "",
    fullName:  user.fullName  || user.full_name || clientProfile?.full_name || "",
  };
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("jds_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authAPI.me(token)
      .then(data => setUser(normaliseUser(data.user, data.clientProfile)))
      .catch(() => { localStorage.removeItem("jds_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem("jds_token", data.token);
    setToken(data.token);
    setUser(normaliseUser(data.user, data.clientProfile));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("jds_token");
    setToken(null);
    setUser(null);
  };

  // Called when client logs a new weight so home stats update immediately
  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await authAPI.me(token);
      setUser(normaliseUser(data.user, data.clientProfile));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
