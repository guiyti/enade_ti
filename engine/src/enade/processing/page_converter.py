import fitz
from pathlib import Path
from typing import List, Tuple

from ..core.models import Exam, PageData
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


def detect_page_columns(
    page: fitz.Page,
    header_cutoff_y: float = 0.0,
    footer_cutoff_y: float = 0.0
) -> Tuple[int, float]:
    """
    Detects if a page is structured in 1 column or 2 columns,
    and returns (num_colunas, coluna_divisoria_x).
    Uses adaptive header/footer boundaries and gutter separation analysis.
    """
    w = page.rect.width
    h = page.rect.height
    mid = w / 2.0
    
    y_top = header_cutoff_y if header_cutoff_y > 0 else 55.0
    y_bot = footer_cutoff_y if footer_cutoff_y > 0 else (h - 45.0)
    
    blocks = page.get_text("blocks")
    # Filter out header and footer, and short noise (< 8 chars)
    content_blocks = [
        b for b in blocks 
        if b[1] >= y_top and b[3] <= y_bot and len(b[4].strip()) >= 8
    ]
    
    if not content_blocks:
        return 1, mid
        
    best_div = mid
    max_sep = 0
    
    # Test candidate vertical dividing lines between 38% and 62% width
    for div_cand in [w * ratio for ratio in [0.42, 0.45, 0.48, 0.50, 0.52, 0.55, 0.58]]:
        left = [b for b in content_blocks if b[2] <= div_cand + 15]
        right = [b for b in content_blocks if b[0] >= div_cand - 15]
        spanning = [
            b for b in content_blocks 
            if b[0] < div_cand - 30 and b[2] > div_cand + 30 and (b[2] - b[0]) > 0.60 * w
        ]
        
        sep_score = len(left) + len(right) - (len(spanning) * 3)
        if len(left) >= 2 and len(right) >= 2 and sep_score > max_sep:
            max_sep = sep_score
            best_div = div_cand
            
    if max_sep > 0:
        return 2, best_div
    
    return 1, mid


def convert_pages_to_png(exam: Exam) -> List[PageData]:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    output_dir = config.PAGINAS_DIR / exam.id_prova
    web_paginas_dir = config.QUESTOES_DIR / exam.id_prova / "paginas"
    output_dir.mkdir(parents=True, exist_ok=True)
    web_paginas_dir.mkdir(parents=True, exist_ok=True)
    
    hdr_cut = 55.0
    ftr_cut = 0.0
    if exam.layout_profile:
        hdr_cut = exam.layout_profile.get("header_cutoff_y", 55.0)
        ftr_cut = exam.layout_profile.get("footer_cutoff_y", 0.0)
    
    doc = fitz.open(pdf_path)
    pages_data = []
    
    for page_num in range(doc.page_count):
        page = doc[page_num]
        
        mat = fitz.Matrix(config.PDF_DPI / 72.0, config.PDF_DPI / 72.0)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        img_path = output_dir / f"page_{page_num + 1:03d}.png"
        web_img_path = web_paginas_dir / f"pagina_{page_num + 1}.png"
        
        pix.save(str(img_path))
        pix.save(str(web_img_path))
        
        width = pix.width
        height = pix.height
        
        num_cols, col_div = detect_page_columns(page, header_cutoff_y=hdr_cut, footer_cutoff_y=ftr_cut)
        
        page_data = PageData(
            numero=page_num + 1,
            caminho_imagem=str(img_path),
            largura=width,
            altura=height,
            num_colunas=num_cols,
            coluna_divisoria_x=col_div
        )
        pages_data.append(page_data)
        
        logger.info(f"Página {page_num + 1}/{doc.page_count} convertida: {img_path.name} ({width}x{height}, {num_cols} col)")
    
    doc.close()
    exam.paginas = pages_data
    
    return pages_data