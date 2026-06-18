import pytesseract
from PIL import Image
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple

from ..core.models import Exam, PageData, Marker, DetectionMethod
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)

QUESTAO_PATTERNS_OCR = [
    r"(?:QUESTÃO|Questão|Questao)\s*(\d{1,3})",
    r"(?:Q|q)\.?\s*(\d{1,3})",
    r"^(\d{1,3})\s*[\.\)]",
]

import re
COMPILED_PATTERNS_OCR = [re.compile(p, re.IGNORECASE | re.MULTILINE) for p in QUESTAO_PATTERNS_OCR]


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


def detect_markers_in_ocr(ocr_blocks: List[Dict[str, Any]], page_num: int) -> List[Marker]:
    markers = []
    
    for block in ocr_blocks:
        text = block["text"]
        for pattern in COMPILED_PATTERNS_OCR:
            matches = pattern.finditer(text)
            for match in matches:
                try:
                    numero = int(match.group(1))
                    if 1 <= numero <= 100:
                        markers.append(Marker(
                            numero=numero,
                            pagina=page_num,
                            x=block["x"],
                            y=block["y"],
                            metodo=DetectionMethod.OCR,
                            confianca=block["conf"] / 100.0,
                            texto_original=match.group(0)
                        ))
                except (ValueError, IndexError):
                    continue
    
    return markers


def run_ocr_if_needed(exam: Exam, structural_markers: List[Marker]) -> Exam:
    pages_with_markers = set(m.pagina for m in structural_markers)
    all_pages = set(p.numero for p in exam.paginas)
    pages_without_markers = all_pages - pages_with_markers
    
    if exam.tipo_pdf.value in ["escaneado", "hibrido"] or pages_without_markers:
        logger.info(f"Executando OCR para {len(exam.paginas)} páginas (tipo: {exam.tipo_pdf.value})")
        
        all_ocr_markers = []
        
        for page_data in exam.paginas:
            if exam.tipo_pdf.value == "digital" and page_data.numero not in pages_without_markers:
                continue
            
            try:
                text, conf, ocr_blocks = run_ocr_on_page(page_data)
                page_data.ocr_texto = text
                page_data.ocr_confianca = conf
                page_data.ocr_dados = ocr_blocks
                
                ocr_markers = detect_markers_in_ocr(ocr_blocks, page_data.numero)
                all_ocr_markers.extend(ocr_markers)
                
                for m in ocr_markers:
                    logger.debug(f"Marcador OCR: Q{m.numero} p{m.pagina} ({m.x:.0f},{m.y:.0f}) conf={m.confianca:.2f}")
                    
            except Exception as e:
                logger.error(f"Erro no OCR da página {page_data.numero}: {e}")
        
        logger.info(f"OCR concluído: {len(all_ocr_markers)} marcadores adicionais encontrados")
        return exam, all_ocr_markers
    
    logger.info("PDF digital com marcadores suficientes, OCR não necessário")
    return exam, []


def merge_markers(structural: List[Marker], ocr: List[Marker]) -> List[Marker]:
    all_markers = structural + ocr
    
    seen = {}
    for m in all_markers:
        key = (m.numero, m.pagina)
        if key not in seen or m.confianca > seen[key].confianca:
            seen[key] = m
    
    merged = list(seen.values())
    merged.sort(key=lambda m: (m.pagina, m.y))
    
    return merged