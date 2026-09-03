import { supabase } from '../lib/supabaseClient.js';

/**
 * Serviço de Coletas — Consulta de Dados Reais vinculados ao Cidadão e Apoios
 */

export async function listarLocaisRetirada() {
  try {
    const { data, error } = await supabase
      .from('local_retirada')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('Erro ao listar locais de retirada:', e);
    return [];
  }
}

export async function getLocalRetiradaPadrao() {
  try {
    const { data, error } = await supabase
      .from('local_retirada')
      .select('*')
      .eq('ativo', true)
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data || null;
  } catch (e) {
    console.error('Erro ao obter local padrão:', e);
    return null;
  }
}

export async function criarOferta({ cod_material, quantidade, foto_url, local_retirada_id }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) throw new Error('Usuário não autenticado.');

  let codStatus = 1; // 1 = disponível
  try {
    const { data: statusData } = await supabase
      .from('status')
      .select('cod_status')
      .eq('status', 'disponível')
      .maybeSingle();

    if (statusData && statusData.cod_status) codStatus = statusData.cod_status;
  } catch (e) {}

  let localId = local_retirada_id;
  if (!localId) {
    const localPadrao = await getLocalRetiradaPadrao();
    localId = localPadrao.id;
  }

  const { data, error } = await supabase
    .from('coleta')
    .insert([{
      cidadao_id: session.user.id,
      cod_material: parseInt(cod_material, 10),
      local_retirada_id: localId,
      cod_status: codStatus,
      quantidade,
      foto_url: foto_url || null
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listarColetasDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('coleta')
      .select('*')
      .is('catador_id', null)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      const abertas = data.filter(c => {
        const cod = c.cod_status;
        return (cod === 1 || cod === null || cod === undefined);
      });
      return await enriquecerColetas(abertas);
    }
  } catch (e) {
    console.warn('Erro ao listar coletas disponiveis:', e);
  }

  return [];
}

export async function listarTodasColetasAdmin(statusFiltro = 'todos') {
  try {
    const { data, error } = await supabase
      .from('coleta')
      .select('*')
      .order('criado_em', { ascending: false });

    if (!error && data) {
      let enriquecidas = await enriquecerColetas(data);
      if (statusFiltro !== 'todos') {
        const filtroNorm = (statusFiltro || '').toLowerCase();
        enriquecidas = enriquecidas.filter(c => {
          const stNome = (c.status?.status || c.status || '').toLowerCase();
          const cod = c.cod_status;
          if (filtroNorm.includes('dispon')) return cod === 1 || stNome.includes('dispon');
          if (filtroNorm.includes('agendad')) return cod === 2 || stNome.includes('agendad');
          if (filtroNorm.includes('conclu') || filtroNorm.includes('retirad')) return cod === 3 || stNome.includes('retirad') || stNome.includes('conclu');
          if (filtroNorm.includes('cancel')) return cod === 4 || cod === 5 || stNome.includes('cancel');
          return true;
        });
      }
      return enriquecidas;
    }
  } catch (err) {
    console.warn('Erro em listarTodasColetasAdmin:', err);
  }

  return [];
}

/**
 * Consulta Dados Reais do Cidadão no Banco de Dados Supabase
 */
export async function listarMinhasColetasCidadao() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return [];

  const cidadaoId = session.user.id;

  try {
    const { data, error } = await supabase
      .from('coleta')
      .select('*')
      .eq('cidadao_id', cidadaoId)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      return await enriquecerColetas(data);
    }
  } catch (e) {
    console.warn('Erro em listarMinhasColetasCidadao:', e);
  }

  return [];
}

