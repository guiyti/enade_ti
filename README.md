# 🎓 ENADE TI — Banco Visual de Questões & Plataforma de Ensino

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Hosted-brightgreen?style=flat-square&logo=vercel)](https://vercel.com/)
[![Python 3.10+](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square&logo=python)](https://python.org/)
[![PyMuPDF & OpenCV](https://img.shields.io/badge/Processing-100%25%20Offline-orange?style=flat-square)](file:///src/enade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

O **ENADE TI** é um sistema completo de extração geométrica determinística e plataforma web interativa para provas oficiais do **ENADE** nos cursos de **Ciência da Computação (CCP)**, **Análise e Desenvolvimento de Sistemas (ADS)** e **Gestão da Tecnologia da Informação (GTI)**.

O projeto recorta mais de **600 questões individuais** (Discursivas e Objetivas) em **PNGs de alta resolução (300 DPI)** e as disponibiliza em uma aplicação web moderna (hospedada no **Vercel**), pronta para projeção em sala de aula e auditoria pedagógica.

---

## 🌟 Principais Funcionalidades

### 👨‍🏫 1. Portal do Docente (Modo Aula & Projeção)
- **Navegação Guiada por Curso**: Escolha seu curso de atuação (**CCP**, **ADS** ou **GTI**) e acesse as disciplinas nativas da grade curricular.
- **Questões Correlatas (Cross-Course)**: Visualize questões aplicadas em outros cursos do mesmo tema (ex: utilizar uma questão de Banco de Dados de ADS 2021 em uma aula de CCP).
- **Modo Apresentação (Slide/Cinema)**: Exibição em tela cheia com fundo escuro, navegação via setas do teclado, zoom fluido em diagramas e atalhos rápidos.
- **📄 Visualizador de Folha Completa (Texto Motivador)**: Botão no slide que abre a folha inteira do PDF original para que o professor e os alunos leiam textos motivadores longos (*"Texto I"*, *"Com base na situação descrita..."*) ou tabelas contextuais anteriores.
- **Busca por Conceitos**: Pesquisa textual instantânea por termos técnicos (*SQL*, *UML*, *Deadlock*, *Grafo*, *Árvore B*, *ITIL*, *Scrum*).

### 🛡️ 2. Painel de Auditoria do Administrador
- **Verificação Lado a Lado**: Compare o recorte em PNG com o texto OCR/nativo extraído do PDF.
- **Editor Interativo de Categorias**: Adicione, remova ou modifique as disciplinas e tags temáticas de cada questão.
- **Relatório de Anomalias**: Alertas visuais para quebras de sequência, imagens pequenas ou score de confiança.

### ✂️ 3. Engine Local de Extração (Python)
- **Zero Consumo de Tokens de IA**: O processamento de PDFs, OCR, decodificação CMap e recorte de imagens é **100% local e offline** (usando `PyMuPDF`, `OpenCV`, `Pillow` e `Tesseract`).
- **Remoção Automática de Rascunhos**: Detecta e elimina o espaço morto de caixas vazias como `"ÁREA LIVRE"` e `"RASCUNHO"`, gerando crops compactos para projetores.
- **Decodificação CMap**: Trata caracteres corrompidos em provas antigas (2014, 2017).

---

## 🏗️ Arquitetura do Sistema

```
                         +-----------------------------------+
                         |    PDFs Oficiais ENADE (provas/)  |
                         +-----------------------------------+
                                           |
                                           v
                         +-----------------------------------+
                         |   Engine Local Python (src/enade) |
                         |   - PyMuPDF / OpenCV / Pillow     |
                         |   - Segmentação de 2 Colunas      |
                         |   - Aparo de "Área Livre/Rascunho"|
                         +-----------------------------------+
                                           |
                                           v
                         +-----------------------------------+
                         |   Tríade de Saída (questoes/)     |
                         |   - q01.png (300 DPI)             |
                         |   - q01.json (Metadados & Tags)   |
                         |   - q01.txt (Texto Decodificado)  |
                         +-----------------------------------+
                                           |
                                           v
                         +-----------------------------------+
                         |   Frontend Web Next.js 15 (web/)  |
                         |   - SSG (1.300+ Páginas Estáticas)|
                         |   - Vercel Deployment Prontos     |
                         +-----------------------------------+
```

---

## 📁 Estrutura de Diretórios

```text
/
├── AGENTS.md                  # Diretrizes mandatórias para agentes de IA
├── README.md                  # Documentação principal do projeto
├── pyproject.toml             # Configurações do projeto e entrypoints Vercel
├── vercel.json                # Instruções de build do Next.js para o Vercel
├── requirements.txt           # Dependências da engine Python
├── provas/                    # PDFs originais das provas ENADE (2005 - 2024)
├── questoes/                  # Recortes PNG (300 DPI), JSONs e TXTs extraídos
├── auditoria/                 # Relatórios consolidados de auditoria
├── Portarias/                 # Documentos normativos e editais oficiais
├── src/                       # Código-fonte da engine Python local
│   └── enade/
│       ├── core/              # Modelos de dados (Exam, Question, Segment)
│       ├── processing/        # Pipeline (converter, extractor, png_generator, topic_classifier)
│       └── auditoria/         # Interface local em FastAPI para conferência rápida
├── tests/                     # Suíte de 33 testes automatizados (pytest)
└── web/                       # Aplicação Web Next.js 15 (Pronta para Vercel)
    ├── public/data/exams.json # Catálogo mestre estático de provas e questões
    ├── public/questoes/       # Symlink / pasta de acesso às imagens estáticas
    └── src/
        ├── app/               # Next.js App Router (Home, Docente, Admin, Curso, Temas)
        ├── components/        # Componentes UI (PresentationViewer, CourseGallery, TagEditor)
        └── lib/               # Helpers de dados e taxonomia temática
```

---

## 🚀 Como Executar Localmente

### 1. Requisitos Prévios
- **Node.js 18+** e **npm**
- **Python 3.10+**
- (Opcional) **Tesseract OCR** instalado no sistema (`brew install tesseract tesseract-lang` no macOS)

---

### 2. Rodar a Aplicação Web (Next.js)

```bash
# Entre na pasta da aplicação web
cd web

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para utilizar o sistema.

---

### 3. Rodar o Pipeline de Extração Python (Opcional - para reprocessar PDFs)

```bash
# Crie e ative o ambiente virtual Python
python3 -m venv .venv
source .venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Execute a suíte de testes unitários e de integração
pytest tests/ -v

# Processe todos os PDFs da pasta provas/
python3 run_processing.py
```

---

## 🌐 Como Fazer Deploy no Vercel

O projeto foi totalmente otimizado para a **Vercel** usando **Gerado Estático de Páginas (SSG)** no Next.js 15.

### Opção A: Importação Direta do Repositório GitHub (Recomendado)

1. No painel da **Vercel**, clique em **Add New... $\to$ Project**.
2. Selecione o repositório **`enade_ti`**.
3. Na tela de configuração do projeto:
   - **Root Directory**: Digite `web`
   - **Framework Preset**: `Next.js`
4. Clique em **Deploy**.

### Opção B: Deploy via Vercel CLI

```bash
# Na raiz do repositório
npx vercel
```

---

## 📚 Taxonomia das Disciplinas Catalogadas

As questões são categorizadas automaticamente com base nas diretrizes curriculares do MEC/INEP para Computação e TI:

- 🗄️ **Banco de Dados** (SQL, Normalização, ACID, DER)
- 🔀 **Algoritmos e Estruturas de Dados** (Árvores, Grafos, Complexidade, Filas/Pilhas)
- 📦 **Engenharia de Software** (Requisitos, Scrum, UML, Design Patterns, Testes)
- 💻 **Programação e POO** (Classes, Polimorfismo, Herança, Concorrência)
- 🌐 **Redes e Segurança** (OSI, TCP/IP, Criptografia, Firewalls)
- ⚡ **Sistemas Operacionais e Arquitetura** (Memória, Deadlocks, Processos, CPU)
- 🛡️ **Governança e Gestão de TI** (ITIL, COBIT, LGPD, SLA, PMBOK)
- 🖥️ **Teoria da Computação e Compiladores** (Autômatos, Gramáticas, Lex/Yacc)
- 🧠 **Inteligência Artificial e Dados** (Machine Learning, Mineração de Dados, Redes Neurais)
- 🌍 **Formação Geral e Sociedade** (Ética, Sustentabilidade, Direitos Humanos)

---

## 📄 Licença

Este projeto está licenciado sob a Licença **MIT**. As provas originais do ENADE são de domínio público e de propriedade intelectual do **INEP / Ministério da Educação (MEC)**.