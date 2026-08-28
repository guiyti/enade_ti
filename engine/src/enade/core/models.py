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


class QuestionType(str, Enum):
    OBJETIVA = "OBJETIVA"
    DISCURSIVA = "DISCURSIVA"


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
    x1: float = 0.0
    y1: float = 0.0
    coluna: int = 0
    tipo: QuestionType = QuestionType.OBJETIVA
    texto_original: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "numero": self.numero,
            "tipo": self.tipo.value if isinstance(self.tipo, QuestionType) else self.tipo,
            "pagina": self.pagina,
            "x": self.x,
            "y": self.y,
            "x1": self.x1,
            "y1": self.y1,
            "coluna": self.coluna,
            "metodo": self.metodo.value if isinstance(self.metodo, DetectionMethod) else self.metodo,
            "confianca": self.confianca,
            "texto_original": self.texto_original
        }


@dataclass
class Segment:
    pagina: int
    x0: float
    y0: float
    x1: float
    y1: float
    coluna: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "pagina": self.pagina,
            "x0": self.x0,
            "y0": self.y0,
            "x1": self.x1,
            "y1": self.y1,
            "coluna": self.coluna
        }


@dataclass
class PageData:
    numero: int
    caminho_imagem: str
    largura: int
    altura: int
    num_colunas: int = 1
    coluna_divisoria_x: float = 0.0
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
            "num_colunas": self.num_colunas,
            "coluna_divisoria_x": self.coluna_divisoria_x,
            "texto_estrutural": self.texto_estrutural,
            "blocos": self.blocos,
            "ocr_texto": self.ocr_texto,
            "ocr_confianca": self.ocr_confianca,
            "ocr_dados": self.ocr_dados,
            "tipo_pdf": self.tipo_pdf.value if isinstance(self.tipo_pdf, PDFType) else self.tipo_pdf
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
    id_questao: str = ""
    tipo: QuestionType = QuestionType.OBJETIVA
    segmentos: List[Segment] = field(default_factory=list)
    caminho_txt: str = ""
    texto_completo: str = ""
    texto_enunciado: str = ""
    alternativas: Dict[str, str] = field(default_factory=dict)
    figuras: List[str] = field(default_factory=list)
    categorias: List[str] = field(default_factory=list)
    status: QuestionStatus = QuestionStatus.PENDENTE
    marcadores: List[Marker] = field(default_factory=list)
    anomalias: List[str] = field(default_factory=list)
    score: float = 0.0
    criado_em: str = field(default_factory=lambda: datetime.now().isoformat())

    def __post_init__(self):
        if not self.id_questao:
            prefix = "qd" if self.tipo == QuestionType.DISCURSIVA else "q"
            self.id_questao = f"{prefix}{self.numero:02d}"
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id_questao": self.id_questao,
            "numero": self.numero,
            "tipo": self.tipo.value if isinstance(self.tipo, QuestionType) else self.tipo,
            "paginas": self.paginas,
            "segmentos": [s.to_dict() if isinstance(s, Segment) else s for s in self.segmentos],
            "caminho_png": self.caminho_png,
            "caminho_json": self.caminho_json,
            "caminho_txt": self.caminho_txt,
            "largura": self.largura,
            "altura": self.altura,
            "confianca": self.confianca,
            "texto_completo": self.texto_completo,
            "texto_enunciado": self.texto_enunciado,
            "alternativas": self.alternativas,
            "figuras": self.figuras,
            "categorias": self.categorias,
            "status": self.status.value if isinstance(self.status, QuestionStatus) else self.status,
            "marcadores": [m.to_dict() if isinstance(m, Marker) else m for m in self.marcadores],
            "anomalias": self.anomalias,
            "score": self.score,
            "criado_em": self.criado_em
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Question":
        data = data.copy()
        if "status" in data:
            data["status"] = QuestionStatus(data["status"])
        if "tipo" in data:
            data["tipo"] = QuestionType(data["tipo"])
        if "marcadores" in data:
            markers = []
            for m in data["marcadores"]:
                if isinstance(m, dict):
                    m_copy = m.copy()
                    if "tipo" in m_copy:
                        m_copy["tipo"] = QuestionType(m_copy["tipo"])
                    if "metodo" in m_copy:
                        m_copy["metodo"] = DetectionMethod(m_copy["metodo"])
                    markers.append(Marker(**m_copy))
                else:
                    markers.append(m)
            data["marcadores"] = markers
        if "segmentos" in data:
            data["segmentos"] = [Segment(**s) if isinstance(s, dict) else s for s in data["segmentos"]]
        return cls(**data)


@dataclass
class Exam:
    arquivo: str
    ano: int
    curso: str
    hash_arquivo: str
    total_paginas: int
    id_prova: str = ""
    questoes_detectadas: int = 0
    questoes_extraidas: int = 0
    score_geral: float = 0.0
    tipo_pdf: PDFType = PDFType.DIGITAL
    processado_em: str = field(default_factory=lambda: datetime.now().isoformat())
    paginas: List[PageData] = field(default_factory=list)
    questoes: List[Question] = field(default_factory=list)
    anomalias: List[Dict[str, Any]] = field(default_factory=list)
    layout_profile: Optional[Dict[str, Any]] = None

    def __post_init__(self):
        if not self.id_prova:
            base = self.arquivo.replace(".pdf", "").replace(".PDF", "")
            self.id_prova = base
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "id_prova": self.id_prova,
            "arquivo": self.arquivo,
            "ano": self.ano,
            "curso": self.curso,
            "hash_arquivo": self.hash_arquivo,
            "total_paginas": self.total_paginas,
            "questoes_detectadas": self.questoes_detectadas,
            "questoes_extraidas": self.questoes_extraidas,
            "score_geral": self.score_geral,
            "tipo_pdf": self.tipo_pdf.value if isinstance(self.tipo_pdf, PDFType) else self.tipo_pdf,
            "processado_em": self.processado_em,
            "layout_profile": self.layout_profile,
            "paginas": [p.to_dict() if isinstance(p, PageData) else p for p in self.paginas],
            "questoes": [q.to_dict() if isinstance(q, Question) else q for q in self.questoes],
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
            hash_arquivo=data.get("hash_arquivo", ""),
            total_paginas=data["total_paginas"],
            id_prova=data.get("id_prova", data["arquivo"].replace(".pdf", "").replace(".PDF", "")),
            questoes_detectadas=data.get("questoes_detectadas", 0),
            questoes_extraidas=data.get("questoes_extraidas", 0),
            score_geral=data.get("score_geral", 0.0),
            tipo_pdf=PDFType(data.get("tipo_pdf", "digital")),
            processado_em=data.get("processado_em", datetime.now().isoformat()),
            layout_profile=data.get("layout_profile", None),
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
            "severidade": self.severidade.value if isinstance(self.severidade, Severity) else self.severidade,
            "detalhes": self.detalhes
        }