export interface QuestionRef {
  id_prova: string;
  id_questao: string;
}

export interface QuestionSetConfig {
  setNumber: number;
  label: string; // e.g. "Semana 01"
  title: string;
  topic: string;
  description: string;
  questionCount: number;
  questionIds: QuestionRef[];
}

export interface CourseSets {
  FG: QuestionSetConfig[];
  ADS: QuestionSetConfig[];
  GTI: QuestionSetConfig[];
  CCP: QuestionSetConfig[];
}

export interface WeekCalendarInfo {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  periodLabel: string;
}

export const ENADE_2026_CALENDAR = {
  startDate: "2026-08-24", // Segunda-feira
  examDate: "2026-11-29",  // Domingo da Prova
  totalWeeks: 14,
  weeks: [
    { weekNumber: 1, label: "Semana 01", startDate: "2026-08-24", endDate: "2026-08-30", periodLabel: "24/08 a 30/08" },
    { weekNumber: 2, label: "Semana 02", startDate: "2026-08-31", endDate: "2026-09-06", periodLabel: "31/08 a 06/09" },
    { weekNumber: 3, label: "Semana 03", startDate: "2026-09-07", endDate: "2026-09-13", periodLabel: "07/09 a 13/09" },
    { weekNumber: 4, label: "Semana 04", startDate: "2026-09-14", endDate: "2026-09-20", periodLabel: "14/09 a 20/09" },
    { weekNumber: 5, label: "Semana 05", startDate: "2026-09-21", endDate: "2026-09-27", periodLabel: "21/09 a 27/09" },
    { weekNumber: 6, label: "Semana 06", startDate: "2026-09-28", endDate: "2026-10-04", periodLabel: "28/09 a 04/10" },
    { weekNumber: 7, label: "Semana 07", startDate: "2026-10-05", endDate: "2026-10-11", periodLabel: "05/10 a 11/10" },
    { weekNumber: 8, label: "Semana 08", startDate: "2026-10-12", endDate: "2026-10-18", periodLabel: "12/10 a 18/10" },
    { weekNumber: 9, label: "Semana 09", startDate: "2026-10-19", endDate: "2026-10-25", periodLabel: "19/10 a 25/10" },
    { weekNumber: 10, label: "Semana 10", startDate: "2026-10-26", endDate: "2026-11-01", periodLabel: "26/10 a 01/11" },
    { weekNumber: 11, label: "Semana 11", startDate: "2026-11-02", endDate: "2026-11-08", periodLabel: "02/11 a 08/11" },
    { weekNumber: 12, label: "Semana 12", startDate: "2026-11-09", endDate: "2026-11-15", periodLabel: "09/11 a 15/11" },
    { weekNumber: 13, label: "Semana 13", startDate: "2026-11-16", endDate: "2026-11-22", periodLabel: "16/11 a 22/11" },
    { weekNumber: 14, label: "Semana 14", startDate: "2026-11-23", endDate: "2026-11-29", periodLabel: "23/11 a 29/11" },
  ] as WeekCalendarInfo[],
};

/**
 * Retorna a semana correspondente com base na data de hoje ou data fornecida.
 */
