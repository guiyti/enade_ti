import fitz
import re
from pathlib import Path
from typing import List, Tuple, Dict, Any, Optional
from dataclasses import dataclass

from ..core.models import Exam, PageData, Marker, QuestionType, DetectionMethod
from ..utils.logging import get_logger

logger = get_logger(__name__)

# CMap decoding table for ENADE PDFs with corrupted font tables (e.g. 2014, 2017)
CMAP_CHARS = {
    'Ϭ': '0', 'ϭ': '1', 'Ϯ': '2', 'ϯ': '3', 'ϰ': '4',
    'ϱ': '5', 'ϲ': '6', 'ϳ': '7', 'ϴ': '8', 'ϵ': '9',
    'Ă': 'a', 'ă': 'a', 'Ą': 'A', 'ą': 'a', 'Ć': 'ã', 'ć': 'a',
    'ĕ': 'ç', 'Ɓ': 'õ', 'ƚ': 't', 'Đ': 'c', 'Ě': 'd', 'Ğ': 'e',
    'ġ': 'g', 'Ġ': 'é', 'Ś': 'h', 'ŝ': 'i', 'Į': 'f', 'ů': 'l',
    'ŵ': 'm', 'Ŷ': 'n', 'Ž': 'o', 'Ő': 'g', 'ƌ': 'r', 'Ɛ': 's',
    'Ƶ': 'u', 'ǀ': 'v', 'ǆ': 'x', 'ǌ': 'z', 'Ĩ': 'f', 'Ɵ': 'ti',
    'ş': 'í', 'Ʒ': 'u', 'ď': 'b', 'Ɖ': 'p', 'ſ': 'o', 'й': '%',
    '\u0378': 'é', '͞': '"', '͟': '"',
    '\x11': 'B', '\x12': 'I', '\x18': 'D', '\x1c': 'E', '\x1f': 'N',
    'Ƌ': 'q', 'ƫ': 't', 'Ʃ': 't', 'ƪ': 'j', 'Ƭ': 'T', 'ƭ': 't',
    'Ư': 'U', 'ư': 'u', 'Ʊ': 'U', 'Ʋ': 'V', 'Ƴ': 'Y', 'ƴ': 'y',
    '\x00': '', '\x03': ' ', '\x04': ' ', '\x08': 'Ã', '\x17': 'A', '\x06': 'A',
    '͕': ',', '͘': '.', 'Ͳ': '-', '͗': ':', ';': '(', 'Ϳ': ')'
}

def decode_enade_str(s: str) -> str:
    """Decodes corrupted CMap characters found in certain ENADE PDFs."""
    res = []
    for c in s:
        res.append(CMAP_CHARS.get(c, c))
    txt = ''.join(res)
    txt = re.sub(r'Yh\s*E?\s*\^d\s*Ã?\s*K', 'QUESTÃO', txt, flags=re.IGNORECASE)
    txt = re.sub(r'/\s*I?\s*E?\s*h\s*Z\s*\^?\s*/\s*s\s*E?', 'DISCURSIVA', txt, flags=re.IGNORECASE)
    return txt


RE_DISCURSIVA = re.compile(
    r'^\s*QUEST[ÃA]O\s+(?:DISC\s*URSIVA(?:\s+(\d{1,3}))?|(\d{1,3})\s*[\-–—]\s*DISC\s*URSIVA|(\d{1,3})\s*[\-–—]\s*Discursiva)',
    re.IGNORECASE
)

RE_OBJETIVA = re.compile(
    r'^\s*(?:QUEST[ÃA]O|Quest[ãa]o|QuESt[ãa]O)\s+(\d{1,3})\b',
    re.IGNORECASE
)

RE_SURVEY_HEADING = re.compile(
    r'^\s*QUESTION[ÁA]RIO\s+DE\s+PERCEP[ÇC][ÃA]O',
    re.IGNORECASE | re.MULTILINE
)

RE_SHARED_CONTEXT = re.compile(
    r'^\s*(?:Texto|Instru[çc][ãa]o|Observe|Considere|As\s+informa[çc][õo]es|Quadro|Figura|Tabela)\s+(?:para\s+(?:as\s+)?quest[õo]es|a\s+seguir\s+para\s+responder\s+[àa]s?\s+quest[õo]es)',
    re.IGNORECASE
)


@dataclass
class SharedContext:
    pagina: int
    coluna: int
    x0: float
    y0: float
    x1: float
    y1: float
    texto: str
    questoes: List[int] = None


@dataclass
class TextBlock:
    text: str
    x0: float
    y0: float
    x1: float
    y1: float
    page_num: int
    coluna: int = 0
    font_size: float = 0.0
    font_name: str = ""


