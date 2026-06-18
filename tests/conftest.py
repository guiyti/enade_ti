import pytest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.enade.config import config

@pytest.fixture(autouse=True)
def setup_dirs(tmp_path):
    original_provas = config.PROVAS_DIR
    original_paginas = config.PAGINAS_DIR
    original_questoes = config.QUESTOES_DIR
    original_auditoria = config.AUDITORIA_DIR
    original_logs = config.LOGS_DIR
    original_cache = config.CACHE_DIR
    
    config.PROVAS_DIR = tmp_path / "provas"
    config.PAGINAS_DIR = tmp_path / "paginas"
    config.QUESTOES_DIR = tmp_path / "questoes"
    config.AUDITORIA_DIR = tmp_path / "auditoria"
    config.LOGS_DIR = tmp_path / "logs"
    config.CACHE_DIR = tmp_path / "cache"
    
    for d in [config.PROVAS_DIR, config.PAGINAS_DIR, config.QUESTOES_DIR, 
              config.AUDITORIA_DIR, config.LOGS_DIR, config.CACHE_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    
    yield
    
    config.PROVAS_DIR = original_provas
    config.PAGINAS_DIR = original_paginas
    config.QUESTOES_DIR = original_questoes
    config.AUDITORIA_DIR = original_auditoria
    config.LOGS_DIR = original_logs
    config.CACHE_DIR = original_cache