"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Book = {
  _id: string;
  title: string;
  isbn: string;
  genre: string;
  publication_date: string;
  status: string;
  mrp: number;
  copies_sold: number;
  royalty_earned: number;
  royalty_paid: number;
  royalty_pending: number;
};

export default function AuthorBooksPage() {
  const { user, loading, logout } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch("/api/books", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setBooks(d.books || []))
      .catch(() => setBooks([]));
  }, []);

  if (loading || !user) return null;

  return (
    <div className="flex min-h-screen bg-stone-50/50">
      <Sidebar role="author" userName={user.name} onLogout={logout} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-stone-900 font-serif">My Books</h1>
            <p className="text-stone-600 mt-1">View your published titles and royalty details</p>
          </div>

          <Card className="border-0 shadow-md bg-white overflow-hidden">
            <CardHeader className="border-b bg-stone-50/50">
              <CardTitle className="font-serif">Your Books</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {books.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <p>No books found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-stone-50">
                        <th className="text-left py-3 px-4 font-medium text-stone-600">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-stone-600">ISBN</th>
                        <th className="text-left py-3 px-4 font-medium text-stone-600">Genre</th>
                        <th className="text-left py-3 px-4 font-medium text-stone-600">Pub. Date</th>
                        <th className="text-left py-3 px-4 font-medium text-stone-600">Status</th>
                        <th className="text-right py-3 px-4 font-medium text-stone-600">MRP</th>
                        <th className="text-right py-3 px-4 font-medium text-stone-600">Sold</th>
                        <th className="text-right py-3 px-4 font-medium text-stone-600">Earned</th>
                        <th className="text-right py-3 px-4 font-medium text-stone-600">Paid</th>
                        <th className="text-right py-3 px-4 font-medium text-stone-600">Pending</th>
                      </tr>
                    </thead>
                    <tbody>
                      {books.map((b, i) => (
                        <tr
                          key={b._id}
                          className={`border-b last:border-0 hover:bg-stone-50/80 transition-colors ${
                            i % 2 === 1 ? "bg-stone-50/30" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-medium text-stone-900">{b.title}</td>
                          <td className="py-3 px-4 text-stone-600">{b.isbn}</td>
                          <td className="py-3 px-4 text-stone-600">{b.genre}</td>
                          <td className="py-3 px-4 text-stone-600">
                            {b.publication_date
                              ? new Date(b.publication_date).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                              {b.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-stone-600">
                            {b.mrp != null ? `₹${b.mrp.toLocaleString()}` : "—"}
                          </td>
                          <td className="py-3 px-4 text-right">{b.copies_sold ?? 0}</td>
                          <td className="py-3 px-4 text-right font-medium text-emerald-600">
                            ₹{b.royalty_earned?.toLocaleString() ?? 0}
                          </td>
                          <td className="py-3 px-4 text-right text-stone-600">
                            ₹{b.royalty_paid?.toLocaleString() ?? 0}
                          </td>
                          <td className="py-3 px-4 text-right font-medium text-amber-600">
                            ₹{b.royalty_pending?.toLocaleString() ?? 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
