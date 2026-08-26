"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { savePresentationContext } from "@/lib/presentationContext";
import { isFormacaoGeralQuestion } from "@/lib/constants";

interface ThemeGalleryClientProps {
  items: { exam: ExamData; question: QuestionData }[];
}

export function ThemeGalleryClient({ items }: ThemeGalleryClientProps) {
  const handleStartPresentation = (startIdx?: number) => {
    const playlist = items.map((i) => ({
      id_prova: i.exam.id_prova,
      id_questao: i.question.id_questao,
    }));
    savePresentationContext(playlist);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Galeria de Questões ({items.length})</span>
        </h2>
        <span className="text-xs text-slate-400">Recortes em 300 DPI organizados para sala de aula</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(({ exam, question }, idx) => {
          const isDisc = question.tipo === "DISCURSIVA";
          const isFG = isFormacaoGeralQuestion(question);

          return (
            <div
              key={`${exam.id_prova}-${question.id_questao}`}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all group"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                    {question.id_questao}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {exam.id_prova}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFG
                        ? "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {isFG ? "🌍 Geral" : "🎯 Específica"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDisc
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {question.tipo}
                  </span>
                </div>
              </div>

              {/* Question Visual Image Thumbnail */}
              <div className="h-56 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800 relative">
                <img
                  src={question.caminho_png}
                  alt={`Questão ${question.id_questao}`}
                  className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Card Footer */}
              <div className="p-4 mt-auto flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Ano {exam.ano} · {exam.curso}
                </span>

                <Link
                  href={`/docente/apresentacao/${exam.id_prova}/${question.id_questao}`}
                  onClick={() => handleStartPresentation(idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Apresentar
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
