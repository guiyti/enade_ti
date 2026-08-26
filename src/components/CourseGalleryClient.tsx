"use client";

import { useState } from "react";
import Link from "next/link";
import { Play, Layers, Check } from "lucide-react";
import type { ExamData, QuestionData, CategoryInfo } from "@/lib/enade";
import { savePresentationContext } from "@/lib/presentationContext";

interface CourseGalleryClientProps {
  courseDef: { name: string; code: string; description: string };
  category: CategoryInfo;
  nativeItems: { exam: ExamData; question: QuestionData }[];
  crossItems: { exam: ExamData; question: QuestionData }[];
}

export function CourseGalleryClient({
  courseDef,
  category,
  nativeItems,
  crossItems,
}: CourseGalleryClientProps) {
  const [includeCrossCourse, setIncludeCrossCourse] = useState(true);

  const displayItems = includeCrossCourse
    ? [...nativeItems, ...crossItems]
    : nativeItems;

  const handleStartPresentation = () => {
    const playlist = displayItems.map((item) => ({
      id_prova: item.exam.id_prova,
      id_questao: item.question.id_questao,
    }));
    savePresentationContext(playlist);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Filter Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Exibindo {displayItems.length} questões
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            ({nativeItems.length} nativas de {courseDef.code}
            {crossItems.length > 0 && `, ${crossItems.length} correlatas`})
          </span>
        </div>

        {crossItems.length > 0 && (
          <button
            onClick={() => setIncludeCrossCourse(!includeCrossCourse)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all text-left ${
              includeCrossCourse
                ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            }`}
          >
            <div
              className={`w-4 h-4 rounded flex items-center justify-center text-white ${
                includeCrossCourse ? "bg-sky-600" : "bg-slate-300 dark:bg-slate-700"
              }`}
            >
              {includeCrossCourse && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
            <span>Incluir {crossItems.length} questões correlatas de outros cursos</span>
          </button>
        )}
      </div>

      {/* Grid of Questions */}
      {displayItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map(({ exam, question }) => {
            const isNative = exam.curso.toUpperCase() === courseDef.code.toUpperCase();
            const isDisc = question.tipo === "DISCURSIVA";

            return (
              <div
                key={`${exam.id_prova}-${question.id_questao}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border ${
                  isNative
                    ? "border-slate-200 dark:border-slate-800"
                    : "border-amber-200/80 dark:border-amber-900/50 bg-amber-50/20 dark:bg-amber-950/10"
                } shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all duration-200 group`}
              >
                {/* Header Badge */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                      Questão {question.id_questao}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isNative
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      {isNative ? `Prova ${exam.id_prova}` : `Original: ${exam.id_prova}`}
                    </span>
                  </div>

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

                {/* PNG Crop High DPI Image */}
                <div className="h-56 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={question.caminho_png}
                    alt={`Questão ${question.id_questao}`}
                    className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Footer Controls */}
                <div className="p-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Página {question.paginas.join(", ")}</span>

                  <Link
                    href={`/docente/apresentacao/${exam.id_prova}/${question.id_questao}`}
                    onClick={handleStartPresentation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Apresentar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            Nenhuma questão encontrada para este filtro
          </h3>
          <p className="text-xs">Ative a opção "Incluir questões correlatas" para visualizar provas de outros cursos.</p>
        </div>
      )}
    </div>
  );
}
