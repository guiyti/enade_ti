import Link from "next/link";
import { getAllExams, getGlobalStats } from "@/lib/enade";
import { AdminAuditFlagsSection } from "@/components/AdminAuditFlagsSection";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight,
  Filter,
  FileCheck2,
  FileText
} from "lucide-react";

export const dynamic = "force-static";

export default async function AdminDashboardPage() {
  const stats = await getGlobalStats();
  const exams = await getAllExams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Painel de Auditoria & Qualidade
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Conferência geométrica, validação de texto e moderação das questões extraídas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            ← Voltar para a Tela Inicial
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Provas</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalProvas}</div>
          <div className="text-xs text-slate-500 mt-1">{stats.totalQuestoes} questões mapeadas</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Score Médio</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {stats.scoreMedio.toFixed(1)}%
          </div>
          <div className="text-xs text-emerald-600/80 mt-1">Confiabilidade geométrica global</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Para Revisão</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {stats.questoesParaRevisao}
          </div>
          <div className="text-xs text-slate-500 mt-1">Questões com baixa confiança</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Provas c/ Atenção</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {stats.provasComAtencao}
          </div>
          <div className="text-xs text-slate-500 mt-1">Score geral inferior a 90%</div>
        </div>
      </div>

      {/* Audit Flags Section (Sinalizações de Docentes e Auditores) */}
      <AdminAuditFlagsSection />

      {/* Exams Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Provas Processadas</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Selecione uma prova para auditar as questões individuais</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">ID da Prova</th>
                <th className="px-6 py-4">Ano</th>
                <th className="px-6 py-4">Curso</th>
                <th className="px-6 py-4">Páginas</th>
                <th className="px-6 py-4">Questões Extraídas</th>
                <th className="px-6 py-4">Score de Qualidade</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {exams.map((exam) => {
                const discCount = exam.questoes.filter(q => q.tipo === "DISCURSIVA").length;
                const objCount = exam.questoes.filter(q => q.tipo === "OBJETIVA").length;

                return (
                  <tr key={exam.id_prova} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{exam.id_prova}</span>
                      </div>
                      <div className="text-xs text-slate-400 font-normal font-mono mt-0.5">{exam.arquivo}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">{exam.ano}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exam.curso}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{exam.total_paginas}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {exam.questoes_extraidas} questões
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {discCount} disc · {objCount} obj
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          exam.score_geral >= 95
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : exam.score_geral >= 85
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {exam.score_geral.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/${exam.id_prova}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        Auditar Questões
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
