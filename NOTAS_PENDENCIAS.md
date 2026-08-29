# Notas e Pendências de Desenvolvimento

Este arquivo registra decisões tomadas perante ambiguidades, pendências identificadas e inconsistências de schema ou protótipo, conforme Regra Geral #6 e #7.

---

## Log de Decisões

| Data | Tarefa | Decisão Tomada | Racional |
|---|---|---|---|
| 2026-08-16 | T0.1-T0.6 | Inicialização da estrutura pura (sem bundler) e consolidação do schema em `db/schema.sql`. | Respeitar rigidez de stack definida no Roteiro §1. |
| 2026-08-16 | T1.1 | Subformulário de endereço criado como módulo JS `enderecoForm.js` com suporte ao checkbox "Não possuo residência". | Garantir reuso em cadastros de cidadão, catador e cadastro por terceiros. |
| 2026-08-16 | T1.4 | Login/cadastro valida se `situacao` está como `ativo` antes de conceder acesso. | Atender requisito de segurança do Roteiro §9.2. |
