# 📋 GUIA PRÁTICO DE TESTES DA APLICAÇÃO (PASSO A PASSO)
## Sistema Reciclagem Solidária — Fatec Franco da Rocha

**Objetivo:** Guia passo a passo para a equipe de testes (QA) validar todas as telas, funções e regras reais do sistema de forma simples, prática e sem termos técnicos complexos.

> 📱💻 **Inspeção Geral Obrigatória (Web & Celular):** Abra e navegue por **todas as telas de cada um dos 3 perfis** tanto no computador quanto no celular. Caso note qualquer botão fora do lugar, texto desconfigurado ou comportamento inesperado, anote e tire print da tela!

---

## 👥 Conhecendo os 3 Tipos de Usuários do Sistema

Antes de começar os testes, é importante entender os 3 perfis que usam a plataforma:

1. **🟠 Cidadão Consciente:** Disponibiliza e doa materiais recicláveis.
2. **🟢 Catador Autônomo:** Agenda e retira materiais recicláveis.
3. **🔵 Administrador:** Gerencia o sistema (usuários, agenda e relatórios).

---

## 🔴 BLOCO 1: TESTES IMPORTANTES DE ACESSO, SEGURANÇA E SENHAS

### 🧪 Teste 01: Bloqueio Cruzado de Telas Restritas e Retorno Resiliente ao Painel
* **O que testar:** Garantir que ninguém consiga invadir telas de outros perfis pela URL direta e comprovar que os botões "Voltar ao Painel" em páginas compartilhadas levem cada perfil com 100% de precisão ao seu painel correto, sem falso aviso de "Acesso restrito".
* **Como fazer (Passo a Passo):**
  1. **Teste Anônimo (Sem Login):** Em uma aba anônima, tente abrir direto:
     - `http://localhost:8080/pages/dashboard-admin.html`
     - `http://localhost:8080/pages/definir-agenda.html`
     - `http://localhost:8080/pages/mensagens.html`
     - `http://localhost:8080/pages/meu-perfil.html`
  2. **Teste Cidadão tentando ver Telas do Admin ou Catador:** Faça login como **Cidadão Consciente** e tente abrir:
     - `http://localhost:8080/pages/relatorios.html` (Admin)
     - `http://localhost:8080/pages/definir-agenda.html` (Admin)
     - `http://localhost:8080/pages/usuarios-cadastrados.html` (Admin)
     - `http://localhost:8080/pages/catador-materiais.html` (Catador)
  3. **Teste Catador tentando ver Telas do Cidadão ou Admin:** Faça login como **Catador** e tente abrir:
     - `http://localhost:8080/pages/inserir-material.html` (Cidadão)
     - `http://localhost:8080/pages/dashboard-cidadao.html` (Cidadão)
     - `http://localhost:8080/pages/relatorios.html` (Admin)
     - `http://localhost:8080/pages/definir-agenda.html` (Admin)
  4. **Teste de Retorno ao Painel a partir de Telas Compartilhadas:** Logado como **Catador**, acesse `pages/agenda-horarios.html`, `pages/publicacoes.html` ou `pages/catadores-cadastrados.html` e clique no botão **Voltar ao Painel**.
* **O que deve acontecer na tela:**
  - Usuário sem login é mandado imediatamente para a tela de **Login** (`pages/login.html`).
  - Usuário logado que tentar ver tela de outro perfil recebe um aviso amigável na tela informando que **seu perfil não tem permissão para acessar aquela página** e é redirecionado de volta para o seu próprio painel.
  - Ao clicar em "Voltar ao Painel" nas telas compartilhadas, o Catador volta com sucesso para o **Painel do Catador** (`pages/dashboard-catador.html`), sem receber falso alerta de acesso restrito.

---

### 🧪 Teste 02: Suporte e Orientação para Recuperação de Senha
* **O que testar:** Como o sistema orienta o usuário de forma simples e acolhedora em português caso precise restabelecer seu acesso, mantendo o login seguro e sem links quebrados.
* **Como fazer (Passo a Passo):**
  1. Acesse a tela de **Login** (`pages/login.html`) e veja que a interface é limpa e direta.
  2. Na barra de endereços do navegador, acerte o link direto para `http://localhost:8080/pages/recuperar-senha.html`.
  3. Observe as informações apresentadas na tela e clique no botão **Voltar ao Login**.
