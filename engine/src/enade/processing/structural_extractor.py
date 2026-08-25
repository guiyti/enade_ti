import re
import fitz
from typing import List, Dict, Any, Tuple, Optional
from dataclasses import dataclass

from ..core.models import Exam, PageData, Marker, QuestionType, DetectionMethod
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)

# CMap decoding table for ENADE PDFs with corrupted font tables (e.g. 2014, 2017)
CMAP_CHARS = {
    'Ϭ': '0', 'ϭ': '1', 'Ϯ': '2', 'ϯ': '3', 'ϰ': '4',
    'ϱ': '5', 'ϲ': '6', 'ϳ': '7', 'ϴ': '8', 'ϵ': '9',
    '\x00': '', '\x03': ' ', '\x04': ' ', '\x08': 'Ã', '\x1c': 'E', '\x12': 'I', '\x1f': 'N', '\x18': 'D'
}

def decode_enade_str(s: str) -> str:
    """Decodes corrupted CMap characters found in certain ENADE PDFs."""
    res = []
    for c in s:
        res.append(CMAP_CHARS.get(c, c))
    txt = ''.join(res)
    txt = re.sub(r'Yh\s*E?\s*\^d\s*Ã?\s*K', 'QUESTÃO', txt)
    txt = re.sub(r'/\s*I?\s*E?\s*h\s*Z\s*\^?\s*/\s*s\s*E?', 'DISCURSIVA', txt)
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
    h = page.rect.height
    w = page.rect.width
    
    for block in dict_data.get("blocks", []):
        if "lines" not in block:
            continue
        
        for line in block["lines"]:
            line_text = ""
            line_bbox = None
            max_font_size = 0.0
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
            
            decoded_text = decode_enade_str(line_text).strip()
            if decoded_text and line_bbox:
                # Filter out header (top 50) and footer (bottom 45)
                if line_bbox[1] < 45 or line_bbox[3] > h - 40:
                    continue
                
                # Determine column
                if num_colunas == 2:
                    if line_bbox[2] <= mid_x + 15:
                        col = 1
                    elif line_bbox[0] >= mid_x - 15:
                        col = 2
                    else:
                        col = 0
                else:
                    col = 0
                
                blocks.append(TextBlock(
                    text=decoded_text,
                    x0=line_bbox[0],
                    y0=line_bbox[1],
                    x1=line_bbox[2],
                    y1=line_bbox[3],
                    page_num=page_num,
                    coluna=col,
                    font_size=max_font_size,
                    font_name=font_name
                ))
    
    return blocks


