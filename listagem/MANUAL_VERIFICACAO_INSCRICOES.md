# Manual Definitivo: Sistema de Verificação de Inscrição ENADE
> **Guia Rápido e Documentação Técnica para Atualizações Futuras**  
> *Destinado a coordenadores, professores e administradores do ENADE Hub.*

---

## 1. O Que É Este Sistema e Como Ele Funciona?

O sistema permite que qualquer estudante acesse `https://enade-ti.vercel.app/inscricao`, digite seu CPF e saiba instantaneamente se está convocado para o ENADE deste ciclo ou não.

### Por que NÃO usamos Banco de Dados? (Arquitetura Zero-DB)
- **Zero Custo e Manutenção:** Não há banco PostgreSQL, Supabase ou MySQL para cair, expirar senha ou pagar mensalidade.
- **Velocidade Extrema:** A verificação roda em uma função Serverless no Vercel em menos de **10 milissegundos** via busca $O(1)$ em memória.
- **Totalmente Estático no Repositório:** A lista de alunos fica salva em um arquivo JSON criptografado (`src/data/inscricoes_hashes.json`).

### Como Garantimos a Privacidade dos Alunos? (Conformidade com a LGPD)
O CPF é um dado pessoal sensível. **NUNCA** salvamos o número do CPF em texto aberto no sistema.
1. Pegamos apenas os 11 números do CPF (exemplo: `24001250829`).
2. Juntamos com uma palavra-chave secreta institucional chamada **Sal (Salt)**:
   `"24001250829_ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT"`
3. Calculamos o **Hash Criptográfico SHA-256**:
   `38d5b201320f281ea610c4a9fc18b3405a1fbe94a331f4ec7f4711db3e5fc516`
4. Esse hash é armazenado em `src/data/inscricoes_hashes.json` no lado do servidor.
5. O arquivo fica dentro de `src/data/` (**nunca na pasta pública `public/`**). Nenhum usuário ou robô da internet consegue baixar a lista de alunos ou descobrir quem são os inscritos por força bruta.

---

## 2. Cenário Futuro 1: "Eu tenho APENAS uma lista de CPFs (sem planilhas complexas)"

Este é o cenário mais comum: a coordenação te enviou uma lista no WhatsApp, Word ou um arquivo `.txt` ou `.csv` simples contendo apenas os CPFs dos alunos.

### Passo 1: Salve os CPFs em um arquivo de texto
Crie um arquivo chamado `meus_cpfs.txt` (pode ser na raiz ou em `listagem/`).  
Cole os CPFs lá, um por linha. Não importa se têm pontos, traços ou espaços — o script limpa tudo automaticamente:
```text
240.012.508-29
241.542.728-45
49572112805
422.822.738-42
```

### Passo 2: Execute o comando mágico
Abra o terminal no projeto e execute:
```bash
python3 engine/tools/atualizar_inscritos.py --cpfs meus_cpfs.txt
```

Pronto! O script vai:
1. Extrair os números de cada CPF.
2. Descartar linhas vazias ou inválidas.
3. Calcular os hashes com o sal institucional.
4. Salvar tudo automaticamente em `src/data/inscricoes_hashes.json`.

*(Opcional)* Se quiser personalizar o curso e campus padrão exibido na tela do aluno:
```bash
python3 engine/tools/atualizar_inscritos.py --cpfs meus_cpfs.txt --sigla-padrao ADS --campus-padrao "São Miguel"
```

---

## 3. Cenário Futuro 2: "Recebi novos arquivos CSV oficiais com todas as colunas"

Se a instituição ou o Inep fornecer a pasta completa de arquivos CSV com colunas oficiais (`Código da IES; Nome da IES; ... ; CPF; ...`):

1. Coloque os arquivos `.csv` dentro da pasta:
   ```text
   listagem/veteranos/
   ```
2. Execute o comando:
   ```bash
   python3 engine/tools/atualizar_inscritos.py --modo csv
   ```
3. O script irá:
   - Ler todos os CSVs da pasta com detecção automática da coluna de CPF.
   - Gerar o arquivo único consolidado em `listagem/veteranos_consolidado.csv`.
   - Atualizar a base de consulta em `src/data/inscricoes_hashes.json`.

---

## 4. Como Colocar as Alterações no Ar (Deploy no Vercel)

