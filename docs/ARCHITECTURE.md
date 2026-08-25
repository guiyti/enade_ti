# Arquitetura do Sistema ENADE

> Última atualização: 2026-08-25

## Visão Geral

Sistema híbrido para processamento, extração e apresentação de questões do **ENADE** (Exame Nacional de Desempenho dos Estudantes):

- **Engine Python** (`engine/`): Processamento local e offline de PDFs. Nunca consome tokens de IA externos.
- **Frontend Next.js** (`src/`): Aplicação web estática, hospedável no Vercel com Zero-Config. Consome apenas JSON e PNGs estáticos.

---

## Estrutura de Diretórios

```text
/
├── AGENTS.md                  # Diretrizes obrigatórias para agentes de IA
├── README.md                  # Documentação do projeto
├── todo.md                    # Roadmap e status de tarefas
├── package.json               # Next.js 15 (deploy root no Vercel)
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── vercel.json
├── .env / .env.example        # Variáveis de ambiente da engine Python
│
├── provas/                    # PDFs originais do ENADE (mantidos localmente)
├── paginas/                   # Renders de páginas completas (cache local, gitignored)
├── Portarias/                 # Documentos oficiais do MEC (PDFs/imagens)
├── logs/                      # Logs de execução da engine (gitignored)
│
├── public/
│   ├── data/
│   │   └── exams.json         # Catálogo mestre gerado pela engine (gitignored)
│   └── questoes/              # PNGs 300 DPI + JSONs + TXTs por prova (gitignored)
│       └── {id_prova}/
│           ├── metadata.json
│           ├── {id_questao}.png
│           ├── {id_questao}.json
│           └── {id_questao}.txt
│
├── src/                       # Frontend Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx           # Home (catálogo de provas)
│   │   ├── admin/             # Perfil Administrador (auditoria)
│   │   └── docente/           # Perfil Docente (apresentação em sala)
│   ├── components/            # PresentationViewer, CourseGallery, TagEditor, etc.
│   └── lib/                   # enade.ts (data layer), tagStore.ts, presentationContext.ts
│
└── engine/                    # Motor de processamento offline Python
    ├── requirements.txt        # Dependências: PyMuPDF, OpenCV, Pillow, pytesseract
    ├── pyproject.toml
    ├── run_processing.py       # Ponto de entrada: processa todos os PDFs em provas/
    ├── src/enade/
    │   ├── config.py           # Configuração central (caminhos, DPI, OCR)
    │   ├── core/
    │   │   └── models.py       # Modelos de dados: Exam, Question, QuestionType, etc.
    │   ├── processing/         # Pipeline de extração
    │   │   ├── orchestrator.py     # Coordena todas as etapas do pipeline
    │   │   ├── pdf_discovery.py    # Descobre PDFs em provas/
    │   │   ├── page_converter.py   # Renderiza páginas a 300 DPI
    │   │   ├── structural_extractor.py  # Extrai marcadores de questão via PyMuPDF
    │   │   ├── ocr_extractor.py    # OCR complementar via Tesseract
    │   │   ├── region_builder.py   # Constrói regiões geométricas por questão
    │   │   ├── png_generator.py    # Gera PNGs limpos (remove "ÁREA LIVRE", etc.)
    │   │   ├── validator.py        # Valida integridade e confiança das extrações
    │   │   ├── topic_classifier.py # Classifica questões por área do conhecimento
    │   │   └── png_cleaner.py      # Utilitário auxiliar de limpeza de imagem
    │   └── utils/
    │       └── logging.py          # Configuração de logging
    └── tests/
        ├── conftest.py
        ├── test_orchestrator.py
        ├── test_page_converter.py
        ├── test_pdf_discovery.py
        ├── test_png_generator.py
        ├── test_region_builder.py
        ├── test_structural_extractor.py
        ├── test_validator.py
        └── test_exams_json.py      # Valida integridade do catálogo exams.json
```

---

## Pipeline de Extração (Engine Python)

```
provas/*.pdf
    ↓
pdf_discovery.py       → descobre e classifica PDFs
    ↓
page_converter.py      → renderiza páginas a 300 DPI → paginas/{id_prova}/
    ↓
structural_extractor.py → extrai marcadores "QUESTÃO N" via PyMuPDF (texto nativo)
    ↓
ocr_extractor.py       → OCR via Tesseract em páginas sem texto nativo
    ↓
region_builder.py      → constrói regiões geométricas multi-coluna/multi-página
    ↓
png_generator.py       → recorta e salva {id_questao}.png, .json, .txt
    ↓
topic_classifier.py    → classifica por área do conhecimento (regex determinístico)
    ↓
validator.py           → valida sequência, duplicatas, integridade de imagens
    ↓
orchestrator.py        → salva metadata.json por prova + exams.json (catálogo mestre)
    ↓
public/questoes/{id_prova}/    (destino final — lido pelo Next.js)
public/data/exams.json         (catálogo mestre — lido pelo Next.js)
```

---

## Identificadores

- **`id_prova`**: `{ano}_{curso}` — ex: `2021_ADS`, `2024_CCP`
- **`id_questao`**: `q01`..`q80` (objetivas), `qd01`..`qd10` (discursivas)

---

## Como Executar

### Engine Python (processamento local)
```bash
# Instalar dependências
pip install -r engine/requirements.txt

# Processar todos os PDFs em provas/
cd engine && python run_processing.py

# Rodar suíte de testes
cd /path/to/ENADE && .venv/bin/pytest engine/tests/ -v
```

### Frontend Next.js
```bash
# Desenvolvimento
npm run dev

# Build de produção (validação)
npm run build

# Lint
npm run lint
```

---

## Variáveis de Ambiente

Arquivo `.env` na raiz (ver `.env.example`):

| Variável | Padrão | Descrição |
|---|---|---|
| `LOG_LEVEL` | `INFO` | Nível de log da engine |
| `DEBUG` | `false` | Modo debug |
| `TESSERACT_LANG` | `por+eng` | Idioma do Tesseract OCR |
| `PDF_DPI` | `300` | Resolução de renderização de páginas |

---

## Notas Importantes

1. **Sem tokens de IA no pipeline**: Todo processamento usa PyMuPDF + OpenCV + Tesseract — 100% local.
2. **`public/questoes/` é gitignored**: Esses dados (~490 MB) são gerados localmente e não ficam no repositório.
3. **`paginas/` é gitignored**: Cache intermediário de renders de página completa (~229 MB).
4. **Deploy Vercel**: O Vercel serve apenas o Next.js. Os dados de `public/questoes/` e `public/data/exams.json` precisam ser gerados localmente e carregados via Vercel Storage ou CDN externo para produção.

---

## Docs de Era Anterior

A pasta `docs/archive/` contém documentação da fase FastAPI/Jinja2 (substituída pelo Next.js 15), preservada apenas para referência histórica.
