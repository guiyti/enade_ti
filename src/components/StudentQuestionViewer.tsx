"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  BookOpen,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Sparkles
} from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { ZoomableImage } from "@/components/ZoomableImage";
import { isFormacaoGeralQuestion } from "@/lib/constants";

export interface StudentViewerQuestionItem {
  exam: ExamData;
  question: QuestionData;
}

interface StudentQuestionViewerProps {
  mode?: "conjunto" | "sorteio" | "avulsa";
  title?: string;
  subtitle?: string;
  curso?: string;
  setNumber?: number;
  setLabel?: string;
  themeName?: string;
  themeSlug?: string;
  initialQuestions: StudentViewerQuestionItem[];
  allAvailablePool?: StudentViewerQuestionItem[];
  returnUrl?: string;
}

export function StudentQuestionViewer({
  mode = "conjunto",
  title,
  subtitle,
  curso = "ADS",
  setNumber = 1,
  setLabel = "Semana Vigente",
  themeName,
  themeSlug,
  initialQuestions,
  allAvailablePool = [],
  returnUrl = "/sorteio",
}: StudentQuestionViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pool, setPool] = useState<StudentViewerQuestionItem[]>(
    initialQuestions.length > 0 ? initialQuestions : allAvailablePool
  );

  const currentItem: StudentViewerQuestionItem | undefined = pool[currentIndex] || initialQuestions[0];

  // Full Page PDF Context Modal
  const [showFullPageModal, setShowFullPageModal] = useState(false);
  const [fullPageNum, setFullPageNum] = useState<number>(1);
  const [copiedToast, setCopiedToast] = useState(false);

  // Sync page number when question changes
  useEffect(() => {
    if (currentItem?.question?.paginas?.[0]) {
      setFullPageNum(currentItem.question.paginas[0]);
    }
  }, [currentItem]);

  // Next in question set
  const handleNextInSet = () => {
    if (currentIndex < pool.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevInSet = () => {
    if (isCompleted) {
      setIsCompleted(false);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Share / Copy link
  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = currentItem
      ? `${window.location.origin}/aluno/${currentItem.exam.id_prova}/${currentItem.question.id_questao}`
      : window.location.href;

    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    });
  };

  if (!currentItem) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold">Nenhuma questão encontrada</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Não localizamos questões para o conjunto selecionado.
        </p>
      </div>
    );
  }

  const { exam, question } = currentItem;
  const isMultipleChoice = question.tipo === "OBJETIVA";
  const mainCategory = question.categorias?.[0] || themeName || "Geral";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4" />
          Link copiado com sucesso!
        </div>
      )}

      {/* Top Header - Immersive, No Home Button, Mobile First & Distraction Free */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 select-none">
        {/* Left: Question Meta (Isolated in the Pill) */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
              {curso} · Desafio da Semana
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                isFormacaoGeralQuestion(question)
                  ? "bg-teal-950 text-teal-300 border-teal-800"
                  : "bg-indigo-950 text-indigo-300 border-indigo-800"
              }`}
            >
              {isFormacaoGeralQuestion(question) ? "🌍 Formação Geral" : `🎯 Específica (${curso})`}
            </span>
            <span className="text-xs font-bold text-slate-200 truncate">
              {exam.id_prova} · {question.id_questao.toUpperCase()}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            Tema: <span className="text-slate-300 font-medium">{mainCategory}</span> ({isMultipleChoice ? "Múltipla Escolha" : "Discursiva"})
          </p>
        </div>

        {/* Right: Actions (Full Page PDF Context & Share) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setFullPageNum(question.paginas[0] || 1);
              setShowFullPageModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            title="Ver a folha inteira do caderno original para ler textos motivadores"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Folha Completa</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            title="Copiar Link da Questão"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {isCompleted ? (
          /* Completion Screen - No Next Week Button, Focused on Current Cycle */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Treino Semanal Concluído
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Parabéns! Você concluiu as 4 questões da semana!
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Excelente prática! O próximo conjunto de 4 questões inéditas será liberado automaticamente na próxima <strong>segunda-feira</strong>.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 w-full">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentIndex(0);
                }}
                className="w-full sm:w-auto min-w-[240px] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Refazer / Revisar Questões da Semana
              </button>
            </div>
          </div>
        ) : (
          /* Question Display */
          <div className="flex-1 flex flex-col">
            {/* Progress Stepper & Context Bar */}
            <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">
                  Questão {currentIndex + 1} de {pool.length}
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  {pool.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentIndex
                          ? "w-6 bg-sky-500 shadow-sm shadow-sky-500/50"
                          : idx < currentIndex
                          ? "w-2 bg-emerald-500"
                          : "w-2 bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                {title || setLabel}
              </span>
            </div>

            {/* Question Categories & Topic Tags Bar */}
            <div className="bg-slate-900/40 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between gap-2 flex-wrap text-xs select-none">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Tags & Conteúdo:
                </span>
                {question.categorias && question.categorias.length > 0 ? (
                  question.categorias.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-sm"
                    >
                      <span className="text-indigo-400">🏷️</span> {cat}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    🏷️ {mainCategory}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/80 font-mono">
                  {exam.id_prova} · {question.id_questao.toUpperCase()}
                </span>
              </div>
            </div>

            {/* High-Resolution Question Image */}
            <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex items-center justify-center min-h-[60vh]">
              <div className="w-full max-w-4xl max-h-[78vh] flex items-center justify-center bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl p-2 sm:p-4">
                <ZoomableImage
                  src={question.caminho_png}
                  alt={`ENADE ${exam.id_prova} - Questão ${question.id_questao}`}
                  className="max-h-[74vh] w-auto object-contain mx-auto"
                  containerClassName="min-h-[55vh]"
                  showControls={true}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Action Bar */}
      {!isCompleted && (
        <footer className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur border-t border-slate-800 px-4 py-2.5 sm:py-3 select-none">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            <button
              onClick={handlePrevInSet}
              disabled={currentIndex === 0}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center text-xs font-semibold text-slate-400 truncate">
              {title || `Questão ${currentIndex + 1}/${pool.length}`}
            </div>

            <button
              onClick={handleNextInSet}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              {currentIndex === pool.length - 1 ? (
                <>
                  <span>Concluir Treino</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Próxima</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </footer>
      )}

      {/* Full Page PDF Modal (Context / Motivational Texts) */}
      {showFullPageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-in fade-in duration-200">
          <div className="h-14 px-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <h3 className="font-bold text-xs sm:text-sm text-white truncate">
                Folha Completa · {exam.id_prova} · Página {fullPageNum} {exam.total_paginas ? `de ${exam.total_paginas}` : ""}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Adjacent Page Controls */}
              <button
                disabled={fullPageNum <= 1}
                onClick={() => setFullPageNum((prev) => Math.max(1, prev - 1))}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-slate-200 transition-colors"
                title="Página Anterior do Caderno"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Anterior</span>
              </button>

              <button
                disabled={Boolean(exam.total_paginas && fullPageNum >= exam.total_paginas)}
                onClick={() => setFullPageNum((prev) => prev + 1)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-slate-200 transition-colors"
                title="Próxima Página do Caderno"
              >
                <span className="hidden sm:inline">Próxima</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setShowFullPageModal(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white ml-1"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-2 sm:p-6 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-2">
              <ZoomableImage
                src={`/questoes/${exam.id_prova}/paginas/pagina_${fullPageNum}.png`}
                alt={`Página ${fullPageNum} do ENADE ${exam.id_prova}`}
                className="max-h-[85vh] w-auto object-contain mx-auto"
                containerClassName="w-full h-full"
                showControls={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
