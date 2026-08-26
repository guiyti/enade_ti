import fs from "fs";
import path from "path";

export type QuestionType = "OBJETIVA" | "DISCURSIVA";
export type QuestionStatus = "PENDENTE" | "APROVADA" | "REVISAR" | "REJEITADA";

export interface SegmentData {
  pagina: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  coluna: number;
}

export interface QuestionData {
  id_questao: string;
  numero: number;
  tipo: QuestionType;
  paginas: number[];
  largura: number;
  altura: number;
  confianca: number;
  status: QuestionStatus;
  categorias: string[];
  anomalias: any[];
  texto_completo: string;
  figuras: string[];
  caminho_png: string;
  caminho_json: string;
  caminho_txt: string;
}

export interface ExamData {
  id_prova: string;
  arquivo: string;
  ano: number;
  curso: string;
  total_paginas: number;
  questoes_detectadas: number;
  questoes_extraidas: number;
  score_geral: number;
  tipo_pdf: string;
  questoes: QuestionData[];
}

export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
  nativeCount?: number;
  crossCount?: number;
  description: string;
  iconName: string;
  colorClass: string;
}

import { COURSE_DEFINITIONS, CATEGORY_DEFINITIONS, slugifyCategory } from "@/lib/constants";
export { COURSE_DEFINITIONS, CATEGORY_DEFINITIONS, slugifyCategory };

let cachedExams: ExamData[] | null = null;

export async function getAllExams(): Promise<ExamData[]> {
  if (cachedExams) return cachedExams;

  try {
    const dataPath = path.join(process.cwd(), "public", "data", "exams.json");
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, "utf-8");
      cachedExams = JSON.parse(fileContent) as ExamData[];
      return cachedExams;
    }
  } catch (err) {
    console.error("Erro ao ler exams.json:", err);
  }

  return [];
}

export async function getExamById(id_prova: string): Promise<ExamData | null> {
  const exams = await getAllExams();
  return exams.find((e) => e.id_prova === id_prova) || null;
}

export async function getQuestionById(
  id_prova: string,
  id_questao: string
): Promise<{ exam: ExamData; question: QuestionData } | null> {
  const exam = await getExamById(id_prova);
  if (!exam) return null;

  const question = exam.questoes.find((q) => q.id_questao === id_questao);
  if (!question) return null;

  return { exam, question };
}

