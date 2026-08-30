# Histórico de Alterações e Rastreabilidade — Agentes de IA

**Projeto:** Sistema Reciclagem Solidária — Fatec Franco da Rocha  
**Diretriz:** Cumprimento da Regra 1 de Governança (`projeto_escrito/agentes.MD`: *"Toda alteração/ajustes/correção precisa ser registrada e rastreada"*).  
**Data:** 29/08/2026  

---

## 📋 Registro Consolidado de Modificações

| ID | Módulo / Tela | Descrição da Alteração | Racional / Motivo Técnico | Arquivos Impactados |
|---|---|---|---|---|
| **ALT-01** | **Locais de Coleta & Schema** | Remoção de referências fixas a "Pouso Alegre" nos fallbacks e valores padrão, substituindo por "Centro" ou consulta dinâmica. | Corrigir discrepância de localização territorial da Fatec Franco da Rocha. | `js/services/coletas.js`, `db/schema.sql` |
| **ALT-02** | **Identificação de Catadores** | Remoção de badges, tags e sufixos `(Sem App)` nos nomes de catadores cadastrados por terceiros. | Eliminar rótulo estigmatizante ou desnecessário na UI, mantendo a experiência limpa e respeitosa. | `pages/catadores-cadastrados.html`, `pages/usuarios-cadastrados.html`, `pages/gestao-coletas.html`, `pages/mensagens.html` |
| **ALT-03** | **Agenda Mobile & Enquadramento** | Ajuste do layout responsivo dos horários nas células do calendário (`.calendar-day-cell`, `.day-status-label`), formatando como `8h-17h` em linha única. | Impedir quebra de linha de horários em telas menores (smartphones 320px–380px). | `css/style.css`, `js/pages/calendarPicker.js` |
| **ALT-04** | **Agenda: Dinamismo de Seleção** | Estilização CSS imediata para botões de dias da semana inativos (`#weekdays-group .btn-tab:not(.active)` com visual suave desabilitado em vermelho/rosa claro). | Evitar que o botão desabilitado permaneça verde durante o hover/foco do mouse. | `css/style.css`, `pages/definir-agenda.html` |
| **ALT-05** | **Agenda: Flexibilidade (Sábados/Dias Específicos)** | Criação de modal interativo ao clicar em qualquer dia no calendário em modo administrador, permitindo personalizar horários de início/fim daquele dia específico ou aplicar a todos os sábados do mês. | Permitir flexibilidade operacional (ex: sábado com horário reduzido das 08h às 12h ou dias com horários atípicos). | `js/pages/calendarPicker.js`, `pages/definir-agenda.html` |
| **ALT-06** | **Navegação & Mapas** | Padronização dos botões "Ver no Mapa" para exibir modal informativo de funcionalidade futura (comportamento análogo ao botão do WhatsApp), preservando o código de integração/iframe comentado. | Manter consistência de funcionalidades em desenvolvimento e respeitar a decisão de backlog sem mapa dinâmico ativo. | `js/pages/catadorMateriais.js`, `pages/editar-local.html` |
| **ALT-07** | **Locais de Coleta: Consistência de Status** | Correção de `listarLocaisRetirada()` para retornar lista vazia quando todos os locais forem desativados (eliminando mock que forçava reaparecimento do local desativado). | Garantir que o status inativo de um local seja estritamente respeitado na tela de "Inserir Material". | `js/services/coletas.js`, `js/pages/inserirMaterial.js` |
| **ALT-08** | **Locais de Coleta: Trava de Segurança Mínima** | Bloqueio de desativação e exclusão quando restar apenas 1 local ativo no sistema, acompanhado de alerta explicativo. | Evitar que o sistema fique inoperante e disfuncional por ausência total de pontos de recebimento de recicláveis. | `pages/editar-local.html`, `js/pages/inserirMaterial.js` |
| **ALT-09** | **Relatórios: Separação de Local e Bairro** | Desacoplamento de localidade, bairro e cidade em colunas distintas nas tabelas e no arquivo consolidado CSV/Excel, eliminando concatenações ambíguas (`Não Informado / Centro` ou `Fatec / Centro`). | Clareza na leitura dos dados analíticos, distinguindo claramente o ponto físico do bairro territorial. | `js/services/relatorios.js`, `js/pages/relatorios.js` |
| **ALT-10** | **Publicações: Ajuste de Layout & Autor** | Correção visual do campo "Conteúdo / Descrição" (eliminando glifo de quadradinho) e correção da consulta de autores em `cidadao` (removendo coluna inexistente `auth_user_id`), exibindo o nome do Administrador autor no feed. | Garantir identificação clara de qual administrador publicou cada comunicado ou campanha educativa. | `pages/publicacoes.html`, `pages/admin-publicacoes.html` |
| **ALT-11** | **Minhas Ofertas (Cidadão)** | Correção de `ReferenceError: dataFormatada is not defined` no loop de renderização de cards em `minhasColetas.js`, permitindo o carregamento completo do histórico de ofertas do cidadão. | Restaurar o funcionamento do feed de ofertas do cidadão e acompanhamento de agendamentos. | `js/pages/minhasColetas.js` |
| **ALT-12** | **Visualização de Senha (Olho)** | Adicionado botão interativo com ícone de olho (`fa-eye` / `fa-eye-slash`) nos campos de senha e confirmação de senha do cadastro e login. | Melhorar a usabilidade e acessibilidade na digitação de senhas. | `pages/cadastro.html`, `pages/login.html` |
| **ALT-13** | **Gestão de Locais: Import de Modal e Estilo** | Importação de `showAlertModal` em `editar-local.html` (evitando erro silencioso que impedia a exibição do alerta de bloqueio) e refinamento do botão "Editar Dados" com estilo verde destacado. | Fornecer feedback visual explícito de que o único local ativo não pode ser desativado/excluído e destacar o botão de edição. | `pages/editar-local.html`, `js/pages/catadorMateriais.js` |
| **ALT-14** | **Agenda: Persistência de Edições do Modal** | Corrigida a inicialização de `_calendarPendingMap` em `calendarPicker.js` que reinicializava o mapa a cada renderização, garantindo que "Aplicar a este Dia" e "Aplicar a todos os Sábados do Mês" reflitam imediatamente na grade e sejam salvos no banco. | Permitir que o administrador configure e visualize horários específicos para sábados e datas pontuais. | `js/pages/calendarPicker.js`, `pages/definir-agenda.html` |
| **ALT-15** | **Relatórios: Padronização de Colunas (Apenas Bairro)** | Padronização dos cabeçalhos, títulos de tabelas e planilhas exportadas de "Bairro / Região" para simplesmente "Bairro" tanto na visão de Catadores quanto de Cidadãos. | Eliminar inconsistência terminológica entre rankings e mapeamentos territoriais. | `js/pages/relatorios.js` |
| **ALT-16** | **Mensagens: Identificação de Datas e Divisores Diários** | Inclusão de formatação completa de data/hora nos balões de conversa (`Hoje às 14:30`, `Ontem às 09:15`, `29/08/2026 às 16:40`) e inserção de divisores diários (`29 de Agosto de 2026`) no histórico de chat. | Permitir que o usuário identifique com clareza em quais dias as mensagens e respostas foram trocadas. | `pages/mensagens.html`, `js/lib/modal.js` |
| **ALT-17** | **Inserir Material: Modal de Confirmação & Decisão de Redirecionamento** | Substituição do aviso inline com temporizador automático por modal padronizado do sistema (`showConfirmModal`), oferecendo escolha explícita ao usuário: ir para "Minhas Ofertas" ou continuar na tela cadastrando outros materiais. | Evitar redirecionamento abrupto/involuntário e padronizar o visual de confirmação com a identidade visual do app. | `js/pages/inserirMaterial.js`, `js/lib/modal.js` |
| **ALT-18** | **Modais do Sistema: Padronização de Botões de Ação** | Alteração do botão de retorno/desistência para `Voltar` (eliminando a ambiguidade "Cancelar" vs "Sim, Cancelar") e definição de textos afirmativos claros (`Sim, Cancelar Oferta`, `Sim, Confirmar Retirada`, `Sim, Redisponibilizar`). | Garantir distinção inequívoca entre qual botão confirma e qual botão aborta a ação. | `js/lib/modal.js`, `js/pages/minhasColetas.js` |
| **ALT-19** | **Agenda & Agendamento: Suporte a Múltiplos Turnos / Intervalos** | Implementação de múltiplos turnos de atendimento (ex: 1º Turno das 08h às 12h e 2º Turno das 14h às 19h) tanto na grade de configuração e geração automática mensal quanto na seleção dinâmica de horários pelo catador. | Permitir flexibilidade total para pontos de coleta que fecham para almoço ou operam em múltiplos intervalos diários. | `js/pages/calendarPicker.js`, `pages/definir-agenda.html`, `js/services/agenda.js`, `js/pages/catadorMateriais.js` |
| **ALT-20** | **Fotos de Materiais: Pré-visualização, Persistência Resiliente & Renderização Visual** | Adicionado container de prévia ao vivo com botão de exclusão no formulário de inserção; aprimorada a compressão Base64 com fallback garantido de gravação na coluna `foto_url`; e implementado card visual de foto e indicador de status nas telas do Catador, Cidadão e Admin com modal de zoom em alta resolução. | Garantir que o cidadão veja a foto selecionada, que a imagem seja 100% gravada no Supabase e que o catador visualize a foto do material a ser recolhido. | `pages/inserir-material.html`, `js/pages/inserirMaterial.js`, `js/services/materiais.js`, `js/pages/catadorMateriais.js`, `js/pages/minhasColetas.js`, `pages/gestao-coletas.html` |
| **ALT-21** | **Publicações: Identificação Dinâmica do Nome Real do Administrador** | Desacoplamento da string estática "Administrador Fatec" para recuperar e exibir o nome individual do administrador responsável pela publicação (cruzando `autor_id` com a base de usuários e cache de sessão). | Permitir que diferentes administradores sejam identificados com seus nomes reais nas postagens e campanhas educativas. | `pages/publicacoes.html`, `pages/admin-publicacoes.html` |
| **ALT-22** | **Notificações do Catador: In-App Toast, Alerta Sonoro & Realtime sem Custo** | Correção do escopo do Service Worker, criação de sintetizador sonoro com Web Audio API e exibição prioritária de Toast Interativo com link direto para agendamento de novas coletas em tempo real (0 custo de API). | Garantir que o catador seja alertado instantaneamente tanto no app quanto pelo navegador quando novas ofertas surgirem. | `js/lib/pwa.js`, `pages/dashboard-catador.html`, `js/pages/catadorMateriais.js` |
| **ALT-23** | **Padronização de Dados de Entrada & Quantitativos Estruturados para BI** | Aprimoramento do Title Case (preservando preposições e conectivos), aplicação de máscaras estritas de telefone/CEP e substituição do campo livre de quantidade por seletor numérico + unidade padronizada (ex: "2 sacos grandes", "1 caixa", "15 kg"). | Evitar variações textuais ("um", "uma" vs "1"), padronizar o banco de dados e viabilizar consultas SQL e painéis analíticos/BI. | `js/lib/validation.js`, `pages/inserir-material.html`, `js/pages/inserirMaterial.js`, `js/pages/enderecoForm.js`, `pages/cadastro.html`, `pages/meu-perfil.html`, `pages/catadores-cadastrados.html` |
| **ALT-24** | **Ícone PWA: Eliminação de Borda Branca & Fundo Verde Homogêneo** | Regeneração dos ícones do manifesto PWA (`icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`) com preenchimento contínuo no tom `#e3f4e2` e centralização no safe zone. | Eliminar a borda branca indesejada ao fixar o aplicativo na tela inicial de smartphones Android e iOS. | `assets/icon-192.png`, `assets/icon-512.png`, `assets/icon-maskable-192.png`, `assets/icon-maskable-512.png`, `manifest.json` |
| **ALT-25** | **Mapa de Processo: Revisão e Confirmação de Dias/Horários da Unidade** | Inclusão de painel de revisão de dias/horários de atendimento do ponto selecionado no cadastro de materiais com trava de confirmação obrigatória e atalho para solicitar ajustes com o Administrador. | Alinhar o fluxo do sistema com a etapa do mapa de processo da Secretaria/Unidade ("Confirmar os dias e horários disponíveis para receber catadores"). | `pages/inserir-material.html`, `js/pages/inserirMaterial.js` |
| **ALT-26** | **Notificações por Desistência de Catador & Reabertura de Ofertas** | Implementação de botão de desistência/cancelamento de agendamento pelo catador e captura em tempo real no canal Realtime para notificar imediatamente todos os demais catadores sobre a liberação do lote. | Cumprir o fluxo de contingência do processo ("Recusar retirada -> Outros catadores serão notificados"). | `js/lib/pwa.js`, `js/pages/minhasColetas.js`, `js/services/coletas.js` |
| **ALT-27** | **Padronização Universal de E-mails em Caixa Baixa (Lowercase)** | Normalização automática de e-mails em caixa baixa nos campos de digitação (input/blur), no envio de formulários (cadastro, login, recuperação de senha, gestão de usuários) e nas chamadas de autenticação do Supabase. | Evitar falhas de login por divergência de maiúsculas/minúsculas e padronizar o banco de dados. | `js/lib/validation.js`, `js/services/auth.js`, `pages/cadastro.html`, `pages/login.html`, `pages/recuperar-senha.html`, `pages/meu-perfil.html`, `js/pages/cadastrarCatador.js`, `pages/usuarios-cadastrados.html` |
| **ALT-28** | **Padronização Estética de Banners de Alerta e Validação (Status Message)** | Unificação e aprimoramento das classes `.status-message` e `.feedback-msg` em `design-tokens.css` com bordas suaves, padding ergonômico, cores temáticas (`#ffebee` / `#c62828` para erro e `#e8f5e9` / `#1b6d24` para sucesso) e rolagem suave para o campo com pendência. | Garantir que todas as mensagens de erro e validação de formulários sigam o mesmo padrão estético e visual da aplicação. | `css/design-tokens.css`, `js/pages/inserirMaterial.js`, `pages/inserir-material.html` |
| **ALT-29** | **Trava Anti-Duplicação de Períodos e Turnos na Agenda** | Tratamento e desduplicação de turnos na inicialização do mapa, descarte automático de 2º turno idêntico ao 1º e bloqueio de inserção de múltiplos registros repetidos no banco em `salvarAgendaEmLote`. | Impedir a exibição e gravação de períodos duplicados (ex: `8h-17h / 8h-17h`), mantendo os dias com apenas 1 período quando os horários forem idênticos. | `js/pages/calendarPicker.js`, `js/services/agenda.js`, `js/pages/definirAgenda.js` |
| **ALT-30** | **Redesenho Ergonômico de Horários e Pausas em Períodos Fixos (Abertura, Fechamento e Almoço)** | Substituição do modelo confuso de "1º e 2º turnos" pelo fluxo intuitivo de Horário de Abertura/Fechamento com opção de Pausa para Almoço/Intervalo e atalhos rápidos (`12h-13h`, `12h-14h`, `13h-14h`). | Eliminar sobreposição de turnos (como `8h-12h / 8h-19h`), simplificar a operação do usuário e gerar intervalos matematicamente válidos. | `pages/definir-agenda.html`, `js/pages/calendarPicker.js` |
| **ALT-31** | **Consolidação & Fusão de Intervalos Sobrepostos da Agenda (`consolidarIntervalos`)** | Implementação de algoritmo matemático de merge de intervalos e ordenação cronológica para limpar registros legados ou conflitantes gravados na tabela `agenda`. | Fundir automaticamente horários sobrepostos (ex: `13:00 às 17:00 e 08:00 às 17:00 e 08:00 às 12:00` -> `08:00 às 17:00`), garantindo visualização limpa e consistente. | `js/pages/inserirMaterial.js`, `js/pages/calendarPicker.js` |
| **ALT-32** | **Ordenação Decrescente de Materiais & Indicadores em Relatórios (Ranking de Volume)** | Ordenação automática por volume total de ofertas (do maior volume para o menor) na aba "Volume por Material" e em todas as tabelas de mapeamento e exportação Excel/CSV. | Permitir análise analítica instantânea dos materiais mais descartados e demandados no município. | `js/pages/relatorios.js` |
| **ALT-33** | **Limpeza e Humanização de Feedbacks de Interface (Remoção de Jargões de Banco)** | Remoção de termos técnicos como "no banco de dados" e "no banco" de todas as mensagens de sucesso, status, estados vazios e alertas visuais de carregamento. | Proporcionar uma experiência de usuário profissional e natural (ex: *"Alterações da agenda salvas com sucesso!"*). | `pages/definir-agenda.html`, `js/pages/calendarPicker.js`, `js/pages/relatorios.js`, `pages/gestao-materiais.html`, `js/services/auth.js` |
| **ALT-34** | **Modelagem de Pausas & Intervalos no Banco de Dados (`public.agenda`)** | Adição das colunas `pausa_inicio time` e `pausa_fim time` e restrição `uq_agenda_local_data(local_retirada_id, data)` na tabela `public.agenda`. Camada JS com suporte nativo e fallback retrocompatível. | Representar pausas diretamente no modelo relacional do banco, garantindo 1 único registro conciso por data e eliminando duplicação de linhas. | `db/schema.sql`, `js/services/agenda.js`, `js/pages/calendarPicker.js`, `js/pages/catadorMateriais.js`, `js/pages/inserirMaterial.js` |
| **ALT-35** | **Simplificação Visual da Interface da Agenda (Remoção de Exemplos de Intervalo)** | Remoção de botões de atalhos rápidos/exemplos de intervalo (`12h-13h`, `12h-14h`, etc.) do formulário gerador e do modal de configuração por dia. | Eliminar poluição visual e manter os controles diretos e objetivos nos campos de horário. | `pages/definir-agenda.html`, `js/pages/calendarPicker.js` |
| **ALT-36** | **Padronização de Nomes e Endereço Completo de Pontos de Coleta / Maps** | Remoção do sufixo artificial "(Centro)" na listagem de pontos e composição fidedigna do endereço completo (`rua, numero, complemento, bairro, cidade - UF, CEP`) a partir dos dados reais do banco. | Exibir o local limpo e o endereço exato cadastrado da Fatec Franco da Rocha nos cards e no modal do Google Maps. | `js/pages/inserirMaterial.js`, `js/pages/catadorMateriais.js`, `js/pages/minhasColetas.js`, `pages/editar-local.html`, `js/pages/relatoriosCatador.js` |
| **ALT-37** | **Upsert Atômico na Agenda, Remoção de Chat com Admin em Inserir Material & Otimização Mobile Global** | Substituição de delete+insert por upsert atômico on conflict em `salvarAgendaEmLote`; remoção do botão de chat com admin em `inserir-material.html`; e refinamento responsivo mobile com sticky top-bar, hambúrguer não-sobreposto e quebra empilhada de horários na grade do calendário. | Eliminar erro de chave duplicada `uq_agenda_local_data`, alinhar fluxo de comunicação com regras de negócio e garantir enquadramento mobile impecável. | `js/services/agenda.js`, `pages/inserir-material.html`, `js/pages/inserirMaterial.js`, `css/style.css`, `css/design-tokens.css`, `js/pages/calendarPicker.js` |
| **ALT-38** | **Remoção de Opções Default/Hardcoded de Materiais no HTML** | Remoção de tags `<option>` fixas legadas em `pages/inserir-material.html`, tornando o seletor 100% dinâmico e estritamente populado pelo banco de dados. | Evitar exibição temporária de opções desatualizadas ou divergentes das cadastradas pelo administrador. | `pages/inserir-material.html`, `js/pages/inserirMaterial.js` |
| **ALT-39** | **Padronização e Alinhamento Preciso de Ícones e Elementos Mobile** | Aplicação de alinhamento vertical estrito (`inline-flex`, `vertical-align: middle`) em todos os ícones FontAwesome, disposição inline/horizontal do painel de cabeçalho mobile e distribuição simétrica de botões em cards. | Garantir que ícones em botões, abas, badges e cabeçalhos fiquem perfeitamente centralizados e sem quebras estranhas. | `css/style.css`, `pages/editar-local.html` |
| **ALT-40** | **Responsividade de Barras de Ação e Anti-Quebra Interna de Botões** | Adição de `white-space: nowrap` a botões de ação e `flex-wrap: wrap; gap: 10px;` em barras de cabeçalho (como *"Pontos de Retirada Cadastrados"* e *"Novo Local de Coleta"*). | Eliminar quebra interna de texto de botões e manter proporção visual em telas móveis. | `css/style.css`, `pages/editar-local.html`, `pages/minhas-coletas.html`, `pages/minhas-ofertas.html` |
| **ALT-41** | **Correção de Escape e Injeção de HTML no Atributo Title do Calendário** | Refatoração de `formatarLabelHorario` para retornar `{ html, texto }`, aplicando texto puro no atributo `title` da célula e spans semânticos apenas no corpo do DOM. | Eliminar quebra de aspas duplas no atributo HTML `title` que gerava resíduos de renderização (`e`, `14h-17h`, `">`) e ocultava o primeiro turno. | `js/pages/calendarPicker.js` |
| **ALT-42** | **Dimensionamento Uniforme e Enquadramento Simétrico de Abas/Filtros (Grid 2-Col)** | Configuração de CSS Grid com colunas e alturas padronizadas (`height: 38px`, `width: 100%`) para grupos de botões de filtro (`#filtros_coletas`, `#filtros_usuarios`, etc.) no desktop e mobile. | Garantir que todas as abas e botões de filtro tenham contornos e larguras iguais e simétricas, eliminando desalinhamento por variação de texto. | `css/style.css` |
| **ALT-43** | **Herança Inteligente do Padrão Semanal do Mês Anterior e Navegação Multi-Mês** | Implementação de `extrairPadraoSemanal`, navegação entre meses no calendário (`‹` e `›`) e projeção dinâmica dos próximos dias com base nas configurações vigentes da unidade. | Evitar exibição indevida de dias fechados em meses futuros e carregar automaticamente a grade com base no mês anterior para revisão do admin. | `js/pages/calendarPicker.js`, `pages/definir-agenda.html`, `js/pages/inserirMaterial.js` |
| **ALT-44** | **Orientação de Contato com Administradores na Confirmação da Agenda** | Inclusão do subtítulo orientativo *"Se não, entre em contato com um dos administradores para ajustar a agenda."* no box de revisão de horários e atualização da validação. | Guiar o cidadão/unidade sobre como proceder caso os horários exibidos precisem de ajuste antes da oferta ser publicada. | `pages/inserir-material.html`, `js/pages/inserirMaterial.js` |
| **ALT-45** | **Layout Inline para Quantidade e Unidade no Mobile (`.grid-qtd-inline`)** | Criação da classe `.grid-qtd-inline` com exclusão da regra de colapso de formulários em 1 coluna em telas `< 550px`. | Manter o campo numérico (`1`) e o dropdown de unidade (`caixa(s)`) perfeitamente alinhados lado a lado em uma única linha no smartphone. | `pages/inserir-material.html`, `css/style.css` |
| **ALT-46** | **Grid Simétrico e Centralizado para Seleção de Dias da Semana (`#weekdays-group`)** | Aplicação de CSS Grid com largura e altura uniformes (`38px`), 7 colunas proporcionais no desktop e 2 colunas com domingo estendido no mobile. | Eliminar formato de escadinha com larguras assimétricas e preencher a tela de forma balanceada e confortável. | `css/style.css`, `pages/definir-agenda.html` |
| **ALT-47** | **Grid Simétrico para Ações dos Cards de Locais de Coleta (`.card-acoes-local`)** | Criação da classe `.card-acoes-local` com CSS Grid de 4 colunas no desktop e 2 colunas simétricas no mobile (`repeat(2, 1fr)`). | Padronizar larguras e alturas (`36px`) dos botões de ação nos cards de locais, eliminando quebras desiguais e assimetrias. | `css/style.css`, `pages/editar-local.html` |
| **ALT-48** | **Enquadramento Estético e TitleCase nas Tabelas de Relatórios Territoriais** | Aplicação de `border-collapse: separate; border-spacing: 0;`, cantos arredondados na linha "Sem moradia", espaçamento de 9-10px e normalização para TitleCase. | Eliminar linhas cortadas abruptamente, alinhar cabeçalhos e padronizar a tipografia de bairros e municípios nos relatórios. | `js/pages/relatorios.js` |
| **ALT-49** | **Ajuste de Texto do Placeholder no Seletor de Mensagens** | Redução do texto padrão do dropdown de seleção para `"-- Selecione um Catador --"`. | Evitar que o texto longo ultrapasse a margem útil do campo e seja cortado pelo ícone de seta. | `pages/mensagens.html` |
| **ALT-50** | **Enquadramento do Botão Gerador de Agenda Recorrente** | Otimização do texto do botão para `GERAR AGENDA DO MÊS` e dinâmico `GERAR AGENDA DE [MÊS]`, com fonte em `0.92rem`. | Eliminar quebra em duas linhas e garantir exibição limpa e contínua do botão de ação. | `pages/definir-agenda.html`, `js/pages/definirAgenda.js` |
| **ALT-51** | **Enquadramento Estrutural Definitivo de Dias da Semana e Quadros de Relatórios** | Remoção de estilo inline em `#weekdays-group` e padronização global com `.relatorio-card-box`, `.relatorio-table-wrapper` e `.tabela-relatorio-clean`. | Garantir 7 colunas proporcionais no desktop e 2 colunas simétricas no mobile na agenda, além de enquadramento limpo com cabeçalho contrastante e sem cortes nas tabelas de relatórios. | `pages/definir-agenda.html`, `css/style.css`, `js/pages/relatorios.js`, `js/pages/relatoriosCatador.js` |
| **ALT-52** | **Carregamento de Perfil do Usuário e Consulta Interativa da Agenda Real** | Correção de variáveis não declaradas em Strict Mode em `meu-perfil.html`, fallback de email em `getPerfilAtual()`, sincronização fidedigna da agenda e modal interativo no calendário de consulta. | Restaurar o preenchimento automático de dados pessoais e endereço no Meu Perfil e garantir acesso transparente aos horários reais de atendimento aos catadores. | `pages/meu-perfil.html`, `js/services/auth.js`, `pages/agenda-horarios.html`, `js/pages/calendarPicker.js`, `pages/dashboard-catador.html`, `pages/dashboard-cidadao.html` |
| **ALT-53** | **Enquadramento Mobile de Relatórios do Catador e Segmentação de Destinatários no Chat** | Grid responsivo de 3 colunas desktop e 2 colunas mobile para abas do catador, labels otimizadas, eliminação de delay e agrupamento por optgroups (Cidadãos vs Admins). | Evitar cortes e quebras de botões em smartphones e permitir contato transparente entre Catadores, Administradores e Cidadãos sem delays de carregamento. | `pages/relatorios-catador.html`, `css/style.css`, `js/pages/relatoriosCatador.js`, `pages/mensagens.html` |

