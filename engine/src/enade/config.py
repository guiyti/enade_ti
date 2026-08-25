import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
    ENGINE_DIR = Path(__file__).resolve().parent.parent.parent

    # Diretórios de dados
    PROVAS_DIR = BASE_DIR / "provas"
    PAGINAS_DIR = BASE_DIR / "paginas"
    QUESTOES_DIR = BASE_DIR / "public" / "questoes"
    LOGS_DIR = BASE_DIR / "logs"
    DOCS_DIR = BASE_DIR / "docs"

    # Configurações de processamento
    PDF_DPI = int(os.getenv("PDF_DPI", "300"))
    TESSERACT_LANG = os.getenv("TESSERACT_LANG", "por+eng")

    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    @classmethod
    def validate(cls):
        for dir_path in [cls.PROVAS_DIR, cls.PAGINAS_DIR, cls.QUESTOES_DIR, cls.LOGS_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)
        return True

config = Config()
config.validate()