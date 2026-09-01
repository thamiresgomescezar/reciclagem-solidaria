# Tarefas de Desenvolvimento — Sistema Reciclagem Solidária

Este arquivo quebra o `roteiro_desenvolvimento_reciclagem_solidaria.md` em tarefas atômicas, sequenciadas e com critério de pronto, para que um agente de IA (ex.: Claude Code) desenvolva de forma autônoma, tarefa por tarefa.

**Este documento não substitui o roteiro** — ele referencia as seções do roteiro (schema, RLS, design tokens, inventário de telas). Sempre que uma tarefa disser "ver roteiro § X", o agente deve ler aquela seção antes de executar.

---

## 0. Regras gerais para o agente

1. **Trabalhe uma tarefa por vez**, na ordem apresentada dentro de cada fase. Tarefas de fases diferentes só devem ser iniciadas depois que a fase anterior estiver com suas tarefas essenciais (não marcadas como opcionais) concluídas.
2. **Marque cada tarefa como concluída** (`[x]`) só depois de validar o "Critério de pronto" listado nela.
3. **Sem dependências além do `@supabase/supabase-js` via CDN.** Não crie `package.json`, não instale bundlers. Se avaliar que uma lib pequena é realmente necessária, pare e explique o motivo antes de adicionar.
4. **Fidelidade visual é obrigatória** nas telas marcadas como "✅ Desenhada" no roteiro (§3) — usar as imagens de protótipo como referência pixel-a-pixel dentro do razoável. Nas telas "⚠️ Não desenhada", seguir os tokens de design (roteiro §2) e o padrão dos componentes já existentes.
5. **Nunca** coloque a secret/service_role key no código. Só a publishable key (já fornecida) deve aparecer em `js/lib/supabaseClient.js`.
6. **Não decida sozinho mudanças de schema.** Se perceber que falta uma coluna/tabela, pare a tarefa atual e registre a lacuna em `NOTAS_PENDENCIAS.md` (criar se não existir) em vez de alterar o schema por conta própria.
7. **Ambiguidade que não trava o trabalho:** tome a decisão mais simples, documente em `NOTAS_PENDENCIAS.md` o que foi decidido e por quê, e siga em frente. Só pare e pergunte se a ambiguidade impede tecnicamente continuar (ex.: falta de uma credencial).
8. **Cada tarefa deve terminar em estado funcional** — não deixe telas ou funções pela metade entre tarefas.

**Convenção de pastas** (ver roteiro Fase 0):
```
/assets/prototypes   (imagens de referência dos protótipos, copiadas dos uploads)
/css                 (design-tokens.css + estilos por tela)
/js/lib              (supabaseClient.js)
/js/services         (um arquivo por entidade: auth.js, materiais.js, coletas.js...)
/js/pages            (um arquivo JS por tela)
/pages               (um .html por tela)
/db                  (schema.sql com o script consolidado do roteiro §4)
```

---

## Fase 0 — Preparação

- [x] **T0.1 — Estrutura de pastas**
  Criar a estrutura de pastas da convenção acima, vazia.
  *Pronto quando:* todas as pastas existem no repositório.

- [x] **T0.2 — Consolidar `db/schema.sql`**
  Copiar o script SQL completo do roteiro §4, §4.1 e §4.2 (tabelas, seeds, RLS, função `is_admin`, `catador_id_atual`, `agendar_coleta`) para um único arquivo `db/schema.sql`, na ordem correta de execução.
  *Pronto quando:* o arquivo existe e roda sem erro ao ser colado no SQL Editor do Supabase (o agente deve simular/validar a sintaxe; a execução real no projeto Supabase é feita pelo humano responsável, a menos que o agente tenha uma ferramenta de acesso direto ao banco).

- [x] **T0.3 — `js/lib/supabaseClient.js`**
  Criar o client único do Supabase:
  ```js
  import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
  export const supabase = createClient(
    'https://yylmaujpcbqtabrnrkpi.supabase.co',
    'sb_publishable_LPd9Xr5bCv8zfid8SK3A0Q_Kog3ArT2'
  );
  ```
  *Pronto quando:* qualquer página consegue importar `supabase` e chamar `supabase.auth.getSession()` sem erro de console.

