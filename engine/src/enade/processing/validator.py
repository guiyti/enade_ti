from typing import List, Dict, Any
from pathlib import Path
import cv2

from ..core.models import Exam, Question, QuestionStatus, QuestionType, Severity
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


def validate_exam(exam: Exam) -> Exam:
    anomalias = []
    
    anomalias.extend(validate_numbering(exam))
    anomalias.extend(validate_duplicates(exam))
    anomalias.extend(validate_empty_questions(exam))
    anomalias.extend(validate_confidence(exam))
    anomalias.extend(validate_image_integrity(exam))
    
    exam.anomalias = anomalias
    exam.score_geral = calculate_overall_score(exam, anomalias)
    
    for anomalia in anomalias:
        sev = anomalia.get("severidade", "INFO")
        msg = f"[{anomalia.get('tipo', 'ANOMALIA')}] {anomalia.get('mensagem', '')}"
        if sev in ["CRITICAL", "ERROR"]:
            logger.error(msg)
        elif sev == "WARNING":
            logger.warning(msg)
        else:
            logger.info(msg)
            
    logger.info(f"Validação concluída: {exam.id_prova} | Score geral = {exam.score_geral:.1f}%")
    return exam


def validate_numbering(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    if not exam.questoes:
        return anomalias
    
    for q_type in [QuestionType.DISCURSIVA, QuestionType.OBJETIVA]:
        group = [q for q in exam.questoes if q.tipo == q_type]
        if not group:
            continue
        group_sorted = sorted(group, key=lambda q: q.numero)
        expected = 1
        for q in group_sorted:
            if q.numero != expected:
                anomalias.append({
                    "tipo": "NUMERACAO_QUEBRADA",
                    "severidade": "WARNING",
                    "mensagem": f"Esperava {q_type.value} {expected}, encontrou {q.numero}",
                    "questao": q.id_questao,
                    "esperado": expected
                })
            expected = q.numero + 1
            
    return anomalias


def validate_duplicates(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    seen = {}
    
    for q in exam.questoes:
        if q.id_questao in seen:
            anomalias.append({
                "tipo": "QUESTAO_DUPLICADA",
                "severidade": "ERROR",
                "mensagem": f"Questão {q.id_questao} duplicada",
                "questao": q.id_questao
            })
        seen[q.id_questao] = q
        
    return anomalias


def validate_empty_questions(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        if q.largura < 50 or q.altura < 50:
            anomalias.append({
                "tipo": "QUESTAO_VAZIA",
                "severidade": "ERROR",
                "mensagem": f"Questão {q.id_questao} tem dimensões inválidas ({q.largura}x{q.altura})",
                "questao": q.id_questao
            })
            q.status = QuestionStatus.REJEITADA
            
    return anomalias


def validate_confidence(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        if q.confianca < 0.6:
            anomalias.append({
                "tipo": "BAIXA_CONFIANCA",
                "severidade": "WARNING",
                "mensagem": f"Questão {q.id_questao} com baixa confiança ({q.confianca:.2f})",
                "questao": q.id_questao,
                "confianca": q.confianca
            })
            q.status = QuestionStatus.REVISAR
            
    return anomalias


def validate_image_integrity(exam: Exam) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q in exam.questoes:
        filename = f"{q.id_questao}.png"
        candidates = [
            config.QUESTOES_DIR / exam.id_prova / filename,
            config.BASE_DIR / "public" / "questoes" / exam.id_prova / filename,
            config.BASE_DIR / "questoes" / exam.id_prova / filename
        ]
        found_path = None
        for cand in candidates:
            if cand.exists():
                found_path = cand
                break
            
        if not found_path:
            anomalias.append({
                "tipo": "IMAGEM_NAO_ENCONTRADA",
                "severidade": "ERROR",
                "mensagem": f"Imagem da questão {q.id_questao} não existe",
                "questao": q.id_questao
            })
            q.status = QuestionStatus.REJEITADA
            continue
            
        img = cv2.imread(str(found_path))
        if img is None:
            anomalias.append({
                "tipo": "IMAGEM_CORROMPIDA",
                "severidade": "ERROR",
                "mensagem": f"Imagem da questão {q.id_questao} não pode ser lida",
                "questao": q.id_questao
            })
            q.status = QuestionStatus.REJEITADA
        else:
            if q.status == QuestionStatus.PENDENTE:
                q.status = QuestionStatus.APROVADA if q.confianca >= 0.6 else QuestionStatus.REVISAR
            
    return anomalias


def calculate_overall_score(exam: Exam, anomalias: List[Dict[str, Any]]) -> float:
    if not exam.questoes:
        return 0.0
    
    total = len(exam.questoes)
    approved = sum(1 for q in exam.questoes if q.status == QuestionStatus.APROVADA)
    pending = sum(1 for q in exam.questoes if q.status == QuestionStatus.PENDENTE)
    review = sum(1 for q in exam.questoes if q.status == QuestionStatus.REVISAR)
    rejected = sum(1 for q in exam.questoes if q.status == QuestionStatus.REJEITADA)
    
    status_score = (approved * 1.0 + pending * 0.95 + review * 0.7 + rejected * 0.0) / total * 100
    
    critical_count = sum(1 for a in anomalias if a.get("severidade") == "CRITICAL")
    error_count = sum(1 for a in anomalias if a.get("severidade") == "ERROR")
    warning_count = sum(1 for a in anomalias if a.get("severidade") == "WARNING")
    
    deductions = (critical_count * 5.0) + (error_count * 2.0) + (warning_count * 0.5)
    return max(0.0, min(100.0, status_score - deductions))