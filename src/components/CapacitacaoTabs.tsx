"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  HelpCircle, 
  Calendar, 
  CheckCircle2, 
  Award, 
  FileText, 
  Scale, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Layers, 
  GraduationCap, 
  Maximize2,
  X,
  ExternalLink,
  Download,
  Mail,
  Globe,
  Code2,
  Boxes,
  ShieldAlert,
  Sparkles,
  Cpu,
  Database,
  Network,
  BrainCircuit,
  Terminal,
  Check,
  Copy,
  Info
} from "lucide-react";
import { ZoomableImage } from "@/components/ZoomableImage";

export function CapacitacaoTabs() {
  const [activeTab, setActiveTab] = useState<
    "comunicado" | "portarias" | "questionario" | "cronograma" | "legislacao_faq"
  >("comunicado");

  // Checklist interativo persistido no localStorage
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("enade_checklist_progresso");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = (id: string) => {
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("enade_checklist_progresso", JSON.stringify(next));
    }
  };

  // FAQ Search & Open Accordion
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modal Zoom para Imagens
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Copy Feedback
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("coordenacaoinformatica@cruzeirodosul.edu.br");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const faqItems = [
    {
      q: "O que é o ENADE e qual a sua base legal?",
      a: "O Exame Nacional de Desempenho dos Estudantes (ENADE) é um componente curricular obrigatório instituído pela Lei Federal nº 10.861/2004 (SINAES). Ele avalia o rendimento dos concluintes em relação aos conteúdos programáticos, competências e habilidades das diretrizes curriculares nacionais.",
    },
    {
      q: "O estudante precisa pagar taxa ou se inscrever?",
      a: "Não! A inscrição é 100% gratuita e realizada diretamente pela coordenação do curso e procuradores institucionais da instituição de ensino no sistema oficial do Inep.",
    },
    {
      q: "O que acontece se o estudante não responder ao Questionário do Estudante?",
      a: "O preenchimento do Questionário do Estudante no sistema do Inep (via Gov.br) é estritamente obrigatório por lei. O estudante que não preencher fica impedido de acessar o Cartão de Confirmação de Local de Prova e fica em situação irregular perante o MEC, não podendo colar grau nem emitir seu diploma.",
    },
    {
      q: "Qual é o prazo para solicitar Atendimento Especializado ou Nome Social?",
      a: "Conforme o Edital nº 49/2026 e o cronograma oficial do Inep, as solicitações de atendimento especializado (prova em braille, ampliada, tempo adicional, ledor) e tratamento pelo nome social devem ser enviadas com laudo no sistema de 01/06/2026 até 24/07/2026. O resultado sai em 31/07/2026, com período de recursos de 03 a 07/08/2026.",
    },
    {
      q: "Como a nota do ENADE impacta o diploma e a carreira do estudante?",
      a: "O Conceito Enade e o CPC (Conceito Preliminar de Curso) são os principais índices públicos de qualidade do MEC. Empresas, recrutadores e programas de pós-graduação consultam essas notas. Cursos com notas 4 e 5 conferem alto prestígio e valorização de mercado ao diploma do egresso.",
    },
    {
      q: "Qual é a estrutura da Prova do ENADE 2026 para os cursos de TI?",
      a: "A prova tem duração total de 4 horas e é composta por: (1) Componente de Formação Geral (15 questões objetivas de ética, sociedade, sustentabilidade e tecnologia - Portaria 154); (2) Componente Específico da Área (30 questões objetivas + 1 questão discursiva baseada nas diretrizes do curso - Portaria 157 para Ciência da Computação, Portaria 169 para ADS e Portaria 171 para GTI).",
    },
    {
      q: "Qual é a data e o horário oficial de aplicação da prova?",
      a: "A prova será aplicada no dia 29 de novembro de 2026 (domingo). Os portões abrem às 12h00 e fecham pontualmente às 13h00 (horário de Brasília). A prova inicia às 13h30 e tem permanência mínima obrigatória de 2 horas em sala.",
    },
    {
      q: "Quais materiais são permitidos no dia do exame?",
      a: "É obrigatório levar caneta esferográfica de tinta PRETA fabricada em material transparente e documento de identificação original com foto oficial (físico ou digital reconhecido como e-Título/CNH Digital). É recomendável levar água em garrafa transparente e lanche leve.",
    },
    {
      q: "É possível sair com o caderno de provas?",
      a: "Sim, mas somente nos últimos 30 minutos antes do encerramento oficial da prova (após as 17h00).",
    },
    {
      q: "Como o estudante tem acesso ao seu local de prova?",
      a: "O Cartão de Confirmação da Inscrição com o endereço da sala e escola de realização do exame será disponibilizado pelo Inep em novembro na página enade.inep.gov.br, exclusivamente para quem concluiu o Questionário do Estudante.",
    },
    {
      q: "Em que casos é possível solicitar dispensa de prova?",
      a: "A dispensa de prova só é aceita pelo Inep após o exame mediante requerimento fundamentado em motivos de força maior devidamente comprovados por atestado médico ou certidões legais, nos prazos estipulados no edital oficial.",
    },
  ];

  const filteredFaq = useMemo(() => {
    if (!faqSearch.trim()) return faqItems;
    const q = faqSearch.toLowerCase();
    return faqItems.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [faqSearch, faqItems]);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 p-8 sm:p-10 text-white shadow-xl border border-sky-900/40">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Guia Oficial dos Concluintes · Universidade Cruzeiro do Sul</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Entenda o <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400">ENADE 2026</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Orientações oficiais de convocação para os estudantes de TI, matrizes de referência das Portarias Inep/MEC (Ciência da Computação, ADS, GTI e Formação Geral), prazos regulatórios e Questionário do Estudante.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://enade.inep.gov.br/enade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              <span>Acessar Sistema ENADE (Gov.br)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-sky-300 border border-sky-400/20 font-bold text-xs transition-all"
            >
              <Scale className="w-3.5 h-3.5 text-sky-400" />
              <span>Portal de Legislação do INEP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("comunicado")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "comunicado"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Info className="w-4 h-4" />
          <span>1. Convocação & Comunicado Oficial</span>
        </button>

        <button
          onClick={() => setActiveTab("portarias")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "portarias"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>2. Portarias & Matriz de Prova (CCP, ADS, GTI, FG)</span>
        </button>

        <button
          onClick={() => setActiveTab("questionario")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "questionario"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Questionário do Estudante</span>
        </button>

        <button
          onClick={() => setActiveTab("cronograma")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "cronograma"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>4. Cronograma Oficial & Checklist</span>
        </button>

        <button
          onClick={() => setActiveTab("legislacao_faq")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "legislacao_faq"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>5. Legislação, Downloads & FAQ</span>
        </button>
      </div>

      {/* TAB 1: COMUNICADO OFICIAL AOS CONCLUINTES */}
      {activeTab === "comunicado" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Card Principal do Comunicado */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-sky-300 dark:border-sky-800 bg-white dark:bg-slate-900 p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-900">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    Comunicado Oficial da Coordenação de TI
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Universidade Cruzeiro do Sul · Convocação ENADE 2026
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
                  title="Copiar e-mail da coordenação"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedEmail ? "E-mail copiado!" : "Copiar E-mail"}</span>
                </button>
              </div>
            </div>

            {/* Texto Formal com Destaques */}
            <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white">
                Os acadêmicos concluintes dos cursos de <strong className="text-sky-600 dark:text-sky-400">Ciência da Computação (Bacharelado)</strong>, <strong className="text-emerald-600 dark:text-emerald-400">Análise e Desenvolvimento de Sistemas (ADS)</strong> e <strong className="text-purple-600 dark:text-purple-400">Gestão da Tecnologia da Informação (GTI)</strong> da <strong>Universidade Cruzeiro do Sul</strong>, habilitados a participarem do <strong>Exame Nacional de Desempenho dos Estudantes 2026 (Enade 2026)</strong>, devem acessar o{" "}
                <a
                  href="https://enade.inep.gov.br/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500"
                >
                  sistema Enade <ExternalLink className="w-3.5 h-3.5 inline" />
                </a>{" "}
                por meio do site{" "}
                <a
                  href="https://enade.inep.gov.br/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 dark:text-sky-400 underline font-bold hover:text-sky-500"
                >
                  enade.inep.gov.br/enade
                </a>{" "}
                e cumprir as seguintes etapas:
              </p>

              {/* Grid das 4 Etapas Obrigatórias */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Preencher o cadastro do estudante</h4>
                  </div>
                  <div className="pl-8 text-xs font-semibold text-sky-700 dark:text-sky-300">
                    Período: <strong>01/06/2026 a 29/11/2026</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Solicitar atendimento especializado (se necessário)</h4>
                  </div>
                  <div className="pl-8 text-xs font-semibold text-amber-800 dark:text-amber-300">
                    Período: <strong>01/06/2026 a 24/07/2026</strong> (com laudo)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Optar pelo uso do nome social (se for o caso)</h4>
                  </div>
                  <div className="pl-8 text-xs font-semibold text-purple-800 dark:text-purple-300">
                    Período: <strong>01/06/2026 a 24/07/2026</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">4</span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">Responder ao Questionário do Estudante</h4>
                  </div>
                  <div className="pl-8 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    Período: <strong>01/06/2026 a 29/11/2026</strong> (Obrigatório)
                  </div>
                </div>
              </div>

              {/* Informações detalhadas do Questionário */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  O <strong>Questionário do Estudante</strong> é destinado a coletar informações que permitam caracterizar o perfil dos estudantes e o contexto de seus processos formativos, as quais são relevantes para a compreensão dos resultados dos estudantes no Enade e para subsidiar os processos de avaliação dos cursos de graduação e das IES.
                </p>
              </div>

              {/* Box de Prazos de Atendimento Especializado e Recursos */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Cronograma de Resultados e Recursos do Atendimento Especializado:</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed pl-6">
                  O resultado da solicitação de atendimento especializado será divulgado no dia <strong>31 de julho de 2026</strong>. Em caso de indeferimento pelo <strong>Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira (INEP)</strong>, será possível apresentar recurso no período de <strong>3 a 7 de agosto de 2026</strong>, com resultado do recurso previsto para ser divulgado em <strong>14 de agosto de 2026</strong>.
                </p>
              </div>

              {/* Responsabilidade e Contato */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-sky-900 to-indigo-950 text-white shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wide">
                    Responsabilidade do Estudante
                  </span>
                  <p className="text-xs sm:text-sm text-slate-200">
                    É de responsabilidade dos estudantes concluintes habilitados a participarem do Enade 2026, acompanhar e cumprir os prazos e procedimentos relacionados ao Exame.
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:items-end gap-1">
                  <span className="text-xs text-slate-400">Canal direto de dúvidas:</span>
                  <a
                    href="mailto:coordenacaoinformatica@cruzeirodosul.edu.br"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs transition-all shadow-md"
                  >
                    <Mail className="w-4 h-4" />
                    <span>coordenacaoinformatica@cruzeirodosul.edu.br</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Cards Rápidos com os 3 Cursos Convocados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CCP */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-blue-200 dark:border-blue-900/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                  Bacharelado · Portaria nº 157/2026
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Ciência da Computação
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Algoritmos avançados, complexidade, arquitetura, compiladores, inteligência artificial e engenharia de software.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>30 Obj + 1 Disc + 15 FG</span>
                <span>4 Horas</span>
              </div>
            </div>

            {/* ADS */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Tecnologia · Portaria nº 169/2026
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Análise e Desenvolvimento
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Engenharia de requisitos, UML, bancos de dados relacionais e SQL, metodologias ágeis (Scrum) e qualidade de software.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>30 Obj + 1 Disc + 15 FG</span>
                <span>4 Horas</span>
              </div>
            </div>

            {/* GTI */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-purple-200 dark:border-purple-900/60 p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                  Tecnologia · Portaria nº 171/2026
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                  Gestão da TI
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Governança de TI (ITIL, COBIT), segurança da informação e LGPD, planejamento estratégico e inteligência de negócio.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                <span>30 Obj + 1 Disc + 15 FG</span>
                <span>4 Horas</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PORTARIAS & MATRIZES DE PROVA */}
      {activeTab === "portarias" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Apresentação das Portarias */}
          <div className="bg-slate-50 dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Scale className="w-6 h-6 text-sky-600" />
                  Diretrizes Oficiais das Portarias INEP 2026
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                  As matrizes de prova do ENADE 2026 foram publicadas no Diário Oficial da União (DOU) em abril de 2026. Abaixo estão as competências e eixos temáticos exigidos para cada curso.
                </p>
              </div>

              <a
                href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 shadow-md transition-all"
              >
                <span>Ver Portarias no Portal INEP</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Grid dos 4 Componentes Normativos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CCP - Portaria 157 */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-blue-300 dark:border-blue-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                      <Code2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        Portaria Inep nº 157 / 2026
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                        Ciência da Computação (Bacharelado)
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">CCP</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Perfil & Competências Avaliadas:
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                      Capacidade de modelar matematicamente problemas computacionais, desenvolver e analisar algoritmos e estruturas de dados com rigor assintótico, projetar arquiteturas de software escaláveis e atuar com visão inovadora em IA, sistemas distribuídos e segurança.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400">
                      Objetos de Conhecimento Nucleares:
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 text-xs mt-1.5 list-disc list-inside">
                      <li>Algoritmos & Complexidade (Big-O)</li>
                      <li>Árvores, Grafos e Estruturas de Dados</li>
                      <li>Teoria da Computação e Autômatos</li>
                      <li>Compiladores e Análise Sintática</li>
                      <li>Banco de Dados e Transações ACID</li>
                      <li>Sistemas Operacionais & Concorrência</li>
                      <li>Arquitetura e Organização de CPUs</li>
                      <li>Redes de Computadores e TCP/IP</li>
                      <li>Inteligência Artificial e Machine Learning</li>
                      <li>Criptografia e Segurança Cibernética</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <span>Estrutura: 30 Questões Obj + 1 Discursiva</span>
                    <a
                      href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-500 inline-flex items-center gap-1"
                    >
                      <span>Texto no DOU</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* ADS - Portaria 169 */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-300 dark:border-emerald-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Boxes className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Portaria Inep nº 169 / 2026
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                        Análise e Des. de Sistemas (ADS)
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">ADS</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Perfil & Competências Avaliadas:
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                      Capacidade de analisar requisitos de negócio, arquitetar e implementar programas aplicando métodos ágeis (Scrum/Kanban), modelagem UML, testes automatizados, integração contínua e padrões de arquitetura de software modernos.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                      Objetos de Conhecimento Nucleares:
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 text-xs mt-1.5 list-disc list-inside">
                      <li>Engenharia de Requisitos & Histórias</li>
                      <li>Modelagem UML e Orientação a Objetos</li>
                      <li>Padrões de Projeto (Design Patterns)</li>
                      <li>Bancos de Dados Relacionais e SQL</li>
                      <li>Qualidade, Testes (TDD) e V&V</li>
                      <li>Gerência de Configuração e Git/CI-CD</li>
                      <li>Interação Humano-Computador (IHC)</li>
                      <li>Arquitetura REST e Web Services</li>
                      <li>Princípios de Segurança e LGPD</li>
                      <li>Gerência de Projetos e DevOps</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <span>Estrutura: 30 Questões Obj + 1 Discursiva</span>
                    <a
                      href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500 inline-flex items-center gap-1 font-bold"
                    >
                      <span>Texto Oficial Online (Gov.br / DOU)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* GTI - Portaria 171 */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-300 dark:border-purple-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Portaria Inep nº 171 / 2026
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                        Gestão da Tecnologia da Informação (GTI)
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">GTI</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400">
                      Perfil & Competências Avaliadas:
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                      Capacidade de estruturar e gerenciar recursos tecnológicos alinhados aos objetivos organizacionais, aplicando frameworks de governança, gestão de serviços, conformidade regulatória (LGPD), planos de continuidade e segurança da informação.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-purple-600 dark:text-purple-400">
                      Objetos de Conhecimento Nucleares:
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 text-xs mt-1.5 list-disc list-inside">
                      <li>Governança de TI (ITIL 4, COBIT)</li>
                      <li>Segurança da Informação e LGPD</li>
                      <li>Planejamento Estratégico de TI (PETI)</li>
                      <li>Gestão de Riscos e Continuidade (PCN)</li>
                      <li>Gerência de Projetos de TI (PMBOK/Ágil)</li>
                      <li>Sistemas de Informações Gerenciais (SIG)</li>
                      <li>Business Intelligence (BI) e Analytics</li>
                      <li>Acordos de Nível de Serviço (SLA)</li>
                      <li>Auditoria e Conformidade de Sistemas</li>
                      <li>Ética, Tecnologia e Gestão de Pessoas</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <span>Estrutura: 30 Questões Obj + 1 Discursiva</span>
                    <a
                      href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 dark:text-purple-400 underline hover:text-purple-500 inline-flex items-center gap-1 font-bold"
                    >
                      <span>Texto Oficial Online (Gov.br / DOU)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Formação Geral - Portaria 154 */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-teal-300 dark:border-teal-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                        Portaria Inep nº 154 / 2026
                      </span>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-0.5">
                        Formação Geral (Comum a Todos)
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">FG</span>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400">
                      Perfil & Competências Avaliadas:
                    </h5>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed text-xs">
                      Capacidade de interpretar dados e textos reflexivos, tomar decisões éticas e cidadãs, avaliar o impacto socioambiental e cultural da ciência e das tecnologias contemporâneas e atuar com respeito à diversidade e direitos humanos.
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wide text-teal-600 dark:text-teal-400">
                      Objetos de Conhecimento Nucleares:
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300 text-xs mt-1.5 list-disc list-inside">
                      <li>Ética, Democracia e Cidadania</li>
                      <li>Direitos Humanos e Inclusão Social</li>
                      <li>Mudanças Climáticas e Sustentabilidade</li>
                      <li>Ciência, Tecnologia e Inovação</li>
                      <li>Impactos Éticos da Inteligência Artificial</li>
                      <li>Equidade Étnico-Racial e de Gênero</li>
                      <li>Interpretação de Gráficos e Textos</li>
                      <li>Cultura, Arte, Comunicação e Mídia</li>
                      <li>Globalização e Políticas Internacionais</li>
                      <li>Saúde Mental, Bem-Estar e Trabalho</li>
                    </ul>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 dark:border-slate-800">
                    <span>Estrutura: 15 Questões Objetivas</span>
                    <a
                      href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 dark:text-teal-400 underline hover:text-teal-500 inline-flex items-center gap-1 font-bold"
                    >
                      <span>Texto Oficial Online (Gov.br / DOU)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matriz de Cruzamento: Disciplinas do Banco vs Portarias */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Matriz de Cruzamento: 12 Especialidades do Banco vs. Portarias Inep
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Veja como as 12 áreas taxonômicas refinadas do nosso acervo de questões cobrem com máxima precisão as diretrizes do MEC e do Inep.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3">Especialidade / Disciplina</th>
                    <th className="p-3 text-center">CCP (Port. 157)</th>
                    <th className="p-3 text-center">ADS (Port. 169)</th>
                    <th className="p-3 text-center">GTI (Port. 171)</th>
                    <th className="p-3 text-center">FG (Port. 154)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Formação Geral e Sociedade</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ (15Q)</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ (15Q)</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ (15Q)</td>
                    <td className="p-3 text-center text-teal-600 font-bold">Núcleo Central</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Engenharia de Software</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Banco de Dados</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Governança e Gestão de TI</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Básico</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Algoritmos e Estruturas de Dados</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Básico</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Programação e POO</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Básico</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Redes de Computadores</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Segurança da Informação</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Alto</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Sistemas Operacionais</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ Básico</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Arquitetura e Organização de Computadores</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Inteligência Artificial e Dados</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-emerald-600 font-bold">✓ Médio</td>
                    <td className="p-3 text-center text-purple-600 font-bold">✓ BI / Dados</td>
                    <td className="p-3 text-center text-teal-600 font-bold">✓ Ética IA</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Teoria da Computação e Compiladores</td>
                    <td className="p-3 text-center text-blue-600 font-bold">✓ Núcleo</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                    <td className="p-3 text-center text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONÁRIO DO ESTUDANTE */}
      {activeTab === "questionario" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-300 dark:border-amber-900/70 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shrink-0 shadow-md shadow-amber-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Obrigação Inegociável: Preenchimento do Questionário do Estudante
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  O Questionário do Estudante é destinado a coletar informações que permitam caracterizar o perfil dos estudantes e o contexto de seus processos formativos, as quais são relevantes para a compreensão dos resultados dos estudantes no Enade e para subsidiar os processos de avaliação dos cursos de graduação e das IES.
                  <strong> O preenchimento é estritamente individual e obrigatório por lei.</strong> O aluno que não preencher fica impedido de acessar o local de prova e não poderá colar grau.
                </p>
                <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <span>Período Oficial: 01/06/2026 até 29/11/2026</span>
                  <span>·</span>
                  <span>Acesso: enade.inep.gov.br com conta Gov.br</span>
                </div>
              </div>
            </div>
          </div>

          {/* Passo a Passo com Imagem */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Como o estudante realiza o preenchimento (Passo a Passo)
              </h3>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Acessar o Sistema ENADE</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Entrar no portal oficial (<strong>enade.inep.gov.br</strong>) e fazer login com as credenciais do <strong>Gov.br</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Conferir Cadastro e Contatos</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Validar e-mail e telefone de contato para recebimento de comunicações oficiais e confirmações do Inep.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Atendimento Especializado / Nome Social (Se aplicável)</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Fazer o upload de laudos comprobatórios até a data limite estipulada pelo Inep (<strong>24/07/2026</strong>).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">Responder e Finalizar o Questionário</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Preencher todas as seções até a tela de confirmação de envio e salvar o comprovante em PDF.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Infográfico Preview */}
            <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 text-center space-y-3">
              <div 
                onClick={() => setZoomImage("/images/enade/Guia_Primeiros_Passos_ENADE_2026.png")}
                className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-2xl"
              >
                <img
                  src="/images/enade/Guia_Primeiros_Passos_ENADE_2026.png"
                  alt="Guia Primeiros Passos ENADE 2026"
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2">
                  <Maximize2 className="w-5 h-5" />
                  <span>Clique para Ampliar o Infográfico</span>
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Infográfico oficial de primeiros passos para divulgação aos estudantes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CRONOGRAMA & CHECKLIST */}
      {activeTab === "cronograma" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Linha do Tempo Oficial */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  Marcos Oficiais do Ciclo ENADE 2026
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Datas e prazos regulatórios estipulados nos Editais Inep nº 49 e 61/2026.
                </p>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-sky-500 border-2 border-white dark:border-slate-900" />
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                      01/06 a 29/11/2026
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Cadastro e Questionário do Estudante</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Preenchimento individual via Gov.br no portal do Inep.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900" />
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      01/06 a 24/07/2026 (Crítico)
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Atendimento Especializado & Nome Social</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Solicitação no sistema com envio de laudos médicos comprobatórios.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white dark:border-slate-900" />
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      31/07/2026 (Resultado) e 03 a 07/08/2026 (Recursos)
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Resultado de Atendimento Especializado e Recursos</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Divulgação de deferimentos e prazo recursal no portal do Inep (resultado final em 14/08/2026).</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900" />
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                      Novembro/2026
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Divulgação dos Locais de Prova</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cartão de Confirmação liberado aos alunos com Questionário preenchido.</p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4 pl-8">
                  <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                  <div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      29/11/2026 (Domingo)
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Aplicação Oficial da Prova do ENADE</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Portões fecham às 13h00 pontualmente. Prova das 13h30 às 17h30.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Interativo */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                  Checklist do Estudante & Docente
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Marque os passos concluídos para acompanhar seu progresso no programa.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: "c1", label: "Acessar o portal enade.inep.gov.br com a senha do Gov.br" },
                  { id: "c2", label: "Conferir e atualizar os dados cadastrais (e-mail e telefone)" },
                  { id: "c3", label: "Solicitar Atendimento Especializado ou Nome Social (se necessário - até 24/07)" },
                  { id: "c4", label: "Preencher e submeter o Questionário do Estudante completo" },
                  { id: "c5", label: "Acessar os módulos de revisão e simulações do curso" },
                  { id: "c6", label: "Realizar simulados preparatórios com resolução comentada" },
                  { id: "c7", label: "Baixar o Cartão de Confirmação com o Local de Prova em Novembro" },
                  { id: "c8", label: "Separar caneta preta transparente e documento com foto para 29/11" },
                ].map((item) => {
                  const isDone = Boolean(checkedItems[item.id]);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isDone
                          ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-slate-800 dark:text-slate-200"
                          : "bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <button className="mt-0.5 shrink-0 text-emerald-600">
                        {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                      </button>
                      <span className={`text-xs sm:text-sm font-medium ${isDone ? "line-through text-slate-500 dark:text-slate-400" : ""}`}>
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CENTRAL DE LEGISLAÇÃO, DOWNLOADS & FAQ */}
      {activeTab === "legislacao_faq" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Hub de Legislação Oficial com Link do Inep */}
          <div className="bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 border border-sky-800/40 text-white space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sky-800/40">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold">
                  <Scale className="w-3.5 h-3.5" />
                  <span>Base Jurídica e Normativa Federal</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Legislação Oficial do ENADE (Inep / MEC)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Acesse os documentos originais, portarias e editais completos publicados no Diário Oficial da União.
                </p>
              </div>

              <a
                href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-sky-500/25 transition-all shrink-0"
              >
                <span>Portal da Legislação INEP</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Grade de Portarias e Editais - Texto Oficial Gov.br / Inep */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Portaria 157 - CCP */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
                    Portaria Inep 157/2026
                  </span>
                  <Code2 className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Ciência da Computação</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diretrizes de prova do componente específico (CCP)</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-bold hover:text-blue-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Portaria 169 - ADS */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 uppercase">
                    Portaria Inep 169/2026
                  </span>
                  <Boxes className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Análise e Des. Sistemas</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diretrizes de prova do componente específico (ADS)</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:text-emerald-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Portaria 171 - GTI */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
                    Portaria Inep 171/2026
                  </span>
                  <ShieldAlert className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Gestão da TI</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diretrizes de prova do componente específico (GTI)</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-purple-400 font-bold hover:text-purple-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Portaria 154 - Formação Geral */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 uppercase">
                    Portaria Inep 154/2026
                  </span>
                  <Globe className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Formação Geral</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Diretrizes de prova do componente comum a todos</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-teal-400 font-bold hover:text-teal-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Portaria MEC 276 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase">
                    Portaria MEC 276/2026
                  </span>
                  <Scale className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Regulamento Geral Enade</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Instituição do Enade 2026 e áreas avaliadas</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-sky-400 font-bold hover:text-sky-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Editais 49 e 61 */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">
                    Editais Inep 49 e 61/2026
                  </span>
                  <Calendar className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Editais & Cronograma</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Normas de aplicação, prazos e recursos</p>
                </div>
                <a
                  href="https://www.gov.br/inep/pt-br/centrais-de-conteudo/legislacao/enade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:text-amber-300"
                >
                  <span>Texto Oficial Online (Gov.br)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Infográficos Oficiais */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                Infográficos & Materiais Oficiais de Divulgação
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Clique nos materiais para visualizá-los em alta resolução.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Infográfico 1 */}
              <div 
                onClick={() => setZoomImage("/images/enade/Guia_Primeiros_Passos_ENADE_2026.png")}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 cursor-pointer shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-64 overflow-hidden rounded-xl flex items-center justify-center bg-slate-900">
                  <img
                    src="/images/enade/Guia_Primeiros_Passos_ENADE_2026.png"
                    alt="Guia Primeiros Passos ENADE 2026"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-left">
                  <h4 className="font-bold text-sm text-white">Guia Primeiros Passos ENADE</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Passo a passo visual para o estudante</p>
                </div>
              </div>

              {/* Infográfico 2 */}
              <div 
                onClick={() => setZoomImage("/images/enade/Imagem_Blackboard.png")}
                className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 p-3 cursor-pointer shadow-md hover:shadow-xl transition-all"
              >
                <div className="h-64 overflow-hidden rounded-xl flex items-center justify-center bg-slate-900">
                  <img
                    src="/images/enade/Imagem_Blackboard.png"
                    alt="Ambiente Virtual Blackboard"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 text-left">
                  <h4 className="font-bold text-sm text-white">Estrutura Master Virtual</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Organização de módulos e trilhas de aprendizagem</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ com Busca */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  Perguntas Frequentes (FAQ Oficial ENADE)
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Respostas diretas baseadas na legislação federal e editais do Inep.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Pesquisar pergunta..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaq.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in duration-150">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredFaq.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Nenhuma pergunta encontrada com o termo pesquisado.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Zoom Image */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 overflow-hidden animate-in fade-in duration-150"
        >
          <div className="flex justify-end p-2 z-20">
            <button
              onClick={() => setZoomImage(null)}
              className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Fechar (ESC)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <ZoomableImage
              src={zoomImage}
              alt="Infográfico Ampliado"
              className="max-h-[85vh] w-auto object-contain rounded-xl shadow-2xl"
              showControls={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
