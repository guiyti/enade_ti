# 💻 Mapeamento Técnico e Pedagógico da Sala Blackboard Ultra

> **Identificador do Curso Exportado:** `ana_des_sis_cruzeiro_enade_20261`  
> **Nome da Oferta:** Central ENADE 2026 (ADS)  
> **Padrão:** Blackboard Learn Ultra SaaS (IMS Content Packaging 1.2)

---

## 1. Árvore de Conteúdo Visível para o Aluno (Menu do Curso / TOC)

O arquivo [`imsmanifest.xml`](file:///Users/guiyti/Desktop/ENADE/Portarias/ArchiveExFile_ana_des_sis_cruzeiro_enade_20261_20260828041132/imsmanifest.xml) estrutura os módulos de aprendizagem e pastas visíveis para o aluno:

```text
📁 ROOT (Área Principal do Curso)
│
├── 📂 Comece Por Aqui (Ações Obrigatórias) [res00018.dat + thumbnail.png]
│   ├── 📄 ENADE? O que é isso? [res00025.dat]
│   │   └── 📑 ultraDocumentBody [res00032.dat -> UNSAFE_HTML_20260828161012.html (enade.html)]
│   ├── 📄 Passo a Passo: Como preencher o Cadastro e o Questionário [res00026.dat]
│   │   └── 📑 ultraDocumentBody [res00033.dat]
│   └── 🔗 Sistema ENADE - INEP [res00029.dat -> enade.inep.gov.br]
│
├── 📂 Treinos e Pílulas de Conhecimento (Microlearning) [res00019.dat + thumbnail.png]
│   ├── 📄 Formação Geral [res00023.dat]
│   └── 📄 Formação Específica do Curso [res00027.dat]
│
├── 📂 Dúvidas Frequentes [res00020.dat + thumbnail.png]
│   ├── 🔗 Canal oficial do WhatsApp para comunicações rápidas. [res00022.dat]
│   ├── 📄 FAQ [res00028.dat]
│   │   └── 📑 ultraDocumentBody [res00031.dat -> UNSAFE_HTML_20260828161041.html (faq.html)]
│   └── 🔗 Edital Oficial [res00030.dat -> mecnormas.mec.gov.br]
│
└── 📂 O Dia da Prova [res00021.dat + thumbnail.png]
    └── 🔗 Consulta ao local de prova / Cartão de Confirmação de Inscrição [res00024.dat]
```

---

## 2. Conteúdos HTML Customizados Embutidos no Blackboard

Para proporcionar uma experiência visual moderna e evitar páginas estáticas sem vida, o Blackboard Ultra consome páginas HTML estilizadas embutidas como blocos de documento:

1. **`enade.html` (Guia "ENADE? O que é isso?")**:
   - Localização no arquivo Blackboard: `csfiles/home_dir/__xid-335673108_1/.../__xid-335686127_1.html`
   - Descrição: Guia interativo explicando as regras gerais, obrigatoriedade para emissão do diploma, divisão da prova e passo a passo inicial.

2. **`faq.html` (FAQ Interativo)**:
   - Localização no arquivo Blackboard: `csfiles/home_dir/__xid-335673108_1/.../__xid-335686132_1.html`
   - Descrição: Central de respostas com acordeão interativo cobrindo as 15 principais dúvidas (dispensa, faltas, horários, documento oficial, atendimento especializado e questionário do estudante).

3. **`infografico_enade.html` / `infografico_enade_2026.png`**:
   - Infográfico visual de alta resolução com mapa de etapas da jornada do estudante, métricas e checklist do dia da prova.

---

## 3. Mapeamento de Recursos (`.dat`)

* **`res00001.dat` a `res00004.dat`**: Configurações gerais da disciplina, título, regras de navegação e tema.
* **`res00005.dat`, `res00006.dat`, `res00007.dat`**: Estruturas dos nós do sumário (Root, Interactive, Indirect).
* **`res00008.dat`**: Manipuladores de conteúdo (Content Handlers).
* **`res00009.dat` e `res00010.dat`**: Catálogo de usuários (estudantes e docentes) e inscrições no curso.
* **`res00011.dat` a `res00014.dat`**: Avisos oficiais do mural do Blackboard.
* **`res00018.dat` a `res00021.dat`**: Pastas principais com miniaturas personalizadas (`thumbnail.png`).
* **`res00022.dat`, `res00024.dat`, `res00029.dat`, `res00030.dat`**: Links externos oficiais (WhatsApp, INEP, Edital).
* **`res00037.dat` e `res00039.dat`**: Livro de notas e registros de rastreamento estatístico de acessos dos alunos.
