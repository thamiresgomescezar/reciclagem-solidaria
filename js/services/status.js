import { supabase } from '../lib/supabaseClient.js';

/**
 * Serviço de Gestão de Status — CRUD de Estados das Coletas do Sistema
 */

const STORAGE_KEY_REGRAS = 'reciclagem_status_regras';

export const PALETA_CORES_STATUS = {
  verde: {
    id: 'verde',
    nome: 'Verde Sustentável',
    bg: '#f0fdf4',
    cor: '#166534',
    borda: '#bbf7d0',
    dot: '#16a34a'
  },
  amarelo: {
    id: 'amarelo',
    nome: 'Amarelo / Âmbar',
    bg: '#fefce8',
    cor: '#854d0e',
    borda: '#fef08a',
    dot: '#d97706'
  },
  azul: {
    id: 'azul',
    nome: 'Azul Operacional',
    bg: '#eff6ff',
    cor: '#1e40af',
    borda: '#bfdbfe',
    dot: '#2563eb'
  },
  roxo: {
    id: 'roxo',
    nome: 'Roxo / Especial',
    bg: '#faf5ff',
    cor: '#6b21a8',
    borda: '#e9d5ff',
    dot: '#9333ea'
  },
  laranja: {
    id: 'laranja',
    nome: 'Laranja Alerta',
    bg: '#fff7ed',
    cor: '#9a3412',
    borda: '#fed7aa',
    dot: '#ea580c'
  },
  vermelho: {
    id: 'vermelho',
    nome: 'Vermelho Crítico',
    bg: '#fef2f2',
    cor: '#991b1b',
    borda: '#fecaca',
    dot: '#dc2626'
  },
  cinza: {
    id: 'cinza',
    nome: 'Cinza Neutro',
    bg: '#f8fafc',
    cor: '#334155',
    borda: '#cbd5e1',
    dot: '#64748b'
  }
};

export const REGRAS_PADRAO_STATUS = {
  1: { regra_catador: 'sem_catador', bloquear_dados: false, icone: 'fa-box-open', cor: 'verde' },
  2: { regra_catador: 'requer_catador', bloquear_dados: false, icone: 'fa-calendar-check', cor: 'amarelo' },
  3: { regra_catador: 'opcional', bloquear_dados: true, icone: 'fa-circle-check', cor: 'verde' },
  4: { regra_catador: 'opcional', bloquear_dados: true, icone: 'fa-ban', cor: 'vermelho' },
  5: { regra_catador: 'opcional', bloquear_dados: true, icone: 'fa-ban', cor: 'vermelho' },
  6: { regra_catador: 'requer_catador', bloquear_dados: false, icone: 'fa-calendar-days', cor: 'amarelo' }
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

  let regraBase = { regra_catador: 'opcional', bloquear_dados: false, icone: 'fa-tag', cor: 'verde' };

  // 1. Regras padrão por código fixo
  if (cod && REGRAS_PADRAO_STATUS[cod]) {
    regraBase = { ...REGRAS_PADRAO_STATUS[cod] };
  } else if (/cancel/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'opcional', bloquear_dados: true, icone: 'fa-ban', cor: 'vermelho' };
  } else if (/(retirad|conclu)/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'opcional', bloquear_dados: true, icone: 'fa-circle-check', cor: 'verde' };
  } else if (/reagend/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'requer_catador', bloquear_dados: false, icone: 'fa-calendar-days', cor: 'amarelo' };
  } else if (/agend/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'requer_catador', bloquear_dados: false, icone: 'fa-calendar-check', cor: 'amarelo' };
  } else if (/dispon/i.test(nomeNorm)) {
    regraBase = { regra_catador: 'sem_catador', bloquear_dados: false, icone: 'fa-box-open', cor: 'verde' };
  }

  // 2. Sobrescrita por regras salvas explicitamente pelo usuário
  let regraSalva = null;
  if (cod && armazenadas[cod]) {
    regraSalva = armazenadas[cod];
  } else if (nomeNorm && armazenadas[nomeNorm]) {
    regraSalva = armazenadas[nomeNorm];
  } else if (nomeNorm) {
    const semAcento = nomeNorm.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (armazenadas[semAcento]) {
      regraSalva = armazenadas[semAcento];
    } else {
      for (const [chave, reg] of Object.entries(armazenadas)) {
        const cLower = String(chave).toLowerCase();
        if (
          cLower === nomeNorm ||
          cLower === semAcento ||
          (/retirad/i.test(nomeNorm) && /retirad/i.test(cLower)) ||
          (/agend/i.test(nomeNorm) && /agend/i.test(cLower) && !/reagend/i.test(nomeNorm) && !/reagend/i.test(cLower)) ||
          (/dispon/i.test(nomeNorm) && /dispon/i.test(cLower)) ||
          (/cancel/i.test(nomeNorm) && /cancel/i.test(cLower))
        ) {
          regraSalva = reg;
          break;
        }
      }
    }
  }

  // Se passou cod numérico mas não achou em armazenadas pelo número, verificar correspondência fuzzy padrão
  if (!regraSalva && cod) {
    let termoFuzzy = null;
    if (cod === 1) termoFuzzy = 'dispon';
    else if (cod === 2) termoFuzzy = 'agend';
    else if (cod === 3) termoFuzzy = 'retirad';
    else if (cod === 4 || cod === 5) termoFuzzy = 'cancel';

    if (termoFuzzy) {
      for (const [chave, reg] of Object.entries(armazenadas)) {
        if (new RegExp(termoFuzzy, 'i').test(chave)) {
          regraSalva = reg;
          break;
        }
      }
    }
  }

  let resultado = regraBase;
  if (regraSalva) {
    resultado = { ...regraBase, ...regraSalva };
  }

  // Sanitização de regras inconsistentes para status cancelado
  if (cod === 4 || cod === 5 || /cancel/i.test(nomeNorm)) {
    if (!resultado.icone || resultado.icone === 'fa-circle-check' || resultado.icone === 'fa-tag') {
      resultado.icone = 'fa-ban';
    }
  }

  return resultado;
}