export async function listarMinhasColetasCatador() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return [];

  const currentUserId = session.user.id;
  const idsParaBuscar = [currentUserId];

  try {
    const { data: cat } = await supabase
      .from('catador')
      .select('id')
      .or(`auth_user_id.eq.${currentUserId},id.eq.${currentUserId}`)
      .maybeSingle();

    if (cat && cat.id && !idsParaBuscar.includes(cat.id)) {
      idsParaBuscar.push(cat.id);
    }
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('coleta')
      .select('*')
      .in('catador_id', idsParaBuscar)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      return await enriquecerColetas(data);
    }
  } catch (err) {
    console.warn('Erro em listarMinhasColetasCatador:', err);
  }

  return [];
}

export async function getStatusDisponiveis() {
  try {
    const { data, error } = await supabase
      .from('status')
      .select('*')
      .order('cod_status', { ascending: true });
    if (!error && data && data.length > 0) return data;
  } catch (e) {}
  return [];
}

async function obterCodStatusReal(termoStatus, fallbackNum = 1) {
  try {
    const { data: lista } = await supabase.from('status').select('cod_status, status');
    if (lista && lista.length > 0) {
      const match = lista.find(s => (s.status || '').toLowerCase().includes(termoStatus.toLowerCase()));
      if (match && match.cod_status) return match.cod_status;
      if (termoStatus.includes('cancel')) {
        const canMatch = lista.find(s => (s.status || '').toLowerCase().includes('canc'));
        if (canMatch) return canMatch.cod_status;
        return lista[lista.length - 1].cod_status;
      }
      return lista[0].cod_status;
    }
  } catch (e) {
    console.warn(`Erro ao resolver cod_status para '${termoStatus}':`, e);
  }
  return fallbackNum;
}

export async function confirmarRetirada(cod_coleta) {
  const codStatus = await obterCodStatusReal('retirad', 3);

  const { data, error } = await supabase
    .from('coleta')
    .update({ cod_status: codStatus, atualizado_em: new Date().toISOString() })
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao confirmar retirada:', error);
    if (error.message?.includes('foreign key constraint') || error.code === '23503') {
      const lista = await getStatusDisponiveis();
      if (lista.length > 0) {
        const bestSt = lista.find(s => s.status?.toLowerCase().includes('retirad') || s.status?.toLowerCase().includes('conclu')) || lista[0];
        const { data: retryData, error: retryErr } = await supabase
          .from('coleta')
          .update({ cod_status: bestSt.cod_status, atualizado_em: new Date().toISOString() })
          .eq('cod_coleta', cod_coleta)
          .select();
        if (retryErr) throw retryErr;
        return retryData;
      }
    }
    throw error;
  }
  return data;
}

export async function cancelarAgendamento(cod_coleta) {
  // 1. Tenta via RPC 'cancelar_agendamento' (segurança nativa no Supabase que ignora bloqueio de RLS)
  try {
    const { data: rpcData, error: rpcErr } = await supabase.rpc('cancelar_agendamento', {
      p_coleta_id: cod_coleta
    });
    if (!rpcErr && rpcData) {
      return rpcData;
    }
  } catch (e) {
    console.warn('RPC cancelar_agendamento não configurado, executando fallback direto:', e);
  }

  // 2. Fallback direto na tabela coleta
  const codStatus = await obterCodStatusReal('dispon', 1);

  const { data, error } = await supabase
    .from('coleta')
    .update({ 
      cod_status: codStatus, 
      catador_id: null, 
      agenda_id: null,
      data: null, 
      hora: null, 
      atualizado_em: new Date().toISOString() 
    })
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao cancelar agendamento / reabrir oferta:', error);
    if (error.message?.includes('foreign key constraint') || error.code === '23503') {
      const lista = await getStatusDisponiveis();
      if (lista.length > 0) {
        const bestSt = lista.find(s => s.status?.toLowerCase().includes('dispon')) || lista[0];
        const { data: retryData, error: retryErr } = await supabase
          .from('coleta')
          .update({ 
            cod_status: bestSt.cod_status, 
            catador_id: null, 
            agenda_id: null,
            data: null, 
            hora: null, 
            atualizado_em: new Date().toISOString() 
          })
          .eq('cod_coleta', cod_coleta)
          .select();
        if (retryErr) throw retryErr;
        if (!retryErr && Array.isArray(retryData) && retryData.length === 0) {
          throw new Error('O banco de dados (RLS) bloqueou a desvinculação do catador. É necessário executar o script SQL no Supabase para liberar o cancelamento.');
        }
        return retryData;
      }
    }
    throw error;
  }

  if (Array.isArray(data) && data.length === 0) {
    throw new Error('O banco de dados (RLS) bloqueou a desvinculação do catador. É necessário executar o script SQL no Supabase para liberar o cancelamento.');
  }

  return data;
}

