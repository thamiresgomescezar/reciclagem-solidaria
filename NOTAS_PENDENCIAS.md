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
