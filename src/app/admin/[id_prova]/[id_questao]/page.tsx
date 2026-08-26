import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllExams, getQuestionById } from "@/lib/enade";
import { TagEditor } from "@/components/TagEditor";
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Code,
  Tag
} from "lucide-react";

import { AdminFullPageModal } from "@/components/AdminFullPageModal";
import { AuditFlagModal } from "@/components/AuditFlagModal";
import { AdminBackButton } from "@/components/AdminBackButton";
import { ZoomableImage } from "@/components/ZoomableImage";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const exams = await getAllExams();
  const params: { id_prova: string; id_questao: string }[] = [];

  for (const exam of exams) {
    for (const q of exam.questoes) {
      params.push({
        id_prova: exam.id_prova,
        id_questao: q.id_questao,
      });
    }
  }

  return params;
}

interface PageProps {
  params: Promise<{ id_prova: string; id_questao: string }>;
}

export default async function AdminQuestionDetailPage({ params }: PageProps) {
  const { id_prova, id_questao } = await params;
  const data = await getQuestionById(id_prova, id_questao);

  if (!data) {
    notFound();
  }

  const { exam, question } = data;
  const isDisc = question.tipo === "DISCURSIVA";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <AdminBackButton
          fallbackUrl={`/admin/${exam.id_prova}`}
          label={`Voltar para Prova ${exam.id_prova}`}
        />

        <div className="flex items-center gap-3 text-xs">
          <AuditFlagModal
            id_prova={exam.id_prova}
            id_questao={question.id_questao}
            variant="admin"
            reportedFrom="admin"
          />

          <AdminFullPageModal
            id_prova={exam.id_prova}
            totalPaginas={exam.total_paginas}
            initialPage={question.paginas[0] || 1}
            questionId={question.id_questao}
            questionPngUrl={question.caminho_png}
            buttonLabel="📄 Ver Folha Completa & Adjacentes"
          />

          <Link
            href={`/docente/apresentacao/${exam.id_prova}/${question.id_questao}`}
            className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300 font-semibold hover:bg-sky-100 transition-colors"
          >
            Apresentar em Sala
          </Link>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase">
              Questão {question.id_questao}
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                isDisc
                  ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {question.tipo}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {exam.id_prova} · Ano {exam.ano} · {exam.curso} · Páginas {question.paginas.join(", ")}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[11px] text-slate-400 font-medium uppercase">Confiança</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {(question.confianca * 100).toFixed(0)}%
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800"></div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium uppercase">Status Atual</div>
            <span className="inline-block mt-0.5 px-3 py-1 rounded-md text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {question.status}
            </span>
          </div>
        </div>
      </div>

      {/* Side by side Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Visual Crop Image */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
              <ImageIcon className="w-4 h-4 text-sky-500" />
              Recorte PNG Nativo (300 DPI)
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {question.largura} x {question.altura} px
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center justify-center overflow-hidden h-[600px] relative">
            <ZoomableImage
              src={question.caminho_png}
              alt={`Questão ${question.id_questao}`}
              className="max-h-full w-auto object-contain rounded shadow-sm"
              showControls={true}
            />
          </div>

          {question.figuras && question.figuras.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Figuras embutidas extraídas:</h4>
              <div className="flex gap-2 flex-wrap">
                {question.figuras.map((fig, idx) => (
                  <a
                    key={idx}
                    href={fig}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono hover:underline flex items-center gap-1"
                  >
                    Figura {idx + 1} <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Categories Management & Extracted Text */}
        <div className="space-y-6">
          {/* Interactive Tag Editor */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <TagEditor
              id_prova={exam.id_prova}
              id_questao={question.id_questao}
              initialTags={question.categorias || []}
            />
          </div>

          {/* Extracted Text */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <FileText className="w-4 h-4 text-indigo-500" />
                Texto Estrutural Extraído
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {question.texto_completo ? `${question.texto_completo.length} caracteres` : "Sem texto"}
              </span>
            </div>

            {question.texto_completo ? (
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-[350px] overflow-y-auto border border-slate-100 dark:border-slate-900">
                {question.texto_completo}
              </pre>
            ) : (
              <p className="text-xs text-slate-400 italic p-4">
                Texto estrutural não detectado ou questão estritamente baseada em imagem/gráfico.
              </p>
            )}
          </div>

          {/* Technical Diagnostics */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              <Code className="w-4 h-4 text-emerald-500" />
              Metadados da Questão (JSON)
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-[220px]">
              {JSON.stringify(
                {
                  id_questao: question.id_questao,
                  numero: question.numero,
                  tipo: question.tipo,
                  categorias: question.categorias,
                  paginas: question.paginas,
                  largura: question.largura,
                  altura: question.altura,
                  confianca: question.confianca,
                  status: question.status,
                  anomalias: question.anomalias,
                },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