export function obterCoresStatus(cod_status, nomeStatus = '') {
  const regras = obterRegrasStatus(cod_status, nomeStatus);
  const corId = (regras && regras.cor && PALETA_CORES_STATUS[regras.cor]) ? regras.cor : null;

  if (corId) {
    return PALETA_CORES_STATUS[corId];
  }

  const cod = cod_status ? parseInt(cod_status, 10) : null;
  const nomeNorm = String(nomeStatus || '').toLowerCase().trim();

  if (cod === 4 || cod === 5 || /cancel/i.test(nomeNorm)) {
    return PALETA_CORES_STATUS.vermelho;
  }
  if (cod === 3 || /(retirad|conclu)/i.test(nomeNorm)) {
    return PALETA_CORES_STATUS.verde;
  }
  if (cod === 2 || regras.regra_catador === 'requer_catador' || /agend/i.test(nomeNorm)) {
    return PALETA_CORES_STATUS.amarelo;
  }
  if (cod === 1 || regras.regra_catador === 'sem_catador' || /dispon/i.test(nomeNorm)) {
    return PALETA_CORES_STATUS.verde;
  }

  return PALETA_CORES_STATUS.azul;
}

export function salvarRegrasStatus(cod_status, regras, nomeStatus = '') {
  if (!cod_status && !nomeStatus) return;
  const cod = cod_status ? parseInt(cod_status, 10) : null;
  try {
    const armazenadas = getRegrasArmazenadas();
    const regraObj = {
      regra_catador: regras.regra_catador || 'opcional',
      bloquear_dados: Boolean(regras.bloquear_dados),
      icone: regras.icone || 'fa-tag',
      cor: regras.cor || 'verde'
    };

    if (cod) {
      armazenadas[cod] = regraObj;
    }

    if (nomeStatus) {
      const n = String(nomeStatus).toLowerCase().trim();
      if (n) {
        armazenadas[n] = regraObj;
        const semAcento = n.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        armazenadas[semAcento] = regraObj;
        if (n.endsWith('a')) {
          armazenadas[n.slice(0, -1) + 'o'] = regraObj;
        } else if (n.endsWith('o')) {
          armazenadas[n.slice(0, -1) + 'a'] = regraObj;
        }
        if (semAcento.endsWith('a')) {
          armazenadas[semAcento.slice(0, -1) + 'o'] = regraObj;
        } else if (semAcento.endsWith('o')) {
          armazenadas[semAcento.slice(0, -1) + 'a'] = regraObj;
        }
      }
    }

    localStorage.setItem(STORAGE_KEY_REGRAS, JSON.stringify(armazenadas));

    // Sincroniza também com a lista em cache caso exista
    try {
      const rawLista = localStorage.getItem('reciclagem_lista_status');
      if (rawLista) {
        const parsed = JSON.parse(rawLista);
        if (Array.isArray(parsed)) {
          const atualizada = parsed.map(st => {
            if ((cod && st.cod_status === cod) || (nomeStatus && (st.status || '').toLowerCase() === String(nomeStatus).toLowerCase())) {
              return { ...st, regras: { ...st.regras, ...regraObj } };
            }
            return st;
          });
          localStorage.setItem('reciclagem_lista_status', JSON.stringify(atualizada));
        }
      }
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('status-rules-updated', { detail: { cod, regras: regraObj, nomeStatus } }));
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
    const lista = (data || []).map(st => {
      let stNome = (st.status || '').trim();
      const sLower = stNome.toLowerCase();
      if (sLower === 'retirado') stNome = 'retirada';
      else if (sLower === 'cancelado') stNome = 'cancelada';
      else if (sLower === 'agendado') stNome = 'agendada';
      else if (sLower === 'reagendado') stNome = 'reagendada';
      const regras = obterRegrasStatus(st.cod_status, stNome);
      return {
        ...st,
        status: stNome,
        regra_catador: st.regra_catador || regras.regra_catador,
        bloquear_dados: st.bloquear_dados !== undefined ? st.bloquear_dados : regras.bloquear_dados,
        regras
      };
    });

    try {
      localStorage.setItem('reciclagem_lista_status', JSON.stringify(lista));
    } catch (e) {}

    return lista;
  } catch (err) {
    console.error('Erro ao listar status:', err);
    try {
      const cached = localStorage.getItem('reciclagem_lista_status');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}

    // Fallback padrão caso não haja conexão com o Supabase nem cache local
    return [
      { cod_status: 1, status: 'disponível', regra_catador: 'sem_catador', bloquear_dados: false },
      { cod_status: 2, status: 'agendada', regra_catador: 'requer_catador', bloquear_dados: false },
      { cod_status: 3, status: 'retirada', regra_catador: 'opcional', bloquear_dados: true },
      { cod_status: 4, status: 'cancelada', regra_catador: 'opcional', bloquear_dados: true }
    ].map(st => ({
      ...st,
      regras: obterRegrasStatus(st.cod_status, st.status)
    }));
  }
}

