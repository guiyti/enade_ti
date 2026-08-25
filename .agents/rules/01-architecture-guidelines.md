---
description: Diretrizes obrigatórias de arquitetura, pipeline de extração e regras de layout do sistema ENADE.
globs: "**/*"
---

# Regras de Arquitetura do Sistema ENADE

1. **Leitura Obrigatória**:
   - Todo agente deve consultar [AGENTS.md](file:///Users/guiyti/Desktop/ENADE/AGENTS.md) e [todo.md](file:///Users/guiyti/Desktop/ENADE/todo.md) antes de alterar qualquer código ou pipeline.

2. **Processamento 100% Local**:
   - A extração é executada localmente via PyMuPDF e OpenCV sem enviar imagens/PDFs a APIs de IA externas para evitar consumo excessivo de tokens.

3. **Arquitetura Híbrida**:
   - A extração é executada pelo motor Python em `src/enade/`.
   - A interface de usuário para produção e visualização é a aplicação web Next.js em `web/`, projetada especificamente para deploy no Vercel.

4. **Identificadores e Nomenclatura**:
   - Provas são identificadas por `id_prova` (ex: `2014_CCP`, `2021_ADS`, `2024_CCP`).
   - Questões usam prefixo `qd` para Discursivas (`qd01..qd10`) e `q` para Objetivas (`q01..q80`).

5. **Qualidade Geométrica e Sem Ruído**:
   - O recorte de questões multi-coluna ou multi-página deve descartar cabeçalhos ($y < 55\text{ pt}$) e rodapés ($y > \text{height} - 45\text{ pt}$).
   - Páginas onde o texto principal tem largura $> 55\%$ da folha devem ser tratadas como 1 coluna (largura total), ignorando números curtos de linhas de rascunho.
