import Link from "next/link";
import { getGlobalStats, getAllCategories, getAllExams } from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { 
  Presentation, 
  ShieldCheck, 
  Search, 
  FileText, 
  CheckCircle2, 
  Layers, 
  ArrowRight, 
  Sparkles,
  Award,
  BookOpen,
  Tag
} from "lucide-react";

export const dynamic = "force-static";

export default async function HomePage() {
  const stats = await getGlobalStats();
  const categories = await getAllCategories();
  const exams = await getAllExams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Banco Visual de Questões Classificadas por Disciplinas</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Explore o ENADE por <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">Áreas do Conhecimento</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Mais de 600 recortes visuais de alta definição (300 DPI) catalogados para ensino, apresentações dinâmicas em sala de aula e auditoria.
        </p>
      </div>

      {/* Primary Knowledge Areas Grid (Theme-First) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Layers className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              Grandes Áreas & Disciplinas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecione uma área para navegar visualmente em todas as questões históricas do tema
            </p>
          </div>

          <Link
            href="/docente/busca"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            Busca Textual Específica
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/docente/temas/${cat.slug}`}
              className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-sm hover:shadow-lg hover:border-sky-400 dark:hover:border-sky-700 transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CategoryIcon name={cat.iconName} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {cat.count} questões
                  </span>
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
                <span>Ver Banco Visual</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Access Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto pt-6">
        {/* Card Docente */}
        <Link
          href="/docente"
          className="group relative overflow-hidden rounded-2xl border-2 border-sky-200 dark:border-sky-900/60 bg-gradient-to-b from-sky-50/50 to-white dark:from-sky-950/20 dark:to-slate-900 p-8 shadow-lg shadow-sky-500/5 hover:shadow-xl hover:shadow-sky-500/10 hover:border-sky-400 dark:hover:border-sky-700 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform">
              <Presentation className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Ambiente de Ensino</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Portal do Docente</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Apresente questões em tela cheia com **Modo Slide/Cinema**, navegação por setas do teclado, busca temática por conceitos (SQL, UML, Algoritmos) e zoom de alta fidelidade em diagramas para sala de aula.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400 group-hover:translate-x-1.5 transition-transform">
            <span>Acessar Portal do Docente</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Card Administrador */}
        <Link
          href="/admin"
          className="group relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-b from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-slate-900 p-8 shadow-lg shadow-indigo-500/5 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-300 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Governança & Qualidade</span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Painel de Auditoria</h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Audite a extração geométrica, confira o recorte dos PNGs lado a lado com o texto extraído, edite categorias temáticas e visualize relatórios de qualidade e anomalias.
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1.5 transition-transform">
            <span>Acessar Painel de Auditoria</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-slate-900 dark:text-white">{categories.length}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Disciplinas / Áreas</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400">{stats.totalQuestoes}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Capturas em PNG</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">13</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Provas Processadas</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">300 DPI</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Resolução Nativa</div>
        </div>
      </div>
    </div>
  );
}
