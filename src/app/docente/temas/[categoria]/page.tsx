import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCategories, getQuestionsByCategory } from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ThemeGalleryClient } from "@/components/ThemeGalleryClient";
import { ArrowLeft, Play } from "lucide-react";

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
      <ThemeGalleryClient items={items} />
    </div>
  );
}
