Arquitetura Técnica do Sistema

Introdução

Este documento descreve a arquitetura completa do sistema de extração automática de questões do ENADE. Seu objetivo é orientar a implementação de forma que o sistema seja robusto, auditável, extensível e capaz de lidar com diferentes formatos de prova sem depender excessivamente de modelos de IA.

A principal premissa arquitetural é que o sistema deve tratar a prova como um documento visual estruturado. Embora técnicas de OCR e modelos de linguagem possam ser utilizados como apoio, a extração principal deve ocorrer através da análise estrutural do PDF e do processamento de imagens.

O sistema deve ser capaz de processar novas provas sem necessidade de ajustes específicos para cada ano, curso ou edição do ENADE.

⸻

Visão Geral da Arquitetura

A arquitetura será composta por quatro grandes camadas:

1. Camada de Descoberta e Ingestão
2. Camada de Processamento
3. Camada de Persistência
4. Camada de Auditoria

O fluxo geral será:

PDF
 ↓
Descoberta
 ↓
Conversão de páginas
 ↓
Extração estrutural
 ↓
Detecção de questões
 ↓
Resolução de continuidade
 ↓
Geração dos PNGs
 ↓
Persistência
 ↓
Auditoria

O sistema deverá sempre produzir evidências suficientes para que qualquer resultado possa ser auditado posteriormente.

⸻

Estrutura Física do Projeto

A estrutura inicial do projeto deverá seguir o padrão abaixo:

/enade
/provas
/paginas
/questoes
/auditoria
/logs
/cache
/database
/docs
/src

A pasta provas será considerada a única entrada obrigatória do sistema.

A pasta paginas armazenará imagens intermediárias geradas a partir dos PDFs.

A pasta questoes conterá os resultados finais do processamento.

A pasta auditoria conterá relatórios, páginas HTML e imagens utilizadas para revisão manual.

A pasta logs armazenará registros detalhados da execução.

A pasta database conterá o banco SQLite.

A pasta cache armazenará informações temporárias para evitar reprocessamentos desnecessários.

⸻

Estratégia de Processamento

O processamento de uma prova deve ocorrer em etapas bem definidas.

Primeiro, o sistema identifica os PDFs disponíveis.

Para cada PDF encontrado, um identificador interno será criado.

Esse identificador permitirá rastrear todas as etapas posteriores.

Em seguida, todas as páginas serão convertidas para imagens PNG de alta resolução.

A resolução padrão deverá ser 300 DPI.

A resolução não deve ser configurada abaixo disso, pois pequenas perdas de qualidade podem comprometer OCR, detecção de coordenadas e auditoria visual.

Após a geração das páginas, inicia-se a fase de análise estrutural.

O sistema deve tentar inicialmente extrair texto diretamente do PDF utilizando PyMuPDF.

Essa abordagem costuma ser extremamente precisa quando o PDF é digital.

Caso a extração estrutural não produza resultados adequados, o sistema deverá executar OCR.

A arquitetura deve permitir que ambos coexistam.

Não se deve assumir previamente que o PDF é digital ou escaneado.

O próprio sistema deverá descobrir isso durante a execução.

⸻

Estratégia de Detecção de Questões

A identificação das questões é o núcleo do projeto.

A arquitetura deve trabalhar com o conceito de marcadores.

Um marcador representa um ponto onde uma nova questão começa.

Exemplos típicos:

QUESTÃO 01
QUESTÃO 15
Questão 30

O sistema deverá localizar todos os marcadores existentes.

Para cada marcador encontrado serão armazenadas as seguintes informações:

* número da questão
* página
* coordenada vertical
* coordenada horizontal
* confiança
* método utilizado

O método utilizado poderá ser:

PDF_STRUCTURE
OCR
MANUAL
IA_ASSISTED

Essa informação será extremamente importante para auditorias futuras.

⸻

Construção das Regiões de Questão

Após identificar os marcadores, o sistema deverá construir regiões.

Uma região representa a área visual pertencente a uma questão.

A regra principal será simples:

Uma questão começa em seu marcador e termina imediatamente antes do próximo marcador.

Entretanto, essa regra isoladamente não resolve o problema das questões que atravessam páginas.

Por isso, a arquitetura deverá trabalhar com o conceito de região aberta.

Quando uma questão chega ao final da página sem que outra questão tenha sido encontrada, a região permanece aberta.

Na página seguinte, o sistema continua acumulando conteúdo até localizar o próximo marcador.

Somente então a questão anterior será encerrada.

Essa lógica é fundamental para o sucesso do projeto.

⸻

