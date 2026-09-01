# 📋 GUIA PRÁTICO DE TESTES DA APLICAÇÃO (PASSO A PASSO)
## Sistema Reciclagem Solidária — Fatec Franco da Rocha

**Objetivo:** Guia passo a passo para a equipe de testes (QA) validar todas as telas, funções e regras reais do sistema de forma simples, prática e sem termos técnicos complexos.

---

## 👥 Conhecendo os 3 Tipos de Usuários do Sistema

Antes de começar os testes, é importante entender os 3 perfis que usam a plataforma:

1. **🟠 Cidadão Consciente:** Alunos, professores ou moradores que querem doar materiais recicláveis (papelão, plástico, vidro, metal), cadastrar catadores parceiros e acompanhar suas doações.
2. **🟢 Catador Autônomo:** Profissionais que recolhem os recicláveis doados, agendam horários de retirada e acompanham quanto material já coletaram.
3. **🔵 Administrador:** Equipe da Fatec responsável por gerenciar os pontos de coleta, horários da agenda, usuários e publicar comunicados.

---

## 🔴 BLOCO 1: TESTES IMPORTANTES DE ACESSO E SEGURANÇA

### 🧪 Teste 01: Tentar entrar em páginas restritas de outro perfil ou sem login
* **O que testar:** Garantir que o sistema bloqueie o acesso direto pela barra de endereços a páginas restritas de outros perfis (ex: Cidadão tentando abrir Relatórios ou telas de Admin/Catador).
* **Como fazer (Passo a Passo):**
  1. **Teste Anônimo:** Abra uma **aba anônima** e cole na barra de endereços: `http://localhost:8080/pages/dashboard-admin.html` ou `http://localhost:8080/pages/relatorios.html`.
  2. **Teste Cidadão tentando ver Relatórios do Admin:** Faça login como **Cidadão Consciente** e digite na barra de pesquisa: `http://localhost:8080/pages/relatorios.html` ou `http://localhost:8080/pages/dashboard-admin.html`.
  3. **Teste Cidadão tentando ver telas do Catador:** Ainda como Cidadão, digite: `http://localhost:8080/pages/catador-materiais.html` ou `http://localhost:8080/pages/relatorios-catador.html`.
* **O que deve acontecer na tela:**
  - Se estiver anônimo (sem login), o sistema te joga imediatamente para a tela de **Login** (`pages/login.html`).
  - Se estiver logado como Cidadão, o sistema impede a visualização da página, avisa que o seu perfil não possui acesso e te redireciona de volta para o seu painel (`pages/dashboard-cidadao.html`).

---

### 🧪 Teste 02: Tentar cadastrar uma conta com um e-mail que já existe
* **O que testar:** O sistema não pode deixar criar duas contas com o mesmo e-mail.
* **Como fazer (Passo a Passo):**
  1. Vá para a tela de **Cadastro** (`pages/cadastro.html`).
  2. Preencha o formulário usando um e-mail que já foi cadastrado antes.
  3. Coloque senha, confirme e clique no botão **Cadastrar**.
* **O que deve acontecer na tela:** O sistema deve exibir um aviso claro informando que **"Este e-mail já está cadastrado no sistema"** e não pode travar a tela.

---

### 🧪 Teste 03: Tentar fazer login com senha errada
* **O que testar:** Garantir que senhas erradas não entrem no sistema.
* **Como fazer (Passo a Passo):**
  1. Na tela de **Login** (`pages/login.html`), digite um e-mail correto e uma senha qualquer errada.
  2. Clique em **Entrar**.
* **O que deve acontecer na tela:** O sistema deve mostrar o aviso: *"E-mail ou senha incorretos."* e não deixar avançar.

---

### 🧪 Teste 04: Dois catadores tentando agendar a mesma oferta juntos
* **O que testar:** Impedir que duas pessoas peguem o mesmo lote de material doado.
* **Como fazer (Passo a Passo):**
  1. Abra dois navegadores diferentes (ou um no computador e outro no celular).
  2. Faça login com duas contas de Catadores diferentes.
  3. Abra a mesma doação disponível na tela de **Materiais para Retirada** (`pages/catador-materiais.html`).
  4. Clique em **Agendar Retirada** quase ao mesmo tempo nos dois aparelhos.
* **O que deve acontecer na tela:** O primeiro que clicar consegue agendar com sucesso. O segundo recebe um aviso na tela informando que **o material acabou de ser agendado por outro catador**, e a oferta sai da lista de disponíveis.

