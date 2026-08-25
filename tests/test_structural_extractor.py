import pytest
from pathlib import Path
import fitz

from src.enade.processing.structural_extractor import (
    extract_structural_data,
    extract_text_blocks,
    detect_markers_in_page,
    decode_enade_str,
    TextBlock
)
from src.enade.core.models import Exam, PageData, DetectionMethod, QuestionType
from src.enade.config import config


def create_test_pdf(content_lines):
    pdf_path = config.PROVAS_DIR / "test.pdf"
    doc = fitz.open()
    for i, lines in enumerate(content_lines):
        page = doc.new_page(width=595, height=842)
        y = 70
        for line in lines:
            page.insert_text((50, y), line, fontsize=12)
            y += 25
    doc.save(str(pdf_path))
    doc.close()
    return pdf_path


def test_decode_enade_str():
    # Corrupted CMap characters
    encoded = "Yh\x1c^d\x08K\x03Ϭϰ\x03"
    decoded = decode_enade_str(encoded)
    assert "QUESTÃO" in decoded
    assert "04" in decoded


def test_extract_text_blocks():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((50, 70), "QUESTÃO 1", fontsize=14)
    page.insert_text((50, 100), "Texto da questão 1", fontsize=12)
    page.insert_text((50, 140), "QUESTÃO 2", fontsize=14)
    
    blocks = extract_text_blocks(page, 1, num_colunas=1, mid_x=297.5)
    
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


def test_detect_markers_in_page():
    doc = fitz.open()
    page = doc.new_page(width=595, height=842)
    page.insert_text((50, 70), "QUESTÃO DISCURSIVA 01", fontsize=14)
    page.insert_text((50, 100), "Texto discursivo", fontsize=12)
    page.insert_text((50, 200), "QUESTÃO 01", fontsize=14)
    
    blocks = extract_text_blocks(page, 2, num_colunas=1, mid_x=297.5)
    markers, contexts = detect_markers_in_page(page, 2, 1, 297.5, blocks)
    
    assert len(markers) == 2
    assert markers[0].tipo == QuestionType.DISCURSIVA
    assert markers[0].numero == 1
    assert markers[1].tipo == QuestionType.OBJETIVA
    assert markers[1].numero == 1
    doc.close()


def test_extract_structural_data():
    content = [
        ["CADERNO DE QUESTÕES", "Instruções gerais"],  # Page 1 (Cover - skipped)
        ["QUESTÃO DISCURSIVA 1", "Texto da questão discursiva"],
        ["QUESTÃO 1", "Texto da questão 1", "Alternativa A", "Alternativa B"],
        ["QUESTÃO 2", "Texto da questão 2"],
    ]
    
    pdf_path = create_test_pdf(content)
    
    exam = Exam(
        id_prova="test_exam",
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="test_hash",
        total_paginas=4
    )
    
    exam.paginas = [
        PageData(numero=1, caminho_imagem="", largura=595, altura=842, num_colunas=1, coluna_divisoria_x=297.5),
        PageData(numero=2, caminho_imagem="", largura=595, altura=842, num_colunas=1, coluna_divisoria_x=297.5),
        PageData(numero=3, caminho_imagem="", largura=595, altura=842, num_colunas=1, coluna_divisoria_x=297.5),
        PageData(numero=4, caminho_imagem="", largura=595, altura=842, num_colunas=1, coluna_divisoria_x=297.5),
    ]
    
    exam, markers, contexts = extract_structural_data(exam)
    
    assert len(markers) == 3
    assert markers[0].tipo == QuestionType.DISCURSIVA
    assert markers[0].numero == 1
    assert markers[1].tipo == QuestionType.OBJETIVA
    assert markers[1].numero == 1
    assert markers[2].tipo == QuestionType.OBJETIVA
    assert markers[2].numero == 2