import cv2
import numpy as np
import fitz
import re
import json
from pathlib import Path
from typing import List, Tuple, Optional
from PIL import Image, ImageOps

from ..core.models import Exam, Question, PageData, Segment
from ..utils.logging import get_logger
from ..config import config
from .structural_extractor import decode_enade_str

logger = get_logger(__name__)

HEADER_PATTERNS = [
    r'^\s*\*[A-Z0-9]+\*\s*$', # barcodes like *R040420252*
    r'^\s*\d{4}\s*$', # isolated year like 2025 or 2011
    r'^\s*(?:FORMA[ÇC][ÃA]O\s+GERAL(?:\s+DOCENTE)?|COMPUTA[ÇC][ÃA]O|CI[ÊE]NCIA\s+DA\s+COMPUTA[ÇC][ÃA]O|TECNOLOGIA\s+EM\s+AN[ÁA]LISE|EXAME\s+NACIONAL)\s*$',
    r'^\s*DISCURSIVAS?\s*$'
]

FOOTER_PATTERNS = [
    r'^\s*\d{1,3}\s*$', # isolated page number
    r'^\s*(?:ENADE|COMPUTA[ÇC][ÃA]O|CI[ÊE]NCIA\s+DA\s+COMPUTA[ÇC][ÃA]O|TECNOLOGIA\s+EM|GEST[ÃA]O\s+DA\s+TECNOLOGIA|FORMA[ÇC][ÃA]O\s+GERAL(?:\s+DOCENTE)?)\s*$',
    r'^\s*\d{1,3}\s*\n\s*(?:ENADE|COMPUTA[ÇC][ÃA]O|CI[ÊE]NCIA|TECNOLOGIA|GEST[ÃA]O|FORMA[ÇC][ÃA]O)',
    r'^\s*(?:ENADE|COMPUTA[ÇC][ÃA]O|CI[ÊE]NCIA|TECNOLOGIA|GEST[ÃA]O|FORMA[ÇC][ÃA]O).*\n\s*\d{1,3}\s*$',
    r'^\s*\*[A-Z0-9]+\*\s*$', # bottom barcode
    r'^\s*PND\d{4}',
    r'\.indb\s+\d+',
    r'ÁREA\s*LIVRE|AREA\s*LIVRE|RASCUNHO',
]


def clean_segment_noise(doc: fitz.Document, seg: Segment) -> Segment:
    """
    Cleans unwanted noise from page borders:
    1. Removes top headers (barcodes, year headers, general course titles).
    2. Removes bottom footers (page numbers, typography lines, barcodes, ÁREA LIVRE / RASCUNHO boxes).
    Uses line-level precision so valid text above 'Área Livre' is NEVER cut off.
    """
    if seg.pagina <= 0 or seg.pagina > doc.page_count:
        return seg
        
    page = doc[seg.pagina - 1]
    h = page.rect.height
    
    new_y0 = seg.y0
    new_y1 = seg.y1
    
    try:
        dict_data = page.get_text("dict")
        for b in dict_data.get("blocks", []):
            if "lines" not in b:
                continue
            for l in b["lines"]:
                l_box = l["bbox"]
                # Skip lines outside segment x-span
                if l_box[2] < seg.x0 or l_box[0] > seg.x1:
                    continue
                
                line_text = decode_enade_str("".join(s["text"] for s in l["spans"])).strip()
                if not line_text:
                    continue
                    
                # 1. Top noise (Headers)
                if l_box[1] < 95.0 and l_box[3] <= new_y0 + 20.0:
                    for pat in HEADER_PATTERNS:
                        if re.search(pat, line_text, re.IGNORECASE):
                            if l_box[3] < new_y1 - 25.0:
                                new_y0 = max(new_y0, l_box[3] + 2.0)
                            break
                            
                # 2. Bottom noise (Footers)
                if l_box[1] >= max(new_y0 + 25.0, h - 130.0):
                    for pat in FOOTER_PATTERNS:
                        if re.search(pat, line_text, re.IGNORECASE):
                            new_y1 = min(new_y1, l_box[1] - 3.0)
                            break
                            
                # 3. Area Livre / Rascunho ANYWHERE at the bottom of the question
                if re.search(r'ÁREA\s*LIVRE|AREA\s*LIVRE|RASCUNHO', line_text, re.IGNORECASE):
                    if l_box[1] > new_y0 + 25.0:
                        new_y1 = min(new_y1, l_box[1] - 3.0)

    except Exception as e:
        logger.warning(f"Erro ao limpar ruído de bordas do segmento (Pág {seg.pagina}): {e}")
        
    if new_y1 <= new_y0 + 10.0:
        return seg

    return Segment(
        pagina=seg.pagina,
        x0=seg.x0,
        y0=new_y0,
        x1=seg.x1,
        y1=new_y1,
        coluna=seg.coluna
    )


def crop_segment_image(
    page_img: np.ndarray, 
    segment: Segment, 
    pdf_page_rect: fitz.Rect
) -> np.ndarray:
    """
    Crops a rectangular segment from a rendered page image.
    Uses exact scaling between PDF point coordinates and pixel dimensions.
    """
    img_h, img_w = page_img.shape[:2]
    scale_x = img_w / pdf_page_rect.width
    scale_y = img_h / pdf_page_rect.height
    
    px0 = max(0, int(segment.x0 * scale_x))
    py0 = max(0, int(segment.y0 * scale_y))
    px1 = min(img_w, int(segment.x1 * scale_x))
    py1 = min(img_h, int(segment.y1 * scale_y))
    
    if py1 <= py0 + 10 or px1 <= px0 + 10:
        # Avoid zero or invalid crops
        return np.ones((50, 50, 3), dtype=np.uint8) * 255
    
    cropped = page_img[py0:py1, px0:px1]
    return cropped


