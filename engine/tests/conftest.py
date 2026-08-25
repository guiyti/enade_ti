import pytest
from pathlib import Path

from src.enade.config import config

@pytest.fixture(autouse=True)
def setup_dirs(tmp_path):
    original_provas = config.PROVAS_DIR
    original_paginas = config.PAGINAS_DIR
    original_questoes = config.QUESTOES_DIR
    original_logs = config.LOGS_DIR

    config.PROVAS_DIR = tmp_path / "provas"
    config.PAGINAS_DIR = tmp_path / "paginas"
    config.QUESTOES_DIR = tmp_path / "questoes"
    config.LOGS_DIR = tmp_path / "logs"

    for d in [config.PROVAS_DIR, config.PAGINAS_DIR, config.QUESTOES_DIR, config.LOGS_DIR]:
        d.mkdir(parents=True, exist_ok=True)

    yield

    config.PROVAS_DIR = original_provas
    config.PAGINAS_DIR = original_paginas
    config.QUESTOES_DIR = original_questoes
    config.LOGS_DIR = original_logs