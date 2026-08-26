import { notFound } from "next/navigation";
import { getLoadedQuestionSet } from "@/lib/weeklyChallenges";
import { StudentQuestionViewer } from "@/components/StudentQuestionViewer";

export const dynamic = "force-static";

export function generateStaticParams() {
  const courses = ["ads", "gti", "fg", "ccp"];
  const params: { curso: string; semana: string }[] = [];

  for (const curso of courses) {
    for (let w = 1; w <= 12; w++) {
      params.push({ curso, semana: `semana-${w}` });
      params.push({ curso, semana: String(w) });
      params.push({ curso, semana: `semana-${String(w).padStart(2, "0")}` });
    }
  }

  return params;
}

interface PageProps {
  params: Promise<{ curso: string; semana: string }>;
}

export default async function PilulaSemanaEspecificaPage({ params }: PageProps) {
  const { curso: rawCurso, semana: rawSemana } = await params;
  const curso = rawCurso.toUpperCase();

  const cleanSemana = rawSemana.toLowerCase().replace("semana-", "").replace("semana", "").replace("conjunto-", "");
  const weekNumber = parseInt(cleanSemana, 10);

  if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 12) {
    notFound();
  }

  const validCourses = ["ADS", "GTI", "FG", "CCP", "FORMAÇÃO GERAL", "FORMACAO-GERAL"];
  if (!validCourses.includes(curso)) {
    notFound();
  }

  const cleanCourse = curso === "FG" || curso.includes("FORMA") ? "FG" : curso;
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
