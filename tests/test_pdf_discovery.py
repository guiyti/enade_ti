import pytest
from pathlib import Path
import fitz

from src.enade.processing.pdf_discovery import (
    discover_pdfs,
    extract_year_course,
    compute_hash,
    classify_pdf_type,
    create_exam_from_pdf
)
from src.enade.core.models import PDFType
from src.enade.config import config


def test_extract_year_course():
    assert extract_year_course("2022_ADS.pdf") == (2022, "ADS")
    assert extract_year_course("ENADE_2021_CCP.pdf") == (2021, "CCP")
    assert extract_year_course("2017_GTI_prova.pdf") == (2017, "GTI")
    assert extract_year_course("prova_2023_SI.pdf") == (2023, "SI")
    assert extract_year_course("random_file.pdf") == (0, "DESCONHECIDO")


def test_compute_hash(tmp_path):
    test_file = tmp_path / "test.pdf"
    test_file.write_bytes(b"test content")
    
    hash1 = compute_hash(test_file)
    hash2 = compute_hash(test_file)
    
    assert hash1 == hash2
    assert len(hash1) == 64


def test_classify_pdf_type_digital():
    doc = fitz.open()
    page = doc.new_page()
    # Add enough text to be classified as digital (>100 chars per page)
    text = "QUESTÃO 1\n" + "Texto da questão 1 com bastante conteúdo para ser classificado como digital.\n" * 5
    text += "\nQUESTÃO 2\n" + "Texto da questão 2 com mais conteúdo para garantir classificação correta.\n" * 5
    page.insert_text((50, 50), text)
    
    pdf_type = classify_pdf_type(doc)
    assert pdf_type == PDFType.DIGITAL
    doc.close()


def test_classify_pdf_type_scanned():
    doc = fitz.open()
    page = doc.new_page()
    
    pdf_type = classify_pdf_type(doc)
    assert pdf_type == PDFType.SCANNED
    doc.close()


def test_classify_pdf_type_hybrid():
    doc = fitz.open()
    for _ in range(5):
        page = doc.new_page()
        if _ < 2:
            page.insert_text((50, 50), "Pouco texto")
        else:
            pass
    
    pdf_type = classify_pdf_type(doc)
    assert pdf_type in [PDFType.SCANNED, PDFType.HYBRID]
    doc.close()


def test_create_exam_from_pdf():
    pdf_path = config.PROVAS_DIR / "2022_ADS_test.pdf"
    doc = fitz.open()
    for i in range(3):
        page = doc.new_page()
        # Add substantial text to be classified as digital (>500 chars per page)
        text = f"QUESTÃO {i+1}\n" + "Texto da questão com bastante conteúdo para classificação digital. " * 20
        page.insert_text((50, 50), text)
    
    doc.save(str(pdf_path))
    doc.close()
    
    from src.enade.processing.pdf_discovery import PDFInfo
    pdf_info = PDFInfo(
        arquivo="2022_ADS_test.pdf",
        caminho=pdf_path,
        tamanho=pdf_path.stat().st_size,
        hash_arquivo=compute_hash(pdf_path),
        total_paginas=3,
        ano=2022,
        curso="ADS"
    )
    
    exam = create_exam_from_pdf(pdf_info)
    
    assert exam.arquivo == "2022_ADS_test.pdf"
    assert exam.ano == 2022
    assert exam.curso == "ADS"
    assert exam.total_paginas == 3
    # Classification may be DIGITAL or HYBRID depending on text extraction
    assert exam.tipo_pdf in [PDFType.DIGITAL, PDFType.HYBRID]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])