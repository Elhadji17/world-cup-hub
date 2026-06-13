// src/hooks/useAuth.js — sans JSX (fichier .js)
import { createContext, useContext, useState, useCallback, createElement } from "react";

const API = import.meta.env.VITE_API_URL ?? "";
const TOKEN_KEY = "wch_token";
const USER_KEY  = "wch_user";

function loadUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); }
  catch { return null; }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(loadUser);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const register = useCallback(async (username, email, password) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur inscription.");
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem("playerName", data.user.username);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally { setLoading(false); }
  }, []);

  const login = useCallback(async (username, password) => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Identifiants incorrects.");
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem("playerName", data.user.username);
      setUser(data.user);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally { setLoading(false); }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("playerName");
    setUser(null);
  }, []);

  // createElement à la place de JSX pour rester en .js
  return createElement(
    AuthContext.Provider,
    { value: { user, loading, error, login, register, logout } },
    children
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
