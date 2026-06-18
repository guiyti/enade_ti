import hashlib
import fitz
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass

from ..core.models import Exam, PDFType
from ..utils.logging import get_logger
from ..config import config

logger = get_logger(__name__)


@dataclass
class PDFInfo:
    arquivo: str
    caminho: Path
    tamanho: int
    hash_arquivo: str
    total_paginas: int
    ano: int
    curso: str


def compute_hash(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def extract_year_course(filename: str) -> tuple[int, str]:
    name = filename.replace(".pdf", "").replace(".PDF", "")
    parts = name.split("_")
    
    ano = 0
    curso = "DESCONHECIDO"
    
    for part in parts:
        if part.isdigit() and len(part) == 4:
            ano = int(part)
        elif part.upper() in ["ADS", "CCP", "GTI", "SI", "ES"]:
            curso = part.upper()
    
    if ano == 0:
        for part in parts:
            if part.isdigit() and len(part) >= 4:
                ano = int(part[:4])
                break
    
    return ano, curso


def discover_pdfs() -> List[PDFInfo]:
    pdfs = []
    for pdf_path in config.PROVAS_DIR.glob("*.pdf"):
        if not pdf_path.is_file():
            continue
        
        try:
            doc = fitz.open(pdf_path)
            total_paginas = doc.page_count
            doc.close()
        except Exception as e:
            logger.error(f"Erro ao abrir PDF {pdf_path.name}: {e}")
            continue
        
        hash_arquivo = compute_hash(pdf_path)
        tamanho = pdf_path.stat().st_size
        ano, curso = extract_year_course(pdf_path.name)
        
        info = PDFInfo(
            arquivo=pdf_path.name,
            caminho=pdf_path,
            tamanho=tamanho,
            hash_arquivo=hash_arquivo,
            total_paginas=total_paginas,
            ano=ano,
            curso=curso
        )
        pdfs.append(info)
        logger.info(f"PDF encontrado: {pdf_path.name} | Páginas: {total_paginas} | Ano: {ano} | Curso: {curso} | Hash: {hash_arquivo[:16]}...")
    
    return pdfs


def classify_pdf_type(doc: fitz.Document) -> PDFType:
    total_pages = doc.page_count
    if total_pages == 0:
        return PDFType.SCANNED
    
    sample_pages = min(5, total_pages)
    total_text_chars = 0
    
    for i in range(sample_pages):
        page = doc[i]
        text = page.get_text()
        total_text_chars += len(text.strip())
    
    avg_chars_per_page = total_text_chars / sample_pages
    
    if avg_chars_per_page < 100:
        return PDFType.SCANNED
    elif avg_chars_per_page < 500:
        return PDFType.HYBRID
    else:
        return PDFType.DIGITAL


def create_exam_from_pdf(pdf_info: PDFInfo) -> Exam:
    doc = fitz.open(pdf_info.caminho)
    pdf_type = classify_pdf_type(doc)
    doc.close()
    
    exam = Exam(
        arquivo=pdf_info.arquivo,
        ano=pdf_info.ano,
        curso=pdf_info.curso,
        hash_arquivo=pdf_info.hash_arquivo,
        total_paginas=pdf_info.total_paginas,
        tipo_pdf=pdf_type
    )
    
    logger.info(f"Prova classificada: {pdf_info.arquivo} | Tipo: {pdf_type.value}")
    return exam