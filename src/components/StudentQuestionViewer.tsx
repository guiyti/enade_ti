"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shuffle,
  Share2,
  BookOpen,
  Layers,
  GraduationCap,
  X,
  Check,
  Home,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  Boxes,
  ShieldAlert,
  Code2,
  Globe
} from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { ZoomableImage } from "@/components/ZoomableImage";
import { QUESTION_SETS } from "@/lib/weeklySchedule";
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
  setLabel = "Semana 01",
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
  const [showDrawer, setShowDrawer] = useState(false);

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

  // Draw random question in infinite mode
  const handleDrawNextRandom = () => {
    const candidates = allAvailablePool.length > 0 ? allAvailablePool : pool;
    if (candidates.length <= 1) return;

    let nextIdx = Math.floor(Math.random() * candidates.length);
    if (nextIdx === currentIndex && candidates.length > 1) {
      nextIdx = (nextIdx + 1) % candidates.length;
    }
    setPool(candidates);
    setCurrentIndex(nextIdx);
    setIsCompleted(false);

    const nextQ = candidates[nextIdx];
    if (nextQ && typeof window !== "undefined") {
      window.history.replaceState(
        null,
        "",
        `/aluno/${nextQ.exam.id_prova}/${nextQ.question.id_questao}`
      );
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
        <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Nenhuma questão encontrada</h2>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Não localizamos questões para o conjunto selecionado.
        </p>
        <Link
          href="/sorteio"
          className="mt-6 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl font-semibold text-sm transition-all"
        >
          Voltar para Central de Quizzes
        </Link>
      </div>
    );
  }

  const { exam, question } = currentItem;
  const isMultipleChoice = question.tipo === "OBJETIVA";
  const mainCategory = question.categorias?.[0] || themeName || "Geral";
  const nextSetNumber = setNumber < 12 ? setNumber + 1 : 1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4" />
          Link copiado com sucesso!
        </div>
      )}

      {/* Top Header - Mobile First & Distraction Free */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur border-b border-slate-800/80 px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 select-none">
        {/* Left: Home & Question Meta */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/sorteio"
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center shrink-0 transition-colors"
            title="Central de Quizzes"
          >
            <Home className="w-4 h-4" />
          </Link>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800 shrink-0">
                {curso} · {setLabel}
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
        </div>

        {/* Right: Actions (Full Page PDF Context, Share, Drawer) */}
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

          <button
            onClick={() => setShowDrawer(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Trocar de Conjunto ou Curso"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {isCompleted ? (
          /* Completion Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-1">
              Conjunto Finalizado!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Você concluiu as 4 questões da {setLabel}!
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              Excelente! Praticar com conjuntos curtos e focados ajuda na retenção contínua de conteúdo sem sobrecarregar sua rotina.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentIndex(0);
                }}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Refazer {setLabel}
              </button>

              <Link
                href={`/pilulas/${curso.toLowerCase()}/semana-${nextSetNumber}`}
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>Ir para Semana {nextSetNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <Link
              href="/sorteio"
              className="mt-5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Ver Todos os Conjuntos de {curso} →
            </Link>
          </div>
        ) : (
          /* Question Display */
          <div className="flex-1 flex flex-col">
            {/* Progress Stepper */}
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
              {title || `${setLabel} · Questão ${currentIndex + 1}/${pool.length}`}
            </div>

            <button
              onClick={handleNextInSet}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              {currentIndex === pool.length - 1 ? (
                <>
                  <span>Concluir {setLabel}</span>
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
          <div className="h-14 px-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">
                Folha Completa do PDF · {exam.id_prova} · Página {fullPageNum}
              </h3>
            </div>
            <button
              onClick={() => setShowFullPageModal(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-2 sm:p-6 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-5xl bg-white rounded-xl overflow-hidden shadow-2xl flex items-center justify-center p-2">
              <ZoomableImage
                src={`/questoes/${exam.id_prova}/pag_${String(fullPageNum).padStart(2, "0")}.png`}
                alt={`Página ${fullPageNum} do ENADE ${exam.id_prova}`}
                className="max-h-[85vh] w-auto object-contain mx-auto"
                containerClassName="w-full h-full"
                showControls={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Drawer with Quick Links to other sets */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-sky-400" />
                <h3 className="font-extrabold text-base text-white">Conjuntos de {curso}</h3>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                <Link
                  key={num}
                  href={`/pilulas/${curso.toLowerCase()}/semana-${num}`}
                  onClick={() => setShowDrawer(false)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                    num === setNumber
                      ? "bg-sky-950/60 border-sky-700 text-sky-200 shadow-sm"
                      : "bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <span>Semana {num < 10 ? `0${num}` : num} (4 questões)</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              ))}

              <Link
                href="/sorteio"
                onClick={() => setShowDrawer(false)}
                className="block text-center pt-4 text-xs font-bold text-sky-400 hover:text-sky-300"
              >
                Voltar para Todos os Cursos →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
