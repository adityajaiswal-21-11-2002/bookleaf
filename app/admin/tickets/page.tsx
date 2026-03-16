"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Ticket = {
  _id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  authorId?: { name: string; email: string };
  bookId?: { title: string };
};

export default function AdminTicketsPage() {
  const { user, loading, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  const fetchTickets = () => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    if (category) params.set("category", category);
    if (date) params.set("date", date);
    fetch(`/api/admin/tickets?${params}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets || []))
      .catch(() => setTickets([]));
  };

  useEffect(() => {
    fetchTickets();
  }, [status, priority, category, date]);

  if (loading || !user) return null;

  const statusColor: Record<string, string> = {
    Open: "bg-blue-100 text-blue-800",
    "In Progress": "bg-amber-100 text-amber-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-stone-100 text-stone-800",
  };

  const priorityColor: Record<string, string> = {
    Critical: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-stone-100 text-stone-800",
  };

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar role="admin" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">Ticket Queue</h1>
            <p className="text-stone-600 mt-1">Manage and respond to support tickets</p>
          </div>

          <Card className="mb-6 border-0 shadow-md bg-white">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">Filters</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label>Status</Label>
                <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">All</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="">All</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All</option>
                  <option value="Royalty & Payments">Royalty & Payments</option>
                  <option value="ISBN & Metadata Issues">ISBN & Metadata</option>
                  <option value="Printing & Quality">Printing & Quality</option>
                  <option value="Distribution & Availability">Distribution</option>
                  <option value="Book Status & Production Updates">Book Status</option>
                  <option value="General Inquiry">General Inquiry</option>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

          <Card className="border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">Tickets</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {tickets.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  No tickets match filters.
                </div>
              ) : (
                <div className="divide-y">
                  {tickets.map((t) => (
                    <Link
                      key={t._id}
                      href={`/admin/tickets/${t._id}`}
                      className="block p-5 hover:bg-stone-50/80 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-stone-900">{t.subject}</h3>
                          <p className="text-sm text-stone-500 mt-1 truncate">
                            {t.authorId?.name} • {t.bookId?.title} • {t.category}
                          </p>
                          <p className="text-xs text-stone-400 mt-2">
                            {new Date(t.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              priorityColor[t.priority] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              statusColor[t.status] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
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
