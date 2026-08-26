"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Flag, 
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

interface AuditFlagContentProps {
  id_prova: string;
  id_questao: string;
  reportedFrom?: "docente" | "admin";
  onSuccess?: () => void;
}

export function AuditFlagContent({
  id_prova,
  id_questao,
  reportedFrom = "docente",
  onSuccess,
}: AuditFlagContentProps) {
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

  // Sync state when flag changes
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
  }, [flag, id_prova, id_questao]);

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
      if (onSuccess) onSuccess();
    }, 800);
  };

  const handleStartRemove = () => {
    setErrorMsg(null);
    if (isAuditor) {
      remove();
      setFeedbackMsg("Sinalização removida.");
      setTimeout(() => {
        setFeedbackMsg(null);
        if (onSuccess) onSuccess();
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
      if (onSuccess) onSuccess();
    }, 800);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400 leading-relaxed">
        Indique problemas de corte ou texto para conferência no Painel de Auditoria:
      </p>

      {/* Motivos / Tipos de Problemas */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Tipos de Problemas:
        </label>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {AUDIT_REASON_OPTIONS.map((item) => {
            const isChecked = selectedReasons.includes(item.label);
            return (
              <label
                key={item.id}
                onClick={() => handleToggleReason(item.label)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                  isChecked
                    ? "bg-slate-800 border-sky-500 text-white"
                    : "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700"
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
                  <div className="font-bold text-slate-200">{item.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
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
          Observação (Opcional):
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ex: O enunciado começa na folha anterior..."
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500"
        />
      </div>

      {/* Senha Docente para Salvar */}
      {!isAuthorized && !isPromptingDeleteAuth && (
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950/90 border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Lock className="w-3.5 h-3.5" />
            <span>Senha Docente para Salvar</span>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
              <KeyRound className="w-3.5 h-3.5" />
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
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>
        </div>
      )}

      {/* Senha Auditor para Remoção */}
      {isPromptingDeleteAuth && (
        <div className="space-y-2 p-3 rounded-xl bg-indigo-950/40 border border-indigo-800 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Senha do Auditor para Remover</span>
          </div>
          <div className="flex gap-2">
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
              className="flex-1 bg-slate-900 border border-indigo-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <button
              onClick={handleConfirmRemoveWithAuditorAuth}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              OK
            </button>
            <button
              onClick={() => {
                setIsPromptingDeleteAuth(false);
                setAuditorPassword("");
                setErrorMsg(null);
              }}
              className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Erro e Feedback */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/80 border border-rose-800 text-xs font-semibold text-rose-300">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {feedbackMsg && (
        <div className="p-2 rounded-lg bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300 text-center">
          {feedbackMsg}
        </div>
      )}

      {/* Action Buttons */}
      {!isPromptingDeleteAuth && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {isFlagged ? (
            <button
              onClick={handleStartRemove}
              className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remover
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-600/20 ml-auto"
          >
            <Check className="w-3.5 h-3.5" />
            Salvar Sinalização
          </button>
        </div>
      )}
    </div>
  );
}