- [x] **T0.4 — `css/design-tokens.css`**
  Criar o arquivo com as variáveis CSS do roteiro §2 (`--verde-marca`, `--verde-botao`, etc.) e importá-lo em todas as páginas HTML criadas a partir daqui.
  *Pronto when:* o arquivo existe e é referenciado via `<link>` em pelo menos uma página de teste.

- [x] **T0.5 — Organizar assets de protótipo**
  Copiar as imagens de protótipo recebidas (logo, telas jpg) para `/assets/prototypes/`, mantendo os nomes originais, para servirem de referência visual durante o desenvolvimento.
  *Pronto quando:* as imagens estão na pasta e são citadas nos comentários das páginas HTML correspondentes (ex.: `<!-- ref: assets/prototypes/tela_cadastro_web.jpeg -->`).

- [x] **T0.6 — `README.md` do projeto**
  Documentar: como rodar localmente (ex.: Live Server), estrutura de pastas, e um link/nota para `roteiro_desenvolvimento_reciclagem_solidaria.md` como fonte de verdade de arquitetura.
  *Pronto quando:* um novo desenvolvedor consegue rodar o projeto seguindo só o README.

---

## Fase 1 — Autenticação e perfis

- [x] **T1.1 — Componente "Subformulário de endereço"**
  Criar `js/pages/enderecoForm.js` (ou similar) reutilizável: campos rua, número, complemento, bairro, cidade, estado, CEP + checkbox "Não possuo residência" que, quando marcado, oculta/desabilita os demais campos. Retorna um objeto `{rua, numero, complemento, bairro, cidade, estado, cep, sem_residencia}`.
  *Pronto quando:* o componente pode ser inserido em qualquer formulário de cadastro e devolve os dados corretamente, com e sem o checkbox marcado.

- [x] **T1.2 — Tela de Cadastro Cidadão/Catador (web)**
  `pages/cadastro.html` + `js/pages/cadastro.js`, replicando `tela_cadastro_web.jpeg`: nome, e-mail (+ confirmação), telefone, senha 6 dígitos (+ confirmação), seleção Catador/Cidadão Consciente, + subformulário de endereço (T1.1).
  *Pronto quando:* visualmente compatível com o protótipo e o formulário valida os campos obrigatórios no client antes de enviar.

- [x] **T1.3 — Tela de Cadastro (mobile)**
  `pages/cadastro-mobile.html` (ou view responsiva da mesma tela), replicando `cadastro_mobile.jpeg`, reaproveitando o subformulário de endereço (T1.1).
  *Pronto quando:* visualmente compatível com o protótipo mobile.

- [x] **T1.4 — `js/services/auth.js` — cadastro**
  Implementar `cadastrarCidadao(dados)` e `cadastrarCatador(dados)`: chamam `supabase.auth.signUp({email, password})` e, no sucesso, fazem `insert` em `cidadao`/`catador` com `id/auth_user_id = data.user.id` e os campos de endereço.
  *Pronto quando:* um cadastro completo (T1.2 ou T1.3) cria o usuário no Auth **e** a linha correspondente na tabela, verificável no painel Supabase.

- [x] **T1.5 — Tela de Login (web e mobile)**
  `pages/login.html` + `js/pages/login.js`, replicando `tela_inicial_web.jpeg` (estado com botão Login) e `login_mobile.jpeg`.
  *Pronto quando:* visualmente compatível com os dois protótipos.

- [x] **T1.6 — `js/services/auth.js` — login e sessão**
  Implementar `login(email, senha)` via `signInWithPassword`; implementar `logout()`; implementar `getPerfilAtual()` que retorna `{tipo: 'cidadao'|'catador'|'administrador', dados}` consultando `cidadao`/`catador` pelo `auth.uid()` da sessão ativa.
  *Pronto quando:* após login bem-sucedido, `getPerfilAtual()` retorna o tipo e dados corretos para os três perfis de teste.