export function getCurrentEnadeWeek(customDate?: Date): {
  weekNumber: number;
  currentPeriod: string;
  label: string;
  daysUntilExam: number;
  weeksUntilExam: number;
  isBeforeStart: boolean;
  isExamWeek: boolean;
  isAfterExam: boolean;
} {
  const now = customDate || new Date();
  const start = new Date("2026-08-24T00:00:00-03:00");
  const exam = new Date("2026-11-29T23:59:59-03:00");

  const isBeforeStart = now < start;
  const isAfterExam = now > exam;

  let weekNumber = 1;

  if (isBeforeStart) {
    weekNumber = 1;
  } else if (isAfterExam) {
    weekNumber = 14;
  } else {
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    weekNumber = Math.floor(diffDays / 7) + 1;
    if (weekNumber < 1) weekNumber = 1;
    if (weekNumber > 14) weekNumber = 14;
  }

  const cal = ENADE_2026_CALENDAR.weeks.find((w) => w.weekNumber === weekNumber) || ENADE_2026_CALENDAR.weeks[0];

  const diffToExamMs = exam.getTime() - now.getTime();
  const daysUntilExam = Math.max(0, Math.ceil(diffToExamMs / (1000 * 60 * 60 * 24)));
  const weeksUntilExam = Math.max(0, Math.ceil(daysUntilExam / 7));
  const isExamWeek = weekNumber === 14;

  return {
    weekNumber,
    currentPeriod: cal.periodLabel,
    label: cal.label,
    daysUntilExam,
    weeksUntilExam,
    isBeforeStart,
    isExamWeek,
    isAfterExam,
  };
}