* **O que deve acontecer na tela:**
  - A tela de Login apresenta apenas os campos essenciais de e-mail e senha com o botão de login.
  - Ao abrir `pages/recuperar-senha.html`, o sistema exibe aviso informando que a recuperação automática está desabilitada e orienta a contatar os desenvolvedores ou a administração da Fatec para restabelecer o acesso.
  - O botão de voltar retorna o usuário em segurança para a tela de login.

---

### 🧪 Teste 03: Tentar cadastrar com e-mail que já existe
* **O que testar:** O sistema não pode deixar criar duas contas com o mesmo e-mail.
* **Como fazer (Passo a Passo):**
  1. Vá na tela de **Cadastro** (`pages/cadastro.html`).
  2. Preencha o formulário usando um e-mail que já foi cadastrado antes.
  3. Clique em **Cadastrar**.
* **O que deve acontecer na tela:** Aparece um aviso na tela informando: *"Este e-mail já está cadastrado no sistema."* sem travar a tela.

---

### 🧪 Teste 04: Login com senha incorreta
* **O que testar:** Senha errada não pode entrar no sistema.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Login** (`pages/login.html`), digite um e-mail correto e uma senha qualquer errada.
  2. Clique em **Entrar**.
* **O que deve acontecer na tela:** Mostra o aviso: *"E-mail ou senha incorretos."* e não entra na conta.

---

### 🧪 Teste 05: Dois catadores tentando agendar a mesma oferta juntos
* **O que testar:** Impedir que dois catadores peguem a mesma doação ao mesmo tempo (bloqueio de concorrência).
* **Como fazer (Passo a Passo):**
  1. Abra dois navegadores (ou celular e computador) com duas contas de Catadores diferentes.
  2. Abra a mesma oferta disponível e clique em **Agendar Retirada** quase juntos nos dois aparelhos.
* **O que deve acontecer na tela:** O primeiro que clicar agenda com sucesso. O segundo recebe um aviso de que *a oferta já foi agendada por outro catador*.

---

## 🟠 BLOCO 2: TESTES DO FLUXO DO CIDADÃO CONSCIENTE

### 🧪 Teste 06: Criar Conta, Senhas Divergentes e "Sem Moradia"
* **O que testar:** Validação de senhas divergentes, preenchimento de endereço e opção "Sem moradia".
* **Como fazer (Passo a Passo):**
  1. Acesse a tela de **Cadastro** (`pages/cadastro.html`). Digite senhas que não coincidem e tente enviar (veja o alerta barrando o cadastro).
  2. Digite os 8 números do CEP (veja se o sistema coloca o traço sozinho: `00000-000`) e preencha o endereço. Tente salvar sem o número da residência (veja se ele exige o preenchimento).
  3. *Cenário Sem Moradia:* Ao marcar *"Sem moradia"*, os campos somem e o sistema limpa os dados para evitar inconsistências.
* **O que deve acontecer na tela:** O sistema barra senhas divergentes ou dados obrigatórios faltantes, e cria a conta no Painel do Cidadão (`pages/dashboard-cidadao.html`).

---

### 🧪 Teste 07: Doar / Ofertar Material Reciclável com Foto Opcional e Isolamento de Alertas
* **O que testar:** Cadastro de uma doação com foto opcional, ponto de entrega ativo e comprovação de que o Cidadão que posta NÃO recebe o alerta de nova oferta (alerta exclusivo de catadores).
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Inserir Material** (`pages/inserir-material.html`).
  2. Escolha o tipo de material (ex: *Papelão*, *Plástico*) e o peso aproximado (ex: *15 kg*).
  3. Anexe uma foto (opcional: o sistema conclui normalmente sem foto). Se anexar, veja a prévia e o botão **✕** para remover.
  4. Escolha o ponto de entrega ativo (ex: *Fatec Franco da Rocha*) e clique em **Disponibilizar Material**.
* **O que deve acontecer na tela:** Mostra mensagem verde de sucesso e o material passa a constar na lista de coletas para os catadores. O Cidadão **não** recebe pop-ups ou sons de *"Nova Oferta Disponível"* (garantindo o isolamento estrito de perfis).

---

### 🧪 Teste 08: Ver "Minhas Ofertas" e testar os botões de filtro
* **O que testar:** Acompanhar as ofertas e filtrar por status.
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Minhas Ofertas** (`pages/minhas-ofertas.html`).
  2. Veja se a doação cadastrada aparece na lista.
  3. Clique nos botões de filtro: **Todas**, **Agendadas** e **Concluídas**.
* **O que deve acontecer na tela:** A lista filtra na hora e os números ao lado dos botões `(1)`, `(0)` mostram as quantidades exatas.

