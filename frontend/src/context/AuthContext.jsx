import { createContext, useCallback, useMemo, useState } from "react";
import { useEffect } from "react";

export const AuthContext = createContext(null);

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo123";
const STORAGE_KEY = "demo_logged_in";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem(STORAGE_KEY) === "1" ? "demo" : null,
  );

  const login = useCallback(async (username, password) => {
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, "1");
      setToken("demo");
      return { ok: true };
    }
    throw new Error("Invalid username or password");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  }, []);

  useEffect(() => {
    function handleForcedLogout() {
      logout();
    }
    window.addEventListener("auth:forced-logout", handleForcedLogout);
    return () => window.removeEventListener("auth:forced-logout", handleForcedLogout);
  }, [logout]);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
