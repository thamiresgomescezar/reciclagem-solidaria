import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { supabase } from '../lib/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['cidadao', 'catador', 'administrador']);
  if (!perfil) return;

  const urlParams = new URLSearchParams(window.location.search);
  const coletaId = urlParams.get('coleta');

  const chatContainer = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const msgInput = document.getElementById('msg-input');
  const btnEnviar = document.getElementById('btn-enviar-msg');
  const btnVoltar = document.getElementById('btn-voltar');

  btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    redirecionarPorPerfil(perfil.tipo);
  });

  let destId = null;

  async function carregarDadosColetaEMensagens() {
    try {
      let query = supabase.from('mensagens').select('*');
      if (coletaId) {
        query = query.eq('coleta_id', coletaId);

        // Resolve destinatário a partir da coleta
        const { data: coletaData } = await supabase
          .from('coleta')
          .select('cidadao_id, catador(auth_user_id)')
          .eq('cod_coleta', coletaId)
          .maybeSingle();

        if (coletaData) {
          if (perfil.user.id === coletaData.cidadao_id) {
            destId = coletaData.catador?.auth_user_id || coletaData.cidadao_id;
          } else {
            destId = coletaData.cidadao_id;
          }
        }
      } else {
        query = query.or(`remetente_id.eq.${perfil.user.id},destinatario_id.eq.${perfil.user.id}`);
      }

      const { data: msgs, error } = await query.order('enviado_em', { ascending: true });
      if (error) throw error;

      if (!msgs || msgs.length === 0) {
        chatContainer.innerHTML = `
          <div style="text-align: center; padding: 40px; color: var(--cinza-texto-aux);">
            <p> Nenhuma mensagem trocada ainda.</p>
            <p style="font-size: 12px; margin-top: 4px;">Envie um oi para iniciar a conversa!</p>
          </div>
        `;
        return;
      }

      chatContainer.innerHTML = '';
      msgs.forEach(m => {
        const isMe = m.remetente_id === perfil.user.id;
        const msgBubble = document.createElement('div');
        msgBubble.style.cssText = `
          max-width: 75%;
          padding: 10px 14px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          align-self: ${isMe ? 'flex-end' : 'flex-start'};
          background-color: ${isMe ? 'var(--verde-botao)' : '#ffffff'};
          color: ${isMe ? '#ffffff' : 'var(--cinza-texto)'};
          border: ${isMe ? 'none' : '1px solid var(--cinza-borda)'};
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        `;

        const hora = new Date(m.enviado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        msgBubble.innerHTML = `
          <div>${m.conteudo}</div>
          <div style="font-size: 10px; text-align: right; opacity: 0.75; margin-top: 4px;">${hora}</div>
        `;

        chatContainer.appendChild(msgBubble);
      });

      chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (err) {
      console.error(err);
      chatContainer.innerHTML = `<div class="feedback-msg error">Erro ao carregar mensagens.</div>`;
    }
  }

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const texto = msgInput.value.trim();
    if (!texto) return;

    try {
      btnEnviar.disabled = true;

      const { error } = await supabase
        .from('mensagens')
        .insert([{
          coleta_id: coletaId || null,
          remetente_id: perfil.user.id,
          destinatario_id: destId || perfil.user.id,
          conteudo: texto
        }]);

      if (error) throw error;

      msgInput.value = '';
      await carregarDadosColetaEMensagens();

    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem: ' + err.message);
    } finally {
      btnEnviar.disabled = false;
    }
  });

  await carregarDadosColetaEMensagens();

  // Assinatura Realtime em mensagens
  supabase
    .channel('chat_realtime')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, (payload) => {
      console.log('Nova mensagem em tempo real:', payload);
      carregarDadosColetaEMensagens();
    })
    .subscribe();
});

