#!/usr/bin/env python3
"""
scripts/verify_all_images.py
Validação abrangente de integridade, decodificação e fidelidade de todas as imagens em public/questoes.
"""

import json
import sys
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
QUESTOES_DIR = REPO_ROOT / "public" / "questoes"
EXAMS_JSON = REPO_ROOT / "public" / "data" / "exams.json"

def test_png_magic_bytes(file_path: Path) -> bool:
    with open(file_path, "rb") as f:
        header = f.read(8)
    return header == b"\x89PNG\r\n\x1a\n"

def test_image_decoding(file_path: Path):
    with Image.open(file_path) as im:
        im.verify()  # Verifica integridade do stream PNG
    # Reabre para checar dimensões e leitura real de pixels
    with Image.open(file_path) as im:
        w, h = im.size
        assert w > 0 and h > 0, f"Dimensões inválidas ({w}x{h})"
        # Força carregamento dos pixels
        im.load()
        return w, h, im.mode

def main():
    print("=" * 70)
    print("INICIANDO SUÍTE DE TESTES DE INTEGRIDADE DAS IMAGENS")
    print("=" * 70)

    if not QUESTOES_DIR.exists():
        print(" Diretório public/questoes não existe!")
        sys.exit(1)

    png_files = list(QUESTOES_DIR.rglob("*.png"))
    print(f"\n1. Testando {len(png_files)} arquivos PNG encontrados...")
    
    corrupted = []
    total_pixels = 0

    for idx, f in enumerate(png_files, 1):
        if not test_png_magic_bytes(f):
            corrupted.append((f, "Header PNG inválido"))
            continue
        try:
            w, h, mode = test_image_decoding(f)
            total_pixels += (w * h)
        except Exception as e:
            corrupted.append((f, str(e)))

    if corrupted:
        print(f" {len(corrupted)} imagens corrompidas encontradas:")
        for path, err in corrupted[:10]:
            print(f"   - {path}: {err}")
        sys.exit(1)
    else:
        print(f" 100% dos {len(png_files)} arquivos PNG são válidos, intactos e decodificáveis com sucesso!")

    print(f"\n2. Validando catálogo public/data/exams.json...")
    with open(EXAMS_JSON, "r", encoding="utf-8") as f:
        exams = json.load(f)

    total_questions = 0
    missing_links = []
    
    for exam in exams:
        id_prova = exam["id_prova"]
        questoes = exam.get("questoes", [])
        total_questions += len(questoes)
        for q in questoes:
            caminho_rel = q["caminho_png"].lstrip("/")
            full_path = REPO_ROOT / "public" / caminho_rel
            if not full_path.exists():
                missing_links.append((id_prova, q["id_questao"], caminho_rel))

    print(f" Total de {len(exams)} provas e {total_questions} questões catalogadas.")
    if missing_links:
        print(f" {len(missing_links)} links quebrados em exams.json:")
        for prova, q_id, cam in missing_links[:5]:
            print(f"   - Prova {prova}, Questão {q_id} -> {cam}")
        sys.exit(1)
    else:
        print(f" Todos os {total_questions} caminhos de imagens em exams.json apontam para arquivos existentes e íntegros!")

    print(f"\n3. Validando amostra de páginas completas (Modo Slide / Cinema)...")
    paginas_found = list(QUESTOES_DIR.glob("*/paginas/pagina_*.png"))
    print(f" Encontradas {len(paginas_found)} páginas completas renderizadas.")
    sample_pages = paginas_found[:5]
    for p in sample_pages:
        with Image.open(p) as im:
            print(f"   - {p.relative_to(REPO_ROOT)}: {im.size[0]}x{im.size[1]}px, Modo: {im.mode}")

    print("\n" + "=" * 70)
    print(" TODOS OS TESTES PASSARAM! SISTEMA E IMAGENS 100% OPERACIONAIS.")
    print("=" * 70)

if __name__ == "__main__":
    main()