export const reabrirOferta = cancelarAgendamento;
export const reabrirColeta = cancelarAgendamento;
export const cancelarColeta = cancelarOferta;

export async function cancelarOferta(cod_coleta) {
  const codStatus = await obterCodStatusReal('cancel', 5);

  const { data, error } = await supabase
    .from('coleta')
    .update({ cod_status: codStatus, catador_id: null, atualizado_em: new Date().toISOString() })
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao cancelar coleta:', error);
    if (error.message?.includes('foreign key constraint') || error.code === '23503') {
      const lista = await getStatusDisponiveis();
      if (lista.length > 0) {
        const bestSt = lista.find(s => s.status?.toLowerCase().includes('canc')) || lista[lista.length - 1];
        const { data: retryData, error: retryErr } = await supabase
          .from('coleta')
          .update({ cod_status: bestSt.cod_status, catador_id: null, atualizado_em: new Date().toISOString() })
          .eq('cod_coleta', cod_coleta)
          .select();
        if (retryErr) throw retryErr;
        return retryData;
      }
    }
    throw error;
  }
  return data;
}

export async function atribuirCatadorColeta(coletaId, catadorId) {
  const catId = (catadorId && catadorId.trim() !== '') ? catadorId : null;

  const { data: col } = await supabase
    .from('coleta')
    .select('cod_status')
    .eq('cod_coleta', coletaId)
    .maybeSingle();

  let novoCodStatus = col ? col.cod_status : 1;

  if (catId && novoCodStatus === 1) {
    novoCodStatus = 2; // Altera para 'agendado' ao atribuir um catador
  } else if (!catId && novoCodStatus === 2) {
    novoCodStatus = 1; // Altera para 'disponível' ao remover o catador
  }

  const { data, error } = await supabase
    .from('coleta')
    .update({
      catador_id: catId,
      cod_status: novoCodStatus,
      atualizado_em: new Date().toISOString()
    })
    .eq('cod_coleta', coletaId)
    .select();

  if (error) throw error;
  return data;
}

