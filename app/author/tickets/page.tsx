"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { useTicketUpdates } from "@/components/useSocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Ticket = {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  bookId?: { title: string };
};

export default function AuthorTicketsPage() {
  const { user, loading, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const fetchTickets = () => {
    fetch("/api/tickets", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(() => setTickets([]));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleTicketUpdate = useCallback((updated: { _id: string } & Ticket) => {
    setTickets((prev) => {
      const idx = prev.findIndex((t) => t._id === updated._id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...updated };
        return next;
      }
      return [...prev, updated];
    });
  }, []);

  useTicketUpdates(user?.id, handleTicketUpdate);

  // SSE fallback when Socket.io not available (e.g. Vercel)
  useEffect(() => {
    const es = new EventSource("/api/sse/tickets", { withCredentials: true });
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "tickets") setTickets(data.tickets || []);
      } catch {}
    };
    return () => es.close();
  }, []);

  if (loading || !user) return null;

  const statusColor: Record<string, string> = {
    Open: "bg-blue-100 text-blue-700",
    "In Progress": "bg-amber-100 text-amber-700",
    Resolved: "bg-emerald-100 text-emerald-700",
    Closed: "bg-stone-200 text-stone-600",
  };

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar role="author" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 font-serif">My Tickets</h1>
              <p className="text-stone-600 mt-1">Track your support requests</p>
            </div>
            <Link href="/author/tickets/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                New Ticket
              </Button>
            </Link>
          </div>

          <Card className="border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">Support Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-stone-500 mb-4">No tickets yet.</p>
                  <Link href="/author/tickets/new">
                    <Button variant="outline" size="sm">
                      Submit your first ticket
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {tickets.map((t) => (
                    <Link
                      key={t._id}
                      href={`/author/tickets/${t._id}`}
                      className="block p-5 hover:bg-stone-50/80 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-stone-900">{t.subject}</h3>
                          <p className="text-sm text-stone-500 mt-1 truncate">
                            {t.bookId?.title} • {t.category} • {t.priority}
                          </p>
                          <p className="text-xs text-stone-400 mt-2">
                            {new Date(t.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                            statusColor[t.status] || "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
