"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BookOpen, 
  ShieldCheck, 
  Search,
  Menu,
  X,
  Sparkles
} from "lucide-react";

function MobileMenu({ isCapacitacao, isAdmin, isSorteio }: { isCapacitacao: boolean; isAdmin: boolean; isSorteio: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg transition-all duration-200 flex flex-col overflow-hidden z-50">
          <Link
            href="/sorteio"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
              isSorteio
                ? "bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            Quizzes & Sorteio
          </Link>
          <Link
            href="/capacitacao"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
              isCapacitacao
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Entenda o ENADE
          </Link>
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
              isAdmin
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            Auditoria
          </Link>
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isCapacitacao = pathname.startsWith("/capacitacao");
  const isSorteio = pathname === "/sorteio" || pathname === "/quizzes";
  const isImmersive = 
    pathname.startsWith("/pilulas") || 
    pathname.startsWith("/aluno") || 
    pathname.startsWith("/docente/apresentacao");

  if (isImmersive) {
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
              href="/sorteio"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isSorteio
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 shadow-sm font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              }`}
            >
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Quizzes & Sorteio
            </Link>

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

          {/* Mobile Menu Button */}
          <MobileMenu
            isCapacitacao={isCapacitacao}
            isAdmin={isAdmin}
            isSorteio={isSorteio}
          />
        </div>
      </div>
    </header>
  );
}

