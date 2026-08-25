# Diretrizes Obrigatórias para Agentes de IA (AGENTS.md)

> [!IMPORTANT]
> **LEITURA MANDATÓRIA NO INÍCIO DE QUALQUER SESSÃO:**
> Todo agente de IA ou desenvolvedor que for realizar qualquer alteração neste repositório **DEVE** ler atentamente este documento e respeitar integralmente a arquitetura estabelecida antes de modificar qualquer linha de código.

---

## 1. Visão Geral do Projeto
O objetivo deste sistema é processar provas oficiais do **ENADE** (em PDF), extrair com máxima fidelidade geométrica todas as questões individuais (Discursivas e Objetivas) e disponibilizá-las em uma aplicação web moderna (hospedável no **Vercel** com Zero-Config) com dois perfis de acesso:
1. **Administrador**: Auditoria de qualidade, conferência de crop/texto, moderação e visualização de anomalias.
2. **Docente**: Apresentação interativa em sala de aula (Modo Slide/Cinema), seleção guiada por curso, busca temática, visualização de textos motivadores e zoom em diagramas.

---

## 2. Princípios Arquiteturais Inegociáveis

### Regra 1: Zero Consumo de Tokens de IA no Pipeline de Extração
- O processamento de PDFs, OCR, decodificação CMap e recorte de imagens **DEVE SER 100% LOCAL E OFFLINE** (usando `PyMuPDF`, `OpenCV`, `Pillow` e `Tesseract`).
- **NUNCA** envie imagens de páginas inteiras ou PDFs em lote para modelos de IA externos. O fluxo padrão é estritamente determinístico e executado via script local em Python.

### Regra 2: Arquitetura Híbrida (Root Next.js + Engine Python Isolada)
- **Frontend Vercel (Next.js 15 + TypeScript + TailwindCSS)**: Localizado na **raiz do repositório**. Consome os dados e imagens estáticas de `public/questoes/` e `public/data/exams.json` de forma ultra-rápida, sem dependência de runtime Python em produção.
- **Engine Local (Python)**: Localizada em `engine/`. Responsável por ler os PDFs em `provas/`, renderizar páginas a 300 DPI, segmentar colunas/páginas, remover rascunhos ("Área Livre") e gerar a tríade `{id_questao}.png`, `{id_questao}.json`, `{id_questao}.txt` em `public/questoes/{id_prova}/`.

### Regra 3: Geometria e Layout das Provas ENADE
- **Identificadores Únicos**:
  - `id_prova`: Formato `{ano}_{curso}` (ex: `2014_CCP`, `2021_ADS`, `2024_CCP`). Nunca use apenas o ano como chave primária.
  - `id_questao`: Formato `qd01..qd10` para Discursivas e `q01..q80` para Objetivas.
- **Detecção de Colunas e Remoção de Ruído**:
  - Cabeçalhos superiores ($y < 55\text{ pt}$) e rodapés ($y > \text{altura} - 45\text{ pt}$) devem ser descartados na segmentação.
  - Páginas de 2 colunas devem respeitar a ordem de leitura: Coluna Esquerda $\to$ Coluna Direita $\to$ Próxima Página.
  - Questões com parágrafos que cruzam mais de 55% da largura da folha (como questões discursivas) devem ser tratadas como **largura total (1 coluna)**, mesmo se houver números de rascunho curtos na margem.
  - Blocos de `"ÁREA LIVRE"` e `"RASCUNHO"` devem ser aparados pelo `png_generator.py` para não gerar espaços vazios no slide.
- **Decodificação CMap**:
  - Provas como `2014` e `2017` contêm caracteres corrompidos no PDF nativo. Sempre passe os textos pela função `decode_enade_str()`.

---

## 3. Estrutura de Diretórios

```text
/
├── AGENTS.md                  # Este documento (leitura mandatória)
├── README.md                  # Documentação do projeto para o GitHub
├── todo.md                    # Roadmap de tarefas e status de execução
├── package.json               # Next.js 15 (Deploy Root no Vercel)
├── next.config.ts             # Configurações do Next.js
├── tsconfig.json              # Configuração TypeScript
├── tailwind.config.ts         # Estilos Tailwind CSS
├── provas/                    # PDFs originais do ENADE (mantidos)
├── public/                    # Arquivos estáticos servidos pelo Next.js / Vercel
│   ├── data/exams.json        # Catálogo mestre de questões
│   └── questoes/              # PNGs 300 DPI, full-pages e metadados JSON
├── src/                       # Frontend Next.js 15 App Router
│   ├── app/                   # Rotas da aplicação (Home, Curso, Temas, Docente, Admin)
│   ├── components/            # PresentationViewer, CourseGallery, TagEditor
│   └── lib/                   # Taxonomia temática e store local
└── engine/                    # Motor de Processamento Offline Python
    ├── requirements.txt       # Dependências Python
    ├── run_processing.py      # Pipeline de extração local
    ├── src/enade/             # Módulos Python (extractor, converter, classifier)
    └── tests/                 # Suíte pytest (33 testes)
```

---

## 4. Checklist para Novas Alterações
Antes de submeter ou finalizar qualquer alteração:
1. Verifique se os testes automatizados continuam passando:
   ```bash
   .venv/bin/pytest engine/tests/ -v
   ```
2. Verifique se o build do Next.js passa sem erros:
   ```bash
   npm run build
   ```
3. Garanta que a integridade dos metadados JSON (`id_prova`, `id_questao`, `tipo`, `categorias`, `confianca`) seja preservada.
