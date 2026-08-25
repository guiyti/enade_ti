import pytest
from pathlib import Path
import cv2
import numpy as np
import fitz

from src.enade.processing.png_generator import (
    crop_segment_image,
    combine_segments_vertically,
    extract_and_save_question
)
from src.enade.core.models import Exam, Question, PageData, Segment, QuestionType
from src.enade.config import config


def create_test_image(width, height, color=(255, 255, 255)):
    return np.ones((height, width, 3), dtype=np.uint8) * np.array(color, dtype=np.uint8)


def test_crop_segment_image():
    page_img = create_test_image(595, 842, (200, 200, 200))
    seg = Segment(pagina=2, x0=50.0, y0=100.0, x1=250.0, y1=300.0, coluna=1)
    rect = fitz.Rect(0, 0, 595, 842)
    
    cropped = crop_segment_image(page_img, seg, rect)
    assert cropped.shape[1] == 200  # x1 - x0
    assert cropped.shape[0] == 200  # y1 - y0


def test_combine_segments_vertically():
    img1 = create_test_image(200, 100, (255, 0, 0))
    img2 = create_test_image(200, 150, (0, 255, 0))
    
    combined = combine_segments_vertically([img1, img2], gap_px=10)
    assert combined.shape[0] == 100 + 150 + 10 + 30
    assert combined.shape[1] == 200 + 30


def test_extract_and_save_question(tmp_path):
    pdf_path = tmp_path / "test.pdf"
    doc = fitz.open()
    doc.new_page(width=595, height=842)
    p2 = doc.new_page(width=595, height=842)
    p2.insert_text((50, 120), "QUESTÃO 1: Texto de teste", fontsize=12)
    doc.save(str(pdf_path))
    
    exam = Exam(
        id_prova="test_exam",
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=2
    )
    
    # Save a dummy page image
    img = create_test_image(595, 842)
    page_img_path = tmp_path / "page_002.png"
    cv2.imwrite(str(page_img_path), img)
    
    exam.paginas = [
        PageData(numero=1, caminho_imagem="", largura=595, altura=842),
        PageData(numero=2, caminho_imagem=str(page_img_path), largura=595, altura=842)
    ]
    
    question = Question(
        numero=1,
        id_questao="q01",
        tipo=QuestionType.OBJETIVA,
        paginas=[2],
        segmentos=[Segment(pagina=2, x0=50.0, y0=100.0, x1=400.0, y1=300.0, coluna=0)],
        caminho_png="",
        caminho_json="",
        largura=0,
        altura=0,
        confianca=0.98
    )
    
    question = extract_and_save_question(exam, question, doc)
    assert question.caminho_png.startswith("/questoes/")
    assert (config.QUESTOES_DIR / exam.id_prova / f"{question.id_questao}.png").exists()
    assert Path(question.caminho_json).exists()
    assert Path(question.caminho_txt).exists()
    assert question.largura > 0
    assert question.altura > 0
    doc.close()