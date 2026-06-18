from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
from pathlib import Path
import json


class DetectionMethod(str, Enum):
    PDF_STRUCTURE = "PDF_STRUCTURE"
    OCR = "OCR"
    MANUAL = "MANUAL"
    IA_ASSISTED = "IA_ASSISTED"


class QuestionStatus(str, Enum):
    PENDENTE = "PENDENTE"
    APROVADA = "APROVADA"
    REJEITADA = "REJEITADA"
    REVISAR = "REVISAR"


class Severity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


class PDFType(str, Enum):
    DIGITAL = "digital"
    SCANNED = "escaneado"
    HYBRID = "hibrido"


@dataclass
class Marker:
    numero: int
    pagina: int
    x: float
    y: float
    metodo: DetectionMethod
    confianca: float
    texto_original: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "numero": self.numero,
            "pagina": self.pagina,
            "x": self.x,
            "y": self.y,
            "metodo": self.metodo.value,
            "confianca": self.confianca,
            "texto_original": self.texto_original
        }


@dataclass
class PageData:
    numero: int
    caminho_imagem: str
    largura: int
    altura: int
    texto_estrutural: str = ""
    blocos: List[Dict[str, Any]] = field(default_factory=list)
    ocr_texto: str = ""
    ocr_confianca: float = 0.0
    ocr_dados: List[Dict[str, Any]] = field(default_factory=list)
    tipo_pdf: PDFType = PDFType.DIGITAL
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "numero": self.numero,
            "caminho_imagem": self.caminho_imagem,
            "largura": self.largura,
            "altura": self.altura,
            "texto_estrutural": self.texto_estrutural,
            "blocos": self.blocos,
            "ocr_texto": self.ocr_texto,
            "ocr_confianca": self.ocr_confianca,
            "ocr_dados": self.ocr_dados,
            "tipo_pdf": self.tipo_pdf.value
        }


@dataclass
class Question:
    numero: int
    paginas: List[int]
    caminho_png: str
    caminho_json: str
    largura: int
    altura: int
    confianca: float
    status: QuestionStatus = QuestionStatus.PENDENTE
    marcadores: List[Marker] = field(default_factory=list)
    anomalias: List[str] = field(default_factory=list)
    score: float = 0.0
    criado_em: str = field(default_factory=lambda: datetime.now().isoformat())
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "numero": self.numero,
            "paginas": self.paginas,
            "caminho_png": self.caminho_png,
            "caminho_json": self.caminho_json,
            "largura": self.largura,
            "altura": self.altura,
            "confianca": self.confianca,
            "status": self.status.value,
            "marcadores": [m.to_dict() for m in self.marcadores],
            "anomalias": self.anomalias,
            "score": self.score,
            "criado_em": self.criado_em
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Question":
        data = data.copy()
        data["status"] = QuestionStatus(data["status"])
        data["marcadores"] = [Marker(**m) for m in data.get("marcadores", [])]
        return cls(**data)


@dataclass
class Exam:
    arquivo: str
    ano: int
    curso: str
    hash_arquivo: str
    total_paginas: int
    questoes_detectadas: int = 0
    questoes_extraidas: int = 0
    score_geral: float = 0.0
    tipo_pdf: PDFType = PDFType.DIGITAL
    processado_em: str = field(default_factory=lambda: datetime.now().isoformat())
    paginas: List[PageData] = field(default_factory=list)
    questoes: List[Question] = field(default_factory=list)
    anomalias: List[Dict[str, Any]] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "arquivo": self.arquivo,
            "ano": self.ano,
            "curso": self.curso,
            "hash_arquivo": self.hash_arquivo,
            "total_paginas": self.total_paginas,
            "questoes_detectadas": self.questoes_detectadas,
            "questoes_extraidas": self.questoes_extraidas,
            "score_geral": self.score_geral,
            "tipo_pdf": self.tipo_pdf.value,
            "processado_em": self.processado_em,
            "paginas": [p.to_dict() for p in self.paginas],
            "questoes": [q.to_dict() for q in self.questoes],
            "anomalias": self.anomalias
        }
    
    def save_json(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, ensure_ascii=False, indent=2)
    
    @classmethod
    def load_json(cls, path: Path) -> "Exam":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        exam = cls(
            arquivo=data["arquivo"],
            ano=data["ano"],
            curso=data["curso"],
            hash_arquivo=data["hash_arquivo"],
            total_paginas=data["total_paginas"],
            questoes_detectadas=data.get("questoes_detectadas", 0),
            questoes_extraidas=data.get("questoes_extraidas", 0),
            score_geral=data.get("score_geral", 0.0),
            tipo_pdf=PDFType(data.get("tipo_pdf", "digital")),
            processado_em=data.get("processado_em", datetime.now().isoformat()),
        )
        exam.paginas = [PageData(**p) for p in data.get("paginas", [])]
        exam.questoes = [Question.from_dict(q) for q in data.get("questoes", [])]
        exam.anomalias = data.get("anomalias", [])
        return exam


@dataclass
class Event:
    timestamp: str
    prova: str
    etapa: str
    mensagem: str
    severidade: Severity
    detalhes: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "timestamp": self.timestamp,
            "prova": self.prova,
            "etapa": self.etapa,
            "mensagem": self.mensagem,
            "severidade": self.severidade.value,
            "detalhes": self.detalhes
        }