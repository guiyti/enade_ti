#!/usr/bin/env python3
"""
Script para iniciar a interface web de auditoria.
"""

import uvicorn
from src.enade.config import config
from src.enade.utils.logging import setup_logging

if __name__ == "__main__":
    setup_logging("enade_web")
    uvicorn.run(
        "src.enade.auditoria.web_app:app",
        host=config.WEB_HOST,
        port=config.WEB_PORT,
        reload=False
    )