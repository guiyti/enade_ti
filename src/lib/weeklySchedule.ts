export interface QuestionReference {
  id_prova: string;
  id_questao: string;
}

export type QuestionRef = QuestionReference;

export interface WeeklyStudySet {
  setNumber: number;
  label: string;
  title: string;
  topic: string;
  description: string;
  questionCount: number;
  questionIds: QuestionReference[];
}

export type QuestionSetConfig = WeeklyStudySet;

export interface CourseSets {
  ADS: WeeklyStudySet[];
  GTI: WeeklyStudySet[];
  CCP: WeeklyStudySet[];
  FG: WeeklyStudySet[];
}

export interface CourseSchedule {
  courseName: string;
  courseSlug: string;
  description: string;
  colorClass: string;
  accentBorder: string;
  iconName: string;
  weeks: WeeklyStudySet[];
}

export interface WeekCalendarInfo {
  weekNumber: number;
  label: string;
  startDate: string;
  endDate: string;
  periodLabel: string;
}

export const ENADE_2026_CALENDAR = {
  startDate: "2026-08-24",
  examDate: "2026-11-29",
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
  for (const w of ENADE_2026_CALENDAR.weeks) {
    const wStart = new Date(`${w.startDate}T00:00:00-03:00`);
    const wEnd = new Date(`${w.endDate}T23:59:59-03:00`);
    if (now >= wStart && now <= wEnd) {
      weekNumber = w.weekNumber;
      break;
    }
  }

  if (isBeforeStart) weekNumber = 1;
  if (isAfterExam) weekNumber = 14;

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

export const WEEKLY_SCHEDULES: CourseSets = {
  GTI: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Governança Corporativa & Alinhamento Estratégico",
      topic: "Governança e Gestão de TI",
      description: "Princípios da Governança de TI, ISO/IEC 38500, alinhamento estratégico e tomada de decisão.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q27" },
        { id_prova: "2021_GTI", id_questao: "q33" },
        { id_prova: "2017_GTI", id_questao: "q24" },
        { id_prova: "2017_GTI", id_questao: "q09" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Gerenciamento de Serviços de TI (ITIL)",
      topic: "Governança e Gestão de TI",
      description: "Ciclo de vida de serviços, catálogo de serviços, SLA, Acordo de Nível Operacional e Gerenciamento de Incidentes.",
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
      title: "Governança de TI com COBIT",
      topic: "Governança e Gestão de TI",
      description: "Estrutura COBIT, objetivos de controle, domínios de governança e gestão (EDM, APO, BAI, DSS, MEA).",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q31" },
        { id_prova: "2017_GTI", id_questao: "q22" },
        { id_prova: "2021_GTI", id_questao: "q34" },
        { id_prova: "2017_GTI", id_questao: "q17" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Segurança da Informação & Gestão de Riscos",
      topic: "Segurança da Informação",
      description: "Família ISO/IEC 27000, políticas de segurança corporativa, análise de vulnerabilidades e classificação de ativos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q30" },
        { id_prova: "2017_GTI", id_questao: "q23" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Gestão por Processos & Notação BPMN",
      topic: "Governança e Gestão de TI",
      description: "Modelagem, análise e melhoria de processos de negócio com BPMN, pools, lanes, eventos e gateways.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q28" },
        { id_prova: "2021_GTI", id_questao: "q30" },
        { id_prova: "2017_GTI", id_questao: "q18" },
        { id_prova: "2017_GTI", id_questao: "q25" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Gerenciamento de Projetos de TI (PMBOK)",
      topic: "Governança e Gestão de TI",
      description: "Áreas de conhecimento do PMBOK, Termo de Abertura (TAP), EAP, caminho crítico e gerenciamento de partes interessadas.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q29" },
        { id_prova: "2017_GTI", id_questao: "q13" },
        { id_prova: "2017_GTI", id_questao: "q21" },
        { id_prova: "2014_ADS", id_questao: "q09" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Continuidade de Negócios & Recuperação (DRP)",
      topic: "Governança e Gestão de TI",
      description: "Plano de Continuidade de Negócios (PCN), Disaster Recovery Plan (DRP), RTO, RPO e redundância de data centers.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q34" },
        { id_prova: "2017_GTI", id_questao: "q35" },
        { id_prova: "2021_GTI", id_questao: "q34" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Auditoria de TI, Compliance & Controles Internos",
      topic: "Governança e Gestão de TI",
      description: "Normas de auditoria de sistemas, conformidade regulatória, segregação de funções e rastreabilidade.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q35" },
        { id_prova: "2017_GTI", id_questao: "q35" },
        { id_prova: "2017_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q34" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Sistemas de Informações Gerenciais & ERP",
      topic: "Governança e Gestão de TI",
      description: "Sistemas ERP, CRM, SCM, arquitetura transacional corporativa e integração de módulos departamentais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q18" },
        { id_prova: "2017_GTI", id_questao: "q19" },
        { id_prova: "2008_CCP", id_questao: "q64" },
        { id_prova: "2021_GTI", id_questao: "q27" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Business Intelligence & Apoio à Decisão",
      topic: "Governança e Gestão de TI",
      description: "Data Warehouse, modelagem dimensional (Star Schema/Snowflake), ETL, cubos OLAP e suporte à decisão executiva.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_GTI", id_questao: "q10" },
        { id_prova: "2021_GTI", id_questao: "q18" },
        { id_prova: "2021_GTI", id_questao: "q33" },
        { id_prova: "2017_GTI", id_questao: "q24" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Infraestrutura de TI, Redes & Conectividade",
      topic: "Redes de Computadores",
      description: "Topologias corporativas, modelo TCP/IP, switches, roteamento, VLANs, Wi-Fi e monitoramento de conectividade.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q11" },
        { id_prova: "2017_GTI", id_questao: "q33" },
        { id_prova: "2021_CCP", id_questao: "q21" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Bancos de Dados & Decisão Tecnológica",
      topic: "Banco de Dados",
      description: "Modelo relacional, integridade referencial, consultas SQL estruturadas e tomada de decisão sobre armazenamento.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q14" },
        { id_prova: "2014_ADS", id_questao: "q11" },
        { id_prova: "2014_ADS", id_questao: "q21" },
        { id_prova: "2014_ADS", id_questao: "q22" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Engenharia de Software & Contratação de TI",
      topic: "Engenharia de Software",
      description: "Métricas de software, SLA de fornecedores, modelos de ciclo de vida e aquisição de soluções.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q11" },
        { id_prova: "2021_GTI", id_questao: "q13" },
        { id_prova: "2021_GTI", id_questao: "q25" },
        { id_prova: "2017_GTI", id_questao: "q20" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Tecnólogo em GTI",
      topic: "Governança e Gestão de TI",
      description: "Simulado integrador das competências nucleares de Governança, ITIL, COBIT, Segurança e Gestão de Projetos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_GTI", id_questao: "q21" },
        { id_prova: "2021_GTI", id_questao: "q27" },
        { id_prova: "2021_GTI", id_questao: "q29" },
        { id_prova: "2021_GTI", id_questao: "q35" },
      ],
    },
  ],
  ADS: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Engenharia de Requisitos & Elicitação",
      topic: "Engenharia de Software",
      description: "Requisitos funcionais e não-funcionais, técnicas de elicitação (entrevistas, prototipação) e validação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q09" },
        { id_prova: "2021_ADS", id_questao: "q18" },
        { id_prova: "2014_ADS", id_questao: "q19" },
        { id_prova: "2011_ADS", id_questao: "q09" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Metodologias Ágeis (Scrum, Kanban & XP)",
      topic: "Engenharia de Software",
      description: "Valores ágeis, papéis no Scrum (PO, SM, Devs), cerimônias, artefatos, histórias de usuário e Kanban.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q19" },
        { id_prova: "2021_ADS", id_questao: "q21" },
        { id_prova: "2014_ADS", id_questao: "q24" },
        { id_prova: "2011_ADS", id_questao: "q27" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Modelagem Orientada a Objetos com UML",
      topic: "Engenharia de Software",
      description: "Diagrama de Classes, Diagrama de Sequência, Diagrama de Casos de Uso, Diagrama de Atividades e Estados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q16" },
        { id_prova: "2017_ADS", id_questao: "q16" },
        { id_prova: "2014_ADS", id_questao: "q17" },
        { id_prova: "2011_ADS", id_questao: "q12" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Padrões de Projeto (Design Patterns GoF)",
      topic: "Engenharia de Software",
      description: "Padrões criacionais (Singleton, Factory Method), estruturais (Adapter, Decorator) e comportamentais (Observer, Strategy).",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q24" },
        { id_prova: "2014_ADS", id_questao: "q25" },
        { id_prova: "2014_ADS", id_questao: "q29" },
        { id_prova: "2011_ADS", id_questao: "q20" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Programação Orientada a Objetos (POO)",
      topic: "Programação e POO",
      description: "Encapsulamento, herança, polimorfismo, interfaces, classes abstratas, instanciação e tratamento de exceções.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q33" },
        { id_prova: "2011_ADS", id_questao: "q21" },
        { id_prova: "2011_ADS", id_questao: "q35" },
        { id_prova: "2005_CCP", id_questao: "q21" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Modelagem Conceitual & Diagrama ER (DER)",
      topic: "Banco de Dados",
      description: "Entidades, atributos, relacionamentos, cardinalidades (1:1, 1:N, N:N) e mapeamento para modelo relacional.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q17" },
        { id_prova: "2017_ADS", id_questao: "q32" },
        { id_prova: "2011_ADS", id_questao: "q23" },
        { id_prova: "2021_CCP", id_questao: "q22" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "SQL Avançado & Formas Normais (1FN a 3FN)",
      topic: "Banco de Dados",
      description: "Consultas DML (SELECT, JOIN, GROUP BY, subconsultas), DDL, integridade referencial e dependências funcionais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q11" },
        { id_prova: "2014_ADS", id_questao: "q18" },
        { id_prova: "2014_ADS", id_questao: "q21" },
        { id_prova: "2011_ADS", id_questao: "q22" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Qualidade & Testes de Software",
      topic: "Engenharia de Software",
      description: "Testes unitários, testes de integração, testes de aceitação, caixa-preta, caixa-branca, TDD e refatoração.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q25" },
        { id_prova: "2014_ADS", id_questao: "q33" },
        { id_prova: "2011_ADS", id_questao: "q25" },
        { id_prova: "2011_ADS", id_questao: "q30" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Arquitetura de Software & Serviços Web",
      topic: "Engenharia de Software",
      description: "Padrões arquiteturais (MVC, Microsserviços), APIs RESTful, JSON, desacoplamento e interoperabilidade.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q12" },
        { id_prova: "2014_ADS", id_questao: "q15" },
        { id_prova: "2014_ADS", id_questao: "q28" },
        { id_prova: "2011_ADS", id_questao: "q14" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "DevOps, Manutenção & Gerência de Configuração",
      topic: "Engenharia de Software",
      description: "Controle de versão com Git, integração contínua (CI/CD), gerência de configuração e manutenção corretiva/evolutiva.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q30" },
        { id_prova: "2011_ADS", id_questao: "q18" },
        { id_prova: "2011_ADS", id_questao: "q24" },
        { id_prova: "2011_ADS", id_questao: "q32" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Segurança da Informação em Aplicações",
      topic: "Segurança da Informação",
      description: "Proteção contra vulnerabilidades OWASP (SQL Injection, XSS), autenticação, controle de acesso e criptografia.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q13" },
        { id_prova: "2021_GTI", id_questao: "q26" },
        { id_prova: "2017_GTI", id_questao: "q12" },
        { id_prova: "2017_GTI", id_questao: "q30" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Interação Humano-Computador (IHC) & UX",
      topic: "Engenharia de Software",
      description: "Heurísticas de usabilidade de Nielsen, acessibilidade web (WCAG), design centrado no usuário e avaliação de interfaces.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q28" },
        { id_prova: "2011_ADS", id_questao: "q15" },
        { id_prova: "2011_CCP", id_questao: "q48" },
        { id_prova: "2014_ADS", id_questao: "q32" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Algoritmos, Estruturas de Dados & Complexidade",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Pilhas, filas, listas encadeadas, recursão, busca binária e complexidade assintótica de operações.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_ADS", id_questao: "q14" },
        { id_prova: "2014_ADS", id_questao: "q16" },
        { id_prova: "2014_ADS", id_questao: "q20" },
        { id_prova: "2011_ADS", id_questao: "q29" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Tecnólogo em ADS",
      topic: "Engenharia de Software",
      description: "Simulado integrador das competências nucleares de Engenharia de Software, Requisitos e Modelagem.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_ADS", id_questao: "q09" },
        { id_prova: "2021_ADS", id_questao: "q16" },
        { id_prova: "2021_ADS", id_questao: "q19" },
        { id_prova: "2021_ADS", id_questao: "q25" },
      ],
    },
  ],
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
        { id_prova: "2017_CCP", id_questao: "q18" },
        { id_prova: "2014_CCP", id_questao: "q12" },
        { id_prova: "2011_CCP", id_questao: "q28" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Estruturas de Dados Avançadas (Árvores & Listas)",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Árvores Binárias de Busca, árvores balanceadas AVL, manipulação de nós e percursos em árvores.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_CCP", id_questao: "q09" },
        { id_prova: "2014_CCP", id_questao: "q13" },
        { id_prova: "2014_CCP", id_questao: "q16" },
        { id_prova: "2011_CCP", id_questao: "q30" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Teoria dos Grafos & Algoritmos Clássicos",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Grafos direcionados/não-direcionados, busca em largura (BFS), profundidade (DFS), Dijkstra e Árvore Geradora Mínima.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q34" },
        { id_prova: "2017_CCP", id_questao: "q24" },
        { id_prova: "2011_CCP", id_questao: "q20" },
        { id_prova: "2014_CCP", id_questao: "q30" },
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
        { id_prova: "2011_CCP", id_questao: "q23" },
        { id_prova: "2008_CCP", id_questao: "q22" },
        { id_prova: "2005_CCP", id_questao: "q63" },
        { id_prova: "2005_CCP", id_questao: "q64" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Compiladores & Análise Sintática",
      topic: "Teoria da Computação e Compiladores",
      description: "Fases de compilação, análise léxica, análise sintática descendente/preditiva, gramáticas e tabela de símbolos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q30" },
        { id_prova: "2017_CCP", id_questao: "q30" },
        { id_prova: "2005_CCP", id_questao: "q65" },
        { id_prova: "2008_CCP", id_questao: "q29" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Paradigmas de Programação & POO",
      topic: "Programação e POO",
      description: "Programação orientada a objetos, polimorfismo, tipos abstratos de dados, paradigma funcional e lógico (Prolog).",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q33" },
        { id_prova: "2005_CCP", id_questao: "q21" },
        { id_prova: "2005_CCP", id_questao: "q79" },
        { id_prova: "2024_CCP", id_questao: "q32" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Sistemas Operacionais & Gerenciamento de Processos",
      topic: "Sistemas Operacionais",
      description: "Processos e threads, estados de processos, multiprogramação, troca de contexto e exclusão mútua.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q09" },
        { id_prova: "2017_CCP", id_questao: "q31" },
        { id_prova: "2014_CCP", id_questao: "q20" },
        { id_prova: "2005_CCP", id_questao: "q53" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Memória Virtual & Sistemas de Arquivos",
      topic: "Sistemas Operacionais",
      description: "Paginação simples, tabela de páginas, algoritmos de substituição de páginas (FIFO, LRU), page faults e sistemas de arquivos.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2017_CCP", id_questao: "q29" },
        { id_prova: "2014_CCP", id_questao: "q11" },
        { id_prova: "2005_CCP", id_questao: "q22" },
        { id_prova: "2008_CCP", id_questao: "q19" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Arquitetura de Computadores & Pipeline",
      topic: "Arquitetura e Organização de Computadores",
      description: "Hierarquia de memória (cache L1/L2/L3), pipeline de instruções, hazards de controle/dados e arquitetura RISC/CISC.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q28" },
        { id_prova: "2014_CCP", id_questao: "q33" },
        { id_prova: "2011_CCP", id_questao: "q44" },
        { id_prova: "2005_CCP", id_questao: "q75" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Redes de Computadores & Protocolos TCP/IP",
      topic: "Redes de Computadores",
      description: "Camadas do modelo OSI e TCP/IP, endereçamento IP, sub-redes, roteamento, portas TCP/UDP e comutação de pacotes.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q21" },
        { id_prova: "2017_CCP", id_questao: "q20" },
        { id_prova: "2008_CCP", id_questao: "q35" },
        { id_prova: "2005_CCP", id_questao: "q33" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Segurança da Informação & Criptografia",
      topic: "Segurança da Informação",
      description: "Criptografia de chave pública/privada (RSA), certificados digitais, integridade de dados e defesas contra ataques virtuais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q12" },
        { id_prova: "2021_CCP", id_questao: "q24" },
        { id_prova: "2017_CCP", id_questao: "q15" },
        { id_prova: "2017_CCP", id_questao: "q16" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Bancos de Dados & Modelagem Relacional",
      topic: "Banco de Dados",
      description: "Modelo relacional, mapeamento DER para tabelas relacionais, integridade referencial, normalização e consultas SQL.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q22" },
        { id_prova: "2024_CCP", id_questao: "q41" },
        { id_prova: "2008_CCP", id_questao: "q44" },
        { id_prova: "2005_CCP", id_questao: "q59" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Inteligência Artificial & Aprendizado de Máquina",
      topic: "Inteligência Artificial e Dados",
      description: "Busca heurística (A*, 8-puzzle), redes neurais artificiais, aprendizado supervisionado e mineração de dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q11" },
        { id_prova: "2021_CCP", id_questao: "q18" },
        { id_prova: "2008_CCP", id_questao: "q31" },
        { id_prova: "2008_CCP", id_questao: "q51" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Revisão Geral do Bacharelado em Computação",
      topic: "Algoritmos e Estruturas de Dados",
      description: "Simulado integrador das competências nucleares de Algoritmos, Grafos e Estruturas de Dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q10" },
        { id_prova: "2021_CCP", id_questao: "q34" },
        { id_prova: "2017_CCP", id_questao: "q18" },
        { id_prova: "2014_CCP", id_questao: "q12" },
      ],
    },
  ],
  FG: [
    {
      setNumber: 1,
      label: "Semana 01",
      title: "Ética, Democracia & Cidadania",
      topic: "Formação Geral e Sociedade",
      description: "Direitos humanos, princípios republicanos, ética profissional e cidadania participativa na era digital.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q01" },
        { id_prova: "2021_ADS", id_questao: "q01" },
        { id_prova: "2021_GTI", id_questao: "q01" },
        { id_prova: "2017_CCP", id_questao: "q01" },
      ],
    },
    {
      setNumber: 2,
      label: "Semana 02",
      title: "Direitos Humanos & Cidadania Global",
      topic: "Formação Geral e Sociedade",
      description: "Garantias fundamentais, declaração universal dos direitos humanos e justiça social.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q02" },
        { id_prova: "2021_ADS", id_questao: "q02" },
        { id_prova: "2021_GTI", id_questao: "q02" },
        { id_prova: "2017_ADS", id_questao: "q01" },
      ],
    },
    {
      setNumber: 3,
      label: "Semana 03",
      title: "Sustentabilidade & Meio Ambiente",
      topic: "Formação Geral e Sociedade",
      description: "Desenvolvimento sustentável, matriz energética, mudanças climáticas e conservação de recursos naturais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q03" },
        { id_prova: "2021_ADS", id_questao: "q03" },
        { id_prova: "2021_GTI", id_questao: "q03" },
        { id_prova: "2017_CCP", id_questao: "q03" },
      ],
    },
    {
      setNumber: 4,
      label: "Semana 04",
      title: "Políticas Públicas & Desigualdade Social",
      topic: "Formação Geral e Sociedade",
      description: "Inclusão social, distribuição de renda, políticas redistributivas e direitos fundamentais.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q04" },
        { id_prova: "2021_ADS", id_questao: "q04" },
        { id_prova: "2021_GTI", id_questao: "q04" },
        { id_prova: "2017_ADS", id_questao: "q04" },
      ],
    },
    {
      setNumber: 5,
      label: "Semana 05",
      title: "Relações Étnico-Raciais & Diversidade Cultural",
      topic: "Formação Geral e Sociedade",
      description: "Políticas afirmativas, igualdade racial, direitos dos povos originários e valorização da diversidade cultural.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q04" },
        { id_prova: "2024_CCP", id_questao: "q10" },
        { id_prova: "2024_CCP", id_questao: "q27" },
        { id_prova: "2017_ADS", id_questao: "q06" },
      ],
    },
    {
      setNumber: 6,
      label: "Semana 06",
      title: "Cultura Digital & Impactos Sociais da Tecnologia",
      topic: "Formação Geral e Sociedade",
      description: "Transformação digital, exclusão digital, inteligência artificial na sociedade e soberania de dados.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q06" },
        { id_prova: "2021_ADS", id_questao: "q06" },
        { id_prova: "2021_GTI", id_questao: "q06" },
        { id_prova: "2017_CCP", id_questao: "q06" },
      ],
    },
    {
      setNumber: 7,
      label: "Semana 07",
      title: "Trabalho, Tecnologia & Economia Contemporânea",
      topic: "Formação Geral e Sociedade",
      description: "Novas relações laborais, automação do trabalho, economia de plataformas e qualificação profissional.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q07" },
        { id_prova: "2021_ADS", id_questao: "q07" },
        { id_prova: "2021_GTI", id_questao: "q07" },
        { id_prova: "2017_ADS", id_questao: "q07" },
      ],
    },
    {
      setNumber: 8,
      label: "Semana 08",
      title: "Arte, Patrimônio Cultural & Sociedade",
      topic: "Formação Geral e Sociedade",
      description: "Expressões artísticas contemporâneas, patrimônio material e imaterial e memória coletiva brasileira.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q08" },
        { id_prova: "2021_ADS", id_questao: "q08" },
        { id_prova: "2021_GTI", id_questao: "q08" },
        { id_prova: "2017_CCP", id_questao: "q08" },
      ],
    },
    {
      setNumber: 9,
      label: "Semana 09",
      title: "Saúde Pública, Bem-estar & Qualidade de Vida",
      topic: "Formação Geral e Sociedade",
      description: "Sistema Único de Saúde (SUS), vigilância sanitária, saúde mental e saneamento básico.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_CCP", id_questao: "q03" },
        { id_prova: "2014_ADS", id_questao: "q03" },
        { id_prova: "2014_CCP", id_questao: "q07" },
        { id_prova: "2014_ADS", id_questao: "q07" },
      ],
    },
    {
      setNumber: 10,
      label: "Semana 10",
      title: "Ciência, Tecnologia & Sociedade (CTS)",
      topic: "Formação Geral e Sociedade",
      description: "Produção científica nacional, método científico, inovação e responsabilidade social da ciência.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2014_CCP", id_questao: "q05" },
        { id_prova: "2014_ADS", id_questao: "q05" },
        { id_prova: "2014_CCP", id_questao: "q06" },
        { id_prova: "2014_ADS", id_questao: "q06" },
      ],
    },
    {
      setNumber: 11,
      label: "Semana 11",
      title: "Acessibilidade & Inclusão Social",
      topic: "Formação Geral e Sociedade",
      description: "Estatuto da Pessoa com Deficiência, desenho universal, tecnologias assistivas e inclusão educacional.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q01" },
        { id_prova: "2024_CCP", id_questao: "q02" },
        { id_prova: "2024_CCP", id_questao: "q03" },
        { id_prova: "2024_CCP", id_questao: "q05" },
      ],
    },
    {
      setNumber: 12,
      label: "Semana 12",
      title: "Educação, Cidadania & Práticas Pedagógicas",
      topic: "Formação Geral e Sociedade",
      description: "Direito à educação básica, alfabetização, transposição didática e compromisso social da formação.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2024_CCP", id_questao: "q08" },
        { id_prova: "2024_CCP", id_questao: "q09" },
        { id_prova: "2024_CCP", id_questao: "q12" },
        { id_prova: "2024_CCP", id_questao: "q15" },
      ],
    },
    {
      setNumber: 13,
      label: "Semana 13",
      title: "Questões Discursivas de Formação Geral",
      topic: "Formação Geral e Sociedade",
      description: "Análise de textos motivadores, argumentação estruturada, proposta de intervenção e escrita acadêmica.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "qd01" },
        { id_prova: "2021_CCP", id_questao: "qd02" },
        { id_prova: "2017_CCP", id_questao: "qd01" },
        { id_prova: "2017_CCP", id_questao: "qd02" },
      ],
    },
    {
      setNumber: 14,
      label: "Semana 14",
      title: "Simulado Integrador de Formação Geral",
      topic: "Formação Geral e Sociedade",
      description: "Revisão intensiva com os principais temas interdisciplinares cobrados nas edições do ENADE.",
      questionCount: 4,
      questionIds: [
        { id_prova: "2021_CCP", id_questao: "q01" },
        { id_prova: "2021_CCP", id_questao: "q03" },
        { id_prova: "2021_CCP", id_questao: "q06" },
        { id_prova: "2017_CCP", id_questao: "q01" },
      ],
    },
  ],
};

