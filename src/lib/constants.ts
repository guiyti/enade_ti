export interface CourseDefinition {
  name: string;
  code: string;
  description: string;
  iconName: string;
  colorClass: string;
  badgeClass: string;
  isGeneralEducation?: boolean;
}

export const COURSE_DEFINITIONS: Record<string, CourseDefinition> = {
  FG: {
    name: "Formação Geral",
    code: "FG",
    description: "Componente comum a todos os cursos: Ética, Cidadania, Direitos Humanos, Sustentabilidade e Sociedade Digital.",
    iconName: "Globe",
    colorClass: "from-teal-600 to-emerald-700 text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    badgeClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-800",
    isGeneralEducation: true,
  },
  CCP: {
    name: "Ciência da Computação",
    code: "CCP",
    description: "Formação Específica: Algoritmos, Teoria da Computação, Arquitetura, Sistemas Operacionais, Banco de Dados e IA.",
    iconName: "Code2",
    colorClass: "from-blue-600 to-indigo-700 text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badgeClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-800",
    isGeneralEducation: false,
  },
  ADS: {
    name: "Análise e Desenvolvimento de Sistemas",
    code: "ADS",
    description: "Formação Específica: Engenharia de Software, Requisitos, UML, Metodologias Ágeis, POO, Banco de Dados e Segurança.",
    iconName: "Boxes",
    colorClass: "from-emerald-600 to-teal-700 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
    isGeneralEducation: false,
  },
  GTI: {
    name: "Gestão da Tecnologia da Informação",
    code: "GTI",
    description: "Formação Específica: Governança de TI, ITIL, COBIT, Segurança da Informação, LGPD, Redes e Gestão de Serviços.",
    iconName: "ShieldAlert",
    colorClass: "from-purple-600 to-indigo-700 text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    badgeClass: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-800",
    isGeneralEducation: false,
  },
};

export interface CategoryDefinition {
  description: string;
  iconName: string;
  colorClass: string;
  component: "Formação Geral" | "Formação Específica";
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  // --- FORMAÇÃO GERAL (Comum a Todos os Cursos) ---
  "Formação Geral e Sociedade": {
    description: "Ética, cidadania, sustentabilidade, direitos humanos, diversidade, sociedade digital e políticas públicas.",
    iconName: "Globe",
    colorClass: "from-teal-500 to-emerald-600 text-teal-600 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800",
    component: "Formação Geral",
  },

  // --- FORMAÇÃO ESPECÍFICA (Disciplinas Especializadas) ---
  "Engenharia de Software": {
    description: "Engenharia de requisitos, UML, Scrum/Kanban, padrões de projeto (GoF), testes de software (TDD) e DevOps.",
    iconName: "Boxes",
    colorClass: "from-indigo-500 to-purple-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
    component: "Formação Específica",
  },
  "Banco de Dados": {
    description: "Modelagem relacional, DER, integridade referencial, consultas SQL, normalização (1FN a 3FN) e transações ACID.",
    iconName: "Database",
    colorClass: "from-blue-500 to-cyan-600 text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    component: "Formação Específica",
  },
  "Governança e Gestão de TI": {
    description: "Frameworks ITIL 4, COBIT 2019, Acordos de Nível de Serviço (SLA), Gestão de Riscos, Continuidade (PCN/DRP), BPMN e PMBOK.",
    iconName: "ShieldAlert",
    colorClass: "from-purple-500 to-indigo-600 text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800",
    component: "Formação Específica",
  },
  "Algoritmos e Estruturas de Dados": {
    description: "Árvores binárias/AVL, grafos (BFS/DFS, Dijkstra), filas, pilhas, complexidade assintótica (Big-O) e ordenação.",
    iconName: "Binary",
    colorClass: "from-amber-500 to-orange-600 text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    component: "Formação Específica",
  },
  "Programação e POO": {
    description: "Orientação a objetos, encapsulamento, herança, polimorfismo, interfaces, tratamento de exceções, ponteiros e tipos abstratos.",
    iconName: "Code2",
    colorClass: "from-emerald-500 to-teal-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    component: "Formação Específica",
  },
  "Redes de Computadores": {
    description: "Arquitetura TCP/IP, modelo OSI, roteamento, comutação, protocolos (DNS, DHCP, HTTP, TCP/UDP), sub-redes e redes sem fio.",
    iconName: "Network",
    colorClass: "from-sky-500 to-blue-600 text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
    component: "Formação Específica",
  },
  "Segurança da Informação": {
    description: "Políticas de segurança, criptografia simétrica/assimétrica, assinaturas digitais, firewalls, ameaças (DDoS, injection), ISO 27001 e LGPD.",
    iconName: "ShieldCheck",
    colorClass: "from-rose-500 to-red-600 text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
    component: "Formação Específica",
  },
  "Sistemas Operacionais": {
    description: "Gerenciamento de memória virtual, paginação, processos e threads, escalonamento de CPU, prevenção de deadlocks e sistemas de arquivos.",
    iconName: "Terminal",
    colorClass: "from-amber-600 to-yellow-700 text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    component: "Formação Específica",
  },
  "Arquitetura e Organização de Computadores": {
    description: "Processadores RISC/CISC, pipeline de instruções, registradores, hierarquia de memória cache (L1/L2/L3), barramentos e E/S.",
    iconName: "Cpu",
    colorClass: "from-violet-600 to-indigo-700 text-violet-600 bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800",
    component: "Formação Específica",
  },
  "Inteligência Artificial e Dados": {
    description: "Algoritmos de busca heurística, aprendizado de máquina supervisionado/não-supervisionado, redes neurais, Big Data e BI.",
    iconName: "BrainCircuit",
    colorClass: "from-cyan-500 to-teal-600 text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800",
    component: "Formação Específica",
  },
  "Teoria da Computação e Compiladores": {
    description: "Autômatos finitos determinísticos/não-determinísticos, linguagens livres de contexto, compiladores, análise sintática e decidibilidade.",
    iconName: "Layers",
    colorClass: "from-fuchsia-500 to-pink-600 text-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-800",
    component: "Formação Específica",
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

export function isFormacaoGeralQuestion(question: { categorias?: string[]; numero?: number; tipo?: string }): boolean {
  if (question.categorias && question.categorias.includes("Formação Geral e Sociedade")) {
    return true;
  }
  if (question.tipo === "DISCURSIVA") {
    return (question.numero || 1) <= 2;
  }
  return (question.numero || 1) <= 8;
}