---

## 🟠 BLOCO 2: TESTES DO FLUXO DO CIDADÃO CONSCIENTE

### 🧪 Teste 05: Criar conta com endereço ou marcar "Não possuo residência"
* **Como fazer (Passo a Passo):**
  1. Acesse **Cadastre-se** (`pages/cadastro.html`).
  2. Preencha Nome, E-mail, Senha e Telefone.
  3. Digite o CEP (veja se formata `00000-000`) e preencha Rua, Bairro, Cidade e Estado.
  4. Deixe o campo **Número:\*** em branco e tente salvar (veja se ele pede para preencher obrigatoriamente).
  5. Preencha o número e conclua o cadastro.
  6. *Teste alternativo:* Crie outro cadastro e marque a caixinha *"Não possuo residência fixa / endereço"*. Veja se os campos de endereço somem e o cadastro conclui normalmente.
* **O que deve acontecer na tela:** O cadastro é finalizado com sucesso e te leva para o Painel do Cidadão (`pages/dashboard-cidadao.html`).

---

### 🧪 Teste 06: Doar / Ofertar um Material Reciclável com Foto
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Inserir Material** (`pages/inserir-material.html`).
  2. Escolha o tipo de material (ex: *Papelão*, *Plástico*, *Vidro* ou *Metal*).
  3. Digite a quantidade aproximada (ex: *10 kg*).
  4. Clique no botão de foto e selecione uma foto do seu computador ou celular.
  5. Escolha o local de entrega (ex: *Fatec Franco da Rocha*).
  6. Clique em **Disponibilizar Material**.
* **O que deve acontecer na tela:** Aparece a mensagem de sucesso e o material fica disponível para os catadores visualizarem.

---

### 🧪 Teste 07: Ver "Minhas Ofertas" e testar os filtros de status
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Minhas Ofertas** (`pages/minhas-ofertas.html`).
  2. Veja se a doação que você acabou de cadastrar aparece na lista.
  3. Clique nos botões de filtro no topo: **Todas**, **Agendadas** e **Concluídas**.
* **O que deve acontecer na tela:**
  - A lista deve filtrar na hora (sem recarregar a página inteira).
  - Os números entre parênteses ao lado de cada botão `(1)`, `(0)` devem mostrar a quantidade exata de coletas em cada estado.

---

### 🧪 Teste 08: Cadastrar um Catador parceiro que não tem celular
* **Como fazer (Passo a Passo):**
  1. No Painel do Cidadão, clique no card **Cadastrar Catador** (`pages/cadastrar-catador.html`).
  2. Preencha o nome do catador da sua rua/bairro, o telefone de contato dele e a região onde ele atua.
  3. Clique em **Registrar Catador**.
* **O que deve acontecer na tela:** O catador é salvo na lista de parceiros da comunidade mesmo sem precisar de e-mail ou senha, passando a constar na lista de **Catadores Cadastrados** (`pages/catadores-cadastrados.html`).

---

## 🟢 BLOCO 3: TESTES DO FLUXO DO CATADOR AUTÔNOMO

### 🧪 Teste 09: Ver materiais disponíveis e agendar horário de retirada
* **Como fazer (Passo a Passo):**
  1. Faça login como **Catador** e acesse o Painel do Catador (`pages/dashboard-catador.html`).
  2. Clique no card **Materiais para Retirada** (`pages/catador-materiais.html`).
  3. Veja a lista com foto, peso e local da doação.
  4. Clique no botão **Agendar Retirada**.
  5. Escolha um dia e horário disponíveis no calendário e confirme.
* **O que deve acontecer na tela:** A coleta é agendada para você, sai da lista de disponíveis e passa a aparecer na sua aba de **Agendadas** em *Minhas Coletas*.

---

### 🧪 Teste 10: Notificação em tempo real de nova doação
* **Como fazer (Passo a Passo):**
  1. Deixe o painel do Catador aberto no seu computador ou celular.
  2. Em outro aparelho ou janela, entre como Cidadão e cadastre uma nova doação.
* **O que deve acontecer na tela:** O Catador recebe um aviso visual na tela no mesmo instante dizendo *"Nova oferta de material disponível!"*, sem precisar apertar F5 para atualizar a página.

---