def combine_segments_vertically(segment_images: List[np.ndarray], gap_px: int = 15) -> np.ndarray:
    """
    Combines cropped segments vertically onto a clean white canvas.
    Centers segments horizontally if widths vary.
    """
    if not segment_images:
        return np.ones((100, 100, 3), dtype=np.uint8) * 255
    
    if len(segment_images) == 1:
        img = segment_images[0]
        # Add 15px white border around the image
        return cv2.copyMakeBorder(img, 15, 15, 15, 15, cv2.BORDER_CONSTANT, value=(255, 255, 255))
    
    max_w = max(img.shape[1] for img in segment_images)
    total_h = sum(img.shape[0] for img in segment_images) + gap_px * (len(segment_images) - 1) + 30
    
    combined = np.ones((total_h, max_w + 30, 3), dtype=np.uint8) * 255
    
    y_offset = 15
    for img in segment_images:
        h, w = img.shape[:2]
        x_offset = 15 + (max_w - w) // 2
        combined[y_offset:y_offset + h, x_offset:x_offset + w] = img
        y_offset += h + gap_px
        
    return combined


def extract_question_text_and_figures(
    doc: fitz.Document, 
    question: Question, 
    figures_dir: Path,
    exam_id: str = ""
) -> Tuple[str, List[str]]:
    """
    Extracts high fidelity text and embedded diagrams/raster figures from question segments.
    """
    text_parts = []
    figure_paths = []
    fig_count = 0
    
    for seg in question.segmentos:
        if seg.pagina <= 0 or seg.pagina > doc.page_count:
            continue
            
        page = doc[seg.pagina - 1]
        clip_rect = fitz.Rect(seg.x0, seg.y0, seg.x1, seg.y1)
        
        # Extract clipped text
        raw_text = page.get_text("text", clip=clip_rect)
        decoded = decode_enade_str(raw_text).strip()
        if decoded:
            text_parts.append(decoded)
        
        # Check for raster images in this segment
        try:
            img_list = page.get_images()
            for img_info in img_list:
                xref = img_info[0]
                img_rects = page.get_image_rects(xref)
                for r in img_rects:
                    if clip_rect.intersects(r):
                        fig_count += 1
                        base_img = doc.extract_image(xref)
                        ext = base_img.get("ext", "png")
                        fig_name = f"{question.id_questao}_fig{fig_count}.{ext}"
                        fig_file = figures_dir / fig_name
                        figures_dir.mkdir(parents=True, exist_ok=True)
                        with open(fig_file, "wb") as f:
                            f.write(base_img["image"])
                        
                        web_path = f"/questoes/{exam_id}/figuras/{fig_name}" if exam_id else str(fig_file)
                        figure_paths.append(web_path)
                        break
        except Exception:
            pass
            
    full_text = "\n\n".join(text_parts)
    return full_text, figure_paths


def extract_and_save_question(
    exam: Exam, 
    question: Question, 
    doc: fitz.Document
) -> Question:
    output_dir = config.QUESTOES_DIR / exam.id_prova
    figures_dir = output_dir / "figuras"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. Clean noise (Headers, Footers, Area Livre / Rascunhos)
    cleaned_segments = [clean_segment_noise(doc, seg) for seg in question.segmentos]
    question.segmentos = cleaned_segments
    
    segment_images = []
    
    for seg in question.segmentos:
        page_data = next((p for p in exam.paginas if p.numero == seg.pagina), None)
        if not page_data or not Path(page_data.caminho_imagem).exists():
            continue
            
        page_img = cv2.imread(page_data.caminho_imagem)
        if page_img is None:
            continue
            
        pdf_page = doc[seg.pagina - 1]
        cropped = crop_segment_image(page_img, seg, pdf_page.rect)
        segment_images.append(cropped)
    
    if not segment_images:
        logger.warning(f"Nenhum segmento válido para {question.id_questao}")
        return question
    
    final_img = combine_segments_vertically(segment_images)
    h, w = final_img.shape[:2]
    
    question.largura = w
    question.altura = h
    
    png_path = output_dir / f"{question.id_questao}.png"
    cv2.imwrite(str(png_path), final_img, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    question.caminho_png = f"/questoes/{exam.id_prova}/{question.id_questao}.png"
    
    # Extract text & embedded figures
    text, figures = extract_question_text_and_figures(doc, question, figures_dir, exam.id_prova)
    question.texto_completo = text
    question.figuras = figures
    
    txt_path = output_dir / f"{question.id_questao}.txt"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    question.caminho_txt = str(txt_path)
    
    json_path = output_dir / f"{question.id_questao}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(question.to_dict(), f, ensure_ascii=False, indent=2)
    question.caminho_json = str(json_path)
    
    logger.info(f"Questão {question.id_questao} gerada: {w}x{h}px | Texto: {len(text)} chars | Figuras: {len(figures)}")
    return question


def generate_all_question_pngs(exam: Exam) -> Exam:
    pdf_path = config.PROVAS_DIR / exam.arquivo
    doc = fitz.open(pdf_path)
    
    exam.questoes_extraidas = 0
    
    for question in exam.questoes:
        try:
            question = extract_and_save_question(exam, question, doc)
            if question.largura > 0 and question.altura > 0:
                exam.questoes_extraidas += 1
        except Exception as e:
            logger.error(f"Erro ao gerar questão {question.id_questao}: {e}", exc_info=True)
            question.anomalias.append(f"ERRO_GERACAO: {str(e)}")
            
    doc.close()
    return exam