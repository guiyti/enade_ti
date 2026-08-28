import json
import fitz
from pathlib import Path
from typing import List

from ..core.models import Exam
from ..utils.logging import get_logger
from ..config import config

from .pdf_discovery import discover_pdfs, create_exam_from_pdf, PDFInfo
from .layout_profiler import profile_exam_layout
from .page_converter import convert_pages_to_png
from .structural_extractor import extract_structural_data
from .ocr_extractor import run_ocr_if_needed, merge_markers
from .region_builder import build_questions_from_markers, validate_sequence
from .png_generator import generate_all_question_pngs
from .validator import validate_exam
from .topic_classifier import classify_question_topics

logger = get_logger(__name__)


def save_exam_metadata(exam: Exam) -> None:
    metadata_dir = config.QUESTOES_DIR / exam.id_prova
    metadata_dir.mkdir(parents=True, exist_ok=True)
    
    meta_path = metadata_dir / "metadata.json"
    meta = {
        "id_prova": exam.id_prova,
        "arquivo": exam.arquivo,
        "ano": exam.ano,
        "curso": exam.curso,
        "total_paginas": exam.total_paginas,
        "questoes_detectadas": exam.questoes_detectadas,
        "questoes_extraidas": exam.questoes_extraidas,
        "score_geral": exam.score_geral,
        "tipo_pdf": exam.tipo_pdf.value,
        "layout_profile": exam.layout_profile,
        "questoes": [
            {
                "id_questao": q.id_questao,
                "numero": q.numero,
                "tipo": q.tipo.value,
                "paginas": q.paginas,
                "largura": q.largura,
                "altura": q.altura,
                "confianca": q.confianca,
                "status": q.status.value,
                "categorias": q.categorias,
                "anomalias": q.anomalias,
                "caminho_png": f"/questoes/{exam.id_prova}/{q.id_questao}.png",
                "caminho_json": f"/questoes/{exam.id_prova}/{q.id_questao}.json",
                "caminho_txt": f"/questoes/{exam.id_prova}/{q.id_questao}.txt",
                "num_figuras": len(q.figuras)
            }
            for q in exam.questoes
        ]
    }
    
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Metadados de questões salvos: {meta_path}")


