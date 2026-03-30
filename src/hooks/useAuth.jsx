/**
 * src/hooks/useAuth.jsx
 * Global auth state via React Context.
 * Persists token to localStorage so user stays logged in on refresh.
 */

import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("jds_token"));
  const [loading, setLoading] = useState(true);

  // On mount — verify stored token
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    authAPI.me(token)
      .then(data => { setUser(data.user); })
      .catch(() => { localStorage.removeItem("jds_token"); setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem("jds_token", data.token);
    setToken(data.token);
    setUser(data.user);
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
