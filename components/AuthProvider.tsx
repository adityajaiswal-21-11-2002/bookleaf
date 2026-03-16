"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: "author" | "admin";
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "author" | "admin";
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname?.includes("/login");

  const refetch = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (!loading && requiredRole && !isLoginPage) {
      if (!user) {
        router.replace(`/${requiredRole}/login`);
      } else if (user.role !== requiredRole) {
        router.replace("/");
      }
    }
  }, [user, loading, requiredRole, router, isLoginPage]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    router.replace(`/${requiredRole}/login`);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
