"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Mail, Lock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuthorLoginPage() {
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
      if (data.user.role !== "author") {
        setError("Please use the Admin login for admin accounts");
        await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        return;
      }
      router.push("/author/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 via-emerald-50/30 to-stone-50 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
      <Card className="relative z-10 w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur animate-in">
        <CardHeader className="space-y-4 pb-2">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-serif">Author Login</CardTitle>
            <CardDescription>Sign in to access your author portal</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                <span className="flex-1">{error}</span>
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
                  placeholder="you@example.com"
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
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-center text-stone-600">
            Don&apos;t have an account?{" "}
            <Link href="/author/register" className="text-emerald-600 hover:underline">
              Register
            </Link>
          </p>
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-2 text-sm text-stone-600 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