- [x] **T1.7 — Recuperação de senha**
  Tela + `resetPasswordForEmail`, ligada ao link "Esqueci minha senha" do protótipo mobile.
  *Pronto quando:* o fluxo de reset dispara o e-mail do Supabase (validar em ambiente de teste).

- [x] **T1.8 — Guarda de rota**
  `js/lib/routeGuard.js`: função chamada no topo de cada página restrita que verifica sessão ativa e tipo de perfil permitido; redireciona para login se não autenticado, ou para uma página de "acesso negado" se o perfil não bate.
  *Pronto quando:* acessar uma página de admin logado como cidadão é bloqueado, e vice-versa.

- [x] **T1.9 — Fluxo "Cadastrar Catador por terceiros"**
  Nova tela (derivada de T1.2, sem os campos de login), acessível a Cidadão e Admin. `js/services/auth.js`: `cadastrarCatadorPorTerceiros(dados)` faz `insert` direto em `catador` com `cadastrado_por = auth.uid()` e `auth_user_id = null`, e-mail opcional.
  *Pronto quando:* um cidadão logado consegue cadastrar um catador sem e-mail/senha, e esse catador aparece em consultas normais (ex.: no painel de "quem pode ser notificado").

- [x] **T1.10 — Instruções para admin inicial**
  Documentar em `README.md` (não em código) o passo manual: criar usuário em Auth → Users no painel Supabase, depois rodar `insert into cidadao (...) values (..., 'administrador')` com o `id` gerado.
  *Pronto quando:* a instrução está documentada e foi testada uma vez.

- [x] **T1.11 — Teste manual de RLS da Fase 1**
  Registrar em `NOTAS_PENDENCIAS.md` (ou `TESTES.md`) o resultado de: logar como cidadão A e tentar `select`/`update` no registro de cidadão B (deve falhar); logar como catador e tentar se autopromover a admin via update direto (deve falhar).
  *Pronto quando:* os três testes acima estão documentados com resultado "bloqueado com sucesso".

---

## Fase 2 — Materiais e ofertas de coleta

- [x] **T2.1 — `js/services/materiais.js`**
  `listarTiposMaterial()`: `select * from materiais` (catálogo fixo, para popular o dropdown "Tipo de Material").
  *Pronto quando:* retorna os 5 tipos semeados no schema.

- [x] **T2.2 — Tela "Inserir material para retirada" (web)**
  `pages/inserir-material.html`, replicando `inserir_material_web.jpeg`: dropdown de tipo (T2.1), campo quantidade aproximada, upload de imagem, campo local de retirada **pré-preenchido/oculto** com o único `local_retirada` ativo (ver roteiro §3, nota da tela).
  *Pronto quando:* visualmente compatível com o protótipo e o formulário valida os campos antes de enviar.

- [x] **T2.3 — Upload de foto (Storage)**
  Criar bucket `materiais-fotos` (se ainda não existir) e implementar `uploadFotoMaterial(file)` em `js/services/materiais.js`, retornando a URL pública.
  *Pronto quando:* uma foto enviada pelo formulário fica acessível pela URL retornada.

- [x] **T2.4 — `js/services/coletas.js` — criar oferta**
  `criarOferta({cod_material, quantidade, foto_url, local_retirada_id})`: `insert` em `coleta` com `cidadao_id = auth.uid()`, `cod_status = (id de 'disponível')`.
  *Pronto quando:* submeter o formulário de T2.2 cria uma linha em `coleta` com status "disponível".

- [x] **T2.5 — Painel do Catador — materiais disponíveis (mobile e web)**
  `pages/catador-materiais.html`/mobile, replicando `tela_catador_mobile.jpeg` ("Verificar material disponível"): lista `coleta` com status "disponível" via `join` com `materiais`.
  *Pronto quando:* uma oferta criada em T2.4 aparece nessa lista.

