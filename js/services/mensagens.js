// ==========================================================
// T5.1 + T5.2 — Serviço de mensagens
// Lista conversas e envia mensagens (RLS: só remetente/destinatário)
// ==========================================================
import { supabase } from '../lib/supabaseClient.js';

/**
 * Lista as conversas do usuário logado, agrupadas por destinatário.
 * @returns {{ok: boolean, dados?: Array, erro?: string}}
 */
export async function listarConversas() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: 'Não autenticado.' };

    // Busca todas as mensagens onde o usuário é remetente ou destinatário
    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .or(`remetente_id.eq.${user.id},destinatario_id.eq.${user.id}`)
      .order('enviado_em', { ascending: false });

    if (error) return { ok: false, erro: error.message };

    // Agrupa por "outro participante"
    const conversas = new Map();
    for (const msg of data || []) {
      const outroId = msg.remetente_id === user.id ? msg.destinatario_id : msg.remetente_id;
      if (!conversas.has(outroId)) {
        conversas.set(outroId, {
          outro_id: outroId,
          ultima_mensagem: msg.conteudo,
          enviado_em: msg.enviado_em,
          lida: msg.lida,
        });
      }
    }

    // Busca nomes dos participantes (cidadao ou catador)
    const ids = [...conversas.keys()];
    const nomes = new Map();

    if (ids.length) {
      const { data: cidadaos } = await supabase
        .from('cidadao')
        .select('id, nome')
        .in('id', ids);
      (cidadaos || []).forEach((c) => nomes.set(c.id, c.nome));

      const { data: catadores } = await supabase
        .from('catador')
        .select('id, nome')
        .in('id', ids);
      (catadores || []).forEach((c) => nomes.set(c.id, c.nome));
    }

    const resultado = [...conversas.values()].map((c) => ({
      ...c,
      nome: nomes.get(c.outro_id) || 'Usuário',
    }));

    return { ok: true, dados: resultado };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * Lista as mensagens de uma conversa entre o usuário logado e outro participante.
 * @param {string} outroId
 * @returns {{ok: boolean, dados?: Array, erro?: string}}
 */
export async function listarMensagens(outroId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: 'Não autenticado.' };

    const { data, error } = await supabase
      .from('mensagens')
      .select('*')
      .or(`and(remetente_id.eq.${user.id},destinatario_id.eq.${outroId}),and(remetente_id.eq.${outroId},destinatario_id.eq.${user.id})`)
      .order('enviado_em', { ascending: true });

    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: data || [] };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * Envia uma mensagem.
 * @param {string} destinatarioId
 * @param {string} conteudo
 * @param {string|null} coletaId
 * @returns {{ok: boolean, data?: object, erro?: string}}
 */
export async function enviarMensagem(destinatarioId, conteudo, coletaId = null) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: 'Não autenticado.' };

    const { data, error } = await supabase
      .from('mensagens')
      .insert({
        coleta_id: coletaId,
        remetente_id: user.id,
        destinatario_id: destinatarioId,
        conteudo,
      })
      .select()
      .single();

    if (error) return { ok: false, erro: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}