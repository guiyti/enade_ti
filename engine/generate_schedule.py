import json
from pathlib import Path

WORKSPACE_ROOT = Path(__file__).resolve().parent.parent
EXAMS_JSON_PATH = WORKSPACE_ROOT / "public" / "data" / "exams.json"
WEEKLY_SCHEDULE_PATH = WORKSPACE_ROOT / "src" / "lib" / "weeklySchedule.ts"

with open(EXAMS_JSON_PATH, "r", encoding="utf-8") as f:
    exams = json.load(f)

exam_map = {(e["id_prova"], q["id_questao"]): q for e in exams for q in e["questoes"]}

schedules = {
    "GTI": [
        ("Governança e Gestão de TI", "Governança Corporativa & Alinhamento Estratégico", "Princípios da Governança de TI, ISO/IEC 38500, alinhamento estratégico e tomada de decisão.",
         [("2021_GTI", "q27"), ("2021_GTI", "q33"), ("2017_GTI", "q24"), ("2017_GTI", "q09")]),
        ("Governança e Gestão de TI", "Gerenciamento de Serviços de TI (ITIL)", "Ciclo de vida de serviços, catálogo de serviços, SLA, Acordo de Nível Operacional e Gerenciamento de Incidentes.",
         [("2021_GTI", "q21"), ("2021_GTI", "q22"), ("2021_GTI", "q23"), ("2017_GTI", "q14")]),
        ("Governança e Gestão de TI", "Governança de TI com COBIT", "Estrutura COBIT, objetivos de controle, domínios de governança e gestão (EDM, APO, BAI, DSS, MEA).",
         [("2021_GTI", "q31"), ("2017_GTI", "q22"), ("2021_GTI", "q34"), ("2017_GTI", "q17")]),
        ("Segurança da Informação", "Segurança da Informação & Gestão de Riscos", "Família ISO/IEC 27000, políticas de segurança corporativa, análise de vulnerabilidades e classificação de ativos.",
         [("2021_GTI", "q26"), ("2017_GTI", "q12"), ("2017_GTI", "q30"), ("2017_GTI", "q23")]),
        ("Governança e Gestão de TI", "Gestão por Processos & Notação BPMN", "Modelagem, análise e melhoria de processos de negócio com BPMN, pools, lanes, eventos e gateways.",
         [("2021_GTI", "q28"), ("2021_GTI", "q30"), ("2017_GTI", "q18"), ("2017_GTI", "q25")]),
        ("Governança e Gestão de TI", "Gerenciamento de Projetos de TI (PMBOK)", "Áreas de conhecimento do PMBOK, Termo de Abertura (TAP), EAP, caminho crítico e gerenciamento de partes interessadas.",
         [("2021_GTI", "q29"), ("2017_GTI", "q13"), ("2017_GTI", "q21"), ("2014_ADS", "q09")]),
        ("Governança e Gestão de TI", "Continuidade de Negócios & Recuperação (DRP)", "Plano de Continuidade de Negócios (PCN), Disaster Recovery Plan (DRP), RTO, RPO e redundância de data centers.",
         [("2017_GTI", "q26"), ("2017_GTI", "q34"), ("2017_GTI", "q35"), ("2021_GTI", "q34")]),
        ("Governança e Gestão de TI", "Auditoria de TI, Compliance & Controles Internos", "Normas de auditoria de sistemas, conformidade regulatória, segregação de funções e rastreabilidade.",
         [("2021_GTI", "q35"), ("2017_GTI", "q35"), ("2017_GTI", "q26"), ("2017_GTI", "q34")]),
        ("Governança e Gestão de TI", "Sistemas de Informações Gerenciais & ERP", "Sistemas ERP, CRM, SCM, arquitetura transacional corporativa e integração de módulos departamentais.",
         [("2021_GTI", "q18"), ("2017_GTI", "q19"), ("2008_CCP", "q64"), ("2021_GTI", "q27")]),
        ("Governança e Gestão de TI", "Business Intelligence & Apoio à Decisão", "Data Warehouse, modelagem dimensional (Star Schema/Snowflake), ETL, cubos OLAP e suporte à decisão executiva.",
         [("2017_GTI", "q10"), ("2021_GTI", "q18"), ("2021_GTI", "q33"), ("2017_GTI", "q24")]),
        ("Redes de Computadores", "Infraestrutura de TI, Redes & Conectividade", "Topologias corporativas, modelo TCP/IP, switches, roteamento, VLANs, Wi-Fi e monitoramento de conectividade.",
         [("2021_GTI", "q12"), ("2017_GTI", "q11"), ("2017_GTI", "q33"), ("2021_CCP", "q21")]),
        ("Banco de Dados", "Bancos de Dados & Decisão Tecnológica", "Modelo relacional, integridade referencial, consultas SQL estruturadas e tomada de decisão sobre armazenamento.",
         [("2021_GTI", "q14"), ("2014_ADS", "q11"), ("2014_ADS", "q21"), ("2014_ADS", "q22")]),
        ("Engenharia de Software", "Engenharia de Software & Contratação de TI", "Métricas de software, SLA de fornecedores, modelos de ciclo de vida e aquisição de soluções.",
         [("2021_GTI", "q11"), ("2021_GTI", "q13"), ("2021_GTI", "q25"), ("2017_GTI", "q20")]),
        ("Governança e Gestão de TI", "Revisão Geral do Tecnólogo em GTI", "Simulado integrador das competências nucleares de Governança, ITIL, COBIT, Segurança e Gestão de Projetos.",
         [("2021_GTI", "q21"), ("2021_GTI", "q27"), ("2021_GTI", "q29"), ("2021_GTI", "q35")]),
    ],
    "ADS": [
        ("Engenharia de Software", "Engenharia de Requisitos & Elicitação", "Requisitos funcionais e não-funcionais, técnicas de elicitação (entrevistas, prototipação) e validação.",
         [("2021_ADS", "q09"), ("2021_ADS", "q18"), ("2014_ADS", "q19"), ("2011_ADS", "q09")]),
        ("Engenharia de Software", "Metodologias Ágeis (Scrum, Kanban & XP)", "Valores ágeis, papéis no Scrum (PO, SM, Devs), cerimônias, artefatos, histórias de usuário e Kanban.",
         [("2021_ADS", "q19"), ("2021_ADS", "q21"), ("2014_ADS", "q24"), ("2011_ADS", "q27")]),
        ("Engenharia de Software", "Modelagem Orientada a Objetos com UML", "Diagrama de Classes, Diagrama de Sequência, Diagrama de Casos de Uso, Diagrama de Atividades e Estados.",
         [("2021_ADS", "q16"), ("2017_ADS", "q16"), ("2014_ADS", "q17"), ("2011_ADS", "q12")]),
        ("Engenharia de Software", "Padrões de Projeto (Design Patterns GoF)", "Padrões criacionais (Singleton, Factory Method), estruturais (Adapter, Decorator) e comportamentais (Observer, Strategy).",
         [("2021_ADS", "q24"), ("2014_ADS", "q25"), ("2014_ADS", "q29"), ("2011_ADS", "q20")]),
        ("Programação e POO", "Programação Orientada a Objetos (POO)", "Encapsulamento, herança, polimorfismo, interfaces, classes abstratas, instanciação e tratamento de exceções.",
         [("2021_CCP", "q33"), ("2011_ADS", "q21"), ("2011_ADS", "q35"), ("2005_CCP", "q21")]),
        ("Banco de Dados", "Modelagem Conceitual & Diagrama ER (DER)", "Entidades, atributos, relacionamentos, cardinalidades (1:1, 1:N, N:N) e mapeamento para modelo relacional.",
         [("2021_ADS", "q17"), ("2017_ADS", "q32"), ("2011_ADS", "q23"), ("2021_CCP", "q22")]),
        ("Banco de Dados", "SQL Avançado & Formas Normais (1FN a 3FN)", "Consultas DML (SELECT, JOIN, GROUP BY, subconsultas), DDL, integridade referencial e dependências funcionais.",
         [("2014_ADS", "q11"), ("2014_ADS", "q18"), ("2014_ADS", "q21"), ("2011_ADS", "q22")]),
        ("Engenharia de Software", "Qualidade & Testes de Software", "Testes unitários, testes de integração, testes de aceitação, caixa-preta, caixa-branca, TDD e refatoração.",
         [("2021_ADS", "q25"), ("2014_ADS", "q33"), ("2011_ADS", "q25"), ("2011_ADS", "q30")]),
        ("Engenharia de Software", "Arquitetura de Software & Serviços Web", "Padrões arquiteturais (MVC, Microsserviços), APIs RESTful, JSON, desacoplamento e interoperabilidade.",
         [("2014_ADS", "q12"), ("2014_ADS", "q15"), ("2014_ADS", "q28"), ("2011_ADS", "q14")]),
        ("Engenharia de Software", "DevOps, Manutenção & Gerência de Configuração", "Controle de versão com Git, integração contínua (CI/CD), gerência de configuração e manutenção corretiva/evolutiva.",
         [("2014_ADS", "q30"), ("2011_ADS", "q18"), ("2011_ADS", "q24"), ("2011_ADS", "q32")]),
        ("Segurança da Informação", "Segurança da Informação em Aplicações", "Proteção contra vulnerabilidades OWASP (SQL Injection, XSS), autenticação, controle de acesso e criptografia.",
         [("2014_ADS", "q13"), ("2021_GTI", "q26"), ("2017_GTI", "q12"), ("2017_GTI", "q30")]),
        ("Engenharia de Software", "Interação Humano-Computador (IHC) & UX", "Heurísticas de usabilidade de Nielsen, acessibilidade web (WCAG), design centrado no usuário e avaliação de interfaces.",
         [("2014_ADS", "q28"), ("2011_ADS", "q15"), ("2011_CCP", "q48"), ("2014_ADS", "q32")]),
        ("Algoritmos e Estruturas de Dados", "Algoritmos, Estruturas de Dados & Complexidade", "Pilhas, filas, listas encadeadas, recursão, busca binária e complexidade assintótica de operações.",
         [("2014_ADS", "q14"), ("2014_ADS", "q16"), ("2014_ADS", "q20"), ("2011_ADS", "q29")]),
        ("Engenharia de Software", "Revisão Geral do Tecnólogo em ADS", "Simulado integrador das competências nucleares de Engenharia de Software, Requisitos e Modelagem.",
         [("2021_ADS", "q09"), ("2021_ADS", "q16"), ("2021_ADS", "q19"), ("2021_ADS", "q25")]),
    ],
    "CCP": [
        ("Algoritmos e Estruturas de Dados", "Algoritmos & Complexidade Assintótica", "Análise de complexidade temporal e espacial, notação Big-O, limites assintóticos e recursão.",
         [("2021_CCP", "q10"), ("2017_CCP", "q18"), ("2014_CCP", "q12"), ("2011_CCP", "q28")]),
        ("Algoritmos e Estruturas de Dados", "Estruturas de Dados Avançadas (Árvores & Listas)", "Árvores Binárias de Busca, árvores balanceadas AVL, manipulação de nós e percursos em árvores.",
         [("2017_CCP", "q09"), ("2014_CCP", "q13"), ("2014_CCP", "q16"), ("2011_CCP", "q30")]),
        ("Algoritmos e Estruturas de Dados", "Teoria dos Grafos & Algoritmos Clássicos", "Grafos direcionados/não-direcionados, busca em largura (BFS), profundidade (DFS), Dijkstra e Árvore Geradora Mínima.",
         [("2021_CCP", "q34"), ("2017_CCP", "q24"), ("2011_CCP", "q20"), ("2014_CCP", "q30")]),
        ("Teoria da Computação e Compiladores", "Teoria da Computação, Autômatos & Linguagens Formais", "Autômatos finitos (AFD/AFND), expressões regulares, gramáticas livres de contexto e máquinas de Turing.",
         [("2011_CCP", "q23"), ("2008_CCP", "q22"), ("2005_CCP", "q63"), ("2005_CCP", "q64")]),
        ("Teoria da Computação e Compiladores", "Compiladores & Análise Sintática", "Fases de compilação, análise léxica, análise sintática descendente/preditiva, gramáticas e tabela de símbolos.",
         [("2021_CCP", "q30"), ("2017_CCP", "q30"), ("2005_CCP", "q65"), ("2008_CCP", "q29")]),
        ("Programação e POO", "Paradigmas de Programação & POO", "Programação orientada a objetos, polimorfismo, tipos abstratos de dados, paradigma funcional e lógico (Prolog).",
         [("2021_CCP", "q33"), ("2005_CCP", "q21"), ("2005_CCP", "q79"), ("2024_CCP", "q32")]),
        ("Sistemas Operacionais", "Sistemas Operacionais & Gerenciamento de Processos", "Processos e threads, estados de processos, multiprogramação, troca de contexto e exclusão mútua.",
         [("2021_CCP", "q09"), ("2017_CCP", "q31"), ("2014_CCP", "q20"), ("2005_CCP", "q53")]),
        ("Sistemas Operacionais", "Memória Virtual & Sistemas de Arquivos", "Paginação simples, tabela de páginas, algoritmos de substituição de páginas (FIFO, LRU), page faults e sistemas de arquivos.",
         [("2017_CCP", "q29"), ("2014_CCP", "q11"), ("2005_CCP", "q22"), ("2008_CCP", "q19")]),
        ("Arquitetura e Organização de Computadores", "Arquitetura de Computadores & Pipeline", "Hierarquia de memória (cache L1/L2/L3), pipeline de instruções, hazards de controle/dados e arquitetura RISC/CISC.",
         [("2021_CCP", "q28"), ("2014_CCP", "q33"), ("2011_CCP", "q44"), ("2005_CCP", "q75")]),
        ("Redes de Computadores", "Redes de Computadores & Protocolos TCP/IP", "Camadas do modelo OSI e TCP/IP, endereçamento IP, sub-redes, roteamento, portas TCP/UDP e comutação de pacotes.",
         [("2021_CCP", "q21"), ("2017_CCP", "q20"), ("2008_CCP", "q35"), ("2005_CCP", "q33")]),
        ("Segurança da Informação", "Segurança da Informação & Criptografia", "Criptografia de chave pública/privada (RSA), certificados digitais, integridade de dados e defesas contra ataques virtuais.",
         [("2021_CCP", "q12"), ("2021_CCP", "q24"), ("2017_CCP", "q15"), ("2017_CCP", "q16")]),
        ("Banco de Dados", "Bancos de Dados & Modelagem Relacional", "Modelo relacional, mapeamento DER para tabelas relacionais, integridade referencial, normalização e consultas SQL.",
         [("2021_CCP", "q22"), ("2024_CCP", "q41"), ("2008_CCP", "q44"), ("2005_CCP", "q59")]),
        ("Inteligência Artificial e Dados", "Inteligência Artificial & Aprendizado de Máquina", "Busca heurística (A*, 8-puzzle), redes neurais artificiais, aprendizado supervisionado e mineração de dados.",
         [("2021_CCP", "q11"), ("2021_CCP", "q18"), ("2008_CCP", "q31"), ("2008_CCP", "q51")]),
        ("Algoritmos e Estruturas de Dados", "Revisão Geral do Bacharelado em Computação", "Simulado integrador das competências nucleares de Algoritmos, Grafos e Estruturas de Dados.",
         [("2021_CCP", "q10"), ("2021_CCP", "q34"), ("2017_CCP", "q18"), ("2014_CCP", "q12")]),
    ],
    "FG": [
        ("Formação Geral e Sociedade", "Ética, Democracia & Cidadania", "Direitos humanos, princípios republicanos, ética profissional e cidadania participativa na era digital.",
         [("2021_CCP", "q01"), ("2021_ADS", "q01"), ("2021_GTI", "q01"), ("2017_CCP", "q01")]),
        ("Formação Geral e Sociedade", "Direitos Humanos & Cidadania Global", "Garantias fundamentais, declaração universal dos direitos humanos e justiça social.",
         [("2021_CCP", "q02"), ("2021_ADS", "q02"), ("2021_GTI", "q02"), ("2017_ADS", "q01")]),
        ("Formação Geral e Sociedade", "Sustentabilidade & Meio Ambiente", "Desenvolvimento sustentável, matriz energética, mudanças climáticas e conservação de recursos naturais.",
         [("2021_CCP", "q03"), ("2021_ADS", "q03"), ("2021_GTI", "q03"), ("2017_CCP", "q03")]),
        ("Formação Geral e Sociedade", "Políticas Públicas & Desigualdade Social", "Inclusão social, distribuição de renda, políticas redistributivas e direitos fundamentais.",
         [("2021_CCP", "q04"), ("2021_ADS", "q04"), ("2021_GTI", "q04"), ("2017_ADS", "q04")]),
        ("Formação Geral e Sociedade", "Relações Étnico-Raciais & Diversidade Cultural", "Políticas afirmativas, igualdade racial, direitos dos povos originários e valorização da diversidade cultural.",
         [("2024_CCP", "q04"), ("2024_CCP", "q10"), ("2024_CCP", "q27"), ("2017_ADS", "q06")]),
        ("Formação Geral e Sociedade", "Cultura Digital & Impactos Sociais da Tecnologia", "Transformação digital, exclusão digital, inteligência artificial na sociedade e soberania de dados.",
         [("2021_CCP", "q06"), ("2021_ADS", "q06"), ("2021_GTI", "q06"), ("2017_CCP", "q06")]),
        ("Formação Geral e Sociedade", "Trabalho, Tecnologia & Economia Contemporânea", "Novas relações laborais, automação do trabalho, economia de plataformas e qualificação profissional.",
         [("2021_CCP", "q07"), ("2021_ADS", "q07"), ("2021_GTI", "q07"), ("2017_ADS", "q07")]),
        ("Formação Geral e Sociedade", "Arte, Patrimônio Cultural & Sociedade", "Expressões artísticas contemporâneas, patrimônio material e imaterial e memória coletiva brasileira.",
         [("2021_CCP", "q08"), ("2021_ADS", "q08"), ("2021_GTI", "q08"), ("2017_CCP", "q08")]),
        ("Formação Geral e Sociedade", "Saúde Pública, Bem-estar & Qualidade de Vida", "Sistema Único de Saúde (SUS), vigilância sanitária, saúde mental e saneamento básico.",
         [("2014_CCP", "q03"), ("2014_ADS", "q03"), ("2014_CCP", "q07"), ("2014_ADS", "q07")]),
        ("Formação Geral e Sociedade", "Ciência, Tecnologia & Sociedade (CTS)", "Produção científica nacional, método científico, inovação e responsabilidade social da ciência.",
         [("2014_CCP", "q05"), ("2014_ADS", "q05"), ("2014_CCP", "q06"), ("2014_ADS", "q06")]),
        ("Formação Geral e Sociedade", "Acessibilidade & Inclusão Social", "Estatuto da Pessoa com Deficiência, desenho universal, tecnologias assistivas e inclusão educacional.",
         [("2024_CCP", "q01"), ("2024_CCP", "q02"), ("2024_CCP", "q03"), ("2024_CCP", "q05")]),
        ("Formação Geral e Sociedade", "Educação, Cidadania & Práticas Pedagógicas", "Direito à educação básica, alfabetização, transposição didática e compromisso social da formação.",
         [("2024_CCP", "q08"), ("2024_CCP", "q09"), ("2024_CCP", "q12"), ("2024_CCP", "q15")]),
        ("Formação Geral e Sociedade", "Questões Discursivas de Formação Geral", "Análise de textos motivadores, argumentação estruturada, proposta de intervenção e escrita acadêmica.",
         [("2021_CCP", "qd01"), ("2021_CCP", "qd02"), ("2017_CCP", "qd01"), ("2017_CCP", "qd02")]),
        ("Formação Geral e Sociedade", "Simulado Integrador de Formação Geral", "Revisão intensiva com os principais temas interdisciplinares cobrados nas edições do ENADE.",
         [("2021_CCP", "q01"), ("2021_CCP", "q03"), ("2021_CCP", "q06"), ("2017_CCP", "q01")]),
    ]
}

