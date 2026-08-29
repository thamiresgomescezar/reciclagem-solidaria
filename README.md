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
├── NOTAS_PENDENCIAS.md       # Log de decisões e pendências
└── TESTES.md                 # Registro de testes e validação de segurança
```

---

## ⚙️ Como Rodar Localmente

1. **Servidor Local Estático:**
   Como o projeto utiliza ES6 modules (`import/export`), é necessário servi-lo por meio de um servidor HTTP estático (não abra direto via `file://`).
   - **Opção A (VSCode):** Instale a extensão **Live Server**, abra a pasta do projeto e clique em "Go Live".
   - **Opção B (Python):** `python -m http.server 8080` na raiz do repositório.
   - **Opção C (Node / npx):** `npx serve .`

2. **Banco de Dados (Supabase):**
   - Acesse o painel do Supabase no projeto configurado (`https://yylmaujpcbqtabrnrkpi.supabase.co`).
   - Abra o **SQL Editor**.
   - Cole o conteúdo completo de [`db/schema.sql`](file:///c:/Users/ThamiresCezar/Downloads/espec%20-%20Antigravity/db/schema.sql) e clique em **Run**.

---

## 🔑 Criação do Administrador Inicial

1. No painel do Supabase, vá em **Authentication -> Users** e clique em **Add User** -> **Create User**.
2. Preencha e-mail e senha (ex.: `admin@fatec.sp.gov.br`). Copie o `UUID` gerado para o usuário.
3. No **SQL Editor**, execute:
   ```sql
   insert into public.cidadao (id, nome, email, nivel_acesso, situacao)
   values ('COLE_O_UUID_AQUI', 'Administrador Fatec', 'admin@fatec.sp.gov.br', 'administrador', 'ativo');
   ```

---

## 📄 Fonte de Verdade

Este projeto é desenvolvido estritamente de acordo com as especificações em:
- [`roteiro_desenvolvimento_reciclagem_solidaria.md`](file:///c:/Users/ThamiresCezar/Downloads/espec%20-%20Antigravity/roteiro_desenvolvimento_reciclagem_solidaria.md)
- [`tarefas_desenvolvimento_reciclagem_solidaria.md`](file:///c:/Users/ThamiresCezar/Downloads/espec%20-%20Antigravity/tarefas_desenvolvimento_reciclagem_solidaria.md)
