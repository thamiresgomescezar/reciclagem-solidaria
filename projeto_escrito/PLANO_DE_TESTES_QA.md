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

### 🧪 Teste 01: Bloqueio Cruzado de Telas Restritas (Todos os Perfis e Anônimo)
* **O que testar:** Garantir que ninguém consiga invadir telas de outros perfis apenas digitando o link direto na barra de endereços do navegador.
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
  4. **Teste Admin tentando ver Painéis de Operação:** Logado como **Admin**, tente abrir:
     - `http://localhost:8080/pages/dashboard-cidadao.html` ou `http://localhost:8080/pages/dashboard-catador.html`.
* **O que deve acontecer na tela:**
  - Usuário sem login é mandado imediatamente para a tela de **Login** (`pages/login.html`).
  - Usuário logado que tentar ver tela de outro perfil recebe um aviso amigável na tela informando que **seu perfil não tem permissão para acessar aquela página** e é redirecionado de volta para o seu próprio painel.

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

### 🧪 Teste 07: Doar / Ofertar Material Reciclável com Foto Opcional
* **O que testar:** Cadastro de uma doação com foto opcional e ponto de entrega ativo.
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Inserir Material** (`pages/inserir-material.html`).
  2. Escolha o tipo de material (ex: *Papelão*, *Plástico*) e o peso aproximado (ex: *15 kg*).
  3. Anexe uma foto (opcional: o sistema conclui normalmente sem foto). Se anexar, veja a prévia e o botão **✕** para remover.
  4. Escolha o ponto de entrega ativo (ex: *Fatec Franco da Rocha*) e clique em **Disponibilizar Material**.
* **O que deve acontecer na tela:** Mostra mensagem de sucesso e o material passa a constar na lista de coletas para os catadores.

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

### 🧪 Teste 10: Concluir Retirada ou Cancelar/Reabrir Oferta
* **O que testar:** Conclusão do ciclo da doação ou cancelamento com reabertura para novos catadores.
* **Como fazer (Passo a Passo):**
  1. Em **Minhas Ofertas** (`pages/minhas-ofertas.html`), localize uma oferta com status *Agendada*.
  2. *Cenário de Reabertura:* Se o agendamento for cancelado, a doação volta para *Disponível* para que outros catadores possam pegá-la.
  3. Ao confirmar a retirada pelo catador, o status é encerrado como *Concluído/Retirado* no histórico.
* **O que deve acontecer na tela:** A doação nunca fica travada em estado inconsistente: volta para disponível se cancelada ou conclui com sucesso.

---

## 🟢 BLOCO 3: TESTES DO FLUXO DO CATADOR AUTÔNOMO

### 🧪 Teste 11: Criar conta de Catador Autônomo
* **O que testar:** Auto-cadastro de um catador autônomo com perfil específico de coleta.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Cadastro** (`pages/cadastro.html`), selecione o perfil **Catador Autônomo**.
  2. Preencha os dados e finalize o cadastro.
* **O que deve acontecer na tela:** A conta é criada com perfil de catador e o sistema abre o **Painel do Catador** (`pages/dashboard-catador.html`) com os 8 cards de serviços.

---

### 🧪 Teste 12: Ver materiais disponíveis e agendar retirada
* **O que testar:** Catador escolher um material e agendar dia/hora na agenda da Fatec.
* **Como fazer (Passo a Passo):**
  1. Faça login como Catador e acesse o Painel (`pages/dashboard-catador.html`).
  2. Clique no card **Materiais para Retirada** (`pages/catador-materiais.html`).
  3. Escolha um material e clique no botão **Agendar Retirada**.
  4. Escolha uma data e horário disponíveis no calendário e confirme.
* **O que deve acontecer na tela:** A coleta é agendada com sucesso e passa a aparecer na aba *Agendadas* em *Minhas Coletas* (`pages/minhas-coletas-catador.html`).

---