---

## 🔍 Detalhamento das Alterações Técnicas

### 1. Locais de Coleta (`coletas.js` e `schema.sql`)
* **Problema:** Ao desativar o local no banco, a função `listarLocaisRetirada` caía em um fallback com `Pouso Alegre`.
* **Solução:** Removido o array mockado de fallback em caso de resultado vazio. Atualizado o seed e default de `local_retirada` para `Centro`.

### 2. Remoção de "(Sem App)"
* **Problema:** Labels e badges com "(Sem App)" eram redundantes e desnecessários na interface.
* **Solução:** Removidas as tags e sufixos em `catadores-cadastrados.html`, `usuarios-cadastrados.html`, `gestao-coletas.html` e `mensagens.html`.

### 3. Responsividade e Flexibilidade da Agenda
* **Problema:** No mobile, os horários das células quebravam em múltiplas linhas; botões desativados ficavam verdes no hover; não era possível definir horário diferenciado aos sábados.
* **Solução:**
  * CSS com `font-size: 7.5px`, `white-space: nowrap` e `letter-spacing: -0.4px` para mobile.
  * Formatação compacta `8h-17h`, `8h-12h`.
  * Regras CSS específicas para `#weekdays-group .btn-tab:not(.active)` com cor de alerta imediata.
  * Modal interativo `abrirModalConfigurarDia` ao clicar em qualquer data na grade administrativa, com opção de definir horário inicial/final para a data ou replicar para todos os sábados/dias correspondentes do mês.