Estratégia de Montagem das Questões

Uma questão poderá possuir:

* uma única página
* duas páginas
* três páginas
* quatro ou mais páginas

O sistema não deve assumir nenhum limite máximo.

Quando múltiplos fragmentos pertencem à mesma questão, eles deverão ser unidos verticalmente.

O resultado final será uma única imagem PNG.

A imagem deve preservar integralmente o conteúdo original.

Nenhuma redimensionamento agressivo deve ser realizado.

Nenhuma compressão destrutiva deve ser aplicada.

O objetivo é produzir um arquivo adequado para futuras análises humanas e por IA.

⸻

Estratégia de Persistência

Todo resultado relevante deverá ser persistido.

A persistência ocorrerá em dois níveis.

Primeiro nível:

Arquivos físicos.

Exemplo:

questoes/
    2022/
        q01.png
        q02.png

Segundo nível:

Banco de dados SQLite.

O banco será utilizado para:

* consultas rápidas
* auditoria
* métricas
* reprocessamentos
* histórico

A existência simultânea dos arquivos e do banco é obrigatória.

Nenhum dos dois substitui o outro.

⸻

Modelo Conceitual de Dados

O sistema deverá trabalhar com quatro entidades principais.

A primeira entidade é Prova.

Uma prova representa um PDF processado.

A segunda entidade é Página.

Uma página representa uma imagem gerada a partir da prova.

A terceira entidade é Questão.

Uma questão representa o resultado final do sistema.

A quarta entidade é Evento.

Eventos registram ocorrências durante o processamento.

Exemplos:

* OCR executado
* questão não encontrada
* possível falha
* baixa confiança

Essa separação permitirá diagnósticos futuros sem necessidade de reprocessar toda a base.

⸻

Arquitetura de Logs

Logs são extremamente importantes neste projeto.

Não basta saber que uma questão foi criada.

É necessário entender como ela foi criada.

Por isso, toda etapa relevante deverá gerar logs estruturados.

Exemplos:

PDF carregado
Página convertida
OCR executado
Questão encontrada
Questão unificada
Questão marcada para revisão

O sistema deve evitar logs excessivamente verbosos, mas também não pode esconder decisões importantes.

⸻

Estratégia de Validação

A validação não deve ocorrer apenas ao final do processamento.

Ela deve ocorrer continuamente.

Exemplos de verificações:

* sequência de numeração
* duplicidade
* ausência de questões
* imagens vazias
* imagens muito pequenas
* imagens extremamente grandes

Cada anomalia deve receber um nível de severidade.

Exemplo:

INFO
WARNING
ERROR
CRITICAL

Esses níveis serão utilizados posteriormente pela interface de auditoria.

⸻

Arquitetura da Interface Web

A interface web não é um componente secundário.

Ela faz parte da estratégia de qualidade.

O objetivo não é editar questões.

O objetivo é localizar rapidamente possíveis erros.

O usuário deverá conseguir navegar por:

* prova
* ano
* curso
* questão
* status
* confiança

A interface deve priorizar velocidade de inspeção.

O usuário deve conseguir revisar dezenas de questões em poucos minutos.

A interface deverá destacar automaticamente:

* questões suspeitas
* baixa confiança
* numeração inconsistente
* questões incompletas

O usuário não deve precisar procurar manualmente pelos problemas.

⸻

Integração com IA

A IA não será utilizada como mecanismo principal de extração.

A IA será utilizada como especialista de apoio.

A arquitetura deve considerar a IA como uma ferramenta cara e lenta.

Portanto, ela só deverá ser acionada quando necessário.

Exemplos:

* OCR falhou
* marcador ambíguo
* numeração inconsistente
* página com estrutura incomum

Em condições normais, a maioria das provas deve ser processada sem qualquer chamada para modelos externos.

Isso reduz custos e aumenta a velocidade do sistema.

⸻

Estratégia de Evolução

A arquitetura deve permitir futuras expansões.

Entre elas:

* OCR avançado
* classificação automática das questões
* extração de alternativas
* geração de embeddings
* integração com banco vetorial
* sistemas RAG
* análise histórica do ENADE
* identificação automática de competências avaliadas

Por esse motivo, todas as decisões arquiteturais devem priorizar desacoplamento, rastreabilidade e manutenção futura.

O sistema não está sendo construído apenas para gerar PNGs. Ele está sendo construído para servir como a fundação de uma base de conhecimento estruturada do ENADE que poderá ser utilizada por agentes de IA, sistemas de busca semântica, ferramentas de apoio à coordenação de curso e análises acadêmicas de longo prazo.