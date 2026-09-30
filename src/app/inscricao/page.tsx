import type { Metadata } from "next";
import { InscricaoVerifier } from "@/components/InscricaoVerifier";

export const metadata: Metadata = {
  title: "Verificar Inscrição ENADE | Cruzeiro do Sul TI",
  description: "Consulte se o seu CPF está inscrito na listagem oficial de concluintes do ENADE para os cursos de ADS e GTI da Universidade Cruzeiro do Sul.",
};

export default function InscricaoPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <InscricaoVerifier />
    </div>
  );
}
