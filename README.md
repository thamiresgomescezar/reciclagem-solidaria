<div align="center">

<img src="assets/logo.png" alt="Logo Reciclagem Solidária" width="140" />

# Reciclagem Solidária

**Plataforma web que conecta cidadãos que querem descartar recicláveis a catadores autônomos que podem coletá-los.**

Projeto Integrador desenvolvido na **Fatec Franco da Rocha**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript_ES6-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

</div>

---

## 📌 Sobre o projeto

Muitos catadores autônomos dependem de encontrar material reciclável por acaso, enquanto muitos cidadãos não sabem a quem entregar o que separam em casa. O **Reciclagem Solidária** aproxima os dois lados:

- o **cidadão** cadastra o material que tem para doar e onde ele pode ser retirado;
- o **catador** vê as ofertas disponíveis, agenda a coleta e acompanha seu histórico;
- a **administração** gerencia catadores, tipos de material, status, publicações e relatórios.

### 🏫 Estudo de caso: Fatec Franco da Rocha

Nesta primeira fase (MVP), a plataforma é usada apenas na **Fatec Franco da Rocha**, que funciona como ponto de coleta:

- a **coordenação** do curso atua como administradora;
- **colaboradores** da unidade, como a equipe da secretaria, participam como cidadãos e ofertam os materiais;
- os **catadores** cadastrados retiram os materiais na Fatec, conforme a agenda de atendimento definida pela unidade.

## 🌱 Possibilidade de expansão

Embora o MVP seja focado na Fatec, a plataforma foi pensada para permitir, depois da validação, o uso em **outros pontos de coleta**, cada um com seus próprios locais de retirada e agenda de atendimento.

## ✨ Funcionalidades

### 👤 Cidadão
- Cadastro e login com recuperação de senha por e-mail
- Oferta de materiais recicláveis com local de retirada e horários disponíveis
- Acompanhamento das suas ofertas e coletas agendadas
- Troca de mensagens com o catador responsável pela coleta

### ♻️ Catador
- Consulta de materiais disponíveis para coleta
- Agendamento e cancelamento de coletas
- Definição da própria agenda de disponibilidade
- Relatórios pessoais de coletas realizadas

### 🛠️ Administrador
- Cadastro e gestão de catadores e usuários
- Gestão de tipos de material e status de coleta
- Publicação de campanhas e avisos
- Relatórios gerais da plataforma
- Promoção/rebaixamento de administradores, com proteção do administrador principal

### Geral
- **PWA instalável** no celular (manifest + service worker)
- Layout responsivo, com telas pensadas para mobile e desktop
- Controle de acesso por perfil (route guard no front + Row Level Security no banco)
- Política de privacidade e consentimento em conformidade com a **LGPD**

## 🧱 Arquitetura e tecnologias

| Camada | Tecnologia |
| --- | --- |
| Frontend | HTML5, CSS3 com design tokens, JavaScript puro (ES6 modules), sem frameworks nem bundler |
| Backend (BaaS) | [Supabase](https://supabase.com): Auth, PostgreSQL, Storage e Realtime |
| Segurança | Row Level Security (RLS) em todas as tabelas, funções RPC `security definer` e triggers de proteção |
| Mobile | Progressive Web App (manifest + service worker) |
| Deploy | Vercel (site estático) |

O frontend é servido como arquivos estáticos e conversa diretamente com o Supabase pelo SDK `@supabase/supabase-js`. As regras de negócio sensíveis (agendar e cancelar coleta, promover administrador, impedir autopromoção etc.) ficam no banco, em funções PL/pgSQL e políticas RLS, e não no navegador.

### Modelo de dados

```
cidadao ──< local_retirada
   │
   └──< coleta >── materiais
          │  └──── status
          └─────── catador ──< agenda

mensagens · publicacoes
```

## 🖼️ Protótipos

| Tela inicial (web) | Painel do administrador | Inserir material |
| --- | --- | --- |
| ![Tela inicial](assets/prototypes/tela_inicial_web.jpeg) | ![Admin](assets/prototypes/tela_admin_web.jpeg) | ![Inserir material](assets/prototypes/inserir_material_web.jpeg) |

| Login (mobile) | Cidadão (mobile) | Catador (mobile) |
| --- | --- | --- |
| ![Login mobile](assets/prototypes/login_mobile.jpeg) | ![Cidadão mobile](assets/prototypes/tela_cidadao_mobile.jpeg) | ![Catador mobile](assets/prototypes/tela_catador_mobile.jpeg) |

## 📁 Estrutura de pastas

```
├── assets/            # Logos, ícones do PWA e protótipos
├── css/
│   ├── design-tokens.css   # Cores, tipografia e espaçamentos
│   └── style.css           # Estilos compartilhados e layout
├── js/
│   ├── lib/           # Cliente Supabase, route guard, modais, PWA, validações
│   ├── services/      # Acesso a dados (auth, coletas, materiais, agenda, mensagens...)
│   └── pages/         # Lógica de cada tela
├── pages/             # Telas HTML do sistema
├── index.html         # Página inicial
├── manifest.json      # Manifesto do PWA
├── sw.js              # Service worker
└── vercel.json        # Configuração de deploy
```

## 👥 Equipe

Projeto Integrador desenvolvido em grupo na **Fatec Franco da Rocha**. O desenvolvimento técnico (frontend, banco de dados e publicação) ficou a cargo de **Thamires Cezar**.

[![GitHub](https://img.shields.io/badge/GitHub-thamiresgomescezar-181717?style=flat&logo=github)](https://github.com/thamiresgomescezar)

## ©️ Direitos de uso

Este repositório está público apenas para **consulta e apresentação** do projeto. Todos os direitos são reservados: o código, o banco de dados e os materiais visuais não podem ser copiados, reproduzidos, redistribuídos ou usados em outras aplicações sem autorização prévia da equipe do projeto.
