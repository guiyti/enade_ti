import { notFound } from "next/navigation";
import { getLoadedQuestionSet } from "@/lib/weeklyChallenges";
import { getCurrentEnadeWeek } from "@/lib/weeklySchedule";
import { StudentQuestionViewer } from "@/components/StudentQuestionViewer";

export const dynamic = "force-static";

export function generateStaticParams() {
  return [
    { curso: "ads" },
    { curso: "gti" },
    { curso: "fg" },
    { curso: "ccp" },
  ];
}

interface PageProps {
  params: Promise<{ curso: string }>;
}

export default async function PilulaCursoPage({ params }: PageProps) {
  const { curso: rawCurso } = await params;
  const curso = rawCurso.toUpperCase();

  const validCourses = ["ADS", "GTI", "FG", "CCP", "FORMAÇÃO GERAL", "FORMACAO-GERAL"];
  if (!validCourses.includes(curso)) {
    notFound();
  }

  const cleanCourse = curso === "FG" || curso.includes("FORMA") ? "FG" : curso;
  
  // Identifica automaticamente a semana vigente do calendário da prova
  const { weekNumber } = getCurrentEnadeWeek();
  const setData = await getLoadedQuestionSet(cleanCourse, weekNumber);

  return (
    <StudentQuestionViewer
      mode="conjunto"
      curso={cleanCourse}
      setNumber={setData.setNumber}
      setLabel={setData.label}
      title={setData.title}
      themeName={setData.topic}
      subtitle={setData.description}
      initialQuestions={setData.questions}
      returnUrl="/sorteio"
    />
  );
}
