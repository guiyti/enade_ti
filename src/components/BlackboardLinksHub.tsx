"use client";

import { useState, useEffect } from "react";
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
  Calendar,
  Clock,
  Radio
} from "lucide-react";
import {
  QUESTION_SETS,
  ENADE_2026_CALENDAR,
  getCurrentEnadeWeek
} from "@/lib/weeklySchedule";
import { CATEGORY_DEFINITIONS, slugifyCategory } from "@/lib/constants";

export function BlackboardLinksHub() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"TABELA" | "TEMAS">("TABELA");

  const [currentWeekInfo, setCurrentWeekInfo] = useState(() => getCurrentEnadeWeek());

  useEffect(() => {
    setCurrentWeekInfo(getCurrentEnadeWeek());
  }, []);

  const getBaseUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "https://enade-ti.vercel.app";
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  const currentWeekNumber = currentWeekInfo.weekNumber;

  // 4 Smart Links Definitions
  const smartLinks = [
    {
      id: "fg",
      cursoKey: "FG" as const,
      name: "Formação Geral",
      badge: "🌍 Transversal · Todos os Cursos",
      badgeColor: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800",
      buttonColor: "bg-teal-600 hover:bg-teal-500 shadow-teal-600/20",
      icon: Globe,
      iconBg: "bg-teal-600",
      urlPath: "/pilulas/fg",
      targetAudience: "Disponibilizar para todas as turmas de graduação",
      currentTopic: QUESTION_SETS.FG.find((s) => s.setNumber === currentWeekNumber)?.title || "Ética e Sociedade",
      currentArea: QUESTION_SETS.FG.find((s) => s.setNumber === currentWeekNumber)?.topic || "Formação Geral",
    },
    {
      id: "ads",
      cursoKey: "ADS" as const,
      name: "Tecnologia em ADS",
      badge: "🎯 Específica · Análise e Des. Sistemas",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
      buttonColor: "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20",
      icon: Boxes,
      iconBg: "bg-emerald-600",
      urlPath: "/pilulas/ads",
      targetAudience: "Disponibilizar apenas para as turmas de ADS",
      currentTopic: QUESTION_SETS.ADS.find((s) => s.setNumber === currentWeekNumber)?.title || "Engenharia de Requisitos",
      currentArea: QUESTION_SETS.ADS.find((s) => s.setNumber === currentWeekNumber)?.topic || "Engenharia de Software",
    },
    {
      id: "gti",
      cursoKey: "GTI" as const,
      name: "Tecnologia em GTI",
      badge: "🎯 Específica · Gestão da TI",
      badgeColor: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800",
      buttonColor: "bg-purple-600 hover:bg-purple-500 shadow-purple-600/20",
      icon: ShieldAlert,
      iconBg: "bg-purple-600",
      urlPath: "/pilulas/gti",
      targetAudience: "Disponibilizar apenas para as turmas de GTI",
      currentTopic: QUESTION_SETS.GTI.find((s) => s.setNumber === currentWeekNumber)?.title || "Governança & ITIL",
      currentArea: QUESTION_SETS.GTI.find((s) => s.setNumber === currentWeekNumber)?.topic || "Governança e Gestão",
    },
    {
      id: "ccp",
      cursoKey: "CCP" as const,
      name: "Ciência da Computação",
      badge: "🎯 Específica · Bacharelado CCP",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800",
      buttonColor: "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20",
      icon: Code2,
      iconBg: "bg-blue-600",
      urlPath: "/pilulas/ccp",
      targetAudience: "Disponibilizar para turmas de Ciência da Computação",
      currentTopic: QUESTION_SETS.CCP.find((s) => s.setNumber === currentWeekNumber)?.title || "Algoritmos & Complexidade",
      currentArea: QUESTION_SETS.CCP.find((s) => s.setNumber === currentWeekNumber)?.topic || "Algoritmos e Estruturas",
    },
  ];

  // Specific disciplines for random draw
  const specificDisciplines = Object.entries(CATEGORY_DEFINITIONS).filter(
    ([_, def]) => def.component === "Formação Específica"
  );
  const generalDisciplines = Object.entries(CATEGORY_DEFINITIONS).filter(
    ([_, def]) => def.component === "Formação Geral"
  );

  return (
    <div className="space-y-10">
      {/* Toast Notification */}
      {copiedId && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Check className="w-4 h-4" />
          Link Único copiado para a área de transferência!
        </div>
      )}

      {/* Hero Banner with Smart Links Concept */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 p-6 sm:p-8 shadow-xl text-white">
        <div className="max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Links Únicos Inteligentes (Atualização Automática Semanal)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            1 Único Link por Curso para Todo o Semestre
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            O docente só precisa divulgar <strong>um único link fixo por curso</strong> (no Blackboard ou WhatsApp). O sistema detecta a data de acesso e a data da prova oficial (<strong>29/11/2026</strong>), apresentando automaticamente as 4 questões da <strong>Semana Vigente</strong> sem que ninguém precise trocar os links.
          </p>
        </div>
      </div>

      {/* Calendar Live Status Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-indigo-200 dark:border-indigo-900/60 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Semana Vigente</span>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentWeekInfo.label} de 14
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Período: {currentWeekInfo.currentPeriod}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Data da Prova</span>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              29 de Novembro
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Domingo · Horário de Brasília
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">Contagem Regressiva</span>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              {currentWeekInfo.weeksUntilExam} semanas restantes
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {currentWeekInfo.daysUntilExam} dias para o ENADE
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">Troca Automática</span>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              Toda Segunda-feira
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              4 novas questões por semana
            </span>
          </div>
        </div>
      </div>

      {/* 4 SMART LINKS CARDS (Single Link per Course) */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <span>📋 Os 4 Links Únicos para Divulgação</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Copie 1 vez só
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ao clicar nestes links, o aluno entra direto na semana ativa atual do cronograma, sem cabeçalho e sem distrações.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {smartLinks.map((link) => {
            const fullUrl = `${getBaseUrl()}${link.urlPath}`;
            const isCopied = copiedId === `smart-${link.id}`;

            return (
              <div
                key={link.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-600 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${link.iconBg} text-white flex items-center justify-center shadow-lg shrink-0`}>
                        <link.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${link.badgeColor}`}>
                          {link.badge}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                          {link.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {link.targetAudience}
                  </p>

                  {/* Active Content Preview for Current Week */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        LIBERADO ESTA SEMANA ({currentWeekInfo.label}):
                      </span>
                      <span>4 Questões</span>
                    </div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {link.currentTopic}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Área: {link.currentArea}
                    </div>
                  </div>

                  {/* Copyable URL Display */}
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 truncate select-all">
                    {fullUrl}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(fullUrl, `smart-${link.id}`)}
                    className={`flex-1 py-3 px-4 rounded-xl text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 ${link.buttonColor}`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link Único</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={link.urlPath}
                    target="_blank"
                    className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    title="Abrir experiência do aluno na semana ativa"
                  >
                    <span>Testar</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TAB NAVIGATION: Cronograma das 14 Semanas vs Sorteador Livre */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView("TABELA")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === "TABELA"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Tabela do Cronograma Oficial (14 Semanas)</span>
            </button>

            <button
              onClick={() => setActiveView("TEMAS")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeView === "TEMAS"
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span>Sorteadores por Disciplina Técnica</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: COMPLETE 14 WEEKS SCHEDULE TABLE */}
        {activeView === "TABELA" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Matriz de Conteúdos por Semana (24/08 a 29/11/2026)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Esta tabela detalha os temas que são ativados a cada semana nos links únicos de cada curso.
                </p>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    <th className="p-3.5 w-36">Semana & Período</th>
                    <th className="p-3.5 min-w-[200px]">🌍 Formação Geral</th>
                    <th className="p-3.5 min-w-[200px]">💻 ADS (Específica)</th>
                    <th className="p-3.5 min-w-[200px]">🛡️ GTI (Específica)</th>
                    <th className="p-3.5 min-w-[200px]">🔬 CCP (Específica)</th>
                    <th className="p-3.5 text-center w-28">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {ENADE_2026_CALENDAR.weeks.map((week) => {
                    const isCurrent = week.weekNumber === currentWeekNumber;
                    const isPast = week.weekNumber < currentWeekNumber;

                    const fgSet = QUESTION_SETS.FG.find((s) => s.setNumber === week.weekNumber);
                    const adsSet = QUESTION_SETS.ADS.find((s) => s.setNumber === week.weekNumber);
                    const gtiSet = QUESTION_SETS.GTI.find((s) => s.setNumber === week.weekNumber);
                    const ccpSet = QUESTION_SETS.CCP.find((s) => s.setNumber === week.weekNumber);

                    return (
                      <tr
                        key={week.weekNumber}
                        className={`transition-colors ${
                          isCurrent
                            ? "bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold border-l-4 border-l-indigo-600"
                            : isPast
                            ? "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {/* Week & Date Range */}
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 dark:text-white">
                                {week.label}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {week.periodLabel}
                            </div>
                          </div>
                        </td>

                        {/* FG Theme */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                              {fgSet?.topic}
                            </span>
                            <div className="text-xs text-slate-900 dark:text-white leading-tight">
                              {fgSet?.title}
                            </div>
                          </div>
                        </td>

                        {/* ADS Theme */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {adsSet?.topic}
                            </span>
                            <div className="text-xs text-slate-900 dark:text-white leading-tight">
                              {adsSet?.title}
                            </div>
                          </div>
                        </td>

                        {/* GTI Theme */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                              {gtiSet?.topic}
                            </span>
                            <div className="text-xs text-slate-900 dark:text-white leading-tight">
                              {gtiSet?.title}
                            </div>
                          </div>
                        </td>

                        {/* CCP Theme */}
                        <td className="p-3.5">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                              {ccpSet?.topic}
                            </span>
                            <div className="text-xs text-slate-900 dark:text-white leading-tight">
                              {ccpSet?.title}
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-3.5 text-center whitespace-nowrap">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 animate-pulse">
                              <Radio className="w-3 h-3" />
                              Ativa Agora
                            </span>
                          ) : isPast ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Concluída
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                              Programada
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 2: FREE RANDOM PRACTICE BY DISCIPLINE */}
        {activeView === "TEMAS" && (
          <div className="space-y-10 pt-2">
            {/* Formação Específica Disciplines */}
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-xs font-black uppercase tracking-wider mb-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  Componente de Formação Específica
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Sorteadores por Disciplina Técnica
                </h3>
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
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                          {catName}
                        </h4>

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
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Sorteador de Formação Geral & Cidadania
                </h3>
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

                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {catName}
                        </h4>

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
    </div>
  );
}
