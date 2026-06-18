import pytest
from src.enade.processing.region_builder import (
    build_question_regions,
    validate_sequence,
    create_questions_from_regions,
    calculate_confidence
)
from src.enade.core.models import Marker, DetectionMethod, Exam, QuestionStatus


def create_marker(num, page, y, method=DetectionMethod.PDF_STRUCTURE, conf=0.95):
    return Marker(
        numero=num,
        pagina=page,
        x=100,
        y=y,
        metodo=method,
        confianca=conf,
        texto_original=f"QUESTÃO {num}"
    )


def test_build_question_regions_single_page():
    markers = [
        create_marker(1, 1, 100),
        create_marker(2, 1, 500),
        create_marker(3, 1, 1000),
    ]
    
    regions = build_question_regions(markers, 3)
    
    assert len(regions) == 3
    assert regions[0].numero == 1
    assert regions[0].inicio_pagina == 1
    assert regions[0].fim_pagina == 1
    assert regions[0].paginas == [1]
    assert not regions[0].aberta
    
    assert regions[1].numero == 2
    assert regions[1].paginas == [1]
    
    assert regions[2].numero == 3
    assert regions[2].fim_pagina == 3
    assert regions[2].paginas == [1, 2, 3]
    assert regions[2].aberta


def test_build_question_regions_multi_page():
    markers = [
        create_marker(1, 1, 100),
        create_marker(2, 1, 800),
        create_marker(3, 2, 150),
    ]
    
    regions = build_question_regions(markers, 3)
    
    assert len(regions) == 3
    assert regions[0].paginas == [1]
    assert regions[1].paginas == [1, 2]
    assert regions[1].aberta
    assert regions[2].paginas == [2, 3]
    assert regions[2].aberta


def test_build_question_regions_cross_multiple_pages():
    markers = [
        create_marker(1, 1, 100),
        create_marker(2, 3, 200),
    ]
    
    regions = build_question_regions(markers, 5)
    
    assert len(regions) == 2
    assert regions[0].paginas == [1, 2, 3]
    assert regions[0].aberta
    assert regions[1].paginas == [3, 4, 5]
    assert regions[1].aberta


def test_validate_sequence_ok():
    from src.enade.processing.region_builder import QuestionRegion
    
    regions = [
        QuestionRegion(1, 1, 100, 1, 500, [1], []),
        QuestionRegion(2, 1, 500, 1, 900, [1], []),
        QuestionRegion(3, 2, 100, 2, 600, [2], []),
    ]
    
    anomalias = validate_sequence(regions)
    assert len(anomalias) == 0


def test_validate_sequence_broken():
    from src.enade.processing.region_builder import QuestionRegion
    
    regions = [
        QuestionRegion(1, 1, 100, 1, 500, [1], []),
        QuestionRegion(3, 1, 500, 1, 900, [1], []),
    ]
    
    anomalias = validate_sequence(regions)
    assert len(anomalias) == 1
    assert anomalias[0]["tipo"] == "NUMERACAO_QUEBRADA"
    assert anomalias[0]["esperado"] == 2
    assert anomalias[0]["questao"] == 3


def test_validate_sequence_duplicate():
    from src.enade.processing.region_builder import QuestionRegion
    
    regions = [
        QuestionRegion(1, 1, 100, 1, 500, [1], []),
        QuestionRegion(2, 1, 500, 1, 900, [1], []),
        QuestionRegion(2, 2, 100, 2, 600, [2], []),
    ]
    
    anomalias = validate_sequence(regions)
    # Should detect both duplicate and broken numbering (expected 3, got 2)
    assert len(anomalias) >= 1
    tipos = {a["tipo"] for a in anomalias}
    assert "QUESTAO_DUPLICADA" in tipos


def test_create_questions_from_regions():
    from src.enade.processing.region_builder import QuestionRegion
    
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=3
    )
    
    regions = [
        QuestionRegion(1, 1, 100, 1, 500, [1], [create_marker(1, 1, 100)]),
        QuestionRegion(2, 1, 500, 2, 200, [1, 2], [create_marker(2, 1, 500)]),
    ]
    
    questions = create_questions_from_regions(exam, regions)
    
    assert len(questions) == 2
    assert questions[0].numero == 1
    assert questions[0].paginas == [1]
    assert questions[1].numero == 2
    assert questions[1].paginas == [1, 2]
    assert questions[0].status == QuestionStatus.PENDENTE
    assert questions[0].confianca > 0


def test_calculate_confidence():
    from src.enade.processing.region_builder import QuestionRegion
    
    exam = Exam(
        arquivo="test.pdf",
        ano=2022,
        curso="ADS",
        hash_arquivo="hash",
        total_paginas=3
    )
    
    markers_pdf = [create_marker(1, 1, 100, DetectionMethod.PDF_STRUCTURE, 0.95)]
    markers_ocr = [create_marker(1, 1, 100, DetectionMethod.OCR, 0.80)]
    
    region_pdf = QuestionRegion(1, 1, 100, 1, 500, [1], markers_pdf)
    region_ocr = QuestionRegion(1, 1, 100, 1, 500, [1], markers_ocr)
    
    conf_pdf = calculate_confidence(region_pdf, exam)
    conf_ocr = calculate_confidence(region_ocr, exam)
    
    assert conf_pdf > conf_ocr
    assert conf_pdf <= 1.0
    assert conf_ocr <= 1.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])