"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isSupabaseConfigured,
  fetchRemoteAuditFlags,
  upsertRemoteAuditFlag,
  deleteRemoteAuditFlag,
  deleteAllRemoteAuditFlags,
  AuditFlagRecord,
} from "./supabase";

export const AUDIT_STORAGE_KEY = "enade_audit_flags_v1";
const AUDIT_EVENT_NAME = "enade_audit_flags_updated";

export interface QuestionAuditFlag {
  id_prova: string;
  id_questao: string;
  reasons: string[];
  note?: string;
  createdAt: string; // ISO string
  updatedAt?: string;
  reportedFrom?: "docente" | "admin";
}

export type AuditFlagMap = Record<string, QuestionAuditFlag>; // key format: `${id_prova}:${id_questao}`

export const AUDIT_REASON_OPTIONS = [
  {
    id: "crop_imperfeito",
    label: "Corte / Crop imperfeito",
    description: "Bordas cortadas, rascunho visível ou cabeçalho/rodapé colado",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  {
    id: "falta_texto_previo",
    label: "Falta texto prévio / motivador",
    description: "Questão depende de enunciado base, tabela ou contexto da folha anterior",
    badgeColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
  },
  {
    id: "falta_conteudo",
    label: "Falta conteúdo / figura / alternativa",
    description: "Recorte incompleto, imagem faltante ou alternativa cortada",
    badgeColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
  },
  {
    id: "erro_ocr",
    label: "Erro de texto / OCR",
    description: "Caracteres ilegíveis, símbolos estranhos ou decodificação corrompida",
    badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
  },
  {
    id: "erro_enunciado",
    label: "Contém erro no enunciado / gabarito",
    description: "Inconsistência conceitual, erro de gabarito ou numeração incorreta",
    badgeColor: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  },
  {
    id: "outro",
    label: "Outro motivo / Observação",
    description: "Outro detalhe ou observação específica descrita na nota",
    badgeColor: "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30",
  },
] as const;

export function getAuditFlags(): AuditFlagMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Erro ao ler flags de auditoria:", e);
    return {};
  }
}

export function saveAuditFlag(flag: QuestionAuditFlag): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAuditFlags();
    const key = `${flag.id_prova}:${flag.id_questao}`;
    const updatedFlag: QuestionAuditFlag = {
      ...flag,
      updatedAt: new Date().toISOString(),
    };
    all[key] = updatedFlag;
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(AUDIT_EVENT_NAME));

    // Sincronização assíncrona em background com o Supabase
    if (isSupabaseConfigured()) {
      upsertRemoteAuditFlag({
        id_prova: updatedFlag.id_prova,
        id_questao: updatedFlag.id_questao,
        reasons: updatedFlag.reasons,
        note: updatedFlag.note,
        reported_from: updatedFlag.reportedFrom,
      }).catch((err) => console.warn("Erro ao persistir no Supabase:", err));
    }
  } catch (e) {
    console.error("Erro ao salvar flag de auditoria:", e);
  }
}

export function removeAuditFlag(id_prova: string, id_questao: string): void {
  if (typeof window === "undefined") return;
  try {
    const all = getAuditFlags();
    const key = `${id_prova}:${id_questao}`;
    if (all[key]) {
      delete all[key];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(all));
      window.dispatchEvent(new Event(AUDIT_EVENT_NAME));

      // Remoção assíncrona no Supabase
      if (isSupabaseConfigured()) {
        deleteRemoteAuditFlag(id_prova, id_questao).catch((err) =>
          console.warn("Erro ao deletar no Supabase:", err)
        );
      }
    }
  } catch (e) {
    console.error("Erro ao remover flag de auditoria:", e);
  }
}

export function clearAllAuditFlags(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    window.dispatchEvent(new Event(AUDIT_EVENT_NAME));

    // Limpeza em massa no Supabase
    if (isSupabaseConfigured()) {
      deleteAllRemoteAuditFlags().catch((err) =>
        console.warn("Erro ao limpar tudo no Supabase:", err)
      );
    }
  } catch (e) {
    console.error("Erro ao limpar flags de auditoria:", e);
  }
}

// Sincronização inicial com o Supabase
let hasSyncedWithSupabase = false;

export async function syncAuditFlagsFromSupabase(): Promise<void> {
  if (typeof window === "undefined" || !isSupabaseConfigured()) return;
  try {
    const remoteRecords: AuditFlagRecord[] = await fetchRemoteAuditFlags();
    if (!remoteRecords || remoteRecords.length === 0) return;

    const localMap = getAuditFlags();
    let hasChanges = false;

    for (const record of remoteRecords) {
      const key = `${record.id_prova}:${record.id_questao}`;
      const existing = localMap[key];

      const remoteCreatedAt = record.created_at || new Date().toISOString();
      const remoteUpdatedAt = record.updated_at || remoteCreatedAt;

      if (!existing) {
        localMap[key] = {
          id_prova: record.id_prova,
          id_questao: record.id_questao,
          reasons: record.reasons || [],
          note: record.note || undefined,
          createdAt: remoteCreatedAt,
          updatedAt: remoteUpdatedAt,
          reportedFrom: record.reported_from || "docente",
        };
        hasChanges = true;
      }
    }

    if (hasChanges) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(localMap));
      window.dispatchEvent(new Event(AUDIT_EVENT_NAME));
    }
  } catch (err) {
    console.warn("Falha ao sincronizar com Supabase:", err);
  }
}

export function useAuditFlag(id_prova: string, id_questao: string) {
  const key = `${id_prova}:${id_questao}`;
  const [flag, setFlag] = useState<QuestionAuditFlag | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const sync = useCallback(() => {
    const all = getAuditFlags();
    setFlag(all[key] || null);
    setIsLoaded(true);
  }, [key]);

  useEffect(() => {
    sync();
    if (!hasSyncedWithSupabase) {
      hasSyncedWithSupabase = true;
      syncAuditFlagsFromSupabase().then(() => sync());
    }

    window.addEventListener(AUDIT_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUDIT_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const save = (reasons: string[], note?: string, reportedFrom: "docente" | "admin" = "docente") => {
    const newFlag: QuestionAuditFlag = {
      id_prova,
      id_questao,
      reasons,
      note: note?.trim() || undefined,
      createdAt: flag?.createdAt || new Date().toISOString(),
      reportedFrom,
    };
    saveAuditFlag(newFlag);
  };

  const remove = () => {
    removeAuditFlag(id_prova, id_questao);
  };

  return { flag, isFlagged: !!flag, isLoaded, save, remove };
}

export function useAllAuditFlags() {
  const [flags, setFlags] = useState<AuditFlagMap>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const sync = useCallback(() => {
    setFlags(getAuditFlags());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    sync();
    if (!hasSyncedWithSupabase) {
      hasSyncedWithSupabase = true;
      setIsSyncing(true);
      syncAuditFlagsFromSupabase().finally(() => {
        setIsSyncing(false);
        sync();
      });
    }

    window.addEventListener(AUDIT_EVENT_NAME, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(AUDIT_EVENT_NAME, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  const triggerSync = async () => {
    setIsSyncing(true);
    await syncAuditFlagsFromSupabase();
    setIsSyncing(false);
    sync();
  };

  const remove = (id_prova: string, id_questao: string) => {
    removeAuditFlag(id_prova, id_questao);
  };

  const clearAll = () => {
    clearAllAuditFlags();
  };

  const flagsList = Object.values(flags).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return {
    flags,
    flagsList,
    count: flagsList.length,
    isLoaded,
    isSyncing,
    triggerSync,
    remove,
    clearAll,
  };
}
