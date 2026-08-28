import pytest
import fitz
from pathlib import Path

from src.enade.processing.layout_profiler import profile_exam_layout, ExamLayoutProfile


def test_profile_exam_layout_synthetic():
    doc = fitz.open()
    
    # Page 1: Cover
    p1 = doc.new_page(width=600, height=800)
    p1.insert_text((50, 50), "ENADE 2024 - INSTRUCOES")
    
    # Page 2: Question with header and footer (Even page)
    p2 = doc.new_page(width=600, height=800)
    p2.insert_text((30, 40), "*R040420252*")
    p2.insert_text((400, 40), "2024")
    p2.insert_text((50, 90), "QUESTAO 01")
    p2.insert_text((50, 150), "Texto do enunciado da questao 1.")
    p2.insert_text((30, 760), "2 COMPUTACAO")
    
    # Page 3: Question with header and footer (Odd page)
    p3 = doc.new_page(width=600, height=800)
    p3.insert_text((400, 40), "*R040420253*")
    p3.insert_text((50, 40), "2024")
    p3.insert_text((50, 90), "QUESTAO 02")
    p3.insert_text((50, 150), "Texto do enunciado da questao 2.")
    p3.insert_text((400, 760), "3 COMPUTACAO")
    
    # Page 4: Last page
    p4 = doc.new_page(width=600, height=800)
    p4.insert_text((50, 50), "QUESTIONARIO FINAL")
    
    profile = profile_exam_layout(doc, "2024_CCP")
    doc.close()
    
    assert isinstance(profile, ExamLayoutProfile)
    assert profile.id_prova == "2024_CCP"
    assert profile.page_width == 600.0
    assert profile.page_height == 800.0
    # Header was at y=40, marker at y=90 -> cutoff should be between 40 and 90
    assert 40.0 < profile.header_cutoff_y <= 88.0
    # Footer was at y=760 -> cutoff should be <= 760.0
    assert profile.footer_cutoff_y <= 760.0
    assert profile.detected_headers >= 2
    assert profile.detected_footers >= 2


def test_profile_exam_layout_to_and_from_dict():
    profile = ExamLayoutProfile(
        id_prova="2021_CCP",
        page_width=566.9,
        page_height=779.5,
        header_cutoff_y=74.5,
        footer_cutoff_y=744.6,
        min_marker_y=76.5,
        margin_x=25.0,
        detected_headers=48,
        detected_footers=47
    )
    
    d = profile.to_dict()
    assert d["id_prova"] == "2021_CCP"
    assert d["header_cutoff_y"] == 74.5
    assert d["footer_cutoff_y"] == 744.6
    
    rebuilt = ExamLayoutProfile.from_dict(d)
    assert rebuilt.id_prova == profile.id_prova
    assert rebuilt.header_cutoff_y == profile.header_cutoff_y
    assert rebuilt.footer_cutoff_y == profile.footer_cutoff_y