### 4. Funcionalidade Futura de Mapa & Quebra de Linhas no Modal
* **Problema:** O botão "Ver no Mapa" precisava exibir de forma padronizada o alerta de funcionalidade futura com suporte a múltiplas linhas no texto informativo.
* **Solução:** Ajustado `showAlertModal` com `white-space: pre-line` e padronizados todos os botões "Ver no Mapa" em `editar-local.html`, `catadorMateriais.js` e `minhasColetas.js`.

### 5. Validação de Pelo Menos 1 Local Ativo & Correção de Modais
* **Problema:** O modal de alerta de bloqueio não abria devido à falta do import de `showAlertModal` em `editar-local.html`; o botão "Editar Dados" exibia estilo cinza neutro.
* **Solução:** Importado `showAlertModal`, implementada a trava que bloqueia desativação/exclusão do único ponto ativo e estilizado o botão "Editar Dados" com destaque verde.

### 6. Minhas Ofertas (Cidadão)
* **Problema:** A tela ficava travada em "Carregando suas ofertas..." devido a uma variável não declarada (`dataFormatada`) dentro do loop de renderização de `minhasColetas.js`.
* **Solução:** Declaradas as variáveis `dataFormatada` e `dataAgendada` com tratamento de datas e renderização dos cards com agendamento.

