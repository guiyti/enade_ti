from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from ..core.models import Exam, PageData, Question, Marker, QuestionStatus
from ..utils.logging import get_logger

logger = get_logger(__name__)


@dataclass
class QuestionRegion:
    numero: int
    inicio_pagina: int
    inicio_y: float
    fim_pagina: int
    fim_y: float
    paginas: List[int]
    marcadores: List[Marker]
    aberta: bool = False


def build_question_regions(markers: List[Marker], total_pages: int) -> List[QuestionRegion]:
    if not markers:
        return []
    
    markers_sorted = sorted(markers, key=lambda m: (m.pagina, m.y))
    
    regions = []
    current_region = None
    seen_question_numbers = set()
    
    for i, marker in enumerate(markers_sorted):
        if marker.numero in seen_question_numbers:
            logger.debug(f"Skipping duplicate marker for question {marker.numero} on page {marker.pagina}")
            continue
        
        seen_question_numbers.add(marker.numero)
        
        if current_region is None:
            current_region = QuestionRegion(
                numero=marker.numero,
                inicio_pagina=marker.pagina,
                inicio_y=marker.y,
                fim_pagina=marker.pagina,
                fim_y=marker.y,
                paginas=[marker.pagina],
                marcadores=[marker]
            )
        else:
            current_region.fim_pagina = marker.pagina
            current_region.fim_y = marker.y
            
            if marker.pagina > current_region.inicio_pagina:
                current_region.paginas = list(range(current_region.inicio_pagina, marker.pagina + 1))
                current_region.aberta = True
            else:
                current_region.paginas = [current_region.inicio_pagina]
            
            regions.append(current_region)
            current_region = QuestionRegion(
                numero=marker.numero,
                inicio_pagina=marker.pagina,
                inicio_y=marker.y,
                fim_pagina=marker.pagina,
                fim_y=marker.y,
                paginas=[marker.pagina],
                marcadores=[marker]
            )
    
    if current_region:
        current_region.fim_pagina = total_pages
        current_region.fim_y = float('inf')
        current_region.paginas = list(range(current_region.inicio_pagina, total_pages + 1))
        current_region.aberta = True
        regions.append(current_region)
    
    return regions


def validate_sequence(regions: List[QuestionRegion]) -> List[Dict[str, Any]]:
    anomalias = []
    
    if not regions:
        return anomalias
    
    expected = 1
    for region in regions:
        if region.numero != expected:
            anomalias.append({
                "tipo": "NUMERACAO_QUEBRADA",
                "severidade": "WARNING",
                "mensagem": f"Esperava questão {expected}, encontrou {region.numero}",
                "questao": region.numero,
                "esperado": expected
            })
        expected = region.numero + 1
    
    seen = {}
    for region in regions:
        if region.numero in seen:
            anomalias.append({
                "tipo": "QUESTAO_DUPLICADA",
                "severidade": "ERROR",
                "mensagem": f"Questão {region.numero} aparece múltiplas vezes",
                "questao": region.numero
            })
        seen[region.numero] = region
    
    return anomalias


def create_questions_from_regions(exam: Exam, regions: List[QuestionRegion]) -> List[Question]:
    questions = []
    
    for region in regions:
        question = Question(
            numero=region.numero,
            paginas=region.paginas,
            caminho_png="",
            caminho_json="",
            largura=0,
            altura=0,
            confianca=calculate_confidence(region, exam),
            status=QuestionStatus.PENDENTE,
            marcadores=region.marcadores
        )
        questions.append(question)
    
    return questions


def calculate_confidence(region: QuestionRegion, exam: Exam) -> float:
    if not region.marcadores:
        return 0.0
    
    avg_conf = sum(m.confianca for m in region.marcadores) / len(region.marcadores)
    
    metodo_bonus = 0.0
    for m in region.marcadores:
        if m.metodo.value == "PDF_STRUCTURE":
            metodo_bonus += 0.05
        elif m.metodo.value == "OCR":
            metodo_bonus += 0.02
    
    metodo_bonus = min(metodo_bonus, 0.1)
    
    if region.aberta and len(region.paginas) > 3:
        avg_conf *= 0.9
    
    return min(avg_conf + metodo_bonus, 1.0)