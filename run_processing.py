#!/usr/bin/env python3
"""
Script principal para processamento de provas ENADE.
Executa a extração completa de questões a partir dos PDFs.
"""

from src.enade.utils.logging import setup_logging
from src.enade.processing import main

if __name__ == "__main__":
    setup_logging()
    main()