- [x] **T2.6 — Realtime de novas ofertas**
  No painel do Catador, assinar `supabase.channel(...).on('postgres_changes', {event: 'INSERT', table: 'coleta'}, ...)` para atualizar a lista sem reload.
  *Pronto quando:* abrir o painel em duas abas (uma como catador, outra como cidadão criando oferta) mostra a nova oferta aparecendo automaticamente na primeira, sem F5.

---

## Fase 3 — Agenda e agendamento

- [x] **T3.1 — Tela Admin "Definir Agenda" (web)**
  `pages/definir-agenda.html`, replicando `definir_agenda_web.jpeg`: calendário de seleção de dia + horário início/fim.
  *Pronto quando:* visualmente compatível com o protótipo (o gradiente de cor é decorativo, não precisa ser funcional).

- [x] **T3.2 — `js/services/agenda.js`**
  CRUD de `agenda` (criar, listar por local, editar, excluir), restrito a admin (a RLS já bloqueia no banco; o client só precisa tratar o erro de permissão).
  *Pronto quando:* um admin consegue cadastrar/editar/excluir horários e um cidadão comum recebe erro ao tentar.

- [x] **T3.3 — Componente calendário reutilizável**
  Extrair a UI de seleção de dia/horário de T3.1 como componente (`js/pages/calendarPicker.js`), reutilizável na tela de agendamento do catador.
  *Pronto quando:* o mesmo componente é usado em pelo menos duas telas sem duplicar código.

- [x] **T3.4 — Função RPC `agendar_coleta` no banco**
  Confirmar que a função do roteiro §4.2 foi criada no Supabase (parte do T0.2/T0.6 se ainda não aplicada).
  *Pronto quando:* `supabase.rpc('agendar_coleta', {p_coleta_id: '...'})` executa sem erro contra uma oferta de teste.

- [x] **T3.5 — Fluxo Catador agenda a própria retirada**
  Na tela de T2.5, adicionar ação "Agendar" que chama a RPC sem `p_catador_id` (self-service).
  *Pronto quando:* após agendar, a oferta muda de status para "agendado" e passa a aparecer em "Minhas coletas" do catador.

- [x] **T3.6 — Fluxo Cidadão/Admin agenda em nome de catador sem app**
  Na tela de gestão do cidadão/admin, permitir selecionar um catador (dos que ele mesmo cadastrou, ou qualquer um se admin) e chamar a RPC com `p_catador_id`.
  *Pronto quando:* um catador cadastrado por terceiros (T1.9) recebe uma coleta agendada em seu nome, sem nunca ter feito login.

- [x] **T3.7 — Teste de concorrência**
  Simular duas chamadas simultâneas da RPC para a mesma `coleta_id` (dois catadores tentando agendar a mesma oferta) e confirmar que só uma tem sucesso.
  *Pronto quando:* o teste está documentado em `TESTES.md` com o resultado esperado confirmado.

---

## Fase 4 — Ciclo de vida da coleta

- [x] **T4.1 — Tela "Minhas coletas" (cidadão)**
  Lista as coletas criadas pelo cidadão logado, com status atual.
  *Pronto quando:* reflete corretamente o estado de cada oferta criada nas fases anteriores.

- [x] **T4.2 — Confirmar retirada**
  Ação "Confirmar retirada" na tela de T4.1: `update coleta set cod_status = (id de 'retirado')` onde o cidadão é dono.
  *Pronto quando:* o status muda corretamente e fica refletido no histórico.

- [x] **T4.3 — Reabrir coleta (atraso/cancelamento)**
  Ação "Reabrir" que volta o status para "em aberto" e limpa `catador_id`/`agenda_id`, permitindo novo agendamento.
  *Pronto quando:* uma coleta reaberta volta a aparecer na lista de disponíveis do catador (T2.5).

- [x] **T4.4 — Painel admin de gestão de coletas**
  Tela listando todas as coletas do sistema, com ação de editar/confirmar/cancelar qualquer uma.
  *Pronto quando:* um admin consegue alterar o status de qualquer coleta, independente de quem criou.

