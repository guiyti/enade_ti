"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const isImmersive =
    pathname?.startsWith("/pilulas") ||
    pathname?.startsWith("/aluno") ||
    pathname?.startsWith("/docente/apresentacao");

  if (isImmersive) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>ENADE Hub · Banco de Questões em Alta Resolução (300 DPI)</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/capacitacao" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Entenda o ENADE
          </Link>
          <Link href="/admin" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Painel de Auditoria
          </Link>
        </div>
      </div>
    </footer>
  );
}
