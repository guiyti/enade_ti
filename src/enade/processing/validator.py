from typing import List, Dict, Any
from pathlib import Path
import cv2

from ..core.models import Exam, Question, QuestionStatus, Severity
from ..utils.logging import get_logger

logger = get_logger(__name__)


def validate_exam(exam: Exam) -> Exam:
    anomalias = []
    
    anomalias.extend(validate_numbering(exam))
    anomalias.extend(validate_duplicates(exam))
    anomalias.extend(validate_empty_questions(exam))
    anomalias.extend(validate_orphan_pages(exam))
    anomalias.extend(validate_question_sizes(exam))
    anomalias.extend(validate_confidence(exam))
    anomalias.extend(validate_image_integrity(exam))
    
    exam.anomalias = anomalias
    exam.score_geral = calculate_overall_score(exam, anomalias)
    
    for anomalia in anomalias:
        if anomalia.get("severidade") == "CRITICAL":
            logger.error(f"[{anomalia['tipo']}] {anomalia['mensagem']}")
        elif anomalia.get("severidade") == "ERROR":
            logger.error(f"[{anomalia['tipo']}] {anomalia['mensagem']}")
        elif anomalia.get("severidade") == "WARNING":
            logger.warning(f"[{anomalia['tipo']}] {anomalia['mensagem']}")
        else:
            logger.info(f"[{anomalia['tipo']}] {anomalia['mensagem']}")
    
    logger.info(f"Validação concluída: Score geral = {exam.score_geral:.1f}%")
    return exam


def validate_numbering(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    if not exam.questoes:
        return anomalias
    
    expected = 1
    for q in exam.questoes:
        if q.numero != expected:
            anomalias.append({
                "tipo": "NUMERACAO_QUEBRADA",
                "severidade": "WARNING",
                "mensagem": f"Esperava questão {expected}, encontrou {q.numero}",
                "questao": q.numero,
                "esperado": expected
            })
        expected = q.numero + 1
    
    return anomalias


def validate_duplicates(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    seen = {}
    
    for q in exam.questoes:
        if q.numero in seen:
            anomalias.append({
                "tipo": "QUESTAO_DUPLICADA",
                "severidade": "ERROR",
                "mensagem": f"Questão {q.numero} aparece múltiplas vezes",
                "questao": q.numero,
                "paginas_anterior": seen[q.numero].paginas,
                "paginas_atual": q.paginas
            })
        seen[q.numero] = q
    
    return anomalias


def validate_empty_questions(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        if q.largura == 0 or q.altura == 0:
            anomalias.append({
                "tipo": "QUESTAO_VAZIA",
                "severidade": "ERROR",
                "mensagem": f"Questão {q.numero} tem dimensões inválidas ({q.largura}x{q.altura})",
                "questao": q.numero
            })
            q.status = QuestionStatus.REJEITADA
    
    return anomalias


def validate_orphan_pages(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    pages_with_questions = set()
    for q in exam.questoes:
        pages_with_questions.update(q.paginas)
    
    all_pages = set(range(1, exam.total_paginas + 1))
    orphan_pages = all_pages - pages_with_questions
    
    for page in orphan_pages:
        anomalias.append({
            "tipo": "PAGINA_ORFA",
            "severidade": "WARNING",
            "mensagem": f"Página {page} não associada a nenhuma questão",
            "pagina": page
        })
    
    return anomalias


def validate_question_sizes(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    if not exam.questoes:
        return anomalias
    
    areas = [q.largura * q.altura for q in exam.questoes if q.largura > 0 and q.altura > 0]
    if not areas:
        return anomalias
    
    avg_area = sum(areas) / len(areas)
    
    for q in exam.questoes:
        area = q.largura * q.altura
        if area < avg_area * 0.1:
            anomalias.append({
                "tipo": "QUESTAO_MUITO_PEQUENA",
                "severidade": "WARNING",
                "mensagem": f"Questão {q.numero} muito pequena ({area:.0f}px vs média {avg_area:.0f}px)",
                "questao": q.numero,
                "area": area,
                "area_media": avg_area
            })
            q.anomalias.append("QUESTAO_MUITO_PEQUENA")
        elif area > avg_area * 5:
            anomalias.append({
                "tipo": "QUESTAO_MUITO_GRANDE",
                "severidade": "WARNING",
                "mensagem": f"Questão {q.numero} muito grande ({area:.0f}px vs média {avg_area:.0f}px)",
                "questao": q.numero,
                "area": area,
                "area_media": avg_area
            })
            q.anomalias.append("QUESTAO_MUITO_GR_GR_GRANDE")
    
    return anomalias


def validate_confidence(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        if q.confianca < 0.5:
            anomalias.append({
                "tipo": "BAIXA_CONFIANCA",
                "severidade": "WARNING",
                "mensagem": f"Questão {q.numero} com baixa confiança ({q.confianca:.2f})",
                "questao": q.numero,
                "confianca": q.confianca
            })
            q.status = QuestionStatus.REVISAR
            q.anomalias.append("BAIXA_CONFIANCA")
        elif q.confianca < 0.7:
            q.status = QuestionStatus.REVISAR
            q.anomalias.append("CONFIANCA_MODERADA")
    
    return anomalias


def validate_image_integrity(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        if not q.caminho_png:
            continue
        
        img = cv2.imread(q.caminho_png)
        if img is None:
            anomalias.append({
                "tipo": "IMAGEM_CORROMPIDA",
                "severidade": "ERROR",
                "mensagem": f"Imagem da questão {q.numero} não pode ser lida",
                "questao": q.numero
            })
            q.status = QuestionStatus.REJEITADA
            continue
        
        h, w = img.shape[:2]
        if h != q.altura or w != q.largura:
            anomalias.append({
                "tipo": "DIMENSAO_INCONSISTENTE",
                "severidade": "WARNING",
                "mensagem": f"Questão {q.numero}: metadados ({q.largura}x{q.altura}) != imagem real ({w}x{h})",
                "questao": q.numero
            })
    
    return anomalias


def calculate_overall_score(exam: Exam, anomalias: List[Dict[str, Any]]) -> float:
    if not exam.questoes:
        return 0.0
    
    base_score = 100.0
    
    critical_count = sum(1 for a in anomalias if a.get("severidade") == "CRITICAL")
    error_count = sum(1 for a in anomalias if a.get("severidade") == "ERROR")
    warning_count = sum(1 for a in anomalias if a.get("severidade") == "WARNING")
    
    base_score -= critical_count * 20
    base_score -= error_count * 10
    base_score -= warning_count * 2
    
    approved = sum(1 for q in exam.questoes if q.status == QuestionStatus.APROVADA)
    pending = sum(1 for q in exam.questoes if q.status == QuestionStatus.PENDENTE)
    review = sum(1 for q in exam.questoes if q.status == QuestionStatus.REVISAR)
    rejected = sum(1 for q in exam.questoes if q.status == QuestionStatus.REJEITADA)
    
    total = len(exam.questoes)
    if total > 0:
        status_score = (approved * 1.0 + pending * 0.8 + review * 0.5 + rejected * 0.0) / total * 100
        base_score = (base_score + status_score) / 2
    
    return max(0.0, min(100.0, base_score))