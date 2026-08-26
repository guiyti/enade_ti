"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  ShieldCheck, 
  Search
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCapacitacao = pathname.startsWith("/capacitacao");
  const isApresentacao = pathname.startsWith("/docente/apresentacao");

  if (isApresentacao) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo with Circular ENADE Icon */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-500/30 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform bg-white shrink-0">
              <img
                src="/images/enade/logo_circular.png"
                alt="Logo ENADE"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                ENADE <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">Hub</span>
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Banco de Questões & Auditoria</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 ml-4">
            <Link
              href="/capacitacao"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isCapacitacao
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Entenda o ENADE
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isAdmin
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Auditoria
            </Link>
          </nav>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/docente/busca"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Buscar Questões</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
