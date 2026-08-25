import cv2
import numpy as np
import fitz
import json
from pathlib import Path
from typing import List, Tuple, Optional
from PIL import Image, ImageOps

from ..core.models import Exam, Question, PageData, Segment
from ..utils.logging import get_logger
from ..config import config
from .structural_extractor import decode_enade_str

logger = get_logger(__name__)


def trim_segment_area_livre(doc: fitz.Document, seg: Segment) -> Segment:
    """
    Trims dead space (ÁREA LIVRE / RASCUNHO boxes) at the bottom of a segment.
    Returns a new Segment with adjusted y1 if an AREA LIVRE or RASCUNHO block is found.
    """
    if seg.pagina <= 0 or seg.pagina > doc.page_count:
        return seg
        
    page = doc[seg.pagina - 1]
    clip_rect = fitz.Rect(seg.x0, seg.y0, seg.x1, seg.y1)
    
    try:
        blocks = page.get_text("blocks", clip=clip_rect)
        for b in blocks:
            txt = decode_enade_str(b[4]).upper()
            if "ÁREA LIVRE" in txt or "AREA LIVRE" in txt or "RASCUNHO" in txt:
                # b[1] is y0 of the block
                block_y0 = b[1]
                if block_y0 > seg.y0 + 20.0:
                    new_y1 = max(seg.y0 + 30.0, block_y0 - 4.0)
                    logger.debug(f"Segmento Pág {seg.pagina} aparado: y1 {seg.y1:.1f} -> {new_y1:.1f} (Removido {b[4].strip()[:20]})")
                    return Segment(
                        pagina=seg.pagina,
                        x0=seg.x0,
                        y0=seg.y0,
                        x1=seg.x1,
                        y1=new_y1,
                        coluna=seg.coluna
                    )
    except Exception as e:
        logger.warning(f"Erro ao aparar segmento: {e}")
        
    return seg


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
    figures_dir: Path
) -> Tuple[str, List[str]]:
    """
    Extracts text inside the question's segment bounding boxes and exports any embedded raster figures.
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
                        figure_paths.append(str(fig_file))
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
    
    # 1. Trim segments to remove ÁREA LIVRE / RASCUNHO dead space
    trimmed_segments = [trim_segment_area_livre(doc, seg) for seg in question.segmentos]
    question.segmentos = trimmed_segments
    
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
    question.caminho_png = str(png_path)
    
    # Extract text & embedded figures
    text, figures = extract_question_text_and_figures(doc, question, figures_dir)
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