### 7. Ícone de Olho para Visualizar Senha
* **Problema:** Não havia como conferir a senha digitada no momento do cadastro e login.
* **Solução:** Adicionado botão alternador com ícone de olho (`fa-regular fa-eye` / `fa-regular fa-eye-slash`) nos campos de senha em `cadastro.html` e `login.html`.

### 8. Fix na Aplicação de Horários para Sábados / Dias Específicos
* **Problema:** Ao clicar em "Aplicar a este Dia" ou "Aplicar a todos os Sábados do Mês", a grade reinicializava o mapa em memória com os dados antigos do banco, descartando a alteração recém-feita no modal.
* **Solução:** Ajustada a preservação de `window._calendarPendingMap` durante re-renderizações locais, permitindo atualizar o dia ou todos os sábados do mês e salvar as alterações com sucesso.

### 9. Padronização de Colunas de Bairro e Informação de Datas no Chat
* **Problema:** Cabeçalhos misturavam "Bairro / Região" com "Bairro" nos relatórios; o chat exibia apenas horários (ex: 14:30), dificultando conversas que transcorrem ao longo de vários dias.
* **Solução:** Unificação de todos os cabeçalhos para "Bairro" e implementação de timestamps com data (`Hoje às 14:30`, `29/08/2026 às 14:30`) e divisores visuais por dia no chat.

