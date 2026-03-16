"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<{
    totalTickets?: number;
    openTickets?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => setStats(null));
  }, []);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar role="admin" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">Admin Dashboard</h1>
            <p className="text-stone-600 mt-1">Welcome, {user.name}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                  Total Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stone-900">
                  {stats?.totalTickets ?? "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                  Open Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  {stats?.openTickets ?? "—"}
                </div>
                <Link
                  href="/admin/tickets"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-flex items-center gap-1"
                >
                  View ticket queue →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
