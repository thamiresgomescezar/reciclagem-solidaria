# Roteiro de Desenvolvimento — Sistema Reciclagem Solidária

**Baseado em:** "Resíduos Recicláveis na Fatec Franco da Rocha: proposta de software para apoio tecnológico à catadores autônomos"
**Stack:** HTML + CSS + JavaScript puro (sem framework/bundler) + Supabase (Auth, Database, Storage, Realtime)
**Status:** decisões de arquitetura fechadas — pronto para iniciar a Fase 0.

---

## 1. Decisões de arquitetura (fechadas)

| Decisão | Definição |
|---|---|
| Autenticação | Migrar para **Supabase Auth** (`auth.signUp` / `signInWithPassword`). Senha nunca fica em texto puro em tabela própria. |
| Endereço/local de retirada | Tabela própria **`local_retirada`**, desacoplada de `materiais`. Hoje só existe 1 local (Fatec Franco da Rocha), mas a estrutura já suporta expansão futura. |
| `materiais` | Vira **catálogo de tipos** (Papel, Plástico, Vidro, Metal...), reutilizado em cada oferta. Quantidade e foto pertencem à oferta (`coleta`), não ao tipo. |
| Dados atuais no Supabase | Só dados de teste — **schema será recriado do zero**, sem necessidade de migração. |
| Endereço de Cidadão/Catador | **Obrigatório** para ambos, em campos estruturados (rua, número, bairro, cidade, estado, CEP) + opção "não possuo residência". Alimenta relatórios geográficos do admin. |
| Cadastro de Catador sem app | Catador pode ser **cadastrado por um Cidadão ou pelo Admin**, sem precisar de login próprio — passa a receber coletas mesmo sem nunca acessar o app. |

---

## 2. Design tokens extraídos dos protótipos

Cores obtidas por amostragem direta das imagens (Google Stitch), não estimadas:

```css
:root {
  --verde-marca:      #33cc33; /* logo, títulos, ícones de destaque */
  --verde-botao:      #7ccf75; /* botões pílula, CTAs */
  --verde-fundo-1:     #e3f4e2; /* painel decorativo web */
  --verde-fundo-2:     #ecf8ec; /* fundo geral mobile */
  --verde-fundo-3:     #e5f6e4; /* fundo geral mobile alternativo */
  --branco:            #ffffff; /* área de conteúdo/formulário */
  --cinza-texto-aux:   #8a8a8a; /* textos auxiliares ("clique aqui para selecionar") */
  --raio-pilula:       999px;   /* botões e inputs em formato cápsula */
}
```

