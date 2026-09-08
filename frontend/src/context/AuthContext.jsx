import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [banInfo, setBanInfo] = useState(null); // { stage, bannedUntil, reason } shown on login attempt

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMe(); }, [fetchMe]);

  // Poll /auth/me occasionally so an active session shows a ban popup
  // as soon as the admin bans the account (without needing a manual refresh).
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
      } catch (err) {
        if (err.response?.status === 403 && err.response.data?.ban) {
          setBanInfo(err.response.data.ban);
          localStorage.removeItem("token");
          setUser(null);
        }
      }
    }, 30000);
    return () => clearInterval(id);
  }, [user]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      if (err.response?.status === 403 && err.response.data?.ban) {
        setBanInfo(err.response.data.ban);
      }
      return { ok: false, message: err.response?.data?.message || "Login failed" };
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      localStorage.setItem("token", data.token);
      setUser(data.user);
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Registration failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser, banInfo, setBanInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
