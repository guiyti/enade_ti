import pytest
from pathlib import Path
import fitz

from src.enade.processing.orchestrator import process_exam
from src.enade.processing.pdf_discovery import PDFInfo
from src.enade.config import config


def create_sample_pdf(num_pages=3, num_questions=3):
    pdf_path = config.PROVAS_DIR / "2022_ADS_test.pdf"
    doc = fitz.open()
    for i in range(num_pages):
        page = doc.new_page(width=595, height=842)
        y = 70
        if i == 0:
            page.insert_text((50, y), "ENADE 2022 - ADS - INSTRUÇÕES", fontsize=16)
            y += 40
        elif i == 1:
            page.insert_text((50, y), "QUESTÃO 1", fontsize=14)
            y += 30
            page.insert_text((50, y), "Texto da questão 1", fontsize=12)
            y += 20
            page.insert_text((50, y), "A) Alternativa A", fontsize=11)
            y += 20
            page.insert_text((50, y), "B) Alternativa B", fontsize=11)
            y += 30
            page.insert_text((50, y), "QUESTÃO 2", fontsize=14)
            y += 30
            page.insert_text((50, y), "Texto da questão 2 inicio", fontsize=12)
        elif i == 2:
            page.insert_text((50, y), "(continuação da questão 2)", fontsize=12)
            y += 50
            page.insert_text((50, y), "QUESTÃO 3", fontsize=14)
            y += 30
            page.insert_text((50, y), "Texto da questão 3", fontsize=12)
    
    doc.save(str(pdf_path))
    doc.close()
    return pdf_path


def test_process_exam_full_pipeline():
    pdf_path = create_sample_pdf(num_pages=3, num_questions=3)
    
    pdf_info = PDFInfo(
        arquivo="2022_ADS_test.pdf",
        caminho=pdf_path,
        tamanho=pdf_path.stat().st_size,
        hash_arquivo="test_hash",
        total_paginas=3,
        ano=2022,
        curso="ADS",
        id_prova="2022_ADS_test"
    )
    
    exam = process_exam(pdf_info)
    
    assert exam.arquivo == "2022_ADS_test.pdf"
    assert exam.id_prova == "2022_ADS_test"
    assert exam.ano == 2022
    assert exam.curso == "ADS"
    assert exam.total_paginas == 3
    assert exam.questoes_detectadas >= 2
    assert exam.questoes_extraidas >= 2
    assert exam.score_geral >= 0
    assert len(exam.questoes) >= 2
    assert len(exam.paginas) == 3
    
    for q in exam.questoes:
        assert q.numero > 0
        assert q.caminho_png != ""
        assert Path(q.caminho_png).exists()
        assert q.caminho_json != ""
        assert Path(q.caminho_json).exists()
        assert q.confianca > 0
    
    for page in exam.paginas:
        assert Path(page.caminho_imagem).exists()


def test_process_exam_generates_reports():
    pdf_path = create_sample_pdf(num_pages=3, num_questions=2)
    
    pdf_info = PDFInfo(
        arquivo="2022_ADS_test.pdf",
        caminho=pdf_path,
        tamanho=pdf_path.stat().st_size,
        hash_arquivo="test_hash",
        total_paginas=3,
        ano=2022,
        curso="ADS",
        id_prova="2022_ADS_test"
    )
    
    exam = process_exam(pdf_info)
    
    report_dir = config.AUDITORIA_DIR / "2022_ADS_test"
    assert report_dir.exists()
    assert (report_dir / "relatorio.json").exists()
    
    meta_dir = config.QUESTOES_DIR / "2022_ADS_test"
    assert meta_dir.exists()
    assert (meta_dir / "metadata.json").exists()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])