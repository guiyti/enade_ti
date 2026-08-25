import re
from typing import List, Dict, Tuple
from ..core.models import QuestionType

TECHNICAL_TAXONOMY_RULES: Dict[str, List[Tuple[str, int]]] = {
    "Banco de Dados": [
        (r"\bselect\s+.*?\s+from\b", 4),
        (r"\binsert\s+into\b", 4),
        (r"\bupdate\s+.*?\s+set\b", 4),
        (r"\bdelete\s+from\b", 4),
        (r"\bchaves?\s+prim[aá]rias?\b", 3),
        (r"\bchaves?\s+estrangeiras?\b", 3),
        (r"\bforeign\s+key\b", 3),
        (r"\bprimary\s+key\b", 3),
        (r"\bnormaliza[çc][ãa]o\b", 3),
        (r"\b1fn\b", 3),
        (r"\b2fn\b", 3),
        (r"\b3fn\b", 3),
        (r"\bformas?\s+normais?\b", 3),
        (r"\bmodelo\s+relacional\b", 3),
        (r"\b[aá]lgebra\s+relacional\b", 3),
        (r"\btabelas?\s+relaciona(?:l|is)\b", 3),
        (r"\bdiagrama\s+entidade[- ]relacionamento\b", 4),
        (r"\bentidades?[- ]relacionamentos?\b", 3),
        (r"\bpropriedades\s+acid\b", 4),
        (r"\btransa[çc][õo]es?\s+(?:em\s+banco|ac[ií]dicas?|concorrentes?)\b", 3),
        (r"\b[íi]ndices?\s+(?:b[-+]?tree|hash|bitmap)\b", 3),
        (r"\bno[- ]?sql\b", 3),
        (r"\bmongodb\b", 3),
        (r"\bpostgresql\b", 3),
        (r"\bmysql\b", 3),
        (r"\bconsultas?\s+sql\b", 3),
        (r"\bsgbd\b", 3),
        (r"\bddl\b", 3),
        (r"\bdml\b", 3),
        (r"\bcardinalidade\b", 2),
        (r"\bjun[çc][ãa]o\s+(?:interna|externa|inner|left|right|join)\b", 3),
        (r"\bviews?\s+materializadas?\b", 3),
        (r"\bbancos?\s+de\s+dados\b", 2),
        (r"\bsql\b", 2),
    ],
    "Algoritmos e Estruturas de Dados": [
        (r"\bestruturas?\s+de\s+dados\b", 3),
        (r"\b[aá]rvores?\s+(?:bin[aá]rias?|avl|b\+?|rubro[- ]negras?|de\s+busca|trie)\b", 4),
        (r"\bpilhas?\s+(?:de\s+dados|de\s+execu[çc][ãa]o|push|pop)\b", 3),
        (r"\bfilas?\s+(?:de\s+prioridade|fifo|circular|enqueue|dequeue)\b", 3),
        (r"\blistas?\s+(?:encadeadas?|duplamente|ligadas?)\b", 3),
        (r"\bgrafos?\s+(?:direcionados?|ponderados?|bipartidos?|ac[íi]clicos?|arestas?|v[ée]rtices?)\b", 3),
        (r"\bcomplexidade\s+(?:de\s+tempo|computacional|de\s+espa[çc]o|assint[óo]tica)\b", 3),
        (r"\balgoritmos?\s+de\s+ordena[çc][ãa]o\b", 3),
        (r"\bquicksort\b", 4),
        (r"\bmergesort\b", 4),
        (r"\bheapsort\b", 4),
        (r"\bbubblesort\b", 4),
        (r"\brecurs[ãa]o\b", 2),
        (r"\brecursiv[oa]s?\b", 2),
        (r"\bo\s*\(\s*(?:1|n|log\s*n|n\s*log\s*n|n\^2|2\^n|n!\s*)\s*\)", 3),
        (r"\bnotac[ãa]o\s+assint[óo]tica\b", 3),
        (r"\bbusca\s+(?:bin[aá]ria|em\s+largura|em\s+profundidade|bfs|dfs)\b", 3),
        (r"\btabelas?\s+hash\b", 3),
        (r"\bhashing\b", 3),
        (r"\bdijkstra\b", 4),
        (r"\bprogramac[ãa]o\s+din[aá]mica\b", 3),
        (r"\bdivis[ãa]o\s+e\s+conquista\b", 3),
        (r"\bbacktracking\b", 3),
        (r"\balgoritmos?\b", 1),
    ],
    "Engenharia de Software": [
        (r"\bengenharia\s+de\s+software\b", 4),
        (r"\brequisitos?\s+(?:funcionais|n[ãa]o[- ]funcionais|de\s+software|de\s+usu[aá]rio)\b", 3),
        (r"\bcasos?\s+de\s+uso\b", 3),
        (r"\bscrum\b", 4),
        (r"\bproduct\s+owner\b", 4),
        (r"\bscrum\s+master\b", 4),
        (r"\bmetodologias?\s+[aá]ge(?:l|is)\b", 3),
        (r"\bmanifesto\s+[aá]gil\b", 4),
        (r"\bkanban\b", 3),
        (r"\bextreme\s+programming\b", 4),
        (r"\buml\b", 3),
        (r"\bdiagramas?\s+de\s+(?:classes|sequ[êe]ncia|atividades|casos?\s+de\s+uso|estados|componentes|implanta[çc][ãa]o)\b", 4),
        (r"\bdesign\s+patterns?\b", 4),
        (r"\bpadr[õo]es?\s+de\s+projetos?\b", 3),
        (r"\btestes?\s+de\s+software\b", 3),
        (r"\btestes?\s+(?:unit[aá]rios?|de\s+integra[çc][ãa]o|de\s+regress[ãa]o|de\s+aceita[çc][ãa]o|caixa[- ]preta|caixa[- ]branca)\b", 3),
        (r"\btdd\b", 4),
        (r"\bqualidade\s+de\s+software\b", 3),
        (r"\bmodelo\s+(?:cascata|espiral|v|iterativo|incremental)\b", 3),
        (r"\brefatora[çc][ãa]o\b", 3),
        (r"\bdevops\b", 4),
        (r"\bci\/cd\b", 4),
        (r"\bintegra[çc][ãa]o\s+cont[íi]nua\b", 3),
        (r"\bmps\.br\b", 4),
        (r"\bcmmi\b", 4),
        (r"\barquitetura\s+de\s+software\b", 3),
        (r"\bmicroservi[çc]os?\b", 3),
    ],
    "Programação e POO": [
        (r"\bprogramac[ãa]o\s+orientada\s+a\s+objetos?\b", 4),
        (r"\bpoo\b", 3),
        (r"\bpolimorfismo\b", 4),
        (r"\bencapsulamento\b", 4),
        (r"\bheran[çc]a\s+(?:m[úu]ltipla|de\s+classes|simples)\b", 4),
        (r"\bclasses?\s+(?:abstratas?|derivadas?|base|est[aá]ticas?)\b", 3),
        (r"\binterfaces?\s+(?:em\s+java|orientadas?|de\s+programa[çc][ãa]o)\b", 3),
        (r"\binstancia[çc][ãa]o\s+de\s+objetos?\b", 3),
        (r"\bconstrutores?\b", 2),
        (r"\bsobrescrita\s+de\s+m[ée]todo\b", 4),
        (r"\bsobrecarga\s+de\s+m[ée]todo\b", 4),
        (r"\bpalavra[- ]chave\s+(?:this|super|self|static|final|abstract)\b", 3),
        (r"\blinguagens?\s+(?:c|c\+\+|java|python|c#|rust|javascript|typescript)\b", 2),
        (r"\bponteiros?\s+(?:em\s+c|void|nulo)\b", 3),
        (r"\baloca[çc][ãa]o\s+din[aá]mica\s+de\s+mem[óo]ria\b", 3),
        (r"\bcoleta\s+de\s+lixo\b", 3),
        (r"\bgarbage\s+collector\b", 4),
        (r"\btratamento\s+de\s+exce[çc][õo]es\b", 3),
        (r"\btry\s*[-–—]?\s*catch\b", 3),
    ],
    "Redes e Segurança": [
        (r"\bredes?\s+de\s+computadores\b", 4),
        (r"\bmodelo\s+osi\b", 4),
        (r"\barquitetura\s+tcp\/ip\b", 4),
        (r"\btcp\b", 2),
        (r"\budp\b", 2),
        (r"\bendera[çc]amento\s+ip\b", 3),
        (r"\bipv4\b", 3),
        (r"\bipv6\b", 3),
        (r"\broteamento\b", 2),
        (r"\bprotocolos?\s+de\s+rede\b", 3),
        (r"\bcamada\s+de\s+(?:transporte|enlace|rede|aplica[çc][ãa]o|f[íi]sica)\b", 3),
        (r"\bcriptografia\s+(?:sim[ée]trica|assim[ée]trica|rsa|aes|des)\b", 4),
        (r"\bchaves?\s+(?:p[úu]blicas?|privadas?|criptogr[aá]ficas?)\b", 3),
        (r"\bseguran[çc]a\s+da\s+informa[çc][ãa]o\b", 3),
        (r"\bfirewall\b", 3),
        (r"\bataques?\s+(?:ddos|dos|man[- ]in[- ]the[- ]middle|mitm|phishing|sql\s+injection|xss)\b", 4),
        (r"\bmalwares?\b", 3),
        (r"\bransomwares?\b", 4),
        (r"\bvulnerabilidade\s+de\s+seguran[çc]a\b", 3),
        (r"\bssl\/tls\b", 3),
        (r"\bhttps\b", 2),
        (r"\bdns\b", 2),
        (r"\bdhcp\b", 3),
        (r"\brsa\b", 3),
        (r"\basssinatura\s+digital\b", 3),
        (r"\bcertificado\s+digital\b", 3),
        (r"\bsub[- ]redes?\b", 3),
        (r"\bm[aá]scara\s+de\s+rede\b", 3),
        (r"\bcomuta[çc][ãa]o\s+de\s+pacotes\b", 3),
    ],
    "Sistemas Operacionais e Arquitetura": [
        (r"\bsistemas?\s+operaciona(?:l|is)\b", 4),
        (r"\bescalonamento\s+de\s+(?:processos?|cpu|disco)\b", 4),
        (r"\bpol[íi]tica\s+de\s+escalonamento\b", 4),
        (r"\bdeadlocks?\b", 4),
        (r"\bimpasse\s+de\s+processos\b", 3),
        (r"\bmem[óo]ria\s+virtual\b", 4),
        (r"\bpagina[çc][ãa]o\s+(?:de\s+mem[óo]ria|fifo|lru|lfu)\b", 4),
        (r"\bsegmenta[çc][ãa]o\s+de\s+mem[óo]ria\b", 4),
        (r"\barquitetura\s+de\s+computadores\b", 4),
        (r"\bconjuntos?\s+de\s+instru[çc][õo]es\b", 3),
        (r"\brisc\b", 3),
        (r"\bcisc\b", 3),
        (r"\bprocessadores?\s+(?:multi[- ]core|x86|arm|mips)\b", 3),
        (r"\bcpu\b", 2),
        (r"\bregistradores?\s+da\s+cpu\b", 3),
        (r"\bmem[óo]ria\s+cache\b", 3),
        (r"\bcache\s+(?:l1|l2|l3|hit|miss)\b", 4),
        (r"\bpipeline\s+de\s+instru[çc][õo]es\b", 4),
        (r"\bsem[aá]foros?\s+de\s+(?:dijkstra|sincroniza[çc][ãa]o)\b", 4),
        (r"\bse[çc][ãa]o\s+cr[íi]tica\b", 4),
        (r"\bexclus[ãa]o\s+m[úu]tua\b", 4),
        (r"\bcontext\s*switch\b", 4),
        (r"\btroca\s+de\s+contexto\b", 4),
        (r"\bsistemas?\s+de\s+arquivos\b", 3),
        (r"\bext[234]\b", 3),
        (r"\bntfs\b", 3),
        (r"\bi-?nodes?\b", 4),
        (r"\bbarramento\s+de\s+(?:dados|endere[çc]os?|controle)\b", 3),
        (r"\binterrup[çc][õo]es?\s+(?:de\s+hardware|de\s+software)\b", 3),
        (r"\bpage\s*fault\b", 4),
        (r"\bfalhas?\s+de\s+p[aá]gina\b", 4),
        (r"\bkernel\b", 3),
        (r"\bchamadas?\s+de\s+sistema\b", 3),
        (r"\bsyscall\b", 4),
    ],
    "Governança e Gestão de TI": [
        (r"\bitil\b", 4),
        (r"\bcobit\b", 4),
        (r"\bgovernan[çc]a\s+de\s+ti\b", 4),
        (r"\bgovernan[çc]a\s+corporativa\b", 3),
        (r"\bgest[ãa]o\s+estrat[ée]gica\s+de\s+ti\b", 4),
        (r"\bgerenciamento\s+de\s+servi[çc]os\s+de\s+ti\b", 4),
        (r"\bacordos?\s+de\s+n[íi]vel\s+de\s+servi[çc]o\b", 4),
        (r"\bsla\b", 3),
        (r"\bans\b", 2),
        (r"\biso\/iec\s+20000\b", 4),
        (r"\biso\/iec\s+27001\b", 4),
        (r"\biso\/iec\s+38500\b", 4),
        (r"\biso\/iec\s+31000\b", 4),
        (r"\blgpd\b", 4),
        (r"\blei\s+geral\s+de\s+prote[çc][ãa]o\s+de\s+dados\b", 4),
        (r"\bpmbok\b", 4),
        (r"\bgest[ãa]o\s+de\s+projetos?\s+de\s+ti\b", 3),
        (r"\ban[aá]lise\s+swot\b", 3),
        (r"\bmatriz\s+raci\b", 4),
        (r"\bgest[ãa]o\s+de\s+riscos?\s+de\s+ti\b", 3),
        (r"\bplano\s+diretor\s+de\s+ti\b", 4),
        (r"\bpdti\b", 4),
        (r"\bauditoria\s+de\s+sistemas\b", 3),
        (r"\bcontinuidade\s+de\s+neg[óo]cios\b", 3),
    ],
    "Teoria da Computação e Compiladores": [
        (r"\baut[ôo]matos?\s+(?:finitos?|com\s+pilha|determin[íi]sticos?|n[ãa]o[- ]determin[íi]sticos?|afd|afnd)\b", 4),
        (r"\blinguagens?\s+(?:formais|regulares|livres\s+de\s+contexto|sens[íi]veis\s+ao\s+contexto)\b", 4),
        (r"\bm[áa]quinas?\s+de\s+turing\b", 4),
        (r"\bhierarquia\s+de\s+chomsky\b", 4),
        (r"\bcompiladores?\b", 3),
        (r"\banalisadores?\s+(?:l[ée]xicos?|sint[áa]ticos?|sem[âa]nticos?)\b", 4),
        (r"\btabelas?\s+de\s+s[íi]mbolos\b", 3),
        (r"\bexpress[õo]es?\s+regulares?\b", 2),
        (r"\bdecidibilidade\b", 4),
        (r"\bindecidibilidade\b", 4),
        (r"\bproblema\s+da\s+parada\b", 4),
        (r"\bnp[- ]completo\b", 4),
        (r"\bgram[áa]ticas?\s+(?:livres\s+de\s+contexto|regulares)\b", 4),
        (r"\bglc\b", 3),
    ],
    "Inteligência Artificial e Dados": [
        (r"\bintelig[êe]ncia\s+artificial\b", 4),
        (r"\baprendizado\s+de\s+m[áa]quina\b", 4),
        (r"\bmachine\s+learning\b", 4),
        (r"\bdeep\s+learning\b", 4),
        (r"\bredes?\s+neurais?\s+(?:artificiais|convolucionais|recorrentes|mlp|cnn|rnn)\b", 4),
        (r"\bminera[çc][ãa]o\s+de\s+dados\b", 4),
        (r"\bdata\s+mining\b", 4),
        (r"\bheur[íi]sticas?\s+(?:a\*|gen[ée]ticas?)\b", 3),
        (r"\balgoritmos?\s+gen[ée]ticos?\b", 4),
        (r"\bprocessamento\s+de\s+linguagem\s+natural\b", 4),
        (r"\bpln\b", 3),
        (r"\bnlp\b", 3),
        (r"\bvis[ãa]o\s+computacional\b", 4),
        (r"\bclustering\b", 3),
        (r"\bk[- ]means\b", 4),
        (r"\b[aá]rvores?\s+de\s+decis[ãa]o\b", 3),
        (r"\bbig\s+data\b", 3),
        (r"\bdatasets?\b", 2),
        (r"\boverfitting\b", 3),
    ],
    "Formação Geral e Sociedade": [
        (r"\bforma[çc][ãa]o\s+geral\b", 4),
        (r"\bforma[çc][ãa]o\s+geral\s+docente\b", 4),
        (r"\b[ée]tica\b", 3),
        (r"\bcidadania\b", 3),
        (r"\bdireitos\s+humanos\b", 4),
        (r"\bmeio\s+ambiente\b", 3),
        (r"\bsustentabilidade\b", 3),
        (r"\brela[çc][õo]es\s+[ée]tnico[- ]raciais\b", 4),
        (r"\bdemocracia\b", 3),
        (r"\bdesigualdade\s+social\b", 3),
        (r"\bpol[íi]ticas?\s+p[úu]blicas?\b", 3),
        (r"\bpatrim[ôo]nio\s+cultural\b", 3),
        (r"\bpr[aá]tica\s+pedag[óo]gica\b", 4),
        (r"\btransposi[çc][ãa]o\s+did[aá]tica\b", 4),
        (r"\bensino[- ]aprendizagem\b", 3),
        (r"\blibras\b", 4),
        (r"\beduca[çc][ãa]o\s+inclusiva\b", 4),
        (r"\bcurr[íi]culo\s+escolar\b", 4),
        (r"\bbncc\b", 4),
        (r"\bavalia[çc][ãa]o\s+formativa\b", 4),
        (r"\bprojeto\s+pol[íi]tico[- ]pedag[óo]gico\b", 4),
        (r"\bppp\b", 3),
    ]
}


