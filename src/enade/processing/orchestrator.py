import json
from pathlib import Path
from typing import List

from ..core.models import Exam
from ..utils.logging import get_logger
from ..config import config

from .pdf_discovery import discover_pdfs, create_exam_from_pdf
from .page_converter import convert_pages_to_png
from .structural_extractor import extract_structural_data
from .ocr_extractor import run_ocr_if_needed, merge_markers
from .region_builder import build_question_regions, validate_sequence, create_questions_from_regions
from .png_generator import generate_all_question_pngs
from .validator import validate_exam

logger = get_logger(__name__)


def save_exam_report(exam: Exam) -> None:
    report_dir = config.AUDITORIA_DIR / exam.arquivo.replace(".pdf", "").replace(".PDF", "")
    report_dir.mkdir(parents=True, exist_ok=True)
    
    report_path = report_dir / "relatorio.json"
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(exam.to_dict(), f, ensure_ascii=False, indent=2)
    
    logger.info(f"Relatório salvo: {report_path}")


def save_exam_metadata(exam: Exam) -> None:
    metadata_dir = config.QUESTOES_DIR / str(exam.ano)
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    meta_path = metadata_dir / "metadata.json"
    meta = {
        "arquivo": exam.arquivo,
        "ano": exam.ano,
        "curso": exam.curso,
        "total_paginas": exam.total_paginas,
        "questoes_detectadas": exam.questoes_detectadas,
        "questoes_extraidas": exam.questoes_extraidas,
        "score_geral": exam.score_geral,
        "tipo_pdf": exam.tipo_pdf.value,
        "questoes": [
            {
                "numero": q.numero,
                "paginas": q.paginas,
                "confianca": q.confianca,
                "status": q.status.value,
                "anomalias": q.anomalias
            }
            for q in exam.questoes
        ]
    }
    
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Metadados salvos: {meta_path}")


def process_exam(pdf_info) -> Exam:
    logger.info(f"=== Iniciando processamento: {pdf_info.arquivo} ===")
    
    exam = create_exam_from_pdf(pdf_info)
    
    convert_pages_to_png(exam)
    
    exam, structural_markers = extract_structural_data(exam)
    
    exam, ocr_markers = run_ocr_if_needed(exam, structural_markers)
    
    all_markers = merge_markers(structural_markers, ocr_markers)
    exam.questoes_detectadas = len(all_markers)
    
    regions = build_question_regions(all_markers, exam.total_paginas)
    sequence_anomalies = validate_sequence(regions)
    exam.anomalias.extend(sequence_anomalies)
    
    exam.questoes = create_questions_from_regions(exam, regions)
    
    exam = generate_all_question_pngs(exam)
    
    exam = validate_exam(exam)
    
    save_exam_report(exam)
    save_exam_metadata(exam)
    
    logger.info(f"=== Processamento concluído: {pdf_info.arquivo} | Score: {exam.score_geral:.1f}% ===")
    
    return exam


def process_all_pdfs() -> List[Exam]:
    pdfs = discover_pdfs()
    
    if not pdfs:
        logger.warning("Nenhum PDF encontrado em /enade/provas")
        return []
    
    exams = []
    for pdf_info in pdfs:
        try:
            exam = process_exam(pdf_info)
            exams.append(exam)
        except Exception as e:
            logger.error(f"Erro ao processar {pdf_info.arquivo}: {e}", exc_info=True)
    
    return exams


def main():
    from ..utils.logging import setup_logging
    setup_logging()
    
    logger.info("Iniciando sistema de extração ENADE")
    exams = process_all_pdfs()
    
    total_questions = sum(e.questoes_extraidas for e in exams)
    avg_score = sum(e.score_geral for e in exams) / len(exams) if exams else 0
    
    logger.info(f"Processamento finalizado: {len(exams)} provas, {total_questions} questões, Score médio: {avg_score:.1f}%")
    
    return exams


if __name__ == "__main__":
    main()