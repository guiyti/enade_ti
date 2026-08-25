import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllExams, getExamById } from "@/lib/enade";
import { ExamGalleryClient } from "@/components/ExamGalleryClient";
import { ArrowLeft, Play } from "lucide-react";

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
      <ExamGalleryClient exam={exam} />
    </div>
  );
}
