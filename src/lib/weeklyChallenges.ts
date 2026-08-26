import { getQuestionById, getQuestionsPool, type ExamData, type QuestionData } from "@/lib/enade";
import {
  QUESTION_SETS,
  getQuestionSetsForCourse,
  getQuestionSetByNumber,
  type QuestionSetConfig,
  type QuestionRef
} from "@/lib/weeklySchedule";

export {
  QUESTION_SETS,
  getQuestionSetsForCourse,
  getQuestionSetByNumber,
  type QuestionSetConfig,
  type QuestionRef
};

export interface LoadedQuestionSet {
  setNumber: number;
  label: string;
  title: string;
  topic: string;
  description: string;
  curso: string;
  questions: { exam: ExamData; question: QuestionData }[];
}

export async function getLoadedQuestionSet(
  cursoInput: string,
  setNumberInput: number = 1
): Promise<LoadedQuestionSet> {
  const rawCourse = cursoInput.toUpperCase();
  const curso = rawCourse === "FG" || rawCourse.includes("FORMA") ? "FG" : rawCourse;

  const setConfig = getQuestionSetByNumber(curso, setNumberInput) || QUESTION_SETS.ADS[0];
  const questions: { exam: ExamData; question: QuestionData }[] = [];

  for (const ref of setConfig.questionIds) {
    const data = await getQuestionById(ref.id_prova, ref.id_questao);
    if (data) {
      questions.push(data);
    }
  }

  // Fallback se alguma questão falhar na busca direta
  if (questions.length === 0) {
    const isFg = curso === "FG";
    const pool = await getQuestionsPool({ curso: isFg ? undefined : curso, isFg, tipo: "OBJETIVA" });
    for (let i = 0; i < 4 && i < pool.length; i++) {
      questions.push(pool[i]);
    }
  }

  return {
    setNumber: setConfig.setNumber,
    label: setConfig.label,
    title: setConfig.title,
    topic: setConfig.topic,
    description: setConfig.description,
    curso,
    questions,
  };
}

export async function getWeeklyChallenge(cursoInput: string, setNumberInput: number = 1) {
  return getLoadedQuestionSet(cursoInput, setNumberInput);
}
