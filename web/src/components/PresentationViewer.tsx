"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  X, 
  FileText, 
  ImageIcon, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Tag
} from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { TagEditor } from "@/components/TagEditor";

interface PresentationViewerProps {
  exam: ExamData;
  question: QuestionData;
  currentIndex: number;
  totalQuestions: number;
  prevQuestionId: string | null;
  nextQuestionId: string | null;
}

export function PresentationViewer({
  exam,
  question,
  currentIndex,
  totalQuestions,
  prevQuestionId,
  nextQuestionId,
}: PresentationViewerProps) {
  const router = useRouter();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "tags">("tags");

  const handleExit = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/docente");
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft" && prevQuestionId) {
        router.push(`/docente/apresentacao/${exam.id_prova}/${prevQuestionId}`);
      } else if (e.key === "ArrowRight" && nextQuestionId) {
        router.push(`/docente/apresentacao/${exam.id_prova}/${nextQuestionId}`);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleExit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevQuestionId, nextQuestionId, exam.id_prova, isFullscreen, router]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex flex-col ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
      {/* Control Topbar */}
      <div className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 select-none">
        {/* Left: Exit & Question Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Sair do modo apresentação (Voltar à tela anterior)"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-white uppercase">
                {question.id_questao}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-800">
                {question.tipo}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {exam.id_prova} · Questão {currentIndex + 1} de {totalQuestions}
            </p>
          </div>
        </div>

        {/* Center: Presentation tools (Zoom, Tags, Text Toggle) */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reduzir zoom"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetZoom}
            className="px-2 py-1 text-xs font-mono font-bold text-slate-300 hover:text-white"
            title="Restaurar zoom original"
          >
            {(zoomLevel * 100).toFixed(0)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          <button
            onClick={() => {
              if (showSidePanel && activeTab === "tags") {
                setShowSidePanel(false);
              } else {
                setActiveTab("tags");
                setShowSidePanel(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showSidePanel && activeTab === "tags" ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorias / Disciplinas</span>
          </button>

          <button
            onClick={() => {
              if (showSidePanel && activeTab === "text") {
                setShowSidePanel(false);
              } else {
                setActiveTab("text");
                setShowSidePanel(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              showSidePanel && activeTab === "text" ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition-colors ml-1"
            title="Tela cheia (tecla F)"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Quick Question Navigator */}
        <div className="flex items-center gap-2">
          {prevQuestionId ? (
            <Link
              href={`/docente/apresentacao/${exam.id_prova}/${prevQuestionId}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
              title="Questão Anterior (Seta Esquerda)"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-xs font-bold text-slate-600 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </span>
          )}

          {nextQuestionId ? (
            <Link
              href={`/docente/apresentacao/${exam.id_prova}/${nextQuestionId}`}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-colors"
              title="Próxima Questão (Seta Direita)"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-xs font-bold text-slate-600 cursor-not-allowed">
              Próxima
              <ChevronRight className="w-4 h-4" />
            </span>
          )}
        </div>
      </div>

      {/* Main Presentation Stage */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visual Slide Image (Clean 300 DPI crop) */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-slate-950">
          <div
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 ease-out max-w-4xl w-full flex justify-center"
          >
            <img
              src={question.caminho_png}
              alt={`Questão ${question.id_questao}`}
              className="max-h-[85vh] w-auto object-contain rounded-lg shadow-2xl bg-white select-none"
            />
          </div>
        </div>

        {/* Collapsible Side Panel (Tags or Transcribed Text) */}
        {showSidePanel && (
          <div className="w-96 border-l border-slate-800 bg-slate-900 p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                {activeTab === "tags" ? <Tag className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                {activeTab === "tags" ? "Classificação Temática" : "Texto da Questão"}
              </h3>
              <button
                onClick={() => setShowSidePanel(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeTab === "tags" ? (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Adicione ou remova categorias desta questão para organizar o plano de ensino:
                </p>
                <TagEditor
                  id_prova={exam.id_prova}
                  id_questao={question.id_questao}
                  initialTags={question.categorias || []}
                />
              </div>
            ) : (
              <div>
                {question.texto_completo ? (
                  <div className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap">
                    {question.texto_completo}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Texto não disponível.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
