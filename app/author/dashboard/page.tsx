"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AuthorDashboardPage() {
  const { user, loading, logout } = useAuth();
  const [stats, setStats] = useState<{
    totalBooks?: number;
    totalRoyalties?: number;
    pendingRoyalties?: number;
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
      <Sidebar role="author" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">Dashboard</h1>
            <p className="text-stone-600 mt-1">Welcome back, {user.name}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                  Total Books
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stone-900">
                  {stats?.totalBooks ?? "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                  Total Royalties Earned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">
                  ₹{stats?.totalRoyalties?.toLocaleString() ?? "—"}
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-stone-500 uppercase tracking-wide">
                  Pending Royalties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-600">
                  ₹{stats?.pendingRoyalties?.toLocaleString() ?? "—"}
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
                <div className="text-3xl font-bold text-stone-900">
                  {stats?.openTickets ?? "—"}
                </div>
                <Link
                  href="/author/tickets/new"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-flex items-center gap-1"
                >
                  Submit a ticket →
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
