"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { ExamData } from "@/lib/enade";
import { savePresentationContext } from "@/lib/presentationContext";

interface ExamGalleryClientProps {
  exam: ExamData;
}

export function ExamGalleryClient({ exam }: ExamGalleryClientProps) {
  const handleStart = (startId?: string) => {
    const playlist = exam.questoes.map((q) => ({
      id_prova: exam.id_prova,
      id_questao: q.id_questao,
    }));
    savePresentationContext(playlist);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {exam.questoes.map((q) => {
        const isDisc = q.tipo === "DISCURSIVA";

        return (
          <Link
            key={q.id_questao}
            href={`/docente/apresentacao/${exam.id_prova}/${q.id_questao}`}
            onClick={() => handleStart(q.id_questao)}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all group"
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                Questão {q.id_questao}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDisc
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {q.tipo}
              </span>
            </div>

            {/* Visual Thumbnail */}
            <div className="h-52 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
              <img
                src={q.caminho_png}
                alt={`Questão ${q.id_questao}`}
                className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>

            <div className="p-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Página {q.paginas.join(", ")}</span>
              <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Apresentar <Play className="w-3 h-3 fill-current" />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
