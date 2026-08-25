# Diretrizes Arquiteturais e Boas Práticas

## 1. Stack Tecnológica
- **Frontend / Produção Web**: Next.js 15 (App Router) + TypeScript + TailwindCSS + Lucide Icons (Deploy no Vercel).
- **Processamento Offline**: Python 3.10+ (PyMuPDF, OpenCV, Pillow, Pytesseract, FastAPI para auditoria local).
- **Armazenamento**: GitHub (repositório Git com dados e PNGs estáticos em `public/questoes/`).

## 2. Padrões de Código Python (engine/src/enade)
- Tipagem estática com `typing` (Pydantic / dataclasses).
- Testes automatizados obrigatórios em `engine/tests/` usando `pytest`.
- Resolução de caminhos com `pathlib.Path`.
- Nomes de provas no formato padronizado `{ano}_{curso}` (ex: `2024_CCP`).

## 3. Padrões de Código Frontend (src/)
- Componentes modulares, acessíveis e responsivos.
- Modo apresentação imersivo com zoom, navegação por teclado e visualizador de folha completa.
- Estilos TailwindCSS consistentes com temas escuro/claro.
