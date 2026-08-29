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