"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  ShieldCheck, 
  Search, 
  FileText, 
  LayoutDashboard,
  Sparkles,
  Presentation
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isDocente = pathname.startsWith("/docente");
  const isApresentacao = pathname.startsWith("/docente/apresentacao");

  if (isApresentacao) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                ENADE <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">Hub</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Banco de Questões & Auditoria</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              href="/docente"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDocente
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <Presentation className="w-4 h-4" />
              Portal do Docente
            </Link>

            <Link
              href="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isAdmin
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Auditoria (Admin)
            </Link>
          </nav>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Link
            href="/docente/busca"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Buscar Questões</span>
          </Link>

          {isDocente ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Modo Docente Ativo
            </span>
          ) : isAdmin ? (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              Painel de Auditoria
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
