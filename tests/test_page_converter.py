import pytest
from pathlib import Path
import fitz
import cv2

from src.enade.processing.page_converter import convert_pages_to_png
from src.enade.core.models import Exam
from src.enade.config import config


def test_convert_pages_to_png(tmp_path):
    pdf_path = config.PROVAS_DIR / "test.pdf"
    doc = fitz.open()
    for i in range(3):
        page = doc.new_page(width=595, height=842)
        page.insert_text((50, 50), f"Página {i+1}\nQUESTÃO {i+1}\nConteúdo da questão")
    
    doc.save(str(pdf_path))
    doc.close()
    
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="test_hash",
        total_paginas=3
    )
    
    pages = convert_pages_to_png(exam)
    
    assert len(pages) == 3
    for i, page in enumerate(pages):
        assert page.numero == i + 1
        assert page.caminho_imagem.endswith(f"page_{i+1:03d}.png")
        assert page.largura > 0
        assert page.altura > 0
        
        img = cv2.imread(page.caminho_imagem)
        assert img is not None
        assert img.shape[1] == page.largura
        assert img.shape[0] == page.altura


def test_convert_pages_preserves_resolution():
    pdf_path = config.PROVAS_DIR / "test.pdf"
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((50, 50), "Teste")
    
    doc.save(str(pdf_path))
    doc.close()
    
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="test_hash",
        total_paginas=1
    )
    
    pages = convert_pages_to_png(exam)
    
    assert len(pages) == 1
    assert pages[0].largura >= 1200
    assert pages[0].altura >= 1600


if __name__ == "__main__":
    pytest.main([__file__, "-v"])