### 🧪 Teste 13: Aviso em tempo real de nova doação
* **O que testar:** Catador ser avisado na mesma hora quando alguém doar material.
* **Como fazer (Passo a Passo):**
  1. Deixe o painel do Catador aberto no seu celular ou computador.
  2. Em outro aparelho, entre como Cidadão e cadastre uma nova doação.
* **O que deve acontecer na tela:** O Catador recebe um aviso na tela no mesmo instante dizendo *"Nova Oferta Disponível"* (informando o tipo do material) sem precisar apertar F5.

---

### 🧪 Teste 14: Concluir coleta e acompanhar métricas no relatório
* **O que testar:** Confirmar retirada e ver os indicadores e gráficos do catador atualizados.
* **Como fazer (Passo a Passo):**
  1. Na tela **Minhas Coletas** do Catador, clique em **Confirmar Retirada / Concluir**.
  2. Abra a tela de **Relatórios do Catador** (`pages/relatorios-catador.html`).
* **O que deve acontecer na tela:** As coletas atribuídas, o percentual de retiradas e os gráficos de materiais são atualizados na hora.

---

### 🧪 Teste 15: Notificações Desativadas e Ajuste de Perfil do Catador
* **O que testar:** Comprovar que, ao desativar as notificações, o catador não recebe novos avisos na tela.
* **Como fazer (Passo a Passo):**
  1. Em **Meu Perfil** (`pages/meu-perfil.html`), desative a opção de notificações e salve.
  2. No painel do Catador, veja a faixa do topo atualizar para *Notificações: Desativadas*.
  3. Em outro aparelho, cadastre uma nova doação como Cidadão.
* **O que deve acontecer na tela:** A faixa confirma o status "Desativadas" e nenhum aviso ou som de nova doação surge na tela do Catador.

---

## 🔵 BLOCO 4: TESTES DO FLUXO DO ADMINISTRADOR

### 🧪 Teste 16: Desativação de Usuário e Tentativa de Login Bloqueada
* **O que testar:** O administrador desativar um usuário e o sistema impedir seu login.
* **Como fazer (Passo a Passo):**
  1. Faça login como **Administrador** e clique em **Usuários Cadastrados** (`pages/usuarios-cadastrados.html`).
  2. Localize um usuário de teste e clique no botão para **Desativar**.
  3. Faça logout e tente fazer login com a conta que acabou de ser desativada.
* **O que deve acontecer na tela:** O sistema bloqueia o acesso e exibe a mensagem: *"Sua conta está desabilitada. Por favor, entre em contato com a administração."*

---

### 🧪 Teste 17: Proteção do Administrador Principal da Fatec
* **O que testar:** Impedir que o administrador principal do sistema seja desativado ou rebaixado por engano.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Usuários Cadastrados**, tente desativar ou remover o cargo de administrador do primeiro admin do sistema.
* **O que deve acontecer na tela:** O sistema emite um alerta de segurança e impede a ação, garantindo que o sistema nunca fique sem administrador.

---

### 🧪 Teste 18: Promover Cidadão para Administrador
* **O que testar:** Conceder permissão de administrador a um usuário existente.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Usuários Cadastrados**, localize um cidadão e clique em **Promover a Administrador**.
  2. Confirme a alteração.
  3. Entre no sistema com essa conta promovida.
* **O que deve acontecer na tela:** O usuário agora tem acesso ao **Painel do Administrador** (`pages/dashboard-admin.html`) e a todas as ferramentas de gestão.

---

### 🧪 Teste 19: Gerenciar Pontos de Coleta (Novo Local e Proteção do Último Ativo)
* **O que testar:** Cadastrar novo local, gerenciar agenda e comprovar que o sistema impede desativar o último local ativo.
* **Como fazer (Passo a Passo):**
  1. Em **Editar Local** (`pages/editar-local.html`), tente desativar o único ponto ativo (Fatec Franco da Rocha).
  2. Veja o bloqueio com o aviso: *"O sistema deve ter ao menos um ponto de coleta ativo."*
  3. Clique em **Novo Local de Coleta**, preencha os dados de um novo ponto (ex: *Ponto Centro*) e salve.
  4. Veja que agora existem dois locais ativos e um deles pode ser desativado sem desamparar o sistema. Em **Definir Agenda** (`pages/definir-agenda.html`), gere horários de atendimento sem sobreposição.
