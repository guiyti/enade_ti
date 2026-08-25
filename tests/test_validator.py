import pytest
from src.enade.processing.validator import (
    validate_exam,
    validate_numbering,
    validate_duplicates,
    validate_empty_questions,
    validate_confidence,
    calculate_overall_score
)
from src.enade.core.models import Exam, Question, QuestionStatus, QuestionType


def create_test_exam(questions):
    exam = Exam(
        id_prova="test_exam",
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=5
    )
    exam.questoes = questions
    return exam


def create_question(num, pages, conf=0.95, status=QuestionStatus.PENDENTE, width=500, height=300, q_type=QuestionType.OBJETIVA, custom_id=None):
    id_q = custom_id if custom_id else f"{'qd' if q_type == QuestionType.DISCURSIVA else 'q'}{num:02d}"
    return Question(
        numero=num,
        id_questao=id_q,
        tipo=q_type,
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
    assert anomalias[0]["questao"] == "q03"


def test_validate_duplicates():
    questions = [
        create_question(1, [1]),
        create_question(2, [2], custom_id="q02"),
        create_question(2, [3], custom_id="q02"),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_duplicates(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "QUESTAO_DUPLICADA"
    assert anomalias[0]["questao"] == "q02"


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


def test_validate_confidence_low():
    questions = [
        create_question(1, [1], conf=0.95),
        create_question(2, [2], conf=0.4),
        create_question(3, [3], conf=0.8),
    ]
    exam = create_test_exam(questions)
    
    anomalias = validate_confidence(exam)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "BAIXA_CONFIANCA"
    assert exam.questoes[1].status == QuestionStatus.REVISAR


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