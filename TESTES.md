# Registro de Testes e Validações de Segurança (Final)

Documentação completa de testes funcionais, políticas RLS, triggers e edge cases listados no Roteiro §9.8.

---

## 🔒 Checklist de Segurança (Roteiro §7)

- [x] Apenas a `publishable/anon key` aparece no código-fonte (`js/lib/supabaseClient.js`).
- [x] `service_role` key nunca é usada no frontend.
- [x] Senhas tratadas 100% via Supabase Auth (mínimo 6 caracteres).
- [x] RLS habilitado em todas as tabelas no `db/schema.sql`.
- [x] Bucket `materiais-fotos` configurado para upload seguro de foto da oferta.
- [x] Trigger `trg_prevent_self_promote` implementado para impedir auto-promoção de cidadão a admin.
- [x] RPC `agendar_coleta` implementada para agendamento atômico com trava de concorrência.
- [x] RPC `promover_admin` criada e protegida por `is_admin()`.

---

## 🧪 Tabela de Testes de Edge Cases e RLS (§9.8)

| ID | Cenário de Teste | Procedimento | Resultado Esperado | Status |
|---|---|---|---|---|
| EC-01 | Auto-promoção via `update` direto | Cidadão tenta `update({nivel_acesso: 'administrador'})` no cliente | Bloqueado com exceção `apenas administradores podem alterar nivel_acesso` disparada pelo trigger `trg_prevent_self_promote` | Passou ✅ |
| EC-02 | Usuário bloqueado/desabilitado tentando login | Usuário com `situacao = 'bloqueado'` faz login com senha correta | Login negado com exceção em `login()` e sessão encerrada imediatamente | Passou ✅ |
| EC-03 | Consulta de dados de outro cidadão | Cidadão A tenta `select * from cidadao` | Retorna apenas a própria linha de Cidadão A devido às políticas RLS | Passou ✅ |
| EC-04 | Agendamento simultâneo (concorrência) | Duas chamadas paralelas à RPC `agendar_coleta` para mesma `coleta_id` | Apenas a primeira operação sucede (`WHERE catador_id IS NULL`), a segunda retorna erro | Passou ✅ |
| EC-05 | Cadastro de Catador por Terceiros | Cidadão/Admin cadastra catador sem e-mail/senha | Registro criado com `auth_user_id = null` e `cadastrado_por = auth.uid()`, respeitando a RLS | Passou ✅ |
| EC-06 | Acesso direto por URL a rotas restritas | Usuário não autenticado tenta acessar `/pages/admin-coletas.html` | Redirecionado automaticamente para `/pages/login.html` via `routeGuard.js` | Passou ✅ |
| EC-07 | Leitura não autorizada de mensagens | Cidadão B tenta ler mensagens da coleta de Cidadão A | Bloqueado pelo RLS `mensagens participantes` (`remetente_id` ou `destinatario_id`) | Passou ✅ |
| EC-08 | Reabertura de coleta cancelada/atrasada | Cidadão/Admin aciona "Reabrir Coleta" em oferta agendada | Status volta a 'disponível' e `catador_id`/`agenda_id` são limpos (`NULL`) | Passou ✅ |
| EC-09 | Diretório público expondo dados sensíveis | Cidadão acessa Catadores Cadastrados (`/pages/catadores-cadastrados.html`) | Apenas nome, telefone e região são exibidos; e-mail e endereço completos não são retornados | Passou ✅ |
| EC-10 | Desativação/exclusão do último ponto de coleta | Admin tenta desativar ou excluir o único local ativo em `editar-local.html` | Operação bloqueada com alerta explicativo `Ação Não Permitida`, impedindo o app de ficar sem locais | Passou ✅ |
| EC-11 | Oferta de material com local inativo | Usuário tenta cadastrar oferta quando não há locais ativos disponíveis | O formulário desabilita o seletor de locais e bloqueia o botão de envio com alerta explicativo | Passou ✅ |
| EC-12 | Enquadramento e flexibilidade da agenda | Admin configura horários aos sábados e alterna dias da semana no mobile | Horários formatados em linha única sem quebrar e modal permite aplicar horários a sábados ou datas específicas | Passou ✅ |
| EC-13 | Identificação do autor nas publicações | Admin cria campanha e usuários consultam feed de publicações | Nome real do administrador exibido corretamente no card sem erro de consulta | Passou ✅ |
