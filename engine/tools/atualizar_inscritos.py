#!/usr/bin/env python3
"""
atualizar_inscritos.py
======================
Script utilitário para atualizar a base de hashes de alunos inscritos no ENADE
(Zero-DB, formato hiper-compacto agrupado por Curso:Campus, sem dados redundantes).

MODO 1: A partir dos arquivos CSV oficiais (com todas as colunas)
    python3 engine/tools/atualizar_inscritos.py --modo csv

MODO 2: A partir de um arquivo contendo APENAS os CPFs (um por linha ou coluna simples)
    python3 engine/tools/atualizar_inscritos.py --cpfs caminho/para/lista_cpfs.txt
"""

import os
import sys
import glob
import csv
import json
import hashlib
import argparse
from datetime import datetime, timezone

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_VETERANOS_DIR = os.path.join(BASE_DIR, "listagem", "veteranos")
DEFAULT_OUTPUT_CSV = os.path.join(BASE_DIR, "listagem", "veteranos_consolidado.csv")
DEFAULT_OUTPUT_JSON = os.path.join(BASE_DIR, "src", "data", "inscricoes_hashes.json")

DEFAULT_SALT = os.environ.get("ENADE_CPF_SALT", "ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT")

CAMPUS_MAP = {
    "AF": "Anália Franco",
    "GUA": "Guarulhos",
    "LIB": "Liberdade",
    "PTA": "Paulista",
    "SA": "Santo Amaro",
    "SM": "São Miguel",
    "VL": "Villa-Lobos",
}

def clean_sigla(raw_name: str) -> str:
    upper = raw_name.upper()
    if "ANÁLISE" in upper or "ANALISE" in upper:
        return "ADS"
    if "GESTÃO" in upper or "GESTAO" in upper:
        return "GTI"
    if "COMPUTAÇÃO" in upper or "COMPUTACAO" in upper:
        return "CCP"
    return "TI"

def compute_cpf_hash(cpf_digits: str, salt: str = DEFAULT_SALT) -> str:
    payload = f"{cpf_digits}_{salt}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()

def processar_modo_csv(dir_path: str, output_csv: str, output_json: str, salt: str):
    print(f"\n📂 [MODO CSV] Lendo pastas de CSVs em: {dir_path}")
    csv_files = sorted(glob.glob(os.path.join(dir_path, "*.csv")))
    
    if not csv_files:
        print(f"❌ Nenhum arquivo .csv encontrado em '{dir_path}'", file=sys.stderr)
        sys.exit(1)
        
    all_rows = []
    header = None
    grupos = {}
    total_cpfs = 0
    
    for f in csv_files:
        fname = os.path.basename(f)
        prefix = fname.split("_")[0]
        campus_name = CAMPUS_MAP.get(prefix, prefix)
        
        with open(f, "r", encoding="utf-8-sig", errors="replace") as fp:
            reader = csv.reader(fp, delimiter=";")
            h = next(reader)
            if header is None:
                header = h
                
            cpf_idx = 9
            for idx, col_name in enumerate(h):
                if "CPF" in col_name.upper():
                    cpf_idx = idx
                    break
                    
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
                    
                h_val = compute_cpf_hash(cpf_digits, salt)
                grupos[group_key].append(h_val)
                total_cpfs += 1

    # Salva CSV consolidado
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    with open(output_csv, "w", encoding="utf-8-sig", newline="") as fp:
        writer = csv.writer(fp, delimiter=";")
        writer.writerow(header)
        writer.writerows(all_rows)
        
    salvar_json_compacto(grupos, total_cpfs, output_json, salt)

def processar_modo_apenas_cpfs(filepath: str, output_json: str, salt: str, sigla_padrao: str, campus_padrao: str):
    print(f"\n📋 [MODO APENAS CPFs] Lendo lista de CPFs em: {filepath}")
    
    if not os.path.exists(filepath):
        print(f"❌ Arquivo não encontrado: '{filepath}'", file=sys.stderr)
        sys.exit(1)
        
    group_key = f"{sigla_padrao}:{campus_padrao}"
    hashes = []
    
    with open(filepath, "r", encoding="utf-8-sig", errors="replace") as fp:
        for line in fp:
            line = line.strip()
            if not line or "CPF" in line.upper():
                continue
            digits = "".join(c for c in line if c.isdigit())
            # Trata se tiver colunas separadas
            if len(digits) != 11:
                parts = [p.strip() for p in line.replace(";", ",").replace("\t", ",").split(",") if p.strip()]
                for p in parts:
                    d = "".join(c for c in p if c.isdigit())
                    if len(d) == 11:
                        digits = d
                        break
            if len(digits) == 11:
                h_val = compute_cpf_hash(digits, salt)
                hashes.append(h_val)
                
    grupos = {group_key: hashes}
    salvar_json_compacto(grupos, len(hashes), output_json, salt)

def salvar_json_compacto(grupos: dict, total: int, output_json: str, salt: str):
    os.makedirs(os.path.dirname(output_json), exist_ok=True)
    payload = {
        "version": "2026.1",
        "salt": salt,
        "total": total,
        "grupos": grupos,
    }
    with open(output_json, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, ensure_ascii=False, indent=2)
        
    size_kb = os.path.getsize(output_json) / 1024
    print(f"✅ Base de hashes compacta gerada: {output_json}")
    print(f"   Total de inscritos: {total}")
    print(f"   Grupos configurados: {len(grupos)}")
    print(f"   Tamanho do JSON: {size_kb:.1f} KB (otimizado!)")

def main():
    parser = argparse.ArgumentParser(description="Atualizador Compacto de Inscrições do ENADE")
    parser.add_argument("--modo", choices=["csv", "cpfs"], default="csv")
    parser.add_argument("--cpfs", type=str, default=None)
    parser.add_argument("--dir-csv", type=str, default=DEFAULT_VETERANOS_DIR)
    parser.add_argument("--output-csv", type=str, default=DEFAULT_OUTPUT_CSV)
    parser.add_argument("--output-json", type=str, default=DEFAULT_OUTPUT_JSON)
    parser.add_argument("--salt", type=str, default=DEFAULT_SALT)
    parser.add_argument("--sigla-padrao", type=str, default="TI")
    parser.add_argument("--campus-padrao", type=str, default="Cruzeiro do Sul")

    args = parser.parse_args()

    if args.cpfs:
        processar_modo_apenas_cpfs(args.cpfs, args.output_json, args.salt, args.sigla_padrao, args.campus_padrao)
    else:
        processar_modo_csv(args.dir_csv, args.output_csv, args.output_json, args.salt)

if __name__ == "__main__":
    main()