### 10. Inserir Material: Modal de Confirmação & Escolha de Navegação
* **Problema:** Ao cadastrar um material, a mensagem de sucesso era um aviso estático inline que redirecionava bruscamente em 1,8 segundos sem dar opção de continuar cadastrando outros materiais.
* **Solução:** Integração com o modal moderno do sistema (`showConfirmModal`), permitindo ao usuário decidir se quer navegar até suas ofertas ou continuar cadastrando materiais com o formulário limpo.

### 11. Desambiguação de Botões em Modais e Suporte a Múltiplos Turnos/Intervalos
* **Problema:** Ao cancelar uma oferta, a pergunta "Cancelar" ou "Sim, Cancelar" causava confusão sobre qual botão cancelava a oferta e qual cancelava a caixa de diálogo; a agenda permitia apenas um intervalo contínuo de horários.
* **Solução:**
  * Botão de abortar/fechar padronizado como "Voltar" e ação principal como "Sim, Cancelar Oferta".
  * Suporte nativo a 1º e 2º Turnos de atendimento (ex: 08h às 12h e 14h às 19h) na configuração de dias, grade visual e geração de horários para agendamento.

### 12. Gestão de Imagens e Fotos dos Materiais
* **Problema:** Não havia indicação visual de foto selecionada ao cadastrar o material; fotos podiam falhar silenciosamente se o bucket de storage estivesse sem acesso anônimo; e não havia indicação clara se uma oferta tinha ou não foto anexada na visão do Catador.
* **Solução:**
  * Adicionado preview ao vivo com miniatura, tamanho do arquivo e botão de exclusão em `inserir-material.html`.
  * Fallback resiliente que converte e comprime a foto para Base64 otimizado, gravando diretamente na coluna `foto_url` da tabela `coleta` no Supabase.
  * Renderização de cards de foto com badge de identificação, fallback com placeholder elegante ("Sem foto anexada pelo ofertante") e modal de ampliação em tela cheia ao clicar na foto.

### 13. Identificação do Nome Real do Administrador nas Publicações
* **Problema:** As postagens exibiam a autoria fixada como "Administrador Fatec", não distinguindo quando diferentes administradores publicavam no portal.
* **Solução:** Consulta dinâmica cruzada por `autor_id` com a tabela `cidadao` e dados do perfil logado, exibindo o nome real do administrador autor em cada publicação.

