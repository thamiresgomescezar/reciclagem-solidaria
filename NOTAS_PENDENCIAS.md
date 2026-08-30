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