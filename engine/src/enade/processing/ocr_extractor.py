import re
import pytesseract
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple

from ..core.models import Exam, PageData, Marker, QuestionType, DetectionMethod
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)

RE_DISC_OCR = re.compile(
    r'(?:QUEST[ÃA]O\s+DISCURSIVA(?:\s+(\d{1,2}))?|QUEST[ÃA]O\s+(\d{1,2})\s*[\-–—]\s*DISC\s*URSIVA)', 
    re.IGNORECASE
)
RE_OBJ_OCR = re.compile(
    r'(?:QUEST[ÃA]O|Quest[ãa]o|QuESt[ãa]O)\s+(\d{1,3})\b', 
    re.IGNORECASE
)


def preprocess_image_for_ocr(image_path: Path) -> np.ndarray:
    img = cv2.imread(str(image_path))
    if img is None:
        raise ValueError(f"Não foi possível carregar a imagem: {image_path}")
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(gray, h=10)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)
    return enhanced


def run_ocr_on_page(page_data: PageData) -> Tuple[str, float, List[Dict[str, Any]]]:
    img_path = Path(page_data.caminho_imagem)
    processed = preprocess_image_for_ocr(img_path)
    
    custom_config = f'--oem 3 --psm 6 -l {config.TESSERACT_LANG}'
    
    data = pytesseract.image_to_data(
        processed, 
        config=custom_config, 
        output_type=pytesseract.Output.DICT
    )
    
    texts = []
    confidences = []
    ocr_blocks = []
    
    n_boxes = len(data['text'])
    for i in range(n_boxes):
        text = data['text'][i].strip()
        conf = int(data['conf'][i]) if data['conf'][i] != '-1' else 0
        
        if text and conf > 30:
            texts.append(text)
            confidences.append(conf)
            ocr_blocks.append({
                "text": text,
                "x": data['left'][i],
                "y": data['top'][i],
                "w": data['width'][i],
                "h": data['height'][i],
                "conf": conf,
                "block_num": data['block_num'][i],
                "par_num": data['par_num'][i],
                "line_num": data['line_num'][i],
                "word_num": data['word_num'][i]
            })
    
    full_text = " ".join(texts)
    avg_conf = sum(confidences) / len(confidences) if confidences else 0
    
    return full_text, avg_conf, ocr_blocks


def detect_markers_in_ocr(ocr_blocks: List[Dict[str, Any]], page_num: int, dpi: int = 300) -> List[Marker]:
    markers = []
    scale = 72.0 / dpi  # convert pixel to pt
    
    # Reconstruct lines from OCR words
    lines: Dict[Tuple[int, int, int], List[Dict[str, Any]]] = {}
    for block in ocr_blocks:
        key = (block['block_num'], block['par_num'], block['line_num'])
        if key not in lines:
            lines[key] = []
        lines[key].append(block)
    
    for key, words in lines.items():
        line_text = " ".join(w["text"] for w in words).strip()
        min_x = min(w["x"] for w in words) * scale
        min_y = min(w["y"] for w in words) * scale
        max_x = max(w["x"] + w["w"] for w in words) * scale
        max_y = max(w["y"] + w["h"] for w in words) * scale
        avg_conf = sum(w["conf"] for w in words) / (len(words) * 100.0)
        
        # Check Discursive
        m_disc = RE_DISC_OCR.search(line_text)
        if m_disc:
            num_str = m_disc.group(1) or m_disc.group(2)
            num = int(num_str) if num_str else 1
            markers.append(Marker(
                numero=num,
                tipo=QuestionType.DISCURSIVA,
                pagina=page_num,
                x=min_x,
                y=min_y,
                x1=max_x,
                y1=max_y,
                metodo=DetectionMethod.OCR,
                confianca=avg_conf,
                texto_original=line_text
            ))
            continue
            
        # Check Objective
        m_obj = RE_OBJ_OCR.search(line_text)
        if m_obj and 'DISCURSIVA' not in line_text.upper():
            try:
                num = int(m_obj.group(1))
                if 1 <= num <= 100:
                    markers.append(Marker(
                        numero=num,
                        tipo=QuestionType.OBJETIVA,
                        pagina=page_num,
                        x=min_x,
                        y=min_y,
                        x1=max_x,
                        y1=max_y,
                        metodo=DetectionMethod.OCR,
                        confianca=avg_conf,
                        texto_original=line_text
                    ))
            except (ValueError, IndexError):
                continue
    
    return markers


def run_ocr_if_needed(exam: Exam, structural_markers: List[Marker]) -> Tuple[Exam, List[Marker]]:
    # If structural markers found a healthy set of questions, OCR is not strictly needed
    if len(structural_markers) >= 30 and exam.tipo_pdf.value == "digital":
        logger.info(f"PDF digital com {len(structural_markers)} marcadores estruturais. OCR ignorado.")
        return exam, []
    
    pages_with_markers = set(m.pagina for m in structural_markers)
    all_pages = set(p.numero for p in exam.paginas if p.numero > 1)
    pages_without_markers = all_pages - pages_with_markers
    
    all_ocr_markers = []
    for page_data in exam.paginas:
        if page_data.numero == 1:
            continue
        if exam.tipo_pdf.value == "digital" and page_data.numero not in pages_without_markers:
            continue
        
        try:
            text, conf, ocr_blocks = run_ocr_on_page(page_data)
            page_data.ocr_texto = text
            page_data.ocr_confianca = conf
            page_data.ocr_dados = ocr_blocks
            
            ocr_markers = detect_markers_in_ocr(ocr_blocks, page_data.numero, config.PDF_DPI)
            all_ocr_markers.extend(ocr_markers)
        except Exception as e:
            logger.error(f"Erro no OCR da página {page_data.numero}: {e}")
    
    return exam, all_ocr_markers


def merge_markers(structural: List[Marker], ocr: List[Marker]) -> List[Marker]:
    merged_dict: Dict[Tuple[str, int], Marker] = {}
    
    # Structural markers take precedence (keep first occurrence in reading flow)
    for m in structural:
        key = (m.tipo.value, m.numero)
        if key not in merged_dict:
            merged_dict[key] = m
    
    # OCR markers add any missing ones
    for m in ocr:
        key = (m.tipo.value, m.numero)
        if key not in merged_dict:
            merged_dict[key] = m
        elif merged_dict[key].confianca < m.confianca:
            merged_dict[key] = m
    
    merged = list(merged_dict.values())
    merged.sort(key=lambda m: (m.pagina, m.coluna, m.y))
    return merged