export const QUESTION_SETS = WEEKLY_SCHEDULES;

export const COURSE_METADATA: Record<string, {
  courseName: string;
  courseSlug: string;
  description: string;
  colorClass: string;
  accentBorder: string;
  iconName: string;
}> = {
  CCP: {
    courseName: "Ciência da Computação",
    courseSlug: "ccp",
    description: "Trilha completa de 14 semanas cobrindo Algoritmos, Estruturas de Dados, Compiladores, SO e Teoria.",
    colorClass: "from-blue-600 to-indigo-700",
    accentBorder: "border-blue-500/30",
    iconName: "BrainCircuit",
  },
  ADS: {
    courseName: "Análise e Des. de Sistemas",
    courseSlug: "ads",
    description: "Trilha de 14 semanas focada em Engenharia de Software, Requisitos, Modelagem, Banco de Dados e DevOps.",
    colorClass: "from-emerald-600 to-teal-700",
    accentBorder: "border-emerald-500/30",
    iconName: "Code2",
  },
  GTI: {
    courseName: "Gestão da TI",
    courseSlug: "gti",
    description: "Trilha de 14 semanas estruturada em Governança (ITIL/COBIT), Segurança, Gestão de Projetos e BI.",
    colorClass: "from-amber-600 to-orange-700",
    accentBorder: "border-amber-500/30",
    iconName: "ShieldCheck",
  },
  FG: {
    courseName: "Formação Geral & Sociedade",
    courseSlug: "fg",
    description: "Trilha transversal de 14 semanas cobrindo Ética, Direitos Humanos, Sustentabilidade e Diversidade.",
    colorClass: "from-purple-600 to-pink-700",
    accentBorder: "border-purple-500/30",
    iconName: "Sparkles",
  },
};

export function getWeeklySchedule(curso: string): WeeklyStudySet[] {
  const normalized = curso.toUpperCase();
  if (normalized === "FG" || normalized.includes("FORMA")) return WEEKLY_SCHEDULES.FG;
  if (normalized === "ADS") return WEEKLY_SCHEDULES.ADS;
  if (normalized === "GTI") return WEEKLY_SCHEDULES.GTI;
  if (normalized === "CCP") return WEEKLY_SCHEDULES.CCP;
  return WEEKLY_SCHEDULES.ADS;
}

export const getQuestionSetsForCourse = getWeeklySchedule;

export function getWeekStudySet(curso: string, setNumber: number): WeeklyStudySet | null {
  const schedule = getWeeklySchedule(curso);
  return schedule.find((s) => s.setNumber === setNumber) || null;
}

export function getQuestionSetByNumber(curso: string, setNumber: number): WeeklyStudySet | undefined {
  const set = getWeekStudySet(curso, setNumber);
  return set || undefined;
}
