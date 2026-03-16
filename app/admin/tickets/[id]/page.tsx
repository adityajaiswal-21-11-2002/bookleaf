"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = { sender: string; message: string; createdAt: string };
type Note = { content: string; createdAt: string };

type Ticket = {
  _id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  messages: Message[];
  internalNotes?: Note[];
  bookId?: { title: string };
  authorId?: { name: string; email: string };
  assignedTo?: { name: string };
  createdAt: string;
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const { user, loading, logout } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const fetchTicket = useCallback(() => {
    fetch(`/api/tickets/${params.id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setTicket(d.ticket))
      .catch(() => setTicket(null));
  }, [params.id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const generateDraft = async () => {
    if (!ticket) return;
    setLoadingDraft(true);
    try {
      const res = await fetch("/api/ai/generate-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          subject: ticket.subject,
          description: ticket.description,
          bookTitle: ticket.bookId?.title,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setResponse(data.draft);
      }
    } catch {
      setDraft("Failed to generate. Please write manually.");
    } finally {
      setLoadingDraft(false);
    }
  };

  const sendResponse = async () => {
    if (!ticket || !response.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket._id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: response.trim() }),
      });
      if (res.ok) {
        setResponse("");
        setDraft("");
        fetchTicket();
      }
    } catch {
      setSending(false);
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!ticket) return;
    await fetch(`/api/admin/tickets/${ticket._id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    fetchTicket();
  };

  const assignToMe = async () => {
    if (!ticket) return;
    await fetch(`/api/admin/tickets/${ticket._id}/assign`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}),
    });
    fetchTicket();
  };

  const addNote = async () => {
    if (!ticket || !note.trim()) return;
    setSavingNote(true);
    try {
      await fetch(`/api/admin/tickets/${ticket._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: note.trim() }),
      });
      setNote("");
      fetchTicket();
    } finally {
      setSavingNote(false);
    }
  };

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
      <Sidebar role="admin" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/admin/tickets"
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to tickets
          </Link>
          <div className="mt-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900 font-serif">{ticket.subject}</h1>
              <p className="text-stone-600 mt-1">
                {ticket.authorId?.name} • {ticket.bookId?.title} • {ticket.category} • {ticket.priority}
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="border-b bg-stone-50/50">
                  <CardTitle className="font-serif">Query</CardTitle>
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
                        {m.sender === "author" ? "Author" : "Admin"}
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

            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="border-b bg-stone-50/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="font-serif">Respond</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateDraft}
                    disabled={loadingDraft}
                  >
                    {loadingDraft ? "Generating..." : "AI Draft"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={5}
                  placeholder="Type your response..."
                />
                <Button
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={sendResponse}
                  disabled={sending || !response.trim()}
                >
                  {sending ? "Sending..." : "Send Response"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="border-b bg-stone-50/50">
                <CardTitle className="font-serif">Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label className="text-stone-700">Status</Label>
                  <Select
                    value={ticket.status}
                    onChange={(e) => updateStatus(e.target.value)}
                    className="mt-1"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </Select>
                </div>
                <Button variant="outline" onClick={assignToMe} className="w-full">
                  Assign to Me
                </Button>
                {ticket.assignedTo && (
                  <p className="text-sm text-stone-600">
                    Assigned to: {ticket.assignedTo.name}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md bg-white">
              <CardHeader className="border-b bg-stone-50/50">
                <CardTitle className="font-serif">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-2 mb-4">
                  {ticket.internalNotes?.map((n, i) => (
                    <div key={i} className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm">
                      {n.content}
                      <p className="text-xs text-stone-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add note..."
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addNote}
                  disabled={savingNote || !note.trim()}
                >
                  Add Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