- [x] **T4.5 — CRUD de `status` (admin)**
  Tela simples para o admin gerenciar a lista de status possíveis.
  *Pronto quando:* um novo status criado aparece nos dropdowns de status usados nas telas anteriores.

---

## Fase 5 — Comunicação

- [x] **T5.1 — Tela "Contatar Catador" / lista de conversas**
  Lista de conversas do usuário logado (agrupadas por `coleta_id` ou por destinatário), replicando o ícone/estilo "Contatar Catador" dos dashboards.
  *Pronto quando:* mostra corretamente as conversas existentes do usuário logado.

- [x] **T5.2 — Thread de mensagens**
  Tela de conversa individual com envio de mensagem (`insert` em `mensagens`) e Realtime para chegada instantânea.
  *Pronto quando:* duas abas logadas como participantes diferentes trocam mensagens em tempo real.

- [x] **T5.3 — Painel de publicações (admin)**
  Tela para o admin criar/editar/excluir `publicacoes` (campanhas, conteúdo educativo).
  *Pronto quando:* uma publicação criada pelo admin é salva corretamente.

- [x] **T5.4 — Exibição de publicações**
  Seção "Quem somos / Saiba mais" (ou equivalente) visível a todos os perfis, listando publicações.
  *Pronto quando:* publicações criadas em T5.3 aparecem para cidadão e catador.

---

## Fase 6 — Relatórios

- [x] **T6.1 — Relatório: volume por tipo de material**
  Consulta agregada (`group by cod_material`) exibida como lista/tabela para o admin.
  *Pronto quando:* os números batem com as coletas cadastradas em ambiente de teste.

- [x] **T6.2 — Relatório: ranking de catadores/cidadãos**
  Contagem de coletas concluídas por pessoa, ordenada decrescente.
  *Pronto quando:* reflete corretamente o histórico de teste.

- [x] **T6.3 — Relatório geográfico**
  Agregação de `cidadao`/`catador` por `bairro`/`cidade`, incluindo contagem de `sem_residencia = true`.
  *Pronto quando:* exibe corretamente a distribuição com os dados de teste cadastrados nas fases anteriores.

- [x] **T6.4 — Relatório do catador (histórico próprio)**
  Tela restrita ao próprio catador, usando `catador_id_atual()` (via RLS) para filtrar.
  *Pronto quando:* um catador só vê o próprio histórico, nunca o de outro.

- [x] **T6.5 — Exportação CSV**
  Botão "Exportar" nas telas de relatório, gerando CSV em JS puro a partir do array já carregado (sem lib).
  *Pronto quando:* o arquivo baixado abre corretamente em uma planilha.

---

## Fase 7 — Telas derivadas (não desenhadas no protótipo)

- [x] **T7.1 — Dashboard Cidadão (web)**
  Derivar do Admin-web (roteiro §3), removendo cards exclusivos de admin.
  *Pronto quando:* visualmente consistente com o shell web e mostra só as ações permitidas ao cidadão.

- [x] **T7.2 — Dashboard Catador (web)**
  Derivar do grid do Catador-mobile, adaptado ao shell web.
  *Pronto quando:* visualmente consistente e funcionalmente equivalente ao dashboard mobile do catador.

- [x] **T7.3 — "Usuários Cadastrados" (admin)**
  Lista completa de cidadãos e catadores com ações de editar, desabilitar e promover a administrador (via RPC `promover_admin`).
  *Pronto quando:* um admin consegue desabilitar um usuário e o login dele passa a ser bloqueado.

- [x] **T7.4 — "Rede Cadastrados" (cidadão)**
  Diretório público limitado (nome/telefone de catadores, por exemplo), sem dados sensíveis.
  *Pronto quando:* um cidadão vê a lista sem conseguir acessar e-mail ou dados de endereço completos de terceiros.

- [x] **T7.5 — Página "Quem Somos / Saiba Mais"**
  Conteúdo institucional estático (pode reaproveitar T5.4 se fizer sentido unificar).
  *Pronto quando:* acessível a partir do link já presente nos protótipos ("Quem somos / Saiba mais").

