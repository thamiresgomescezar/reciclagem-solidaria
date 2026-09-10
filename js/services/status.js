import { supabase } from '../lib/supabaseClient.js';

/**
 * Serviço de Gestão de Status — CRUD de Estados das Coletas do Sistema
 */

const STORAGE_KEY_REGRAS = 'reciclagem_status_regras';

export const REGRAS_PADRAO_STATUS = {
  1: { regra_catador: 'sem_catador', bloquear_dados: false },
  2: { regra_catador: 'requer_catador', bloquear_dados: false },
  3: { regra_catador: 'opcional', bloquear_dados: true },
  4: { regra_catador: 'opcional', bloquear_dados: true },
  5: { regra_catador: 'opcional', bloquear_dados: true },
  6: { regra_catador: 'requer_catador', bloquear_dados: false }
};

export function getRegrasArmazenadas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGRAS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function obterRegrasStatus(cod_status, nomeStatus = '') {
  const cod = cod_status ? parseInt(cod_status, 10) : null;
  const nomeNorm = String(nomeStatus || '').toLowerCase().trim();
  const armazenadas = getRegrasArmazenadas();

  let regraBase = { regra_catador: 'opcional', bloquear_dados: false };

  // 1. Regras padrão por código fixo
  if (cod && REGRAS_PADRAO_STATUS[cod]) {
    regraBase = { ...REGRAS_PADRAO_STATUS[cod] };
  } else if (/cancel/i.test(nomeNorm) || /(retirad|conclu)/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'opcional', bloquear_dados: true };
  } else if (/agend/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'requer_catador', bloquear_dados: false };
  } else if (/dispon/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'sem_catador', bloquear_dados: false };
  }

  // 2. Sobrescrita por regras salvas explicitamente pelo usuário
  if (cod && armazenadas[cod]) {
    return { ...regraBase, ...armazenadas[cod] };
  }
  if (armazenadas[nomeNorm]) {
    return { ...regraBase, ...armazenadas[nomeNorm] };
  }

  return regraBase;
}

export function salvarRegrasStatus(cod_status, regras) {
  if (!cod_status) return;
  const cod = parseInt(cod_status, 10);
  try {
    const armazenadas = getRegrasArmazenadas();
    armazenadas[cod] = {
      regra_catador: regras.regra_catador || 'opcional',
      bloquear_dados: Boolean(regras.bloquear_dados)
    };
    localStorage.setItem(STORAGE_KEY_REGRAS, JSON.stringify(armazenadas));
    window.dispatchEvent(new CustomEvent('status-rules-updated', { detail: { cod, regras } }));
  } catch (e) {
    console.warn('Erro ao salvar regras no localStorage:', e);
  }
}

export async function listarStatus() {
  try {
    const { data, error } = await supabase
      .from('status')
      .select('*')
      .order('cod_status', { ascending: true });

    if (error) throw error;
    const lista = data || [];
    return lista.map(st => {
      const regras = obterRegrasStatus(st.cod_status, st.status);
      return {
        ...st,
        regra_catador: st.regra_catador || regras.regra_catador,
        bloquear_dados: st.bloquear_dados !== undefined ? st.bloquear_dados : regras.bloquear_dados,
        regras
      };
    });
  } catch (err) {
    console.error('Erro ao listar status:', err);
    throw err;
  }
}

export async function criarStatus(nomeStatus, regras = {}) {
  const nomeLimpo = (nomeStatus || '').trim().toLowerCase();
  if (!nomeLimpo) {
    throw new Error('O nome do status é obrigatório.');
  }

  const regraCatador = regras.regra_catador || 'opcional';
  const bloquearDados = Boolean(regras.bloquear_dados);

  // Tentativa de insert completo (caso as colunas existam no banco)
  let insertData = null;
  let insertError = null;

  try {
    const res = await supabase
      .from('status')
      .insert([{ 
        status: nomeLimpo,
        regra_catador: regraCatador,
        bloquear_dados: bloquearDados
      }])
      .select()
      .single();
    insertData = res.data;
    insertError = res.error;
  } catch (e) {
    insertError = e;
  }

  // Fallback suave se as colunas opcionais não existirem no schema do Supabase
  if (insertError && (insertError.code === '42703' || insertError.message?.includes('column') || insertError.message?.includes('does not exist'))) {
    const fallbackRes = await supabase
      .from('status')
      .insert([{ status: nomeLimpo }])
      .select()
      .single();

    if (fallbackRes.error) {
      if (fallbackRes.error.code === '23505') {
        throw new Error(`Já existe um status cadastrado com o nome "${nomeLimpo}".`);
      }
      throw fallbackRes.error;
    }
    insertData = fallbackRes.data;
    insertError = null;
  } else if (insertError) {
    if (insertError.code === '23505') {
      throw new Error(`Já existe um status cadastrado com o nome "${nomeLimpo}".`);
    }
    throw insertError;
  }

  if (insertData?.cod_status) {
    salvarRegrasStatus(insertData.cod_status, { regra_catador: regraCatador, bloquear_dados: bloquearDados });
    insertData.regra_catador = regraCatador;
    insertData.bloquear_dados = bloquearDados;
    insertData.regras = { regra_catador: regraCatador, bloquear_dados: bloquearDados };
  }

  return insertData;
}

