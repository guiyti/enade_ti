Estratégia de Implementação, Operação, Auditoria e Evolução do Sistema

Introdução

Os documentos anteriores definiram o objetivo do projeto, a arquitetura geral e as regras de processamento.

Este documento possui um propósito diferente.

Seu objetivo é orientar a implementação real do sistema.

Ele descreve como o sistema deverá se comportar na prática, quais informações deverão ser exibidas ao usuário, como a auditoria deverá funcionar, quais métricas deverão ser produzidas e como o projeto deverá evoluir ao longo do tempo.

Enquanto os documentos anteriores focam no “o que fazer”, este documento foca no “como operar”.

O objetivo é que um desenvolvedor ou agente de IA consiga construir uma solução utilizável desde a primeira versão.

⸻

Filosofia de Implementação

A primeira versão do sistema não precisa resolver todos os problemas do mundo.

Ela precisa resolver corretamente os problemas mais frequentes.

O erro mais comum em projetos desse tipo é tentar criar uma solução extremamente sofisticada logo no início.

Isso normalmente gera:

* excesso de complexidade
* baixa manutenibilidade
* dificuldade de depuração
* dependência excessiva de IA

A primeira versão deve priorizar:

* robustez
* transparência
* auditabilidade
* facilidade de correção

Se o sistema conseguir extrair corretamente 95% das questões e identificar claramente os 5% problemáticos, ele já será extremamente útil.

⸻

Fluxo Operacional Esperado

A operação do sistema deve ser extremamente simples.

O usuário deverá apenas:

1. Colocar PDFs na pasta de entrada.
2. Executar o comando principal.
3. Acompanhar o progresso.
4. Abrir a interface de auditoria.
5. Revisar eventuais problemas.

Fluxo esperado:

Usuário
 ↓
Copia PDFs
 ↓
Executa sistema
 ↓
Processamento automático
 ↓
Relatório
 ↓
Auditoria
 ↓
Base final de questões

Nenhuma configuração complexa deve ser exigida.

⸻

Experiência do Usuário no Terminal

Durante o processamento o sistema deverá exibir informações claras.

Exemplo:

PDF encontrado:
enade_ads_2022.pdf
Páginas:
38
Tipo:
PDF digital
Questões detectadas:
35
Status:
Processando...

O usuário deve conseguir compreender facilmente o que está acontecendo.

Evitar logs excessivamente técnicos.

Quando um erro ocorrer, a mensagem deve indicar:

* o problema
* o impacto
* a possível causa

Exemplo:

AVISO
Questão 17 não localizada.
Possível falha de OCR.
Marcada para auditoria manual.

Muito melhor que:

IndexError line 514

⸻

Estrutura Esperada dos Resultados

Após o processamento, a estrutura deverá ser semelhante a:

/enade
/provas
/questoes
    /2022
        q01.png
        q02.png
        q03.png
    /2023
        q01.png
        q02.png
/database
/auditoria
/logs

A organização deve ser previsível.

O usuário deve localizar rapidamente qualquer questão.

⸻

Arquivos de Metadados

Cada prova deverá possuir um arquivo de metadados.

Exemplo:

{
  "arquivo": "enade_ads_2022.pdf",
  "ano": 2022,
  "paginas": 38,
  "questoes_detectadas": 35,
  "questoes_extraidas": 35,
  "score_geral": 96.5
}

Cada questão também deverá possuir metadados próprios.

Exemplo:

{
  "questao": 15,
  "paginas": [10,11],
  "altura": 7820,
  "largura": 2480,
  "confidence": 0.98,
  "status": "ok"
}

Esses metadados serão importantes para futuras integrações.

⸻

Sistema de Score

O sistema deverá produzir métricas objetivas.

A ideia é permitir que o usuário saiba rapidamente se uma prova merece atenção.

Exemplo:

Prova:
ENADE ADS 2022
Questões:
35
Score:
97%

Classificação sugerida:

95-100
Excelente
90-94
Muito Boa
80-89
Boa
70-79
Necessita Revisão
Abaixo de 70
Problemas Graves

Esse score não substitui a auditoria.

Ele apenas prioriza onde o usuário deve olhar primeiro.

⸻

Interface de Auditoria

A auditoria é uma das partes mais importantes do projeto.

O sistema não deve assumir que sua extração é perfeita.

O sistema deve facilitar a descoberta dos erros.

A página inicial deverá exibir todas as provas processadas.

