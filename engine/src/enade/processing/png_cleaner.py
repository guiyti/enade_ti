"""
png_cleaner.py
Módulo mantido para compatibilidade.
A limpeza e recorte de precisão agora ocorrem diretamente em png_generator.py através da segmentação geométrica.
"""

from ..core.models import Exam

def clean_all_question_pngs(exam: Exam) -> Exam:
    # A geração de PNGs já é realizada com precisão em png_generator
    return exam