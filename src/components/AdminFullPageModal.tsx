"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Maximize, 
  Minimize,
  Layers,
  FileSearch
} from "lucide-react";
import { ZoomableImage } from "@/components/ZoomableImage";

interface AdminFullPageModalProps {
  id_prova: string;
  totalPaginas: number;
  initialPage?: number;
  questionId?: string;
  questionPngUrl?: string;
  buttonLabel?: string;
  buttonClassName?: string;
}

export function AdminFullPageModal({
  id_prova,
  totalPaginas,
  initialPage = 1,
  questionId,
  questionPngUrl,
  buttonLabel = "📄 Ver Folha Completa & Folhas Adjacentes",
  buttonClassName = "flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm",
}: AdminFullPageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSplitView, setShowSplitView] = useState<boolean>(false);

  // Sync initialPage when it changes
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  // Keyboard navigation when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(totalPaginas, prev + 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalPaginas]);

  return (
    <>
      <button
        onClick={() => {
          setCurrentPage(initialPage);
          setIsOpen(true);
        }}
        className={buttonClassName}
        title="Auditar página inteira do PDF original para conferência geométrica"
      >
        <BookOpen className="w-4 h-4" />
        <span>{buttonLabel}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden">
          {/* Topbar Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/95 p-4 rounded-2xl border border-slate-800 max-w-7xl w-full mx-auto shadow-2xl overflow-x-auto">
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <FileSearch className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <span>Auditoria de Folha — Página {currentPage} de {totalPaginas}</span>
                  {questionId && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-mono">
                      Questão {questionId}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {id_prova} · Use as setas do teclado
                </p>
              </div>
            </div>

            {/* Middle & Right Controls */}
            <div className="flex flex-nowrap items-center gap-3 shrink-0 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {/* Split View Toggle (if crop is available) */}
              {questionPngUrl && (
                <button
                  onClick={() => setShowSplitView(!showSplitView)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                    showSplitView
                      ? "bg-sky-600 text-white border-sky-500"
                      : "bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750"
                  }`}
                  title="Comparar lado a lado o recorte com a folha inteira"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showSplitView ? "Ocultar Recorte" : "Comparar c/ Recorte"}</span>
                </button>
              )}

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.75))}
                  className="p-1 rounded text-slate-300 hover:text-white"
                  title="Reduzir Zoom"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="px-2 text-xs font-mono font-bold text-slate-200 hover:text-white"
                  title="Zoom 100%"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5))}
                  className="p-1 rounded text-slate-300 hover:text-white"
                  title="Aumentar Zoom"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Page Navigator */}
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-colors border border-slate-700"
                  title="Página Anterior (Seta Esquerda)"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                    <option key={p} value={p}>
                      Página {p}
                    </option>
                  ))}
                </select>

                <button
                  disabled={currentPage >= totalPaginas}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPaginas, prev + 1))}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-white transition-colors border border-slate-700"
                  title="Próxima Página (Seta Direita)"
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-1"
                title="Fechar (Tecla ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stage Body */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4 p-4 overflow-hidden items-center justify-center">
            {/* Left: Split view of question crop if enabled */}
            {showSplitView && questionPngUrl && (
              <div className="flex-1 w-full sm:w-auto h-full bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                <div className="text-xs font-bold text-sky-400 mb-2 uppercase tracking-wide shrink-0">
                  Recorte Atual da Questão ({questionId})
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden w-full relative">
                  <ZoomableImage
                    src={questionPngUrl}
                    alt={`Recorte da Questão ${questionId}`}
                    className="max-h-[75vh] w-auto object-contain rounded-lg shadow-xl bg-white"
                  />
                </div>
              </div>
            )}

            {/* Right / Full Width: Page Image */}
            <div className="flex-1 w-full sm:w-auto h-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-center overflow-hidden relative">
              <ZoomableImage
                src={`/questoes/${id_prova}/paginas/pagina_${currentPage}.png`}
                alt={`Folha Completa ${id_prova} - Página ${currentPage}`}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl bg-white"
                externalZoom={zoomLevel}
                onZoomChange={(z) => setZoomLevel(z)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
