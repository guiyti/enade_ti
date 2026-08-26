"use client";

import { useState, useRef } from "react";
import { Plus, X, Tag, Sparkles, Check, Lock, KeyRound, AlertCircle } from "lucide-react";
import { useQuestionTags } from "@/lib/tagStore";
import { useFlagAuth } from "@/lib/authStore";

const COMMON_CATEGORIES = [
  "Banco de Dados",
  "Algoritmos e Estruturas de Dados",
  "Engenharia de Software",
  "Programação e POO",
  "Redes e Segurança",
  "Sistemas Operacionais e Arquitetura",
  "Governança e Gestão de TI",
  "Teoria da Computação e Compiladores",
  "Inteligência Artificial e Dados",
  "Formação Geral e Sociedade",
];

interface TagEditorProps {
  id_prova: string;
  id_questao: string;
  initialTags: string[];
  readOnly?: boolean;
}

export function TagEditor({
  id_prova,
  id_questao,
  initialTags,
  readOnly = false,
}: TagEditorProps) {
  const { tags, addTag, removeTag } = useQuestionTags(id_prova, id_questao, initialTags);
  const { isAuthorized, authorize } = useFlagAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [inputVal, setInputVal] = useState("");

  // Pending action requiring password
  const [pendingAction, setPendingAction] = useState<
    { type: "add"; tag: string } | { type: "remove"; tag: string } | null
  >(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const requestAdd = (val: string) => {
    if (!val.trim()) return;
    if (isAuthorized) {
      addTag(val.trim());
      setInputVal("");
      setIsAdding(false);
    } else {
      setPendingAction({ type: "add", tag: val.trim() });
      setPasswordInput("");
      setAuthError(null);
      setTimeout(() => passRef.current?.focus(), 100);
    }
  };

  const requestRemove = (tag: string) => {
    if (isAuthorized) {
      removeTag(tag);
    } else {
      setPendingAction({ type: "remove", tag });
      setPasswordInput("");
      setAuthError(null);
      setTimeout(() => passRef.current?.focus(), 100);
    }
  };

  const handleConfirmAuth = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passwordInput.trim()) {
      setAuthError("Digite a senha docente.");
      passRef.current?.focus();
      return;
    }

    const res = authorize(passwordInput);
    if (res.success) {
      if (pendingAction?.type === "add") {
        addTag(pendingAction.tag);
        setInputVal("");
        setIsAdding(false);
      } else if (pendingAction?.type === "remove") {
        removeTag(pendingAction.tag);
      }
      setPendingAction(null);
      setAuthError(null);
      setPasswordInput("");
    } else {
      setAuthError(res.message || "Senha incorreta.");
      passRef.current?.select();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5" />
          Categorias & Disciplinas ({tags.length})
        </span>

        {!readOnly && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Categoria
          </button>
        )}
      </div>

      {/* Tags Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group shadow-sm"
          >
            <span>{t}</span>
            {!readOnly && (
              <button
                onClick={() => requestRemove(t)}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title={`Remover ${t}`}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}

        {tags.length === 0 && (
          <span className="text-xs text-slate-400 italic">Nenhuma categoria atribuída.</span>
        )}
      </div>

      {/* Password Challenge for Adding/Removing */}
      {pendingAction && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {pendingAction.type === "add"
                  ? `Senha Docente para adicionar "${pendingAction.tag}"`
                  : `Senha Docente para remover "${pendingAction.tag}"`}
              </span>
            </div>
            <button
              onClick={() => setPendingAction(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleConfirmAuth} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-3.5 h-3.5" />
              </div>
              <input
                ref={passRef}
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError(null);
                }}
                placeholder="Senha docente..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm"
            >
              Confirmar
            </button>
          </form>

          {authError && (
            <div className="flex items-center gap-1 text-xs text-rose-400 font-semibold">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      )}

      {/* Add Tag Popover / Form */}
      {isAdding && !readOnly && !pendingAction && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") requestAdd(inputVal);
                if (e.key === "Escape") setIsAdding(false);
              }}
              placeholder="Digite o nome da categoria ou selecione abaixo..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
            <button
              onClick={() => requestAdd(inputVal)}
              disabled={!inputVal.trim()}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold disabled:opacity-40 transition-colors"
            >
              Adicionar
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Select Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sugestões Rápidas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CATEGORIES.filter((c) => !tags.includes(c)).map((cat) => (
                <button
                  key={cat}
                  onClick={() => requestAdd(cat)}
                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:text-sky-600 transition-colors"
                >
                  + {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