---

## Fase 8 — Requisitos não funcionais

- [x] **T8.1 — Revisão de responsividade**
  Testar todas as telas em pelo menos 2 breakpoints (mobile ~375px, desktop ~1440px).
  *Pronto quando:* nenhuma tela quebra layout nos dois tamanhos.

- [x] **T8.2 — Otimização de consultas**
  Revisar telas com listas (dashboards, relatórios) em busca de consultas N+1; usar `select` com `join` do Supabase (`select('*, materiais(*)')`) em vez de loops de fetch.
  *Pronto quando:* nenhuma tela faz mais de 1 chamada de rede por lista carregada (fora paginação).

- [x] **T8.3 — Acessibilidade básica**
  Checar contraste mínimo, `label` associado a todo input, navegação por teclado nos formulários principais.
  *Pronto quando:* os formulários de login/cadastro são operáveis 100% por teclado.

- [x] **T8.4 — Banner/termo de privacidade**
  Componente de aceite exibido no primeiro acesso/cadastro, com link para o texto completo.
  *Pronto quando:* aparece no fluxo de cadastro e o aceite é obrigatório para prosseguir.

---

## Fase 9 — Testes

- [x] **T9.1 — Roteiro de teste funcional por caso de uso**
  Usar os fluxos alternativos/exceção do Apêndice G do artigo original como roteiro de teste manual; documentar resultado em `TESTES.md`.
- [x] **T9.2 — Teste de políticas RLS** (complementa T1.11 para as demais tabelas: `coleta`, `mensagens`, `agenda`).
- [x] **T9.3 — Teste de concorrência de agendamento** (já coberto em T3.7 — só confirmar que segue válido após mudanças posteriores).
- [x] **T9.4 — Teste em múltiplos tamanhos de tela** (complementa T8.1 com foco em fluxo completo, não só layout).

*Pronto quando:* todos os itens acima estão documentados em `TESTES.md` com status "passou"/"falhou" e, se falhou, a tarefa correspondente foi reaberta.

---

## Fase 10 — Piloto na Fatec Franco da Rocha

- [x] **T10.1 — Deploy em hospedagem estática**
  Publicar em Netlify/Vercel (ou equivalente) apontando para o projeto Supabase de produção.
- [x] **T10.2 — Checklist de lançamento**
  Confirmar: RLS ativo em todas as tabelas, admin inicial criado, dados de seed corretos, checklist de segurança do roteiro §7 revisado item a item.

*Este é o único bloco que depende de ação humana (contato com a Secretaria Acadêmica) — o agente entrega o sistema publicado e o checklist; o acompanhamento do piloto em si não é uma tarefa de desenvolvimento.*

---

## Fase 11 — Backlog (fora do escopo autônomo por ora)

Não quebrado em tarefas — ver roteiro §5, Fase 11, para retomar quando houver decisão de priorização:
- Múltiplos `local_retirada`
- Push notification real (Service Worker + VAPID)
- Geolocalização/mapa
- Painel de indicadores de impacto ambiental (ODS 1, 8, 12)

## Regras finais de negócio e edge cases críticos

O agente deve tratar estas regras como requisitos operacionais obrigatórios e não como sugestões de UX. Qualquer implementação que contradiga uma destas regras deve ser rejeitada antes da entrega.

### 1) Autenticação e perfis
- O processo de cadastro deve usar `Supabase Auth` como fonte de verdade da credencial de acesso.
- Toda conta de cidadão deve ter `auth.users.id` vinculado diretamente ao registro em `public.cidadao` com `id = auth.uid()`.
- O perfil de administrador deve ser criado manualmente no Supabase Auth e depois promovido em `public.cidadao` com `nivel_acesso = 'administrador'`.
- Catadores podem existir sem login próprio. Quando o cadastro for feito por terceiros, `auth_user_id` deve permanecer `NULL` e o registro ainda deve ser válido para o fluxo de coleta.
- O login de um usuário deve ser validado também contra o status do perfil (`ativo`, `desabilitado`, `bloqueado`).
- A camada de visualização deve impedir qualquer tentativa de acesso por perfil indevido mesmo que o roteamento seja burlado no cliente.

