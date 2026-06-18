import pytest
from src.enade.processing.validator import (
    validate_exam,
    validate_numbering,
    validate_duplicates,
    validate_empty_questions,
    validate_orphan_pages,
    validate_question_sizes,
    validate_confidence,
    calculate_overall_score
)
from src.enade.core.models import Exam, Question, QuestionStatus


def create_test_exam(questions):
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=5
    )
    exam.questoes = questions
    return exam


def create_question(num, pages, conf=0.95, status=QuestionStatus.PENDENTE, width=500, height=300):
    return Question(
        numero=num,
        paginas=pages,
        caminho_png="",
        caminho_json="",
        largura=width,
        altura=height,
        confianca=conf,
        status=status
    )


def test_validate_numbering_ok():
    questions = [
        create_question(1, [1]),
        create_question(2, [2]),
        create_question(3, [3]),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_numbering(exam)
    assert len(anomalias) == 0


def test_validate_numbering_broken():
    questions = [
        create_question(1, [1]),
        create_question(3, [2]),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_numbering(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "NUMERACAO_QUEBRADA"
    assert anomalias[0]["esperado"] == 2
    assert anomalias[0]["questao"] == 3


def test_validate_duplicates():
    questions = [
        create_question(1, [1]),
        create_question(2, [2]),
        create_question(2, [3]),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_duplicates(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "QUESTAO_DUPLICADA"
    assert anomalias[0]["questao"] == 2


def test_validate_empty_questions():
    questions = [
        create_question(1, [1]),
        create_question(2, [2], width=0, height=0),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_empty_questions(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "QUESTAO_VAZIA"
    assert exam.questoes[1].status == QuestionStatus.REJEITADA


def test_validate_orphan_pages():
    questions = [
        create_question(1, [1]),
        create_question(2, [3]),
    ]
    exam = create_test_exam(questions)
    exam.total_paginas = 4
    
    anomalias = validate_orphan_pages(exam)
    assert len(anomalias) == 2
    pages = {a["pagina"] for a in anomalias}
    assert pages == {2, 4}


def test_validate_question_sizes():
    questions = [
        create_question(1, [1], width=500, height=300),
        create_question(2, [2], width=500, height=300),
        create_question(3, [3], width=50, height=30),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_question_sizes(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "QUESTAO_MUITO_PEQUENA"
    assert anomalias[0]["questao"] == 3


def test_validate_confidence_low():
    questions = [
        create_question(1, [1], conf=0.95),
        create_question(2, [2], conf=0.4),
        create_question(3, [3], conf=0.6),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_confidence(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "BAIXA_CONFIANCA"
    assert exam.questoes[1].status == QuestionStatus.REVISAR
    assert exam.questoes[2].status == QuestionStatus.REVISAR


def test_calculate_overall_score():
    questions = [
        create_question(1, [1], conf=0.95, status=QuestionStatus.APROVADA),
        create_question(2, [2], conf=0.90, status=QuestionStatus.APROVADA),
        create_question(3, [3], conf=0.60, status=QuestionStatus.REVISAR),
    ]
    exam = create_test_exam(questions)
    
    anomalias = [
        {"severidade": "WARNING"},
        {"severidade": "WARNING"},
    ]
    
    score = calculate_overall_score(exam, anomalias)
    
    assert 0 <= score <= 100
    assert score > 50


def test_validate_exam_integration():
    questions = [
        create_question(1, [1], conf=0.95),
        create_question(3, [2], conf=0.4),
    ]
    exam = create_test_exam(questions)
    exam.total_paginas = 3
    
    exam = validate_exam(exam)
    
    assert len(exam.anomalias) >= 2
    assert exam.score_geral >= 0
    assert exam.score_geral <= 100


if __name__ == "__main__":
    pytest.main([__file__, "-v"])