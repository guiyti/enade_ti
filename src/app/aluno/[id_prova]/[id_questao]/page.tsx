import { notFound } from "next/navigation";
import { getAllExams, getQuestionById, getQuestionsPool } from "@/lib/enade";
import { StudentQuestionViewer } from "@/components/StudentQuestionViewer";

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

export default async function AlunoQuestaoPage({ params }: PageProps) {
  const { id_prova, id_questao } = await params;
  const data = await getQuestionById(id_prova, id_questao);

  if (!data) {
    notFound();
  }

  const { exam, question } = data;
  const pool = await getQuestionsPool({ curso: exam.curso });

  return (
    <StudentQuestionViewer
      mode="avulsa"
      curso={exam.curso}
      title={`${exam.curso} · ${exam.ano}`}
      initialQuestions={[{ exam, question }]}
      allAvailablePool={pool.length > 0 ? pool : [{ exam, question }]}
      returnUrl="/sorteio"
    />
  );
}