def is_formacao_geral(numero: int, tipo: QuestionType, curso: str = "", ano: int = 0) -> bool:
    """
    Identifies whether a question belongs to the General Education / Formação Geral Docente component.
    - 2024 CCP (Licenciatura em Computação): Questions 1-27 (Discursive 1-2 and Objective 1-27).
    - Standard ENADE exams (2005-2023): Discursive 1-2 and Objective 1-8.
    """
    if "2024" in str(ano) or "2024" in str(curso):
        if tipo == QuestionType.DISCURSIVA and numero in [1, 2]:
            return True
        if tipo == QuestionType.OBJETIVA and numero <= 27:
            return True
        return False
        
    if tipo == QuestionType.DISCURSIVA and numero in [1, 2]:
        return True
    if tipo == QuestionType.OBJETIVA and numero <= 8:
        return True
        
    return False


def classify_question_topics(
    texto: str, 
    curso: str = "", 
    numero: int = 1, 
    tipo: QuestionType = QuestionType.OBJETIVA,
    ano: int = 0
) -> List[str]:
    txt = (texto or "").lower()
    
    # 1. Calculate technical match scores
    scores: Dict[str, int] = {}
    for topic, rule_list in TECHNICAL_TAXONOMY_RULES.items():
        score = 0
        for pattern, weight in rule_list:
            if re.search(pattern, txt, re.IGNORECASE):
                score += weight
        if score > 0:
            scores[topic] = score

    # 2. Check if structurally within Formação Geral
    is_fg = is_formacao_geral(numero, tipo, curso, ano)
    
    assigned: List[str] = []
    
    if is_fg:
        # Formação Geral section: primary tag is Formação Geral
        assigned.append("Formação Geral e Sociedade")
        # Only attach an IT topic if there is overwhelming evidence (e.g. score >= 4)
        for topic, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            if topic != "Formação Geral e Sociedade" and score >= 4:
                assigned.append(topic)
        return assigned
    
    # 3. Specific Component (Computação / TI)
    # Exclude Formação Geral unless specifically triggered by strong keywords
    for topic, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
        if topic == "Formação Geral e Sociedade" and score < 4:
            continue
        if score >= 3:
            assigned.append(topic)
            
    # If no topic reached score >= 3, take the top scored if score >= 2
    if not assigned and scores:
        top_topic, top_score = max(scores.items(), key=lambda x: x[1])
        if top_score >= 2 and top_topic != "Formação Geral e Sociedade":
            assigned.append(top_topic)
            
    # 4. Fallback based on Course natural specialty if still unassigned
    if not assigned:
        c_lower = (curso or "").lower()
        if "gti" in c_lower:
            assigned.append("Governança e Gestão de TI")
        elif "ads" in c_lower:
            assigned.append("Engenharia de Software")
        elif "ccp" in c_lower:
            assigned.append("Algoritmos e Estruturas de Dados")
        else:
            assigned.append("Engenharia e Tecnologias")
            
    return assigned
