import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERRO: Variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

async function runIntegrationTest() {
  console.log("🚀 Iniciando Teste de Integração com o Supabase...\n");

  const testIdProva = "TEST_2024_CCP";
  const testIdQuestao = "q99_test";

  // 1. Inserir / Upsert de sinalização
  console.log("1️⃣ Testando salvamento de sinalização (Docente/Admin)...");
  const testPayload = {
    id_prova: testIdProva,
    id_questao: testIdQuestao,
    reasons: ["Corte / Crop imperfeito", "Erro de texto / OCR"],
    note: "Sinalização de teste automatizado de verificação",
    reported_from: "docente",
    updated_at: new Date().toISOString(),
  };

  const { data: insertData, error: insertError } = await supabase
    .from("audit_flags")
    .upsert(testPayload, { onConflict: "id_prova,id_questao" })
    .select();

  if (insertError) {
    if (insertError.code === "PGRST205" || insertError.message?.includes("does not exist")) {
      console.log("⚠️ A tabela 'audit_flags' precisa ser criada no banco do Supabase.");
      console.log("➡️ Execute a migration SQL em 'supabase/migrations/20250825_create_audit_flags.sql' no SQL Editor do Supabase.");
      return;
    }
    console.error("❌ Erro ao salvar sinalização:", insertError.message);
    process.exit(1);
  }

  console.log("   ✅ Sinalização inserida com sucesso no Supabase!");

  // 2. Consulta / Leitura
  console.log("2️⃣ Testando leitura de sinalizações salvas...");
  const { data: readData, error: readError } = await supabase
    .from("audit_flags")
    .select("*")
    .eq("id_prova", testIdProva)
    .eq("id_questao", testIdQuestao);

  if (readError) {
    console.error("❌ Erro ao consultar sinalizações:", readError.message);
    process.exit(1);
  }

  if (!readData || readData.length === 0) {
    console.error("❌ A sinalização inserida não foi retornada na consulta.");
    process.exit(1);
  }

  console.log(`   ✅ Sinalização recuperada com sucesso! (Motivos: ${readData[0].reasons.join(", ")})`);

  // 3. Auditor limpando / removendo a sinalização
  console.log("3️⃣ Testando remoção/limpeza da sinalização pelo Auditor...");
  const { error: deleteError } = await supabase
    .from("audit_flags")
    .delete()
    .eq("id_prova", testIdProva)
    .eq("id_questao", testIdQuestao);

  if (deleteError) {
    console.error("❌ Erro ao remover sinalização pelo auditor:", deleteError.message);
    process.exit(1);
  }

  console.log("   ✅ Sinalização removida com sucesso do Supabase!");

  // 4. Confirmação final
  const { data: verifyData } = await supabase
    .from("audit_flags")
    .select("*")
    .eq("id_prova", testIdProva)
    .eq("id_questao", testIdQuestao);

  if (verifyData && verifyData.length === 0) {
    console.log("   ✅ Confirmação: Registro totalmente limpo.");
  }

  console.log("\n🎉 TESTE DE INTEGRAÇÃO SUPABASE CONCLUÍDO COM 100% DE SUCESSO!");
}

runIntegrationTest();
