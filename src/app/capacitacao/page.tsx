import type { Metadata } from "next";
import { CapacitacaoTabs } from "@/components/CapacitacaoTabs";

export const metadata: Metadata = {
  title: "Entenda o ENADE - Legislação, Prazos e FAQ Oficial",
  description: "Guia completo sobre o ENADE: marco regulatório do Inep/MEC, Questionário do Estudante, cronograma oficial e perguntas frequentes.",
};

export const dynamic = "force-static";

export default function CapacitacaoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CapacitacaoTabs />
    </div>
  );
}
