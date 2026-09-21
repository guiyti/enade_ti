#!/usr/bin/env python3
"""
scripts/compress_questoes.py
Otimiza e comprime em lote todas as imagens PNG em public/questoes.
Mantém nomes e caminhos intactos para 100% de compatibilidade.
"""

import os
import sys
import time
from pathlib import Path
from PIL import Image

REPO_ROOT = Path(__file__).resolve().parent.parent
QUESTOES_DIR = REPO_ROOT / "public" / "questoes"
MAX_WIDTH = 1400

def has_color(im_rgb):
    """Retorna True se a imagem contiver cores perceptíveis (não apenas cinza)."""
    if im_rgb.mode != "RGB":
        im_rgb = im_rgb.convert("RGB")
    stat = Image.Image.getextrema(im_rgb)
    # Amostragem rápida de pixels para verificar saturação
    r, g, b = im_rgb.split()
    # Se r, g, b forem substancialmente diferentes
    import numpy as np
    arr = np.array(im_rgb, dtype=np.int16)
    diff = np.abs(arr[:, :, 0] - arr[:, :, 1]) + np.abs(arr[:, :, 1] - arr[:, :, 2])
    return np.mean(diff) > 3.0

def optimize_png(file_path: Path):
    orig_size = file_path.stat().st_size
    try:
        with Image.open(file_path) as im:
            # Flatten transparência se houver
            if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
                im = im.convert("RGBA")
                bg = Image.new("RGB", im.size, (255, 255, 255))
                bg.paste(im, mask=im.split()[3])
                im = bg
            elif im.mode != "RGB":
                im = im.convert("RGB")

            # Redimensionamento proporcional se largura exceder MAX_WIDTH
            w, h = im.size
            if w > MAX_WIDTH:
                new_w = MAX_WIDTH
                new_h = int(h * (MAX_WIDTH / w))
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)

            # Otimização de paleta adaptativa
            if has_color(im):
                im_opt = im.convert("P", palette=Image.ADAPTIVE, colors=128)
            else:
                im_opt = im.convert("L").convert("P", palette=Image.ADAPTIVE, colors=64)

            # Salva em arquivo temporário antes de substituir
            tmp_path = file_path.with_suffix(".tmp.png")
            im_opt.save(tmp_path, format="PNG", optimize=True)

        new_size = tmp_path.stat().st_size
        if new_size < orig_size:
            tmp_path.replace(file_path)
            return orig_size, new_size
        else:
            tmp_path.unlink(missing_ok=True)
            return orig_size, orig_size
    except Exception as e:
        print(f"Erro ao processar {file_path}: {e}", file=sys.stderr)
        return orig_size, orig_size

def main():
    if not QUESTOES_DIR.exists():
        print(f"Diretório não encontrado: {QUESTOES_DIR}")
        sys.exit(1)

    png_files = list(QUESTOES_DIR.rglob("*.png"))
    total_files = len(png_files)
    print(f"Iniciando compressão de {total_files} imagens PNG em {QUESTOES_DIR}...")

    total_orig = 0
    total_new = 0
    start_time = time.time()

    for idx, f in enumerate(png_files, 1):
        orig_sz, new_sz = optimize_png(f)
        total_orig += orig_sz
        total_new += new_sz
        if idx % 100 == 0 or idx == total_files:
            print(f"[{idx}/{total_files}] Processados... ({total_orig / (1024*1024):.1f}MB -> {total_new / (1024*1024):.1f}MB)")

    elapsed = time.time() - start_time
    saved_mb = (total_orig - total_new) / (1024 * 1024)
    pct = ((total_orig - total_new) / total_orig * 100) if total_orig > 0 else 0
    print(f"\n Concluído em {elapsed:.1f}s!")
    print(f"Tamanho Original: {total_orig / (1024*1024):.1f} MB")
    print(f"Tamanho Final:    {total_new / (1024*1024):.1f} MB")
    print(f"Economia:         {saved_mb:.1f} MB ({pct:.1f}% de redução)")

if __name__ == "__main__":
    main()
