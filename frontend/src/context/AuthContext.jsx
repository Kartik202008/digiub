import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const login = (userData, authToken) => {
    let u = userData;
    let t = authToken;

    // Support single object argument: login({ user, token })
    if (userData && typeof userData === "object" && !authToken && userData.token) {
      t = userData.token;
      u = userData.user;
    }
    // Support reversed arguments: login(token, user)
    if (typeof userData === "string" && typeof authToken === "object") {
      t = userData;
      u = authToken;
    }

    let finalUser = u;
    if (typeof u === "string") {
      try {
        finalUser = JSON.parse(u);
      } catch {
        finalUser = { name: u };
      }
    }

    // 1. Update persistent localStorage
    if (t) {
      localStorage.setItem("token", t);
    }
    if (finalUser) {
      localStorage.setItem("user", JSON.stringify(finalUser));
    }

    // 2. Update React state immediately to trigger re-renders
    setToken(t || null);
    setUser(finalUser || null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // Sync state if localStorage changes from another tab or window
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? JSON.parse(e.newValue) : null);
        } catch {
          setUser(null);
        }
      }
      if (e.key === "token") {
        setToken(e.newValue || null);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
