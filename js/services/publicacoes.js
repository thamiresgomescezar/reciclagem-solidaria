// ==========================================================
// T5.3 + T5.4 — Serviço de publicações
// Admin: CRUD. Cidadão/Catador: leitura.
// ==========================================================
import { supabase } from '../lib/supabaseClient.js';

/**
 * Lista publicações (leitura livre para autenticados/RLS).
 * @returns {{ok: boolean, dados?: Array, erro?: string}}
 */
export async function listarPublicacoes() {
  try {
    const { data, error } = await supabase
      .from('publicacoes')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: data || [] };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * Cria uma publicação (apenas admin via RLS).
 * @param {{titulo: string, conteudo: string}} dados
 * @returns {{ok: boolean, data?: object, erro?: string}}
 */
export async function criarPublicacao(dados) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: 'Não autenticado.' };

    const { data, error } = await supabase
      .from('publicacoes')
      .insert({
        autor_id: user.id,
        titulo: dados.titulo,
        conteudo: dados.conteudo,
      })
      .select()
      .single();

    if (error) return { ok: false, erro: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * Atualiza uma publicação (apenas admin via RLS).
 * @param {string} id
 * @param {{titulo?: string, conteudo?: string}} dados
 * @returns {{ok: boolean, data?: object, erro?: string}}
 */
export async function atualizarPublicacao(id, dados) {
  try {
    const { data, error } = await supabase
      .from('publicacoes')
      .update(dados)
      .eq('id', id)
      .select()
      .single();
    if (error) return { ok: false, erro: error.message };
    return { ok: true, data };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * Exclui uma publicação (apenas admin via RLS).
 * @param {string} id
 * @returns {{ok: boolean, erro?: string}}
 */
export async function excluirPublicacao(id) {
  try {
    const { error } = await supabase
      .from('publicacoes')
      .delete()
      .eq('id', id);
    if (error) return { ok: false, erro: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}