### 14. Notificações em Tempo Real do Catador sem Custo de API
* **Problema:** O catador não era alertado de novas ofertas devido a falhas no registro do Service Worker e dependência estrita de permissões manuais de push do navegador.
* **Solução:**
  * Correção do escopo do Service Worker.
  * Criação de alerta sonoro nativo via Web Audio API (0 arquivos externos).
  * Exibição prioritária de Toast Interativo com redirecionamento para `catador-materiais.html`, garantindo entrega de notificações em tempo real sem custo de integrações externas.

### 15. Padronização de Dados de Entrada & Quantitativos para BI
* **Problema:** Textos livres de quantidade geravam inconsistências (ex: "um", "uma", "1 saco", "2 caixas"), e campos de nomes/telefones não tinham masks nem tratamento de preposições em minúsculo.
* **Solução:**
  * Função `formatarNomeTitleCase` ajustada para preservar conectivos em minúsculo (`da, de, do, das, dos, e, em, na, no, nas, nos, com, para, por, sem`).
  * Máscara em tempo real para telefone `(XX) XXXXX-XXXX` e CEP `XXXXX-XXX`.
  * Formulário de inserção de material reestruturado com input numérico + seletor de unidade (`sacos grandes`, `caixas`, `kg`, etc.), gerando quantitativos padronizados com singular/plural corretos para consultas SQL e Dashboards de BI.

### 16. Ícone PWA e Fundo Homogêneo na Tela Inicial
* **Problema:** Ao adicionar o aplicativo à tela inicial de celulares, o ícone exibia uma borda branca ao redor do fundo verde do logotipo.
* **Solução:** Regenerados os ícones `icon-192.png`, `icon-512.png`, `icon-maskable-192.png` e `icon-maskable-512.png` com preenchimento contínuo no tom `#e3f4e2` e enquadramento adequado na safe zone.

### 17. Alinhamento com Mapa de Processo: Confirmação de Dias e Horários
* **Problema:** O cidadão (Secretaria/Unidade) cadastrava a coleta sem revisar a disponibilidade da agenda da unidade, desviando da etapa de confirmação do processo. Além disso, registros múltiplos de uma mesma data no banco geravam badges repetidos (ex: 31/08 três vezes) e o botão de chat não acionava o redirecionamento.
* **Solução:** Implementado box de revisão dinâmica em `inserir-material.html` com agrupamento e desduplicação inteligente por data única (`YYYY-MM-DD`), cálculo automático do dia da semana (`Seg 31/08`, `Ter 01/09`, etc.), exigência de confirmação obrigatória e redirecionamento funcional para o Chat (`mensagens.html`) via callback `onOk` em `showAlertModal`.

### 18. Notificações por Desistência de Catador & Reabertura de Ofertas
* **Problema:** Quando um catador cancelava um agendamento ("Recusar a retirada" no mapa de processo), os outros catadores não eram notificados em tempo real.
* **Solução:** Adicionado botão de cancelamento de agendamento em `minhasColetas.js` e aprimorado o ouvinte Realtime do Supabase em `pwa.js` para detectar quando uma oferta volta a ficar disponível e disparar alertas com áudio e toast instantâneo para todos os demais catadores.

### 19. Padronização Universal de E-mails em Caixa Baixa
* **Problema:** Usuários digitando e-mails com primeira letra maiúscula (recurso automático de teclados móveis) podiam enfrentar incompatibilidades e duplicidade aparente.
* **Solução:** Sanitização em tempo real (evento input/blur) em todos os formulários e normalização estrita para lowercase em todas as funções de autenticação e banco de dados.

### 20. Padronização Estética de Banners de Alerta e Validação
* **Problema:** Avisos de validação em "Inserir Material" eram exibidos com classes divergentes (`feedback-msg error`), perdendo o card estilizado com fundo vermelho suave e bordas arredondadas.
* **Solução:** Unificação de estilos para `.status-message` e `.feedback-msg` em `design-tokens.css` e aplicação consistente em `inserirMaterial.js`.

### 21. Trava Anti-Duplicação de Períodos e Turnos na Agenda
* **Problema:** Células da grade de calendário exibiam horários repetidos como `8h-17h / 8h-17h` quando havia múltiplos registros idênticos ou quando o segundo turno era ativado sem horários distintos.
* **Solução:** Implementada desduplicação na leitura inicial de `agendaData`, higienização automática ao salvar (`salvarAgendaEmLote` só grava 2º turno se os horários forem diferentes do 1º turno) e supressão de duplicidades na função `formatarLabelHorario`.

### 22. Redesenho Ergonômico de Horários e Pausas em Períodos Fixos (Abertura, Fechamento e Almoço)
* **Problema:** A definição por "1º e 2º turnos" exigia cálculo manual pelo usuário e provocava sobreposições confusas como `8h-12h / 8h-19h`.
* **Solução:** Redesenho completo para o modelo intuitivo de **Horário de Funcionamento Geral (Abertura e Fechamento)** com **Pausa para Almoço / Intervalo Fixo** opcional e atalhos ergonômicos (`12h às 13h`, `12h às 14h`, `13h às 14h`). O sistema decompõe automaticamente os períodos válidos (ex: `08h-12h e 14h-18h`), tornando a configuração natural e à prova de erros.

### 23. Consolidação & Fusão de Intervalos Sobrepostos da Agenda (`consolidarIntervalos`)
* **Problema:** Registros legados ou testes antigos gravados no banco para o dia 31/08 continham múltiplos horários (`13:00 às 17:00`, `08:00 às 17:00` e `08:00 às 12:00`), exibindo uma string concatenada estranha na tela do cidadão.
* **Solução:** Implementado algoritmo matemático de fusão de intervalos (`consolidarIntervalos`) em `inserirMaterial.js` e `calendarPicker.js` que une períodos sobrepostos ou contíguos e os ordena cronologicamente, exibindo uma única faixa limpa `08:00 às 17:00`.

### 24. Ordenação Decrescente de Materiais & Indicadores em Relatórios (Ranking de Volume)
* **Problema:** A tabela de volume por tipo de material exibia os dados na ordem em que vinham da agregação do banco, sem ordenação por relevância.
* **Solução:** Adicionada ordenação decrescente por total de ofertas na tabela de materiais, no ranking de bairros e no gerador consolidado de relatórios em Excel/CSV.

### 25. Limpeza e Humanização de Feedbacks de Interface (Remoção de Jargões de Banco)
* **Problema:** Mensagens de confirmação e status continham termos técnicos de infraestrutura como "no banco de dados" ou "no banco", destoando de padrões profissionais de UX.
* **Solução:** Substituição de jargões técnicos por mensagens claras e naturais (ex: *"Alterações da agenda salvas com sucesso!"*).

