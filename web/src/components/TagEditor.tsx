"use client";

import { useState } from "react";
import { Plus, X, Tag, Sparkles, Check } from "lucide-react";
import { useQuestionTags } from "@/lib/tagStore";

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
  const [isAdding, setIsAdding] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const handleAdd = (val: string) => {
    if (val.trim()) {
      addTag(val.trim());
      setInputVal("");
      setIsAdding(false);
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
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 transition-colors"
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
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 group shadow-sm"
          >
            <span>{t}</span>
            {!readOnly && (
              <button
                onClick={() => removeTag(t)}
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

      {/* Add Tag Popover / Form */}
      {isAdding && !readOnly && (
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd(inputVal);
                if (e.key === "Escape") setIsAdding(false);
              }}
              placeholder="Digite o nome de uma categoria ou selecione abaixo..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              autoFocus
            />
            <button
              onClick={() => handleAdd(inputVal)}
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
                  onClick={() => handleAdd(cat)}
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
