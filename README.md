# Reciclagem Solidária — Fatec Franco da Rocha

Plataforma web para apoio tecnológico e conexão entre a Fatec Franco da Rocha e catadores autônomos de resíduos recicláveis.

## 🚀 Arquitetura & Tecnologia

- **Frontend:** HTML5, CSS3 vanilla (Design Tokens + Layout Responsivo), JavaScript puro (ES6 modules). Sem bundlers, sem frameworks, sem `package.json`.
- **Backend (BaaS):** Supabase (Authentication, PostgreSQL Database com RLS, Storage, Realtime).
- **Conectividade:** Módulo oficial `@supabase/supabase-js` via CDN jsDelivr.

---

## 📁 Estrutura de Pastas

```
/
├── assets/
│   └── prototypes/           # Protótipos visuais de referência (JPG/PNG)
├── css/
│   ├── design-tokens.css     # Cores e variáveis centrais do projeto
│   └── style.css             # Estilos compartilhados e layout shell
├── js/
│   ├── lib/
│   │   ├── supabaseClient.js # Cliente configurado do Supabase
│   │   └── routeGuard.js     # Proteção de rotas por perfil
│   ├── services/
│   │   ├── auth.js           # Serviços de Autenticação e Perfis
│   │   ├── materiais.js      # Catálogo e ofertas de materiais
│   │   ├── coletas.js        # Gestão de ofertas e agendamentos
│   │   └── agenda.js         # Horários e disponibilidades
│   └── pages/                # Lógica JS de cada tela
├── pages/                    # Arquivos HTML das telas do sistema
├── db/
│   └── schema.sql            # Script DDL consolidado (Tabelas, RLS, RPCs, Seeds)
├── index.html                # Ponto de entrada / Landing
└── projeto_escrito/          # Documentação oficial, histórico, roteiros, testes e protótipos
    ├── HISTORICO_ALTERACOES_IA.md
    ├── NOTAS_PENDENCIAS.md
    ├── PLANO_DE_TESTES_QA.md
    ├── PLANO_DE_TESTES_QA.pdf
    ├── PI FINAL RESÍDUOS RECICLÁVEIS.pdf
    ├── prototipo_nao_funcional/  # Protótipos não-funcionais originais (HTML/CSS)
    ├── roteiro_desenvolvimento_reciclagem_solidaria.md
    └── tarefas_desenvolvimento_reciclagem_solidaria.md
```

---

## ⚙️ Como Rodar Localmente

1. **Servidor Local Estático:**
   Como o projeto utiliza ES6 modules (`import/export`), é necessário servi-lo por meio de um servidor HTTP estático (não abra direto via `file://`).
   - **Opção A (VSCode):** Instale a extensão **Live Server**, abra a pasta do projeto e clique em "Go Live".
   - **Opção B (Python):** `python -m http.server 8080` na raiz do repositório.
   - **Opção C (Node / npx):** `npx serve .`

2. **Banco de Dados (Supabase):**
   - Acesse o painel do Supabase no projeto configurado.
   - Abra o **SQL Editor**.
   - Cole o conteúdo completo de [`db/schema.sql`](file:///c:/Users/ThamiresCezar/Downloads/Reciclagem_Solidaria%20-%20Antigravity/db/schema.sql) e clique em **Run**.

---

## 🔑 Criação do Administrador Inicial

1. No painel do Supabase, vá em **Authentication -> Users** e clique em **Add User** -> **Create User**.
2. Preencha e-mail e senha. Copie o `UUID` gerado para o usuário.
3. No **SQL Editor**, execute:
   ```sql
   insert into public.cidadao (id, nome, email, nivel_acesso, situacao)
   values ('COLE_O_UUID_AQUI', 'Nome do Administrador', 'email_admin@fatec.sp.gov.br', 'administrador', 'ativo');
   ```

---

## 📄 Documentação & Plano de Testes

Consulte a pasta [`projeto_escrito/`](file:///c:/Users/ThamiresCezar/Downloads/Reciclagem_Solidaria%20-%20Antigravity/projeto_escrito):
- [`PLANO_DE_TESTES_QA.pdf`](file:///c:/Users/ThamiresCezar/Downloads/Reciclagem_Solidaria%20-%20Antigravity/projeto_escrito/PLANO_DE_TESTES_QA.pdf): Guia consolidado de homologação e validação de requisitos para QA.
- [`HISTORICO_ALTERACOES_IA.md`](file:///c:/Users/ThamiresCezar/Downloads/Reciclagem_Solidaria%20-%20Antigravity/projeto_escrito/HISTORICO_ALTERACOES_IA.md): Registro e rastreabilidade de todas as modificações técnicas.
- [`roteiro_desenvolvimento_reciclagem_solidaria.md`](file:///c:/Users/ThamiresCezar/Downloads/Reciclagem_Solidaria%20-%20Antigravity/projeto_escrito/roteiro_desenvolvimento_reciclagem_solidaria.md): Especificação técnica e arquitetural da aplicação.
