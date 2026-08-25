import pytest
import json
from pathlib import Path
from fastapi.testclient import TestClient
from src.enade.auditoria.web_app import app
from src.enade.config import config

client = TestClient(app)

@pytest.fixture
def sample_exam_dir():
    exam_dir = config.QUESTOES_DIR / "2021_ADS"
    exam_dir.mkdir(parents=True, exist_ok=True)
    
    meta_data = {
        "id_prova": "2021_ADS",
        "arquivo": "2021_ADS.pdf",
        "ano": 2021,
        "curso": "ADS",
        "total_paginas": 10,
        "questoes_detectadas": 5,
        "questoes_extraidas": 5,
        "score_geral": 95.0,
        "tipo_pdf": "digital",
        "questoes": [
            {
                "id_questao": "q01",
                "numero": 1,
                "tipo": "OBJETIVA",
                "paginas": [2],
                "confianca": 0.98,
                "status": "PENDENTE",
                "largura": 500,
                "altura": 400
            }
        ]
    }
    
    with open(exam_dir / "metadata.json", "w", encoding="utf-8") as f:
        json.dump(meta_data, f)
        
    q_data = {
        "id_questao": "q01",
        "numero": 1,
        "tipo": "OBJETIVA",
        "texto_completo": "Enunciado da questão 1",
        "figuras": []
    }
    with open(exam_dir / "q01.json", "w", encoding="utf-8") as f:
        json.dump(q_data, f)
        
    return exam_dir

def test_dashboard_endpoint(sample_exam_dir):
    response = client.get("/")
    assert response.status_code == 200
    assert "ENADE Auditor" in response.text
    assert "2021_ADS" in response.text

def test_api_stats_endpoint(sample_exam_dir):
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_provas" in data
    assert data["total_provas"] == 1
    assert data["total_questoes"] == 5

def test_exam_detail_endpoint(sample_exam_dir):
    response = client.get("/prova/2021_ADS")
    assert response.status_code == 200
    assert "2021_ADS" in response.text
    assert "Discursivas" in response.text

def test_question_detail_endpoint(sample_exam_dir):
    response = client.get("/questao/2021_ADS/q01")
    assert response.status_code == 200
    assert "Q01" in response.text
    assert "Texto Extraído" in response.text

def test_update_status_endpoint(sample_exam_dir):
    response = client.post("/questao/2021_ADS/q01/status", json={"status": "APROVADA"})
    assert response.status_code == 200
    assert response.json()["status"] == "APROVADA"
    
    # Revert back to PENDENTE
    response2 = client.post("/questao/2021_ADS/q01/status", json={"status": "PENDENTE"})
    assert response2.status_code == 200
    assert response2.json()["status"] == "PENDENTE"