Após rodar o script e gerar o novo `src/data/inscricoes_hashes.json`, basta enviar para o GitHub:

```bash
git add listagem/ src/data/inscricoes_hashes.json
git commit -m "feat: atualiza listagem de inscritos ENADE"
git push origin main
```

O Vercel detecta o push e faz o deploy em cerca de **1 minuto**. A partir daí, qualquer aluno que consultar o CPF já verá o status atualizado!

---

## 5. Onde Fica Cada Coisa no Código? (Mapa de Arquivos)

| Arquivo / Pasta | Para que serve? |
| :--- | :--- |
| `engine/tools/atualizar_inscritos.py` | **Script principal** para atualizar inscritos via CSV ou lista de CPFs. |
| `src/data/inscricoes_hashes.json` | **Base de dados privada** contendo apenas os hashes criptografados dos inscritos. |
| `src/app/api/check-inscricao/route.ts` | **API Serverless** que valida o CPF digitado pelo aluno e busca o hash. |
| `src/components/InscricaoVerifier.tsx` | **Interface visual do aluno**, formulário com máscara de CPF e cards informativos. |
| `src/app/inscricao/page.tsx` | **Página da rota `/inscricao`** com SEO e metadados. |
| `src/components/Navbar.tsx` | **Menu do site (Header)** com o botão *Verificar Inscrição*. |
| `listagem/veteranos_consolidado.csv` | Arquivo CSV único com todos os dados mesclados dos campi. |

---

## 6. O Que o Aluno Vê na Tela? (Regras de Negócio)

### Situação A: Aluno Inscrito (`inscrito: true`)
Aparece um card verde com as seguintes orientações:
1. **Confirmação:** Confirmação com nome do curso, campus e município de prova oficial.
2. **Aviso Mandatório do Questionário do Estudante:**
   - Alerta destacado de que o preenchimento do Questionário no portal do Inep (`https://enade.inep.gov.br/`) é **obrigatório por lei**. Sem ele, o aluno não cola grau nem retira o diploma.
3. **Local de Prova:**
   - Orienta que, se já preencheu o questionário, o estudante deve acompanhar periodicamente o portal do ENADE para imprimir o *Cartão de Confirmação de Inscrição* com o local e sala da prova.
4. **Atalhos de Estudo:** Links para o guia da prova (`/capacitacao`) e quizzes semanais (`/sorteio`).

### Situação B: CPF Não Localizado (`inscrito: false`)
Aparece um card explicativo informando que o aluno não está previsto para realizar o ENADE neste ciclo.  
Se o aluno acreditar que está no último semestre e deveria estar na lista, o sistema instrui 3 passos:
1. **Passo 1 (Histórico Escolar):** Acessar `Portal do Aluno > Emissão de Documentos > Histórico Escolar` e conferir se há pendências de disciplinas, dependências ou horas de Atividades Complementares faltantes.
2. **Passo 2 (CAA Online):** Abrir protocolo no CAA Online pela opção `'Esclarecimentos Sobre o Enade > Solicitação - Enade'`.
3. **Passo 3 (Assessoria Acadêmica):** Se persistirem dúvidas, procurar a assessoria acadêmica do campus para auditoria presencial/remota do histórico.

---

## 7. Perguntas Frequentes (FAQ)

### E se um novo aluno foi inscrito de última hora?
Basta criar um arquivo de texto com o CPF dele e rodar o script:
```bash
python3 engine/tools/atualizar_inscritos.py --cpfs novo_aluno.txt
```
Depois faça o `git push origin main`.

### Onde fica o Sal Secreto (SALT)?
O sal padrão está definido no código do script e na API como `"ENADE_2026_CRUZEIRO_DO_SUL_TI_HASH_SALT"`.  
Se quiser alterá-lo por segurança através de variável de ambiente, configure `ENADE_CPF_SALT` no painel de configurações do Vercel e no ambiente local.

### Como testar se a verificação está funcionando localmente?
1. Execute `npm run dev` no terminal.
2. Abra `http://localhost:3000/inscricao` no navegador.
3. Digite um CPF de teste da lista (ex.: `240.012.508-29`) para ver o status de inscrito.
4. Digite um CPF qualquer válido (ex.: `111.444.777-35`) para ver as orientações de não inscrito.
