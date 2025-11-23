import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  email: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USERS_KEY = "mock_users";
const SESSION_KEY = "mock_session";

function readUsers(): { email: string; pass: string }[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as { email: string; pass: string }[];
  } catch (e) {
    return [];
  }
}

function writeUsers(users: { email: string; pass: string }[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem(SESSION_KEY);
    if (s) {
      try {
        const parsed = JSON.parse(s) as User;
        setUser(parsed);
      } catch (e) {
        // ignore
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = readUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.pass === password);
    if (found) {
      const u = { email: found.email };
      setUser(u);
      localStorage.setItem(SESSION_KEY, JSON.stringify(u));
      toast.success("Logged in");
      return true;
    }
    toast.error("Invalid credentials");
    return false;
  };

  const signup = async (email: string, password: string) => {
    const users = readUsers();
    const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      toast.error("An account with this email already exists");
      return false;
    }
    users.push({ email, pass: password });
    writeUsers(users);
    const u = { email };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    toast.success("Account created and logged in");
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
    toast.success("Logged out");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default AuthContext;
