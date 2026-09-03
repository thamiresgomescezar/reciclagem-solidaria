-- ==========================================================
-- SISTEMA RECICLAGEM SOLIDÁRIA - FATEC FRANCO DA ROCHA
-- Script SQL Consolidado: Tabelas, RLS, Funções RPC, Triggers e Seeds
-- ==========================================================

-- 1. LIMPEZA (Para ambiente de teste / recriação limpa)
drop trigger if exists trg_prevent_self_promote on public.cidadao;
drop function if exists public.prevent_self_promote() cascade;
drop function if exists public.buscar_ofertante(uuid[]) cascade;
drop function if exists public.buscar_doadores(uuid[]) cascade;
drop function if exists public.promover_admin(uuid) cascade;
drop function if exists public.agendar_coleta(uuid, uuid, uuid) cascade;
drop function if exists public.catador_id_atual() cascade;
drop function if exists public.is_admin() cascade;

drop table if exists public.mensagens cascade;
drop table if exists public.publicacoes cascade;
drop table if exists public.coleta cascade;
drop table if exists public.agenda cascade;
drop table if exists public.local_retirada cascade;
drop table if exists public.materiais cascade;
drop table if exists public.status cascade;
drop table if exists public.cidadao cascade;
drop table if exists public.catador cascade;

-- ==========================================================
-- 2. TABELAS
-- ==========================================================

-- Extensão do auth.users para Cidadão Consciente (inclui Administrador via nivel_acesso)
-- Cidadão sempre tem login próprio (auto-cadastro via app)
create table public.cidadao (
  id uuid primary key references auth.users(id) on delete cascade,
  nome varchar not null,
  telefone varchar,
  email varchar not null,
  rua varchar, 
  numero varchar, 
  complemento varchar,
  bairro varchar, 
  cidade varchar, 
  estado varchar, 
  cep varchar,
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
  rua varchar, 
  numero varchar, 
  complemento varchar,
  bairro varchar, 
  cidade varchar, 
  estado varchar, 
  cep varchar,
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
  rua varchar default 'Rod. Pref. Luiz Salomão Chamma', 
  numero varchar default '240', 
  complemento varchar default 'entrada principal pela Rua Nelson Rodrigues, s/n',
  bairro varchar default 'Centro', 
  cidade varchar default 'Franco da Rocha', 
  estado varchar default 'SP', 
  cep varchar default '07857-050',
  latitude numeric default -23.3344, 
  longitude numeric default -46.7132,
  ativo boolean not null default true,
  criado_em timestamptz default now()
);

-- Agenda de dias/horários disponíveis por local
create table public.agenda (
  id uuid primary key default gen_random_uuid(),
  local_retirada_id uuid not null references public.local_retirada(id) on delete cascade,
  data date not null,
  hora_inicio time not null default '08:00',  -- Horário de Abertura
  hora_fim time not null default '17:00',     -- Horário de Fechamento
  pausa_inicio time,                          -- Início da pausa/almoço (opcional, ex: '12:00')
  pausa_fim time,                             -- Fim da pausa/almoço (opcional, ex: '14:00')
  disponivel boolean not null default true,
  criado_por uuid references public.cidadao(id),
  constraint uq_agenda_local_data unique(local_retirada_id, data)
);

-- Oferta/coleta: entidade central, une material + local + pessoas envolvidas
create table public.coleta (
  cod_coleta uuid primary key default gen_random_uuid(),
  cod_material integer not null references public.materiais(cod_material) on update cascade,
  local_retirada_id uuid not null references public.local_retirada(id),
  cidadao_id uuid not null references public.cidadao(id),
  catador_id uuid references public.catador(id), -- null até ser agendada
  cod_status integer not null references public.status(cod_status),
  agenda_id uuid references public.agenda(id),
  quantidade varchar,        -- quantidade aproximada (texto curto, ex.: "2 sacos grandes", "10 kg")
  foto_url text,
  data date,                  -- data combinada para retirada
  hora time,                  -- hora combinada para retirada
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Comunicação (RF "Permitir Comunicação")
create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  coleta_id uuid references public.coleta(cod_coleta) on delete set null,
  remetente_id uuid not null,      -- auth.uid()
  destinatario_id uuid not null,   -- auth.uid() ou id de usuario
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

-- ==========================================================
-- 3. DADOS INICIAIS (SEEDS)
-- ==========================================================
insert into public.status (status) values
  ('disponível'), 
  ('agendado'), 
  ('retirado'), 
  ('em aberto'), 
  ('cancelado')
on conflict (status) do nothing;

insert into public.materiais (tipo) values
  ('Papel'), 
  ('Plástico'), 
  ('Vidro'), 
  ('Metal'), 
  ('Outros')
on conflict (tipo) do nothing;

insert into public.local_retirada (nome, rua, numero, complemento, bairro, cidade, estado, cep, latitude, longitude)
values ('Fatec Franco da Rocha', 'Rod. Pref. Luiz Salomão Chamma', '240', 'entrada principal pela Rua Nelson Rodrigues, s/n', 'Centro', 'Franco da Rocha', 'SP', '07857-050', -23.3344, -46.7132);

-- ==========================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==========================================================
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
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.cidadao
    where id = auth.uid() and nivel_acesso = 'administrador'
  );
