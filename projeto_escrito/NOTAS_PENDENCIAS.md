# Notas e Pendências de Desenvolvimento

Este arquivo registra decisões tomadas perante ambiguidades, pendências identificadas e inconsistências de schema ou protótipo, conforme Regra Geral #6 e #7.

---

## Log de Decisões

| Data | Tarefa | Decisão Tomada | Racional |
|---|---|---|---|
| 2026-08-16 | T0.1-T0.6 | Inicialização da estrutura pura (sem bundler) e consolidação do schema em `db/schema.sql`. | Respeitar rigidez de stack definida no Roteiro §1. |
| 2026-08-16 | T1.1 | Subformulário de endereço criado como módulo JS `enderecoForm.js` com suporte ao checkbox "Não possuo residência". | Garantir reuso em cadastros de cidadão, catador e cadastro por terceiros. |
| 2026-08-16 | T1.4 | Login/cadastro valida se `situacao` está como `ativo` antes de conceder acesso. | Atender requisito de segurança do Roteiro §9.2. |
| 2026-08-29 | T2.2 / T7.3 | Remoção de fallbacks de "Pouso Alegre" e remoção de labels "(Sem App)" dos nomes de catadores. | Consistência geográfica da Fatec e experiência de usuário respeitosa. |
| 2026-08-29 | T3.1 / T3.3 | Agenda mobile com ajuste de largura de coluna e modal de horários flexíveis por dia/sábado. | Flexibilidade para horários diferenciados de fim de semana e enquadramento mobile. |
| 2026-08-29 | T2.2 / T7.4 | Bloqueio de desativação/exclusão do último ponto de coleta ativo no sistema e tratamento em "Inserir Material". | Prevenir disfuncionalidade do sistema por ausência de pontos de coleta. |
| 2026-08-29 | T6.1-T6.3 | Separação explícita de Ponto de Coleta, Bairro e Cidade nos relatórios e exportação. | Eliminar concatenações ambíguas como "Não Informado / Centro". |
| 2026-08-29 | T5.3-T5.4 | Correção da query de autores e renderização do nome do Administrador nas publicações. | Correção de bug de coluna inexistente e identificação dos administradores autores. |
| 2026-08-29 | T4.1 | Correção de variável de data em `minhasColetas.js` restaurando o carregamento de ofertas. | Correção de ReferenceError que impedia a renderização das ofertas do cidadão. |
| 2026-08-29 | T1.2 / T1.3 | Inclusão de botão com ícone de olho para visualização de senha no cadastro e login. | Melhoria de usabilidade e redução de erros de digitação. |
| 2026-08-29 | T2.2 / T7.4 | Importação de `showAlertModal` e destaque visual verde no botão de edição de locais. | Correção de ReferenceError silencioso e clareza no alerta de bloqueio do último local. |
| 2026-08-29 | T3.1 / T3.3 | Preservação de `_calendarPendingMap` em memória durante re-renderizações locais da grade. | Garantir aplicação imediata de configurações de atendimento para sábados e dias específicos. |
| 2026-08-29 | T6.1-T6.3 | Padronização de rótulo para apenas "Bairro" em rankings de Catadores e Cidadãos. | Consistência terminológica em relatórios analíticos e exportação Excel. |
| 2026-08-29 | T8.1-T8.2 | Inclusão de dia e hora (`Hoje às 14:30`, `29/08/2026 às 14:30`) e divisores diários no chat. | Clareza na linha temporal de conversas assíncronas entre cidadãos e catadores. |
| 2026-08-29 | T2.1 / T4.1 | Modal de confirmação de cadastro de material com opção explícita de redirecionamento. | Padronização estética dos modais do sistema e autonomia de navegação do usuário. |
| 2026-08-29 | Geral / UX | Padronização de botões de cancelamento/aborto para "Voltar" e confirmações explícitas. | Eliminar ambiguidade "Cancelar vs Sim, Cancelar" e tornar ações intuitivas. |
| 2026-08-29 | T3.1-T3.3 | Suporte a múltiplos turnos/intervalos de atendimento (ex: 08h-12h e 14h-19h) na agenda e agendamento. | Flexibilidade para fechamento de almoço e horários fracionados de atendimento. |
| 2026-08-29 | T2.1 / T7.1 | Pré-visualização de imagem no upload, compressão resiliente para Base64 e renderização de fotos/placeholders para o Catador. | Garantir que fotos de materiais sejam salvas no banco e visualizadas pelo catador com opção de zoom. |
| 2026-08-29 | T5.3 / T5.4 | Desacoplamento de autor fixo para resolução do nome real do administrador em publicações. | Permitir identificação de múltiplos administradores autores no mural de campanhas. |
| 2026-08-30 | T7.1 / PWA | Sistema de Notificação em Tempo Real Resiliente com In-App Toast, Web Audio e Realtime. | 0 custo permanente, entrega instantânea e funcionamento sem dependência de APIs externas de e-mail/SMS. |
| 2026-08-30 | T1.1 / T2.1 | Padronização rigorosa de Title Case com preposições, máscaras de Telefone/CEP e quantitativos estruturados para BI. | Garantir integridade de dados e facilitar consultas SQL e relatórios em dashboards analíticos. |
| 2026-08-30 | PWA / UX | Regeneração dos ícones PWA com fundo `#e3f4e2` homogêneo eliminando bordas brancas na tela inicial. | Experiência visual nativa sem artefatos gráficos nos ícones de atalho mobile. |
| 2026-08-30 | Processo / UX | Revisão e confirmação de dias e horários de atendimento da unidade antes de cadastrar material. | Alinhar o fluxo do sistema com a etapa da Secretaria no mapa de processo BPMN. |
| 2026-08-30 | T7.1 / T4.1 | Notificações de reabertura por desistência do catador e reabertura de ofertas em tempo real. | Garantir a contingência do processo: quando um catador recusa/cancela, outros catadores são notificados. |
| 2026-08-30 | T1.1 / Auth | Normalização universal de e-mails em lowercase (input/blur, serviços de auth e banco). | Prevenir erros de login e duplicidades por divergência de maiúsculas/minúsculas. |
| 2026-08-30 | UI / Tokens | Padronização estética de banners de alerta e validação (.status-message e .feedback-msg). | Manter harmonia visual com fundo suave, borda arredondada e tipografia destacada. |
| 2026-08-30 | T3.1 / T3.2 | Trava anti-duplicação de turnos na agenda e supressão de períodos idênticos (8h-17h / 8h-17h). | Impedir duplicidade de horários na grade do calendário e na persistência do banco. |
| 2026-08-30 | T3.1 / UX | Redesenho ergonômico de horários e pausas de almoço em períodos fixos (Abertura/Fechamento + Pausa). | Eliminar sobreposição de turnos e simplificar a configuração de atendimento. |
| 2026-08-30 | T3.1 / T2.1 | Algoritmo de fusão e consolidação de intervalos sobrepostos da agenda (`consolidarIntervalos`). | Limpar registros concorrentes do banco e garantir exibição limpa sem repetições. |
| 2026-08-30 | BI / Relatórios | Ordenação decrescente por volume total de ofertas (mais ofertados -> menos ofertados). | Análise estratégica instantânea de materiais e bairros nos relatórios e exportação. |
| 2026-08-30 | UI / Copywriting | Remoção de jargões técnicos ("no banco de dados") em mensagens de confirmação e status. | Mensagens de interface naturais e humanizadas (ex: *"Alterações da agenda salvas com sucesso!"*). |
| 2026-08-30 | Modelagem / DB | Adição de `pausa_inicio` e `pausa_fim` na tabela `public.agenda` (1 registro conciso por data). | Normalização relacional com chave única por local/data e suporte a pausas de almoço. |
| 2026-08-30 | UX / Minimalismo | Remoção de botões de atalho/exemplos de intervalo na agenda. | Interface limpa e direta focada apenas nos seletores de horário. |
| 2026-08-30 | UI / Geo / Maps | Remoção de "(Centro)" e exibição do endereço exato cadastrado da Fatec no modal/cards. | Exibição limpa do local e endereço fidedigno aos dados do banco. |
| 2026-08-30 | DB / UI / Mobile | Upsert atômico on conflict na agenda, remoção de chat com admin e enquadramento mobile. | Resolução de duplicate key, fluxo de comunicação restrito e layout mobile sem sobreposição. |
| 2026-08-30 | Frontend / Dynamic Data | Remoção de `<option>` fixas/default de materiais no HTML de `inserir-material.html`. | Dropdown 100% dinâmico alimentado exclusivamente pelo banco de dados. |
| 2026-08-30 | UI / Mobile / Icons | Alinhamento vertical universal de ícones FontAwesome e cabeçalho mobile inline. | Centralização estrita de ícones e eliminação de quebras desproporcionais. |
| 2026-08-30 | UI / Responsividade | `white-space: nowrap` e `flex-wrap: wrap` em barras de ação e botões móveis. | Eliminar quebra interna de texto em botões e manter proporção visual em telas estreitas. |
| 2026-08-30 | Agenda / DOM Fix | Refatoração de `formatarLabelHorario` com texto puro no atributo `title` do calendário. | Eliminar quebra de aspas duplas no atributo HTML e resíduos textuais na grade. |
| 2026-08-30 | UI / Grid / Filtros | Grid com largura e altura uniformes para botões de filtro e abas (2 colunas mobile). | Enquadramento simétrico e contornos com mesmo tamanho para todas as opções. |
| 2026-08-30 | Agenda / Multi-Mês | Herança do padrão semanal do mês anterior e navegação entre meses no calendário. | Prevenção de exibição de dias fechados e transição suave entre meses na agenda. |
| 2026-08-30 | UI / Orientação | Subtítulo orientativo para contato com administradores na confirmação de horários. | Guiar o ofertante caso precise ajustar horários da unidade antes do cadastro. |
| 2026-08-30 | UI / Mobile / Inline | Preservação de linha única para Quantidade + Unidade no mobile (`.grid-qtd-inline`). | Eliminar quebra vertical desnecessária de campos numéricos. |
| 2026-08-30 | UI / Mobile / Agenda | Grid simétrico de 2 colunas para botões de dias da semana (`#weekdays-group`). | Centralização perfeita e ocupação balanceada da tela sem formato escadinha. |
| 2026-08-30 | UI / Cards / Grid | Grid simétrico de 4 colunas (desktop) e 2 colunas (mobile) para ações de locais. | Padronização de botões nos cards com altura uniforme e larguras iguais. |
| 2026-08-30 | Relatórios / Tabelas | Enquadramento com border-spacing 0, border-radius e TitleCase nas tabelas. | Correção de corte no destaque Sem moradia e alinhamento elegante dos relatórios. |
| 2026-08-30 | UI / Selects | Ajuste de placeholder longo no seletor de contatos do chat para evitar corte. | Enquadramento limpo do texto dentro do campo sem colidir com a seta. |
| 2026-08-30 | UI / Botões / Agenda | Enquadramento em linha única para o botão de geração de agenda recorrente. | Eliminar quebra em duas linhas e melhorar legibilidade no mobile. |
| 2026-08-30 | UI / Grid / Relatórios | Enquadramento definitivo de dias da semana (Grid 7 colunas) e cards de relatórios. | Remoção de flex inline e aplicação de tabela limpa com cabeçalho verde e wrappers. |
| 2026-08-30 | Perfil / Agenda / Catador | Correção de escopo JS em Meu Perfil e leitura transparente dos horários reais da agenda. | Preenchimento imediato de dados do usuário e clique informativo na consulta de horários. |
| 2026-08-30 | Relatórios / Chat / Catador | Grid 3 colunas (desktop) e 2 colunas (mobile) para relatórios e segmentação de contatos (Cidadão vs Admin). | Enquadramento limpo de abas e navegação rápida no chat sem atrasos ou confusão de perfis. |
| 2026-08-30 | UI / Notificações / Perfil | Criação das classes `.btn-toggle-notif` no formato pill button harmonizado com os demais botões. | Eliminar estilo cinza cru e padronizar botão Desativar Notificações. |
| 2026-09-01 | UI / Botões Pill / Relatórios | Ajuste de labels para Ver no Mapa, Tirar Dúvidas, Cancelar Agendamento e ordenação decrescente por quantidade. | Enquadramento em 1 linha sem quebra nos balões e relatórios ordenados do maior para o menor. |
| 2026-09-01 | UI / KPIs / Chat / Admin-Catador | Simetria 2x2 com `kpi-card` (ícones 32x32px) e correta categorização de administradores vs cidadãos no chat. | Eliminar blocos maiores na esquerda no mobile e segmentar contatos com fidedignidade. |
| 2026-09-01 | Chat / Validação / Relatórios Admin | Abas dinâmicas de contato (Admin: Catador vs Cidadão; Catador/Cidadão: Outro vs Admin), enquadramento de tabelas admin e validação estrita de campos com `*`. | Carregamento integral de mensagens, navegação direta por perfil e clareza visual de obrigatoriedade. |
| 2026-09-01 | UI / KPIs / Truncamento Limpo | Ajuste de `.kpi-value` para `display: block` e `text-align: center` com font proporcional `0.92rem` no ponto de coleta e tooltip `title`. | Eliminar corte bilateral em nomes longos no desktop e renderizar elipse limpa (`...`). |
| 2026-09-01 | Filtros / Minhas Coletas | Adição de toolbar com filtros `Todas`, `Agendadas` e `Concluídas` com contadores dinâmicos. | Permitir ao catador e cidadão filtrar rapidamente suas coletas ativas e arquivadas. |
| 2026-09-01 | Chat / Destinatários / Banco | Carregamento universal de cidadãos e administradores diretamente da tabela `cidadao` sem filtros excludentes por SQL nulo. | Garantir que administradores apareçam para o cidadão e cidadãos/admins apareçam para o catador. |
| 2026-09-01 | Minhas Coletas / Execução JS | Remoção de bloco duplicado de tratamento de erro e fechamento de função em `js/pages/minhasColetas.js`. | Sanar bloqueio de parsing do script pelo navegador, reativando o carregamento da lista e os cliques nos filtros. |
| 2026-09-01 | Chat / Agregação Multi-Fonte / RLS | Carregamento multi-fonte de contatos via `cidadao`, `catador`, `coleta(cidadao)`, `publicacoes(autor)` e cache local com fallback institucional. | Contornar restrição de RLS do Supabase em `cidadao`, garantindo que cidadãos e administradores apareçam para todos os perfis. |
| 2026-09-01 | UI / Ícone Modal / Chat / Formulários | Substituição do ícone de exclamação laranja por ícone informativo/mapa verde nos modais de funcionalidade futura, segregação estrita de catadores na aba Cidadãos do chat e campo Número tornado obrigatório (`*`). | Eliminar aspecto de erro/proibição em avisos de mapas, garantir que apenas cidadãos apareçam na lista de cidadãos para o admin e uniformizar validação de endereço. |
| 2026-09-01 | Chat / Identidade do Administrador | Resolução transparente e preservação do nome real do administrador no seletor de contatos, prevenindo substituição por texto institucional genérico. | Exibir o nome nominal fidedigno do administrador no dropdown para cidadãos e catadores. |
| 2026-09-01 | Chat / Resolução de Nomes via RPC | Chamada à função RPC `buscar_ofertante` e eliminação de placeholders genéricos repetidos (`"Cidadão Ofertante"`). | Exibir apenas nomes reais de cidadãos na lista do chat, sem duplicações de rótulos anônimos. |
| 2026-09-01 | Chat / Remoção de Hardcodes | Remoção total de nomes fixos/chumbados no código e resolução 100% dinâmica dos administradores e cidadãos via tabelas do banco de dados e RPC. | Assegurar que quaisquer administradores cadastrados ou editados no banco sejam exibidos dinamicamente no chat. |
| 2026-09-01 | QA / Documentação / PDF Oficial | Unificação de arquivos `.md` em `projeto_escrito/`, criação do Guia de Testes QA (`PLANO_DE_TESTES_QA.md`) e compilação do documento PDF oficial (`PLANO_DE_TESTES_QA.pdf`) com matriz de requisitos funcionais e cenários críticos. | Habilitar a equipe de QA a homologar 100% da aplicação com cobertura de segurança, fluxos funcionais e auditoria técnica. |
| 2026-09-01 | QA / Linguagem Acessível / Passo a Passo | Reescrita completa do Guia de Testes QA (`PLANO_DE_TESTES_QA.md`, `.html` e `.pdf`) em linguagem simples, prática e sem jargões técnicos, estruturada em blocos por perfil com passo a passo claro para estudantes e equipe de QA. | Facilitar a execução dos testes pelos universitários com instruções visuais diretas e critérios objetivos de aprovação/erro. |
| 2026-09-01 | Integração / Remoção de API Externa ViaCEP | Remoção completa de chamadas `fetch` à API pública do ViaCEP em `js/pages/enderecoForm.js` e `pages/editar-local.html`. Preservada a máscara de formatação `00000-000` do CEP e preenchimento 100% manual dos campos de endereço. | Eliminar dependência de APIs externas de terceiros no semestre atual, mantendo o sistema 100% autônomo com Supabase. |
| 2026-09-01 | UI / Dashboard Cidadão / QA Diferenciação Visual | Inclusão do card "Cadastrar Catador" (`cadastrar-catador.html`) no painel do cidadão (`pages/dashboard-cidadao.html`) e diferenciação cromática do Bloco do Cidadão (Âmbar/Laranja) vs Catador (Verde) e Admin (Azul) no Plano de Testes QA (`PLANO_DE_TESTES_QA.md` e `.pdf`). | Habilitar cidadãos a cadastrarem catadores sem smartphone pelo painel e aprimorar a legibilidade visual do guia de testes. |
| 2026-09-01 | UI / Dashboard Cidadão / QA Diferenciação Visual | Inclusão do card "Cadastrar Catador" (`cadastrar-catador.html`) no painel do cidadão (`pages/dashboard-cidadao.html`) e diferenciação cromática do Bloco do Cidadão (Âmbar/Laranja) vs Catador (Verde) e Admin (Azul) no Plano de Testes QA (`PLANO_DE_TESTES_QA.md` e `.pdf`). | Habilitar cidadãos a cadastrarem catadores sem smartphone pelo painel e aprimorar a legibilidade visual do guia de testes. |
| 2026-09-01 | UI / Ícone Cadastrar Catador | Adoção do ícone `fa-user-plus` em proporção visual calibrada (`2.25rem`) para "Cadastrar Catador" tanto no painel do administrador (`pages/dashboard-admin.html`) quanto no painel do cidadão (`pages/dashboard-cidadao.html`), na tela de cadastro (`pages/cadastrar-catador.html`) e no menu lateral (`js/lib/navMenu.js`). | Harmonizar a proporção e identidade do ícone em todos os painéis. |
| 2026-09-01 | UI / Dashboard Cidadão / Acesso ao Perfil | Remoção do card "Meu Perfil" exclusivamente da grade central do cidadão (`pages/dashboard-cidadao.html`), mantendo o acesso completo à edição de perfil através do botão de engrenagem no card de boas-vindas e no menu drawer lateral (`js/lib/navMenu.js`). | Otimizar a grade do cidadão focando em serviços operacionais e mantendo o acesso ao perfil via atalho nativo de configurações. |
| 2026-09-01 | UI / Dashboard Catador / Notificação Minimalista | Simplificação da faixa de notificação no topo do painel do catador (`pages/dashboard-catador.html`) para um banner discreto e em linha única, removendo botões redundantes e indicando que os ajustes de notificação são feitos em "Meu Perfil", preservando o grid de 8 cards (número par ideal para mobile). | Tornar a interface do catador mais limpa, sem poluição visual e com enquadramento harmonioso em celulares. |
| 2026-09-01 | QA / Padronização Visual do Guia de Testes | Uniformização de 100% dos blocos "O que deve acontecer" (`.test-result`) na cor verde padrão em todos os testes do guia (`PLANO_DE_TESTES_QA.html` e `.pdf`), inclusive no Bloco do Cidadão. | Assegurar que o resultado esperado positivo tenha semântica visual unificada em verde em todo o documento de testes. |
| 2026-09-01 | UI / Dashboard Catador / Quebra de Linha na Notificação | Ajuste da mensagem informativa da faixa de notificações no painel do catador (`pages/dashboard-catador.html`) para posicionar o texto de orientação na segunda linha, mantendo a leitura fluida e compacta. | Melhorar o layout tipográfico da faixa em telas de qualquer resolução. |
| 2026-09-01 | UI / Dashboard Catador / Clareza da Mensagem de Notificação | Substituição da menção a "Meu Perfil" por mensagens diretas e práticas ("Você receberá avisos automáticos de novos materiais disponíveis" quando ativadas, e "Clique em Ativar para receber alertas de materiais na tela" quando desativadas), alinhando o texto à presença imediata do botão Ativar no card. | Eliminar contradições e orientações desnecessárias no banner do catador. |

