import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não estão definidos no .env");
  process.exit(1);
}

const clientKey = serviceRoleKey || supabaseAnonKey;
const supabase = createClient(supabaseUrl, clientKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("🔍 Testando conexão com o Supabase...");

  try {
    const { data, error } = await supabase.from("audit_flags").select("id").limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("relation \"public.audit_flags\" does not exist")) {
        console.log("ℹ️ A tabela 'audit_flags' ainda não existe no Supabase.");
        console.log("📋 Para criá-la, execute o script SQL em: supabase/migrations/20250825_create_audit_flags.sql no SQL Editor do Supabase.");
      } else {
        console.error("⚠️ Resposta do Supabase:", error.message);
      }
    } else {
      console.log("✅ Tabela 'audit_flags' encontrada e acessível com sucesso!");
    }
  } catch (err) {
    console.error("❌ Falha na requisição ao Supabase:", err.message);
  }
}

main();