### 26. Modelagem de Pausas & Intervalos no Banco de Dados (`public.agenda`)
* **Problema:** A tabela `agenda` original continha apenas `hora_inicio` e `hora_fim`, forçando a criação de múltiplas linhas para a mesma data caso houvesse intervalo de almoço.
* **Solução:** Adicionadas as colunas `pausa_inicio time` e `pausa_fim time` com chave única `UNIQUE(local_retirada_id, data)` em `db/schema.sql`, simplificando a persistência para 1 linha concisa por data com suporte a fallback retrocompatível no front-end.

### 27. Simplificação Visual da Interface da Agenda
* **Problema:** Botões de atalho com exemplos de horários de almoço (`12h às 13h`, `12h às 14h`, etc.) ocupavam espaço desnecessário e poluíam visualmente a tela.
* **Solução:** Removidos os botões de atalho, mantendo a interface limpa e focada exclusivamente nos inputs diretos de início e término de pausa.

### 28. Padronização de Nomes e Endereço Completo de Pontos de Coleta / Maps
* **Problema:** O dropdown de inserção de material exibia `Fatec Franco da Rocha (Centro)` com o sufixo de bairro redundante/incorreto, e os modais de mapa recebiam uma query resumida que não refletia fielmente o endereço completo cadastrado no banco.
* **Solução:** Removido o sufixo `(Centro)` para exibir somente o nome limpo da unidade e construída a interpolação exata do endereço (`rua, numero, complemento, bairro, cidade - UF, CEP`) a partir dos dados do banco para os cards e alertas de mapa.

### 29. Upsert Atômico na Agenda, Remoção de Chat com Admin & Otimização Mobile Global
* **Problema:** Ao salvar a agenda, a execução de `delete` e `insert` em etapas separadas podia disparar erro de violação de chave única (`uq_agenda_local_data`); em "Inserir Material", havia um botão para contatar o admin que não condizia com o fluxo e com a sessão do próprio administrador; e na visualização mobile, o botão hambúrguer sobrepunha o título da página e as células do calendário exibiam horários truncados com reticências (`9h-12h e 13...`).
* **Solução:**
  * Implementação de `upsert` com `onConflict: 'local_retirada_id,data'` e deduplicação estrita via `Map` em `js/services/agenda.js`, garantindo persistência 100% atômica e imune a conflitos de chave única.
  * Remoção do botão de solicitação de ajuste ao administrador em `pages/inserir-material.html` e `js/pages/inserirMaterial.js`.
  * Fix de enquadramento mobile em `css/style.css`, `css/design-tokens.css` e `js/pages/calendarPicker.js`, tornando a top-bar sticky (48px) com o botão hambúrguer integrado sem sobreposição, e dividindo turnos múltiplos em linhas empilhadas e perfeitamente legíveis dentro das células do calendário.

### 30. Remoção de Opções Default/Hardcoded de Materiais no HTML
* **Problema:** O elemento `<select id="cod_material">` continha opções estáticas embutidas no HTML (`Papel / Papelão`, `Plástico / PET`, etc.), que apareciam temporariamente antes do carregamento do banco de dados.
* **Solução:** Removidas as tags estáticas do HTML de `pages/inserir-material.html` e configurado o select para ser preenchido dinamicamente e exclusivamente a partir da tabela `materiais` do banco de dados.

### 31. Padronização e Alinhamento Preciso de Ícones e Elementos Mobile
* **Problema:** No mobile, os ícones apareciam desalinhados verticalmente em relação ao texto dos botões, e o cabeçalho superior (`.left-panel`) forçava ícones empilhados verticalmente sobre os títulos.
* **Solução:** Aplicada regra CSS global de centralização vertical para todos os ícones FontAwesome (`inline-flex`, `vertical-align: middle`), reestruturado o cabeçalho mobile para exibição horizontal inline e ajustada a distribuição simétrica dos botões de ação nos cards.

### 32. Responsividade de Barras de Ação e Anti-Quebra Interna de Botões
* **Problema:** Em telas estreitas, o título "Pontos de Retirada Cadastrados" e o botão "+ Novo Local de Coleta" disputavam espaço sem quebra controlada, forçando o texto do botão a se quebrar em 2 linhas e deixando o ícone `+` isolado verticalmente.
* **Solução:** Adicionada a regra `white-space: nowrap` para botões do sistema e aplicado `flex-wrap: wrap; gap: 10px;` no cabeçalho em `pages/editar-local.html`, `pages/minhas-coletas.html` e `pages/minhas-ofertas.html`.

### 33. Correção de Escape e Injeção de HTML no Atributo Title do Calendário
* **Problema:** A formatação com spans HTML para dividir turnos no mobile continha aspas duplas (`class="t-p1"`), que ao serem inseridas no atributo HTML `title="..."` da célula causavam fechamento prematuro do atributo, gerando quebra visual com resíduos (`e`, `14h-17h`, `">`) e ocultando o primeiro turno.
* **Solução:** `formatarLabelHorario` foi atualizada para gerar separadamente `{ html, texto }`, aplicando o texto puro sem tags no atributo `title` e o HTML formatado exclusivamente dentro do corpo do elemento.

### 34. Dimensionamento Uniforme e Enquadramento Simétrico de Abas/Filtros (Grid 2-Col)
* **Problema:** As abas e botões de filtro exibiam larguras variáveis e assimétricas de acordo com a quantidade de caracteres do texto (ex: `Todas` muito curto e `Canceladas` isolado em linha separada).
* **Solução:** Implementado CSS Grid com larguras e alturas uniformes (`height: 38px; width: 100%;`) em `#filtros_coletas`, `#filtros_usuarios`, `#filtros_catadores` e `#tabs_relatorios`, gerando pares perfeitos de 2 colunas no mobile e alinhamento simétrico no desktop.

### 35. Herança Inteligente do Padrão Semanal do Mês Anterior e Navegação Multi-Mês
* **Problema:** Meses futuros não salvos no banco exibiam fallback genérico de Segunda a Sexta 8h-17h, ignorando dias fechados (como fins de semana) ou pausas de almoço configuradas pelo administrador.
* **Solução:** Desenvolvida a função `extrairPadraoSemanal(agendaData)` para capturar o padrão real de cada dia da semana a partir do histórico/mês anterior. A agenda agora possui controles de navegação multi-mês (`‹` e `›`) que herdam automaticamente esse padrão para meses futuros, e a tela de materiais projeta apenas dias liberados com os horários e pausas reais configurados.

### 36. Orientação de Contato com Administradores na Confirmação da Agenda
* **Problema:** Caso a unidade não estivesse disponível nos dias/horários exibidos no resumo, o ofertante não tinha uma instrução explícita sobre o que fazer antes de enviar a oferta.
* **Solução:** Adicionado o subtítulo informativo *"Se não, entre em contato com um dos administradores para ajustar a agenda."* abaixo do checkbox em `pages/inserir-material.html`, acompanhado da mensagem de validação no formulário em `js/pages/inserirMaterial.js`.

