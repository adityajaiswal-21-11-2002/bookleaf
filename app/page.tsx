import Link from "next/link";
import { BookOpen, Shield, Headphones } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-emerald-50/30 to-stone-50">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-transparent to-transparent" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="flex flex-col items-center text-center max-w-2xl space-y-8 animate-in">
          <div className="h-14 w-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
            <BookOpen className="h-7 w-7 text-white" />
          </div>
          <div className="space-y-6">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 tracking-tight">
              BookLeaf
            </h1>
            <p className="text-lg text-stone-600 max-w-md mx-auto">
              Author Support & Communication Portal for BookLeaf Publishing
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/author/register"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-all duration-200 shadow-md hover:shadow-lg border border-stone-700"
            >
              <Headphones className="h-5 w-5" />
              Author Register
            </Link>
            <Link
              href="/author/login"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-emerald-600/25 hover:-translate-y-0.5"
            >
              <Headphones className="h-5 w-5" />
              Author Login
            </Link>
            <Link
              href="/admin/login"
              className="group flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-all duration-200 shadow-md hover:shadow-lg border border-stone-700"
            >
              <Shield className="h-5 w-5" />
              Admin Login
            </Link>
          </div>
          <p className="text-sm text-stone-500">
            Support tickets • Royalties • Books
          </p>
        </div>
      </div>
    </div>
  );
}
