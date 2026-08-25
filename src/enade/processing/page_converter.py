import fitz
from pathlib import Path
from typing import List, Tuple

from ..core.models import Exam, PageData
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


def detect_page_columns(page: fitz.Page) -> Tuple[int, float]:
    """
    Detects if a page is structured in 1 column or 2 columns,
    and returns (num_colunas, coluna_divisoria_x).
    """
    w = page.rect.width
    h = page.rect.height
    mid = w / 2.0
    
    blocks = page.get_text("blocks")
    # Filter out header (top 55pt) and footer (bottom 45pt), and short noise (< 15 chars)
    content_blocks = [
        b for b in blocks 
        if b[1] >= 55 and b[3] <= h - 45 and len(b[4].strip()) >= 15
    ]
    
    if not content_blocks:
        return 1, mid
        
    # Check if there are full-width paragraphs (spanning across more than 55% of page width)
    spanning_blocks = [
        b for b in content_blocks
        if (b[2] - b[0]) > 0.55 * w and len(b[4].strip()) >= 40
    ]
    if len(spanning_blocks) >= 2:
        return 1, mid
    
    # Left and right column content blocks
    left_blocks = [
        b for b in content_blocks 
        if b[2] <= mid + 20 and b[0] < mid - 40 and len(b[4].strip()) >= 20
    ]
    right_blocks = [
        b for b in content_blocks 
        if b[0] >= mid - 20 and b[2] > mid + 40 and len(b[4].strip()) >= 20
    ]
    
    # If both left and right sides have substantial content blocks
    if len(left_blocks) >= 2 and len(right_blocks) >= 2:
        return 2, mid
    
    return 1, mid


def convert_pages_to_png(exam: Exam) -> List[PageData]:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    output_dir = config.PAGINAS_DIR / exam.id_prova
    web_paginas_dir = config.QUESTOES_DIR / exam.id_prova / "paginas"
    output_dir.mkdir(parents=True, exist_ok=True)
    web_paginas_dir.mkdir(parents=True, exist_ok=True)
    
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
        
        num_cols, col_div = detect_page_columns(page)
        
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