### 🧪 Teste 11: Confirmar a retirada do material e ver os relatórios
* **Como fazer (Passo a Passo):**
  1. Na tela **Minhas Coletas** do Catador (`pages/minhas-coletas-catador.html`), localize a coleta agendada.
  2. Clique no botão **Confirmar Retirada / Concluir**.
  3. Vá até a tela de **Relatórios do Catador** (`pages/relatorios-catador.html`).
* **O que deve acontecer na tela:** O status muda para Concluída e os cartões de resumo mostram o aumento no total de quilos coletados e o gráfico atualizado.

---

## 🔵 BLOCO 4: TESTES DO FLUXO DO ADMINISTRADOR

### 🧪 Teste 12: Central de Mensagens e contato com usuários
* **Como fazer (Passo a Passo):**
  1. Faça login como **Administrador** e clique em **Mensagens** (`pages/mensagens.html`).
  2. Veja se existem duas abas claras: **Catadores** e **Cidadãos**.
  3. Clique na aba **Catadores**:
     - Se o catador tiver app, você pode digitar e conversar com ele.
     - Se o catador for cadastrado sem app, o campo de digitação fica bloqueado e aparece o botão verde para **Chamar no WhatsApp** ou ligar.
  4. Clique na aba **Cidadãos**: veja se aparecem apenas cidadãos com os nomes reais cadastrados no sistema.
* **O que deve acontecer na tela:** A troca de mensagens funciona instantaneamente e os contatos mostram os nomes reais que estão no banco de dados.

---

### 🧪 Teste 13: Proteção do Ponto de Coleta da Fatec
* **Como fazer (Passo a Passo):**
  1. No painel de Admin (`pages/tela-admin.html`), clique em **Editar Local de Retirada** (`pages/editar-local.html`).
  2. Quando houver apenas 1 local ativo (ex: *Fatec Franco da Rocha*), tente desativar ou excluir esse local.
* **O que deve acontecer na tela:** O sistema não deixa e mostra o aviso verde: *"Ação Não Permitida: O sistema deve ter ao menos um ponto de coleta ativo."*

---

### 🧪 Teste 14: Configurar horários da Agenda (Dias úteis e Sábados)
* **Como fazer (Passo a Passo):**
  1. Acesse **Definir Agenda** (`pages/editar-calendario.html`).
  2. Adicione ou altere horários de atendimento para dias da semana e para **Sábado**.
  3. Salve as alterações.
* **O que deve acontecer na tela:** Os novos horários são salvos e aparecem certinho quando o catador for agendar uma retirada.

---

### 🧪 Teste 15: Criar uma Notícia / Campanha Educativa
* **Como fazer (Passo a Passo):**
  1. Acesse **Publicações** no painel de Admin (`pages/admin-publicacoes.html`).
  2. Digite um título (ex: *Como separar garrafas PET corretamente*) e um texto explicativo.
  3. Clique em **Publicar**.
  4. Abra a página pública de **Publicações** (`pages/publicacoes.html`).
* **O que deve acontecer na tela:** A notícia aparece no feed com a data de hoje e o **nome real do administrador** que escreveu o texto.

---

## 📱 BLOCO 5: TESTES VISUAIS E DE EXPERIÊNCIA NO CELULAR

| Item | O que verificar | Como testar | Resultado esperado |
|---|---|---|---|
| **Visual no Celular** | Barra de menu inferior e botões | Abra o site no navegador do smartphone | Os botões são grandes e fáceis de tocar com o dedo. A barra de baixo tem 3 botões e não tampa o final da tela. |
| **Campos Obrigatórios** | Asterisco vermelho (`*`) | Tente salvar qualquer formulário deixando campos com `*` em branco | O navegador avisa: *"Preencha este campo"* e não envia o formulário vazio. |
| **Nomes Longos** | Textos compridos nos cartões | Veja nomes como *"Fatec Franco da Rocha"* nos resumos | O texto não corta a primeira letra. Se não couber, coloca reticências (`...`) no final e mostra o nome inteiro ao passar o mouse. |
| **Avisos e Modais** | Ícones amigáveis | Abra avisos de mapas e informativos | Aparecem ícones verdes bonitos de informação ou mapa, sem parecer mensagem de erro de sistema. |

---

## 📝 Como Relatar os Resultados dos Testes

Ao executar os testes acima, anote para cada item:
* **Passou (OK):** Funcionou exatamente como descrito no resultado esperado.
* **Comportamento Inesperado (Bug):** A tela travou, o botão não clicou ou a mensagem não apareceu. Tire um print da tela e anote qual era o teste (ex: *Teste 06*).
