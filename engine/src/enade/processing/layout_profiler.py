from dataclasses import dataclass, asdict
from typing import Dict, Any, List, Optional
from collections import defaultdict
import fitz
import re
import os

from ..utils.logging import get_logger
from .structural_extractor import decode_enade_str

logger = get_logger(__name__)

BARCODE_RE = re.compile(r'^\s*\*?[A-Z0-9]{6,}\*?\s*$')
YEAR_HDR_RE = re.compile(r'^\s*20\d{2}\s*$')
PND_RE = re.compile(r'PND\d{4}', re.IGNORECASE)
INDB_RE = re.compile(r'\.indb\s+\d+', re.IGNORECASE)
RE_MARKER = re.compile(
    r'^\s*(?:QUEST[ÃA]O|Quest[ãa]o|QuESt[ãa]O)\s+(?:DISC\s*URSIVA(?:\s+\d+)?|\d+\s*[\-–—]\s*DISC\s*URSIVA|\d+)\b',
    re.IGNORECASE
)
FOOTER_COURSE_RE = re.compile(
    r'(?:ENADE|COMPUTA[ÇC][ÃA]O|CI[ÊE]NCIA\s+DA\s+COMPUTA[ÇC][ÃA]O|TECNOLOGIA\s+EM|GEST[ÃA]O\s+DA\s+TECNOLOGIA|FORMA[ÇC][ÃA]O\s+GERAL(?:\s+DOCENTE)?)',
    re.IGNORECASE
)


@dataclass
class ExamLayoutProfile:
    id_prova: str
    page_width: float
    page_height: float
    header_cutoff_y: float
    footer_cutoff_y: float
    min_marker_y: float
    margin_x: float = 25.0
    detected_headers: int = 0
    detected_footers: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ExamLayoutProfile":
        return cls(**data)


def profile_exam_layout(doc: fitz.Document, exam_id: str = "") -> ExamLayoutProfile:
    """
    Analyzes content pages (skipping cover page 1 and the very last page)
    to discover the uniform header and footer geometry profile for this exam.
    
    Header elements (barcodes, year headers, banners) and footer elements
    (page numbers, course names, barcodes, typography .indb tags) are sampled
    across odd and even pages to compute exact vertical cutoffs.
    """
    total = len(doc)
    page_h = doc[0].rect.height
    page_w = doc[0].rect.width
    
    start_p = 1 if total > 2 else 0
    end_p = total - 1 if total > 2 else total
    content_page_count = max(1, end_p - start_p)
    
    top_header_max_ys: List[float] = []
    question_marker_min_ys: List[float] = []
    bottom_footer_min_ys: List[float] = []
    
    bottom_line_freq: Dict[tuple, int] = defaultdict(int)
    
    for p_idx in range(start_p, end_p):
        p_num = p_idx + 1
        page = doc[p_idx]
        h = page.rect.height
        w = page.rect.width
        dict_data = page.get_text("dict")
        
        for b in dict_data.get("blocks", []):
            if "lines" not in b:
                continue
            for l in b["lines"]:
                txt = decode_enade_str("".join(s["text"] for s in l["spans"])).strip()
                if not txt:
                    continue
                bbox = l["bbox"]
                y0, y1 = bbox[1], bbox[3]
                
                # Check Question Marker position
                if RE_MARKER.search(txt):
                    question_marker_min_ys.append(y0)
                    continue
                    
                # 1. Top Header check (within top 15% or top 120 pt)
                if y0 < min(120.0, h * 0.15):
                    is_hdr = False
                    if BARCODE_RE.search(txt) or YEAR_HDR_RE.search(txt):
                        is_hdr = True
                    elif "EXAME NACIONAL DE DESEMPENHO" in txt.upper() or "MINISTÉRIO DA EDUCAÇÃO" in txt.upper():
                        is_hdr = True
                    elif txt.strip().upper() in ["FORMAÇÃO GERAL", "COMPONENTE ESPECÍFICO", "DISCURSIVAS", "DISCURSIVA"]:
                        is_hdr = True
                    
                    if is_hdr:
                        top_header_max_ys.append(y1)
                        
                # 2. Bottom Footer check (within bottom 65 pt)
                if y1 > h - 65.0:
                    if BARCODE_RE.search(txt) or PND_RE.search(txt) or INDB_RE.search(txt):
                        bottom_footer_min_ys.append(y0)
                    elif txt in [str(p_num), str(p_num - 1), str(p_num - 2)]:
                        # Exact page number for this page
                        bottom_footer_min_ys.append(y0)
                    elif FOOTER_COURSE_RE.search(txt):
                        bottom_footer_min_ys.append(y0)
                    elif re.match(r'^\s*ENADE\s*[\-–—]\s*\d{4}', txt, re.IGNORECASE) or "Área: COMPUTAÇÃO" in txt:
                        bottom_footer_min_ys.append(y0)
                    elif y1 > h - 45.0:
                        # Frequency-based footer detection across pages (strip leading page number digits)
                        clean_txt = re.sub(r'^\d+\s*', '', txt)
                        bottom_line_freq[(round(y0 / 2.0) * 2, clean_txt[:25])] += 1
                        
    # Evaluate frequent footer lines
    min_freq = max(2, int(content_page_count * 0.15))
    for (rounded_y, sample_txt), freq in bottom_line_freq.items():
        if freq >= min_freq:
            bottom_footer_min_ys.append(float(rounded_y))
            
    min_marker_y = min(question_marker_min_ys) if question_marker_min_ys else 80.0
    
    # Calculate robust header cutoff
    if top_header_max_ys:
        valid_hdr_max = [y for y in top_header_max_ys if y <= min_marker_y + 1.0]
        max_hdr = max(valid_hdr_max) if valid_hdr_max else max(top_header_max_ys)
        header_cutoff = min(max_hdr + 4.0, min_marker_y - 2.0)
    else:
        header_cutoff = min(35.0, min_marker_y - 4.0)
    header_cutoff = max(25.0, header_cutoff)
    
    # Calculate robust footer cutoff
    if bottom_footer_min_ys:
        min_ftr = min(bottom_footer_min_ys)
        footer_cutoff = min_ftr - 3.0
    else:
        footer_cutoff = page_h - 35.0
        
    profile = ExamLayoutProfile(
        id_prova=exam_id,
        page_width=round(page_w, 1),
        page_height=round(page_h, 1),
        header_cutoff_y=round(header_cutoff, 1),
        footer_cutoff_y=round(footer_cutoff, 1),
        min_marker_y=round(min_marker_y, 1),
        margin_x=25.0,
        detected_headers=len(top_header_max_ys),
        detected_footers=len(bottom_footer_min_ys)
    )
    
    logger.info(
        f"Perfil de layout para '{exam_id}': Corte Topo = {profile.header_cutoff_y}pt | "
        f"Corte Base = {profile.footer_cutoff_y}pt (Margem Base: {page_h - profile.footer_cutoff_y:.1f}pt) | "
        f"Marcador mais alto = {profile.min_marker_y}pt"
    )
    return profile