* **O que deve acontecer na tela:** O sistema não permite deixar a rede sem ponto ativo. O novo ponto é cadastrado com sucesso e passa a receber doações e agendamentos.

---

### 🧪 Teste 20: Criar Publicação Educativa e Visualizar no Mural
* **O que testar:** Administrador publicar conteúdos e campanhas de educação ambiental.
* **Como fazer (Passo a Passo):**
  1. No painel de Admin, clique em **Publicações** (`pages/admin-publicacoes.html`).
  2. Preencha título, conteúdo educativo e clique em **Publicar**.
  3. Abra o mural de **Publicações** (`pages/publicacoes.html`) com qualquer perfil ou sem login.
* **O que deve acontecer na tela:** O artigo aparece publicado no feed com a data de hoje e o nome do administrador autor.

---

### 🧪 Teste 21: Central de Mensagens e Aviso de WhatsApp Futuro
* **O que testar:** Troca de mensagens entre usuários e modal informativo ao clicar no WhatsApp de catadores sem app.
* **Como fazer (Passo a Passo):**
  1. Acesse **Mensagens** (`pages/mensagens.html`) e troque mensagens em tempo real (veja que cada usuário só acessa suas próprias conversas).
  2. Em **Catadores Cadastrados** (`pages/catadores-cadastrados.html`), clique no botão verde **WhatsApp** de um catador sem smartphone.
* **O que deve acontecer na tela:** As mensagens funcionam em tempo real com isolamento de conversas. O botão de WhatsApp abre o modal *"Funcionalidade Futura"* informando que a integração direta está em desenvolvimento e orientando o contato telefônico.

---

## 📱 BLOCO 5: TESTES DE USABILIDADE, MOBILE E LGPD

| Item | O que verificar | Como testar | Resultado esperado |
|---|---|---|---|
| **Todas as Telas (Web & Celular)** | Navegação completa em cada perfil | Abra todas as telas de Cidadão, Catador e Admin no computador e celular | Nenhum botão sobreposto, texto cortado ou erro visual. Barra inferior não tampa o rodapé. |
| **Campos & Senhas Divergentes** | Validações obrigatórias (`*`) e senhas | Tente enviar cadastros vazios ou com senhas que não coincidem | O sistema avisa qual campo preencher ou alerta que as senhas não coincidem. |
| **Nomes Longos** | Adaptação de títulos compridos | Veja nomes como *"Fatec Franco da Rocha"* em cartões pequenos | O texto não corta a primeira letra e coloca reticências (`...`) no final. |
| **Avisos e Modais (Pop-ups)** | Modais de confirmação e avisos do sistema | Teste ações críticas (ex: cancelar coleta, desativar usuário, logout) e avisos (termos, WhatsApp, atalho) | Abrem centralizados com fundo escurecido, ícone temático, texto claro e botões de ação ("Confirmar/Cancelar" ou "Entendido"). |
| **Privacidade & LGPD** | Termos e transparência de dados | Acesse **Política de Privacidade** (`pages/privacidade.html`) | Os termos explicam com clareza a finalidade, direitos do usuário e segurança dos dados. |

---

## 📝 Como Relatar os Resultados dos Testes

Para cada teste realizado, anote uma destas duas opções:
* **✔️ Passou (OK):** O sistema funcionou exatamente como descrito no resultado esperado.
* **❌ Deu Erro / Travou (Bug):** Aconteceu algo diferente (ex: o botão não clicou, a tela ficou branca, etc.). Nesse caso, tire um print da tela e anote o número do teste (ex: *Teste 06*).

🏁 **Sistema Reciclagem Solidária: Pronto para a rodada de homologação pela equipe de QA e usuários finais!**
