import fitz
from pathlib import Path
from typing import List
from PIL import Image

from ..core.models import Exam, PageData
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


def convert_pages_to_png(exam: Exam) -> List[PageData]:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    output_dir = config.PAGINAS_DIR / exam.arquivo.replace(".pdf", "").replace(".PDF", "")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    doc = fitz.open(pdf_path)
    pages_data = []
    
    for page_num in range(doc.page_count):
        page = doc[page_num]
        
        mat = fitz.Matrix(config.PDF_DPI / 72, config.PDF_DPI / 72)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        
        img_path = output_dir / f"page_{page_num + 1:03d}.png"
        pix.save(str(img_path))
        
        width = pix.width
        height = pix.height
        
        page_data = PageData(
            numero=page_num + 1,
            caminho_imagem=str(img_path),
            largura=width,
            altura=height
        )
        pages_data.append(page_data)
        
        logger.info(f"Página {page_num + 1}/{doc.page_count} convertida: {img_path.name} ({width}x{height})")
    
    doc.close()
    exam.paginas = pages_data
    
    return pages_data