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

export const COURSE_DEFINITIONS: Record<
  string,
  { name: string; code: string; description: string; iconName: string; colorClass: string }
> = {
  CCP: {
    name: "Ciência da Computação",
    code: "CCP",
    description: "Algoritmos, Teoria da Computação, Arquitetura, Sistemas Operacionais, Banco de Dados e IA.",
    iconName: "Code2",
    colorClass: "from-blue-600 to-indigo-700 text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  ADS: {
    name: "Análise e Desenvolvimento de Sistemas",
    code: "ADS",
    description: "Engenharia de Software, Programação Web, Banco de Dados, Requisitos e Metodologias Ágeis.",
    iconName: "Boxes",
    colorClass: "from-emerald-600 to-teal-700 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  GTI: {
    name: "Gestão da Tecnologia da Informação",
    code: "GTI",
    description: "Governança de TI, ITIL, COBIT, Segurança da Informação, Redes, Gestão de Projetos e LGPD.",
    iconName: "ShieldAlert",
    colorClass: "from-purple-600 to-indigo-700 text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
};

export const CATEGORY_DEFINITIONS: Record<
  string,
  { description: string; iconName: string; colorClass: string }
> = {
  "Banco de Dados": {
    description: "Modelagem relacional, SQL, normalização (1FN, 2FN, 3FN), transações ACID e DER.",
    iconName: "Database",
    colorClass: "from-blue-500 to-cyan-600 text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
  },
  "Algoritmos e Estruturas de Dados": {
    description: "Árvores (AVL, B), grafos, filas, pilhas, ordenação, complexidade assintótica e recursão.",
    iconName: "Binary",
    colorClass: "from-amber-500 to-orange-600 text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
  },
  "Engenharia de Software": {
    description: "Requisitos, Scrum, metodologias ágeis, UML, padrões de projeto (GoF) e testes.",
    iconName: "Boxes",
    colorClass: "from-indigo-500 to-purple-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
  },
  "Programação e POO": {
    description: "Classes, herança, polimorfismo, encapsulamento, exceções e concorrência/threads.",
    iconName: "Code2",
    colorClass: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
  },
  "Redes e Segurança": {
    description: "Modelo OSI, TCP/IP, roteamento, criptografia, firewalls e segurança da informação.",
    iconName: "Network",
    colorClass: "from-sky-500 to-blue-600 text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
  },
  "Sistemas Operacionais e Arquitetura": {
    description: "Gerenciamento de memória, processos, deadlocks, CPU, cache e arquitetura de computadores.",
    iconName: "Cpu",
    colorClass: "from-rose-500 to-pink-600 text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
  },
  "Governança e Gestão de TI": {
    description: "ITIL, COBIT, LGPD, PMBOK, gestão de projetos, SLA e conformidade em TI.",
    iconName: "ShieldAlert",
    colorClass: "from-purple-500 to-indigo-600 text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
  },
  "Teoria da Computação e Compiladores": {
    description: "Autômatos finitos, gramáticas livres de contexto, compiladores e analisadores sintáticos.",
    iconName: "Terminal",
    colorClass: "from-violet-500 to-fuchsia-600 text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
  },
  "Inteligência Artificial e Dados": {
    description: "Aprendizado de máquina, redes neurais, mineração de dados, big data e heurísticas.",
    iconName: "BrainCircuit",
    colorClass: "from-cyan-500 to-teal-600 text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
  },
  "Formação Geral e Sociedade": {
    description: "Ética, cidadania, sustentabilidade, direitos humanos, sociodiversidade e sociedade.",
    iconName: "Globe",
    colorClass: "from-teal-500 to-emerald-600 text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
  },
  "Engenharia e Tecnologias": {
    description: "Fundamentos tecnológicos, interoperabilidade, arquitetura e tópicos avançados.",
    iconName: "Layers",
    colorClass: "from-slate-500 to-zinc-600 text-slate-600 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
  },
};

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

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
