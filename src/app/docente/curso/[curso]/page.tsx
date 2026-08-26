import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoriesByCourse, COURSE_DEFINITIONS, getAllExams } from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { 
  ArrowLeft, 
  Layers, 
  Search, 
  GraduationCap, 
  ArrowRight, 
  Globe,
  Sparkles,
  BookOpen,
  Boxes,
  ShieldAlert,
  Code2
} from "lucide-react";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return [
    { curso: "ccp" },
    { curso: "ads" },
    { curso: "gti" },
    { curso: "fg" },
  ];
}

interface PageProps {
  params: Promise<{ curso: string }>;
}

export default async function DocenteCoursePage({ params }: PageProps) {
  const { curso } = await params;
  const upperCode = curso.toUpperCase();
  const isFg = upperCode === "FG" || upperCode.includes("FORMA");
  const courseDef = isFg ? COURSE_DEFINITIONS.FG : COURSE_DEFINITIONS[upperCode];

  if (!courseDef) {
    notFound();
  }

  const allCategories = await getCategoriesByCourse(upperCode);
  const exams = await getAllExams();

  const courseExams = isFg
    ? exams
    : exams.filter((e) => e.curso.toUpperCase() === upperCode);

  const totalQuestions = isFg
    ? 149
    : courseExams.reduce((acc, e) => acc + e.questoes_extraidas, 0);

  // Separate FG categories vs Specific categories
  const specificCategories = allCategories.filter((c) => c.slug !== "formacao-geral-e-sociedade");
  const fgCategory = allCategories.find((c) => c.slug === "formacao-geral-e-sociedade");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à Seleção de Cursos
        </Link>

        <Link
          href="/docente/busca"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
        >
          <Search className="w-4 h-4" />
          Busca Textual Específica
        </Link>
      </div>

      {/* Course Banner Header */}
      <div className={`p-6 sm:p-8 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isFg 
          ? "bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent border-teal-200/60 dark:border-teal-900/60"
          : "bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border-sky-200/60 dark:border-sky-900/60"
      }`}>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-2.5 py-1 rounded text-white ${isFg ? "bg-teal-600" : "bg-sky-600"}`}>
              {courseDef.code}
            </span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {isFg ? "13 Provas Oficiais (Todas)" : `${courseExams.length} Cadernos Oficiais ENADE`}
            </span>
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${courseDef.badgeClass}`}>
              {isFg ? "🌍 Formação Geral (Transversal)" : "🎯 Formação Específica"}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {courseDef.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            {courseDef.description}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center shrink-0">
          <div className={`text-3xl font-black ${isFg ? "text-teal-600 dark:text-teal-400" : "text-sky-600 dark:text-sky-400"}`}>
            {totalQuestions}
          </div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            {isFg ? "Questões de Formação Geral" : `Questões de ${courseDef.code}`}
          </div>
        </div>
      </div>

      {/* 1. SEÇÃO FORMAÇÃO ESPECÍFICA (Disciplinas Técnicas) */}
      {!isFg && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-black uppercase tracking-wider mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              Componente de Formação Específica
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Disciplinas Técnicas do Curso ({courseDef.code})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecione uma disciplina para ver as questões da prova de {courseDef.code} e questões correlatas de outros cursos.
            </p>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {specificCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/docente/curso/${curso}/tema/${cat.slug}`}
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                        {cat.nativeCount || 0} nativas
                      </span>
                      {(cat.crossCount || 0) > 0 && (
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" title="Questões de outros cursos do mesmo tema">
                          +{cat.crossCount} correlatas
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  <span>Ver Galeria ({cat.count} total)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 2. SEÇÃO FORMAÇÃO GERAL */}
      <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black uppercase tracking-wider mb-1">
            <Globe className="w-3.5 h-3.5" />
            Componente de Formação Geral (Transversal)
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isFg ? "Tópicos de Formação Geral e Cidadania" : `Questões de Formação Geral em ${courseDef.code}`}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ética, cidadania, direitos humanos, sustentabilidade ambiental, sociedade digital e relações de trabalho.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href={`/docente/curso/${isFg ? "fg" : curso}/tema/formacao-geral-e-sociedade`}
            className="group bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-200 dark:border-teal-900/60 p-6 shadow-sm hover:shadow-lg hover:border-teal-400 dark:hover:border-teal-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                  {fgCategory?.count || 149} Questões no Banco
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Formação Geral e Sociedade
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {fgCategory?.description || "Ética, cidadania, sustentabilidade, direitos humanos, diversidade, sociedade digital e políticas públicas."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-teal-100 dark:border-teal-900/40 flex items-center justify-between text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
              <span>Abrir Galeria de Formação Geral</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
