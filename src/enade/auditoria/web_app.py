from fastapi import FastAPI, Request, Query, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import json

from ..core.models import Exam, Question, QuestionStatus, QuestionType
from ..config import config

app = FastAPI(title="ENADE Auditor", description="Interface de auditoria para extração de questões ENADE")

templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

app.mount("/static", StaticFiles(directory=str(Path(__file__).parent / "static")), name="static")
app.mount("/questoes", StaticFiles(directory=str(config.QUESTOES_DIR)), name="questoes")
app.mount("/paginas", StaticFiles(directory=str(config.PAGINAS_DIR)), name="paginas")
app.mount("/auditoria", StaticFiles(directory=str(config.AUDITORIA_DIR)), name="auditoria")


class StatusUpdateRequest(BaseModel):
    status: str


def load_all_exams() -> List[Exam]:
    exams = []
    for meta_file in config.QUESTOES_DIR.glob("*/metadata.json"):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            id_p = data.get("id_prova", meta_file.parent.name)
            exam = Exam(
                id_prova=id_p,
                arquivo=data.get("arquivo", f"{id_p}.pdf"),
                ano=data.get("ano", 0),
                curso=data.get("curso", "GERAL"),
                hash_arquivo="",
                total_paginas=data.get("total_paginas", 0),
                questoes_detectadas=data.get("questoes_detectadas", 0),
                questoes_extraidas=data.get("questoes_extraidas", 0),
                score_geral=data.get("score_geral", 0.0),
                tipo_pdf=data.get("tipo_pdf", "digital")
            )
            exams.append(exam)
        except Exception as e:
            print(f"Erro ao carregar {meta_file}: {e}")
    
    exams.sort(key=lambda e: (e.ano, e.curso, e.id_prova), reverse=True)
    return exams


