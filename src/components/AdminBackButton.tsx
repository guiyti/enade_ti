"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface AdminBackButtonProps {
  fallbackUrl: string;
  label?: string;
}

export function AdminBackButton({ fallbackUrl, label = "Voltar" }: AdminBackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