### 2) Status do usuário
- `situacao` é uma regra de acesso e uso do sistema, não só um rótulo visual.
- `ativo`: acesso normal e execução do fluxo principal.
- `desabilitado`: usuário pode continuar em banco, mas não deve receber/realizar ações operacionais.
- `bloqueado`: acesso negado imediatamente; não pode visualizar coletas, agendar, enviar mensagens nem publicar conteúdos.
- Qualquer operação de update em `situacao` deve ser exclusiva de admin.
- Quando um usuário for bloqueado, o sistema deve limpar ou desabilitar ações relacionadas a coleta, agenda e comunicação, mas não pode apagar o histórico de dados de auditoria.

### 3) Ciclo de vida da coleta
- O estado da coleta deve seguir o fluxo: `disponível -> agendado -> retirado` ou `disponível -> em aberto -> disponível/nova tentativa de agendamento`.
- `agendado` deve ser atribuído somente pela função `agendar_coleta`, nunca por `update` direto no cliente.
- `retirado` deve ser uma confirmação final da coleta concluída, só aceita quando o cidadão dono ou o admin confirma a retirada.
- `em aberto` deve ser usado quando houver atraso, cancelamento, indisponibilidade ou falha na retirada; ao reabrir, o sistema deve limpar `catador_id` e `agenda_id`.
- `cancelado` deve ser considerado um estado terminal do processo, salvo execução explícita de reabertura por admin ou responsável.
- Uma coleta já agendada não pode ser “reagendada” sem passar por reabertura ou nova validação.

### 4) Lógica de agenda
- A agenda pertence ao administrador e deve estar vinculada a um `local_retirada` específico.
- O agendamento deve bloquear concorrência: duas chamadas simultâneas para a mesma coleta devem resultar em apenas uma confirmação bem-sucedida.
- Agendamento por terceiros é permitido apenas quando o catador foi cadastrado pelo mesmo usuário ou por um admin.
- O sistema deve permitir sobreposição de horários entre coletas diferentes no mesmo local, desde que a coleta seja diferente.

### 5) Privacidade e visibilidade de dados
- Dados sensíveis como telefone, e-mail e endereço devem ser visíveis somente ao perfil correto.
- O diretório público de catadores deve ser limitado a campos mínimos e nunca deve expor dados completos.
- A política de leitura em `mensagens` deve garantir que somente remetente e destinatário consigam consultar a conversa.

### 6) Upload de arquivos e ativos
- Todo upload de foto da coleta deve ser feito para o bucket `materiais-fotos`.
- O arquivo deve ser validado por tipo e tamanho antes do envio.
- O campo `foto_url` deve pertencer à oferta de coleta e não ao catálogo.
- A propriedade do arquivo deve estar vinculada ao dono da coleta.

### 7) Conteúdo admin-only
- Publicações, campanhas e conteúdos educacionais devem ser criados, editados e removidos apenas por administradores.
- Cidadãos e catadores podem consultar as publicações, mas não devem conseguir inserir, alterar ou excluir conteúdo institucional.

### 8) Checklist de validação obrigatória do agente
Antes de marcar qualquer tarefa como concluída, o agente deve validar:
- login com usuário ativo funciona e login com status `desabilitado`/`bloqueado` falha;
- cidadão não consegue visualizar ou alterar dados de outro cidadão;
- catador não consegue auto-promover a admin por update direto;
- coleta não pode ser agendada em duplicidade por duas pessoas simultaneamente;
- oferta reaberta volta a aparecer como disponível;
- admin consegue gerenciar agenda e conteúdos institucionais; usuários comuns apenas consultam;
- upload de foto gera URL válida e a imagem é acessível;
- a mensagem só pode ser lida por remetente e destinatário;
- a próxima ação do fluxo segue a ordem correta de negócio e não permite pular validações de status.