import { createClient } from "@supabase/supabase-js";

export interface AuditFlagRecord {
  id?: string;
  id_prova: string;
  id_questao: string;
  reasons: string[];
  note?: string;
  reported_from?: "docente" | "admin";
  created_at?: string;
  updated_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    supabaseAnonKey.length > 20
  );
};

// Instância única do cliente Supabase para o frontend
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Busca todas as sinalizações cadastradas no Supabase
 */
export async function fetchRemoteAuditFlags(): Promise<AuditFlagRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("audit_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase: Falha ao carregar sinalizações:", error.message);
      return [];
    }
    return data || [];
  } catch (err) {
    console.warn("Supabase: Erro de conexão ao buscar flags:", err);
    return [];
  }
}

/**
 * Insere ou atualiza uma sinalização de questão no Supabase
 */
export async function upsertRemoteAuditFlag(flag: {
  id_prova: string;
  id_questao: string;
  reasons: string[];
  note?: string;
  reported_from?: "docente" | "admin";
}): Promise<boolean> {
  if (!supabase) return false;
  try {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("audit_flags")
      .upsert(
        {
          id_prova: flag.id_prova,
          id_questao: flag.id_questao,
          reasons: flag.reasons,
          note: flag.note || null,
          reported_from: flag.reported_from || "docente",
          updated_at: now,
        },
        {
          onConflict: "id_prova,id_questao",
        }
      );

    if (error) {
      console.warn("Supabase: Erro ao salvar sinalização:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase: Falha na requisição de upsert:", err);
    return false;
  }
}

/**
 * Remove uma sinalização no Supabase
 */
export async function deleteRemoteAuditFlag(
  id_prova: string,
  id_questao: string
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("audit_flags")
      .delete()
      .match({ id_prova, id_questao });

    if (error) {
      console.warn("Supabase: Erro ao deletar sinalização:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase: Falha na requisição de delete:", err);
    return false;
  }
}

/**
 * Remove todas as sinalizações no Supabase (Ação de limpeza do Auditor)
 */
export async function deleteAllRemoteAuditFlags(): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Delete all records from audit_flags table
    const { error } = await supabase
      .from("audit_flags")
      .delete()
      .neq("id_prova", "__none__");

    if (error) {
      console.warn("Supabase: Erro ao limpar todas as sinalizações:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Supabase: Falha na requisição de delete all:", err);
    return false;
  }
}
