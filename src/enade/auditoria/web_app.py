from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from typing import List, Optional
import json

from ..core.models import Exam, QuestionStatus
from ..config import config

app = FastAPI(title="ENADE Auditor", description="Interface de auditoria para extração de questões ENADE")

templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

app.mount("/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")
app.mount("/questoes", StaticFiles(directory=str(config.QUESTOES_DIR)), name="questoes")
app.mount("/paginas", StaticFiles(directory=str(config.PAGINAS_DIR)), name="paginas")
app.mount("/auditoria", StaticFiles(directory=str(config.AUDITORIA_DIR)), name="auditoria")


def load_all_exams() -> List[Exam]:
    exams = []
    for meta_file in config.QUESTOES_DIR.glob("*/metadata.json"):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            exam = Exam(
                arquivo=data["arquivo"],
                ano=data["ano"],
                curso=data["curso"],
                hash_arquivo="",
                total_paginas=data["total_paginas"],
                questoes_detectadas=data["questoes_detectadas"],
                questoes_extraidas=data["questoes_extraidas"],
                score_geral=data["score_geral"],
                tipo_pdf=data.get("tipo_pdf", "digital")
            )
            exams.append(exam)
        except Exception as e:
            print(f"Erro ao carregar {meta_file}: {e}")
    
    exams.sort(key=lambda e: (e.ano, e.curso), reverse=True)
    return exams


def load_exam_details(ano: int, arquivo: str) -> Optional[Exam]:
    meta_path = config.QUESTOES_DIR / str(ano) / "metadata.json"
    if not meta_path.exists():
        return None
    
    with open(meta_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    if data["arquivo"] != arquivo:
        return None
    
    exam = Exam(
        arquivo=data["arquivo"],
        ano=data["ano"],
        curso=data["curso"],
        hash_arquivo="",
        total_paginas=data["total_paginas"],
        questoes_detectadas=data["questoes_detectadas"],
        questoes_extraidas=data["questoes_extraidas"],
        score_geral=data["score_geral"],
        tipo_pdf=data.get("tipo_pdf", "digital")
    )
    
    for q_data in data.get("questoes", []):
        from ..core.models import Question
        q = Question(
            numero=q_data["numero"],
            paginas=q_data["paginas"],
            caminho_png="",
            caminho_json="",
            largura=0,
            altura=0,
            confianca=q_data["confianca"],
            status=QuestionStatus(q_data["status"]),
            anomalias=q_data.get("anomalias", [])
        )
        exam.questoes.append(q)
    
    exam.questoes.sort(key=lambda q: q.numero)
    return exam


@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    exams = load_all_exams()
    
    stats = {
        "total_provas": len(exams),
        "total_questoes": sum(e.questoes_extraidas for e in exams),
        "score_medio": sum(e.score_geral for e in exams) / len(exams) if exams else 0,
        "provas_com_problemas": sum(1 for e in exams if e.score_geral < 90)
    }
    
    return templates.TemplateResponse("dashboard.html", {
        "request": request,
        "exams": exams,
        "stats": stats
    })


@app.get("/prova/{ano}/{arquivo}", response_class=HTMLResponse)
async def exam_detail(request: Request, ano: int, arquivo: str):
    exam = load_exam_details(ano, arquivo)
    if not exam:
        return HTMLResponse("Prova não encontrada", status_code=404)
    
    status_filter = request.query_params.get("status")
    confidence_filter = request.query_params.get("confidence")
    
    questions = exam.questoes
    if status_filter:
        questions = [q for q in questions if q.status.value == status_filter]
    if confidence_filter:
        threshold = float(confidence_filter)
        questions = [q for q in questions if q.confianca < threshold]
    
    status_counts = {}
    for q in exam.questoes:
        status_counts[q.status.value] = status_counts.get(q.status.value, 0) + 1
    
    return templates.TemplateResponse("exam_detail.html", {
        "request": request,
        "exam": exam,
        "questions": questions,
        "status_counts": status_counts,
        "status_filter": status_filter,
        "confidence_filter": confidence_filter
    })


@app.get("/questao/{ano}/{arquivo}/{numero}", response_class=HTMLResponse)
async def question_detail(request: Request, ano: int, arquivo: str, numero: int):
    exam = load_exam_details(ano, arquivo)
    if not exam:
        return HTMLResponse("Prova não encontrada", status_code=404)
    
    question = next((q for q in exam.questoes if q.numero == numero), None)
    if not question:
        return HTMLResponse("Questão não encontrada", status_code=404)
    
    png_url = f"/questoes/{ano}/q{numero:02d}.png"
    
    return templates.TemplateResponse("question_detail.html", {
        "request": request,
        "exam": exam,
        "question": question,
        "png_url": png_url
    })


@app.post("/questao/{ano}/{arquivo}/{numero}/status")
async def update_question_status(ano: int, arquivo: str, numero: int, status: str):
    exam = load_exam_details(ano, arquivo)
    if not exam:
        return {"error": "Prova não encontrada"}, 404
    
    question = next((q for q in exam.questoes if q.numero == numero), None)
    if not question:
        return {"error": "Questão não encontrada"}, 404
    
    try:
        question.status = QuestionStatus(status)
        
        meta_path = config.QUESTOES_DIR / str(ano) / "metadata.json"
        with open(meta_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        for q_data in data["questoes"]:
            if q_data["numero"] == numero:
                q_data["status"] = status
                break
        
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        return {"success": True, "status": status}
    except ValueError:
        return {"error": "Status inválido"}, 400


@app.get("/api/stats")
async def api_stats():
    exams = load_all_exams()
    return {
        "total_provas": len(exams),
        "total_questoes": sum(e.questoes_extraidas for e in exams),
        "score_medio": sum(e.score_geral for e in exams) / len(exams) if exams else 0,
        "por_ano": {
            str(ano): sum(e.questoes_extraidas for e in exams if e.ano == ano)
            for ano in set(e.ano for e in exams)
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.WEB_HOST, port=config.WEB_PORT)