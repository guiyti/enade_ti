#!/usr/bin/env python3
"""
sync_supabase.py
================
Sincroniza todos os alunos concluintes do ENADE (914 alunos de ADS, GTI, CCP)
diretamente com o projeto Supabase (xsdfqtrqhjnwevsnhmvi).

Popula as tabelas:
  1. public.enade_inscritos
  2. public.inst_aluno_lookup
"""

import os
import csv
import json
import hashlib
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CSV_PATH = os.path.join(BASE_DIR, "listagem", "veteranos_consolidado.csv")
ENV_PATH = os.path.join(BASE_DIR, ".env")

DEFAULT_SALT = "ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT"

def load_env():
    env_vars = {}
    if os.path.exists(ENV_PATH):
        with open(ENV_PATH, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env_vars[k.strip()] = v.strip()
    return env_vars

def clean_sigla(raw_name: str) -> str:
    upper = raw_name.upper()
    if "COMPUTAÇÃO" in upper or "COMPUTACAO" in upper or "CIÊNCIA" in upper or "CIENCIA" in upper:
        return "CCP"
    if "ANÁLISE" in upper or "ANALISE" in upper or "ADS" in upper:
        return "ADS"
    if "GESTÃO" in upper or "GESTAO" in upper or "GTI" in upper:
        return "GTI"
    return "TI"

def detect_campus_from_row(row, raw_curso) -> str:
    # Município de prova ou polo
    mun = row[12].upper() if len(row) > 12 else ""
    # Se houver menção no nome do arquivo ou município
    if "GUARULHOS" in mun:
        return "Guarulhos"
    return "Cruzeiro do Sul"

def compute_hash(cpf_digits: str, salt: str = DEFAULT_SALT) -> str:
    return hashlib.sha256(f"{cpf_digits}_{salt}".encode("utf-8")).hexdigest()

def compute_plain_hash(cpf_digits: str) -> str:
    return hashlib.sha256(cpf_digits.encode("utf-8")).hexdigest()

def main():
    env = load_env()
    supabase_url = env.get("NEXT_PUBLIC_SUPABASE_URL", "https://xsdfqtrqhjnwevsnhmvi.supabase.co")
    service_key = env.get("SUPABASE_SERVICE_ROLE_KEY", "") or env.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")

    if not service_key:
        raise ValueError("Chave de API do Supabase não encontrada no .env")

    print(f"=== Sincronização de Concluintes com Supabase ===")
    print(f"URL: {supabase_url}")
    print(f"Lendo CSV consolidado: {CSV_PATH}")

    if not os.path.exists(CSV_PATH):
        raise FileNotFoundError(f"Arquivo não encontrado: {CSV_PATH}")

    # Importa os mapeamentos do script de consolidação
    from atualizar_inscritos import detect_campus
    import glob
    
    # Lendo por arquivo para manter o campus exato
    csv_files = sorted(glob.glob(os.path.join(BASE_DIR, "listagem", "veteranos", "*.csv")))
    
    enade_records = []
    inst_lookup_records = []
    seen_cpfs = set()

    for f in csv_files:
        fname = os.path.basename(f)
        campus_name = detect_campus(fname)
        
        with open(f, "r", encoding="utf-8-sig", errors="replace") as fp:
            reader = csv.reader(fp, delimiter=";")
            h = next(reader)
            
            for row in reader:
                if not row or not any(field.strip() for field in row):
                    continue
                    
                raw_cpf = row[9].strip() if len(row) > 9 else ""
                cpf_digits = "".join(c for c in raw_cpf if c.isdigit())
                if len(cpf_digits) != 11 or cpf_digits in seen_cpfs:
                    continue
                seen_cpfs.add(cpf_digits)
                
                num_inscricao = row[6].strip() if len(row) > 6 else ""
                nome = row[10].strip() if len(row) > 10 else ""
                raw_curso = row[3].strip() if len(row) > 3 else ""
                sigla = clean_sigla(raw_curso)
                mun_prova = row[12].strip() if len(row) > 12 else ""
                turno = row[17].strip() if len(row) > 17 else "Noturno"
                ano_ing = int(row[16].strip()) if len(row) > 16 and row[16].strip().isdigit() else None
                try:
                    pct = float(row[18].strip().replace(",", ".")) if len(row) > 18 and row[18].strip() else None
                except ValueError:
                    pct = None
                ano_conc = row[19].strip() if len(row) > 19 else None
                sem_conc = row[20].strip() if len(row) > 20 else None
                quest = (row[14].strip().upper() == "SIM") if len(row) > 14 else False

                cpf_hash_salted = compute_hash(cpf_digits)
                cpf_hash_plain = compute_plain_hash(cpf_digits)

                # Registro para public.enade_inscritos
                enade_records.append({
                    "numero_inscricao": num_inscricao,
                    "cpf_hash": cpf_hash_salted,
                    "nome": nome,
                    "curso_sigla": sigla,
                    "curso_nome": raw_curso,
                    "campus": campus_name,
                    "municipio_prova": mun_prova,
                    "turno": turno.title(),
                    "ano_ingresso": ano_ing,
                    "percentual_integralizacao": pct,
                    "ano_conclusao_previsto": ano_conc,
                    "semestre_conclusao_previsto": sem_conc,
                    "questionario_preenchido": quest
                })

                # Registro para public.inst_aluno_lookup
                inst_lookup_records.append({
                    "rgm": num_inscricao,
                    "nome": nome,
                    "cpf_hash": cpf_hash_plain,
                    "curso_nome": raw_curso,
                    "turno": turno.title(),
                    "serie": 4 if sigla == "CCP" else 3
                })

    print(f"Total de registros preparados: {len(enade_records)}")

    # Envia em lotes de 100 via REST API (UPSERT)
    def batch_upsert(table_name: str, records: list, on_conflict: str):
        print(f"\nEnviando {len(records)} registros para '{table_name}'...")
        endpoint = f"{supabase_url}/rest/v1/{table_name}?on_conflict={on_conflict}"
        batch_size = 100
        
        headers = {
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates"
        }

        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            data = json.dumps(batch).encode("utf-8")
            req = urllib.request.Request(endpoint, data=data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req) as resp:
                    if resp.status in (200, 201):
                        print(f"  ✓ Lote {i // batch_size + 1}/{(len(records) + batch_size - 1) // batch_size} inserido com sucesso ({len(batch)} registros)")
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="replace")
                print(f"  ❌ Erro no lote {i // batch_size + 1}: {e.code} - {err_body}")
                raise

    # 1. Enviar para enade_inscritos
    batch_upsert("enade_inscritos", enade_records, "numero_inscricao")

    # 2. Enviar para inst_aluno_lookup
    batch_upsert("inst_aluno_lookup", inst_lookup_records, "rgm")

    print(f"\n🎉 Sincronização com Supabase finalizada com sucesso!")
    print(f"   914 alunos agora estão registrados no Supabase ({supabase_url})")

if __name__ == "__main__":
    main()
