# TODO List: Sistema ENADE (Pipeline & Frontend Vercel)

Este documento rastreia a execução passo a passo do projeto.

---

## 📋 Status das Etapas

- [x] **Etapa 1: Documentação Mandatória e Regras para Agentes de IA**
  - [x] **Tarefa 1.1**: Criar `AGENTS.md` com diretrizes de leitura obrigatória e restrição de tokens.
  - [x] **Tarefa 1.2**: Criar regra contextual em `.agents/rules/01-architecture-guidelines.md`.
  - [x] **Tarefa 1.3**: Atualizar o `README.md` com a visão da arquitetura híbrida (Python Engine local + Next.js Vercel).

- [x] **Etapa 2: Correção dos Casos Especiais de Layout e Motor de Crop (Python)**
  - [x] **Tarefa 2.1**: Aprimorar `detect_page_columns()` (resolver recorte de folha inteira para `2005_CCP` QD10).
  - [x] **Tarefa 2.2**: Suporte a marcadores com espaçamento legados (`DISC URSIVA`).
  - [x] **Tarefa 2.3**: Gerar catálogo consolidado `exams.json`.
  - [x] **Tarefa 2.4**: Reprocessar as 13 provas e validar suíte `pytest`.

- [x] **Etapa 3: Criação da Aplicação Web em Next.js para Deploy no Vercel**
  - [x] **Tarefa 3.1**: Projeto Next.js 15 (TypeScript + TailwindCSS + Lucide Icons) em `web/`.
  - [x] **Tarefa 3.2**: Configurar leitura e roteamento dos dados estáticos.
  - [x] **Tarefa 3.3**: Layout global, tema moderno e navegação.

- [x] **Etapa 4: Implementação do Perfil de Administrador (Auditoria & Moderação)**
  - [x] **Tarefa 4.1**: Dashboard do Administrador com métricas e status.
  - [x] **Tarefa 4.2**: Listagem e filtros de questões por prova.
  - [x] **Tarefa 4.3**: Tela de auditoria detalhada da questão com editor de categorias.

- [x] **Etapa 5: Implementação do Perfil de Docente (Sala de Aula & Apresentação)**
  - [x] **Tarefa 5.1**: Catálogo do Docente e busca textual por conceitos.
  - [x] **Tarefa 5.2**: **Modo Apresentação (Slide View)** em tela cheia com navegação por teclado ($\leftarrow / \rightarrow$), zoom interativo e painel de tags.
  - [x] **Tarefa 5.3**: Visualização limpa focada 100% no crop PNG para sala de aula.

- [x] **Etapa 6: Classificação Temática por Disciplinas / Áreas Curriculares (CCP, ADS, GTI)**
  - [x] **Tarefa 6.1**: Criação do módulo `topic_classifier.py` com 10 grandes áreas do conhecimento (Banco de Dados, Algoritmos, Engenharia de Software, POO, Redes, Sistemas Operacionais, Governança, etc.).
  - [x] **Tarefa 6.2**: Classificação automática de todas as 630 questões em `questoes/exams.json` e `web/public/data/exams.json`.
  - [x] **Tarefa 6.3**: Redesign do Portal e Catálogo Docente centrado em **Áreas do Conhecimento** (`/docente/temas/[categoria]`).
  - [x] **Tarefa 6.4**: Componente `TagEditor.tsx` e store de persistência local para docentes e administradores adicionarem, removerem ou criarem novas categorias.
  - [x] **Tarefa 6.5**: Build estático Next.js aprovado (1.304 páginas estáticas geradas com sucesso).
