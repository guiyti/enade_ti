import { notFound } from "next/navigation";
import { getQuestionsPool } from "@/lib/enade";
import { StudentQuestionViewer } from "@/components/StudentQuestionViewer";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    { tipo: "fg" },
    { tipo: "ads" },
    { tipo: "gti" },
    { tipo: "ccp" },
    { tipo: "todos" },
  ];
}

interface PageProps {
  params: Promise<{ tipo: string }>;
}

export default async function SorteioTipoPage({ params }: PageProps) {
  const { tipo: rawTipo } = await params;
  const target = rawTipo.toLowerCase();

  const validTargets = ["fg", "ads", "gti", "ccp", "todos"];
  if (!validTargets.includes(target)) {
    notFound();
  }

  const isFg = target === "fg";
  const curso = target === "todos" ? undefined : isFg ? "FG" : target.toUpperCase();

  const pool = await getQuestionsPool({
    curso: isFg ? undefined : curso,
    isFg,
    tipo: "OBJETIVA",
  });

  if (pool.length === 0) {
    notFound();
  }

  // Pick a random starting question
  const randomIndex = Math.floor(Math.random() * pool.length);
  const shuffledPool = [...pool];

  const courseNames: Record<string, string> = {
    fg: "Formação Geral",
    ads: "ADS",
    gti: "GTI",
    ccp: "CCP",
    todos: "Todos os Cursos",
  };

  return (
    <StudentQuestionViewer
      mode="sorteio"
      curso={courseNames[target] || target.toUpperCase()}
      title={`Treino Livre · ${courseNames[target] || target.toUpperCase()}`}
      initialQuestions={[shuffledPool[randomIndex]]}
      allAvailablePool={shuffledPool}
      returnUrl="/sorteio"
    />
  );
}