export async function atualizarStatus(cod_status, novoNome, regras = null) {
  const cod = parseInt(cod_status, 10);
  const nomeLimpo = (novoNome || '').trim().toLowerCase();

  if (!nomeLimpo) {
    throw new Error('O nome do status não pode ficar em branco.');
  }

  const regrasAtuais = obterRegrasStatus(cod, nomeLimpo);
  const regraCatador = (regras && regras.regra_catador !== undefined) ? regras.regra_catador : regrasAtuais.regra_catador;
  const bloquearDados = (regras && regras.bloquear_dados !== undefined) ? Boolean(regras.bloquear_dados) : regrasAtuais.bloquear_dados;

  let updateData = null;
  let updateError = null;

  try {
    const res = await supabase
      .from('status')
      .update({ 
        status: nomeLimpo,
        regra_catador: regraCatador,
        bloquear_dados: bloquearDados
      })
      .eq('cod_status', cod)
      .select()
      .single();
    updateData = res.data;
    updateError = res.error;
  } catch (e) {
    updateError = e;
  }

  // Fallback se colunas opcionais não existirem no banco
  if (updateError && (updateError.code === '42703' || updateError.message?.includes('column') || updateError.message?.includes('does not exist'))) {
    const fallbackRes = await supabase
      .from('status')
      .update({ status: nomeLimpo })
      .eq('cod_status', cod)
      .select()
      .single();

    if (fallbackRes.error) {
      if (fallbackRes.error.code === '23505') {
        throw new Error(`Já existe outro status com o nome "${nomeLimpo}".`);
      }
      throw fallbackRes.error;
    }
    updateData = fallbackRes.data;
    updateError = null;
  } else if (updateError) {
    if (updateError.code === '23505') {
      throw new Error(`Já existe outro status com o nome "${nomeLimpo}".`);
    }
    throw updateError;
  }

  salvarRegrasStatus(cod, { regra_catador: regraCatador, bloquear_dados: bloquearDados });
  if (updateData) {
    updateData.regra_catador = regraCatador;
    updateData.bloquear_dados = bloquearDados;
    updateData.regras = { regra_catador: regraCatador, bloquear_dados: bloquearDados };
  }

  return updateData;
}

export async function contarColetasPorStatus(cod_status) {
  try {
    const cod = parseInt(cod_status, 10);
    const { count, error } = await supabase
      .from('coleta')
      .select('*', { count: 'exact', head: true })
      .eq('cod_status', cod);

    if (error) return 0;
    return count || 0;
  } catch (e) {
    return 0;
  }
}

export async function excluirStatus(cod_status) {
  const cod = parseInt(cod_status, 10);

  // 1. Verifica se existem coletas usando este status
  const totalColetas = await contarColetasPorStatus(cod);
  if (totalColetas > 0) {
    throw new Error(
      `Este status não pode ser excluído pois está vinculado a ${totalColetas} coleta(s) no sistema. ` +
      `Para manter a rastreabilidade do histórico, você pode editar o nome deste status em vez de excluí-lo.`
    );
  }

  const { data, error } = await supabase
    .from('status')
    .delete()
    .eq('cod_status', cod);

  if (error) {
    console.error('Erro ao excluir status:', error);
    if (error.code === '23503' || error.message?.includes('foreign key')) {
      throw new Error('Este status está em uso por registros no banco de dados e não pode ser excluído.');
    }
    throw error;
  }

  return data;
}
