"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Flag, 
  X, 
  Check, 
  Trash2, 
  AlertCircle, 
  KeyRound,
  Lock,
  ShieldCheck
} from "lucide-react";
import { 
  useAuditFlag, 
  AUDIT_REASON_OPTIONS 
} from "@/lib/auditStore";
import { useFlagAuth, useAuditorAuth } from "@/lib/authStore";

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
  const { flag, isFlagged, save, remove } = useAuditFlag(id_prova, id_questao);
  const { isAuthorized, authorize: authorizeFlag } = useFlagAuth();
  const { isAuditor, authorize: authorizeAuditor } = useAuditorAuth();

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [note, setNote] = useState<string>("");
  const [flagPassword, setFlagPassword] = useState("");
  
  // Auditor password challenge for deletion
  const [isPromptingDeleteAuth, setIsPromptingDeleteAuth] = useState(false);
  const [auditorPassword, setAuditorPassword] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const auditorInputRef = useRef<HTMLInputElement>(null);

  // Sync state when flag changes or modal opens
  useEffect(() => {
    if (flag) {
      setSelectedReasons(flag.reasons || []);
      setNote(flag.note || "");
    } else {
      setSelectedReasons([]);
      setNote("");
    }
    setErrorMsg(null);
    setIsPromptingDeleteAuth(false);
    setAuditorPassword("");
  }, [flag, isOpen]);

  const handleToggleReason = (reasonLabel: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reasonLabel)
        ? prev.filter((r) => r !== reasonLabel)
        : [...prev, reasonLabel]
    );
  };

  const handleSave = () => {
    if (selectedReasons.length === 0 && !note.trim()) {
      setErrorMsg("Selecione pelo menos um motivo ou preencha uma observação.");
      return;
    }

    // Se ainda não está autorizado para sinalizar nesta sessão, valida a senha docente
    if (!isAuthorized) {
      if (!flagPassword.trim()) {
        setErrorMsg("Digite a senha docente para confirmar a sinalização.");
        passwordInputRef.current?.focus();
        return;
      }

      const authRes = authorizeFlag(flagPassword);
      if (!authRes.success) {
        setErrorMsg(authRes.message || "Senha de sinalização incorreta.");
        passwordInputRef.current?.select();
        return;
      }
    }

    setErrorMsg(null);
    save(selectedReasons, note, reportedFrom);
    setFeedbackMsg("Sinalização salva com sucesso!");
    setTimeout(() => {
      setFeedbackMsg(null);
      setIsOpen(false);
    }, 900);
  };

  const handleStartRemove = () => {
    setErrorMsg(null);
    if (isAuditor) {
      remove();
      setFeedbackMsg("Sinalização removida.");
      setTimeout(() => {
        setFeedbackMsg(null);
        setIsOpen(false);
      }, 700);
    } else {
      setIsPromptingDeleteAuth(true);
      setTimeout(() => auditorInputRef.current?.focus(), 100);
    }
  };

  const handleConfirmRemoveWithAuditorAuth = () => {
    if (!auditorPassword.trim()) {
      setErrorMsg("Digite a senha do auditor para remover esta sinalização.");
      auditorInputRef.current?.focus();
      return;
    }

    const authRes = authorizeAuditor(auditorPassword);
    if (!authRes.success) {
      setErrorMsg(authRes.message || "Senha do auditor incorreta.");
      auditorInputRef.current?.select();
      return;
    }

    setErrorMsg(null);
    remove();
    setFeedbackMsg("Sinalização resolvida e removida pelo auditor!");
    setTimeout(() => {
      setFeedbackMsg(null);
      setIsOpen(false);
    }, 900);
  };

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
        title={isFlagged ? "Sinalizada para auditoria (clique para ver/editar)" : "Sinalizar para auditoria"}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isFlagged ? "bg-amber-500/20 text-amber-400" : "bg-sky-500/20 text-sky-400"}`}>
                  <Flag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base tracking-tight text-white flex items-center gap-2">
                    <span>Sinalizar Questão</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300 border border-slate-700">
                      {id_prova} · {id_questao}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Indique anomalias de corte ou texto para conferência no Painel de Auditoria.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Motivos / Tipos de Sinalização */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Selecione os Problemas Identificados:
              </label>

              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                {AUDIT_REASON_OPTIONS.map((item) => {
                  const isChecked = selectedReasons.includes(item.label);
                  return (
                    <label
                      key={item.id}
                      onClick={() => handleToggleReason(item.label)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-slate-800/90 border-sky-500 text-white"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/50 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isChecked
                            ? "bg-sky-600 border-sky-500 text-white"
                            : "border-slate-600 bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="font-bold text-slate-200 text-sm">{item.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5 leading-snug">
                          {item.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Observação Adicional */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Observação / Detalhes (Opcional):
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: O enunciado dessa questão começa na coluna da folha anterior..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {/* Senha Docente para Salvar (se ainda não validada) */}
            {!isAuthorized && !isPromptingDeleteAuth && (
              <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Senha Docente para Salvar Sinalização</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    ref={passwordInputRef}
                    type="password"
                    value={flagPassword}
                    onChange={(e) => {
                      setFlagPassword(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSave();
                    }}
                    placeholder="Digite a senha docente..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Desafio de Senha de Auditor para Remoção */}
            {isPromptingDeleteAuth && (
              <div className="space-y-2 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800 animate-in fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Senha do Auditor para Remover Sinalização</span>
                </div>
                <p className="text-xs text-slate-300">
                  A remoção de sinalizações é restrita à auditoria institucional.
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={auditorInputRef}
                      type="password"
                      value={auditorPassword}
                      onChange={(e) => {
                        setAuditorPassword(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirmRemoveWithAuditorAuth();
                      }}
                      placeholder="Senha do auditor..."
                      className="w-full bg-slate-900 border border-indigo-700 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                  </div>
                  <button
                    onClick={handleConfirmRemoveWithAuditorAuth}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setIsPromptingDeleteAuth(false);
                      setAuditorPassword("");
                      setErrorMsg(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Mensagens de Feedback e Erro */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs font-semibold text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {feedbackMsg && (
              <div className="p-3 rounded-xl bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300 text-center animate-in fade-in">
                {feedbackMsg}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {isFlagged && !isPromptingDeleteAuth ? (
                <button
                  onClick={handleStartRemove}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover Sinalização
                </button>
              ) : (
                <div></div>
              )}

              {!isPromptingDeleteAuth && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Salvar Sinalização
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
