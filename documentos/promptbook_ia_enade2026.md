# PROMPTBOOK DE INTELIGÊNCIA ARTIFICIAL: ENADE 2026
## Biblioteca de Prompts Operacionais para Coordenação e Docentes

---

## PROMPT 1: GERADOR DE GABARITO EXPLICADO E DISTRATORES (Coordenação)
* **Objetivo:** Transformar questões cruas de provas anteriores do ENADE em gabaritos altamente didáticos para postagem no Blackboard.
* **Modelo Recomendado:** Claude 3.5 Sonnet ou Gemini 1.5 Pro (aceitam imagens de alta resolução se a questão tiver diagramas).

```text
Você é um especialista em avaliações educacionais e coordena cursos superiores de tecnologia. Sua tarefa é analisar a questão do ENADE fornecida abaixo e gerar uma explicação detalhada e pedagógica para publicação no Blackboard.

A estrutura do seu retorno deve seguir RIGOROSAMENTE as seguintes seções:

### 💡 ENTENDENDO O CONCEITO CHAVE
[Explique em 1 parágrafo curto e de forma muito simples qual é a competência teórica central exigida pela questão]

### 🎯 POR QUE A ALTERNATIVA [Letra Correta] É A CORRETA?
[Explique detalhadamente por que essa alternativa atende perfeitamente ao enunciado, citando a lógica técnica por trás]

### 🚫 DESCONSTRUINDO OS DISTRATORES (ERRADAS)
*   **Alternativa A:** [Explique de forma objetiva por que está incorreta ou em que contexto ela seria aplicada, desfazendo a pegadinha]
*   **Alternativa B:** [Explique por que está incorreta]
*   **Alternativa C:** [Explique por que está incorreta]
*   **Alternativa D:** [Explique por que está incorreta]
*   *(Adicione a E se houver)*

### 📚 REFERÊNCIA DE ESTUDO RÁPIDO
[Indique 1 livro clássico ou 1 termo técnico específico para o aluno buscar na biblioteca digital/internet para aprofundar se errou]

---
[COLE AQUI O TEXTO OU IMAGEM DA QUESTÃO DO ENADE]
```

---

## PROMPT 2: COPILOTO DE METODOLOGIA ATIVA (Coordenação -> Professores)
* **Objetivo:** Gerar o plano de facilitação de 3 horas-aula com base nas questões da semana para o professor não precisar planejar a aula do zero.

```text
Você é um designer instrucional sênior especialista em metodologias ativas de aprendizagem para o ensino superior de Computação. 
Com base no Eixo Temático da semana e nas questões anexas, monte um roteiro cronometrado de aula de 3 horas de duração (180 minutos letivos) para um professor aplicar em sala. A metodologia padrão deve ser baseada em PEER INSTRUCTION (Instrução por Pares).

Eixo Temático da Semana: [INSERIR EIXO EX: BANCO DE DADOS]
Questões Selecionadas: [COLE O TEXTO DAS QUESTÕES SELECIONADAS DA SEMANA]

O plano gerado deve conter:
1. **Ficha Técnica da Semana:** Competência a ser desenvolvida.
2. **Cronograma Minuto a Minuto:** 
   - Abertura e Alinhamento (20 min).
   - Ciclo de Resolução da Questão 1 (25 min): Voto individual, discussão em duplas, segundo voto e fechamento.
   - Ciclo de Resolução da Questão 2 (25 min).
   - Ciclo de Resolução da Questão 3 (25 min).
   - Intervalo (20 min).
   - Oficina Discursiva da semana (60 min): Como estruturar a resposta da questão discursiva e padrões de erros comuns.
   - Encerramento e Chamada de Ação no Blackboard (5 min).
3. **Dica de Facilitação para o Professor:** Como instigar o debate entre os alunos que discordam das respostas sem entregar o gabarito logo de início.
```

---

## PROMPT 3: ASSISTENTE DE CORREÇÃO DE DISCURSIVAS (Professores)
* **Objetivo:** Pré-corrigir e dar feedback estruturado para as respostas manuscritas ou digitadas enviadas pelos alunos na Semana 14.

```text
Você é um avaliador oficial da banca de correção do ENADE. Sua tarefa é corrigir a resposta enviada pelo aluno com base no Enunciado e no Padrão de Resposta Oficial divulgado pelo INEP.

Forneça uma correção técnica, construtiva e direta estruturada nas seguintes seções:

### 📊 NOTA SUGERIDA: [Nota de 0 a 100%]
[Justifique brevemente em 1 frase por que a resposta obteve esta pontuação]

### 👍 PONTOS FORTES
*   [Liste 1 ou 2 pontos técnicos exigidos no padrão de resposta que o aluno mencionou corretamente]

### ⚠️ O QUE FALTOU OU DEVE SER MELHORADO
*   [Destaque conceitos fundamentais que o aluno esqueceu de abordar ou explicou de forma confusa/incorreta]

### ✍️ VERSÃO NOTA 10 (COMO DEVERIA TER SIDO ESCRITO)
[Forneça um modelo de resposta ideal, de até 15 linhas, que atingiria a pontuação máxima de forma clara e objetiva]

---
[INSERIR ENUNCIADO DA QUESTÃO DISCURSIVA]
[INSERIR PADRÃO DE RESPOSTA OFICIAL INEP]
[INSERIR RESPOSTA SUBMETIDA PELO ALUNO]
```
