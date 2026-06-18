import cv2
import numpy as np
from pathlib import Path
from typing import List
from PIL import Image

from ..core.models import Exam, Question, PageData
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


def extract_question_image(exam: Exam, question: Question) -> Question:
    page_images = []
    
    for page_num in question.paginas:
        page_data = next((p for p in exam.paginas if p.numero == page_num), None)
        if not page_data:
            logger.warning(f"Página {page_num} não encontrada para questão {question.numero}")
            continue
        
        img = cv2.imread(page_data.caminho_imagem)
        if img is None:
            logger.error(f"Não foi possível carregar imagem: {page_data.caminho_imagem}")
            continue
        
        page_images.append((page_num, img, page_data))
    
    if not page_images:
        raise ValueError(f"Nenhuma imagem válida para questão {question.numero}")
    
    if len(page_images) == 1:
        _, img, page_data = page_images[0]
        question.largura = img.shape[1]
        question.altura = img.shape[0]
    else:
        widths = [img.shape[1] for _, img, _ in page_images]
        heights = [img.shape[0] for _, img, _ in page_images]
        question.largura = max(widths)
        question.altura = sum(heights)
    
    output_dir = config.QUESTOES_DIR / str(exam.ano)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    png_filename = f"q{question.numero:02d}.png"
    png_path = output_dir / png_filename
    
    if len(page_images) == 1:
        _, img, _ = page_images[0]
        cv2.imwrite(str(png_path), img, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    else:
        combined = combine_pages_vertically(page_images)
        cv2.imwrite(str(png_path), combined, [cv2.IMWRITE_PNG_COMPRESSION, 1])
    
    question.caminho_png = str(png_path)
    logger.info(f"PNG gerado: {png_path.name} ({question.largura}x{question.altura})")
    
    return question


def combine_pages_vertically(page_images: List[tuple]) -> np.ndarray:
    max_width = max(img.shape[1] for _, img, _ in page_images)
    total_height = sum(img.shape[0] for _, img, _ in page_images)
    
    combined = np.ones((total_height, max_width, 3), dtype=np.uint8) * 255
    
    y_offset = 0
    for page_num, img, page_data in page_images:
        h, w = img.shape[:2]
        
        if w < max_width:
            padding = max_width - w
            left_pad = padding // 2
            right_pad = padding - left_pad
            img = cv2.copyMakeBorder(img, 0, 0, left_pad, right_pad, cv2.BORDER_CONSTANT, value=(255, 255, 255))
        
        combined[y_offset:y_offset + h, :] = img
        y_offset += h
    
    return combined


def save_question_metadata(question: Question, exam: Exam) -> Question:
    output_dir = config.QUESTOES_DIR / str(exam.ano)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    json_filename = f"q{question.numero:02d}.json"
    json_path = output_dir / json_filename
    
    import json
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(question.to_dict(), f, ensure_ascii=False, indent=2)
    
    question.caminho_json = str(json_path)
    return question


def generate_all_question_pngs(exam: Exam) -> Exam:
    for question in exam.questoes:
        try:
            question = extract_question_image(exam, question)
            question = save_question_metadata(question, exam)
            exam.questoes_extraidas += 1
        except Exception as e:
            logger.error(f"Erro ao gerar PNG para questão {question.numero}: {e}")
            question.anomalias.append(f"ERRO_GERACAO_PNG: {str(e)}")
    
    return exam