"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
  Tag,
  BookOpen,
  Flag
} from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { TagEditor } from "@/components/TagEditor";
import { AuditFlagContent } from "@/components/AuditFlagContent";
import { useAuditFlag } from "@/lib/auditStore";
import { getPresentationContext, type PlaylistItem } from "@/lib/presentationContext";

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
  currentIndex: defaultIndex,
  totalQuestions: defaultTotal,
  prevQuestionId: defaultPrevId,
  nextQuestionId: defaultNextId,
}: PresentationViewerProps) {
  const router = useRouter();
  const { isFlagged } = useAuditFlag(exam.id_prova, question.id_questao);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "tags" | "flag">("tags");

  // Presentation Context (Playlist & Return URL)
  const [playlist, setPlaylist] = useState<PlaylistItem[] | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  // Load presentation context from sessionStorage on mount
  useEffect(() => {
    const ctx = getPresentationContext();
    if (ctx.playlist && ctx.playlist.length > 0) {
      setPlaylist(ctx.playlist);
    }
    if (ctx.returnUrl) {
      setReturnUrl(ctx.returnUrl);
    }
  }, []);

  // Compute active navigation based on playlist (if present) or default exam
  const { currentIndex, totalQuestions, prevUrl, nextUrl, isPlaylistActive } = useMemo(() => {
    if (playlist && playlist.length > 0) {
      const idx = playlist.findIndex(
        (item) => item.id_prova === exam.id_prova && item.id_questao === question.id_questao
      );
      if (idx !== -1) {
        const prevItem = idx > 0 ? playlist[idx - 1] : null;
        const nextItem = idx < playlist.length - 1 ? playlist[idx + 1] : null;
        return {
          currentIndex: idx,
          totalQuestions: playlist.length,
          prevUrl: prevItem ? `/docente/apresentacao/${prevItem.id_prova}/${prevItem.id_questao}` : null,
          nextUrl: nextItem ? `/docente/apresentacao/${nextItem.id_prova}/${nextItem.id_questao}` : null,
          isPlaylistActive: true,
        };
      }
    }

    return {
      currentIndex: defaultIndex,
      totalQuestions: defaultTotal,
      prevUrl: defaultPrevId ? `/docente/apresentacao/${exam.id_prova}/${defaultPrevId}` : null,
      nextUrl: defaultNextId ? `/docente/apresentacao/${exam.id_prova}/${defaultNextId}` : null,
      isPlaylistActive: false,
    };
  }, [playlist, exam.id_prova, question.id_questao, defaultIndex, defaultTotal, defaultPrevId, defaultNextId]);

  // Full Page Context Modal State
  const [showFullPageModal, setShowFullPageModal] = useState(false);
  const [fullPageNum, setFullPageNum] = useState<number>(question.paginas[0] || 1);
  const [fullPageZoom, setFullPageZoom] = useState(1);

  // Sync page number when question changes
  useEffect(() => {
    setFullPageNum(question.paginas[0] || 1);
  }, [question]);

  const handleExit = () => {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.push(`/docente/prova/${exam.id_prova}`);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") {
        return;
      }

      if (e.key === "ArrowLeft" && !showFullPageModal && prevUrl) {
        router.push(prevUrl);
      } else if (e.key === "ArrowRight" && !showFullPageModal && nextUrl) {
        router.push(nextUrl);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape") {
        if (showFullPageModal) {
          setShowFullPageModal(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          handleExit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevUrl, nextUrl, isFullscreen, showFullPageModal, router, returnUrl, exam.id_prova]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
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
      <div className="sticky top-0 z-40 h-16 px-6 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur flex items-center justify-between gap-4 select-none">
        {/* Left: Exit & Question Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleExit}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Sair do modo apresentação (Retornar à galeria filtrada)"
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
              {isPlaylistActive && " (Filtro Ativo)"}
            </p>
          </div>
        </div>

        {/* Center: Presentation tools (Zoom, Full Page Context, Tags, Text Toggle, Audit Flag) */}
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

          {/* Full Page Context Button */}
          <button
            onClick={() => {
              setFullPageNum(question.paginas[0] || 1);
              setShowFullPageModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
            title="Ver a página inteira do PDF original para ler textos motivadores longos anteriores"
          >
            <BookOpen className="w-4 h-4" />
            <span>📄 Ver Folha Completa da Prova</span>
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showSidePanel && activeTab === "tags" ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-700"
              }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Categorias</span>
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showSidePanel && activeTab === "text" ? "bg-sky-600 text-white" : "text-slate-300 hover:bg-slate-700"
              }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1"></div>

          {/* Audit Flag Trigger (abre o mesmo Drawer) */}
          <button
            onClick={() => {
              if (showSidePanel && activeTab === "flag") {
                setShowSidePanel(false);
              } else {
                setActiveTab("flag");
                setShowSidePanel(true);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${showSidePanel && activeTab === "flag"
                ? "bg-amber-600 text-white font-bold"
                : isFlagged
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 font-bold"
                  : "text-slate-300 hover:bg-slate-700"
              }`}
            title="Sinalizar anomalia nesta questão para a auditoria"
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>{isFlagged ? "Sinalizada" : "Sinalizar"}</span>
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
          {prevUrl ? (
            <Link
              href={prevUrl}
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

          {nextUrl ? (
            <Link
              href={nextUrl}
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

        {/* Collapsible Side Panel (Tags, Transcribed Text, or Audit Flag) */}
        {showSidePanel && (
          <div className="w-96 border-l border-slate-800 bg-slate-900 p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                {activeTab === "tags" && <Tag className="w-4 h-4 text-sky-400" />}
                {activeTab === "text" && <FileText className="w-4 h-4 text-sky-400" />}
                {activeTab === "flag" && <Flag className="w-4 h-4 text-amber-400 fill-amber-400" />}
                <span className={activeTab === "flag" ? "text-amber-400" : "text-sky-400"}>
                  {activeTab === "tags" && "Classificação Temática"}
                  {activeTab === "text" && "Texto da Questão"}
                  {activeTab === "flag" && "Sinalizar para Auditoria"}
                </span>
              </h3>
              <button
                onClick={() => setShowSidePanel(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeTab === "tags" && (
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
            )}

            {activeTab === "text" && (
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

            {activeTab === "flag" && (
              <AuditFlagContent
                id_prova={exam.id_prova}
                id_questao={question.id_questao}
                reportedFrom="docente"
                onSuccess={() => setShowSidePanel(false)}
              />
            )}
          </div>
        )}
      </div>

      {/* Full Page Context Modal */}
      {showFullPageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between bg-slate-900/90 p-4 rounded-2xl border border-slate-800 max-w-6xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white">
                  Folha Completa do PDF Original — Página {fullPageNum} de {exam.total_paginas}
                </h2>
                <p className="text-xs text-slate-400">
                  {exam.id_prova} · Consulte textos motivadores longos ou tabelas contextuais
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setFullPageZoom((prev) => Math.max(prev - 0.25, 0.75))}
                  className="p-1 rounded text-slate-300 hover:text-white"
                  title="Reduzir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-bold">{Math.round(fullPageZoom * 100)}%</span>
                <button
                  onClick={() => setFullPageZoom((prev) => Math.min(prev + 0.25, 2.5))}
                  className="p-1 rounded text-slate-300 hover:text-white"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Page Navigator Controls */}
              <div className="flex items-center gap-2">
                <button
                  disabled={fullPageNum <= 1}
                  onClick={() => setFullPageNum((prev) => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Página Anterior
                </button>
                <button
                  disabled={fullPageNum >= exam.total_paginas}
                  onClick={() => setFullPageNum((prev) => Math.min(exam.total_paginas, prev + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-colors"
                >
                  Próxima Página
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFullPageModal(false)}
                className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-2"
                title="Fechar folha completa (Tecla ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Page Viewer Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <div
              style={{ transform: `scale(${fullPageZoom})`, transformOrigin: "center center" }}
              className="transition-transform duration-200 ease-out max-w-4xl max-h-full flex justify-center"
            >
              <img
                src={`/questoes/${exam.id_prova}/paginas/pagina_${fullPageNum}.png`}
                alt={`Página ${fullPageNum} do PDF original ${exam.id_prova}`}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl bg-white select-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
