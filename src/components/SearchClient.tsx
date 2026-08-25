"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Presentation, 
  Play, 
  Sparkles, 
  ArrowLeft,
  X,
  BookOpen
} from "lucide-react";
import type { ExamData, QuestionData } from "@/lib/enade";
import { savePresentationContext } from "@/lib/presentationContext";

interface SearchClientProps {
  exams: ExamData[];
}

interface SearchResult {
  exam: ExamData;
  question: QuestionData;
  highlightText: string;
}

export function SearchClient({ exams }: SearchClientProps) {
  const [query, setQuery] = useState("");
  const [selectedCurso, setSelectedCurso] = useState<string>("ALL");
  const [selectedTipo, setSelectedTipo] = useState<string>("ALL");

  const cursos = useMemo(() => {
    const set = new Set<string>();
    exams.forEach((e) => set.add(e.curso));
    return Array.from(set);
  }, [exams]);

  const results: SearchResult[] = useMemo(() => {
    const term = query.trim().toLowerCase();
    const matches: SearchResult[] = [];

    for (const exam of exams) {
      if (selectedCurso !== "ALL" && exam.curso !== selectedCurso) {
        continue;
      }

      for (const q of exam.questoes) {
        if (selectedTipo !== "ALL" && q.tipo !== selectedTipo) {
          continue;
        }

        if (!term) {
          matches.push({
            exam,
            question: q,
            highlightText: q.texto_completo?.slice(0, 180) || "",
          });
          continue;
        }

        const fullText = (q.texto_completo || "").toLowerCase();
        const idMatches = q.id_questao.toLowerCase().includes(term);
        const examMatches = exam.id_prova.toLowerCase().includes(term);

        if (idMatches || examMatches || fullText.includes(term)) {
          let snippet = "";
          if (fullText.includes(term)) {
            const idx = fullText.indexOf(term);
            const start = Math.max(0, idx - 60);
            const end = Math.min(fullText.length, idx + term.length + 100);
            snippet = (start > 0 ? "..." : "") + q.texto_completo.slice(start, end) + "...";
          } else {
            snippet = q.texto_completo?.slice(0, 180) || "";
          }

          matches.push({
            exam,
            question: q,
            highlightText: snippet,
          });
        }
      }
    }

    return matches;
  }, [exams, query, selectedCurso, selectedTipo]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Link
            href="/docente"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar ao Portal Docente
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Busca de Questões por Tema & Conceito
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pesquise palavras-chave em mais de 600 questões (ex: "SQL", "Diagrama de Classes", "Herança", "Grafo")
          </p>
        </div>
      </div>

      {/* Search Input and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite termos como: SQL, Algoritmo, B-Tree, UML, Polimorfismo..."
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Curso:</span>
            <select
              value={selectedCurso}
              onChange={(e) => setSelectedCurso(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">Todos os Cursos</option>
              {cursos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Tipo:</span>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">Todos os Tipos</option>
              <option value="OBJETIVA">Objetivas</option>
              <option value="DISCURSIVA">Discursivas</option>
            </select>
          </div>

          <div className="ml-auto text-slate-400 font-medium">
            {results.length} questão(ões) encontrada(s)
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(({ exam, question, highlightText }) => {
            const isDisc = question.tipo === "DISCURSIVA";

            return (
              <div
                key={`${exam.id_prova}-${question.id_questao}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all group"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                      {question.id_questao}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({exam.id_prova})
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isDisc
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {question.tipo}
                  </span>
                </div>

                {/* Preview Image */}
                <div className="h-44 bg-slate-50 dark:bg-slate-950 p-3 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={question.caminho_png}
                    alt={`Questão ${question.id_questao}`}
                    className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Snippet text */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {highlightText}
                  </p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Ano {exam.ano} · {exam.curso}
                    </span>

                    <Link
                      href={`/docente/apresentacao/${exam.id_prova}/${question.id_questao}`}
                      onClick={() => {
                        const playlist = results.map((r) => ({
                          id_prova: r.exam.id_prova,
                          id_questao: r.question.id_questao,
                        }));
                        savePresentationContext(playlist);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition-all"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Apresentar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
          <Search className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">Nenhuma questão encontrada</h3>
          <p className="text-xs">Tente outros termos de busca ou selecione "Todos os Cursos".</p>
        </div>
      )}
    </div>
  );
}
