Processamento, Algoritmos e Estratégias de Validação

Introdução

Este documento descreve detalhadamente como o sistema deve processar as provas, quais algoritmos devem ser utilizados, quais decisões devem ser tomadas durante a execução e, principalmente, como verificar se os resultados produzidos são confiáveis.

O objetivo deste documento não é definir código. O objetivo é definir comportamento.

O agente responsável pela implementação deverá seguir os princípios descritos aqui mesmo que a implementação concreta utilize bibliotecas ou abordagens diferentes das inicialmente previstas.

A prioridade máxima é a qualidade da extração.

Velocidade é importante, mas é secundária.

Uma questão incorretamente extraída possui muito mais impacto negativo do que alguns segundos adicionais de processamento.

⸻

Filosofia de Processamento

O sistema não deve assumir que todos os PDFs seguem o mesmo padrão.

O ENADE sofreu alterações ao longo dos anos.

Além disso, diferentes cursos podem apresentar pequenas variações visuais.

Consequentemente, a lógica do sistema deve ser baseada em evidências encontradas durante a execução e não em regras rígidas criadas previamente para uma única prova.

Sempre que possível, decisões devem ser tomadas utilizando múltiplos sinais.

Por exemplo:

Não confiar apenas no OCR.

Não confiar apenas na estrutura textual.

Não confiar apenas na análise visual.

A combinação dessas informações geralmente produz resultados mais robustos.

⸻

Fase 1 - Descoberta das Provas

Ao iniciar a execução, o sistema deverá percorrer a pasta:

/enade/provas

Todos os arquivos PDF encontrados deverão ser registrados.

Para cada arquivo encontrado deverão ser coletadas informações preliminares:

* nome do arquivo
* tamanho
* data de modificação
* quantidade de páginas
* hash do arquivo

O hash permitirá identificar se uma prova já foi processada anteriormente.

Se o hash já existir no banco de dados, o sistema deverá permitir:

* ignorar
* reprocessar
* atualizar

Essa decisão poderá ser configurada futuramente.

⸻

Fase 2 - Identificação do Tipo de PDF

Antes de iniciar qualquer extração, o sistema deverá descobrir qual é a natureza do PDF.

Os PDFs podem ser classificados em três categorias.

Primeira categoria:

PDF digital.

Possui texto estruturado internamente.

Permite extração direta utilizando PyMuPDF.

Segunda categoria:

PDF escaneado.

Consiste basicamente em imagens.

Necessita OCR.

Terceira categoria:

PDF híbrido.

Possui parte do conteúdo estruturado e parte baseada em imagens.

A classificação deve ocorrer automaticamente.

Uma possível estratégia é calcular a quantidade de texto extraído diretamente do PDF.

Exemplo:

Se menos de 10% das páginas retornarem texto útil, assumir que o PDF é predominantemente escaneado.

Essa classificação deverá ser registrada no banco de dados.

⸻

Fase 3 - Conversão das Páginas

Todas as páginas deverão ser convertidas para PNG.

A resolução padrão será 300 DPI.

Resoluções menores podem comprometer OCR e auditoria.

Resoluções muito maiores aumentam o consumo de memória sem benefícios significativos.

Cada página deverá ser armazenada individualmente.

Exemplo:

paginas/
    prova_2022/
        page_001.png
        page_002.png
        page_003.png

As imagens geradas deverão permanecer armazenadas.

Mesmo após a geração das questões.

Elas serão importantes para auditorias futuras.

⸻

Fase 4 - Extração Estrutural

Esta deve ser a estratégia prioritária.

O sistema deverá utilizar PyMuPDF para obter:

* texto
* coordenadas
* blocos
* linhas
* fontes
* posições

O objetivo não é apenas recuperar texto.

O objetivo principal é descobrir onde cada trecho está localizado na página.

As coordenadas são fundamentais para determinar os limites das questões.

Caso a extração estrutural seja considerada satisfatória, ela deverá ser utilizada como fonte principal.

⸻

Fase 5 - OCR

Quando a estrutura do PDF não for suficiente, deverá ser executado OCR.

O OCR deve funcionar como mecanismo complementar.

O sistema deverá armazenar:

* texto reconhecido
* posição
* confiança

Sempre que possível, o OCR deve fornecer coordenadas.

A simples extração textual não é suficiente.

O sistema precisa saber onde o texto está localizado.

⸻

Fase 6 - Localização dos Marcadores

O conceito mais importante do sistema é o marcador.

Um marcador representa o início de uma questão.

Exemplos:

QUESTÃO 01
QUESTÃO 10
Questão 25

A busca deve utilizar expressões regulares tolerantes.

O sistema não deve depender exclusivamente de uma única grafia.

Deve ser capaz de reconhecer variações razoáveis.

Para cada marcador encontrado deverão ser registrados:

* número da questão
* página
* posição x
* posição y
* método de detecção
* confiança

⸻

Fase 7 - Construção da Sequência

Após localizar os marcadores, o sistema deverá construir uma sequência lógica.

Exemplo esperado:

1
2
3
4
5
6

Essa sequência será utilizada para detectar problemas.

Exemplo:

1
2
4
5
6

Nesse caso, a questão 3 provavelmente não foi detectada.

Outro exemplo:

1
2
2
3
4

Pode indicar duplicidade.

Essas situações devem gerar alertas.

⸻

Fase 8 - Construção das Regiões

Após identificar os marcadores, o sistema deverá determinar quais áreas pertencem a cada questão.

A lógica principal será:

Uma questão começa no marcador atual.

Uma questão termina imediatamente antes do próximo marcador.

Essa regra funciona para questões dentro da mesma página.

Quando a questão atinge o final da página sem encontrar outro marcador, ela deverá permanecer aberta.

A próxima página passa a fazer parte da mesma questão.

⸻

Fase 9 - Resolução de Continuidade

Esta é uma das etapas mais críticas.

O sistema deve assumir que qualquer questão pode atravessar múltiplas páginas.

Exemplo:

Página 10:

QUESTÃO 15

Página 11:

continuação

Página 12:

QUESTÃO 16

Nesse cenário:

Toda a área entre o início da questão 15 e o início da questão 16 pertence à mesma questão.

O sistema deverá unir todos os fragmentos verticalmente.

O resultado será um único PNG.

⸻

Fase 10 - Geração dos PNGs

Cada questão deverá resultar em um único arquivo.

O PNG deve preservar:

* resolução
* proporções
* conteúdo

Nenhum conteúdo deve ser removido.

Nenhuma compactação agressiva deve ser utilizada.

A fidelidade visual é mais importante que a economia de espaço.

⸻

Sistema de Confiança

Toda questão deverá receber uma pontuação de confiança.

Essa pontuação não representa a qualidade do conteúdo.

Ela representa a confiança do sistema na extração realizada.

Exemplo:

0.99

Extração extremamente confiável.

Exemplo:

0.55

Extração suspeita.

O cálculo deve considerar múltiplos fatores.

Entre eles:

* qualidade do OCR
* sequência numérica
* consistência dos marcadores
* quantidade de conteúdo
* integridade visual

⸻

Detecção de Anomalias

O sistema deve identificar automaticamente situações incomuns.

Exemplos:

Questão vazia.

Questão extremamente pequena.

Questão extremamente grande.

Numeração quebrada.

Numeração duplicada.

Página sem associação.

Questão sem alternativas.

Questão iniciada mas nunca encerrada.

Cada anomalia deverá gerar um evento.

⸻

Estratégia de Auditoria

A auditoria humana deve focar apenas em exceções.

Não faz sentido exigir revisão manual de todas as questões.

O sistema deve priorizar automaticamente aquilo que merece atenção.

Questões com baixa confiança devem aparecer primeiro.

Questões com anomalias devem receber destaque visual.

O objetivo é que uma prova inteira possa ser auditada em poucos minutos.

⸻

Critérios de Aceitação

Uma prova será considerada processada com sucesso quando:

Todas as páginas forem analisadas.

Todos os marcadores forem identificados ou registrados como problema.

Todas as questões produzirem PNG válido.

Não existirem páginas órfãs.

Não existirem erros críticos não resolvidos.

O relatório final for gerado.

O banco de dados for atualizado.

A auditoria web estiver disponível.

⸻

Estratégia de Testes

O sistema deverá possuir um conjunto de testes utilizando provas reais.

Os testes devem validar cenários como:

Questão em página única.

Questão em duas páginas.

Questão em três páginas.

PDF digital.

PDF escaneado.

PDF híbrido.

Numeração correta.

Numeração incorreta.

Questão sem imagem.

Questão com imagem.

Questão com gráfico.

Questão com tabela.

Questão com fórmula matemática.

Cada novo ajuste realizado no sistema deverá ser validado contra essa coleção de testes.

O objetivo não é apenas fazer o sistema funcionar hoje.

O objetivo é garantir que futuras melhorias não quebrem comportamentos que já funcionavam.

⸻

Definição de Sucesso do Projeto

O sistema será considerado maduro quando conseguir processar automaticamente uma coleção de provas ENADE produzindo resultados suficientemente confiáveis para alimentar uma base de conhecimento utilizada posteriormente por agentes de IA, sistemas de recuperação semântica, classificação automática de questões e análises acadêmicas avançadas.

A extração correta das questões é a fundação de todo o restante do projeto.

Qualquer erro nesta etapa tende a se propagar para todos os sistemas construídos posteriormente. Por esse motivo, a qualidade da extração e da validação deve ser tratada como prioridade máxima em todas as decisões de implementação.