$$;

-- Helper: resolve o id do catador vinculado ao usuário autenticado
create or replace function public.catador_id_atual()
returns uuid language sql stable security definer as $$
  select id from public.catador where auth_user_id = auth.uid();
$$;

-- CIDADAO: cada um cria o próprio registro; leitura liberada para usuários autenticados (nome/contato em coletas)
create policy "cidadao self insert" on public.cidadao
  for insert with check (auth.uid() = id);
create policy "cidadao leitura autenticada" on public.cidadao
  for select using (auth.role() = 'authenticated');
create policy "cidadao self update" on public.cidadao
  for update using (auth.uid() = id or public.is_admin());
create policy "cidadao admin delete" on public.cidadao
  for delete using (public.is_admin());

-- CATADOR: autocadastro OU cadastro por Cidadão/Admin. Leitura autenticada.
create policy "catador insert autocadastro ou terceiros" on public.catador
  for insert with check (auth_user_id = auth.uid() or cadastrado_por = auth.uid() or public.is_admin());
create policy "catador leitura autenticada" on public.catador
  for select using (auth.role() = 'authenticated');
create policy "catador update dono ou quem cadastrou ou admin" on public.catador
  for update using (auth_user_id = auth.uid() or cadastrado_por = auth.uid() or public.is_admin() or (auth_user_id is null and lower(email) = lower(auth.jwt()->>'email')));
create policy "catador admin delete" on public.catador
  for delete using (public.is_admin());

-- MATERIAIS / STATUS / LOCAL_RETIRADA / AGENDA: leitura livre p/ autenticados, escrita só admin
create policy "leitura autenticada materiais" on public.materiais for select using (auth.role() = 'authenticated');
create policy "escrita admin materiais" on public.materiais for all using (public.is_admin()) with check (public.is_admin());

create policy "leitura autenticada status" on public.status for select using (auth.role() = 'authenticated');
create policy "escrita admin status" on public.status for all using (public.is_admin()) with check (public.is_admin());

create policy "leitura autenticada local" on public.local_retirada for select using (auth.role() = 'authenticated');
create policy "escrita admin local" on public.local_retirada for all using (public.is_admin()) with check (public.is_admin());

create policy "leitura autenticada agenda" on public.agenda for select using (auth.role() = 'authenticated');
create policy "escrita admin agenda" on public.agenda for all using (public.is_admin()) with check (public.is_admin());

-- COLETA: cidadão dono cria/edita a própria oferta; catador vê disponíveis e agenda; admin tudo
create policy "cidadao cria coleta" on public.coleta
  for insert with check (auth.uid() = cidadao_id);
create policy "cidadao ve e edita a propria" on public.coleta
  for select using (auth.uid() = cidadao_id or catador_id = public.catador_id_atual() or public.is_admin() or auth.role() = 'authenticated');
create policy "cidadao atualiza a propria" on public.coleta
  for update using (auth.uid() = cidadao_id or public.is_admin());
create policy "admin tudo coleta" on public.coleta
  for all using (public.is_admin());

-- MENSAGENS: só remetente/destinatário
create policy "mensagens participantes" on public.mensagens
  for all using (auth.uid() = remetente_id or auth.uid() = destinatario_id or public.is_admin());

-- PUBLICACOES: leitura livre para todos, escrita só admin
create policy "leitura publicacoes" on public.publicacoes for select using (true);
create policy "escrita admin publicacoes" on public.publicacoes for all using (public.is_admin());

-- ==========================================================
-- 5. TRIGGERS DE SEGURANÇA
-- ==========================================================
create or replace function public.prevent_self_promote()
returns trigger language plpgsql security definer as $$
begin
  -- Só restringe se a chamada vier de um usuário autenticado pelo frontend/API
  if auth.role() = 'authenticated' then
    if old.nivel_acesso is distinct from new.nivel_acesso
       and not public.is_admin() then
      raise exception 'apenas administradores podem alterar nivel_acesso';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_self_promote
  before update on public.cidadao
  for each row execute function public.prevent_self_promote();

create or replace function public.prevent_main_admin_demotion_or_disable()
returns trigger language plpgsql security definer as $$
declare
  v_main_admin_id uuid;
begin
  if auth.role() = 'authenticated' then
    select id into v_main_admin_id
    from public.cidadao
    where nivel_acesso = 'administrador'
    order by criado_em asc
    limit 1;

    if old.id = v_main_admin_id then
      if new.nivel_acesso is distinct from 'administrador' then
        raise exception 'o administrador principal do sistema não pode ser rebaixado';
      end if;
      if new.situacao is distinct from 'ativo' then
        raise exception 'o administrador principal do sistema não pode ser desativado';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_prevent_main_admin_demotion_or_disable
  before update on public.cidadao
  for each row execute function public.prevent_main_admin_demotion_or_disable();

create or replace function public.prevent_main_admin_delete()
returns trigger language plpgsql security definer as $$
declare
  v_main_admin_id uuid;
