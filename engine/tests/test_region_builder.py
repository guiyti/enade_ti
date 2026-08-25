import pytest
from src.enade.processing.region_builder import (
    build_questions_from_markers,
    build_page_slots,
    validate_sequence
)
from src.enade.core.models import Marker, DetectionMethod, Exam, PageData, Question, QuestionType, QuestionStatus


def create_marker(num, page, y, col=0, q_type=QuestionType.OBJETIVA, method=DetectionMethod.PDF_STRUCTURE, conf=0.95):
    return Marker(
        numero=num,
        tipo=q_type,
        pagina=page,
        x=50.0 if col <= 1 else 320.0,
        y=y,
        x1=250.0 if col <= 1 else 550.0,
        y1=y + 20.0,
        coluna=col,
        metodo=method,
        confianca=conf,
        texto_original=f"QUESTÃO {num}"
    )


def test_build_page_slots():
    pages = [
        PageData(numero=1, caminho_imagem="", largura=595, altura=842, num_colunas=1), # skipped (cover)
        PageData(numero=2, caminho_imagem="", largura=595, altura=842, num_colunas=1),
        PageData(numero=3, caminho_imagem="", largura=595, altura=842, num_colunas=2),
    ]
    slots = build_page_slots(pages)
    assert len(slots) == 3 # 1 for page 2, 2 for page 3
    assert slots[0].pagina == 2
    assert slots[0].coluna == 0
    assert slots[1].pagina == 3
    assert slots[1].coluna == 1
    assert slots[2].pagina == 3
    assert slots[2].coluna == 2


def test_build_questions_single_page():
    exam = Exam(id_prova="test_exam", arquivo="test.pdf", ano=2022, curso="ADS", hash_arquivo="hash", total_paginas=2)
    exam.paginas = [
        PageData(numero=1, caminho_imagem="", largura=595, altura=842, num_colunas=1),
        PageData(numero=2, caminho_imagem="", largura=595, altura=842, num_colunas=1),
    ]
    
    markers = [
        create_marker(1, 2, 100),
        create_marker(2, 2, 400),
    ]
    
    questions = build_questions_from_markers(exam, markers)
    assert len(questions) == 2
    assert questions[0].id_questao == "q01"
    assert questions[0].numero == 1
    assert len(questions[0].segmentos) == 1
    assert questions[0].segmentos[0].y0 <= 100
    assert questions[0].segmentos[0].y1 <= 400
    
    assert questions[1].id_questao == "q02"
    assert questions[1].numero == 2


def test_build_questions_2_column_page():
    exam = Exam(id_prova="test_exam", arquivo="test.pdf", ano=2022, curso="ADS", hash_arquivo="hash", total_paginas=2)
    exam.paginas = [
        PageData(numero=1, caminho_imagem="", largura=595, altura=842, num_colunas=1),
        PageData(numero=2, caminho_imagem="", largura=595, altura=842, num_colunas=2),
    ]
    
    markers = [
        create_marker(13, 2, 80, col=1), # left column
        create_marker(14, 2, 80, col=2), # right column top
        create_marker(15, 2, 350, col=2), # right column bottom
    ]
    
    questions = build_questions_from_markers(exam, markers)
    assert len(questions) == 3
    # Q13 is in left column (coluna 1)
    assert questions[0].numero == 13
    assert questions[0].segmentos[0].coluna == 1
    assert questions[0].segmentos[0].x1 < 295.0
    
    # Q14 and Q15 are in right column (coluna 2)
    assert questions[1].numero == 14
    assert questions[1].segmentos[0].coluna == 2
    assert questions[1].segmentos[0].x0 > 295.0
    assert questions[1].segmentos[0].y1 <= 350.0
    
    assert questions[2].numero == 15
    assert questions[2].segmentos[0].coluna == 2
    assert questions[2].segmentos[0].x0 > 295.0


def test_validate_sequence_ok():
    questions = [
        Question(numero=1, id_questao="qd01", tipo=QuestionType.DISCURSIVA, paginas=[2], caminho_png="", caminho_json="", largura=100, altura=100, confianca=1.0),
        Question(numero=1, id_questao="q01", tipo=QuestionType.OBJETIVA, paginas=[3], caminho_png="", caminho_json="", largura=100, altura=100, confianca=1.0),
        Question(numero=2, id_questao="q02", tipo=QuestionType.OBJETIVA, paginas=[3], caminho_png="", caminho_json="", largura=100, altura=100, confianca=1.0),
    ]
    anomalias = validate_sequence(questions)
    assert len(anomalias) == 0


def test_validate_sequence_broken():
    questions = [
        Question(numero=1, id_questao="q01", tipo=QuestionType.OBJETIVA, paginas=[2], caminho_png="", caminho_json="", largura=100, altura=100, confianca=1.0),
        Question(numero=3, id_questao="q03", tipo=QuestionType.OBJETIVA, paginas=[2], caminho_png="", caminho_json="", largura=100, altura=100, confianca=1.0),
    ]
    anomalias = validate_sequence(questions)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "NUMERACAO_QUEBRADA"