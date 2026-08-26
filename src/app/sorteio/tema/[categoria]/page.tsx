import { notFound } from "next/navigation";
import { getQuestionsPool, getAllCategories } from "@/lib/enade";
import { StudentQuestionViewer } from "@/components/StudentQuestionViewer";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((cat) => ({
    categoria: cat.slug,
  }));
}

interface PageProps {
  params: Promise<{ categoria: string }>;
}

export default async function SorteioTemaPage({ params }: PageProps) {
  const { categoria: temaSlug } = await params;
  const categories = await getAllCategories();
  const currentCategory = categories.find((c) => c.slug === temaSlug);

  if (!currentCategory) {
    notFound();
  }

  const pool = await getQuestionsPool({
    temaSlug,
    tipo: "OBJETIVA",
  });

  const activePool = pool.length > 0 ? pool : await getQuestionsPool({ temaSlug });

  if (activePool.length === 0) {
    notFound();
  }

  const randomIndex = Math.floor(Math.random() * activePool.length);

  return (
    <StudentQuestionViewer
      mode="sorteio"
      curso={currentCategory.name}
      themeName={currentCategory.name}
      themeSlug={temaSlug}
      title={`Treino Livre · ${currentCategory.name}`}
      initialQuestions={[activePool[randomIndex]]}
      allAvailablePool={activePool}
      returnUrl="/sorteio"
    />
  );
}