def load_exam_details(id_prova: str) -> Optional[Exam]:
    meta_path = config.QUESTOES_DIR / id_prova / "metadata.json"
    if not meta_path.exists():
        return None
    
    with open(meta_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    exam = Exam(
        id_prova=data.get("id_prova", id_prova),
        arquivo=data.get("arquivo", f"{id_prova}.pdf"),
        ano=data.get("ano", 0),
        curso=data.get("curso", "GERAL"),
        hash_arquivo="",
        total_paginas=data.get("total_paginas", 0),
        questoes_detectadas=data.get("questoes_detectadas", 0),
        questoes_extraidas=data.get("questoes_extraidas", 0),
        score_geral=data.get("score_geral", 0.0),
        tipo_pdf=data.get("tipo_pdf", "digital")
    )
    
    for q_data in data.get("questoes", []):
        # Load full question json if available for rich text
        q_id = q_data.get("id_questao", f"q{q_data['numero']:02d}")
        q_json_path = config.QUESTOES_DIR / id_prova / f"{q_id}.json"
        
        texto_completo = ""
        figuras = []
        if q_json_path.exists():
            try:
                with open(q_json_path, "r", encoding="utf-8") as f:
                    q_full = json.load(f)
                    texto_completo = q_full.get("texto_completo", "")
                    figuras = q_full.get("figuras", [])
            except Exception:
                pass
                
        q = Question(
            id_questao=q_id,
            numero=q_data["numero"],
            tipo=QuestionType(q_data.get("tipo", "OBJETIVA")),
            paginas=q_data.get("paginas", []),
            caminho_png=f"/questoes/{id_prova}/{q_id}.png",
            caminho_json=str(q_json_path),
            caminho_txt=f"/questoes/{id_prova}/{q_id}.txt",
            largura=q_data.get("largura", 0),
            altura=q_data.get("altura", 0),
            confianca=q_data.get("confianca", 1.0),
            status=QuestionStatus(q_data.get("status", "PENDENTE")),
            anomalias=q_data.get("anomalias", []),
            texto_completo=texto_completo,
            figuras=figuras
        )
        exam.questoes.append(q)
    
    exam.questoes.sort(key=lambda q: (0 if q.tipo == QuestionType.DISCURSIVA else 1, q.numero))
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
    
    return templates.TemplateResponse(
        request=request,
        name="dashboard.html",
        context={"exams": exams, "stats": stats}
    )


@app.get("/prova/{id_prova}", response_class=HTMLResponse)
async def exam_detail(request: Request, id_prova: str):
    exam = load_exam_details(id_prova)
    if not exam:
        return HTMLResponse("Prova não encontrada", status_code=404)
    
    status_filter = request.query_params.get("status")
    tipo_filter = request.query_params.get("tipo")
    confidence_filter = request.query_params.get("confidence")
    
    questions = exam.questoes
    if status_filter:
        questions = [q for q in questions if q.status.value == status_filter]
    if tipo_filter:
        questions = [q for q in questions if q.tipo.value == tipo_filter]
    if confidence_filter:
        threshold = float(confidence_filter)
        questions = [q for q in questions if q.confianca < threshold]
    
    status_counts = {}
    tipo_counts = {"DISCURSIVA": 0, "OBJETIVA": 0}
    for q in exam.questoes:
        status_counts[q.status.value] = status_counts.get(q.status.value, 0) + 1
        tipo_counts[q.tipo.value] = tipo_counts.get(q.tipo.value, 0) + 1
    
    return templates.TemplateResponse(
        request=request,
        name="exam_detail.html",
        context={
            "exam": exam,
            "questions": questions,
            "status_counts": status_counts,
            "tipo_counts": tipo_counts,
            "status_filter": status_filter,
            "tipo_filter": tipo_filter,
            "confidence_filter": confidence_filter
        }
    )


@app.get("/questao/{id_prova}/{id_questao}", response_class=HTMLResponse)
async def question_detail(request: Request, id_prova: str, id_questao: str):
    exam = load_exam_details(id_prova)
    if not exam:
        return HTMLResponse("Prova não encontrada", status_code=404)
    
    question = next((q for q in exam.questoes if q.id_questao == id_questao), None)
    if not question:
        return HTMLResponse("Questão não encontrada", status_code=404)
    
    png_url = f"/questoes/{id_prova}/{id_questao}.png"
    
    return templates.TemplateResponse(
        request=request,
        name="question_detail.html",
        context={
            "exam": exam,
            "question": question,
            "png_url": png_url
        }
    )


@app.post("/questao/{id_prova}/{id_questao}/status")
async def update_question_status(id_prova: str, id_questao: str, payload: StatusUpdateRequest):
    exam = load_exam_details(id_prova)
    if not exam:
        raise HTTPException(status_code=404, detail="Prova não encontrada")
    
    question = next((q for q in exam.questoes if q.id_questao == id_questao), None)
    if not question:
        raise HTTPException(status_code=404, detail="Questão não encontrada")
    
    try:
        new_status = QuestionStatus(payload.status)
        question.status = new_status
        
        # Update metadata.json
        meta_path = config.QUESTOES_DIR / id_prova / "metadata.json"
        if meta_path.exists():
            with open(meta_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            
            for q_data in data.get("questoes", []):
                if q_data.get("id_questao") == id_questao or f"q{q_data['numero']:02d}" == id_questao:
                    q_data["status"] = new_status.value
                    break
            
            with open(meta_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Update question JSON if exists
        q_json_path = config.QUESTOES_DIR / id_prova / f"{id_questao}.json"
        if q_json_path.exists():
            with open(q_json_path, "r", encoding="utf-8") as f:
                q_data = json.load(f)
            q_data["status"] = new_status.value
            with open(q_json_path, "w", encoding="utf-8") as f:
                json.dump(q_data, f, ensure_ascii=False, indent=2)
                
        return {"success": True, "status": new_status.value}
    except ValueError:
        raise HTTPException(status_code=400, detail="Status inválido")


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