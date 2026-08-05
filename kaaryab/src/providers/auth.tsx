"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { Role, User } from "@/lib/types";
import { users as seedUsers } from "@/lib/data/users";
import { load, save } from "@/lib/storage";

interface AuthContextValue {
  users: User[];
  currentUser: User | null;
  login: (email: string, password: string, remember: boolean) => { ok: boolean; error?: string; user?: User };
  register: (name: string, email: string, password: string, role: Role) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  verifyEmail: () => void;
  resetPassword: (email: string, newPassword: string) => { ok: boolean; error?: string };
  setUsers: (fn: (prev: User[]) => User[]) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const USERS_KEY = "kaaryab:users";
const SESSION_KEY = "kaaryab:session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsersState] = useState<User[]>(() => {
    if (typeof window === "undefined") return seedUsers;
    return load<User[] | null>(USERS_KEY, null) ?? seedUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const session = load<{ id: string; remember: boolean } | null>(SESSION_KEY, null);
    if (!session) return null;
    const storedUsers = load<User[] | null>(USERS_KEY, null) ?? seedUsers;
    return storedUsers.find((u) => u.id === session.id) ?? null;
  });

  const persistUsers = (next: User[]) => {
    setUsersState(next);
    save(USERS_KEY, next);
    if (currentUser) {
      const updated = next.find((u) => u.id === currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        save(SESSION_KEY, { id: updated.id, remember: !!updated.rememberMe });
      }
    }
  };

  const login = useCallback(
    (email: string, password: string, remember: boolean) => {
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
      );
      if (!user) return { ok: false, error: "invalidCredentials" };
      const updated = { ...user, rememberMe: remember };
      const next = users.map((u) => (u.id === user.id ? updated : u));
      save(USERS_KEY, next);
      save(SESSION_KEY, { id: user.id, remember });
      setUsersState(next);
      setCurrentUser(updated);
      return { ok: true, user: updated };
    },
    [users]
  );

  const register = useCallback(
    (name: string, email: string, password: string, role: Role) => {
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase().trim())) {
        return { ok: false, error: "emailExists" };
      }
      const user: User = {
        id: `u_${Date.now().toString(36)}`,
        name,
        email: email.trim().toLowerCase(),
        password,
        role,
        createdAt: new Date().toISOString(),
        verified: false,
        badges: [],
        reputation: 0,
        applicantProfile: role === "applicant" ? { skills: [], languages: [], education: [], experience: [], projects: [], certificates: [], awards: [] } : undefined,
      };
      const next = [...users, user];
      save(USERS_KEY, next);
      save(SESSION_KEY, { id: user.id, remember: true });
      setUsersState(next);
      setCurrentUser(user);
      return { ok: true, user };
    },
    [users]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    save(SESSION_KEY, null);
  }, []);

  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!currentUser) return;
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      const next = users.map((u) => (u.id === updated.id ? updated : u));
      save(USERS_KEY, next);
      save(SESSION_KEY, { id: updated.id, remember: !!updated.rememberMe });
      setUsersState(next);
    },
    [currentUser, users]
  );

  const verifyEmail = useCallback(() => {
    if (!currentUser) return;
    updateUser({ verified: true });
  }, [currentUser, updateUser]);

  const resetPassword = useCallback(
    (email: string, newPassword: string) => {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) return { ok: false, error: "notFound" };
      const updated = { ...user, password: newPassword };
      const next = users.map((u) => (u.id === updated.id ? updated : u));
      save(USERS_KEY, next);
      setUsersState(next);
      if (currentUser?.id === updated.id) setCurrentUser(updated);
      return { ok: true };
    },
    [users, currentUser]
  );

  const setUsers = (fn: (prev: User[]) => User[]) => {
    const next = fn(users);
    persistUsers(next);
  };

  return (
    <AuthContext.Provider
      value={{ users, currentUser, login, register, logout, updateUser, verifyEmail, resetPassword, setUsers }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
