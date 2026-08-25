import { notFound } from "next/navigation";
import { getAllExams, getQuestionById } from "@/lib/enade";
import { PresentationViewer } from "@/components/PresentationViewer";

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

export default async function PresentationPage({ params }: PageProps) {
  const { id_prova, id_questao } = await params;
  const data = await getQuestionById(id_prova, id_questao);

  if (!data) {
    notFound();
  }

  const { exam, question } = data;
  const currentIndex = exam.questoes.findIndex((q) => q.id_questao === id_questao);
  const prevQuestion = currentIndex > 0 ? exam.questoes[currentIndex - 1] : null;
  const nextQuestion = currentIndex < exam.questoes.length - 1 ? exam.questoes[currentIndex + 1] : null;

  return (
    <PresentationViewer
      exam={exam}
      question={question}
      currentIndex={currentIndex}
      totalQuestions={exam.questoes.length}
      prevQuestionId={prevQuestion ? prevQuestion.id_questao : null}
      nextQuestionId={nextQuestion ? nextQuestion.id_questao : null}
    />
  );
}
