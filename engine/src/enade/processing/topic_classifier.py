import re
from typing import List, Dict, Tuple
from ..core.models import QuestionType
from .structural_extractor import decode_enade_str

TECHNICAL_TAXONOMY_RULES: Dict[str, List[Tuple[str, int]]] = {
    "Formação Geral e Sociedade": [
        (r"\b(ética|cidadania|direitos\s+humanos|meio\s+ambiente|sustentabilidade|relações\s+étnico-raciais|democracia|desigualdade\s+social|políticas\s+públicas|patrimônio\s+cultural|prática\s+pedagógica|transposição\s+didática|ensino-aprendizagem|libras|educação\s+inclusiva|currículo\s+escolar|bncc|avaliação\s+formativa|projeto\s+político-pedagógico|ppp)\b", 4),
    ],
    "Redes de Computadores": [
        (r"\bredes?\s+de\s+computadores\b", 4),
        (r"\bmodelo\s+osi\b", 4),
        (r"\barquitetura\s+tcp\/ip\b", 4),
        (r"\b(protocolos?\s+de\s+rede|switches?|roteadores?|wi[- ]?fi|ethernet|sub[- ]redes?|máscara\s+de\s+rede|comutação\s+de\s+pacotes|socket|dns|dhcp|napt|nat)\b", 3),
        (r"\b(camada\s+de\s+(?:transporte|enlace|rede|aplicação|física)|protocolos?\s+tcp|protocolos?\s+udp|endereçamento\s+ip|ipv4|ipv6|roteamento|comutador)\b", 3),
    ],
    "Segurança da Informação": [
        (r"\bsegurança\s+da\s+informação\b", 4),
        (r"\bpolítica\s+de\s+segurança\b", 4),
        (r"\b(criptografia|chaves?\s+(?:públicas?|privadas?|criptográficas?)|rsa|algoritmo\s+aes|algoritmo\s+des|firewall|ataques?\s+(?:ddos|dos|man[- ]in[- ]the[- ]middle|mitm|phishing|sql\s+injection|xss)|malwares?|ransomwares?|vulnerabilidade\s+de\s+segurança|ssl\/tls|assinatura\s+digital|certificado\s+digital|iso\/iec\s+27001|iso\/iec\s+27002|lgpd|proteção\s+de\s+dados\s+pessoais|vazamento\s+de\s+dados|sequestro\s+de\s+dados)\b", 3),
        (r"\b(confidencialidade|autenticidade|não[- ]repúdio|integridade\s+da\s+informação)\b", 3),
    ],
    "Governança e Gestão de TI": [
        (r"\b(itil|cobit|governança\s+de\s+ti|governança\s+corporativa|gestão\s+estratégica\s+de\s+ti|gerenciamento\s+de\s+serviços|acordos?\s+de\s+nível\s+de\s+serviço|sla|ans|iso\/iec\s+20000|iso\/iec\s+38500|iso\/iec\s+31000|pmbok|gestão\s+de\s+projetos|matriz\s+raci|plano\s+diretor\s+de\s+ti|pdti|auditoria\s+de\s+sistemas|continuidade\s+de\s+negócios|bpmn|bpm|sistemas\s+de\s+informações\s+gerenciais|sig|erp|crm|supply\s+chain|alinhamento\s+estratégico|bsc|roi)\b", 3),
    ],
    "Engenharia de Software": [
        (r"\bengenharia\s+de\s+software\b", 4),
        (r"\b(requisitos?\s+(?:funcionais|não[- ]funcionais|de\s+software)|engenharia\s+de\s+requisitos|casos?\s+de\s+uso|scrum|product\s+owner|scrum\s+master|sprints?|metodologias?\s+ágeis|manifesto\s+ágil|kanban|extreme\s+programming|xp|uml|diagramas?\s+de\s+(?:classes|sequência|atividades|casos?\s+de\s+uso|estados|componentes|implantação)|design\s+patterns?|padrões?\s+de\s+projetos?|testes?\s+de\s+software|testes?\s+(?:unitários?|de\s+integração|de\s+regressão|de\s+aceitação|caixa[- ]preta|caixa[- ]branca)|tdd|qualidade\s+de\s+software|modelo\s+(?:cascata|espiral|v|iterativo|incremental)|refatoração|devops|ci\/cd|integração\s+contínua|mps\.br|cmmi|arquitetura\s+de\s+software|microserviços)\b", 3),
    ],
    "Programação e POO": [
        (r"\bprogramação\s+orientada\s+a\s+objetos?\b", 4),
        (r"\b(poo|polimorfismo|encapsulamento|herança\s+(?:múltipla|de\s+classes|simples)|classes?\s+(?:abstratas?|derivadas?|base|estáticas?)|interfaces?\s+(?:em\s+java|orientadas?)|instanciação\s+de\s+objetos?|construtores?|sobrescrita\s+de\s+método|sobrecarga\s+de\s+método|ponteiros?\s+(?:em\s+c|void|nulo)|alocação\s+dinâmica\s+de\s+memória|coleta\s+de\s+lixo|garbage\s+collector|tratamento\s+de\s+exceções|try\s*[-–—]?\s*catch|tda|tipos?\s+abstratos?\s+de\s+dados)\b", 3),
    ],
    "Banco de Dados": [
        (r"\b(bancos?\s+de\s+dados|select\s+.*?\s+from|insert\s+into|update\s+.*?\s+set|delete\s+from|chaves?\s+primárias?|chaves?\s+estrangeiras?|foreign\s+key|primary\s+key|normalização|1fn|2fn|3fn|formas?\s+normais?|modelo\s+relacional|álgebra\s+relacional|tabelas?\s+relaciona(?:l|is)|diagrama\s+entidade[- ]relacionamento|entidades?[- ]relacionamentos?|propriedades\s+acid|transações?\s+(?:em\s+banco|acídicas?|concorrentes?)|índices?\s+(?:b[-+]?tree|hash|bitmap)|no[- ]?sql|mongodb|postgresql|mysql|consultas?\s+sql|sgbd|ddl|dml|cardinalidade|junção\s+(?:interna|externa|inner|left|right|join)|views?\s+materializadas?|sql)\b", 3),
    ],
    "Algoritmos e Estruturas de Dados": [
        (r"\bestruturas?\s+de\s+dados\b", 3),
        (r"\b(árvores?\s+(?:binárias?|avl|b\+?|rubro[- ]negras?|de\s+busca|trie)|pilhas?\s+(?:de\s+dados|push|pop)|filas?\s+(?:de\s+prioridade|fifo|circular|enqueue|dequeue)|listas?\s+(?:encadeadas?|duplamente|ligadas?)|grafos?\s+(?:direcionados?|ponderados?|bipartidos?|acíclicos?|arestas?|vértices?)|complexidade\s+(?:de\s+tempo|computacional|de\s+espaço|assintótica)|algoritmos?\s+de\s+ordenação|quicksort|mergesort|heapsort|bubblesort|notação\s+assintótica|busca\s+(?:binária|em\s+largura|em\s+profundidade|bfs|dfs)|tabelas?\s+hash|hashing|dijkstra|programação\s+dinâmica|divisão\s+e\s+conquista|backtracking|o\s*\(\s*(?:1|n|log\s*n|n\s*log\s*n|n\^2|2\^n|n!\s*)\s*\))\b", 3),
    ],
    "Sistemas Operacionais": [
        (r"\bsistemas?\s+operaciona(?:l|is)\b", 4),
        (r"\b(escalonamento\s+de\s+(?:processos?|cpu|disco)|política\s+de\s+escalonamento|deadlocks?|impasse\s+de\s+processos|memória\s+virtual|paginação\s+(?:de\s+memória|fifo|lru|lfu)|segmentação\s+de\s+memória|semáforos?\s+de\s+(?:dijkstra|sincronização)|seção\s+crítica|exclusão\s+mútua|context\s*switch|troca\s+de\s+contexto|sistemas?\s+de\s+arquivos|ext[234]|ntfs|i-?nodes?|page\s*fault|falhas?\s+de\s+página|kernel|chamadas?\s+de\s+sistema|syscall|computação\s+em\s+nuvem|virtualização)\b", 3),
    ],
    "Arquitetura e Organização de Computadores": [
        (r"\barquitetura\s+de\s+computadores\b", 4),
        (r"\borganização\s+de\s+computadores\b", 4),
        (r"\b(conjuntos?\s+de\s+instruções|risc|cisc|processadores?\s+(?:multi[- ]core|x86|arm|mips)|cpu|registradores?\s+da\s+cpu|memória\s+cache|cache\s+(?:l1|l2|l3|hit|miss)|pipeline\s+de\s+instruções|hazard\s+de|barramento\s+de\s+(?:dados|endereços?|controle)|interrupções?\s+(?:de\s+hardware|de\s+software)|unidade\s+lógica\s+e\s+aritmética|ula|alu|ciclo\s+de\s+busca\s+e\s+execução|arquitetura\s+de\s+von\s+neumann|memória\s+rom|memória\s+ram|hierarquia\s+de\s+memória|dma)\b", 3),
    ],
    "Inteligência Artificial e Dados": [
        (r"\b(inteligência\s+artificial|aprendizado\s+de\s+máquina|machine\s+learning|deep\s+learning|redes?\s+neurais?\s+(?:artificiais|convolucionais|recorrentes|mlp|cnn|rnn)|mineração\s+de\s+dados|data\s+mining|heurísticas?\s+(?:a\*|genéticas?)|algoritmos?\s+genéticos?|processamento\s+de\s+linguagem\s+natural|pln|nlp|visão\s+computacional|clustering|k[- ]means|árvores?\s+de\s+decisão|big\s+data|datasets?|overfitting|data\s+warehouse|olap|business\s+intelligence)\b", 3),
    ],
    "Teoria da Computação e Compiladores": [
        (r"\b(autômatos?\s+(?:finitos?|com\s+pilha|determinísticos?|não[- ]determinísticos?|afd|afnd)|linguagens?\s+(?:formais|regulares|livres\s+de\s+contexto|sensíveis\s+ao\s+contexto)|máquinas?\s+de\s+turing|hierarquia\s+de\s+chomsky|compiladores?|analisadores?\s+(?:léxicos?|sintáticos?|semânticos?)|tabelas?\s+de\s+símbolos|expressões?\s+regulares|decidibilidade|indecidibilidade|problema\s+da\s+parada|np[- ]completo|np[- ]difícil|gramáticas?\s+(?:livres\s+de\s+contexto|regulares)|glc|parse\s+tree|árvore\s+de\s+derivação)\b", 3),
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
        assigned.append("Formação Geral e Sociedade")
        for topic, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            if topic != "Formação Geral e Sociedade" and score >= 4:
                assigned.append(topic)
        return assigned
    
    # 3. Specific Component (Computação / TI)
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
            assigned.append("Engenharia de Software")
            
    return assigned
