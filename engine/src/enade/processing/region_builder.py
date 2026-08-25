from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass

from ..core.models import Exam, PageData, Question, Marker, Segment, QuestionType, QuestionStatus
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


@dataclass
class FlowSlot:
    index: int
    pagina: int
    coluna: int
    x0: float
    y0: float
    x1: float
    y1: float


def build_page_slots(
    pages: List[PageData], 
    margin_x: float = 25.0, 
    header_y: float = 75.0, 
    footer_y_offset: float = 60.0,
    dpi: int = 300
) -> List[FlowSlot]:
    slots: List[FlowSlot] = []
    slot_idx = 0
    scale = dpi / 72.0
    
    for page in sorted(pages, key=lambda p: p.numero):
        # Skip page 1 (cover)
        if page.numero == 1:
            continue
        
        # Convert pixel dimensions back to PDF points
        w = page.largura / scale if page.largura > 1000 else float(page.largura)
        h = page.altura / scale if page.altura > 1500 else float(page.altura)
        
        mid_x = w / 2.0
        y_top = header_y
        y_bot = h - footer_y_offset
        
        if page.num_colunas == 2:
            # Slot 1: Left column
            slots.append(FlowSlot(
                index=slot_idx,
                pagina=page.numero,
                coluna=1,
                x0=margin_x,
                y0=y_top,
                x1=mid_x - 3.0,
                y1=y_bot
            ))
            slot_idx += 1
            
            # Slot 2: Right column
            slots.append(FlowSlot(
                index=slot_idx,
                pagina=page.numero,
                coluna=2,
                x0=mid_x + 3.0,
                y0=y_top,
                x1=w - margin_x,
                y1=y_bot
            ))
            slot_idx += 1
        else:
            # Single slot: Full page width
            slots.append(FlowSlot(
                index=slot_idx,
                pagina=page.numero,
                coluna=0,
                x0=margin_x,
                y0=y_top,
                x1=w - margin_x,
                y1=y_bot
            ))
            slot_idx += 1
            
    return slots


def find_slot_for_marker(marker: Marker, slots: List[FlowSlot]) -> Optional[FlowSlot]:
    page_slots = [s for s in slots if s.pagina == marker.pagina]
    if not page_slots:
        return None
    
    if len(page_slots) == 1:
        return page_slots[0]
    
    # 1. Match by explicit column assignment
    if marker.coluna > 0:
        for s in page_slots:
            if s.coluna == marker.coluna:
                return s
                
    # 2. Match by bounding interval containment
    for s in page_slots:
        if s.x0 <= marker.x <= s.x1:
            return s
            
    # 3. Match by closest center
    return min(page_slots, key=lambda s: abs((s.x0 + s.x1) / 2.0 - marker.x))


def build_questions_from_markers(exam: Exam, markers: List[Marker], contexts: List[Any] = None) -> List[Question]:
    if not markers:
        return []
    
    slots = build_page_slots(exam.paginas, dpi=config.PDF_DPI)
    
    # Map each marker to its corresponding flow slot
    marker_slots: List[Tuple[Marker, FlowSlot]] = []
    for m in markers:
        slot = find_slot_for_marker(m, slots)
        if slot:
            marker_slots.append((m, slot))
            
    # Sort all markers by physical reading order (slot index, y position)
    marker_slots.sort(key=lambda pair: (pair[1].index, pair[0].y))
    
    # Deduplicate identical markers (keep first occurrence in reading flow)
    unique_ms: List[Tuple[Marker, FlowSlot]] = []
    seen = set()
    for m, s in marker_slots:
        k = (m.tipo, m.numero)
        if k not in seen:
            seen.add(k)
            unique_ms.append((m, s))
            
    questions: List[Question] = []
    
    for i, (current_m, current_slot) in enumerate(unique_ms):
        has_next = (i + 1 < len(unique_ms))
        next_m, next_slot = unique_ms[i + 1] if has_next else (None, None)
        
        segments: List[Segment] = []
        start_y = max(current_slot.y0, current_m.y - 12.0)
        
        if not has_next or next_slot.index > current_slot.index:
            # First segment in current slot
            segments.append(Segment(
                pagina=current_slot.pagina,
                x0=current_slot.x0,
                y0=start_y,
                x1=current_slot.x1,
                y1=current_slot.y1,
                coluna=current_slot.coluna
            ))
            
            if has_next:
                # Intermediate full slots
                for k in range(current_slot.index + 1, next_slot.index):
                    inter_slot = slots[k]
                    segments.append(Segment(
                        pagina=inter_slot.pagina,
                        x0=inter_slot.x0,
                        y0=inter_slot.y0,
                        x1=inter_slot.x1,
                        y1=inter_slot.y1,
                        coluna=inter_slot.coluna
                    ))
                
                # Final segment in next slot up to next marker's top
                end_y = max(next_slot.y0, next_m.y - 8.0)
                if end_y > next_slot.y0 + 15.0:
                    segments.append(Segment(
                        pagina=next_slot.pagina,
                        x0=next_slot.x0,
                        y0=next_slot.y0,
                        x1=next_slot.x1,
                        y1=end_y,
                        coluna=next_slot.coluna
                    ))
        else:
            # Both markers are in the SAME slot
            end_y = max(start_y + 20.0, next_m.y - 8.0)
            segments.append(Segment(
                pagina=current_slot.pagina,
                x0=current_slot.x0,
                y0=start_y,
                x1=current_slot.x1,
                y1=end_y,
                coluna=current_slot.coluna
            ))
            
        pages_involved = sorted(list(set(seg.pagina for seg in segments)))
        prefix = "qd" if current_m.tipo == QuestionType.DISCURSIVA else "q"
        id_q = f"{prefix}{current_m.numero:02d}"
        
        conf = current_m.confianca
        if len(segments) > 2:
            conf = min(conf, 0.90)
            
        q = Question(
            numero=current_m.numero,
            id_questao=id_q,
            tipo=current_m.tipo,
            paginas=pages_involved,
            segmentos=segments,
            caminho_png="",
            caminho_json="",
            largura=0,
            altura=0,
            confianca=conf,
            status=QuestionStatus.PENDENTE,
            marcadores=[current_m]
        )
        questions.append(q)
        logger.debug(f"Questão construída: {id_q} ({current_m.tipo.value}, Páginas: {pages_involved}, {len(segments)} segmentos)")
    
    return questions


def validate_sequence(questions: List[Question]) -> List[Dict[str, Any]]:
    anomalias = []
    
    for q_type in [QuestionType.DISCURSIVA, QuestionType.OBJETIVA]:
        group = [q for q in questions if q.tipo == q_type]
        if not group:
            continue
        
        group_sorted = sorted(group, key=lambda q: q.numero)
        expected = group_sorted[0].numero
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