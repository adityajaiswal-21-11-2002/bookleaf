"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.user.role !== "admin") {
        setError("Please use the Author login for author accounts");
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        return;
      }
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 via-stone-100/50 to-stone-50 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-200/40 via-transparent to-transparent" />
      <Card className="relative z-10 w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur animate-in">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-stone-700 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-serif">Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-stone-700">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-11"
                  placeholder="admin@bookleaf.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-stone-700">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-11"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-stone-800 hover:bg-stone-900"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <Link
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