// Helper: enriquece coletas brutas vinculando os objetos reais de materiais, status, local_retirada, catador e cidadão
async function enriquecerColetas(coletasBrutas) {
  if (!coletasBrutas || coletasBrutas.length === 0) return [];

  try {
    const cidadaoIds = Array.from(new Set(coletasBrutas.map(c => c.cidadao_id).filter(Boolean)));
    const catadorIds = Array.from(new Set(coletasBrutas.map(c => c.catador_id).filter(Boolean)));

    // Busca dados dos cidadãos ofertantes
    let cidadaosData = [];
    if (cidadaoIds.length > 0) {
      try {
        const { data: rpcCid, error: rpcErr } = await supabase.rpc('buscar_ofertante', { p_ids: cidadaoIds });
        if (!rpcErr && rpcCid && rpcCid.length > 0) {
          cidadaosData = rpcCid;
        } else {
          const { data: directCid } = await supabase.from('cidadao').select('id, nome, telefone').in('id', cidadaoIds);
          cidadaosData = directCid || [];
        }
      } catch (e) {
        try {
          const { data: directCid } = await supabase.from('cidadao').select('id, nome, telefone').in('id', cidadaoIds);
          cidadaosData = directCid || [];
        } catch (e2) {}
      }
    }

    const [resMats, resSt, resLoc, resCat] = await Promise.allSettled([
      supabase.from('materiais').select('*'),
      supabase.from('status').select('*'),
      supabase.from('local_retirada').select('*'),
      catadorIds.length > 0 ? supabase.from('catador').select('*').in('id', catadorIds) : Promise.resolve({ data: [] })
    ]);

    const matsMap = {};
    if (resMats.status === 'fulfilled' && resMats.value?.data) {
      resMats.value.data.forEach(m => { matsMap[m.cod_material] = m; });
    }

    const stMap = {};
    if (resSt.status === 'fulfilled' && resSt.value?.data) {
      resSt.value.data.forEach(s => { stMap[s.cod_status] = s; });
    }

    const locMap = {};
    if (resLoc.status === 'fulfilled' && resLoc.value?.data) {
      resLoc.value.data.forEach(l => { locMap[l.id] = l; });
    }

    const catMap = {};
    if (resCat.status === 'fulfilled' && resCat.value?.data) {
      resCat.value.data.forEach(ct => { catMap[ct.id] = ct; });
    }

    const cidMap = {};
    cidadaosData.forEach(cd => { cidMap[cd.id] = cd; });

    // Atualiza cache de nomes de usuários se novos forem encontrados
    try {
      const localNamesCache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');
      cidadaosData.forEach(cd => {
        if (cd.id && cd.nome && !cd.nome.toLowerCase().includes('erro')) {
          localNamesCache[cd.id] = cd.nome;
        }
      });
      localStorage.setItem('sys_user_names', JSON.stringify(localNamesCache));
    } catch (e) {}

    const localNamesCache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');

    return coletasBrutas.map(c => {
      const matObj = c.materiais || matsMap[c.cod_material] || { tipo: 'Material Reciclável' };
      const stObj = c.status || stMap[c.cod_status] || { status: 'disponível' };
      const locObj = c.local_retirada || locMap[c.local_retirada_id] || { nome: 'Fatec Franco da Rocha' };
      const catObj = c.catador || catMap[c.catador_id] || null;
      
      const cidObj = c.cidadao || cidMap[c.cidadao_id] || null;
      let cidNomeVal = cidObj?.nome || localNamesCache[c.cidadao_id];

      if (!cidNomeVal || typeof cidNomeVal !== 'string' || cidNomeVal.trim() === '' || cidNomeVal.toLowerCase().includes('erro')) {
        cidNomeVal = 'Cidadão Doador';
      }

      const cidFinal = cidObj 
        ? { id: cidObj.id, nome: cidNomeVal, telefone: cidObj.telefone || '' } 
        : { id: c.cidadao_id, nome: cidNomeVal, telefone: '' };

      return {
        ...c,
        materiais: matObj,
        status: stObj,
        local_retirada: locObj,
        catador: catObj,
        cidadao: cidFinal
      };
    });
  } catch (e) {
    console.warn('Erro ao enriquecer coletas:', e);
    return coletasBrutas;
  }
}

/**
 * Assinatura em Tempo Real (Realtime) para atualizações na tabela coleta
 */
export function assinarColetasEmTempoReal(callback) {
  try {
    const channel = supabase
      .channel('public:coleta')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coleta' }, () => {
        if (typeof callback === 'function') callback();
      })
      .subscribe();

    return channel;
  } catch (err) {
    console.warn('Realtime de coletas indisponível:', err);
    return null;
  }
}

export async function listarCatadoresParaVincular() {
  try {
    const { data, error } = await supabase
      .from('catador')
      .select('id, nome, auth_user_id')
      .order('nome', { ascending: true });
    if (!error && data) return data;
  } catch (e) {}
  return [];
}

export const vincularCatadorColeta = atribuirCatadorColeta;