export async function criarStatus(nomeStatus, regras = {}) {
  const nomeLimpo = (nomeStatus || '').trim().toLowerCase();
  if (!nomeLimpo) {
    throw new Error('O nome do status é obrigatório.');
  }

  const regraCatador = regras.regra_catador || 'opcional';
  const bloquearDados = Boolean(regras.bloquear_dados);
  const icone = regras.icone || 'fa-tag';
  const cor = regras.cor || 'verde';

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
    salvarRegrasStatus(insertData.cod_status, { regra_catador: regraCatador, bloquear_dados: bloquearDados, icone, cor }, nomeLimpo);
    insertData.regra_catador = regraCatador;
    insertData.bloquear_dados = bloquearDados;
    insertData.regras = { regra_catador: regraCatador, bloquear_dados: bloquearDados, icone, cor };
    try { await listarStatus(); } catch (e) {}
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
  const icone = (regras && regras.icone !== undefined) ? regras.icone : (regrasAtuais.icone || 'fa-tag');
  const cor = (regras && regras.cor !== undefined) ? regras.cor : (regrasAtuais.cor || 'verde');

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

  salvarRegrasStatus(cod, { regra_catador: regraCatador, bloquear_dados: bloquearDados, icone, cor }, nomeLimpo);
  if (updateData) {
    updateData.regra_catador = regraCatador;
    updateData.bloquear_dados = bloquearDados;
    updateData.regras = { regra_catador: regraCatador, bloquear_dados: bloquearDados, icone, cor };
  }
  try { await listarStatus(); } catch (e) {}

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

  try { await listarStatus(); } catch (e) {}

  return data;
}