export async function getAllCategories(): Promise<CategoryInfo[]> {
  const exams = await getAllExams();
  const counts: Record<string, number> = {};

  for (const exam of exams) {
    for (const q of exam.questoes) {
      const tags = q.categorias && q.categorias.length > 0 ? q.categorias : ["Engenharia e Tecnologias"];
      for (const t of tags) {
        counts[t] = (counts[t] || 0) + 1;
      }
    }
  }

  const result: CategoryInfo[] = [];

  for (const [name, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    const count = counts[name] || 0;
    result.push({
      name,
      slug: slugifyCategory(name),
      count,
      description: def.description,
      iconName: def.iconName,
      colorClass: def.colorClass,
    });
  }

  return result.sort((a, b) => b.count - a.count);
}

export async function getCategoriesByCourse(curso: string): Promise<CategoryInfo[]> {
  const exams = await getAllExams();
  const nativeCounts: Record<string, number> = {};
  const crossCounts: Record<string, number> = {};

  const targetCourse = curso.toUpperCase();

  for (const exam of exams) {
    const isNative = exam.curso.toUpperCase() === targetCourse;

    for (const q of exam.questoes) {
      const tags = q.categorias && q.categorias.length > 0 ? q.categorias : ["Engenharia e Tecnologias"];
      for (const t of tags) {
        if (isNative) {
          nativeCounts[t] = (nativeCounts[t] || 0) + 1;
        } else {
          crossCounts[t] = (crossCounts[t] || 0) + 1;
        }
      }
    }
  }

  const result: CategoryInfo[] = [];

  for (const [name, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    const nCnt = nativeCounts[name] || 0;
    const cCnt = crossCounts[name] || 0;
    const total = nCnt + cCnt;

    if (total > 0) {
      result.push({
        name,
        slug: slugifyCategory(name),
        count: total,
        nativeCount: nCnt,
        crossCount: cCnt,
        description: def.description,
        iconName: def.iconName,
        colorClass: def.colorClass,
      });
    }
  }

  return result.sort((a, b) => (b.nativeCount || 0) - (a.nativeCount || 0));
}

export async function getQuestionsByCategory(categorySlug: string): Promise<{
  category: CategoryInfo | null;
  items: { exam: ExamData; question: QuestionData }[];
}> {
  const exams = await getAllExams();
  const allCategories = await getAllCategories();
  const category = allCategories.find((c) => c.slug === categorySlug) || null;

  const items: { exam: ExamData; question: QuestionData }[] = [];

  for (const exam of exams) {
    for (const q of exam.questoes) {
      const tags = q.categorias || [];
      const matches = tags.some((t) => slugifyCategory(t) === categorySlug);
      if (matches) {
        items.push({ exam, question: q });
      }
    }
  }

  return { category, items };
}

export async function getQuestionsByCourseAndCategory(
  curso: string,
  categorySlug: string
): Promise<{
  category: CategoryInfo | null;
  nativeItems: { exam: ExamData; question: QuestionData }[];
  crossItems: { exam: ExamData; question: QuestionData }[];
}> {
  const exams = await getAllExams();
  const allCategories = await getAllCategories();
  const category = allCategories.find((c) => c.slug === categorySlug) || null;

  const nativeItems: { exam: ExamData; question: QuestionData }[] = [];
  const crossItems: { exam: ExamData; question: QuestionData }[] = [];
  const targetCourse = curso.toUpperCase();

  for (const exam of exams) {
    const isNative = exam.curso.toUpperCase() === targetCourse;

    for (const q of exam.questoes) {
      const tags = q.categorias || [];
      const matches = tags.some((t) => slugifyCategory(t) === categorySlug);

      if (matches) {
        if (isNative) {
          nativeItems.push({ exam, question: q });
        } else {
          crossItems.push({ exam, question: q });
        }
      }
    }
  }

  return { category, nativeItems, crossItems };
}

export async function getGlobalStats() {
  const exams = await getAllExams();

  let totalQuestoes = 0;
  let totalDiscursivas = 0;
  let totalObjetivas = 0;
  let totalScore = 0;
  let provasComAtencao = 0;
  let questoesParaRevisao = 0;
  const porAno: Record<number, number> = {};
  const porCurso: Record<string, number> = {};

  for (const exam of exams) {
    totalQuestoes += exam.questoes_extraidas;
    totalScore += exam.score_geral;
    if (exam.score_geral < 90) provasComAtencao++;

    porAno[exam.ano] = (porAno[exam.ano] || 0) + exam.questoes_extraidas;
    porCurso[exam.curso] = (porCurso[exam.curso] || 0) + exam.questoes_extraidas;

    for (const q of exam.questoes) {
      if (q.tipo === "DISCURSIVA") totalDiscursivas++;
      else totalObjetivas++;

      if (q.status === "REVISAR" || q.confianca < 0.8) {
        questoesParaRevisao++;
      }
    }
  }

  const scoreMedio = exams.length > 0 ? totalScore / exams.length : 0;

  return {
    totalProvas: exams.length,
    totalQuestoes,
    totalDiscursivas,
    totalObjetivas,
    scoreMedio,
    provasComAtencao,
    questoesParaRevisao,
    porAno,
    porCurso,
  };
}

export interface QuestionFilter {
  curso?: string;
  temaSlug?: string;
  tipo?: QuestionType;
  isFg?: boolean;
}

export async function getQuestionsPool(filter: QuestionFilter = {}): Promise<{ exam: ExamData; question: QuestionData }[]> {
  const exams = await getAllExams();
  const pool: { exam: ExamData; question: QuestionData }[] = [];

  const isFgRequest =
    filter.isFg ||
    (filter.curso && filter.curso.toUpperCase() === "FG") ||
    filter.temaSlug === "formacao-geral" ||
    filter.temaSlug === "formacao-geral-e-sociedade";

  const targetCourse = filter.curso && filter.curso.toUpperCase() !== "FG" ? filter.curso.toUpperCase() : null;

  for (const exam of exams) {
    if (targetCourse && exam.curso.toUpperCase() !== targetCourse) {
      continue;
    }

    for (const q of exam.questoes) {
      if (filter.tipo && q.tipo !== filter.tipo) {
        continue;
      }

      const tags = q.categorias || [];
      const isFgQuestion = tags.includes("Formação Geral e Sociedade") || (q.numero >= 1 && q.numero <= 10 && exam.ano >= 2011);

      if (isFgRequest) {
        if (!isFgQuestion) continue;
      } else if (filter.temaSlug) {
        const matchesTheme = tags.some((t) => slugifyCategory(t) === filter.temaSlug);
        if (!matchesTheme) continue;
      }

      pool.push({ exam, question: q });
    }
  }

  return pool;
}

export async function getRandomQuestion(
  filter: QuestionFilter = {}
): Promise<{ exam: ExamData; question: QuestionData } | null> {
  const pool = await getQuestionsPool(filter);
  if (pool.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

