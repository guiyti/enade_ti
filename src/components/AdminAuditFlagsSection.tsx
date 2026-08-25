"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Flag, 
  Search, 
  Filter, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Calendar, 
  FileText,
  AlertCircle,
  Presentation,
  ShieldCheck,
  Check
} from "lucide-react";
import { 
  useAllAuditFlags, 
  AUDIT_REASON_OPTIONS,
  QuestionAuditFlag
} from "@/lib/auditStore";
import { AuditFlagModal } from "@/components/AuditFlagModal";

export function AdminAuditFlagsSection() {
  const { flagsList, count, remove, clearAll, isLoaded } = useAllAuditFlags();
  const [filterReason, setFilterReason] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedExam, setSelectedExam] = useState<string>("all");

  // Distinct list of exams in the flagged list
  const examsList = useMemo(() => {
    const set = new Set<string>();
    flagsList.forEach((f) => set.add(f.id_prova));
    return Array.from(set).sort();
  }, [flagsList]);

  // Filtered flagged items
  const filteredFlags = useMemo(() => {
    return flagsList.filter((item) => {
      // Reason filter
      if (filterReason !== "all" && !item.reasons.includes(filterReason)) {
        return false;
      }
      // Exam filter
      if (selectedExam !== "all" && item.id_prova !== selectedExam) {
        return false;
      }
      // Search query (prova, questao, note)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesProva = item.id_prova.toLowerCase().includes(q);
        const matchesQuestao = item.id_questao.toLowerCase().includes(q);
        const matchesNote = item.note ? item.note.toLowerCase().includes(q) : false;
        const matchesReason = item.reasons.some((r) => r.toLowerCase().includes(q));
        return matchesProva || matchesQuestao || matchesNote || matchesReason;
      }
      return true;
    });
  }, [flagsList, filterReason, selectedExam, searchQuery]);

  if (!isLoaded) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-6 p-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Flag className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Sinalizações para Avaliação do Auditor
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                {count} {count === 1 ? "questão" : "questões"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Questões reportadas por docentes ou auditores com anomalias de corte, texto ou conteúdo.
            </p>
          </div>
        </div>

        {count > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Deseja realmente limpar todas as sinalizações avaliadas?")) {
                  clearAll();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              title="Limpar todas as sinalizações"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Todas</span>
            </button>
          </div>
        )}
      </div>

      {count === 0 ? (
        /* Empty State */
        <div className="py-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Nenhuma questão com sinalização ativa
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              Todas as questões estão sem anomalias reportadas. Caso identifique cortes incorretos ou textos faltantes na Apresentação, clique em <strong>Sinalizar</strong> para listar aqui.
            </p>
          </div>
        </div>
      ) : (
        /* Filter Bar and List */
        <div className="space-y-4">
          {/* Controls / Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por prova, questão ou termo..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Filter by Exam */}
            <div>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todas as Provas ({examsList.length})</option>
                {examsList.map((examId) => (
                  <option key={examId} value={examId}>
                    Prova {examId}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Reason */}
            <div>
              <select
                value={filterReason}
                onChange={(e) => setFilterReason(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos os Tipos de Problema</option>
                {AUDIT_REASON_OPTIONS.map((item) => (
                  <option key={item.id} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Flags Table / Cards */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Questão / Prova</th>
                    <th className="px-5 py-3.5">Tipos de Sinalização</th>
                    <th className="px-5 py-3.5">Observação / Detalhes</th>
                    <th className="px-5 py-3.5">Data</th>
                    <th className="px-5 py-3.5 text-right">Ações do Auditor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {filteredFlags.map((item) => {
                    const formattedDate = new Date(item.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={`${item.id_prova}:${item.id_questao}`}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Questão & Prova */}
                        <td className="px-5 py-4 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                              {item.id_questao}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {item.id_prova}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Origem: {item.reportedFrom === "admin" ? "Painel Admin" : "Apresentação Docente"}
                          </div>
                        </td>

                        {/* Tipos de Sinalização / Badges */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-sm">
                            {item.reasons.map((r, idx) => {
                              const reasonOpt = AUDIT_REASON_OPTIONS.find((opt) => opt.label === r);
                              return (
                                <span
                                  key={idx}
                                  className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                                    reasonOpt?.badgeColor ||
                                    "bg-slate-100 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {r}
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        {/* Observação / Detalhes */}
                        <td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs">
                          {item.note ? (
                            <p className="italic bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                              &ldquo;{item.note}&rdquo;
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">Sem observações adicionais</span>
                          )}
                        </td>

                        {/* Data */}
                        <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* Ações */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Ver no Admin */}
                            <Link
                              href={`/admin/${item.id_prova}/${item.id_questao}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-xs font-bold transition-colors"
                              title="Auditar questão completa"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Auditar</span>
                            </Link>

                            {/* Ver na Apresentação */}
                            <Link
                              href={`/docente/apresentacao/${item.id_prova}/${item.id_questao}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors"
                              title="Abrir no modo apresentação"
                            >
                              <Presentation className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">Apresentação</span>
                            </Link>

                            {/* Editar Sinalização Modal */}
                            <AuditFlagModal
                              id_prova={item.id_prova}
                              id_questao={item.id_questao}
                              variant="compact"
                              reportedFrom="admin"
                            />

                            {/* Resolver / Descartar */}
                            <button
                              onClick={() => remove(item.id_prova, item.id_questao)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                              title="Marcar como avaliado / remover sinalização"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredFlags.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                Nenhuma questão encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