Exemplo:

ENADE ADS 2022
35 questões
97%
ENADE ADS 2023
35 questões
94%
ENADE SI 2021
35 questões
88%

Ao clicar em uma prova, o usuário deverá visualizar todas as questões.

⸻

Visualização das Questões

Cada questão deverá apresentar:

* número
* status
* score
* imagem

Exemplo:

Questão 15
Status:
OK
Confiança:
98%

A imagem deverá ser exibida diretamente na interface.

O usuário não deve precisar baixar arquivos para revisar.

⸻

Sistema de Aprovação

Cada questão deverá possuir um estado.

Exemplo:

PENDENTE
APROVADA
REJEITADA
REVISAR

Esses estados deverão ser armazenados no banco.

Isso permitirá auditorias futuras.

⸻

Sistema de Filtros

O usuário deverá conseguir visualizar rapidamente apenas os problemas.

Exemplos:

Mostrar apenas:

* aprovadas
* rejeitadas
* pendentes
* baixa confiança
* possíveis erros

Esse recurso reduzirá drasticamente o tempo de revisão.

⸻

Integração com IA

O modelo NVIDIA Nemotron não deverá participar do processamento normal.

Ele será utilizado apenas como mecanismo especializado para casos difíceis.

Exemplos:

* marcador não encontrado
* OCR inconsistente
* sequência quebrada
* dúvida sobre continuidade

A lógica recomendada é:

Primeiro:

Resolver localmente.

Somente depois:

Consultar IA.

Isso reduz custos e aumenta a velocidade.

⸻

Estratégia de Diagnóstico com IA

Quando uma página apresentar comportamento suspeito, o sistema poderá gerar automaticamente um pacote de diagnóstico.

Exemplo:

Imagem da página.

Texto extraído.

Coordenadas encontradas.

Mensagem:

Analise esta página.
Informe:
- quais questões aparecem
- possíveis marcadores
- possíveis falhas do OCR
- possíveis limites das questões

O retorno da IA deverá ser armazenado.

Nunca deve ser descartado.

⸻

Banco de Dados

O banco SQLite deverá ser considerado a fonte oficial de auditoria.

Ele deverá armazenar:

Provas.

Páginas.

Questões.

Eventos.

Decisões do usuário.

Chamadas para IA.

Resultados da IA.

Isso permitirá rastrear toda a história do processamento.

⸻

Estratégia de Logs

Existem dois tipos de logs.

Primeiro:

Logs operacionais.

Exemplo:

PDF carregado
Página convertida
Questão encontrada

Segundo:

Logs de auditoria.

Exemplo:

Questão 15 marcada para revisão.
Motivo:
Baixa confiança.

Essa separação facilitará diagnósticos futuros.

⸻

Métricas de Qualidade

O sistema deverá produzir estatísticas.

Exemplos:

Total de PDFs
Total de páginas
Total de questões
Questões aprovadas
Questões rejeitadas
Questões pendentes
Tempo médio por prova

Essas métricas devem estar disponíveis na interface.

⸻

Plano de Evolução

A implementação inicial deverá focar exclusivamente na extração visual.

Não tentar resolver simultaneamente:

* OCR avançado
* classificação automática
* geração de embeddings
* banco vetorial
* RAG

Esses recursos poderão ser adicionados posteriormente.

A evolução recomendada é:

Fase 1:

Extração de questões.

Fase 2:

Auditoria.

Fase 3:

OCR estruturado.

Fase 4:

Extração das alternativas.

Fase 5:

Classificação temática.

Fase 6:

Embeddings.

Fase 7:

RAG especializado em ENADE.

⸻

Critério Final de Aceitação

O sistema será considerado pronto para uso quando for capaz de processar automaticamente uma coleção de provas ENADE produzindo:

1. PNG individual de cada questão.
2. Metadados completos.
3. Banco de dados consistente.
4. Relatórios de auditoria.
5. Interface web funcional.
6. Identificação automática das principais anomalias.
7. Possibilidade de revisão rápida por um humano.

A partir desse momento a base gerada poderá servir como fundação para projetos mais avançados envolvendo recuperação semântica, classificação automática de questões, análise curricular e agentes especializados em ENADE.

O sucesso do projeto não deve ser medido apenas pela quantidade de código produzido, mas pela capacidade do sistema de gerar uma coleção de questões confiável, auditável e reutilizável ao longo dos próximos anos.