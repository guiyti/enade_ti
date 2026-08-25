import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  getQuestionsByCourseAndCategory, 
  COURSE_DEFINITIONS, 
  getAllCategories 
} from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CourseGalleryClient } from "@/components/CourseGalleryClient";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  const courses = ["ccp", "ads", "gti"];
  const params: { curso: string; categoria: string }[] = [];

  for (const c of courses) {
    for (const cat of categories) {
      params.push({ curso: c, categoria: cat.slug });
    }
  }

  return params;
}

interface PageProps {
  params: Promise<{ curso: string; categoria: string }>;
}

export default async function DocenteCourseTopicPage({ params }: PageProps) {
  const { curso, categoria } = await params;
  const upperCode = curso.toUpperCase();
  const courseDef = COURSE_DEFINITIONS[upperCode];

  if (!courseDef) {
    notFound();
  }

  const { category, nativeItems, crossItems } = await getQuestionsByCourseAndCategory(curso, categoria);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href={`/docente/curso/${curso}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar às Disciplinas de {courseDef.code}
        </Link>
      </div>

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CategoryIcon name={category.iconName} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-600 text-white">
                {courseDef.code}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {category.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {category.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Course Gallery Client with Cross-Course Toggle */}
      <CourseGalleryClient
        courseDef={courseDef}
        category={category}
        nativeItems={nativeItems}
        crossItems={crossItems}
      />
    </div>
  );
}
