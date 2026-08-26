import Link from "next/link";
import { getGlobalStats, getAllCategories } from "@/lib/enade";
import { CategoryIcon } from "@/components/CategoryIcon";
import { 
  Presentation, 
  ShieldCheck, 
  Search, 
  Layers, 
  ArrowRight, 
  GraduationCap,
  Code2,
  Boxes,
  ShieldAlert
} from "lucide-react";

export const dynamic = "force-static";

export default async function HomePage() {
  const stats = await getGlobalStats();
  const categories = await getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. Seleção por Curso de Graduação */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-sky-600 dark:text-sky-400" />
              Seleção por Curso de Graduação
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Escolha o curso para visualizar as disciplinas e recortes oficiais de provas do ENADE.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          {/* Card CCP */}
          <Link
            href="/docente/curso/ccp"
            className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 bg-gradient-to-b from-blue-50/40 to-white dark:from-blue-950/20 dark:to-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-700 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Bacharelado</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Ciência da Computação
                </h2>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  {stats.porCurso["CCP"] || 0} questões nativas
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Algoritmos, Teoria da Computação, Arquitetura, Sistemas Operacionais, Compiladores, IA e Banco de Dados.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
              <span>Navegar por Disciplinas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card ADS */}
          <Link
            href="/docente/curso/ads"
            className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/40 to-white dark:from-emerald-950/20 dark:to-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-700 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Tecnologia</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Análise e Des. de Sistemas
                </h2>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  {stats.porCurso["ADS"] || 0} questões nativas
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Engenharia de Software, Desenvolvimento Web, POO, Banco de Dados, Requisitos e Metodologias Ágeis.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-100 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Navegar por Disciplinas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          {/* Card GTI */}
          <Link
            href="/docente/curso/gti"
            className="group relative overflow-hidden rounded-2xl border-2 border-purple-200 dark:border-purple-900/60 bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/20 dark:to-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-purple-400 dark:hover:border-purple-700 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Tecnologia</span>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                  Gestão da Tecnologia da Informação
                </h2>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  {stats.porCurso["GTI"] || 0} questões nativas
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Governança de TI, ITIL, COBIT, Segurança da Informação, Redes, Gestão de Projetos e LGPD.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-purple-100 dark:border-purple-900/40 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
              <span>Navegar por Disciplinas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-slate-900 dark:text-white">{categories.length}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Disciplinas Mapeadas</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-sky-600 dark:text-sky-400">{stats.totalQuestoes}</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Recortes em 300 DPI</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">13</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Provas Oficiais</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Fidelidade Geométrica</div>
        </div>
      </div>
    </div>
  );
}
