"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  School, 
  MapPin, 
  FileText, 
  Headphones, 
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Info
} from "lucide-react";

interface InscricaoData {
  curso: string;
  sigla: string;
  campus: string;
}

export function InscricaoVerifier() {
  const [cpf, setCpf] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "inscrito" | "nao_inscrito" | "erro">("idle");
  const [resultData, setResultData] = useState<InscricaoData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const inputId = useId();

  // Formata o CPF para a máscara 000.000.000-00
  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
    if (status !== "idle") {
      setStatus("idle");
      setResultData(null);
      setErrorMessage("");
    }
  };

  const cleanDigits = cpf.replace(/\D/g, "");
  const isComplete = cleanDigits.length === 11;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isComplete) {
      setErrorMessage("Por favor, digite o CPF completo com os 11 dígitos.");
      setStatus("erro");
      return;
    }

    setIsLoading(true);
    setStatus("idle");
    setErrorMessage("");

    try {
      const response = await fetch("/api/check-inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cleanDigits }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("erro");
        setErrorMessage(data.message || "Erro ao consultar inscrição. Verifique o CPF informado.");
        return;
      }

      if (data.inscrito) {
        setStatus("inscrito");
        setResultData(data.data);
      } else {
        setStatus("nao_inscrito");
        setResultData(null);
      }
    } catch (err) {
      console.error("Erro na consulta de inscrição:", err);
      setStatus("erro");
      setErrorMessage("Não foi possível conectar ao servidor no momento. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCpf("");
    setStatus("idle");
    setResultData(null);
    setErrorMessage("");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-black tracking-wide border border-sky-300/40">
          <ClipboardCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          ENADE 2026 • Cursos de Tecnologia
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Verificação Oficial de Inscrição
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Consulte se o seu CPF consta na listagem oficial de concluintes inscritos no ENADE para os cursos de <span className="font-semibold text-slate-900 dark:text-white">Análise e Desenvolvimento de Sistemas (ADS)</span> e <span className="font-semibold text-slate-900 dark:text-white">Gestão da Tecnologia da Informação (GTI)</span>.
        </p>
      </div>

      {/* Caixa de Consulta (Ocultada após o resultado) */}
      {(status === "idle" || status === "erro") && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 p-6 sm:p-8 backdrop-blur-md animate-in fade-in duration-300">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label 
                htmlFor={inputId}
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2"
              >
                Digite o CPF do Estudante
              </label>
              <div className="relative">
                <input
                  id={inputId}
                  type="text"
                  inputMode="numeric"
                  value={cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full text-xl sm:text-2xl font-mono tracking-widest px-4 py-3.5 pl-12 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all font-semibold"
                  autoComplete="off"
                />
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                
                {cpf && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded bg-slate-200/70 dark:bg-slate-700/70 transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Formato: apenas números (11 dígitos)</span>
                {cleanDigits.length > 0 && (
                  <span className={isComplete ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-400"}>
                    {cleanDigits.length}/11 dígitos
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isComplete || isLoading}
                className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white transition-all shadow-md ${
                  !isComplete || isLoading
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-sky-600 hover:bg-sky-500 active:scale-[0.99] shadow-sky-600/30"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Consultando base de inscritos...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Verificar Minha Inscrição</span>
                  </>
                )}
              </button>
            </div>

            {/* Selo de Segurança LGPD */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>Consulta Segura e LGPD:</strong> Seu CPF é processado de forma criptografada (SHA-256 com sal institucional). Nenhum dado pessoal sensível é exposto ou gravado em banco externo.
              </span>
            </div>
          </form>
        </div>
      )}

      {/* RESULTADO: ERRO */}
      {status === "erro" && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 flex items-start gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Atenção</p>
            <p className="text-xs sm:text-sm mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* RESULTADO: INSCRITO (SUCESSO) */}
      {status === "inscrito" && resultData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Card Principal de Confirmação */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-500 dark:border-emerald-500/80 rounded-2xl p-6 sm:p-8 shadow-xl shadow-emerald-500/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 dark:border-emerald-900/60 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-1">
                    Status: Inscrito no ENADE
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    Aluno(a) Concluinte Inscrito(a)!
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  Consultar Outro CPF
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0 shadow-sm">
                  Concluinte Regular • Edição 2026
                </div>
              </div>
            </div>

            {/* Informações de Inscrição */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Curso de Graduação
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {resultData.curso}
                </p>
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {resultData.sigla}
                </span>
              </div>

              <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Campus / Polo
                </span>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Campus {resultData.campus}
                </p>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Universidade Cruzeiro do Sul
                </span>
              </div>
            </div>

            {/* AVISO MANDATÓRIO 1: Questionário do Estudante */}
            <div className="rounded-xl border-2 border-amber-400/80 bg-amber-50/90 dark:bg-amber-950/40 p-5 space-y-3 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="text-sm sm:text-base font-extrabold text-amber-900 dark:text-amber-200">
                    Ação Obrigatória: Preenchimento do Questionário do Estudante
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    Todo aluno concluinte inscrito no ENADE <strong>DEVE</strong> preencher obrigatoriamente o <strong>Questionário do Estudante</strong> no portal do Inep. O preenchimento é requisito curricular indispensável para a sua regularidade acadêmica, colação de grau e emissão do diploma.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href="https://enade.inep.gov.br/enade/#!/index"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-sm transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Acessar Sistema ENADE (Inep)
                </a>
                <span className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                  Login via conta Gov.br do aluno
                </span>
              </div>
            </div>

            {/* AVISO MANDATÓRIO 2: Local de Prova */}
            <div className="rounded-xl border border-sky-300 dark:border-sky-800/70 bg-sky-50/80 dark:bg-sky-950/30 p-5 space-y-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-sky-600 text-white shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-sky-900 dark:text-sky-200">
                    Onde realizarei a prova? (Local de Prova)
                  </h4>
                  <p className="text-xs sm:text-sm text-sky-800/90 dark:text-sky-300 leading-relaxed">
                    Caso você <strong>já tenha preenchido o Questionário do Estudante</strong>, acesse periodicamente o portal oficial do ENADE/Inep para consultar a divulgação do seu <strong>Cartão de Confirmação de Inscrição</strong>, onde constará o local exato (escola/faculdade, bloco e sala) de aplicação da sua prova.
                  </p>
                </div>
              </div>
            </div>

            {/* Atalhos para Estudo e Botão de Nova Consulta */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Link
                  href="/capacitacao"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-white dark:bg-slate-800/60 hover:bg-sky-50/50 dark:hover:bg-sky-950/30 transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  Guia & Legislação
                </Link>

                <Link
                  href="/sorteio"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all text-xs font-bold text-slate-700 dark:text-slate-200"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Quizzes Semanais
                </Link>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-[0.99] text-white text-xs font-extrabold shadow-md shadow-emerald-700/20 transition-all"
              >
                <Search className="w-4 h-4" />
                Consultar Outro CPF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTADO: NÃO CADASTRADO / NÃO INSCRITO (AVERMELHADO PARA ATENÇÃO MÁXIMA) */}
      {status === "nao_inscrito" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-rose-500/90 dark:border-rose-600 rounded-2xl p-6 sm:p-8 shadow-xl shadow-rose-500/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200 dark:border-rose-900/60 pb-5">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/30 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 text-xs font-black uppercase tracking-wider border border-rose-300/80 dark:border-rose-800">
                    CPF Não Convocado • Não Inscrito
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-100">
                    CPF não localizado na listagem de inscritos para este ano
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-900/90 dark:text-rose-200/90 leading-relaxed font-medium">
                    Isso significa que, de acordo com o levantamento acadêmico oficial, você <strong>não irá realizar o ENADE neste ciclo</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800/80 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-slate-700 text-xs font-extrabold text-rose-700 dark:text-rose-300 shadow-sm transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                Consultar Outro CPF
              </button>
            </div>

            {/* O QUE FAZER SE O ALUNO ACREDITA ESTAR NO ÚLTIMO SEMESTRE */}
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-extrabold text-rose-950 dark:text-rose-100 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Acredita estar no último semestre do curso e deveria estar inscrito?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Caso a sua previsão de formatura seja para este ano e você não esteja na listagem, siga rigorosamente as 3 etapas de verificação institucional:
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Passo 1 */}
                <div className="flex items-start gap-3.5 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm shadow-rose-600/30">
                    1
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-extrabold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Analisar o Histórico Escolar no Portal do Aluno
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Acesse o caminho: <span className="font-bold text-slate-900 dark:text-white">Portal do Aluno &gt; Emissão de Documentos &gt; Histórico Escolar</span>. Verifique se você possui reprovações, dependências, disciplinas pendentes a cursar ou horas de Atividades Complementares faltantes que postergam a conclusão do curso para semestres posteriores.
                    </p>
                  </div>
                </div>

                {/* Passo 2 */}
                <div className="flex items-start gap-3.5 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm shadow-rose-600/30">
                    2
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-extrabold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Abrir Protocolo no CAA Online
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Caso o seu histórico escolar esteja regular com previsão para este semestre e houver divergência, abra um requerimento formal no CAA Online selecionando a opção:
                    </p>
                    <div className="inline-block mt-1 px-3 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 text-xs font-extrabold text-rose-800 dark:text-rose-200">
                      &apos;Esclarecimentos Sobre o Enade &gt; Solicitação - Enade&apos;
                    </div>
                  </div>
                </div>

                {/* Passo 3 */}
                <div className="flex items-start gap-3.5 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20">
                  <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm shadow-rose-600/30">
                    3
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-extrabold text-rose-950 dark:text-rose-100 flex items-center gap-1.5">
                      <Headphones className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Procurar a Assessoria Acadêmica do Campus
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Em casos com pendências maiores ou dúvidas sobre integralização da grade, procure o atendimento da <strong>Assessoria Acadêmica do seu campus</strong>. A equipe realizará uma auditoria analítica no seu histórico escolar para identificar eventuais pendências documentais ou curriculares desconhecidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Rodapé Informativo */}
            <div className="pt-4 border-t border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span>Se você está em semestres iniciais ou intermediários, sua participação ocorrerá apenas no ano da sua formatura.</span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                Fazer Nova Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Rápido / Dúvidas Frequentes */}
      <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          Perguntas Frequentes sobre a Inscrição
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="space-y-1 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <h4 className="font-extrabold text-slate-900 dark:text-white">
              Quem é considerado concluinte no ENADE?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Estudantes dos cursos superiores de tecnologia (ADS e GTI) que tenham integralizado 75% ou mais da carga horária mínima ou com previsão de conclusão até a data limite estipulada pelo edital do Inep.
            </p>
          </div>

          <div className="space-y-1 p-3.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <h4 className="font-extrabold text-slate-900 dark:text-white">
              O ENADE é obrigatório?
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              Sim. O ENADE é componente curricular obrigatório pela Lei Federal nº 10.861/2004. O estudante inscrito que não comparecer à prova ou não preencher o questionário fica irregular perante o MEC e impedido de colar grau.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
