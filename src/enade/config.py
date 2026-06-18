import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    BASE_DIR = Path(__file__).parent.parent.parent
    
    PROVAS_DIR = BASE_DIR / "provas"
    PAGINAS_DIR = BASE_DIR / "paginas"
    QUESTOES_DIR = BASE_DIR / "questoes"
    AUDITORIA_DIR = BASE_DIR / "auditoria"
    LOGS_DIR = BASE_DIR / "logs"
    CACHE_DIR = BASE_DIR / "cache"
    DOCS_DIR = BASE_DIR / "docs"
    
    PDF_DPI = int(os.getenv("PDF_DPI", "300"))
    TESSERACT_LANG = os.getenv("TESSERACT_LANG", "por+eng")
    
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    
    NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "")
    NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")
    NVIDIA_MODEL = os.getenv("NVIDIA_MODEL", "nvidia/nemotron-3-ultra-550b-a55b")
    
    WEB_HOST = os.getenv("WEB_HOST", "127.0.0.1")
    WEB_PORT = int(os.getenv("WEB_PORT", "8000"))
    
    DATABASE_PATH = BASE_DIR / os.getenv("DATABASE_PATH", "database/enade.db")
    
    @classmethod
    def validate(cls):
        missing = []
        if not cls.NVIDIA_API_KEY:
            missing.append("NVIDIA_API_KEY")
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        for dir_path in [cls.PROVAS_DIR, cls.PAGINAS_DIR, cls.QUESTOES_DIR, 
                         cls.AUDITORIA_DIR, cls.LOGS_DIR, cls.CACHE_DIR]:
            dir_path.mkdir(parents=True, exist_ok=True)
        
        return True
    
    @classmethod
    def mask_api_key(cls, api_key: str) -> str:
        if len(api_key) > 8:
            return f"{api_key[:4]}****{api_key[-4:]}"
        return "****"

config = Config()
config.validate()