begin
  if auth.role() = 'authenticated' then
    select id into v_main_admin_id
    from public.cidadao
    where nivel_acesso = 'administrador'
    order by criado_em asc
    limit 1;

    if old.id = v_main_admin_id then
      raise exception 'o administrador principal do sistema não pode ser excluído';
    end if;
  end if;
  return old;
end;
$$;

create trigger trg_prevent_main_admin_delete
  before delete on public.cidadao
  for each row execute function public.prevent_main_admin_delete();

-- ==========================================================
-- 6. FUNÇÕES RPC
-- ==========================================================

-- RPC 0: Busca pública/autenticada de nome do doador/ofertante (bypassa RLS restritivo sem expor telefone/email)
create or replace function public.buscar_ofertante(p_ids uuid[])
returns table (
  id uuid,
  nome varchar
)
language sql
security definer
stable
as $$
  select c.id, c.nome
  from public.cidadao c
  where c.id = any(p_ids);
$$;

-- RPC 1: Agendamento atômico de coleta (previne race condition)
create or replace function public.agendar_coleta(
  p_coleta_id uuid,
  p_catador_id uuid default null, -- informado só quando agendamento por terceiros
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
  v_agenda_data date;
  v_agenda_hora time;
begin
  -- Resolve qual catador está sendo agendado
  if p_catador_id is null then
    v_catador_id := public.catador_id_atual();
  else
    -- Só pode agendar em nome de outro catador se for quem o cadastrou, ou admin
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
    raise exception 'catador não identificado ou usuário não vinculado a um perfil de catador';
  end if;

  select cod_status into v_status_agendado from public.status where status = 'agendado';

  -- Se p_agenda_id foi fornecido, buscar data e hora da agenda
  if p_agenda_id is not null then
    select data, hora_inicio into v_agenda_data, v_agenda_hora from public.agenda where id = p_agenda_id;
  end if;

  update public.coleta
  set catador_id = v_catador_id,
      agenda_id = coalesce(p_agenda_id, agenda_id),
      data = coalesce(v_agenda_data, data),
      hora = coalesce(v_agenda_hora, hora),
      cod_status = v_status_agendado,
      atualizado_em = now()
  where cod_coleta = p_coleta_id
    and catador_id is null
    and cod_status = (select cod_status from public.status where status = 'disponível')
  returning * into v_resultado;

  if v_resultado is null then
    raise exception 'oferta indisponível ou já agendada por outra pessoa';
  end if;

  return v_resultado;
end;
$$;

-- RPC 2: Promover cidadão a administrador (apenas admin pode chamar)
create or replace function public.promover_admin(p_cidadao_id uuid)
returns void
language plpgsql
security definer as $$
begin
  if not public.is_admin() then
    raise exception 'sem permissão para promover usuário a administrador';
  end if;

  update public.cidadao
  set nivel_acesso = 'administrador'
  where id = p_cidadao_id;

  if not found then
    raise exception 'usuário não encontrado em cidadão';
  end if;
end;
$$;

-- RPC 3: Rebaixar administrador secundário a cidadão (apenas admin pode chamar; admin principal bloqueado por trigger)
create or replace function public.rebaixar_admin(p_cidadao_id uuid)
returns void
language plpgsql
security definer as $$
declare
  v_main_admin_id uuid;
begin
  if not public.is_admin() then
    raise exception 'sem permissão para alterar privilégios de administrador';
  end if;

  select id into v_main_admin_id
  from public.cidadao
  where nivel_acesso = 'administrador'
  order by criado_em asc
  limit 1;

  if p_cidadao_id = v_main_admin_id then
    raise exception 'o administrador principal do sistema não pode ser rebaixado';
  end if;

  update public.cidadao
  set nivel_acesso = 'cidadao'
  where id = p_cidadao_id;

  if not found then
    raise exception 'usuário não encontrado em cidadão';
  end if;
end;
$$;

-- RPC 4: Verifica se um e-mail está cadastrado no sistema (para fluxo público de recuperação de senha)
create or replace function public.verificar_email_cadastrado(p_email text)
returns boolean
language plpgsql
security definer as $$
begin
  return exists (
    select 1 from public.cidadao where lower(trim(email)) = lower(trim(p_email))
    union
    select 1 from public.catador where lower(trim(email)) = lower(trim(p_email))
  );
end;
$$;
grant execute on function public.verificar_email_cadastrado(text) to anon, authenticated;

-- =============================================================================
-- SCRIPT DE MIGRAÇÃO / ATUALIZAÇÃO INCREMENTAL
-- Execute no SQL Editor do Supabase se a base já tiver sido criada anteriormente:
-- =============================================================================
-- ALTER TABLE public.agenda 
--   ADD COLUMN IF NOT EXISTS pausa_inicio time,
--   ADD COLUMN IF NOT EXISTS pausa_fim time;
--
-- ALTER TABLE public.agenda 
--   DROP CONSTRAINT IF EXISTS uq_agenda_local_data;
-- ALTER TABLE public.agenda 
--   ADD CONSTRAINT uq_agenda_local_data UNIQUE(local_retirada_id, data);