---

### 🧪 Teste 09: Cadastrar um Catador parceiro que não tem celular
* **O que testar:** Cadastrar catadores da comunidade sem smartphone pelo botão no painel.
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Cadastrar Catador** (`pages/cadastrar-catador.html`).
  2. Preencha o nome do catador, telefone de contato e o bairro onde ele atua.
  3. Clique em **Registrar Catador**.
* **O que deve acontecer na tela:** O catador é salvo na rede sem precisar de login e passa a constar na lista de *Catadores Cadastrados* (`pages/catadores-cadastrados.html`).

---

### 🧪 Teste 10: Concluir Retirada ou Cancelar/Reabrir Oferta pelo Cidadão
* **O que testar:** Conclusão do ciclo da doação ou cancelamento com reabertura para novos catadores caso o catador agendado não compareça.
* **Como fazer (Passo a Passo):**
  1. Em **Minhas Ofertas** (`pages/minhas-ofertas.html`), localize uma oferta com status *Agendada*.
  2. *Cenário de Reabertura:* Se o agendamento precisar ser desfeito, clique em **Cancelar Agendamento / Reabrir Oferta**.
  3. Confirme no modal de aviso.
  4. *Cenário de Conclusão:* Ao confirmar a retirada pelo catador, o status é encerrado como *Concluído/Retirado* no histórico.
* **O que deve acontecer na tela:** A doação nunca fica travada em estado inconsistente: ao cancelar/reabrir, ela volta para *Disponível* na rede e os catadores conectados são notificados em tempo real de que o material está livre para novo agendamento. Se concluída, o histórico é atualizado com sucesso.

---

## 🟢 BLOCO 3: TESTES DO FLUXO DO CATADOR AUTÔNOMO

### 🧪 Teste 11: Criar conta de Catador Autônomo e Ativar Alertas no Computador e Celular
* **O que testar:** Auto-cadastro de um catador autônomo e ativação imediata de notificações no banner inicial e nas configurações de perfil, tanto no computador quanto no celular (sem mensagem indevida de incompatibilidade de navegador).
* **Como fazer (Passo a Passo):**
  1. Na tela de **Cadastro** (`pages/cadastro.html`), selecione o perfil **Catador Autônomo**, preencha os dados e confirme.
  2. Ao entrar no **Painel do Catador** (`pages/dashboard-catador.html`), localize a faixa de notificações no topo e clique no botão **Ativar**.
  3. No celular, veja que a ativação ocorre com 1 toque sem travar a tela ou alertar falsamente que o navegador não suporta.
* **O que deve acontecer na tela:** A conta é criada com o painel do catador completo. A faixa atualiza para *Notificações de novas ofertas: Ativadas* com ícone de sino verde, e um som suave de confirmação é reproduzido.

---

### 🧪 Teste 12: Bloqueio Estrito de Horários Retroativos no Agendamento de Coletas
* **O que testar:** Impedir terminantemente que o catador selecione horários que já passaram no relógio para a data de hoje, garantindo integridade e coerência no agendamento.
* **Como fazer (Passo a Passo):**
  1. No Painel do Catador, clique em **Materiais para Retirada** (`pages/catador-materiais.html`).
  2. Escolha qualquer material com status *Disponível* e clique em **Agendar Retirada**.
  3. No calendário do modal, clique no dia de **hoje** (ex: se hoje é dia 03/09 e são 14:00).
  4. Abra a lista suspensa de horários de retirada e confira as opções apresentadas.
  5. *Cenário de Fim de Expediente:* Selecione a data de hoje após o término do horário de atendimento (ex: após as 17:00).
* **O que deve acontecer na tela:**
  - O seletor de horários remove automaticamente todos os horários retroativos da manhã e da tarde (ex: 08:00, 08:30, ..., 13:30 não aparecem). Apenas horários futuros a partir da hora atual ficam selecionáveis.
  - Caso todos os horários do dia de hoje já tenham se encerrado, o campo exibe *"Nenhum horário disponível restante para hoje"*, o botão de confirmação fica desabilitado e a interface orienta a selecionar uma data futura no calendário.
  - O sistema impede a confirmação no passado e protege o banco contra agendamentos retroativos.

---

