"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Book = { _id: string; title: string };

export default function SubmitTicketPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/books", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const b = d.books || [];
        setBooks(b);
        if (b.length && !bookId) setBookId(b[0]._id);
      })
      .catch(() => setBooks([]));
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bookId, subject, description, attachmentUrl: attachmentUrl || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit");
        return;
      }
      router.push("/author/tickets");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar role="author" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">Submit Support Ticket</h1>
            <p className="text-stone-600 mt-1">Get help with your books and royalties</p>
          </div>

          <Card className="border-0 shadow-md bg-white">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">New Ticket</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="book">Book</Label>
                  <Select
                    id="book"
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    className="mt-1"
                    required
                  >
                    <option value="">Select a book</option>
                    {books.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.title}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="attachment">Attachment URL (optional)</Label>
                  <Input
                    id="attachment"
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                  <p className="text-xs text-stone-500 mt-1">
                    Paste a link to a file (e.g. from cloud storage)
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </form>
          </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}
