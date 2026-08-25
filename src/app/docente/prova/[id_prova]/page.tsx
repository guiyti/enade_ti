import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllExams, getExamById } from "@/lib/enade";
import { 
  ArrowLeft, 
  Presentation, 
  Play, 
  Sparkles, 
  Layers, 
  Eye
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

export default async function DocenteExamQuestionsPage({ params }: PageProps) {
  const { id_prova } = await params;
  const exam = await getExamById(id_prova);

  if (!exam) {
    notFound();
  }

  const firstQuestion = exam.questoes[0]?.id_questao || "q01";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/docente"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Catálogo Docente
        </Link>

        <Link
          href={`/docente/apresentacao/${exam.id_prova}/${firstQuestion}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
        >
          <Play className="w-4 h-4 fill-current" />
          Apresentar Prova Completa (Slide View)
        </Link>
      </div>

      {/* Exam Header */}
      <div className="bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent p-6 sm:p-8 rounded-2xl border border-sky-200/60 dark:border-sky-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
              {exam.curso}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Ano {exam.ano}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            ENADE {exam.id_prova}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {exam.questoes_extraidas} questões prontas para sala de aula
          </p>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {exam.questoes.map((q) => {
          const isDisc = q.tipo === "DISCURSIVA";

          return (
            <Link
              key={q.id_questao}
              href={`/docente/apresentacao/${exam.id_prova}/${q.id_questao}`}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all group"
            >
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                  Questão {q.id_questao}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isDisc
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {q.tipo}
                </span>
              </div>

              {/* Visual Thumbnail */}
              <div className="h-52 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
                <img
                  src={q.caminho_png}
                  alt={`Questão ${q.id_questao}`}
                  className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Página {q.paginas.join(", ")}</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Apresentar <Play className="w-3 h-3 fill-current" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
