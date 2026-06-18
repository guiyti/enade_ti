import pytest
from pathlib import Path
import fitz

from src.enade.processing.structural_extractor import (
    extract_structural_data,
    extract_text_blocks,
    detect_markers_in_blocks,
    TextBlock
)
from src.enade.core.models import Exam, PageData, DetectionMethod
from src.enade.config import config


def create_test_pdf(content_lines):
    pdf_path = config.PROVAS_DIR / "test.pdf"
    doc = fitz.open()
    for i, lines in enumerate(content_lines):
        page = doc.new_page(width=595, height=842)
        y = 50
        for line in lines:
            page.insert_text((50, y), line, fontsize=12)
            y += 20
    doc.save(str(pdf_path))
    doc.close()
    return pdf_path


def test_extract_text_blocks():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "QUESTÃO 1", fontsize=14)
    page.insert_text((50, 80), "Texto da questão 1", fontsize=12)
    page.insert_text((50, 120), "QUESTÃO 2", fontsize=14)
    
    blocks = extract_text_blocks(page, 1)
    
    assert len(blocks) >= 3
    assert any("QUESTÃO 1" in b.text for b in blocks)
    assert any("QUESTÃO 2" in b.text for b in blocks)
    
    for block in blocks:
        assert block.page_num == 1
        assert block.x0 >= 0
        assert block.y0 >= 0
        assert block.x1 > block.x0
        assert block.y1 > block.y0
    
    doc.close()


def test_detect_markers_in_blocks():
    blocks = [
        TextBlock(text="QUESTÃO 1", x0=50, y0=50, x1=150, y1=70, page_num=1, font_size=14),
        TextBlock(text="Texto da questão", x0=50, y0=80, x1=200, y1=100, page_num=1, font_size=12),
        TextBlock(text="Questão 2", x0=50, y0=120, x1=150, y1=140, page_num=1, font_size=14),
        TextBlock(text="QUESTÃO 10", x0=50, y0=200, x1=160, y1=220, page_num=2, font_size=14),
    ]
    
    markers = detect_markers_in_blocks(blocks)
    
    assert len(markers) == 3
    assert markers[0].numero == 1
    assert markers[0].pagina == 1
    assert markers[0].metodo == DetectionMethod.PDF_STRUCTURE
    assert markers[1].numero == 2
    assert markers[2].numero == 10
    assert markers[2].pagina == 2


def test_extract_structural_data():
    content = [
        ["QUESTÃO 1", "Texto da questão 1", "Alternativa A", "Alternativa B"],
        ["QUESTÃO 2", "Texto da questão 2", "Alternativa C", "Alternativa D"],
        ["QUESTÃO 3", "Texto da questão 3"],
    ]
    
    pdf_path = create_test_pdf(content)
    
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="test_hash",
        total_paginas=3
    )
    
    exam.paginas = [
        PageData(numero=1, caminho_imagem="", largura=2480, altura=3508),
        PageData(numero=2, caminho_imagem="", largura=2480, altura=3508),
        PageData(numero=3, caminho_imagem="", largura=2480, altura=3508),
    ]
    
    exam, markers = extract_structural_data(exam)
    
    assert len(markers) == 3
    assert markers[0].numero == 1
    assert markers[1].numero == 2
    assert markers[2].numero == 3
    assert exam.questoes_detectadas == 3
    
    for page in exam.paginas:
        assert page.texto_estrutural != ""
        assert len(page.blocos) > 0


def test_marker_variations():
    variations = [
        ("QUESTÃO 1", 1),
        ("Questão 2", 2),
        ("questao 3", 3),
        ("Q 4", 4),
        ("q. 5", 5),
        ("10.", 10),
        ("15)", 15),
    ]
    
    blocks = [
        TextBlock(text=v[0], x0=50, y0=50+i*30, x1=150, y1=70+i*30, page_num=1, font_size=12)
        for i, v in enumerate(variations)
    ]
    
    markers = detect_markers_in_blocks(blocks)
    
    assert len(markers) == len(variations)
    for i, (_, expected_num) in enumerate(variations):
        assert markers[i].numero == expected_num


if __name__ == "__main__":
    pytest.main([__file__, "-v"])