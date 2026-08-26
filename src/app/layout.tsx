import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ENADE Hub - Banco de Questões e Auditoria",
  description: "Plataforma de visualização, apresentação em sala de aula e auditoria de questões de provas oficiais do ENADE.",
  icons: {
    icon: "/images/enade/logo_circular.png",
    apple: "/images/enade/logo_circular.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
