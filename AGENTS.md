# Diretrizes Obrigatórias para Agentes de IA (AGENTS.md)

> [!IMPORTANT]
> **LEITURA MANDATÓRIA NO INÍCIO DE QUALQUER SESSÃO:**
> Todo agente de IA ou desenvolvedor que for realizar qualquer alteração neste repositório **DEVE** ler atentamente este documento e respeitar integralmente a arquitetura estabelecida antes de modificar qualquer linha de código.

---

## 1. Visão Geral do Projeto
O objetivo deste sistema é processar provas oficiais do **ENADE** (em PDF), extrair com máxima fidelidade geométrica todas as questões individuais (Discursivas e Objetivas) e disponibilizá-las em uma aplicação web moderna (hospedável no **Vercel**) com dois perfis de acesso:
1. **Administrador**: Auditoria de qualidade, conferência de crop/texto, moderação e visualização de anomalias.
2. **Docente**: Apresentação interativa em sala de aula (Modo Slide/Cinema), busca temática e zoom em diagramas.

---

## 2. Princípios Arquiteturais Inegociáveis

### Regra 1: Zero Consumo de Tokens de IA no Pipeline de Extração
- O processamento de PDFs, OCR, decodificação CMap e recorte de imagens **DEVE SER 100% LOCAL E OFFLINE** (usando `PyMuPDF`, `OpenCV`, `Pillow` e `Tesseract`).
- **NUNCA** envie imagens de páginas inteiras ou PDFs em lote para modelos de IA externos. O fluxo padrão é estritamente determinístico e executado via script local em Python.

### Regra 2: Arquitetura Híbrida (Python Engine + Next.js Frontend)
- **Engine Local (Python)**: Localizada em `src/enade/`. Responsável por ler os PDFs em `provas/`, renderizar páginas a 300 DPI, segmentar colunas/páginas e gerar a tríade `{id_questao}.png`, `{id_questao}.json`, `{id_questao}.txt` e figuras em `questoes/{id_prova}/` e `web/public/questoes/{id_prova}/`.
- **Frontend Vercel (Next.js 15 + TypeScript + TailwindCSS)**: Localizado em `web/`. Consome os dados e imagens estáticas de forma ultra-rápida, sem dependência de runtime Python em produção.

### Regra 3: Geometria e Layout das Provas ENADE
- **Identificadores Únicos**:
  - `id_prova`: Formato `{ano}_{curso}` ou nome do arquivo (ex: `2014_CCP`, `2021_ADS`, `2024_CCP`). Nunca use apenas o ano como chave primária.
  - `id_questao`: Formato `qd01..qd10` para Discursivas e `q01..q80` para Objetivas.
- **Detecção de Colunas e Remoção de Ruído**:
  - Cabeçalhos superiores ($y < 55\text{ pt}$) e rodapés ($y > \text{altura} - 45\text{ pt}$) devem ser descartados na segmentação.
  - Páginas de 2 colunas devem respeitar a ordem de leitura: Coluna Esquerda $\to$ Coluna Direita $\to$ Próxima Página.
  - Questões com parágrafos que cruzam mais de 55% da largura da folha (como questões discursivas) devem ser tratadas como **largura total (1 coluna)**, mesmo se houver números de rascunho curtos na margem.
- **Decodificação CMap**:
  - Provas como `2014` e `2017` contêm caracteres corrompidos no PDF nativo. Sempre passe os textos pela função `decode_enade_str()` em `structural_extractor.py`.

---

## 3. Estrutura de Diretórios

```
/
├── AGENTS.md                  # Este documento (leitura mandatória)
├── README.md                  # Documentação do projeto
├── todo.md                    # Roadmap de tarefas e status de execução
├── provas/                    # PDFs originais do ENADE
├── questoes/                  # Saída local da engine ({id_prova}/q01.png, .json, .txt)
├── auditoria/                 # Relatórios consolidados de auditoria ({id_prova}/relatorio.json)
├── src/                       # Código-fonte da engine Python
│   └── enade/
│       ├── core/              # Modelos de dados (Exam, Question, Segment, etc.)
│       ├── processing/        # Pipeline (discovery, converter, extractor, builder, generator, validator)
│       └── utils/             # Loggers e helpers
├── tests/                     # Suíte de testes unitários e de integração (pytest)
└── web/                       # Aplicação Web Next.js 15 (pronta para Vercel)
    ├── public/questoes/       # Imagens e dados servidos estaticamente
    ├── src/app/admin/         # Rotas do Administrador (Auditoria & Moderação)
    └── src/app/docente/       # Rotas do Docente (Apresentação & Sala de Aula)
```

---

## 4. Checklist para Novas Alterações
Antes de submeter ou finalizar qualquer alteração:
1. Verifique se os testes automatizados continuam passando:
   ```bash
   .venv/bin/pytest tests/ -v
   ```
2. Verifique se o build do Next.js passa sem erros:
   ```bash
   cd web && npm run build
   ```
3. Garanta que a integridade dos metadados JSON (`id_prova`, `id_questao`, `tipo`, `segmentos`, `confianca`) seja preservada.
