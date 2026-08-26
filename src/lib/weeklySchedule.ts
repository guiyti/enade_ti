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
  ADS: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Engenharia de Requisitos & Ciclo de Vida",
      topic: "Engenharia de Software",
      description: "Levantamento de requisitos funcionais e não-funcionais, regras de negócio e histórias de usuário.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q09" },
        { id_prova: "2021_ADS", id_questao: "q10" },
        { id_prova: "2021_ADS", id_questao: "q11" },
        { id_prova: "2021_ADS", id_questao: "q12" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Modelagem de Software & Diagramas UML",
      topic: "Engenharia de Software",
      description: "Diagramas de classes, casos de uso, sequência e atividades na notação UML.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q13" },
        { id_prova: "2021_ADS", id_questao: "q14" },
        { id_prova: "2021_ADS", id_questao: "q15" },
        { id_prova: "2021_ADS", id_questao: "q16" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Banco de Dados & Modelagem Relacional",
      topic: "Banco de Dados",
      description: "Modelo entidade-relacionamento (DER), integridade referencial e chaves primárias/estrangeiras.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q17" },
        { id_prova: "2021_ADS", id_questao: "q18" },
        { id_prova: "2021_ADS", id_questao: "q19" },
        { id_prova: "2021_ADS", id_questao: "q20" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "SQL & Normalização de Dados",
      topic: "Banco de Dados",
      description: "Consultas SQL complexas, JOINs, agregações e formas normais (1FN, 2FN, 3FN).",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q21" },
        { id_prova: "2021_ADS", id_questao: "q22" },
        { id_prova: "2021_ADS", id_questao: "q23" },
        { id_prova: "2021_ADS", id_questao: "q24" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Programação Orientada a Objetos & Herança",
      topic: "Linguagens e POO",
      description: "Encapsulamento, polimorfismo, classes abstratas, interfaces e tratamento de exceções.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q25" },
        { id_prova: "2021_ADS", id_questao: "q26" },
        { id_prova: "2021_ADS", id_questao: "q27" },
        { id_prova: "2021_ADS", id_questao: "q28" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Metodologias Ágeis & Scrum",
      topic: "Engenharia de Software",
      description: "Sprints, Daily Scrum, papéis ágeis (PO, Scrum Master), Kanban e entrega contínua.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q29" },
        { id_prova: "2021_ADS", id_questao: "q30" },
        { id_prova: "2021_ADS", id_questao: "q31" },
        { id_prova: "2021_ADS", id_questao: "q32" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Qualidade, Testes & Métricas de Software",
      topic: "Engenharia de Software",
      description: "Testes unitários, testes de integração, cobertura de código e refatoração.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q33" },
        { id_prova: "2021_ADS", id_questao: "q34" },
        { id_prova: "2021_ADS", id_questao: "q35" },
        { id_prova: "2017_ADS", id_questao: "q09" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Segurança da Informação & OWASP",
      topic: "Segurança da Informação",
      description: "Vulnerabilidades web, SQL Injection, XSS, autenticação segura e criptografia.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q10" },
        { id_prova: "2017_ADS", id_questao: "q11" },
        { id_prova: "2017_ADS", id_questao: "q12" },
        { id_prova: "2017_ADS", id_questao: "q13" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Algoritmos, Complexidade & Lógica",
      topic: "Algoritmos e Estruturas",
      description: "Estruturas de repetição, vetores, matrizes, busca linear/binária e recursão.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q14" },
        { id_prova: "2017_ADS", id_questao: "q15" },
        { id_prova: "2017_ADS", id_questao: "q16" },
        { id_prova: "2017_ADS", id_questao: "q17" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Estruturas de Dados Dinâmicas (Pilhas & Filas)",
      topic: "Algoritmos e Estruturas",
      description: "Alocação dinâmica de memória, ponteiros, listas encadeadas, pilhas e filas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q18" },
        { id_prova: "2017_ADS", id_questao: "q19" },
        { id_prova: "2017_ADS", id_questao: "q20" },
        { id_prova: "2017_ADS", id_questao: "q21" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Web Services, REST & Arquitetura de Software",
      topic: "Engenharia de Software",
      description: "APIs RESTful, JSON/XML, métodos HTTP, arquitetura MVC e microsserviços.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q22" },
        { id_prova: "2017_ADS", id_questao: "q23" },
        { id_prova: "2017_ADS", id_questao: "q24" },
        { id_prova: "2017_ADS", id_questao: "q25" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Simulado Geral de Revisão ADS",
      topic: "Revisão Geral",
      description: "Síntese dos tópicos mais cobrados nas provas oficiais do ENADE para ADS.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q26" },
        { id_prova: "2017_ADS", id_questao: "q27" },
        { id_prova: "2017_ADS", id_questao: "q28" },
        { id_prova: "2017_ADS", id_questao: "q29" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Simulado Reta Final · Padrões de Projeto & DevOps",
      topic: "Engenharia de Software e Arquitetura",
      description: "Padrões GoF (Factory, Singleton, Observer), pipelines CI/CD e integração contínua.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q30" },
        { id_prova: "2017_ADS", id_questao: "q31" },
        { id_prova: "2017_ADS", id_questao: "q32" },
        { id_prova: "2017_ADS", id_questao: "q33" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Semana da Prova · Revisão Integrada & Estratégia",
      topic: "Revisão Geral e Dicas Finais",
      description: "Questões de síntese cobrando raciocínio interdisciplinar de requisitos, código e banco.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q34" },
        { id_prova: "2017_ADS", id_questao: "q35" },
        { id_prova: "2014_ADS", id_questao: "q09" },
        { id_prova: "2014_ADS", id_questao: "q10" },
      ],
    },
  ],

  GTI: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Fundamentos de Governança & Alinhamento Estratégico",
      topic: "Governança e Gestão de TI",
      description: "Princípios de governança corporativa de TI, valor de negócio e alinhamento de metas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q09" },
        { id_prova: "2021_GTI", id_questao: "q10" },
        { id_prova: "2021_GTI", id_questao: "q11" },
        { id_prova: "2021_GTI", id_questao: "q12" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Gestão de Serviços & ITIL 4",
      topic: "Governança e Gestão de TI",
      description: "Sistema de Valor de Serviço (SVS), as 4 dimensões do gerenciamento e catálogo de serviços.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q13" },
        { id_prova: "2021_GTI", id_questao: "q14" },
        { id_prova: "2021_GTI", id_questao: "q15" },
        { id_prova: "2021_GTI", id_questao: "q16" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Segurança da Informação & Gestão de Riscos",
      topic: "Governança e Gestão de TI",
      description: "Políticas de segurança, normas ISO/IEC 27001/27002, ameaças e matriz de riscos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q17" },
        { id_prova: "2021_GTI", id_questao: "q18" },
        { id_prova: "2021_GTI", id_questao: "q19" },
        { id_prova: "2021_GTI", id_questao: "q20" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "COBIT 2019 & Controle de Processos",
      topic: "Governança e Gestão de TI",
      description: "Objetivos de governança e gestão, domínios EDM, APO, BAI, DSS e MEA.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q21" },
        { id_prova: "2021_GTI", id_questao: "q22" },
        { id_prova: "2021_GTI", id_questao: "q23" },
        { id_prova: "2021_GTI", id_questao: "q24" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "LGPD, Privacidade & Conformidade Legal",
      topic: "Governança e Gestão de TI",
      description: "Bases legais, direitos dos titulares de dados, DPO, relatórios RIPD e sanções.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q25" },
        { id_prova: "2021_GTI", id_questao: "q26" },
        { id_prova: "2021_GTI", id_questao: "q27" },
        { id_prova: "2021_GTI", id_questao: "q28" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Acordos de Nível de Serviço (SLA & OLA)",
      topic: "Governança e Gestão de TI",
      description: "Métricas de disponibilidade, tempos de resposta (MTTR/MTBF) e contratos de terceirização.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q29" },
        { id_prova: "2021_GTI", id_questao: "q30" },
        { id_prova: "2021_GTI", id_questao: "q31" },
        { id_prova: "2021_GTI", id_questao: "q32" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Gestão de Projetos de TI (PMBOK & Ágil)",
      topic: "Governança e Gestão de TI",
      description: "Gerenciamento de escopo, cronograma, custos, riscos e integração de projetos híbridos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q33" },
        { id_prova: "2021_GTI", id_questao: "q34" },
        { id_prova: "2021_GTI", id_questao: "q35" },
        { id_prova: "2017_GTI", id_questao: "q09" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Continuidade de Negócios & Disaster Recovery",
      topic: "Governança e Gestão de TI",
      description: "Plano de Continuidade de Negócios (PCN), Análise de Impacto (BIA), RTO e RPO.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q10" },
        { id_prova: "2017_GTI", id_questao: "q11" },
        { id_prova: "2017_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q13" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Cloud Computing & Gestão de Infraestrutura",
      topic: "Governança e Gestão de TI",
      description: "Modelos IaaS, PaaS, SaaS, nuvem pública/privada/híbrida e custos operacionais (OpEx vs CapEx).",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q14" },
        { id_prova: "2017_GTI", id_questao: "q15" },
        { id_prova: "2017_GTI", id_questao: "q16" },
        { id_prova: "2017_GTI", id_questao: "q17" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Auditoria de Sistemas & Compliance",
      topic: "Governança e Gestão de TI",
      description: "Trilhas de auditoria, segregação de funções, controles internos e conformidade regulatória.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q18" },
        { id_prova: "2017_GTI", id_questao: "q19" },
        { id_prova: "2017_GTI", id_questao: "q20" },
        { id_prova: "2017_GTI", id_questao: "q21" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Gestão Estratégica da Informação & BI",
      topic: "Governança e Gestão de TI",
      description: "Tomada de decisão baseada em dados, Data Warehouse, KPIs e dashboards gerenciais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q22" },
        { id_prova: "2017_GTI", id_questao: "q23" },
        { id_prova: "2017_GTI", id_questao: "q24" },
        { id_prova: "2017_GTI", id_questao: "q25" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Simulado Geral de Revisão GTI",
      topic: "Revisão Geral",
      description: "Síntese dos tópicos de maior peso nas provas oficiais do ENADE para GTI.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q27" },
        { id_prova: "2017_GTI", id_questao: "q28" },
        { id_prova: "2017_GTI", id_questao: "q29" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Simulado Reta Final · Gestão de Mudanças & Crises",
      topic: "Governança e Gestão de TI",
      description: "Comitê de mudanças (CAB), gestão de incidentes críticos e continuidade operacional.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q30" },
        { id_prova: "2017_GTI", id_questao: "q31" },
        { id_prova: "2017_GTI", id_questao: "q32" },
        { id_prova: "2017_GTI", id_questao: "q33" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Semana da Prova · Revisão Estratégica GTI",
      topic: "Revisão Geral e Dicas Finais",
      description: "Interpretação de cenários corporativos, tomada de decisão e liderança em TI.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q34" },
        { id_prova: "2017_GTI", id_questao: "q35" },
        { id_prova: "2021_GTI", id_questao: "q09" },
        { id_prova: "2021_GTI", id_questao: "q10" },
      ],
    },
  ],

  FG: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Ética, Cidadania & Direitos Humanos",
      topic: "Formação Geral e Sociedade",
      description: "Fundamentos dos direitos humanos, dignidade da pessoa humana e ética no exercício profissional.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q01" },
        { id_prova: "2021_ADS", id_questao: "q02" },
        { id_prova: "2021_ADS", id_questao: "q03" },
        { id_prova: "2021_ADS", id_questao: "q04" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Sustentabilidade & Meio Ambiente",
      topic: "Formação Geral e Sociedade",
      description: "Transição energética, consumo sustentável, ODS da ONU e impacto ecológico.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q05" },
        { id_prova: "2021_ADS", id_questao: "q06" },
        { id_prova: "2021_ADS", id_questao: "q07" },
        { id_prova: "2021_ADS", id_questao: "q08" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Sociedade Digital, Privacidade & IA",
      topic: "Formação Geral e Sociedade",
      description: "Inteligência Artificial, privacidade de dados, algoritmos sociais e exclusão digital.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q01" },
        { id_prova: "2024_CCP", id_questao: "q02" },
        { id_prova: "2024_CCP", id_questao: "q03" },
        { id_prova: "2024_CCP", id_questao: "q04" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Diversidade, Inclusão & Acessibilidade",
      topic: "Formação Geral e Sociedade",
      description: "Políticas afirmativas, equidade de gênero, inclusão PcD e combate ao preconceito.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q05" },
        { id_prova: "2024_CCP", id_questao: "q06" },
        { id_prova: "2024_CCP", id_questao: "q07" },
        { id_prova: "2024_CCP", id_questao: "q08" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Democracia, Políticas Públicas & Estado",
      topic: "Formação Geral e Sociedade",
      description: "Participação social, transparência governamental, fake news e políticas públicas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q01" },
        { id_prova: "2021_CCP", id_questao: "q02" },
        { id_prova: "2021_CCP", id_questao: "q03" },
        { id_prova: "2021_CCP", id_questao: "q04" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Mundo do Trabalho & Novas Relações Profissionais",
      topic: "Formação Geral e Sociedade",
      description: "Trabalho remoto, gig economy, automação, saúde mental no trabalho e relações sindicais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q05" },
        { id_prova: "2021_CCP", id_questao: "q06" },
        { id_prova: "2021_CCP", id_questao: "q07" },
        { id_prova: "2021_CCP", id_questao: "q08" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Ciência, Tecnologia & Inovação Social",
      topic: "Formação Geral e Sociedade",
      description: "Método científico, negacionismo, impacto social de inovações tecnológicas e bioética.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q01" },
        { id_prova: "2017_ADS", id_questao: "q02" },
        { id_prova: "2017_ADS", id_questao: "q03" },
        { id_prova: "2017_ADS", id_questao: "q04" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Cultura, Arte & Patrimônio Histórico",
      topic: "Formação Geral e Sociedade",
      description: "Diversidade cultural brasileira, patrimônio material/imaterial e linguagens artísticas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q05" },
        { id_prova: "2017_ADS", id_questao: "q06" },
        { id_prova: "2017_ADS", id_questao: "q07" },
        { id_prova: "2017_ADS", id_questao: "q08" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Educação, Letramento & Cidadania Ativa",
      topic: "Formação Geral e Sociedade",
      description: "Acesso à educação, letramento digital, pensamento crítico e engajamento comunitário.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q01" },
        { id_prova: "2017_GTI", id_questao: "q02" },
        { id_prova: "2017_GTI", id_questao: "q03" },
        { id_prova: "2017_GTI", id_questao: "q04" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Saúde Coletiva & Bem-Estar Social",
      topic: "Formação Geral e Sociedade",
      description: "SUS, saúde pública, saneamento básico, prevenção e qualidade de vida.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q05" },
        { id_prova: "2017_GTI", id_questao: "q06" },
        { id_prova: "2017_GTI", id_questao: "q07" },
        { id_prova: "2017_GTI", id_questao: "q08" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Globalização, Geopolítica & Direitos dos Povos",
      topic: "Formação Geral e Sociedade",
      description: "Fluxos migratórios, acordos internacionais, soberania e povos originários.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_CCP", id_questao: "q01" },
        { id_prova: "2017_CCP", id_questao: "q02" },
        { id_prova: "2017_CCP", id_questao: "q03" },
        { id_prova: "2017_CCP", id_questao: "q04" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Simulado Geral de Revisão Formação Geral",
      topic: "Revisão Geral",
      description: "Questões selecionadas das provas oficiais cobrando interpretação de textos e gráficos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_CCP", id_questao: "q05" },
        { id_prova: "2017_CCP", id_questao: "q06" },
        { id_prova: "2017_CCP", id_questao: "q07" },
        { id_prova: "2017_CCP", id_questao: "q08" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Simulado Reta Final · Impacto Social da Tecnologia & Sustentabilidade",
      topic: "Formação Geral e Sociedade",
      description: "Transformação digital, privacidade de dados, inclusão e consumo sustentável.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_ADS", id_questao: "q07" },
        { id_prova: "2017_ADS", id_questao: "q08" },
        { id_prova: "2014_ADS", id_questao: "q01" },
        { id_prova: "2014_ADS", id_questao: "q02" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Semana da Prova · Interpretação de Textos & Atualidades",
      topic: "Formação Geral e Sociedade",
      description: "Interpretação crítica de gráficos, infográficos e textos motivadores da prova de Formação Geral.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q03" },
        { id_prova: "2014_ADS", id_questao: "q04" },
        { id_prova: "2014_ADS", id_questao: "q05" },
        { id_prova: "2014_ADS", id_questao: "q06" },
      ],
    },
  ],

  CCP: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Algoritmos, Complexidade & Notação Big-O",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Análise assintótica de tempo e espaço, relações de recorrência e complexidade de laços.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q09" },
        { id_prova: "2024_CCP", id_questao: "q10" },
        { id_prova: "2024_CCP", id_questao: "q11" },
        { id_prova: "2024_CCP", id_questao: "q12" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Árvores Binárias, AVL & Árvores B",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Árvores binárias de busca (BST), balanceamento AVL, percursos (in/pre/pos) e árvores B.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q13" },
        { id_prova: "2024_CCP", id_questao: "q14" },
        { id_prova: "2024_CCP", id_questao: "q15" },
        { id_prova: "2024_CCP", id_questao: "q16" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Grafos, BFS, DFS & Caminho Mínimo",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Representação de grafos, busca em largura (BFS), profundidade (DFS) e algoritmo de Dijkstra.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q17" },
        { id_prova: "2024_CCP", id_questao: "q18" },
        { id_prova: "2024_CCP", id_questao: "q19" },
        { id_prova: "2024_CCP", id_questao: "q20" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Sistemas Operacionais & Gerenciamento de Processos",
      topic: "Sistemas Operacionais e Arquitetura",
      description: "Escalonamento de CPU, threads, sincronização (semáforos/mutex) e prevenção de deadlock.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q21" },
        { id_prova: "2024_CCP", id_questao: "q22" },
        { id_prova: "2024_CCP", id_questao: "q23" },
        { id_prova: "2024_CCP", id_questao: "q24" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Memória Virtual & Sistemas de Arquivos",
      topic: "Sistemas Operacionais e Arquitetura",
      description: "Paginação, segmentação, algoritmos de substituição de páginas (LRU/FIFO) e I/O.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q25" },
        { id_prova: "2024_CCP", id_questao: "q26" },
        { id_prova: "2024_CCP", id_questao: "q27" },
        { id_prova: "2024_CCP", id_questao: "q28" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Arquitetura de Computadores & Pipeline",
      topic: "Sistemas Operacionais e Arquitetura",
      description: "Pipeline RISC, hazards estruturais/dados/controle, hierarquia de memória cache e paralelismo.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q29" },
        { id_prova: "2024_CCP", id_questao: "q30" },
        { id_prova: "2024_CCP", id_questao: "q31" },
        { id_prova: "2024_CCP", id_questao: "q32" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Teoria da Computação, Autômatos & Linguagens Formais",
      topic: "Teoria da Computação e Compiladores",
      description: "Autômatos finitos (DFA/NFA), expressões regulares, gramáticas livres de contexto e Máquinas de Turing.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q33" },
        { id_prova: "2024_CCP", id_questao: "q34" },
        { id_prova: "2024_CCP", id_questao: "q35" },
        { id_prova: "2024_CCP", id_questao: "q36" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Banco de Dados, Álgebra Relacional & Transações ACID",
      topic: "Banco de Dados",
      description: "Álgebra relacional formal, controle de concorrência, isolamento, serializabilidade e log de recuperação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q37" },
        { id_prova: "2024_CCP", id_questao: "q38" },
        { id_prova: "2024_CCP", id_questao: "q39" },
        { id_prova: "2024_CCP", id_questao: "q40" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Inteligência Artificial & Mineração de Dados",
      topic: "Inteligência Artificial e Dados",
      description: "Algoritmos de busca heurística (A*), aprendizado supervisionado e redes neurais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q41" },
        { id_prova: "2024_CCP", id_questao: "q42" },
        { id_prova: "2024_CCP", id_questao: "q43" },
        { id_prova: "2024_CCP", id_questao: "q44" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Redes de Computadores & Segurança de Protocolos",
      topic: "Redes e Segurança",
      description: "Camadas OSI/TCP-IP, roteamento IP, controle de congestionamento TCP e TLS/SSL.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q45" },
        { id_prova: "2024_CCP", id_questao: "q46" },
        { id_prova: "2024_CCP", id_questao: "q47" },
        { id_prova: "2024_CCP", id_questao: "q48" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Compiladores & Análise Léxica/Sintática",
      topic: "Teoria da Computação e Compiladores",
      description: "Tabelas de símbolos, analisadores LL/LR, árvores de derivação sintática e código intermediário.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q49" },
        { id_prova: "2024_CCP", id_questao: "q50" },
        { id_prova: "2024_CCP", id_questao: "q51" },
        { id_prova: "2024_CCP", id_questao: "q52" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Simulado Geral de Revisão Ciência da Computação",
      topic: "Revisão Geral",
      description: "Síntese dos tópicos de maior peso nas provas oficiais do ENADE para Ciência da Computação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q53" },
        { id_prova: "2024_CCP", id_questao: "q54" },
        { id_prova: "2024_CCP", id_questao: "q55" },
        { id_prova: "2024_CCP", id_questao: "q56" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Simulado Reta Final · Otimização de Algoritmos & Concorrência",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Programação concorrente, threads, sincronização, semáforos e otimização de complexidade assintótica.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q29" },
        { id_prova: "2021_CCP", id_questao: "q30" },
        { id_prova: "2021_CCP", id_questao: "q31" },
        { id_prova: "2021_CCP", id_questao: "q32" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Semana da Prova · Revisão Integrada Ciência da Computação",
      topic: "Revisão Geral e Dicas Finais",
      description: "Questões de alto nível combinando teoria da computação, arquitetura e engenharia de software.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q33" },
        { id_prova: "2021_CCP", id_questao: "q34" },
        { id_prova: "2021_CCP", id_questao: "q35" },
        { id_prova: "2017_CCP", id_questao: "q09" },
      ],
    },
  ],
};

export function getQuestionSetsForCourse(cursoInput: string): QuestionSetConfig[] {
  const c = cursoInput.toUpperCase();
  if (c === "FG" || c.includes("FORMA")) return QUESTION_SETS.FG;
  if (c === "GTI") return QUESTION_SETS.GTI;
  if (c === "CCP") return QUESTION_SETS.CCP;
  return QUESTION_SETS.ADS;
}

export function getQuestionSetByNumber(cursoInput: string, setNumber: number): QuestionSetConfig | null {
  const sets = getQuestionSetsForCourse(cursoInput);
  const found = sets.find((s) => s.setNumber === setNumber);
  return found || sets[0] || null;
}
