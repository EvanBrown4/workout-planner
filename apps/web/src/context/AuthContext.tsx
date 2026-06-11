import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("http://localhost:4000/v1/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  async function login(email: string, password: string) {
    try {
      const loginRes = await fetch("http://localhost:4000/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json();
        throw new Error(err.message ?? "Login failed");
      }

      console.log("Login response ok, fetching /me");

      const meRes = await fetch("http://localhost:4000/v1/auth/me", {
        credentials: "include",
      });

      if (!meRes.ok) {
        throw new Error("Login failed");
      }

      const data = await meRes.json();
      setUser(data);
    } catch (err) {
      console.log(err)
      if (err instanceof TypeError) {
        throw new Error("Unable to r  each the server. Please try again later.");
      }
      throw err;
    }
  }

  async function logout() {
    await fetch("http://localhost:4000/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}