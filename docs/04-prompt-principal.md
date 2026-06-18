04-prompt-principal.md

PROMPT PRINCIPAL PARA IMPLEMENTAÇÃO DO SISTEMA

Leia obrigatoriamente os documentos:

* 00-visao-geral.md
* 01-arquitetura.md
* 02-processamento-validacao.md
* 03-implementacao-pratica.md

Esses documentos definem os requisitos do projeto.

Você deve utilizá-los como especificação principal durante toda a implementação.

Não tome decisões que contrariem esses documentos sem justificar explicitamente o motivo.

⸻

CONTEXTO

O objetivo do projeto é processar provas ENADE em PDF e gerar uma coleção estruturada de questões individuais.

O foco principal NÃO é OCR.

O foco principal NÃO é extração de texto.

O foco principal é identificar corretamente os limites de cada questão e gerar um PNG contendo exatamente a aparência visual original da questão.

A preservação visual é mais importante que a reconstrução textual.

O sistema deverá funcionar com:

* PDFs digitais
* PDFs escaneados
* PDFs híbridos

O sistema será executado localmente em macOS.

Inicialmente existirão aproximadamente 10 provas.

A prioridade é qualidade da extração e facilidade de auditoria.

⸻

AMBIENTE

Já existe um arquivo .env na raiz do projeto.

Esse arquivo deve ser utilizado obrigatoriamente.

Utilize python-dotenv.

NÃO solicite ao usuário:

* API Keys
* URLs
* nomes de modelos
* configurações de OCR
* configurações de processamento

Essas informações já estão disponíveis.

As seguintes variáveis já existem:

NVIDIA_API_KEY

NVIDIA_BASE_URL

NVIDIA_MODEL

LOG_LEVEL

DEBUG

TESSERACT_LANG

PDF_DPI

WEB_PORT

WEB_HOST

O sistema deve validar essas configurações durante a inicialização.

Nunca exibir a API Key completa nos logs.

Exemplo:

NVIDIA_API_KEY=nvapi-****ABCD

⸻

FILOSOFIA DE IMPLEMENTAÇÃO

A solução deve ser simples.

Evite:

* microsserviços
* filas
* arquitetura distribuída
* abstrações excessivas
* dependências desnecessárias

Prefira:

* código simples
* módulos pequenos
* processamento previsível
* arquivos JSON
* logs claros

Este projeto será utilizado inicialmente por apenas uma pessoa.

A facilidade de manutenção é mais importante que sofisticação arquitetural.

⸻

TECNOLOGIAS OBRIGATÓRIAS

Utilize:

* Python 3.12+
* PyMuPDF
* Pillow
* OpenCV
* FastAPI
* Jinja2
* Rich
* Tesseract OCR
* python-dotenv

Caso utilize bibliotecas adicionais, justifique claramente.

⸻

NÃO UTILIZAR BANCO DE DADOS

Não utilizar SQLite na primeira versão.

Não criar ORM.

Não criar camada de persistência complexa.

Persistir informações utilizando arquivos JSON.

Exemplos:

questoes/
    2022/
        q01.png
        q01.json
        q02.png
        q02.json

Relatórios:

auditoria/
    enade_ads_2022/
        relatorio.json
        index.html

A estrutura deve permitir futura migração para banco caso necessário.

⸻

ESTRUTURA ESPERADA

/enade
/provas
/paginas
/questoes
/auditoria
/logs
/cache
/docs
/src
.env

⸻

ESTRATÉGIA DE IMPLEMENTAÇÃO

Antes de escrever qualquer código:

1. Ler todos os documentos.
2. Gerar relatório de entendimento.
3. Gerar plano de implementação.
4. Identificar riscos técnicos.

Somente então iniciar a implementação.

⸻

ETAPA 1

Criar estrutura completa do projeto.

Criar:

* requirements.txt
* README.md
* configuração
* carregamento do .env

Validar inicialização.

⸻

ETAPA 2

Implementar descoberta dos PDFs.

Identificar:

* nome
* quantidade de páginas
* tipo do PDF

Registrar nos logs.

⸻

ETAPA 3

Converter páginas para PNG.

Utilizar resolução configurável através de:

PDF_DPI

Salvar páginas individualmente.

⸻

ETAPA 4

Implementar extração estrutural com PyMuPDF.

Extrair:

* texto
* coordenadas
* blocos
* linhas

Registrar resultados.

⸻

ETAPA 5

Implementar OCR.

Utilizar apenas quando necessário.

Registrar:

* texto
* confiança
* coordenadas

⸻

ETAPA 6

Implementar detecção de marcadores.

Exemplos:

QUESTÃO 01

QUESTÃO 10

Questão 35

A detecção deve ser tolerante a variações.

Registrar:

* posição
* método
* confiança

⸻

ETAPA 7

Construir regiões das questões.

Determinar:

* início
* término
* páginas associadas

Implementar lógica para questões que atravessam múltiplas páginas.

Essa é uma das partes mais importantes do sistema.

⸻

ETAPA 8

Gerar PNG final de cada questão.

Preservar:

* resolução
* conteúdo
* qualidade visual

Não realizar compressões agressivas.

⸻

ETAPA 9

Gerar arquivos JSON.

Cada questão deverá possuir metadados.

Exemplo:

{
  "questao": 15,
  "paginas": [10,11],
  "confidence": 0.97,
  "status": "ok"
}

⸻

ETAPA 10

Implementar sistema de validação.

Detectar:

* numeração quebrada
* questões duplicadas
* questões vazias
* páginas órfãs
* baixa confiança

Gerar alertas.

⸻

ETAPA 11

Implementar auditoria web.

Utilizar:

* FastAPI
* Jinja2

Criar:

Dashboard.

Lista de provas.

Lista de questões.

Visualização da questão.

Filtros.

Status.

⸻

ETAPA 12

Implementar relatórios.

Gerar:

relatorio.json

estatisticas.json

auditoria.html

Ao final de cada processamento.

⸻

USO DE IA

Existe acesso ao modelo NVIDIA Nemotron.

Porém:

A IA NÃO deve ser utilizada como mecanismo principal de extração.

Primeiro:

resolver localmente.

Somente depois:

utilizar IA para casos ambíguos.

Exemplos:

* OCR falhou
* marcador duvidoso
* continuidade incerta
* inconsistências graves

Toda chamada para IA deve ser registrada.

O sistema deve continuar funcionando mesmo sem acesso à IA.

⸻

TESTES OBRIGATÓRIOS

Criar testes para:

* PDF digital
* PDF escaneado
* PDF híbrido
* questão simples
* questão multi-página
* questão com imagem
* questão com gráfico
* questão com tabela

Nenhum módulo deve ser considerado concluído sem testes.

⸻

CRITÉRIO DE SUCESSO

O projeto será considerado concluído quando um usuário puder:

1. Colocar PDFs em /enade/provas.
2. Executar um único comando.
3. Aguardar o processamento.
4. Abrir a interface web.
5. Revisar as questões extraídas.
6. Identificar rapidamente possíveis problemas.

O resultado final deverá ser uma base organizada de questões individuais pronta para utilização futura em sistemas de IA, RAG, classificação automática, análise curricular e estudos sobre o ENADE.

Priorize sempre:

* simplicidade
* robustez
* auditabilidade
* manutenção futura
* qualidade da extração