### 37. Layout Inline para Quantidade e Unidade no Mobile (`.grid-qtd-inline`)
* **Problema:** A regra responsiva global de 1 coluna em telas estreitas quebrava o campo de quantidade numérica (`1`) e o seletor de unidade (`caixa(s)`) em duas linhas separadas, ocupando espaço vertical desnecessário.
* **Solução:** Adicionada a classe `.grid-qtd-inline` com preservação estrita de `grid-template-columns: 75px 1fr` em todas as resoluções, mantendo ambos os campos em uma única linha no mobile.

### 38. Grid Simétrico e Centralizado para Seleção de Dias da Semana (`#weekdays-group`)
* **Problema:** Os botões dos dias da semana em "Definir Agenda" possuíam larguras irregulares e formato de escadinha com o domingo isolado de forma assimétrica.
* **Solução:** Implementado CSS Grid com largura total (`100%`) e altura padronizada (`38px`), exibindo 7 colunas proporcionais no desktop e 2 colunas simétricas no mobile com o domingo ocupando a linha de forma equilibrada (`span 2`).

### 39. Grid Simétrico para Ações dos Cards de Locais de Coleta (`.card-acoes-local`)
* **Problema:** Os botões dos cards de pontos de coleta (`Ver no Mapa`, `Editar Dados`, `Desativar`, `Excluir`) quebravam em linhas desiguais com larguras variáveis.
* **Solução:** Aplicada a classe `.card-acoes-local` com CSS Grid de 4 colunas no desktop e 2 colunas simétricas no mobile (`repeat(2, 1fr)`), com altura padronizada (`36px`) e botões com 100% de preenchimento.

### 40. Enquadramento Estético e TitleCase nas Tabelas de Relatórios Territoriais
* **Problema:** Na visualização de Mapeamento Territorial, o destaque da linha "Sem moradia" possuía cantos retos e recortados; os bairros exibiam inconsistências de caixa alta (ex: `ÁGUA VERMELHA`); e as tabelas careciam de padding e enquadramento suave.
* **Solução:** Implementado `border-collapse: separate; border-spacing: 0;`, cantos arredondados (`border-radius: 8px`) na linha de destaque "Sem moradia", padding de `9px 10px`, bordas suaves `#f0f0f0` e normalização universal de nomes e bairros com `formatarNomeTitleCase`.

### 41. Ajuste de Texto do Placeholder no Seletor de Mensagens
* **Problema:** O texto `"-- Selecione um Catador para Conversar --"` ultrapassava a largura útil do select em telas menores, colidindo e sendo truncado pelo ícone da seta.
* **Solução:** Simplificado para `"-- Selecione um Catador --"`, garantindo legibilidade completa e enquadramento limpo em qualquer resolução.

### 42. Enquadramento do Botão Gerador de Agenda Recorrente
* **Problema:** O texto do botão `GERAR AGENDA AUTOMÁTICA (MÊS ATUAL)` quebrava em duas linhas de forma assimétrica em telas mobile e compactas.
* **Solução:** Texto ajustado para `GERAR AGENDA DO MÊS` (e dinâmico `GERAR AGENDA DE [MÊS]`), com tamanho de fonte otimizado (`0.92rem`), cabendo perfeitamente em 1 linha e com leitura clara.

### 43. Enquadramento Estrutural Definitivo de Dias da Semana e Quadros de Relatórios
* **Problema:** O container `#weekdays-group` mantinha um estilo inline `display: flex; gap: 8px; flex-wrap: wrap;` que anulava a distribuição simétrica em colunas. As tabelas de relatórios não possuíam encapsulamento unificado com cards, wrappers e cabeçalhos verdes contrastantes.
* **Solução:** Removido o estilo inline no HTML e configurado CSS Grid nativo de 7 colunas no desktop e 2 colunas no mobile (`repeat(2, 1fr)` com domingo em `span 2`). Criadas as classes `.relatorio-card-box`, `.relatorio-table-wrapper`, `.tabela-relatorio-clean` e `.grid-relatorios-duplo`, padronizando todas as tabelas com cabeçalhos `#e8f5e9`, cantos arredondados, bordas suaves e destaque perfeito para linhas especiais.

### 44. Carregamento de Perfil do Usuário e Consulta Interativa da Agenda Real
* **Problema:** No arquivo `pages/meu-perfil.html`, as variáveis `perfilAtual` e `isMainAdmin` eram atribuídas sem declaração explícita (`let`), disparando exceção `ReferenceError` em ES Modules e interrompendo o preenchimento de nome, e-mail, telefone e endereço. Na visualização de agenda para catadores/cidadãos, `agenda-horarios.html` iniciava com array vazio e travava o mapa de memória antes da chegada da resposta do Supabase, além de não oferecer clique interativo para ver detalhes do horário.
* **Solução:** Declaradas as variáveis no topo do módulo e encapsulada a inicialização em `inicializarPerfil()` em `pages/meu-perfil.html`. Adicionado fallback de consulta por e-mail em `getPerfilAtual()` em `js/services/auth.js`. Em `pages/agenda-horarios.html`, integrado `resetCalendarPendingMap(null)` e, em `js/pages/calendarPicker.js`, adicionado ouvinte de clique com modal detalhado (`showAlertModal`) contendo data, dia da semana, status de atendimento e horários completos da unidade. Adicionado atalho direto "Meu Perfil" nos dashboards.

### 45. Enquadramento Mobile de Relatórios do Catador e Segmentação de Destinatários no Chat
* **Problema:** Na tela de relatórios do catador (`pages/relatorios-catador.html`), o botão "Pontos de Coleta Mais Buscados" possuía texto longo e quebrava assimetricamente com o terceiro botão isolado na linha de baixo. Na central de mensagens (`pages/mensagens.html`), o select exibia inicialmente o texto estático "-- Selecione um Catador --" durante o carregamento inicial, gerando atraso perceptível antes de carregar o perfil do catador, além de não separar visualmente quem é administrador e quem é cidadão doador.
* **Solução:** Configurado CSS Grid dedicado para `#tabs_relatorios_catador` com 3 colunas no desktop e 2 colunas simétricas no mobile (`repeat(2, 1fr)` com "Status das Coletas" em `span 2`), com labels concisas ("Materiais", "Locais Atendidos" e "Status das Coletas"). Na tela de mensagens, o placeholder inicial foi neutralizado para "-- Carregando conversas... --" e a busca de contatos foi segmentada em `<optgroup>` distintos para "Administração do Sistema" e "Cidadãos (Ofertas & Dúvidas de Coletas)" (e reciprocamente para cidadãos e admins), permitindo aos catadores contatar a administração a qualquer momento de forma intuitiva.