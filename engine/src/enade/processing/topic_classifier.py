import re
from typing import List, Dict, Tuple
from ..core.models import QuestionType
from .structural_extractor import decode_enade_str

TECHNICAL_TAXONOMY_RULES: Dict[str, List[Tuple[str, int]]] = {
    "Formação Geral e Sociedade": [
        (r"\b(ética|cidadania|direitos\s+humanos|meio\s+ambiente|sustentabilidade|relaç[õo]es\s+[ée]tnico[- ]raciais|democracia|desigualdade\s+social|pol[íi]ticas\s+p[úu]blicas|patrim[ôo]nio\s+cultural|pr[áa]tica\s+pedag[óo]gica|transposi[çc][ãa]o\s+did[áa]tica|ensino[- ]aprendizagem|libras|educa[çc][ãa]o\s+inclusiva|curr[íi]culo\s+escolar|bncc|avalia[çc][ãa]o\s+formativa|projeto\s+pol[íi]tico[- ]pedag[óo]gico|ppp|quilombola|ind[íi]gena|racismo|preconceito|g[êe]nero|acessibilidade|educa[çc][ãa]o\s+b[áa]sica|escola|professor|professora|did[áa]tic[ao]|pedag[óo]gic[ao]|ensino\s+de\s+computa[çc][ãa]o|pensamento\s+computacional|estudantes?|sala\s+de\s+aula|sequ[êe]ncia\s+did[áa]tica|recurso\s+did[áa]tico|interven[çc][ãa]o\s+did[áa]tica|dei|inclus[ãa]o|plano\s+de\s+aula|educa[çc][ãa]o\s+a\s+dist[âa]ncia|ambiente\s+virtual\s+de\s+aprendizagem)\b", 5),
    ],
    "Banco de Dados": [
        (r"\b(bancos?\s+de\s+dados|banco\s+relacional|select\s+.*?\s+from|insert\s+into|update\s+\w+\s+set|delete\s+from|create\s+table|alter\s+table|primary\s+key|foreign\s+key|chaves?\s+(?:prim[áa]rias?|estrangeiras?|candidatas?)|normaliza[çc][ãa]o|1fn|2fn|3fn|4fn|bcnf|formas?\s+normais?|modelo\s+relacional|[áa]lgebra\s+relacional|c[áa]lculo\s+relacional|tabelas?\s+relaciona(?:l|is)|diagramas?\s+entidade[- ]relacionamento|entidades?[- ]relacionamentos?|propriedades\s+acid|transa[çc][õo]es?\s+(?:em\s+banco|ac[íi]dicas?|concorrentes?|distribu[íi]das?)|[íi]ndices?\s+(?:b[-+]?tree|hash|bitmap)|no[- ]?sql|mongodb|postgresql|mysql|oracle|sqlite|consultas?\s+sql|sgbd|ddl|dml|dcl|cardinalidade|jun[çc][ãa][oe]s?\s+(?:interna|externa|inner|left|right|join)|views?\s+materializadas?|esquema\s+(?:de\s+banco|relacional|de\s+rela[çc][ãa]o)|tuplas?|atributos?\s+at[ôo]micos?|depend[êe]ncias?\s+funciona(?:l|is)|integridade\s+referencial|\bsql\b)\b", 5),
    ],
    "Redes de Computadores": [
        (r"\b(redes?\s+de\s+computadores|modelo\s+osi|arquitetura\s+tcp\/ip|protocolos?\s+de\s+(?:rede|transporte|enlace|comunica[çc][ãa]o|roteamento)|switches?|roteadores?|wi[- ]?fi|ethernet|sub[- ]redes?|m[áa]scara\s+de\s+rede|comuta[çc][ãa]o\s+de\s+(?:pacotes|circuitos)|sockets?|dns|dhcp|napt|nat|camada\s+de\s+(?:transporte|enlace|rede|aplica[çc][ãa]o|f[íi]sica)|protocolos?\s+tcp|protocolos?\s+udp|endere[çc]amento\s+ip|endere[çc]os?\s+ip|ipv4|ipv6|roteamento|comutador|enlaces?\s+de\s+dados|topologia\s+de\s+rede|wlan|bluetooth|largura\s+de\s+banda|banda\s+base|fibras?\s+[óo]pticas?|modems?|quadros?\s+ethernet|pacotes?\s+ip|handshake|syn|ack|http|https|ftp|smtp|pop3|imap|interconectividade|csma\/cd|csma\/ca)\b", 5),
    ],
    "Segurança da Informação": [
        (r"\b(seguran[çc]a\s+da\s+informa[çc][ãa]o|pol[íi]tica\s+de\s+seguran[çc]a|criptografia|chaves?\s+(?:p[úu]blicas?|privadas?|criptogr[áa]ficas?|sim[ée]tricas?|assim[ée]tricas?)|rsa|algoritmo\s+aes|algoritmo\s+des|firewall|ataques?\s+(?:ddos|dos|man[- ]in[- ]the[- ]middle|mitm|phishing|sql\s+injection|xss|engenharia\s+social)|malwares?|ransomwares?|trojans?|v[íi]rus\s+de\s+computador|vulnerabilidade\s+de\s+seguran[çc]a|ssl\/tls|assinatura\s+digital|certificado\s+digital|iso\/iec\s+27001|iso\/iec\s+27002|lgpd|prote[çc][ãa]o\s+de\s+dados\s+pessoais|vazamento\s+de\s+dados|sequestro\s+de\s+dados|confidencialidade|autenticidade|n[ãa]o[- ]rep[úu]dio|integridade\s+da\s+informa[çc][ãa]o|autentica[çc][ãa]o\s+(?:biom[ée]trica|multifator|em\s+duas\s+etapas)|controle\s+de\s+acesso)\b", 5),
    ],
    "Governança e Gestão de TI": [
        (r"\b(itil|cobit|governan[çc]a\s+de\s+ti|governan[çc]a\s+corporativa|gest[ãa]o\s+estrat[ée]gica\s+de\s+ti|gerenciamento\s+de\s+servi[çc]os|acordos?\s+de\s+n[íi]vel\s+de\s+servi[çc]o|sla|ans|iso\/iec\s+20000|iso\/iec\s+38500|iso\/iec\s+31000|pmbok|gest[ãa]o\s+de\s+projetos|gerenciamento\s+de\s+projetos|termo\s+de\s+abertura|tap|matriz\s+raci|plano\s+diretor\s+de\s+ti|pdti|auditoria\s+de\s+sistemas|auditoria\s+de\s+ti|continuidade\s+de\s+neg[óo]cios|pcn|disaster\s+recovery|drp|bpmn|bpm|sistemas?\s+de\s+informa[çc][ãa][oe]s?(?:\s+gerenciais)?|n[íi]veis?\s+organizaciona(?:l|is)|sistemas?\s+transaciona(?:l|is)|sistemas?\s+de\s+apoio\s+[àa]\s+decis[ãa]o|sig|erp|crm|supply\s+chain|scm|alinhamento\s+estrat[ée]gico|bsc|balanced\s+scorecard|roi|retorno\s+sobre\s+investimento|maturidade\s+de\s+ti|compliance|controles\s+internos)\b", 5),
    ],
    "Engenharia de Software": [
        (r"\b(engenharia\s+de\s+software|engenharia\s+de\s+requisitos|requisitos?\s+(?:funcionais|n[ãa]o[- ]funcionais|de\s+software)|elicita[çc][ãa]o\s+de\s+requisitos|casos?\s+de\s+uso|hist[óo]rias?\s+de\s+usu[áa]rio|user\s+stories|scrum|product\s+owner|scrum\s+master|sprints?|backlog|metodologias?\s+[áa]geis|desenvolvimento\s+[áa]gil|manifesto\s+[áa]gil|kanban|extreme\s+programming|xp|uml|diagramas?\s+de\s+(?:classes|sequ[êe]ncia|atividades|casos?\s+de\s+uso|estados|componentes|implanta[çc][ãa]o|intera[çc][ãa]o)|design\s+patterns?|padr[õo]es?\s+de\s+projetos?|padr[ãa]o\s+(?:factory|singleton|observer|strategy|decorator|adapter|mvc|mvvm)|testes?\s+de\s+software|testes?\s+(?:unit[áa]rios?|de\s+unidade|de\s+integra[çc][ãa]o|de\s+regress[ãa]o|de\s+aceita[çc][ãa]o|caixa[- ]preta|caixa[- ]branca)|tdd|qualidade\s+de\s+software|garantia\s+da\s+qualidade|modelo\s+(?:cascata|espiral|v|iterativo|incremental)|rup|rational\s+unified\s+process|refatora[çc][ãa]o|devops|ci\/cd|integra[çc][ãa]o\s+cont[íi]nua|entrega\s+cont[íi]nua|ger[êe]ncia\s+de\s+configura[çc][ãa]o|controle\s+de\s+vers[õo]es|git|mps\.br|cmmi|arquitetura\s+de\s+software|microservi[çc]os|microsservi[çc]os|ihc|intera[çc][ãa]o\s+humano[- ]computador|usabilidade|heur[íi]sticas?\s+de\s+nielsen|acessibilidade\s+web)\b", 5),
    ],
    "Programação e POO": [
        (r"\b(programa[çc][ãa]o\s+orientada\s+a\s+objetos?|poo|polimorfismo|encapsulamento|heran[çc]a\s+(?:m[úu]ltipla|de\s+classes|simples)|classes?\s+(?:abstratas?|derivadas?|base|est[áa]ticas?)|interfaces?\s+(?:em\s+java|orientadas?)|instancia[çc][ãa]o\s+de\s+objetos?|construtores?|sobrescrita\s+de\s+m[ée]todo|sobrecarga\s+de\s+m[ée]todo|ponteiros?\s+(?:em\s+c|void|nulo)|aloca[çc][ãa]o\s+din[âa]mica\s+de\s+mem[óo]ria|coleta\s+de\s+lixo|garbage\s+collector|tratamento\s+de\s+exce[çc][õo]es|try\s*[-–—]?\s*catch|tda|tipos?\s+abstratos?\s+de\s+dados|paradigmas?\s+de\s+programa[çc][ãa]o|programa[çc][ãa]o\s+(?:funcional|l[óo]gica|imperativa|estruturada)|prolog|lisp|haskell)\b", 5),
    ],
    "Sistemas Operacionais": [
        (r"\b(sistemas?\s+operaciona(?:l|is)|escalonamento\s+de\s+(?:processos?|cpu|disco)|pol[íi]tica\s+de\s+escalonamento|round[- ]robin|deadlocks?|impasse\s+de\s+processos|condi[çc][õo]es\s+de\s+coffman|mem[óo]ria\s+virtual|pagina[çc][ãa]o\s+(?:de\s+mem[óo]ria|fifo|lru|lfu|simples)|segmenta[çc][ãa]o\s+de\s+mem[óo]ria|tabelas?\s+de\s+p[áa]ginas?|page\s*fault|falhas?\s+de\s+p[áa]gina|substitui[çc][ãa]o\s+de\s+p[áa]ginas|sem[áa]foros?\s+de\s+(?:dijkstra|sincroniza[çc][ãa]o)|se[çc][ãa]o\s+cr[íi]tica|exclus[ãa]o\s+m[úu]tua|mutex|threads?|processos?\s+e\s+threads?|context\s*switch|troca\s+de\s+contexto|sistemas?\s+de\s+arquivos|ext[234]|ntfs|i-?nodes?|kernel|chamadas?\s+de\s+sistema|syscalls?|multiprograma[çc][ãa]o|sistemas\s+de\s+tempo\s+real|buffer\s+limitado|produtor[- ]consumidor|computa[çc][ãa]o\s+em\s+nuvem|virtualiza[çc][ãa]o|m[áa]quinas?\s+virtuais?|hypervisor)\b", 5),
    ],
    "Arquitetura e Organização de Computadores": [
        (r"\b(arquitetura\s+de\s+computadores|organiza[çc][ãa]o\s+de\s+computadores|conjuntos?\s+de\s+instru[çc][õo]es|risc|cisc|processadores?\s+(?:multi[- ]core|multicores?|x86|arm|mips)|cpu|registradores?\s+da\s+cpu|mem[óo]ria\s+cache|cache\s+(?:l1|l2|l3|hit|miss)|pipeline\s+de\s+instru[çc][õo]es|pipeline|hazard\s+de|barramentos?\s+de\s+(?:dados|endere[çc]os?|controle)|interrup[çc][õo]es?\s+(?:de\s+hardware|de\s+software)|unidade\s+l[óo]gica\s+e\s+aritm[ée]tica|ula|alu|ciclo\s+de\s+busca\s+e\s+execu[çc][ãa]o|arquitetura\s+de\s+von\s+neumann|mem[óo]ria\s+rom|mem[óo]ria\s+ram|hierarquia\s+de\s+mem[óo]ria|dma|circuitos?\s+(?:combinat[óo]rios?|sequenciais?|l[óo]gicos?)|portas?\s+l[óo]gicas?|[áa]lgebra\s+booleana|mapa\s+de\s+karnaugh|flip[- ]flops?|somador|decodificador|multiplexador|amplificadores?\s+operacionais|pld|fpga|microcontroladores?)\b", 5),
    ],
    "Inteligência Artificial e Dados": [
        (r"\b(intelig[êe]ncia\s+artificial|aprendizado\s+de\s+m[áa]quina|machine\s+learning|deep\s+learning|redes?\s+neurais?\s+(?:artificiais|convolucionais|recorrentes|mlp|cnn|rnn)|perceptrons?|backpropagation|minera[çc][ãa]o\s+de\s+dados|data\s+mining|heur[íi]sticas?|buscas?\s+heur[íi]sticas?|buscas?\s+com\s+informa[çc][ãa]o|algoritmos?\s+gen[ée]ticos?|processamento\s+de\s+linguagem\s+natural|pln|nlp|vis[ãa]o\s+computacional|processamento\s+de\s+imagens|segmenta[çc][ãa]o\s+de\s+imagens|clustering|k[- ]means|[áa]rvores?\s+de\s+decis[ãa]o|big\s+data|datasets?|overfitting|data\s+warehouse|olap|business\s+intelligence|agentes?\s+inteligentes?|sistemas\s+especialistas|l[óo]gica\s+fuzzy|l[óo]gica\s+nebulosa|8[- ]puzzle)\b", 5),
    ],
    "Teoria da Computação e Compiladores": [
        (r"\b(aut[ôo]matos?(?:\s+(?:fi\s*nitos?|finitos?|com\s+pilha|determin[íi]sticos?|n[ãa]o[- ]determin[íi]sticos?))?|m[áa]quinas?\s+de\s+estados?\s+finitos?|linguagens?\s+(?:formais?|regulares?|livres?\s+de\s+contexto|sens[íi]veis?\s+ao\s+contexto)|m[áa]quinas?\s+de\s+turing|hierarquia\s+de\s+chomsky|compiladores?|interpretadores?|analisadores?\s+(?:l[ée]xicos?|sint[áa]ticos?|sem[âa]nticos?)|tabelas?\s+de\s+s[íi]mbolos|express[õo]es?\s+regulares?|decidibilidade|indecidibilidade|problema\s+da\s+parada|np[- ]completo|np[- ]dif[íi]cil|classes?\s+p\s+e\s+np|gram[áa]ticas?\s+(?:livres?\s+de\s+contexto|regulares?)|glc|parse\s+tree|[áa]rvores?\s+de\s+deriva[çc][ãa]o|an[áa]lise\s+sint[áa]tica\s+descendente|analisador\s+preditivo)\b", 5),
    ],
    "Algoritmos e Estruturas de Dados": [
        (r"\b(estruturas?\s+de\s+dados|[áa]rvores?\s+(?:bin[áa]rias?|avl|b\+?|rubro[- ]negras?|de\s+busca|trie)|pilhas?\s+(?:de\s+dados|push|pop)|filas?\s+(?:de\s+prioridade|fifo|circular|enqueue|dequeue)|listas?\s+(?:encadeadas?|duplamente|ligadas?)|grafos?\s+(?:direcionados?|ponderados?|bipartidos?|ac[íi]clicos?|arestas?|v[ée]rtices?)|complexidade\s+(?:de\s+tempo|computacional|de\s+espa[çc]o|assint[óo]tica)|nota[çc][ãa]o\s+(?:big[- ]o|assint[óo]tica|o\s*\()|algoritmos?\s+de\s+ordena[çc][ãa]o|quicksort|mergesort|heapsort|bubblesort|insertion\s*sort|ordena[çc][ãa]o\s+por\s+inser[çc][ãa]o|busca\s+(?:bin[áa]ria|em\s+largura|em\s+profundidade|bfs|dfs)|tabelas?\s+hash|hashing|dijkstra|kruskal|prim|caminho\s+m[íi]nimo|[áa]rvore\s+geradora\s+m[íi]nima|programa[çc][ãa]o\s+din[âa]mica|divis[ãa]o\s+e\s+conquista|backtracking|recursividade|algoritmos?\s+recursivos?|vetores?\s+e\s+matrizes|algoritmos?\s+gulosos?)\b", 5),
    ],
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
    txt = decode_enade_str(texto or "").lower()
    
    # 1. Check if structurally within Formação Geral
    if is_formacao_geral(numero, tipo, curso, ano):
        return ["Formação Geral e Sociedade"]
        
    # 2. Calculate match scores for all domains
    scores: Dict[str, int] = {}
    for topic, rule_list in TECHNICAL_TAXONOMY_RULES.items():
        score = 0
        for pattern, weight in rule_list:
            matches = len(re.findall(pattern, txt, re.IGNORECASE))
            score += matches * weight
        if score > 0:
            scores[topic] = score

    # 3. Fallback if no rules matched
    if not scores:
        c_lower = (curso or "").lower()
        if "gti" in c_lower:
            return ["Governança e Gestão de TI"]
        elif "ads" in c_lower:
            return ["Engenharia de Software"]
        return ["Algoritmos e Estruturas de Dados"]
        
    # 4. Strict Domain Assignment: Best matching domain wins
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_topic, _ = sorted_scores[0]
    
    return [best_topic]

