Sistema de Extração Automática de Questões ENADE

1. Objetivo do Projeto

Este projeto tem como objetivo construir um sistema capaz de processar automaticamente provas do ENADE em formato PDF e gerar uma base estruturada de questões individuais.

A principal saída do sistema será uma coleção de imagens PNG, onde cada arquivo representa exatamente uma questão da prova original.

O foco principal não é a extração de texto.

O foco principal é a preservação integral do conteúdo visual da questão.

O sistema deve ser capaz de preservar:

* Enunciados
* Alternativas
* Imagens
* Gráficos
* Tabelas
* Fórmulas matemáticas
* Diagramas
* Quadros
* Destaques visuais
* Qualquer outro elemento gráfico presente na prova

O sistema deve produzir uma representação fiel da questão original.

⸻

2. Problema de Negócio

As provas do ENADE estão disponíveis em PDFs completos.

Para utilização em sistemas de IA, RAG, bancos vetoriais, análise curricular ou classificação automática de questões, é necessário trabalhar com questões individualizadas.

Atualmente, uma prova completa é um documento único contendo dezenas de páginas.

Isso dificulta:

* Indexação
* Busca
* Classificação
* Análise automática
* Reuso de questões
* Treinamento de agentes especializados

O objetivo do sistema é transformar um conjunto de PDFs em uma base organizada de questões individuais.

⸻

3. Objetivos Funcionais

O sistema deverá:

Objetivo 1

Detectar automaticamente todas as provas localizadas na pasta:

/enade/provas

⸻

Objetivo 2

Processar cada PDF individualmente.

⸻

Objetivo 3

Identificar automaticamente:

* Ano da prova
* Curso (quando possível)
* Quantidade de páginas
* Quantidade de questões

⸻

Objetivo 4

Detectar o início de cada questão.

Exemplos:

QUESTÃO 01
QUESTÃO 02
QUESTÃO 15

ou

Questão 1
Questão 2

⸻

Objetivo 5

Determinar corretamente os limites da questão.

O sistema deve identificar:

* onde a questão começa
* onde a questão termina

⸻

Objetivo 6

Detectar questões que atravessam páginas.

Exemplo:

Página 10:

QUESTÃO 15

Página 11:

continuação da questão 15

Página 12:

QUESTÃO 16

Nesse cenário:

A questão 15 deve gerar apenas um único PNG.

⸻

Objetivo 7

Gerar uma imagem PNG individual para cada questão.

Exemplo:

/enade/questoes/2022/q01.png
/enade/questoes/2022/q02.png
/enade/questoes/2022/q03.png

⸻

Objetivo 8

Gerar metadados estruturados.

Exemplo:

{
  "ano": 2022,
  "questao": 15,
  "paginas": [10,11],
  "altura_pixels": 8120,
  "status": "ok",
  "confidence": 0.97
}

⸻

Objetivo 9

Disponibilizar interface de auditoria.

O usuário deve conseguir revisar visualmente cada questão extraída.

⸻

4. Objetivos Não Funcionais

Confiabilidade

O sistema deve priorizar precisão em vez de velocidade.

É preferível marcar uma questão para revisão manual do que extrair incorretamente.

⸻

Auditabilidade

Toda decisão importante deve ser rastreável.

O sistema nunca deve descartar informações silenciosamente.

Qualquer problema deve gerar log.

⸻

Reprodutibilidade

Executar duas vezes sobre o mesmo PDF deve produzir o mesmo resultado.

⸻

Escalabilidade

Embora inicialmente existam apenas cerca de 10 provas, o sistema deve suportar centenas de provas sem necessidade de reescrita.

⸻

Modularidade

Cada módulo deve possuir responsabilidade única.

Exemplos:

* conversão PDF
* OCR
* detecção de questões
* auditoria
* banco de dados

devem permanecer desacoplados.

⸻

5. Filosofia de Extração

O que NÃO fazer

Não reconstruir a questão usando texto OCR.

Não tentar recriar layout.

Não gerar HTML da questão.

Não gerar Markdown da questão.

Não gerar PDF novo da questão.

⸻

O que fazer

Recortar a região visual correspondente à questão.

Preservar exatamente a aparência original.

A questão deve ser tratada como um objeto visual.

⸻

6. Tipos de PDF Esperados

O sistema deve ser preparado para múltiplos cenários.

⸻

Cenário A

PDF digital.

Texto selecionável.

Maior precisão.

Menor dependência de OCR.

⸻

Cenário B

PDF escaneado.

Texto não selecionável.

OCR obrigatório.

⸻

Cenário C

PDF híbrido.

Parte digital.

Parte imagem.

Necessário combinar abordagens.

⸻

7. Estratégia Geral

A estratégia principal será baseada em três camadas.

⸻

Camada 1

Extração estrutural.

Utilizar PyMuPDF.

Objetivo:

Extrair texto e coordenadas.

⸻

Camada 2

OCR.

Utilizar Tesseract.

Objetivo:

Recuperar texto quando a estrutura do PDF não estiver disponível.

⸻

Camada 3

Validação.

Objetivo:

Detectar inconsistências.

Exemplos:

* questão ausente
* numeração quebrada
* questão vazia
* questão duplicada

⸻

8. Conceito de Questão

Uma questão é definida como todo o conteúdo compreendido entre dois marcadores consecutivos.

Exemplo:

QUESTÃO 12
...
conteúdo
...
QUESTÃO 13

Nesse caso:

Tudo entre os marcadores pertence à questão 12.

⸻

9. Continuidade Entre Páginas

Este é o aspecto mais crítico do sistema.

Muitas questões do ENADE ocupam mais de uma página.

O sistema deve ser capaz de identificar que uma questão continua além do limite físico da página.

Quando isso ocorrer:

As partes devem ser unidas verticalmente.

O usuário final deve enxergar uma única questão.

⸻

10. Auditoria Humana

Nenhum algoritmo será perfeito.

Por isso o sistema deve ser projetado para revisão humana.

O objetivo da auditoria não é corrigir todas as questões.

O objetivo é localizar rapidamente as exceções.

A interface deve destacar:

* baixa confiança
* possíveis falhas
* numeração inconsistente
* questões incompletas

⸻

11. Integração com IA

Modelos de linguagem não devem ser utilizados como mecanismo principal de extração.

Modelos de linguagem serão utilizados apenas para:

* validação
* diagnóstico
* classificação
* auxílio em casos ambíguos

A extração principal deve ocorrer localmente.

Isso reduz:

* custo
* tempo
* dependência externa
* consumo de tokens

⸻

12. Estrutura Esperada de Saída

/enade
/provas
/questoes
    /2021
        q01.png
        q02.png
    /2022
        q01.png
        q02.png
/auditoria
/database
/logs
/cache

⸻

13. Critérios de Sucesso

O projeto será considerado bem-sucedido quando:

1. Todas as provas forem processadas sem intervenção manual.
2. Pelo menos 95% das questões forem corretamente identificadas.
3. Questões multi-página forem unificadas corretamente.
4. A auditoria permitir localizar erros em poucos minutos.
5. O sistema gerar uma base reutilizável para projetos futuros de IA, classificação automática e análise do ENADE.

⸻

14. Visão de Longo Prazo

Este projeto não termina na extração.

A extração é apenas a fundação.

No futuro, a base produzida poderá alimentar:

* Sistemas RAG
* Bancos vetoriais
* Classificadores automáticos
* Análise histórica do ENADE
* Mapeamento curricular
* Identificação de competências avaliadas
* Agentes especialistas em preparação para ENADE

Por esse motivo, toda a arquitetura deve priorizar qualidade, rastreabilidade e manutenção futura.