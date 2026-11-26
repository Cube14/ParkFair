import { useCallback, useEffect, useState } from "react";
import authService from "../services/authService";
import { sessionEndedEvent } from "../services/api";
import { AuthContext } from "./auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      setUser(await authService.getCurrentUser());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const clearSession = () => setUser(null);
    window.addEventListener(sessionEndedEvent, clearSession);
    void Promise.resolve().then(checkAuth);
    return () => window.removeEventListener(sessionEndedEvent, clearSession);
  }, [checkAuth]);

  async function login(credentials) {
    const data = await authService.login(credentials);
    setUser(data.user);
    return data;
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