### 🧪 Teste 13: Notificação em Tempo Real no Computador e Celular (Oferta postada por Cidadão ou Admin)
* **O que testar:** O catador ser avisado instantaneamente na tela (Toast flutuante + som sintetizado) e na lista de materiais quando uma oferta for disponibilizada por um Cidadão ou reaberta por um Administrador, tanto no computador quanto no celular.
* **Como fazer (Passo a Passo):**
  1. Deixe o Painel do Catador ou a tela de materiais aberta no computador ou celular.
  2. Em outro dispositivo ou aba, faça login como Cidadão e cadastre uma oferta de material (ex: *Plástico*).
  3. Em seguida, entre como Administrador e reabra uma coleta que estava cancelada.
* **O que deve acontecer na tela:**
  - No mesmo instante (em tempo real, sem precisar apertar F5 ou recarregar a página), surge na tela do Catador um Toast flutuante verde acompanhado de um bipe harmônico sutil.
  - A notificação apresenta o título *"Nova Oferta Disponível"* e destaca o **tipo de material** (ex: *Plástico*), de forma profissional, sem emojis e sem focar no peso aproximado.
  - A lista de materiais disponíveis atualiza na hora com a nova oferta.

---

### 🧪 Teste 14: Notificação Push do Navegador / Sistema Operacional e Teste Imediato de Confirmação
* **O que testar:** O disparo da notificação nativa do sistema operacional (Windows, Android via Service Worker / PWA, macOS) e o envio imediato da notificação de boas-vindas do navegador ao autorizar o serviço.
* **Como fazer (Passo a Passo):**
  1. No Painel do Catador ou em **Meu Perfil** (`pages/meu-perfil.html`), clique em **Ativar Notificações** e autorize a permissão nativa do navegador (*Permitir*).
  2. Observe a notificação imediata emitida pelo sistema operacional (*"Notificações Ativadas! Você receberá avisos do navegador sempre que novas ofertas estiverem disponíveis."*).
  3. Minimize o navegador ou mude para outra aba/aplicativo.
  4. Em outro dispositivo, publique uma nova oferta como Cidadão.
* **O que deve acontecer na tela:** O sistema operacional emite a notificação nativa com o ícone oficial da plataforma, vibração (em celulares Android) e som, permitindo que o catador clique na notificação e seja direcionado diretamente para a tela de materiais disponíveis (`catador-materiais.html`).

---

### 🧪 Teste 15: Cancelar Agendamento de Coleta pelo Catador e Reabertura Automática
* **O que testar:** O catador cancelar um agendamento prévio pelo computador (`minhas-coletas.html`) ou pelo celular (`minhas-coletas-catador.html`), desvinculando seu ID no banco de dados e redisponibilizando o material na rede para outros catadores.
* **Como fazer (Passo a Passo):**
  1. Faça login como Catador e acesse **Minhas Coletas**.
  2. Localize um card de coleta com status *Agendada* e clique no botão **Cancelar Agendamento**.
  3. No modal de confirmação, leia o aviso e clique em **Confirmar Cancelamento**.
* **O que deve acontecer na tela:**
  - Abre um modal de confirmação seguro perguntando se deseja cancelar e liberar o material para outros catadores.
  - Ao confirmar, o agendamento é desfeito no banco de dados Supabase: o `catador_id` é desvinculado e o status volta a ser *Disponível*.
  - A coleta desaparece da aba *Agendadas* do catador e volta imediatamente para a tela de *Materiais Disponíveis*.
  - Outros catadores conectados recebem na hora o alerta de que a oferta voltou a ficar disponível para agendamento.
  - Caso o banco de dados Supabase possua restrição de RLS, a tela exibe um aviso instrutivo (`showAlertModal`) orientando a execução da política SQL em vez de um falso sucesso.

---

### 🧪 Teste 16: Concluir Retirada e Acompanhar Indicadores no Relatório do Catador
* **O que testar:** Confirmar a retirada de um material e verificar a atualização instantânea de todos os indicadores operacionais do catador.
* **Como fazer (Passo a Passo):**
  1. Na tela **Minhas Coletas** do Catador, localize uma coleta agendada e clique em **Confirmar Retirada / Concluir**.
  2. Acesse a tela de **Relatórios do Catador** (`pages/relatorios-catador.html`).
* **O que deve acontecer na tela:** A coleta é marcada como concluída e os números de coletas atribuídas, a taxa percentual de retiradas, o tipo de material predominante e os gráficos de desempenho são atualizados na hora.

---

### 🧪 Teste 17: Notificações Desativadas e Ajuste de Preferências no Perfil
* **O que testar:** Comprovar que, ao optar por desativar as notificações, o catador não recebe novos avisos sonoros ou visuais na tela.
* **Como fazer (Passo a Passo):**
  1. Em **Meu Perfil** (`pages/meu-perfil.html`), localize a seção de notificações e clique no botão para desativar.
  2. Volte ao Painel do Catador e confira a faixa do topo.
  3. Em outro aparelho, cadastre uma nova oferta como Cidadão.
