"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
  Maximize2
} from "lucide-react";

export function CapacitacaoTabs() {
  const [activeTab, setActiveTab] = useState<
    "visao_geral" | "questionario" | "cronograma" | "recursos_faq"
  >("visao_geral");

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
      a: "Conforme o Edital nº 49/2026 e o cronograma oficial do Inep, as solicitações de atendimento especializado (prova em braille, ampliada, tempo adicional, ledor) e tratamento pelo nome social devem ser enviadas com laudo no sistema até o dia 24/07/2026.",
    },
    {
      q: "Como a nota do ENADE impacta o diploma e a carreira do estudante?",
      a: "O Conceito Enade e o CPC (Conceito Preliminar de Curso) são os principais índices públicos de qualidade do MEC. Empresas, recrutadores e programas de pós-graduação consultam essas notas. Cursos com notas 4 e 5 conferem alto prestígio e valorização de mercado ao diploma do egresso.",
    },
    {
      q: "Qual é a estrutura da Prova do ENADE 2026?",
      a: "A prova tem duração total de 4 horas e é composta por: (1) Componente de Formação Geral (15 questões objetivas de ética, sociedade, sustentabilidade e tecnologia - Portaria 154); (2) Componente Específico da Área (30 questões objetivas + 1 questão discursiva baseada nas diretrizes do curso - Portarias 169 para ADS e 171 para GTI).",
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
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-sky-400" />
            <span>Guia Informativo & Legislação Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Entenda o <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">ENADE 2026</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Marco regulatório do Inep/MEC, Questionário do Estudante, cronograma oficial e perguntas frequentes sobre o Exame Nacional de Desempenho dos Estudantes.
          </p>
        </div>
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("visao_geral")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "visao_geral"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>1. O que é o ENADE & Portarias</span>
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
          <span>2. Questionário do Estudante</span>
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
          <span>3. Cronograma Oficial & Checklist</span>
        </button>

        <button
          onClick={() => setActiveTab("recursos_faq")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "recursos_faq"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>4. Infográficos Oficiais & FAQ</span>
        </button>
      </div>

      {/* TAB 1: Visão Geral & Marco Regulatório */}
      {activeTab === "visao_geral" && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Marco Legal */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Marco Regulatório (SINAES)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Instituído pela <strong>Lei nº 10.861/2004</strong>, o ENADE é componente curricular obrigatório para obtenção do diploma de graduação em todo o território nacional.
              </p>
              <div className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                Portaria MEC nº 276/2026 · Editais 49 e 61/2026
              </div>
            </div>

            {/* Card 2: Composição da Prova */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Estrutura da Prova (4 Horas)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>15 questões</strong> de Formação Geral (Portaria 154) + <strong>30 questões objetivas e 1 discursiva</strong> do Componente Específico do curso.
              </p>
              <div className="text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                Portaria nº 169 (ADS) · Portaria nº 171 (GTI)
              </div>
            </div>

            {/* Card 3: Valorização do Diploma */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Impacto Profissional
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                A nota do curso compõe o <strong>Conceito Enade</strong> e o <strong>CPC</strong>, consultados por empresas e recrutadores de tecnologia para avaliar a qualidade dos formandos.
              </p>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                Diploma reconhecido com excelência
              </div>
            </div>
          </div>

          {/* Diretrizes Específicas por Portaria */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-600" />
                Diretrizes de Conteúdo das Portarias Inep 2026
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Competências nucleares exigidas na prova conforme as portarias oficiais publicadas no Diário Oficial da União.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ADS */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 uppercase">
                    Portaria 169 / 2026
                  </span>
                  <span className="text-xs font-bold text-slate-400">ADS</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Análise e Des. de Sistemas
                </h4>
                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Engenharia de Requisitos e Métodos Ágeis (Scrum/XP)</li>
                  <li>Modelagem UML e Padrões de Projeto (Design Patterns)</li>
                  <li>Banco de Dados Relacional e SQL Avançado</li>
                  <li>Qualidade, Testes de Software e Segurança</li>
                  <li>Arquitetura em Nuvem e Web Services (REST)</li>
                </ul>
              </div>

              {/* GTI */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                    Portaria 171 / 2026
                  </span>
                  <span className="text-xs font-bold text-slate-400">GTI</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Gestão da Tecnologia da Informação
                </h4>
                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Governança e Melhores Práticas (ITIL e COBIT)</li>
                  <li>Segurança da Informação e Conformidade (LGPD)</li>
                  <li>Planejamento Estratégico de TI e Gestão de Riscos</li>
                  <li>Gerenciamento de Projetos e Alinhamento ao Negócio</li>
                  <li>Auditoria de Sistemas e Continuidade de Negócios</li>
                </ul>
              </div>

              {/* Formação Geral */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-900/60 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 uppercase">
                    Portaria 154 / 2026
                  </span>
                  <span className="text-xs font-bold text-slate-400">Comum a Todos</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Formação Geral
                </h4>
                <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Ética, Democracia, Direitos Humanos e Cidadania</li>
                  <li>Impacto Social e Ético das Novas Tecnologias e IA</li>
                  <li>Sustentabilidade, Diversidade e Meio Ambiente</li>
                  <li>Interpretação de Gráficos, Tabelas e Textos Argumentativos</li>
                  <li>Pensamento Crítico e Tomada de Decisão Cidadã</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Questionário do Estudante */}
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
                  O Questionário do Estudante é um documento de coleta de dados socioeconômicos e de percepção do curso realizado pelo Inep. 
                  <strong> O preenchimento é estritamente individual e obrigatório por lei.</strong> O aluno que não preencher fica com pendência de regularidade e não poderá colar grau.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
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

      {/* TAB 3: Cronograma & Checklist */}
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
                      Até 24/07/2026 (Crítico)
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mt-1">Atendimento Especializado & Nome Social</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Último dia para envio de laudos médicos e pedidos de acessibilidade.</p>
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
                  { id: "c3", label: "Solicitar Atendimento Especializado ou Nome Social (se necessário)" },
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

      {/* TAB 4: Infográficos & FAQ */}
      {activeTab === "recursos_faq" && (
        <div className="space-y-8 animate-in fade-in duration-150">
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
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto rounded-2xl">
            <img src={zoomImage} alt="Infográfico Ampliado" className="w-full h-auto rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