def save_consolidated_catalog(exams: List[Exam]) -> None:
    """
    Saves a single master JSON catalog (exams.json) with all exams and questions
    categorized by topics for consumption by Next.js and static deployment on Vercel.
    """
    catalog = []
    for exam in sorted(exams, key=lambda e: (e.ano, e.curso, e.id_prova), reverse=True):
        exam_entry = {
            "id_prova": exam.id_prova,
            "arquivo": exam.arquivo,
            "ano": exam.ano,
            "curso": exam.curso,
            "total_paginas": exam.total_paginas,
            "questoes_detectadas": exam.questoes_detectadas,
            "questoes_extraidas": exam.questoes_extraidas,
            "score_geral": exam.score_geral,
            "tipo_pdf": exam.tipo_pdf.value,
            "layout_profile": exam.layout_profile,
            "questoes": []
        }
        for q in exam.questoes:
            # Ensure categories are classified
            if not q.categorias:
                q.categorias = classify_question_topics(q.texto_completo, exam.curso, q.numero, q.tipo, exam.ano)
                
            exam_entry["questoes"].append({
                "id_questao": q.id_questao,
                "numero": q.numero,
                "tipo": q.tipo.value,
                "paginas": q.paginas,
                "largura": q.largura,
                "altura": q.altura,
                "confianca": q.confianca,
                "status": q.status.value,
                "categorias": q.categorias,
                "anomalias": q.anomalias,
                "texto_completo": q.texto_completo,
                "figuras": q.figuras,
                "caminho_png": f"/questoes/{exam.id_prova}/{q.id_questao}.png",
                "caminho_json": f"/questoes/{exam.id_prova}/{q.id_questao}.json",
                "caminho_txt": f"/questoes/{exam.id_prova}/{q.id_questao}.txt"
            })
        catalog.append(exam_entry)
        
    master_path = config.QUESTOES_DIR / "exams.json"
    with open(master_path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    logger.info(f"Catálogo mestre consolidado salvo: {master_path}")
    
    # Sync with Root public/data/exams.json
    root_public_data = config.BASE_DIR / "public" / "data"
    root_public_data.mkdir(parents=True, exist_ok=True)
    with open(root_public_data / "exams.json", "w", encoding="utf-8") as f:
        json.dump(catalog, f, ensure_ascii=False, indent=2)
    logger.info(f"Catálogo mestre sincronizado com {root_public_data / 'exams.json'}")


def process_exam(pdf_info: PDFInfo) -> Exam:
    logger.info(f"=== Iniciando processamento: {pdf_info.arquivo} (ID: {pdf_info.id_prova}) ===")
    
    exam = create_exam_from_pdf(pdf_info)
    
    # 0. Global Exam Layout Profiling (Header / Footer geometric bounds discovery)
    pdf_path = config.PROVAS_DIR / exam.arquivo
    doc = fitz.open(pdf_path)
    profile = profile_exam_layout(doc, exam.id_prova)
    exam.layout_profile = profile.to_dict()
    doc.close()
    
    # 1. Convert pages to PNG (300 DPI) using layout boundaries for column segmentation
    convert_pages_to_png(exam)
    
    # 2. Extract structural data (blocks, markers, contexts) filtered by header/footer cuts
    exam, structural_markers, contexts = extract_structural_data(exam)
    
    # 3. Complementary OCR if needed
    exam, ocr_markers = run_ocr_if_needed(exam, structural_markers)
    
    # 4. Merge all detected markers
    all_markers = merge_markers(structural_markers, ocr_markers)
    exam.questoes_detectadas = len(all_markers)
    
    # 5. Build questions with precise multi-column / multi-page segments within layout slots
    exam.questoes = build_questions_from_markers(exam, all_markers, contexts)
    
    # 6. Sequence anomalies check
    seq_anomalies = validate_sequence(exam.questoes)
    exam.anomalias.extend(seq_anomalies)
    
    # 7. Generate clean PNGs, text, and embedded figures
    exam = generate_all_question_pngs(exam)
    
    # 8. Classify question topics automatically
    for q in exam.questoes:
        q.categorias = classify_question_topics(q.texto_completo, exam.curso, q.numero, q.tipo, exam.ano)
    
    # 9. Full validation
    exam = validate_exam(exam)
    
    # 10. Save metadata
    save_exam_metadata(exam)
    
    logger.info(f"=== Processamento concluído: {pdf_info.arquivo} | Extraídas: {exam.questoes_extraidas} | Score: {exam.score_geral:.1f}% ===")
    return exam


def process_all_pdfs() -> List[Exam]:
    pdfs = discover_pdfs()
    
    if not pdfs:
        logger.warning("Nenhum PDF encontrado em /provas")
        return []
    
    exams = []
    for pdf_info in pdfs:
        try:
            exam = process_exam(pdf_info)
            exams.append(exam)
        except Exception as e:
            logger.error(f"Erro ao processar {pdf_info.arquivo}: {e}", exc_info=True)
            
    if exams:
        save_consolidated_catalog(exams)
        
    return exams


def main():
    from ..utils.logging import setup_logging
    setup_logging()
    
    logger.info("Iniciando sistema de extração ENADE com classificação temática")
    exams = process_all_pdfs()
    
    total_questions = sum(e.questoes_extraidas for e in exams)
    avg_score = sum(e.score_geral for e in exams) / len(exams) if exams else 0
    
    logger.info(f"Processamento finalizado: {len(exams)} provas, {total_questions} questões extraídas, Score médio: {avg_score:.1f}%")
    return exams


if __name__ == "__main__":
    main()