* **O que deve acontecer na tela:** A faixa do painel passa a exibir *Notificações: Desativadas* com ícone de sino cortado vermelho. Nenhum pop-up ou som é reproduzido na tela do catador quando novas ofertas são postadas.

---

### 🧪 Teste 18: Navegação Resiliente do Catador nas Telas Compartilhadas (Voltar ao Painel)
* **O que testar:** Garantir que o Catador consiga navegar e retornar ao seu painel a partir de qualquer tela de consulta compartilhada sem ser direcionado para o painel do cidadão.
* **Como fazer (Passo a Passo):**
  1. Logado como Catador, acesse as telas compartilhadas: **Horários de Atendimento** (`pages/agenda-horarios.html`), **Publicações** (`pages/publicacoes.html`) ou **Catadores Cadastrados** (`pages/catadores-cadastrados.html`).
  2. Em cada uma delas, clique no botão **Voltar ao Painel**.
* **O que deve acontecer na tela:** O sistema reconhece o perfil de Catador ativo e redireciona com 100% de precisão para o **Painel do Catador** (`pages/dashboard-catador.html`), sem exibir falso alerta de "Acesso restrito".

---

## 🔵 BLOCO 4: TESTES DO FLUXO DO ADMINISTRADOR

### 🧪 Teste 19: Desativação de Usuário e Tentativa de Login Bloqueada
* **O que testar:** O administrador desativar um usuário e o sistema impedir seu login.
* **Como fazer (Passo a Passo):**
  1. Faça login como **Administrador** e clique em **Usuários Cadastrados** (`pages/usuarios-cadastrados.html`).
  2. Localize um usuário de teste e clique no botão para **Desativar**.
  3. Faça logout e tente fazer login com a conta que acabou de ser desativada.
* **O que deve acontecer na tela:** O sistema bloqueia o acesso e exibe a mensagem: *"Sua conta está desabilitada. Por favor, entre em contato com a administração."*

---

### 🧪 Teste 20: Proteção do Administrador Principal da Fatec
* **O que testar:** Impedir que o administrador principal do sistema seja desativado ou rebaixado por engano.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Usuários Cadastrados**, tente desativar ou remover o cargo de administrador do primeiro admin do sistema.
* **O que deve acontecer na tela:** O sistema emite um alerta de segurança e impede a ação, garantindo que o sistema nunca fique sem administrador.

---

### 🧪 Teste 21: Promover Cidadão para Administrador
* **O que testar:** Conceder permissão de administrador a um usuário existente.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Usuários Cadastrados**, localize um cidadão e clique em **Promover a Administrador**.
  2. Confirme a alteração.
  3. Entre no sistema com essa conta promovida.
* **O que deve acontecer na tela:** O usuário agora tem acesso ao **Painel do Administrador** (`pages/dashboard-admin.html`) e a todas as ferramentas de gestão.

---

### 🧪 Teste 22: Gerenciar Pontos de Coleta (Novo Local e Proteção do Último Ativo)
* **O que testar:** Cadastrar novo local, gerenciar agenda e comprovar que o sistema impede desativar o último local ativo.
* **Como fazer (Passo a Passo):**
  1. Em **Editar Local** (`pages/editar-local.html`), tente desativar o único ponto ativo (Fatec Franco da Rocha).
  2. Veja o bloqueio com o aviso: *"O sistema deve ter ao menos um ponto de coleta ativo."*
  3. Clique em **Novo Local de Coleta**, preencha os dados de um novo ponto (ex: *Ponto Centro*) e salve.
  4. Veja que agora existem dois locais ativos e um deles pode ser desativado sem desamparar o sistema.
* **O que deve acontecer na tela:** O sistema não permite deixar a rede sem ponto ativo. O novo ponto é cadastrado com sucesso e passa a receber doações e agendamentos.

---

### 🧪 Teste 23: Definir Agenda de Atendimento e Horários Flexíveis
* **O que testar:** Configurar dias de atendimento, aplicar horários flexíveis e comprovar a geração correta de intervalos sem sobreposição.
* **Como fazer (Passo a Passo):**
  1. No painel de Admin, clique em **Definir Agenda** (`pages/definir-agenda.html`).
  2. Configure os horários de atendimento da semana e aplique horários a sábados ou datas especiais.
  3. Salve as alterações e confira no calendário interativo.
