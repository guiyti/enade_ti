import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllExams, getExamById } from "@/lib/enade";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  Eye,
  FileText,
  Layers,
  ArrowRight
} from "lucide-react";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const exams = await getAllExams();
  return exams.map((exam) => ({
    id_prova: exam.id_prova,
  }));
}

interface PageProps {
  params: Promise<{ id_prova: string }>;
}

export default async function AdminExamDetailPage({ params }: PageProps) {
  const { id_prova } = await params;
  const exam = await getExamById(id_prova);

  if (!exam) {
    notFound();
  }

  const discCount = exam.questoes.filter((q) => q.tipo === "DISCURSIVA").length;
  const objCount = exam.questoes.filter((q) => q.tipo === "OBJETIVA").length;
  const aprovadasCount = exam.questoes.filter((q) => q.status === "APROVADA").length;
  const revisarCount = exam.questoes.filter((q) => q.status === "REVISAR" || q.confianca < 0.8).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Painel de Auditoria
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/docente/prova/${exam.id_prova}`}
            className="px-3.5 py-1.5 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 hover:bg-sky-100 text-xs font-semibold transition-colors"
          >
            Visualizar no Modo Aula (Docente)
          </Link>
        </div>
      </div>

      {/* Exam Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {exam.curso}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Ano {exam.ano}
              </span>
              <span className="text-xs font-medium text-slate-400 font-mono">
                {exam.arquivo}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Prova {exam.id_prova}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-slate-400 font-medium">Score de Qualidade</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {exam.score_geral.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Quick Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400">Total Questões:</span>
            <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-200">{exam.questoes_extraidas}</span>
          </div>
          <div>
            <span className="text-slate-400">Discursivas:</span>
            <span className="ml-1.5 font-bold text-sky-600 dark:text-sky-400">{discCount}</span>
          </div>
          <div>
            <span className="text-slate-400">Objetivas:</span>
            <span className="ml-1.5 font-bold text-indigo-600 dark:text-indigo-400">{objCount}</span>
          </div>
          <div>
            <span className="text-slate-400">Páginas:</span>
            <span className="ml-1.5 font-bold text-slate-800 dark:text-slate-200">{exam.total_paginas}</span>
          </div>
        </div>
      </div>

      {/* Question Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Questões Extraídas ({exam.questoes.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {exam.questoes.map((q) => {
            const isDisc = q.tipo === "DISCURSIVA";

            return (
              <div
                key={q.id_questao}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
              >
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                      {q.id_questao}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDisc
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                          : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {q.tipo}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      q.status === "APROVADA"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                        : q.status === "REVISAR"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                {/* Preview Image Container */}
                <div className="h-48 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-3 overflow-hidden border-b border-slate-100 dark:border-slate-800 relative">
                  <img
                    src={q.caminho_png}
                    alt={`Questão ${q.id_questao}`}
                    className="max-h-full max-w-full object-contain rounded filter group-hover:scale-[1.02] transition-transform duration-200"
                    loading="lazy"
                  />
                </div>

                {/* Footer info & CTA */}
                <div className="p-4 mt-auto flex items-center justify-between text-xs">
                  <div className="text-slate-500 dark:text-slate-400">
                    Pág. {q.paginas.join(", ")} · {q.largura}x{q.altura}px
                  </div>

                  <Link
                    href={`/admin/${exam.id_prova}/${q.id_questao}`}
                    className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform"
                  >
                    Auditar
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
