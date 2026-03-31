import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

// Normalise user object — backend returns fullName (login) or full_name (me)
function normaliseUser(u) {
  if (!u) return null;
  return {
    ...u,
    full_name: u.full_name || u.fullName || "",
    fullName:  u.fullName  || u.full_name || "",
  };
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("jds_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authAPI.me(token)
      .then(data => setUser(normaliseUser(data.user)))
      .catch(() => { localStorage.removeItem("jds_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem("jds_token", data.token);
    setToken(data.token);
    setUser(normaliseUser(data.user));
    return data;
  };

  const logout = () => {
    localStorage.removeItem("jds_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