* **O que deve acontecer na tela:** Os dias e horários são salvos com sucesso e exibidos de forma clara aos cidadãos e catadores, formatados em linha única sem quebras visuais.

---

### 🧪 Teste 24: Criar Publicação Educativa e Visualizar no Mural
* **O que testar:** Administrador publicar conteúdos e campanhas de educação ambiental.
* **Como fazer (Passo a Passo):**
  1. No painel de Admin, clique em **Publicações** (`pages/admin-publicacoes.html`).
  2. Preencha título, conteúdo educativo e clique em **Publicar**.
  3. Abra o mural de **Publicações** (`pages/publicacoes.html`) com qualquer perfil ou sem login.
* **O que deve acontecer na tela:** O artigo aparece publicado no feed com a data de hoje e o nome do administrador autor.

---

### 🧪 Teste 25: Central de Mensagens e Aviso de WhatsApp Futuro
* **O que testar:** Troca de mensagens entre usuários e modal informativo ao clicar no WhatsApp de catadores sem app.
* **Como fazer (Passo a Passo):**
  1. Acesse **Mensagens** (`pages/mensagens.html`) e troque mensagens em tempo real (veja que cada usuário só acessa suas próprias conversas).
  2. Em **Catadores Cadastrados** (`pages/catadores-cadastrados.html`), clique no botão verde **WhatsApp** de um catador sem smartphone.
* **O que deve acontecer na tela:** As mensagens funcionam em tempo real com isolamento de conversas. O botão de WhatsApp abre o modal *"Funcionalidade Futura"* informando que a integração direta está em desenvolvimento e orientando o contato telefônico.

---

## 📱 BLOCO 5: TESTES DE USABILIDADE, MOBILE, NOTIFICAÇÕES E LGPD

| Item | O que verificar | Como testar | Resultado esperado |
|---|---|---|---|
| **Todas as Telas (Web & Celular)** | Navegação completa em cada perfil | Abra todas as telas de Cidadão, Catador e Admin no computador e celular | Nenhum botão sobreposto, texto cortado ou erro visual. Barra inferior não tampa o rodapé. |
| **Notificações In-App vs Push** | Alertas em tempo real na tela e no sistema operacional | Dispare ofertas com catador logado no PC e no celular (Android / iOS) | Toast in-app verde com som suave na tela; notificação nativa do SO emitida no PC e celular Android com suporte a Service Worker. |
| **Trava de Horários Retroativos** | Bloqueio de agendamento no passado | Selecione a data de hoje e tente agendar horários já passados | Horários passados são filtrados do seletor e validação impede submissão no passado com aviso claro. |
| **Cancelamento de Coleta** | Desvinculação atômica e reabertura no Supabase | Cancele agendamento pelo catador ou pelo cidadão | Coleta volta a 'disponível', ID é desvinculado no banco e outros catadores são avisados em tempo real. |
| **Campos & Senhas Divergentes** | Validações obrigatórias (`*`) e senhas | Tente enviar cadastros vazios ou com senhas que não coincidem | O sistema avisa qual campo preencher ou alerta que as senhas não coincidem. |
| **Nomes Longos** | Adaptação de títulos compridos | Veja nomes como *"Fatec Franco da Rocha"* em cartões pequenos | O texto não corta a primeira letra e coloca reticências (`...`) no final. |
| **Avisos e Modais (Pop-ups)** | Modais de confirmação e avisos do sistema | Teste ações críticas (ex: cancelar coleta, desativar usuário, logout) e avisos (termos, WhatsApp, atalho) | Abrem centralizados com fundo escurecido, ícone temático, texto claro e botões de ação ("Confirmar/Cancelar" ou "Entendido"). |
| **Privacidade & LGPD** | Termos e transparência de dados | Acesse **Política de Privacidade** (`pages/privacidade.html`) | Os termos explicam com clareza a finalidade, direitos do usuário e segurança dos dados. |

---

## 📝 Como Relatar os Resultados dos Testes

Para cada teste realizado, anote uma destas duas opções:
* **✔️ Passou (OK):** O sistema funcionou exatamente como descrito no resultado esperado.
* **❌ Deu Erro / Travou (Bug):** Aconteceu algo diferente (ex: o botão não clicou, a tela ficou branca, etc.). Nesse caso, tire um print da tela e anote o número do teste (ex: *Teste 12*).

🏁 **Sistema Reciclagem Solidária: Pronto para a rodada de homologação pela equipe de QA e usuários finais!**
