// AdminContext — Firebase Authentication for admin panel
// Design: "Caderno de Aventuras" — admin-only features

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

interface AdminContextType {
  isAdmin: boolean;
  adminUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginError: string | null;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAdminUser(user);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setLoginError("Email ou senha incorretos.");
      } else if (error.code === "auth/user-not-found") {
        setLoginError("Usuário não encontrado.");
      } else if (error.code === "auth/too-many-requests") {
        setLoginError("Muitas tentativas. Tente mais tarde.");
      } else {
        setLoginError("Erro ao fazer login. Firebase configurado?");
      }
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin: !!adminUser,
        adminUser,
        login,
        logout,
        loginError,
        isLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