# Validation assertions
for course, weeks in schedules.items():
    for topic, title, desc, qs in weeks:
        for p, q_id in qs:
            key = (p, q_id)
            assert key in exam_map, f"Missing {key}"
            cats = exam_map[key]["categorias"]
            assert topic in cats, f"[{course}] {title} -> {key} expected {topic}, got {cats}"

print("All 56 weeks verified with 0 mismatches!")

ts_lines = ["""export interface QuestionReference {
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

export const WEEKLY_SCHEDULES: CourseSets = {"""]

for course, weeks in schedules.items():
    ts_lines.append(f"  {course}: [")
    for i, (topic, title, desc, qs) in enumerate(weeks, 1):
        ts_lines.append("    {")
        ts_lines.append(f"      setNumber: {i},")
        ts_lines.append(f"      label: \"Semana {i:02d}\",")
        ts_lines.append(f"      title: \"{title}\",")
        ts_lines.append(f"      topic: \"{topic}\",")
        ts_lines.append(f"      description: \"{desc}\",")
        ts_lines.append(f"      questionCount: {len(qs)},")
        ts_lines.append("      questionIds: [")
        for p, q_id in qs:
            ts_lines.append(f"        {{ id_prova: \"{p}\", id_questao: \"{q_id}\" }},")
        ts_lines.append("      ],")
        ts_lines.append("    },")
    ts_lines.append("  ],")

ts_lines.append("""};

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
""")

with open(WEEKLY_SCHEDULE_PATH, "w", encoding="utf-8") as f:
    f.write("\n".join(ts_lines))

print(f"Successfully written aligned schedule to {WEEKLY_SCHEDULE_PATH}")

