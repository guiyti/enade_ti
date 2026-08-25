import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getQuestionsByCategory } from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { 
  ArrowLeft, 
  Play, 
  Layers, 
  Search, 
  Filter, 
  BookOpen, 
  Presentation,
  Sparkles
} from "lucide-react";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    categoria: cat.slug,
  }));
}

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export default async function ThemeDetailPage({ params }: PageProps) {
  const { categoria } = await params;
  const { category, items } = await getQuestionsByCategory(categoria);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/docente"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar a todas as Áreas
        </Link>

        {items.length > 0 && (
          <Link
            href={`/docente/apresentacao/${items[0].exam.id_prova}/${items[0].question.id_questao}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            Apresentar Tema em Sala de Aula
          </Link>
        )}
      </div>

      {/* Theme Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CategoryIcon name={category.iconName} className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {category.name}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {items.length} questões
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Question Bank Gallery */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Galeria de Questões ({items.length})</span>
          </h2>
          <span className="text-xs text-slate-400">Recortes em 300 DPI organizados para sala de aula</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(({ exam, question }) => {
            const isDisc = question.tipo === "DISCURSIVA";

            return (
              <div
                key={`${exam.id_prova}-${question.id_questao}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all group"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase">
                      {question.id_questao}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exam.id_prova}
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

                {/* Question Visual Image Thumbnail */}
                <div className="h-56 bg-slate-50 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800 relative">
                  <img
                    src={question.caminho_png}
                    alt={`Questão ${question.id_questao}`}
                    className="max-h-full max-w-full object-contain rounded group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Card Footer */}
                <div className="p-4 mt-auto flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Ano {exam.ano} · {exam.curso}
                  </span>

                  <Link
                    href={`/docente/apresentacao/${exam.id_prova}/${question.id_questao}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Apresentar
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