---

## 📌 Decisões Arquiteturais: Notificações & Integrações Post-MVP

### 1. Notificações do Catador: In-App Realtime vs API Externa (Resend / SMS)
* **Decisão MVP:** Implementação nativa via **Supabase Realtime (WebSockets) + In-App Interactive Toast + Web Audio API + Web Notifications API**.
* **Racional:**
  * **Custo Permanente Zero (R$ 0,00):** Elimina a necessidade de planos pagos ou limites do plano gratuito do Supabase (que restringe a 2 e-mails por hora).
  * **Instantaneidade:** Notificações em tempo real disparam em menos de 500ms diretamente para os catadores conectados.
  * **Resiliência Mobile:** O Toast In-App funciona mesmo em navegadores móveis onde Web Push exige permissões avançadas de sistema operacional.

### 2. Backlog de Integrações Externas (Fase Pós-Aprovação do MVP)
As seguintes integrações foram formalmente mapeadas e postergadas para implementação pós-MVP para preservar a entrega ágil e sem custos:
1. **Resend API / Twilio SMS:** Validação transacional de e-mail e telefone por código OTP e envio de SMS/e-mail para catadores offline (requer Cloud Functions/Edge Functions com secrets seguros).
2. **WhatsApp Business API:** Redirecionamento e webhooks para comunicação direta via WhatsApp.
3. **Google Maps Platform:** Mapas dinâmicos, geocodificação e cálculo de rotas otimizadas entre pontos de coleta.
4. **reCAPTCHA v3 / Cloudflare Turnstile:** Validação anti-robô no login e cadastro.

Falta ajustar a tela de mensagens do Admin e do catador: do admin está aparecendo para acionar cidadãos, e do catador reconhece o admin como cidadão comum.
Além disso, na tela de relatórios do catador, tem uma tela com 4 blocos que no mobile os dois da esquerda ficam maiores que os da esquerda.