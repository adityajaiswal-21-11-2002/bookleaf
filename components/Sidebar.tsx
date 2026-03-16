"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  BookMarked,
  PlusCircle,
  Ticket,
  LogOut,
  User,
  Shield,
} from "lucide-react";

const authorLinks = [
  { href: "/author/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/author/books", label: "My Books", icon: BookMarked },
  { href: "/author/tickets/new", label: "Submit Ticket", icon: PlusCircle },
  { href: "/author/tickets", label: "My Tickets", icon: Ticket },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tickets", label: "Tickets", icon: Ticket },
];

export function Sidebar({
  role,
  userName,
  onLogout,
}: {
  role: "author" | "admin";
  userName?: string;
  onLogout?: () => void;
}) {
  const pathname = usePathname();
  const links = role === "admin" ? adminLinks : authorLinks;

  return (
    <aside className="w-64 min-h-screen bg-stone-900 text-stone-100 flex flex-col border-r border-stone-800">
      <div className="p-5 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg">BookLeaf</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                  : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-stone-800 space-y-1">
        {userName && (
          <div className="px-3 py-2 flex items-center gap-2 text-sm text-stone-600">
            <div className="h-8 w-8 rounded-full bg-stone-700 flex items-center justify-center shrink-0">
              {role === "admin" ? (
                <Shield className="h-4 w-4 text-stone-400" />
              ) : (
                <User className="h-4 w-4 text-stone-400" />
              )}
            </div>
            <span className="truncate">{userName}</span>
          </div>
        )}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
