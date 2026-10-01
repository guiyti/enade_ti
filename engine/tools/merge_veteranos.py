#!/usr/bin/env python3
"""
merge_veteranos.py
Consolida todos os 16 arquivos CSV de concluintes do ENADE (ADS, GTI, CCP)
e gera a base de hashes compacta (Zero-DB) agrupada por Curso:Campus.
"""

import os
import glob
import csv
import json
import hashlib
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
VETERANOS_DIR = os.path.join(BASE_DIR, "listagem", "veteranos")
OUTPUT_CSV = os.path.join(BASE_DIR, "listagem", "veteranos_consolidado.csv")
OUTPUT_JSON = os.path.join(BASE_DIR, "src", "data", "inscricoes_hashes.json")

DEFAULT_SALT = os.environ.get("ENADE_CPF_SALT", "ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT")

def detect_campus(fname: str) -> str:
    fname_upper = fname.upper()
    if "ANALIA" in fname_upper or fname.startswith("AF_") or "_AF_" in fname_upper:
        return "Anália Franco"
    if "GUARULHOS" in fname_upper or fname.startswith("GUA_") or "_GUA_" in fname_upper:
        return "Guarulhos"
    if "LIBERDADE" in fname_upper or fname.startswith("LIB_") or "_LIB_" in fname_upper:
        return "Liberdade"
    if "PAULISTA" in fname_upper or fname.startswith("PTA_") or "_PTA_" in fname_upper:
        return "Paulista"
    if "SANTOAMARO" in fname_upper or "SANTO_AMARO" in fname_upper or fname.startswith("SA_") or "_SA_" in fname_upper:
        return "Santo Amaro"
    if "SAOMIGUEL" in fname_upper or "SAO_MIGUEL" in fname_upper or fname.startswith("SM_") or "_SM_" in fname_upper:
        return "São Miguel"
    if "VILALOBOS" in fname_upper or "VILLALOBOS" in fname_upper or fname.startswith("VL_") or "_VL_" in fname_upper:
        return "Villa-Lobos"
    return "Cruzeiro do Sul"

def clean_sigla(raw_name: str) -> str:
    upper = raw_name.upper()
    if "COMPUTAÇÃO" in upper or "COMPUTACAO" in upper or "CIÊNCIA" in upper or "CIENCIA" in upper:
        return "CCP"
    if "ANÁLISE" in upper or "ANALISE" in upper or "ADS" in upper:
        return "ADS"
    if "GESTÃO" in upper or "GESTAO" in upper or "GTI" in upper:
        return "GTI"
    return "TI"

def compute_cpf_hash(cpf_digits: str, salt: str = DEFAULT_SALT) -> str:
    payload = f"{cpf_digits}_{salt}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()

def main():
    csv_files = sorted(glob.glob(os.path.join(VETERANOS_DIR, "*.csv")))
    if not csv_files:
        raise FileNotFoundError(f"Nenhum arquivo CSV encontrado em {VETERANOS_DIR}")
        
    all_rows = []
    header = None
    grupos = {}
    total_cpfs = 0
    unique_cpfs = set()
    
    for f in csv_files:
        fname = os.path.basename(f)
        campus_name = detect_campus(fname)
        
        with open(f, "r", encoding="utf-8-sig", errors="replace") as fp:
            reader = csv.reader(fp, delimiter=";")
            h = next(reader)
            if header is None:
                header = h
                
            cpf_idx = 9
            for idx, col in enumerate(h):
                if "CPF" in col.upper():
                    cpf_idx = idx
                    break
                    
            count_file = 0
            for row in reader:
                if not row or not any(field.strip() for field in row):
                    continue
                all_rows.append(row)
                raw_cpf = row[cpf_idx].strip() if len(row) > cpf_idx else ""
                cpf_digits = "".join(c for c in raw_cpf if c.isdigit())
                if len(cpf_digits) != 11:
                    continue
                    
                raw_curso = row[3].strip() if len(row) > 3 else ""
                sigla = clean_sigla(raw_curso)
                group_key = f"{sigla}:{campus_name}"
                
                if group_key not in grupos:
                    grupos[group_key] = []
                    
                h_val = compute_cpf_hash(cpf_digits)
                grupos[group_key].append(h_val)
                unique_cpfs.add(cpf_digits)
                count_file += 1
                total_cpfs += 1
                
            print(f"   • {fname} -> {count_file} alunos ({campus_name} - {sigla})")

    # 1. Salvar CSV Consolidado
    os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
    with open(OUTPUT_CSV, "w", encoding="utf-8-sig", newline="") as fp:
        writer = csv.writer(fp, delimiter=";")
        writer.writerow(header)
        writer.writerows(all_rows)
        
    # 2. Salvar JSON compacto
    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)
    payload = {
        "version": "2026.1",
        "salt": DEFAULT_SALT,
        "total": len(unique_cpfs),
        "grupos": grupos,
    }
    with open(OUTPUT_JSON, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, indent=2)
        
    print(f"\n🎉 Sucesso! {len(unique_cpfs)} concluintes únicos consolidados em {len(grupos)} grupos de curso/campus.")
    print(f"   CSV: {OUTPUT_CSV}")
    print(f"   JSON: {OUTPUT_JSON} ({os.path.getsize(OUTPUT_JSON)/1024:.1f} KB)")

if __name__ == "__main__":
    main()
