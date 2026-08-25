import re
from typing import List, Dict, Any
from ..core.models import QuestionType

TAXONOMY_RULES: Dict[str, List[str]] = {
    "Banco de Dados": [
        r"\bsql\b", r"\bselect\b", r"\bfrom\b", r"\bwhere\b", r"\bjoin\b", r"\bbanco de dados\b",
        r"\bchaves? prim[aá]ria\b", r"\bchaves? estrangeira\b", r"\bnormaliza[çc][ãa]o\b",
        r"\b1fn\b", r"\b2fn\b", r"\b3fn\b", r"\btabela\b", r"\brelacional\b", r"\bder\b",
        r"\bacid\b", r"\btransa[çc][ãa]o\b", r"\bindex\b", r"\b[íi]ndices?\b", r"\bentidade\b",
        r"\batributo\b", r"\bmodelo relacional\b", r"\bdml\b", r"\bddl\b"
    ],
    "Algoritmos e Estruturas de Dados": [
        r"\balgoritmo", r"\bestrutura de dados\b", r"\b[aá]rvore\b", r"\bpilha\b", r"\bfila\b",
        r"\blista encadeada\b", r"\bgrafo\b", r"\bcomplexidade\b", r"\bordena[çc][ãa]o\b",
        r"\bquicksort\b", r"\bmergesort\b", r"\brecurs[ãa]o\b", r"\brecursiv", r"\bo\s*\(\s*n",
        r"\bvator\b", r"\bvetor\b", r"\bmatriz\b", r"\bbusca bin[aá]ria\b", r"\bhashing\b",
        r"\btabela hash\b", r"\bavl\b", r"\bcaminhamento\b", r"\bdijkstra\b"
    ],
    "Engenharia de Software": [
        r"\bengenharia de software\b", r"\brequisitos?\b", r"\bcasos? de uso\b", r"\bscrum\b",
        r"\b[aá]gil\b", r"\bagilidade\b", r"\buml\b", r"\bdiagrama de classes\b", r"\bdesign patterns?\b",
        r"\bpadr[õo]es? de projeto\b", r"\btestes? de software\b", r"\bqualidade de software\b",
        r"\bmanuten[çc][ãa]o\b", r"\brefatora[çc][ãa]o\b", r"\bdevops\b", r"\bci\/cd\b",
        r"\bcascata\b", r"\bprototipa", r"\btestes? unit[aá]rios?\b"
    ],
    "Programação e POO": [
        r"\bclasses?\b", r"\bheren[çc]a\b", r"\bpolimorfismo\b", r"\bencapsulamento\b",
        r"\binterface\b", r"\bobjeto\b", r"\bpoo\b", r"\borientad[oa] a objetos?\b",
        r"\bjava\b", r"\bpython\b", r"\bc\+\+\b", r"\bexce[çc][õo]es\b", r"\bthreads?\b",
        r"\bconstrutor\b", r"\bm[ée]todo\b", r"\bsobrecarga\b", r"\bsobrescrita\b"
    ],
    "Redes e Segurança": [
        r"\bredes? de computadores\b", r"\btcp\b", r"\budp\b", r"\bip\b", r"\bprotocolo\b",
        r"\bosi\b", r"\broteamento\b", r"\bcriptografia\b", r"\bseguran[çc]a da informa[çc][ãa]o\b",
        r"\bfirewall\b", r"\bataque\b", r"\bvulnerabilidade\b", r"\bdns\b", r"\bhttp\b",
        r"\brsa\b", r"\bautentica[çc][ãa]o\b", r"\bcamada de enlace\b", r"\bcamada de rede\b"
    ],
    "Sistemas Operacionais e Arquitetura": [
        r"\bsistemas? operacionais?\b", r"\bprocessos?\b", r"\bescalonamento\b", r"\bdeadlock\b",
        r"\bmem[óo]ria virtual\b", r"\bpagina[çc][ãa]o\b", r"\barquitetura de computadores\b",
        r"\bprocessador\b", r"\bcpu\b", r"\bregistrador\b", r"\bcache\b", r"\bpipeline\b",
        r"\bsemaforo\b", r"\bsem[aá]foro\b", r"\bthread\b", r"\barquivos?\b", r"\bbarramento\b"
    ],
    "Governança e Gestão de TI": [
        r"\bitil\b", r"\bcobit\b", r"\bgovernan[çc]a\b", r"\bgest[ãa]o de ti\b", r"\bgerenciamento de servi[çc]os\b",
        r"\bsla\b", r"\bans\b", r"\biso\b", r"\blgpd\b", r"\bpmbok\b", r"\bgest[ãa]o de projetos\b",
        r"\brisco\b", r"\bplanejamento estrat[ée]gico\b", r"\baudição\b", r"\bauditoria\b"
    ],
    "Teoria da Computação e Compiladores": [
        r"\baut[ôo]mato\b", r"\blinguagens? formais?\b", r"\bm[áa]quina de turing\b",
        r"\bcompilador\b", r"\bgram[áa]tica\b", r"\bsint[áa]tico\b", r"\bl[ée]xico\b",
        r"\bexpress[ãa]o regular\b", r"\bdecidibilidade\b", r"\bglc\b"
    ],
    "Inteligência Artificial e Dados": [
        r"\bintelig[êe]ncia artificial\b", r"\baprendizado de m[áa]quina\b", r"\bmachine learning\b",
        r"\bredes? neurais?\b", r"\bminera[çc][ãa]o de dados\b", r"\bheur[íi]stica\b",
        r"\bcluster\b", r"\bclassifica[çc][ãa]o\b", r"\bbig data\b", r"\bvis[ãa]o computacional\b"
    ],
    "Formação Geral e Sociedade": [
        r"\bforma[çc][ãa]o geral\b", r"\b[ée]tica\b", r"\bcidadania\b", r"\bdireitos humanos\b",
        r"\bmeio ambiente\b", r"\bsustentabilidade\b", r"\braciais\b", r"\bdemocracia\b",
        r"\bsocial\b", r"\bpol[íi]tica\b", r"\bcultura\b", r"\bdiscrimina[çc][ãa]o\b"
    ]
}


def classify_question_topics(texto: str, curso: str = "", numero: int = 1, tipo: QuestionType = QuestionType.OBJETIVA) -> List[str]:
    txt = (texto or "").lower()
    categories = []
    
    # Check regex taxonomy
    for topic, patterns in TAXONOMY_RULES.items():
        for pat in patterns:
            if re.search(pat, txt, re.IGNORECASE):
                categories.append(topic)
                break
                
    # Check if Formação Geral by structure (usually Q1-Q8 in modern ENADE or specific header)
    if "forma[çc][ãa]o geral" in txt or "formacao geral" in txt or (numero in [1, 2] and tipo == QuestionType.DISCURSIVA and "discursiva" in txt):
        if "Formação Geral e Sociedade" not in categories:
            categories.append("Formação Geral e Sociedade")
            
    # Default fallback if no specific keywords triggered
    if not categories:
        if "gti" in (curso or "").lower():
            categories.append("Governança e Gestão de TI")
        elif "ads" in (curso or "").lower():
            categories.append("Engenharia de Software")
        else:
            categories.append("Engenharia e Tecnologias")
            
    return categories
