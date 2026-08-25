import { getAllExams } from "@/lib/enade";
import { SearchClient } from "@/components/SearchClient";

export const dynamic = "force-static";

export default async function DocenteSearchPage() {
  const exams = await getAllExams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <SearchClient exams={exams} />
    </div>
  );
}
