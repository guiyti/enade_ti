import pytest
from pathlib import Path
import tempfile
import cv2
import numpy as np

from src.enade.processing.png_generator import (
    extract_question_image,
    combine_pages_vertically,
    save_question_metadata
)
from src.enade.core.models import Exam, Question, PageData


def create_test_image(width, height, color=(255, 255, 255)):
    img = np.ones((height, width, 3), dtype=np.uint8) * np.array(color, dtype=np.uint8)
    return img


def test_combine_pages_vertically():
    img1 = create_test_image(100, 50, (255, 0, 0))
    img2 = create_test_image(100, 50, (0, 255, 0))
    img3 = create_test_image(100, 50, (0, 0, 255))
    
    page_images = [
        (1, img1, PageData(numero=1, caminho_imagem="", largura=100, altura=50)),
        (2, img2, PageData(numero=2, caminho_imagem="", largura=100, altura=50)),
        (3, img3, PageData(numero=3, caminho_imagem="", largura=100, altura=50)),
    ]
    
    combined = combine_pages_vertically(page_images)
    
    assert combined.shape == (150, 100, 3)
    
    assert np.array_equal(combined[0:50, :], img1)
    assert np.array_equal(combined[50:100, :], img2)
    assert np.array_equal(combined[100:150, :], img3)


def test_combine_pages_different_widths():
    img1 = create_test_image(100, 50, (255, 0, 0))
    img2 = create_test_image(150, 50, (0, 255, 0))
    
    page_images = [
        (1, img1, PageData(numero=1, caminho_imagem="", largura=100, altura=50)),
        (2, img2, PageData(numero=2, caminho_imagem="", largura=150, altura=50)),
    ]
    
    combined = combine_pages_vertically(page_images)
    
    assert combined.shape == (100, 150, 3)


def test_extract_question_image_single_page(tmp_path):
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=1
    )
    
    img = create_test_image(500, 300)
    img_path = tmp_path / "page_001.png"
    cv2.imwrite(str(img_path), img)
    
    exam.paginas = [
        PageData(numero=1, caminho_imagem=str(img_path), largura=500, altura=300)
    ]
    
    question = Question(
        numero=1,
        paginas=[1],
        caminho_png="",
        caminho_json="",
        largura=0,
        altura=0,
        confianca=0.95
    )
    
    question = extract_question_image(exam, question)
    
    assert question.caminho_png != ""
    assert question.largura == 500
    assert question.altura == 300
    
    saved_img = cv2.imread(question.caminho_png)
    assert saved_img is not None
    assert saved_img.shape[:2] == (300, 500)


def test_extract_question_image_multi_page(tmp_path):
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=2
    )
    
    img1 = create_test_image(500, 300, (255, 0, 0))
    img2 = create_test_image(500, 400, (0, 255, 0))
    
    img_path1 = tmp_path / "page_001.png"
    img_path2 = tmp_path / "page_002.png"
    cv2.imwrite(str(img_path1), img1)
    cv2.imwrite(str(img_path2), img2)
    
    exam.paginas = [
        PageData(numero=1, caminho_imagem=str(img_path1), largura=500, altura=300),
        PageData(numero=2, caminho_imagem=str(img_path2), largura=500, altura=400),
    ]
    
    question = Question(
        numero=1,
        paginas=[1, 2],
        caminho_png="",
        caminho_json="",
        largura=0,
        altura=0,
        confianca=0.95
    )
    
    question = extract_question_image(exam, question)
    
    assert question.caminho_png != ""
    assert question.largura == 500
    assert question.altura == 700
    
    saved_img = cv2.imread(question.caminho_png)
    assert saved_img is not None
    assert saved_img.shape[:2] == (700, 500)


def test_save_question_metadata(tmp_path):
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=1
    )
    
    question = Question(
        numero=1,
        paginas=[1],
        caminho_png=str(tmp_path / "q01.png"),
        caminho_json="",
        largura=500,
        altura=300,
        confianca=0.95,
        anomalias=["TEST"]
    )
    
    question = save_question_metadata(question, exam)
    
    assert question.caminho_json != ""
    assert Path(question.caminho_json).exists()
    
    import json
    with open(question.caminho_json, "r") as f:
        data = json.load(f)
    
    assert data["numero"] == 1
    assert data["paginas"] == [1]
    assert data["confianca"] == 0.95
    assert data["anomalias"] == ["TEST"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])