def extract_text_blocks(page: fitz.Page, page_num: int, num_colunas: int, mid_x: float) -> List[TextBlock]:
    blocks = []
    dict_data = page.get_text("dict")
    
    for b in dict_data.get("blocks", []):
        if "lines" not in b:
            continue
        
        block_text_parts = []
        max_font_size = 0.0
        font_name = ""
        
        for line in b["lines"]:
            line_parts = []
            for span in line.get("spans", []):
                span_text = decode_enade_str(span.get("text", ""))
                line_parts.append(span_text)
                if span.get("size", 0) > max_font_size:
                    max_font_size = span.get("size", 0)
                    font_name = span.get("font", "")
            block_text_parts.append("".join(line_parts))
            
        full_text = "\n".join(block_text_parts).strip()
        if not full_text:
            continue
            
        x0, y0, x1, y1 = b["bbox"]
        
        # Determine column
        if num_colunas == 2:
            if x1 <= mid_x + 10:
                coluna = 0
            elif x0 >= mid_x - 10:
                coluna = 1
            else:
                coluna = 0 # spans both
        else:
            coluna = 0
            
        tb = TextBlock(
            text=full_text,
            x0=x0,
            y0=y0,
            x1=x1,
            y1=y1,
            page_num=page_num,
            coluna=coluna,
            font_size=max_font_size,
            font_name=font_name
        )
        blocks.append(tb)
        
    return blocks


def detect_markers_in_page(
    page: fitz.Page, 
    page_num: int, 
    num_colunas: int, 
    mid_x: float,
    blocks: List[TextBlock]
) -> Tuple[List[Marker], List[SharedContext]]:
    markers = []
    shared_contexts = []
    
    # Sort blocks by column, then by y0
    sorted_blocks = sorted(blocks, key=lambda b: (b.coluna, b.y0))
    
    for b in sorted_blocks:
        # Check for Survey Heading (End of Exam)
        if RE_SURVEY_HEADING.search(b.text):
            logger.info(f"Survey heading found on page {page_num}, col {b.coluna} at y={b.y0:.1f}")
            continue
            
        # Check for Discursive Question
        m_disc = RE_DISCURSIVA.search(b.text)
        if m_disc:
            num = None
            for g in m_disc.groups():
                if g:
                    num = int(g)
                    break
            
            has_bold = "bold" in b.font_name.lower() or "negrito" in b.font_name.lower() or b.font_size >= 11.0
            conf = 1.0 if (has_bold and num is not None) else 0.85
            
            qm = Marker(
                numero=num if num is not None else 1,
                tipo=QuestionType.DISCURSIVA,
                pagina=page_num,
                coluna=b.coluna,
                x=b.x0,
                y=b.y0,
                x1=b.x1,
                y1=b.y1,
                metodo=DetectionMethod.PDF_STRUCTURE,
                confianca=conf,
                texto_original=b.text
            )
            markers.append(qm)
            continue
            
        # Check for Objective Question
        m_obj = RE_OBJETIVA.search(b.text)
        if m_obj:
            num = int(m_obj.group(1))
            
            if y_is_header_or_footer(b.y0, page.rect.height):
                continue
                
            has_bold = "bold" in b.font_name.lower() or "negrito" in b.font_name.lower() or b.font_size >= 11.0
            conf = 1.0 if has_bold else 0.90
            
            qm = Marker(
                numero=num,
                tipo=QuestionType.OBJETIVA,
                pagina=page_num,
                coluna=b.coluna,
                x=b.x0,
                y=b.y0,
                x1=b.x1,
                y1=b.y1,
                metodo=DetectionMethod.PDF_STRUCTURE,
                confianca=conf,
                texto_original=b.text
            )
            markers.append(qm)
            continue
            
        # Check for Shared Context / Motivator texts
        m_ctx = RE_SHARED_CONTEXT.search(b.text)
        if m_ctx:
            sc = SharedContext(
                pagina=page_num,
                coluna=b.coluna,
                x0=b.x0,
                y0=b.y0,
                x1=b.x1,
                y1=b.y1,
                texto=b.text
            )
            shared_contexts.append(sc)
            
    return markers, shared_contexts


def y_is_header_or_footer(y: float, page_height: float) -> bool:
    """Header (< 55 pt) or footer (> height - 45 pt) threshold filter."""
    return y < 55.0 or y > (page_height - 45.0)


from ..config import config


def extract_structural_data(exam: Exam) -> Tuple[Exam, List[Marker], List[SharedContext]]:
    """
    Extracts all text blocks, question markers, and shared contexts across all pages of an exam.
    """
    pdf_path = Path(exam.arquivo)
    if not pdf_path.exists():
        pdf_path = config.PROVAS_DIR / exam.arquivo
    doc = fitz.open(str(pdf_path))
    all_markers: List[Marker] = []
    all_contexts: List[SharedContext] = []
    
    # Process each page (skip cover page 1)
    for p_idx in range(1, len(doc)):
        page = doc[p_idx]
        page_num = p_idx + 1
        
        page_data = next((p for p in exam.paginas if p.numero == page_num), None)
        num_colunas = page_data.num_colunas if page_data else 1
        mid_x = page_data.coluna_divisoria_x if page_data else (page.rect.width / 2.0)
        
        blocks = extract_text_blocks(page, page_num, num_colunas, mid_x)
        markers, contexts = detect_markers_in_page(page, page_num, num_colunas, mid_x, blocks)
        
        all_markers.extend(markers)
        all_contexts.extend(contexts)
        
    doc.close()
    
    all_markers = sorted(all_markers, key=lambda m: (m.pagina, m.coluna, m.y))
    
    return exam, all_markers, all_contexts