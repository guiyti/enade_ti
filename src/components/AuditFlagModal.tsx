"use client";

import { useState, useEffect } from "react";
import { 
  Flag, 
  X
} from "lucide-react";
import { useAuditFlag } from "@/lib/auditStore";
import { AuditFlagContent } from "@/components/AuditFlagContent";

interface AuditFlagModalProps {
  id_prova: string;
  id_questao: string;
  variant?: "presentation" | "admin" | "compact";
  reportedFrom?: "docente" | "admin";
}

export function AuditFlagModal({
  id_prova,
  id_questao,
  variant = "presentation",
  reportedFrom = "docente",
}: AuditFlagModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { flag, isFlagged } = useAuditFlag(id_prova, id_questao);

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Button rendering by variant
  let buttonEl = null;

  if (variant === "presentation") {
    buttonEl = (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
          isFlagged
            ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
            : "text-slate-300 hover:bg-slate-700 hover:text-white"
        }`}
        title={isFlagged ? "Questão sinalizada para auditoria (clique para editar)" : "Sinalizar problema para a Auditoria"}
      >
        <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-400 text-amber-400" : ""}`} />
        <span>{isFlagged ? "Sinalizada" : "Sinalizar"}</span>
        {isFlagged && flag?.reasons && flag.reasons.length > 0 && (
          <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500/30 text-[10px] font-bold text-amber-200">
            {flag.reasons.length}
          </span>
        )}
      </button>
    );
  } else if (variant === "compact") {
    buttonEl = (
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 rounded-xl transition-colors ${
          isFlagged
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
            : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        }`}
        title={isFlagged ? "Sinalizada para auditoria (abrir drawer)" : "Sinalizar para auditoria"}
      >
        <Flag className={`w-4 h-4 ${isFlagged ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>
    );
  } else {
    // Admin button
    buttonEl = (
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
          isFlagged
            ? "bg-amber-50 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm"
            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
        }`}
      >
        <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500 text-amber-500" : ""}`} />
        <span>{isFlagged ? "Sinalizada para Auditoria" : "Sinalizar para Auditoria"}</span>
        {isFlagged && flag?.reasons && flag.reasons.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px] font-extrabold text-amber-900 dark:text-amber-200">
            {flag.reasons.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <>
      {buttonEl}

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Right Sliding Drawer */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-96 border-l border-slate-800 bg-slate-900 text-white p-6 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                  <Flag className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Sinalizar para Auditoria</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                    {id_prova} · {id_questao}
                  </span>
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <AuditFlagContent
                id_prova={id_prova}
                id_questao={id_questao}
                reportedFrom={reportedFrom}
                onSuccess={() => setIsOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