export const QUESTION_SETS: CourseSets = {
  // ==========================================
  // GTI: Gestão da Tecnologia da Informação (Portaria Inep nº 171)
  // ==========================================
  GTI: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Governança Corporativa & Alinhamento Estratégico",
      topic: "Governança e Gestão de TI",
      description: "Princípios de governança de TI, planejamento estratégico (PETI), valor de negócio e tomada de decisões.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q10" },
        { id_prova: "2021_GTI", id_questao: "q25" },
        { id_prova: "2021_GTI", id_questao: "q33" },
        { id_prova: "2021_GTI", id_questao: "q34" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Gestão de Serviços em TI & ITIL 4",
      topic: "Governança e Gestão de TI",
      description: "Boas práticas do ITIL, ciclo de vida do serviço, entrega de valor e catálogo de serviços.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q21" },
        { id_prova: "2021_GTI", id_questao: "q22" },
        { id_prova: "2021_GTI", id_questao: "q23" },
        { id_prova: "2017_GTI", id_questao: "q14" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "COBIT 2019 & Maturidade Organizacional",
      topic: "Governança e Gestão de TI",
      description: "Framework COBIT, objetivos de controle, governança vs. gestão e níveis de capacidade.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q31" },
        { id_prova: "2017_GTI", id_questao: "q22" },
        { id_prova: "2008_CCP", id_questao: "q66" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Segurança da Informação & Gestão de Riscos",
      topic: "Segurança da Informação",
      description: "Políticas de segurança, normas ISO/IEC 27001/17799, ameaças e matriz de riscos de TI.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "qd03" },
        { id_prova: "2021_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q16" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Gestão por Processos & Notação BPMN",
      topic: "Governança e Gestão de TI",
      description: "Business Process Management (BPM), modelagem BPMN e melhoria contínua de processos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "qd04" },
        { id_prova: "2021_GTI", id_questao: "q28" },
        { id_prova: "2021_GTI", id_questao: "q30" },
        { id_prova: "2017_GTI", id_questao: "q26" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Gerenciamento de Projetos de TI (PMBOK)",
      topic: "Governança e Gestão de TI",
      description: "Guia PMBOK, gestão de escopo, prazos, custos e comunicação em projetos corporativos.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q09" },
        { id_prova: "2021_GTI", id_questao: "q29" },
        { id_prova: "2017_GTI", id_questao: "qd04" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Continuidade de Negócios & Recuperação (DRP)",
      topic: "Governança e Gestão de TI",
      description: "Plano de continuidade de negócios (PCN), disaster recovery (DRP) e disponibilidade de serviços.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "qd05" },
        { id_prova: "2021_GTI", id_questao: "q27" },
        { id_prova: "2017_GTI", id_questao: "q33" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Auditoria de TI & Controles Internos",
      topic: "Governança e Gestão de TI",
      description: "Técnicas de auditoria de sistemas, conformidade legal, compliance e controles de TI.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q35" },
        { id_prova: "2017_GTI", id_questao: "q28" },
        { id_prova: "2017_GTI", id_questao: "q35" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Sistemas de Informações Gerenciais & ERP",
      topic: "Governança e Gestão de TI",
      description: "Sistemas de suporte à decisão (SIG), ERP, integração da cadeia de suprimentos (SCM) e CRM.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q17" },
        { id_prova: "2021_GTI", id_questao: "q18" },
        { id_prova: "2017_GTI", id_questao: "q13" },
        { id_prova: "2017_GTI", id_questao: "q19" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Business Intelligence & Big Data",
      topic: "Inteligência Artificial e Dados",
      description: "Data Warehouse, mineração de dados, Big Data (volume, variedade, velocidade) e Analytics.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q16" },
        { id_prova: "2017_GTI", id_questao: "q10" },
        { id_prova: "2017_GTI", id_questao: "q25" },
        { id_prova: "2011_CCP", id_questao: "q42" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Redes de Computadores & Protocolos de Comunicação",
      topic: "Redes de Computadores",
      description: "Arquitetura cliente-servidor, modelo TCP/IP, troca de mensagens e infraestrutura corporativa.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q11" },
        { id_prova: "2021_ADS", id_questao: "q30" },
        { id_prova: "2011_CCP", id_questao: "q16" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Bancos de Dados & Decisão Tecnológica",
      topic: "Banco de Dados",
      description: "Modelagem de dados (DER), seleção de SGBDs relacionais e integridade de dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q14" },
        { id_prova: "2021_GTI", id_questao: "q32" },
        { id_prova: "2017_GTI", id_questao: "q20" },
        { id_prova: "2014_ADS", id_questao: "q22" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Computação em Nuvem & Virtualização",
      topic: "Sistemas Operacionais",
      description: "Modelos de serviço em nuvem (SaaS, IaaS, PaaS), máquinas virtuais e infraestrutura escalável.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q15" },
        { id_prova: "2017_GTI", id_questao: "q27" },
        { id_prova: "2021_CCP", id_questao: "q25" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral & Casos Estratégicos GTI",
      topic: "Governança e Gestão de TI",
      description: "Simulado integrador das competências nucleares de Governança, ITIL e Gestão Estratégica.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q21" },
        { id_prova: "2021_GTI", id_questao: "q31" },
        { id_prova: "2021_GTI", id_questao: "q33" },
        { id_prova: "2021_GTI", id_questao: "q35" },
      ],
    },
  ],

  // ==========================================
  // ADS: Análise e Desenvolvimento de Sistemas (Portaria Inep nº 169)
  // ==========================================
  ADS: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Engenharia de Requisitos & Elicitação",
      topic: "Engenharia de Software",
      description: "Requisitos funcionais e não-funcionais, regras de negócio e especificações de software.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q09" },
        { id_prova: "2021_ADS", id_questao: "q10" },
        { id_prova: "2017_ADS", id_questao: "q12" },
        { id_prova: "2014_ADS", id_questao: "q10" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Metodologias Ágeis (Scrum & Kanban)",
      topic: "Engenharia de Software",
      description: "Sprints, papéis (Scrum Master, Product Owner), cerimônias, manifesto ágil e entregas iterativas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q11" },
        { id_prova: "2021_ADS", id_questao: "q19" },
        { id_prova: "2021_GTI", id_questao: "q19" },
        { id_prova: "2017_ADS", id_questao: "q14" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Modelagem UML & Diagramas de Projeto",
      topic: "Engenharia de Software",
      description: "Diagramas de classes, casos de uso, sequência, atividades e estados na notação UML.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q13" },
        { id_prova: "2021_ADS", id_questao: "q14" },
        { id_prova: "2021_ADS", id_questao: "q18" },
        { id_prova: "2014_ADS", id_questao: "q29" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Padrões de Projeto (Design Patterns GoF)",
      topic: "Engenharia de Software",
      description: "Padrões criacionais, estruturais e comportamentais para soluções de software reutilizáveis.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q16" },
        { id_prova: "2017_ADS", id_questao: "q16" },
        { id_prova: "2017_ADS", id_questao: "q23" },
        { id_prova: "2014_ADS", id_questao: "q17" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Programação Orientada a Objetos (POO)",
      topic: "Programação e POO",
      description: "Classes, encapsulamento, herança, polimorfismo, classes abstratas e interfaces.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q17" },
        { id_prova: "2017_CCP", id_questao: "q11" },
        { id_prova: "2014_ADS", id_questao: "qd03" },
        { id_prova: "2011_ADS", id_questao: "q21" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Modelagem Relacional de Banco de Dados (DER)",
      topic: "Banco de Dados",
      description: "Diagramas Entidade-Relacionamento, cardinalidade, chaves primárias e estrangeiras.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q21" },
        { id_prova: "2021_GTI", id_questao: "q14" },
        { id_prova: "2017_ADS", id_questao: "q21" },
        { id_prova: "2014_ADS", id_questao: "q22" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "SQL Avançado & Normalização",
      topic: "Banco de Dados",
      description: "Consultas SQL complexas, junções (Joins), formas normais (1FN a 3FN) e propriedades ACID.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q23" },
        { id_prova: "2021_ADS", id_questao: "q24" },
        { id_prova: "2017_ADS", id_questao: "q22" },
        { id_prova: "2014_ADS", id_questao: "q23" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Qualidade & Testes de Software",
      topic: "Engenharia de Software",
      description: "Testes unitários, de integração, caixa-preta, caixa-branca, TDD e garantia de qualidade.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q12" },
        { id_prova: "2021_ADS", id_questao: "q25" },
        { id_prova: "2017_ADS", id_questao: "q25" },
        { id_prova: "2011_ADS", id_questao: "q25" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Arquitetura Web & Serviços REST",
      topic: "Engenharia de Software",
      description: "Padrão MVC, arquiteturas cliente-servidor, Web Services RESTful e microsserviços.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q27" },
        { id_prova: "2021_ADS", id_questao: "q28" },
        { id_prova: "2017_ADS", id_questao: "q27" },
        { id_prova: "2014_ADS", id_questao: "q15" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "DevOps, CI/CD & Gerência de Configuração",
      topic: "Engenharia de Software",
      description: "Versionamento de código, integração contínua (CI), entrega contínua (CD) e automação.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q29" },
        { id_prova: "2017_ADS", id_questao: "q29" },
        { id_prova: "2011_ADS", id_questao: "q16" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Segurança da Informação em Aplicações",
      topic: "Segurança da Informação",
      description: "Vulnerabilidades comuns (SQL Injection, XSS), autenticação, criptografia e proteção de dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q30" },
        { id_prova: "2021_ADS", id_questao: "q31" },
        { id_prova: "2017_ADS", id_questao: "q15" },
        { id_prova: "2021_CCP", id_questao: "q24" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Interação Humano-Computador (IHC) & UX",
      topic: "Engenharia de Software",
      description: "Heurísticas de usabilidade, acessibilidade, design de interfaces e experiência do usuário.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q33" },
        { id_prova: "2017_ADS", id_questao: "q31" },
        { id_prova: "2011_ADS", id_questao: "q15" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Algoritmos & Lógica para Desenvolvedores",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Operadores lógicos, listas, pilhas, filas e análise básica de complexidade.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q35" },
        { id_prova: "2021_GTI", id_questao: "q20" },
        { id_prova: "2017_ADS", id_questao: "q09" },
        { id_prova: "2017_ADS", id_questao: "q10" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Tecnólogo em ADS",
      topic: "Engenharia de Software",
      description: "Simulado integrador das competências nucleares de Engenharia de Software, Requisitos e Banco de Dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q09" },
        { id_prova: "2021_ADS", id_questao: "q13" },
        { id_prova: "2021_ADS", id_questao: "q21" },
        { id_prova: "2021_ADS", id_questao: "q25" },
      ],
    },
  ],

  // ==========================================
  // CCP: Ciência da Computação (Portaria Inep nº 157)
  // ==========================================
  CCP: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Algoritmos & Complexidade Assintótica",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Análise de complexidade temporal e espacial, notação Big-O, limites assintóticos e recursão.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q10" },
        { id_prova: "2021_CCP", id_questao: "q22" },
        { id_prova: "2017_CCP", id_questao: "q20" },
        { id_prova: "2014_CCP", id_questao: "q16" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Estruturas de Dados Avançadas (Árvores & Listas)",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Árvores Binárias de Busca, árvores balanceadas AVL, árvores B+ e manipulação de ponteiros.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q23" },
        { id_prova: "2017_CCP", id_questao: "qd03" },
        { id_prova: "2017_CCP", id_questao: "q09" },
        { id_prova: "2014_CCP", id_questao: "q14" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Teoria dos Grafos & Algoritmos Clássicos",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Grafos direcionados/não-direcionados, busca em largura (BFS), profundidade (DFS) e Dijkstra.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q27" },
        { id_prova: "2017_CCP", id_questao: "q24" },
        { id_prova: "2014_CCP", id_questao: "q25" },
        { id_prova: "2011_CCP", id_questao: "q27" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Teoria da Computação, Autômatos & Linguagens Formais",
      topic: "Teoria da Computação e Compiladores",
      description: "Autômatos finitos (AFD/AFND), expressões regulares, gramáticas livres de contexto e máquinas de Turing.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q20" },
        { id_prova: "2017_CCP", id_questao: "q14" },
        { id_prova: "2014_CCP", id_questao: "q17" },
        { id_prova: "2011_CCP", id_questao: "q23" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Compiladores & Análise Sintática",
      topic: "Teoria da Computação e Compiladores",
      description: "Análise léxica, sintática e semântica, tabelas de símbolos e geração de código intermediário.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q31" },
        { id_prova: "2017_CCP", id_questao: "q31" },
        { id_prova: "2014_CCP", id_questao: "q31" },
        { id_prova: "2008_CCP", id_questao: "q22" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Paradigmas de Programação & POO",
      topic: "Programação e POO",
      description: "Orientação a objetos, polimorfismo, tipos abstratos de dados (TDA), alocação dinâmica e ponteiros.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q14" },
        { id_prova: "2017_CCP", id_questao: "q11" },
        { id_prova: "2014_CCP", id_questao: "q11" },
        { id_prova: "2011_CCP", id_questao: "q39" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Sistemas Operacionais & Gerenciamento de Processos",
      topic: "Sistemas Operacionais",
      description: "Processos, threads, sincronização, semáforos, seção crítica, escalonamento e prevenção de deadlocks.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q09" },
        { id_prova: "2021_CCP", id_questao: "q16" },
        { id_prova: "2017_CCP", id_questao: "q13" },
        { id_prova: "2014_CCP", id_questao: "q20" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Memória Virtual & Sistemas de Arquivos",
      topic: "Sistemas Operacionais",
      description: "Paginação, segmentação, tabelas de páginas, page faults, substituição de páginas e sistemas de arquivos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q29" },
        { id_prova: "2017_CCP", id_questao: "q29" },
        { id_prova: "2014_CCP", id_questao: "q29" },
        { id_prova: "2008_CCP", id_questao: "q19" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Arquitetura de Computadores & Pipeline",
      topic: "Arquitetura e Organização de Computadores",
      description: "Processadores RISC/CISC, estágios de pipeline, hazards, hierarquia de memória cache e barramentos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q28" },
        { id_prova: "2017_CCP", id_questao: "q12" },
        { id_prova: "2014_CCP", id_questao: "q12" },
        { id_prova: "2011_CCP", id_questao: "q45" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Redes de Computadores & Protocolos TCP/IP",
      topic: "Redes de Computadores",
      description: "Camadas OSI, protocolos de transporte (TCP/UDP), roteamento IP, sockets e comutação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q21" },
        { id_prova: "2017_CCP", id_questao: "q21" },
        { id_prova: "2011_CCP", id_questao: "q15" },
        { id_prova: "2008_CCP", id_questao: "q35" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Segurança da Informação & Criptografia",
      topic: "Segurança da Informação",
      description: "Criptografia de chave pública e simétrica (RSA, AES), certificados digitais e mitigação de ataques.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q24" },
        { id_prova: "2017_CCP", id_questao: "q15" },
        { id_prova: "2017_CCP", id_questao: "q16" },
        { id_prova: "2008_CCP", id_questao: "q56" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Bancos de Dados & Transações Concorrentes",
      topic: "Banco de Dados",
      description: "Modelagem relacional, SQL, propriedades ACID, escalonamento serializável e recuperação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q32" },
        { id_prova: "2017_CCP", id_questao: "q32" },
        { id_prova: "2014_CCP", id_questao: "q32" },
        { id_prova: "2005_CCP", id_questao: "q73" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Inteligência Artificial & Aprendizado de Máquina",
      topic: "Inteligência Artificial e Dados",
      description: "Algoritmos de busca heurística (A*), aprendizado supervisionado, redes neurais e clustering.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q11" },
        { id_prova: "2021_CCP", id_questao: "q30" },
        { id_prova: "2017_CCP", id_questao: "q17" },
        { id_prova: "2005_CCP", id_questao: "q74" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Bacharelado em Ciência da Computação",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Simulado integrador das competências nucleares de Algoritmos, Arquitetura e Teoria da Computação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q09" },
        { id_prova: "2021_CCP", id_questao: "q21" },
        { id_prova: "2021_CCP", id_questao: "q23" },
        { id_prova: "2021_CCP", id_questao: "q28" },
      ],
    },
  ],

  // ==========================================
  // FG: Formação Geral (Portaria Inep nº 154)
  // ==========================================
  FG: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Ética, Democracia & Cidadania",
      topic: "Formação Geral e Sociedade",
      description: "Exercício ético-cidadão, princípios democráticos, direitos políticos e tomada de decisões conscientes.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q01" },
        { id_prova: "2021_ADS", id_questao: "q08" },
        { id_prova: "2021_GTI", id_questao: "q01" },
        { id_prova: "2021_GTI", id_questao: "q08" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Sustentabilidade & Mudanças Climáticas",
      topic: "Formação Geral e Sociedade",
      description: "Ecologia, pegada ecológica, transição energética, crise climática e Objetivos do Desenvolvimento Sustentável.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q02" },
        { id_prova: "2021_GTI", id_questao: "q02" },
        { id_prova: "2017_ADS", id_questao: "q03" },
        { id_prova: "2014_ADS", id_questao: "q03" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Sociedade Digital, Privacidade & IA",
      topic: "Formação Geral e Sociedade",
      description: "Impactos da inteligência artificial, algoritmos sociais, privacidade, exclusão digital e ética nas redes.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q04" },
        { id_prova: "2021_ADS", id_questao: "q07" },
        { id_prova: "2021_GTI", id_questao: "q07" },
        { id_prova: "2017_ADS", id_questao: "q04" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Direitos Humanos & Inclusão Social",
      topic: "Formação Geral e Sociedade",
      description: "Dignidade humana, igualdade perante a lei, proteção às minorias e políticas de combate à exclusão.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q03" },
        { id_prova: "2017_ADS", id_questao: "qd02" },
        { id_prova: "2014_ADS", id_questao: "qd02" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Relações Étnico-Raciais & Diversidade",
      topic: "Formação Geral e Sociedade",
      description: "Equidade racial, combate ao racismo estrutural, respeito à diversidade cultural e inclusão.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q06" },
        { id_prova: "2017_CCP", id_questao: "qd02" },
        { id_prova: "2014_CCP", id_questao: "qd02" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Mundo do Trabalho & Novas Dinâmicas",
      topic: "Formação Geral e Sociedade",
      description: "Trabalho remoto, precarização, uberização, automação de empregos e qualificações do futuro.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q04" },
        { id_prova: "2021_GTI", id_questao: "q04" },
        { id_prova: "2017_GTI", id_questao: "q06" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Cultura, Arte & Comunicação",
      topic: "Formação Geral e Sociedade",
      description: "Expressão artística, combate à censura, patrimônio histórico-cultural e liberdade de imprensa.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "qd01" },
        { id_prova: "2017_GTI", id_questao: "q04" },
        { id_prova: "2014_ADS", id_questao: "q01" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Cidades Inteligentes & Espaço Urbano",
      topic: "Formação Geral e Sociedade",
      description: "Mobilidade urbana, transporte público, cidades sustentáveis e habitação digna.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "qd02" },
        { id_prova: "2014_ADS", id_questao: "qd01" },
        { id_prova: "2014_CCP", id_questao: "qd01" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Saúde Pública, Bem-Estar & Crises Sanitárias",
      topic: "Formação Geral e Sociedade",
      description: "Sistemas universais de saúde (SUS), impactos econômicos de pandemias e bem-estar coletivo.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q05" },
        { id_prova: "2021_GTI", id_questao: "q06" },
        { id_prova: "2017_GTI", id_questao: "qd01" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Ciência, Tecnologia & Inovação",
      topic: "Formação Geral e Sociedade",
      description: "Desenvolvimento científico, investimento em P&D, transição tecnológica e inovação nacional.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q02" },
        { id_prova: "2017_CCP", id_questao: "q02" },
        { id_prova: "2014_CCP", id_questao: "q04" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Globalização & Relações Internacionais",
      topic: "Formação Geral e Sociedade",
      description: "Blocos econômicos, tratados internacionais, geopolítica e dinâmicas do comércio global.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q01" },
        { id_prova: "2014_ADS", id_questao: "q02" },
        { id_prova: "2011_CCP", id_questao: "q03" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Educação & Acessibilidade",
      topic: "Formação Geral e Sociedade",
      description: "Acesso à educação de qualidade, políticas afirmativas, inclusão pedagógica e pensamento crítico.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q01" },
        { id_prova: "2024_CCP", id_questao: "q02" },
        { id_prova: "2024_CCP", id_questao: "q03" },
        { id_prova: "2024_CCP", id_questao: "q04" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Interpretação de Gráficos & Argumentação Crítica",
      topic: "Formação Geral e Sociedade",
      description: "Leitura de tabelas estatísticas, análise de dados socioeconômicos e estruturação de argumentos lógicos.",
      questionCount: 3,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q05" },
        { id_prova: "2017_ADS", id_questao: "q02" },
        { id_prova: "2014_ADS", id_questao: "q06" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Componente de Formação Geral",
      topic: "Formação Geral e Sociedade",
      description: "Simulado preparatório final com as 15 competências essenciais de Formação Geral avaliadas pelo Inep.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q01" },
        { id_prova: "2021_ADS", id_questao: "q04" },
        { id_prova: "2021_ADS", id_questao: "q07" },
        { id_prova: "2021_ADS", id_questao: "q08" },
      ],
    },
  ],
};

export function getQuestionSetsForCourse(curso: string): QuestionSetConfig[] {
  const normalized = curso.toUpperCase();
  if (normalized === "FG" || normalized.includes("FORMA")) return QUESTION_SETS.FG;
  if (normalized === "ADS") return QUESTION_SETS.ADS;
  if (normalized === "GTI") return QUESTION_SETS.GTI;
  if (normalized === "CCP") return QUESTION_SETS.CCP;
  return QUESTION_SETS.ADS;
}

export function getQuestionSetByNumber(curso: string, setNumber: number): QuestionSetConfig | undefined {
  const sets = getQuestionSetsForCourse(curso);
  return sets.find((s) => s.setNumber === setNumber);
}