**Padrão de layout — Web:** painel esquerdo (~35%, fundo `--verde-fundo-1` com marca d'água de ícones de reciclagem, contém logo + navegação/CTA) + painel direito (~65%, foto de catadores com gradiente diagonal verde sobreposto) + corte diagonal entre os dois painéis + menu hambúrguer fixo (top-left) + ícones de redes sociais fixos (bottom-right). Esse "shell" se repete em todas as telas web — só o conteúdo do painel esquerdo muda.

**Padrão de layout — Mobile:** tela cheia, fundo `--verde-fundo-2`/`--verde-fundo-3` com marca d'água de ícones, barra de status mockada no topo (é arte do protótipo, **não deve ser codada** — o navegador/app já tem a barra real), navbar inferior fixa com 3 ícones (folha/home, símbolo de reciclagem/hub central, hambúrguer/menu).

**Componentes reutilizáveis:**
- Botão primário: pílula preenchida `--verde-botao`, texto branco em negrito, centralizado
- Input web: pílula preenchida clara com label interno ("clique aqui para selecionar")
- Input mobile: campo com apenas traço inferior (mais minimalista que o web)
- Card ícone+label: quadrado arredondado, ícone line-art verde, label abaixo em verde escuro negrito, usado em grid 2 colunas nos dashboards
- Senha: usar `<input type="password">` nativo (os losangos ♦ do protótipo são estilo visual, não é necessário replicar o glifo exato — evita CSS/JS extra sem necessidade)

---

## 3. Inventário de telas

| Tela | Status | Observações para quem for desenvolver |
|---|---|---|
| Splash/Tela inicial (mobile) | ✅ Desenhada | |
| Login (web e mobile) | ✅ Desenhada | |
| Cadastro (web e mobile) | ✅ Desenhada | web pede e-mail duplicado p/ confirmação; mobile pede endereço direto no cadastro — **ajuste**: como endereço agora é do `cidadao`/perfil e não da coleta, esse campo do mobile pode ser mantido como endereço de referência do usuário (opcional) ou removido, já que o local de retirada real vem de `local_retirada`. Definir na Fase 1. |
| Dashboard Administrador (web) | ✅ Desenhada | grid completo de ícones |
| Dashboard Cidadão Consciente (mobile) | ✅ Desenhada | |
| Dashboard Catador (mobile) | ✅ Desenhada | |
| Inserir/Editar material para retirada (web) | ✅ Desenhada | Esse formulário na prática cria um registro em `coleta` (oferta), não em `materiais`. Como só existe 1 `local_retirada` hoje, o passo "Local de Retirada" pode vir **pré-preenchido/oculto** no MVP em vez de exigir seleção manual — reduz uma etapa sem quebrar o protótipo. |
| Definir agenda (web, popup calendário) | ✅ Desenhada | O gradiente de cores nos dias é decorativo; funcionalmente basta um seletor de dia disponível/indisponível |
| Editar local de retirada (web, mapa) | ✅ Desenhada | Alimenta a tabela `local_retirada` (hoje só 1 registro — Fatec) |
| Dashboard Cidadão (web) | ⚠️ Não desenhada | Derivar do Admin-web removendo os cards exclusivos de admin ("Usuários Cadastrados", "Relatórios" completo, "Editar Local") |
| Dashboard Catador (web) | ⚠️ Não desenhada | Derivar do grid do Catador-mobile, adaptado ao shell web |
| Tela de mensagens / "Contatar Catador" | ⚠️ Não desenhada | Seguir os cards/pílulas já usados; lista de conversas + thread simples |
| Relatórios (admin/catador) | ⚠️ Não desenhada | Tabela/lista dentro do mesmo shell, com filtros em formato pílula |
| "Usuários Cadastrados" (admin) / "Rede Cadastrados" (cidadão) | ⚠️ Não desenhada | Admin vê tudo; cidadão vê um diretório público limitado (nome/telefone de catadores, por ex.) |
| "Quem Somos / Saiba Mais" | ⚠️ Não desenhada | Conteúdo institucional estático, pode ser Markdown renderizado em HTML |
| Subformulário "Informar endereço" | ⚠️ Não desenhada | Modal/etapa própria (não uma linha só) com rua, número, complemento, bairro, cidade, estado, CEP + checkbox "não possuo residência" (oculta os campos de endereço quando marcado). Reaproveitar o estilo de input já usado no Cadastro. |
| Cadastro de Catador por terceiros (Cidadão/Admin) | ⚠️ Não desenhada | Variação da tela de Cadastro, sem os campos de login (e-mail/senha viram opcionais); inclui o mesmo subformulário de endereço |

---

## 4. Schema definitivo (Supabase / Postgres)

> Recriar do zero (dados atuais são só de teste). Rodar via SQL Editor do Supabase.

```sql
-- ==========================================================
-- LIMPEZA (schema atual só tem dados de teste)
-- ==========================================================
drop table if exists public.coleta cascade;
drop table if exists public.materiais cascade;
drop table if exists public.status cascade;
drop table if exists public.cidadao cascade;
drop table if exists public.catador cascade;

-- ==========================================================
-- TABELAS
-- ==========================================================

-- Extensão do auth.users para Cidadão Consciente (inclui Administrador via nivel_acesso)
-- Cidadão sempre tem login próprio (auto-cadastro via app)
create table public.cidadao (
  id uuid primary key references auth.users(id) on delete cascade,
  nome varchar not null,
  telefone varchar,
  email varchar not null,
  rua varchar, numero varchar, complemento varchar,
  bairro varchar, cidade varchar, estado varchar, cep varchar,
  sem_residencia boolean not null default false,
  situacao varchar not null default 'ativo'
    check (situacao in ('ativo','desabilitado','bloqueado')),
  nivel_acesso varchar not null default 'cidadao'
    check (nivel_acesso in ('cidadao','administrador')),
  criado_em timestamptz default now()
);

-- Catador: identidade PRÓPRIA, independente de login.
-- auth_user_id fica null quando o catador é cadastrado por um Cidadão/Admin (sem app);
-- é preenchido se/quando o próprio catador criar uma conta e "assumir" o cadastro.
create table public.catador (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  nome varchar not null,
  telefone varchar,
  email varchar,
  rua varchar, numero varchar, complemento varchar,
  bairro varchar, cidade varchar, estado varchar, cep varchar,
  sem_residencia boolean not null default false,
  situacao varchar not null default 'ativo'
    check (situacao in ('ativo','desabilitado','bloqueado')),
  cadastrado_por uuid references public.cidadao(id), -- quem fez o cadastro (cidadão ou admin); null se autocadastro
  criado_em timestamptz default now()
);

-- Catálogo de tipos de material (lookup, não é a oferta em si)
create table public.materiais (
  cod_material serial primary key,
  tipo varchar not null unique
);

-- Situação da coleta (lookup)
create table public.status (
  cod_status serial primary key,
  status varchar not null unique
);

-- Locais de retirada (hoje só a Fatec; estrutura pronta para expandir)
create table public.local_retirada (
  id uuid primary key default gen_random_uuid(),
  nome varchar not null default 'Fatec Franco da Rocha',
  rua varchar, numero varchar, complemento varchar,
  bairro varchar, cidade varchar, estado varchar, cep varchar,
  latitude numeric, longitude numeric,
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

-- Agenda de dias/horários disponíveis por local
create table public.agenda (
  id uuid primary key default gen_random_uuid(),
  local_retirada_id uuid not null references public.local_retirada(id),
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  disponivel boolean not null default true,
  criado_por uuid references public.cidadao(id)
);

-- Oferta/coleta: entidade central, une material + local + pessoas envolvidas
create table public.coleta (
  cod_coleta uuid primary key default gen_random_uuid(),
  cod_material integer not null references public.materiais(cod_material),
  local_retirada_id uuid not null references public.local_retirada(id),
  cidadao_id uuid not null references public.cidadao(id),
  catador_id uuid references public.catador(id), -- null até ser agendada
  cod_status integer not null references public.status(cod_status),
  agenda_id uuid references public.agenda(id),
  quantidade varchar,        -- quantidade aproximada (texto curto, ex.: "2 sacos")
  foto_url text,
  data date,                  -- data combinada para retirada
  hora time,                  -- hora combinada para retirada
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Comunicação (RF "Permitir Comunicação")
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  coleta_id uuid references public.coleta(cod_coleta),
  remetente_id uuid not null,      -- id de cidadao ou catador (auth.uid())
  destinatario_id uuid not null,
  conteudo text not null,
  enviado_em timestamptz default now(),
  lida boolean default false
);

-- Conteúdo educativo/campanhas do Administrador
create table public.publicacoes (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid not null references public.cidadao(id),
  titulo varchar not null,
  conteudo text not null,
  criado_em timestamptz default now()
);

-- Dados iniciais
insert into public.status (status) values
  ('disponível'), ('agendado'), ('retirado'), ('em aberto'), ('cancelado');

insert into public.materiais (tipo) values
  ('Papel'), ('Plástico'), ('Vidro'), ('Metal'), ('Outros');

insert into public.local_retirada (nome, rua, bairro, cidade, estado)
values ('Fatec Franco da Rocha', 'Endereço a definir', 'Centro', 'Franco da Rocha', 'SP');
```

### 4.1 Row Level Security (RLS)

```sql
alter table public.cidadao enable row level security;
alter table public.catador enable row level security;
alter table public.materiais enable row level security;
alter table public.status enable row level security;
alter table public.local_retirada enable row level security;
alter table public.agenda enable row level security;
alter table public.coleta enable row level security;
alter table public.mensagens enable row level security;
alter table public.publicacoes enable row level security;

-- Helper: verifica se o usuário logado é administrador
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.cidadao
    where id = auth.uid() and nivel_acesso = 'administrador'
  );
$$;

-- Helper: resolve o id do catador vinculado ao usuário autenticado (null se ele não é catador
-- ou é um catador cadastrado por terceiros que nunca criou login próprio)
create or replace function public.catador_id_atual()
returns uuid language sql stable as $$
  select id from public.catador where auth_user_id = auth.uid();
$$;

-- CIDADAO: cada um cria e vê/edita o próprio registro; admin vê tudo
create policy "cidadao self insert" on public.cidadao
  for insert with check (auth.uid() = id);
create policy "cidadao self select/update" on public.cidadao
  for select using (auth.uid() = id or public.is_admin());
create policy "cidadao self update" on public.cidadao
  for update using (auth.uid() = id or public.is_admin());
create policy "cidadao admin delete" on public.cidadao
  for delete using (public.is_admin());

-- CATADOR: autocadastro (auth_user_id = próprio) OU cadastro por Cidadão/Admin (cadastrado_por = quem registra).
-- Leitura pública para autenticados (necessário p/ "Contatar Catador" e diretório).
create policy "catador insert autocadastro ou terceiros" on public.catador
  for insert with check (auth_user_id = auth.uid() or cadastrado_por = auth.uid());
create policy "catador leitura autenticada" on public.catador
  for select using (auth.role() = 'authenticated');
create policy "catador update dono ou quem cadastrou ou admin" on public.catador
  for update using (auth_user_id = auth.uid() or cadastrado_por = auth.uid() or public.is_admin());
create policy "catador admin delete" on public.catador
  for delete using (public.is_admin());

-- MATERIAIS / STATUS / LOCAL_RETIRADA / AGENDA: leitura livre p/ autenticados, escrita só admin
create policy "leitura autenticada materiais" on public.materiais for select using (auth.role() = 'authenticated');
create policy "escrita admin materiais" on public.materiais for all using (public.is_admin());

create policy "leitura autenticada status" on public.status for select using (auth.role() = 'authenticated');
create policy "escrita admin status" on public.status for all using (public.is_admin());

create policy "leitura autenticada local" on public.local_retirada for select using (auth.role() = 'authenticated');
create policy "escrita admin local" on public.local_retirada for all using (public.is_admin());

create policy "leitura autenticada agenda" on public.agenda for select using (auth.role() = 'authenticated');
create policy "escrita admin agenda" on public.agenda for all using (public.is_admin());

-- COLETA: cidadão dono cria/edita a própria oferta; catador vê disponíveis e agenda; admin tudo
create policy "cidadao cria coleta" on public.coleta
  for insert with check (auth.uid() = cidadao_id);
create policy "cidadao ve e edita a propria" on public.coleta
  for select using (auth.uid() = cidadao_id or catador_id = public.catador_id_atual() or public.is_admin());
create policy "cidadao atualiza a propria" on public.coleta
  for update using (auth.uid() = cidadao_id or public.is_admin());
create policy "catador ve disponiveis" on public.coleta
  for select using (auth.role() = 'authenticated');
create policy "admin tudo coleta" on public.coleta
  for all using (public.is_admin());

-- MENSAGENS: só remetente/destinatário
create policy "mensagens participantes" on public.mensagens
  for all using (auth.uid() = remetente_id or auth.uid() = destinatario_id);

-- PUBLICACOES: leitura livre, escrita só admin
create policy "leitura publicacoes" on public.publicacoes for select using (true);
create policy "escrita admin publicacoes" on public.publicacoes for all using (public.is_admin());
```

> ⚠️ **Ponto de atenção técnico:** o agendamento de uma coleta por um Catador (`update coleta set catador_id = auth.uid()`) precisa evitar que **dois catadores agendem a mesma oferta ao mesmo tempo** (condição de corrida). Recomenda-se implementar isso como uma **função Postgres (RPC)** chamada via `supabase.rpc('agendar_coleta', {...})`, que faz o update de forma atômica só quando `catador_id is null`, em vez de um `update` direto pelo cliente. Isso fica detalhado na Fase 3.

```sql
-- ==========================================================
-- TRIGGER: impede que usuário comum altere nivel_acesso
-- (proteção defensiva contra auto-promoção via update direto)
-- ==========================================================
create or replace function public.prevent_self_promote()
returns trigger language plpgsql security definer as $$
begin
  -- Se nivel_acesso está sendo alterado E o usuário não é admin
  if old.nivel_acesso IS DISTINCT FROM new.nivel_acesso
     and not public.is_admin() then
    raise exception 'apenas administradores podem alterar nivel_acesso';
  end if;
  return new;
end;
$$;

create trigger trg_prevent_self_promote
  before update on public.cidadao
  for each row execute function public.prevent_self_promote();
```

### 4.2 Função RPC de agendamento (`agendar_coleta`)

Cobre dois casos: o próprio catador agenda (tem login) **ou** um Cidadão/Admin agenda em nome de um catador sem app (proxy). Executa de forma atômica para evitar duas pessoas agendando a mesma oferta ao mesmo tempo.

```sql
create or replace function public.agendar_coleta(
  p_coleta_id uuid,
  p_catador_id uuid default null, -- informado só quando é agendamento por terceiros
  p_agenda_id uuid default null
)
returns public.coleta
language plpgsql
security definer
as $$
declare
  v_catador_id uuid;
  v_status_agendado int;
  v_resultado public.coleta;
begin
  -- resolve qual catador está sendo agendado
  if p_catador_id is null then
    v_catador_id := public.catador_id_atual();
  else
    -- só pode agendar em nome de outro catador se for quem o cadastrou, ou admin
    if not exists (
      select 1 from public.catador
      where id = p_catador_id
        and (cadastrado_por = auth.uid() or public.is_admin())
    ) then
      raise exception 'sem permissão para agendar em nome deste catador';
    end if;
    v_catador_id := p_catador_id;
  end if;

  if v_catador_id is null then
    raise exception 'catador não identificado';
  end if;

  select cod_status into v_status_agendado from public.status where status = 'agendado';

  update public.coleta
  set catador_id = v_catador_id,
      agenda_id = coalesce(p_agenda_id, agenda_id),
      cod_status = v_status_agendado,
      atualizado_em = now()
  where cod_coleta = p_coleta_id
    and catador_id is null                                   -- ainda não foi agendada por ninguém
    and cod_status = (select cod_status from public.status where status = 'disponível')
  returning * into v_resultado;

  if v_resultado is null then
    raise exception 'oferta indisponível ou já agendada por outra pessoa';
  end if;

  return v_resultado;
end;
$$;
```

Chamada pelo cliente:
```js
// catador se autoagendando
await supabase.rpc('agendar_coleta', { p_coleta_id: coletaId });

// cidadão/admin agendando em nome de um catador sem app
await supabase.rpc('agendar_coleta', { p_coleta_id: coletaId, p_catador_id: catadorId });
```

#### 2. __Função RPC `promover_admin`__ — Forma segura e intencional

```sql
-- ==========================================================
-- RPC: promover cidadão a administrador (apenas admin pode chamar)
-- ==========================================================
create or replace function public.promover_admin(p_cidadao_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin() then
    raise exception 'sem permissão para promover usuário a administrador';
  end if;

  update public.cidadao
  set nivel_acesso = 'administrador'
  where id = p_cidadao_id;

  if not found then
    raise exception 'usuário não encontrado';
  end if;
end;
$$;
```
Chamada pelo agente:
```js
await supabase.rpc('promover_admin', { p_cidadao_id: userId });
```

### 4.3 Configuração do Supabase Auth
- Authentication → Providers → Email: confirmar que o **tamanho mínimo de senha está em 6** (compatível com a senha numérica de 6 dígitos do protótipo)
- Avaliar se a confirmação de e-mail fica ativada (mais fiel ao mundo real) ou desativada (mais simples para testes/piloto acadêmico)
- Bucket de Storage `materiais-fotos`: leitura pública, escrita restrita ao dono do registro relacionado

---

## 5. Fases do desenvolvimento

### Fase 0 — Preparação
- Rodar o script da seção 4 no SQL Editor (schema + RLS + seeds)
- Configurar Supabase Auth (seção 4.2)
- Organizar os arquivos de protótipo recebidos por tela, extrair `design-tokens.css` (seção 2) como arquivo central
- Criar `js/lib/supabaseClient.js` com `createClient(URL, PUBLISHABLE_KEY)`
- Estrutura de pastas: `/assets`, `/css`, `/js/lib`, `/js/pages`, `/js/services`, `/pages`

### Fase 1 — Autenticação e perfis (RF: Manter Usuários / RS: Autenticação, Controle de Acesso)
- Telas de Cadastro/Login replicando os protótipos web e mobile
- Cadastro (autoatendimento): `supabase.auth.signUp` → depois `insert` em `cidadao` ou `catador` (com `auth_user_id` = próprio) conforme opção escolhida
- Subformulário "Informar endereço" (rua, número, complemento, bairro, cidade, estado, CEP + checkbox "não possuo residência"), obrigatório para os dois perfis, reaproveitado em ambos os fluxos de cadastro
- **Novo fluxo — Cadastrar Catador por terceiros:** tela acessível a Cidadão e Admin, sem exigir e-mail/senha do catador; grava direto em `catador` com `cadastrado_por = auth.uid()` e `auth_user_id = null`
- Login: `supabase.auth.signInWithPassword`
- Recuperação de senha (`resetPasswordForEmail`)
- Administrador inicial: criado manualmente em Auth → Users, depois `insert` em `cidadao` com `nivel_acesso = 'administrador'`
- Guarda de rota em JS (checar sessão + tabela/perfil antes de renderizar páginas restritas)

**Pronto quando:** os 3 perfis logam corretamente, um catador sem login consegue ser cadastrado por um cidadão/admin, e páginas restritas bloqueiam acesso indevido.

### Fase 2 — Materiais e ofertas de coleta (RF: Manter Materiais, Notificar Coleta)
- Tela "Inserir material para retirada" (web) grava um registro em `coleta` com status "disponível", usando `cod_material` do catálogo + `local_retirada_id` (pré-preenchido com o único local ativo)
- Upload de foto no bucket `materiais-fotos`
- Painel do Catador lista coletas com status "disponível" (Realtime habilitado na tabela `coleta` para atualização instantânea)

**Pronto quando:** cadastrar uma oferta aparece automaticamente no painel de catadores conectados.

### Fase 3 — Agenda e agendamento (RF: Manter Agenda, Agendar Retirada)
- Admin cadastra/edita/exclui horários em `agenda` (vinculado ao `local_retirada`)
- Catador escolhe uma coleta disponível + horário livre (ou, no caso de catador sem app, o Cidadão/Admin agenda em nome dele)
- Usar a função RPC `agendar_coleta` (seção 4.2) para os dois cenários — nunca `update` direto pelo cliente
- Popup de calendário replicando o visual do protótipo (grade de dias, seleção de horário)

### Fase 4 — Ciclo de vida da coleta (RF: Manter Coletas Retiradas)
- Cidadão confirma retirada (`status = 'retirado'`)
- Reabertura para "em aberto" em caso de atraso/cancelamento
- Admin com poder de editar/confirmar qualquer coleta e gerenciar a lista de `status`

### Fase 5 — Comunicação (RF: Permitir Comunicação)
- Tela "Contatar Catador" / mensagens vinculadas a uma coleta (`mensagens`, Realtime)
- Área de publicações do Admin (`publicacoes`) visível a todos

### Fase 6 — Relatórios (RF: Gerar Relatórios)
- Admin: consultas agregadas (volume por tipo de material, ranking de catadores/cidadãos, coletas por período)
- **Relatório geográfico (novo):** distribuição de catadores e cidadãos por bairro/cidade (`group by bairro, cidade`), incluindo contagem de "sem residência" — dado que o artigo aponta como lacuna hoje desconhecida pelo município
- Catador: histórico e métricas próprias (via `catador_id_atual()`)
- Exportação simples em CSV gerada em JS puro (sem lib)

### Fase 7 — Telas derivadas (não desenhadas nos protótipos)
- Dashboard Cidadão-web e Catador-web (derivados do Admin-web / Catador-mobile, seção 3)
- "Rede Cadastrados" (diretório público limitado) vs "Usuários Cadastrados" (gestão completa do admin)
- Página "Quem Somos / Saiba Mais"
- Tela de Relatórios (tabela/lista no mesmo shell visual)

### Fase 8 — Requisitos não funcionais
- Responsividade completa, seguindo grid dos protótipos
- Meta de desempenho < 5s (evitar consultas N+1 no JS)
- Acessibilidade básica (contraste, labels, foco de teclado)
- Banner/termo de política de privacidade

### Fase 9 — Testes
- Roteiro de teste manual por caso de uso (usar os fluxos alternativos/exceção do Apêndice G do artigo)
- Teste de políticas RLS (logado como Cidadão, tentar acessar dado de Catador/Admin — deve falhar)
- Teste de corrida no agendamento (dois catadores tentando agendar a mesma coleta simultaneamente)
- Teste em pelo menos 2 tamanhos de tela

### Fase 10 — Piloto na Fatec Franco da Rocha
- Publicar em hospedagem estática (Netlify/Vercel) apontando para o projeto Supabase de produção
- Acompanhar com Secretaria Acadêmica e a catadora parceira por algumas semanas
- Ajustes de UX com base no uso real

### Fase 11 — Evolução futura (backlog)
- Múltiplos `local_retirada` (expansão para outras unidades/instituições) — schema já preparado
- Push notification real via Service Worker + VAPID
- Geolocalização/mapa dos pontos de coleta
- Painel de indicadores de impacto ambiental (ODS 1, 8, 12)

---

## 6. Mapeamento requisito → fase → tabelas

| Requisito Funcional (artigo) | Fase | Tabelas envolvidas |
|---|---|---|
| Manter Usuários | 1 | `auth.users`, `cidadao`, `catador` |
| Manter Materiais | 2 | `coleta`, `materiais`, `local_retirada`, Storage |
| Notificar Coleta | 2 | `coleta` + Realtime |
| Manter Agenda | 3 | `agenda` |
| Agendar Retirada | 3 | `coleta`, `agenda` (via RPC) |
| Manter Coletas Retiradas | 4 | `coleta`, `status` |
| Permitir Comunicação | 5 | `mensagens`, `publicacoes` |
| Gerar Relatórios | 6 | `coleta`, `materiais`, `cidadao`, `catador` |

---

## 7. Checklist de segurança

- [ ] Apenas a **publishable/anon key** aparece no código-fonte
- [ ] Secret/service_role key nunca é usada no frontend
- [ ] Nenhuma senha é armazenada em tabela própria — 100% via Supabase Auth
- [ ] RLS habilitado em **todas** as tabelas antes de produção
- [ ] Bucket de fotos com policy de escrita restrita ao dono
- [ ] Agendamento de coleta feito via função RPC (evita condição de corrida), não via update direto do cliente
- [ ] Trigger `prevent_self_promote` impede auto-promoção via update direto
- [ ] Promoção de admin feita via RPC `promover_admin`, nunca via update direto

---

## 8. Próximos passos imediatos

1. Rodar o script atualizado das seções 4/4.1/4.2 no SQL Editor do Supabase (schema + RLS + função de agendamento + seeds) (Concluído, só não os scripts que iniciam em "await")
2. Confirmar configuração de senha mínima (6) no Auth
3. Iniciar a Fase 1 (telas de Login/Cadastro + subformulário de endereço + cadastro de catador por terceiros, com os tokens da seção 2)


## 9. Regras finais de negócio e edge cases críticos

O projeto deve seguir as regras abaixo como requisitos obrigatórios de negócio e segurança. Elas substituem ambiguidades e orientam o agente de IA no desenvolvimento e validação de cada fase.

### 9.1 Cadastro de catador sem app
- Somente o admin deve cadastrar um catador sem login, mantendo o controle institucional e evitando cadastro arbitrário.
- O catador sem app continua existindo como entidade operacional no banco (`catador`), com `auth_user_id = null` e `cadastrado_por` preenchido.
- Quando esse catador futuramente criar login próprio, o sistema deve vincular esse login ao mesmo registro existente, preservando o histórico de coletas, mensagens e desempenho no dashboard.
- O cadastro de catador por cidadão comum deve ser evitado em ambientes de produção para manter a governança institucional.

### 9.2 Status de usuário
- `situacao` define o acesso do usuário ao sistema e não é apenas um rótulo visual.
- `ativo`: acesso normal.
- `desabilitado`: usuário temporariamente inativo, sem poder operar no sistema, mas com histórico preservado.
- `bloqueado`: caso disciplinar; acesso negado imediatamente, mas dados e histórico são mantidos para auditoria.
- Usuário desabilitado ou bloqueado não pode logar, nem realizar agendamentos, nem enviar mensagens.
- O sistema não deve remover registros de usuários fisicamente; a regra é preservar histórico e controlar acesso.

### 9.3 Ciclo de vida da coleta
- A coleta deve seguir o fluxo `disponível -> agendado -> retirado`, com possibilidade de `em aberto` e `cancelado` de acordo com o evento.
- `disponível`: oferta aberta para agendamento.
- `agendado`: coleta atribuída a um catador por meio da RPC `agendar_coleta`.
- `retirado`: confirmação final da coleta concluída.
- `em aberto`: coleta temporariamente indisponível ou reaberta, devido a atraso, cancelamento ou falha operacional.
- `cancelado`: coleta encerrada por decisão administrativa ou do cidadão responsável.
- Reabertura deve limpar `catador_id` e `agenda_id` automaticamente, devolvendo a coleta para a lista de disponibilidade.
- Cidadão dono e admin podem confirmar retirada; o catador não é o principal responsável por essa confirmação.
- Cidadão e admin podem cancelar a coleta; a ação do catador deve ser restrita e sempre compatível com a regra de negócio.

### 9.4 Agenda e agendamento
- A agenda é administrada pelo admin e vinculada a um `local_retirada` específico.
- O sistema deve permitir sobreposição de horários entre coletas distintas no mesmo local, desde que a coleta seja diferente.
- O que não pode acontecer é a mesma coleta ser agendada por dois catadores diferentes ao mesmo tempo.
- A validação de concorrência deve ocorrer no banco via `agendar_coleta` e não via `update` direto no cliente.
- O catador não pode agendar fora do calendário válido do admin; a agenda é a fonte de verdade.

### 9.5 Privacidade e visibilidade de dados
- Telefone, endereço e dados sensíveis só devem ser visíveis ao admin ou ao próprio usuário.
- O diretório público de catadores deve expor apenas dados mínimos, sem endereço completo, e-mail, ou qualquer informação que gere risco de privacidade.
- Mensagens só podem ser lidas pelo remetente e destinatário autorizados.
- O sistema deve preservar o histórico para auditoria, sem apagar dados sensíveis de forma arbitrária.

### 9.6 Fotos
- O upload de fotos deve ocorrer no bucket `materiais-fotos` do Supabase Storage.
- O sistema deve aceitar formatos comuns de câmera (JPEG/PNG), reduzir tamanho e compressão quando possível, e gerar nome único para cada arquivo.
- O campo `foto_url` pertence à oferta (`coleta`) e não ao catálogo de materiais.
- A foto não pode expor identidade de pessoas ou dados sensíveis do usuário responsável.

### 9.7 Conteúdo institucional
- Publicações e campanhas são criadas/alteradas apenas por administradores.
- Cidadãos e catadores visualizam, mas não editam o conteúdo institucional.
- O conteúdo público deve ser neutro, informativo e institucional, sem uso para comunicação privada ou manipulação de coletas.

### 9.8 Edge cases críticos e validações obrigatórias
O agente IA deve testar e validar os seguintes cenários antes de encerrar uma tarefa:
- e-mail duplicado no cadastro
- senha inválida ou divergente
- catador sem login sendo vinculado ao registro errado
- duas chamadas simultâneas da RPC `agendar_coleta` para a mesma coleta
- reabertura de coleta sem limpar `catador_id` e `agenda_id`
- usuário desabilitado/bloqueado tentando logar
- coleta cancelada ainda sendo exibida para catador
- upload de imagem inválida ou muito grande
- acesso direto a páginas restritas por URL
- mensagem enviada para participante indevido
- diretório público expondo dados sensíveis
- atribuição de coleta em nome de catador sem autorização explícita
- tentativa de auto-promover um usuário a administrador via update direto

Além do já listado em §9.8, o agente deve testar:

1. __Cidadão tenta `update({nivel_acesso: 'administrador'})` via cliente__ → deve falhar (trigger)
2. __Admin promove cidadão via RPC__ → deve funcionar
3. __Cidadão tenta chamar `supabase.rpc('promover_admin', ...)`__ → deve falhar (RPC verifica `is_admin()`)
4. __Catador tenta promover__ → deve falhar (não é admin)

A promoção de administrador é uma operação privilegiada. Nunca permita que um usuário comum altere `nivel_acesso` via `update` direto. Use sempre a função RPC `promover_admin()`, que verifica internamente se o chamador é admin. O trigger `prevent_self_promote` atua como backup defensivo no banco.

> Regra final: a experiência visual do protótipo deve ser respeitada, mas a regra de negócio, a privacidade e a segurança têm prioridade sobre a interface. O backend e o RLS devem vencer sempre que houver conflito com a camada visual.