def detect_markers_in_page(
    page: fitz.Page, 
    page_num: int, 
    num_colunas: int, 
    mid_x: float,
    blocks: List[TextBlock]
) -> Tuple[List[Marker], List[SharedContext]]:
    markers = []
    contexts = []
    
    # Check for survey header on this page
    text = decode_enade_str(page.get_text())
    if page_num > 3 and RE_SURVEY_HEADING.search(text):
        logger.info(f"Página {page_num}: Questionário de percepção detectado. Finalizando busca de questões.")
        return [], []
    
    # Sort blocks by vertical order, grouping by column if 2 columns
    if num_colunas == 2:
        blocks_sorted = sorted(blocks, key=lambda b: (b.coluna if b.coluna > 0 else 1, b.y0))
    else:
        blocks_sorted = sorted(blocks, key=lambda b: b.y0)
    
    for b in blocks_sorted:
        text_line = b.text.strip()
        
        # Check shared context header
        if RE_SHARED_CONTEXT.search(text_line):
            q_list = []
            m_rng = re.search(r'(?:quest[õo]es|responder)\s*(?:de\s+)?(\d{1,3})\s*(?:a|e|à|ao|até)\s*(\d{1,3})', text_line, re.IGNORECASE)
            if m_rng:
                try:
                    q_start = int(m_rng.group(1))
                    q_end = int(m_rng.group(2))
                    q_list = list(range(min(q_start, q_end), max(q_start, q_end) + 1))
                except Exception:
                    pass
            contexts.append(SharedContext(
                pagina=page_num,
                coluna=b.coluna,
                x0=b.x0,
                y0=b.y0,
                x1=b.x1,
                y1=b.y1,
                texto=text_line,
                questoes=q_list
            ))
            continue
        
        # Check Discursive
        m_disc = RE_DISCURSIVA.match(text_line)
        if m_disc:
            num_str = m_disc.group(1) or m_disc.group(2) or m_disc.group(3)
            numero = int(num_str) if num_str else 1
            if 1 <= numero <= 100:
                markers.append(Marker(
                    numero=numero,
                    tipo=QuestionType.DISCURSIVA,
                    pagina=page_num,
                    x=b.x0,
                    y=b.y0,
                    x1=b.x1,
                    y1=b.y1,
                    coluna=b.coluna,
                    metodo=DetectionMethod.PDF_STRUCTURE,
                    confianca=0.98,
                    texto_original=text_line
                ))
                continue
        
        # Check Objective
        m_obj = RE_OBJETIVA.match(text_line)
        if m_obj and 'DISCURSIVA' not in text_line.upper() and 'DISC URSIVA' not in text_line.upper():
            try:
                numero = int(m_obj.group(1))
                if 1 <= numero <= 100:
                    markers.append(Marker(
                        numero=numero,
                        tipo=QuestionType.OBJETIVA,
                        pagina=page_num,
                        x=b.x0,
                        y=b.y0,
                        x1=b.x1,
                        y1=b.y1,
                        coluna=b.coluna,
                        metodo=DetectionMethod.PDF_STRUCTURE,
                        confianca=0.98,
                        texto_original=text_line
                    ))
            except (ValueError, IndexError):
                continue
    
    return markers, contexts


def extract_structural_data(exam: Exam) -> Tuple[Exam, List[Marker], List[SharedContext]]:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    doc = fitz.open(pdf_path)
    
    all_markers = []
    all_contexts = []
    survey_started = False
    
    for page_data in exam.paginas:
        # Skip page 1 (cover)
        if page_data.numero == 1:
            continue
        
        if survey_started:
            break
            
        page = doc[page_data.numero - 1]
        text_raw = page.get_text()
        text_decoded = decode_enade_str(text_raw)
        page_data.texto_estrutural = text_decoded
        
        if page_data.numero > 3 and RE_SURVEY_HEADING.search(text_decoded):
            logger.info(f"Questionário de percepção detectado na página {page_data.numero}. Interrompendo busca de questões.")
            survey_started = True
            break
            
        blocks = extract_text_blocks(
            page, 
            page_data.numero, 
            page_data.num_colunas, 
            page_data.coluna_divisoria_x
        )
        page_data.blocos = [
            {
                "text": b.text,
                "x0": b.x0,
                "y0": b.y0,
                "x1": b.x1,
                "y1": b.y1,
                "coluna": b.coluna,
                "font_size": b.font_size,
                "font_name": b.font_name
            }
            for b in blocks
        ]
        
        markers, contexts = detect_markers_in_page(
            page,
            page_data.numero,
            page_data.num_colunas,
            page_data.coluna_divisoria_x,
            blocks
        )
        
        all_markers.extend(markers)
        all_contexts.extend(contexts)
        
        for m in markers:
            logger.debug(f"Marcador: {m.tipo.value} Q{m.numero} p{m.pagina} col={m.coluna} ({m.x:.0f},{m.y:.0f})")
    
    doc.close()
    
    # Sort markers: Discursive first, then Objective, ordered by page and y
    all_markers.sort(key=lambda m: (0 if m.tipo == QuestionType.DISCURSIVA else 1, m.pagina, m.coluna, m.y))
    exam.questoes_detectadas = len(all_markers)
    
    logger.info(f"Extração estrutural concluída: {len(all_markers)} marcadores encontrados ({sum(1 for m in all_markers if m.tipo == QuestionType.DISCURSIVA)} discursivas, {sum(1 for m in all_markers if m.tipo == QuestionType.OBJETIVA)} objetivas)")
    return exam, all_markers, all_contexts