"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  GraduationCap,
  Boxes,
  ShieldAlert,
  Code2,
  Globe,
  Shuffle,
  ArrowRight
} from "lucide-react";
import { QUESTION_SETS } from "@/lib/weeklySchedule";
import { CATEGORY_DEFINITIONS, slugifyCategory } from "@/lib/constants";

export function BlackboardLinksHub() {
  const [activeTab, setActiveTab] = useState<"FG" | "ADS" | "GTI" | "CCP" | "TEMAS">("FG");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://enade-hub.vercel.app";
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const tracksMeta = {
    FG: {
      name: "Formação Geral",
      componentType: "Formação Geral (Comum a Todos)",
      componentBadge: "🌍 Transversal · Todos os Cursos",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800",
      icon: Globe,
      iconColor: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950",
      activeBg: "bg-teal-600 text-white shadow-teal-500/25",
      description: "12 conjuntos semanais de 4 questões focados em ética, sustentabilidade, direitos humanos, sociedade digital e cidadania.",
      sets: QUESTION_SETS.FG,
      urlPrefix: "/pilulas/fg/semana-",
    },
    ADS: {
      name: "Tecnologia em ADS",
      componentType: "Formação Específica",
      componentBadge: "🎯 Formação Específica ADS",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      icon: Boxes,
      iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
      activeBg: "bg-emerald-600 text-white shadow-emerald-500/25",
      description: "12 conjuntos semanais de 4 questões focados em Engenharia de Software, Requisitos, UML, Metodologias Ágeis, POO, Banco de Dados e Segurança.",
      sets: QUESTION_SETS.ADS,
      urlPrefix: "/pilulas/ads/semana-",
    },
    GTI: {
      name: "Tecnologia em GTI",
      componentType: "Formação Específica",
      componentBadge: "🎯 Formação Específica GTI",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      icon: ShieldAlert,
      iconColor: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950",
      activeBg: "bg-purple-600 text-white shadow-purple-500/25",
      description: "12 conjuntos semanais de 4 questões focados em Governança de TI, ITIL 4, COBIT, LGPD, Gestão de Serviços (SLA) e Continuidade.",
      sets: QUESTION_SETS.GTI,
      urlPrefix: "/pilulas/gti/semana-",
    },
    CCP: {
      name: "Ciência da Computação",
      componentType: "Formação Específica",
      componentBadge: "🎯 Formação Específica CCP",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      icon: Code2,
      iconColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950",
      activeBg: "bg-blue-600 text-white shadow-blue-500/25",
      description: "12 conjuntos semanais de 4 questões focados em Algoritmos, Grafos, Árvores, Banco de Dados, Sistemas Operacionais, Teoria e IA.",
      sets: QUESTION_SETS.CCP,
      urlPrefix: "/pilulas/ccp/semana-",
    },
  };

  const currentTrack = activeTab !== "TEMAS" ? tracksMeta[activeTab] : null;

  // Split Category definitions by component
  const specificDisciplines = Object.entries(CATEGORY_DEFINITIONS).filter(
    ([_, def]) => def.component === "Formação Específica"
  );
  const generalDisciplines = Object.entries(CATEGORY_DEFINITIONS).filter(
    ([_, def]) => def.component === "Formação Geral"
  );

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {copiedId && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4" />
          Link copiado para a área de transferência!
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 p-6 sm:p-8 shadow-xl text-white">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Central de Quizzes & Conjuntos Semanais
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Quizzes Focados com Separação Oficial ENADE
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Estrutura organizada entre <strong>Formação Geral</strong> (comum a todos os alunos) e <strong>Formação Específica</strong> (por curso ou disciplina técnica), com 4 questões por conjunto e sem datas rígidas.
          </p>
        </div>
      </div>

      {/* Component Navigation Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
          <span>Selecione o Componente ou Trilha de Treino:</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 border-b border-slate-200 dark:border-slate-800">
          {/* FG Tab */}
          <button
            onClick={() => setActiveTab("FG")}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "FG"
                ? tracksMeta.FG.activeBg + " shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>🌍 Formação Geral (12 Semanas)</span>
          </button>

          {/* ADS Tab */}
          <button
            onClick={() => setActiveTab("ADS")}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "ADS"
                ? tracksMeta.ADS.activeBg + " shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>🎯 ADS Específica (12 Semanas)</span>
          </button>

          {/* GTI Tab */}
          <button
            onClick={() => setActiveTab("GTI")}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "GTI"
                ? tracksMeta.GTI.activeBg + " shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>🎯 GTI Específica (12 Semanas)</span>
          </button>

          {/* CCP Tab */}
          <button
            onClick={() => setActiveTab("CCP")}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "CCP"
                ? tracksMeta.CCP.activeBg + " shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>🎯 Computação Específica (12 Semanas)</span>
          </button>

          {/* Sorteio Livre por Disciplina */}
          <button
            onClick={() => setActiveTab("TEMAS")}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === "TEMAS"
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>Sorteio por Disciplina</span>
          </button>
        </div>
      </div>

      {/* View: Course / General Education Sets */}
      {currentTrack && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${currentTrack.badgeColor}`}>
                  {currentTrack.componentBadge}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  12 Conjuntos Semanais (4 questões cada)
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {currentTrack.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentTrack.description}
              </p>
            </div>

            <Link
              href={`/sorteio/${activeTab.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors shrink-0"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Sorteador Aleatório Infinito ({activeTab})
            </Link>
          </div>

          {/* 12 Sets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTrack.sets.map((set) => {
              const directUrl = `${getBaseUrl()}${currentTrack.urlPrefix}${set.setNumber}`;

              return (
                <div
                  key={set.setNumber}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {set.label}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        4 Questões
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
                      {set.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {set.description}
                    </p>

                    <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate select-all">
                      {directUrl}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(directUrl, `set-${activeTab}-${set.setNumber}`)}
                      className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {copiedId === `set-${activeTab}-${set.setNumber}` ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar Link
                        </>
                      )}
                    </button>

                    <Link
                      href={`${currentTrack.urlPrefix}${set.setNumber}`}
                      target="_blank"
                      className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Abrir este conjunto"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View: Free Practice by Discipline (Divided into Formação Específica vs Formação Geral) */}
      {activeTab === "TEMAS" && (
        <div className="space-y-10">
          {/* Formação Específica Disciplines */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-black uppercase tracking-wider mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                Componente de Formação Específica
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Sorteadores por Disciplina Técnica
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Links diretos por matéria tecnológica. O aluno recebe uma questão aleatória da disciplina e pode sortear outras continuamente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {specificDisciplines.map(([catName, def]) => {
                const slug = slugifyCategory(catName);
                const path = `/sorteio/tema/${slug}`;
                const fullUrl = `${getBaseUrl()}${path}`;

                return (
                  <div
                    key={slug}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                        {catName}
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {def.description}
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {fullUrl}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(fullUrl, `cat-${slug}`)}
                        className="flex-1 py-2 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === `cat-${slug}` ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            Copiar Link
                          </>
                        )}
                      </button>

                      <Link
                        href={path}
                        target="_blank"
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Abrir Sorteador"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formação Geral Disciplines */}
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black uppercase tracking-wider mb-1">
                <Globe className="w-3.5 h-3.5" />
                Componente de Formação Geral (Transversal)
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Sorteador de Formação Geral & Cidadania
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Questões comuns de ética, direitos humanos, meio ambiente e sociedade presentes em todas as provas oficiais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generalDisciplines.map(([catName, def]) => {
                const slug = slugifyCategory(catName);
                const path = `/sorteio/tema/${slug}`;
                const fullUrl = `${getBaseUrl()}${path}`;

                return (
                  <div
                    key={slug}
                    className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-teal-200 dark:border-teal-900/60 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          149 Questões Disponíveis
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {catName}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {def.description}
                      </p>

                      <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                        {fullUrl}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-teal-100 dark:border-teal-900/40 flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(fullUrl, `cat-${slug}`)}
                        className="flex-1 py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {copiedId === `cat-${slug}` ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Link Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copiar Link
                          </>
                        )}
                      </button>

                      <Link
                        href={path}
                        target="_blank"
                        className="p-2 rounded-lg border border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-950 text-teal-700 dark:text-teal-300 transition-colors"
                        title="Abrir Sorteador"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
