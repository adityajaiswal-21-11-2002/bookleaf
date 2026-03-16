"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = { sender: string; message: string; createdAt: string };

type Ticket = {
  _id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  messages: Message[];
  bookId?: { title: string };
  createdAt: string;
};

export default function TicketDetailPage() {
  const params = useParams();
  const { user, loading, logout } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const fetchTicket = useCallback(() => {
    fetch(`/api/tickets/${params.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTicket(d.ticket))
      .catch(() => setTicket(null));
  }, [params.id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    const es = new EventSource("/api/sse/tickets", { withCredentials: true });
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "tickets" && data.tickets) {
          const t = data.tickets.find((x: { _id: string }) => x._id === params.id);
          if (t) setTicket(t);
        }
      } catch {}
    };
    return () => es.close();
  }, [params.id]);

  if (loading || !user) return null;
  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50/50">
        <div className="text-stone-500">Loading...</div>
      </div>
    );
  }

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
        <div className="max-w-3xl mx-auto">
          <Link
            href="/author/tickets"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to tickets
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 font-serif">{ticket.subject}</h1>
              <p className="text-stone-600 mt-1">
                {ticket.bookId?.title} • {ticket.category} • {ticket.priority}
              </p>
            </div>
            <span
              className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                statusColor[ticket.status] || "bg-stone-200 text-stone-600"
              }`}
            >
              {ticket.status}
            </span>
          </div>

          <Card className="mt-6 border-0 shadow-md bg-white">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">Conversation</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ticket.messages?.map((m, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl ${
                      m.sender === "author"
                        ? "bg-emerald-50/80 border border-emerald-100 ml-0 mr-8"
                        : "bg-stone-50 border border-stone-100 ml-8 mr-0"
                    }`}
                  >
                    <p className="text-xs font-medium text-stone-500 mb-2">
                      {m.sender === "author" ? "You" : "BookLeaf Support"}
                    </p>
                    <p className="whitespace-pre-wrap text-stone-800">{m.message}</p>
                    <p className="text-xs text-stone-400 mt-2">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
