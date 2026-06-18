import fitz
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass

from ..core.models import Exam, PageData, Marker, DetectionMethod
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)

QUESTAO_PATTERNS = [
    r"(?:^|\n)(?:QUESTÃO|Questão|Questao)\s+(\d{1,3})\b",
    r"(?:^|\n)(?:Q|q)\.?\s*(\d{1,3})\b",
    r"^(\d{1,3})\s*[\.\)]",
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE | re.MULTILINE) for p in QUESTAO_PATTERNS]


@dataclass
class TextBlock:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    page_num: int
    font_size: float = 0
    font_name: str = ""


def extract_text_blocks(page: fitz.Page, page_num: int) -> List[TextBlock]:
    blocks = []
    dict_data = page.get_text("dict")
    
    for block in dict_data.get("blocks", []):
        if "lines" not in block:
            continue
        
        for line in block["lines"]:
            line_text = ""
            line_bbox = None
            max_font_size = 0
            font_name = ""
            
            for span in line["spans"]:
                line_text += span["text"]
                if not line_bbox:
                    line_bbox = list(span["bbox"])
                else:
                    line_bbox[0] = min(line_bbox[0], span["bbox"][0])
                    line_bbox[1] = min(line_bbox[1], span["bbox"][1])
                    line_bbox[2] = max(line_bbox[2], span["bbox"][2])
                    line_bbox[3] = max(line_bbox[3], span["bbox"][3])
                max_font_size = max(max_font_size, span["size"])
                font_name = span["font"]
            
            if line_text.strip() and line_bbox:
                blocks.append(TextBlock(
                    text=line_text.strip(),
                    x0=line_bbox[0],
                    y0=line_bbox[1],
                    x1=line_bbox[2],
                    y1=line_bbox[3],
                    page_num=page_num,
                    font_size=max_font_size,
                    font_name=font_name
                ))
    
    return blocks


def detect_markers_in_blocks(blocks: List[TextBlock]) -> List[Marker]:
    markers = []
    
    for block in blocks:
        for pattern in COMPILED_PATTERNS:
            matches = pattern.finditer(block.text)
            for match in matches:
                try:
                    numero = int(match.group(1))
                    if 1 <= numero <= 100:
                        markers.append(Marker(
                            numero=numero,
                            pagina=block.page_num,
                            x=block.x0,
                            y=block.y0,
                            metodo=DetectionMethod.PDF_STRUCTURE,
                            confianca=0.95,
                            texto_original=match.group(0)
                        ))
                except (ValueError, IndexError):
                    continue
    
    return markers


def extract_structural_data(exam: Exam) -> Exam:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    doc = fitz.open(pdf_path)
    
    all_markers = []
    
    for page_data in exam.paginas:
        page = doc[page_data.numero - 1]
        
        text = page.get_text()
        page_data.texto_estrutural = text
        
        blocks = extract_text_blocks(page, page_data.numero)
        page_data.blocos = [
            {
                "text": b.text,
                "x0": b.x0,
                "y0": b.y0,
                "x1": b.x1,
                "y1": b.y1,
                "font_size": b.font_size,
                "font_name": b.font_name
            }
            for b in blocks
        ]
        
        markers = detect_markers_in_blocks(blocks)
        all_markers.extend(markers)
        
        for m in markers:
            logger.debug(f"Marcador estrutural: Q{m.numero} p{m.pagina} ({m.x:.0f},{m.y:.0f})")
    
    doc.close()
    
    all_markers.sort(key=lambda m: (m.pagina, m.y))
    exam.questoes_detectadas = len(all_markers)
    
    logger.info(f"Extração estrutural concluída: {len(all_markers)} marcadores encontrados")
    return exam, all_markers