import { supabase } from '../lib/supabaseClient.js';
import { validarHorarioAgendamento } from './agenda.js';
import { obterRegrasStatus } from './status.js';

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

/**
 * Resolve e padroniza o status operacional da coleta com base nas regras operacionais
 * (bloquear_dados e regra_catador: sem_catador, requer_catador ou opcional)
 */
export function resolverStatusColeta(c) {
  if (!c) {
    return {
      codigo: 1,
      nome: 'disponível',
      rotulo: 'DISPONÍVEL',
      ehCancelada: false,
      ehRetirada: false,
      ehAgendada: false,
      ehDisponivel: true,
      bloquearDados: false,
      requerCatador: false,
      semCatador: true,
      regras: { regra_catador: 'sem_catador', bloquear_dados: false }
    };
  }

  const codSt = Number(c.cod_status) || 1;
  const stNome = String(c.status?.status || c.status || '').toLowerCase().trim();
  const regras = obterRegrasStatus(codSt, stNome);

  // Identificação dos status tradicionais
  const ehCancelada = (codSt === 4 || codSt === 5 || /cancel/i.test(stNome));
  const ehRetirada = (codSt === 3 || /(retirad|conclu)/i.test(stNome));

  // Um status é agendado se for cod 2, se tiver regra "requer_catador", ou se já tiver catador (e não for sem_catador/finalizado)
  const temCatador = Boolean(c.catador_id && String(c.catador_id).trim() !== '');
  const ehAgendada = (!ehCancelada && !ehRetirada) && (
    codSt === 2 ||
    regras.regra_catador === 'requer_catador' ||
    (/(^|\s)agend/i.test(stNome) && !/reagend/i.test(stNome)) ||
    (temCatador && regras.regra_catador !== 'sem_catador')
  );

  const ehDisponivel = (!ehCancelada && !ehRetirada && !ehAgendada) && (
    codSt === 1 ||
    regras.regra_catador === 'sem_catador' ||
    /dispon/i.test(stNome)
  );

  const rotulo = stNome ? stNome.toUpperCase() : (ehCancelada ? 'CANCELADA' : ehRetirada ? 'RETIRADA' : ehAgendada ? 'AGENDADA' : 'DISPONÍVEL');

  return {
    codigo: codSt,
    nome: stNome || (ehCancelada ? 'cancelado' : ehRetirada ? 'retirado' : ehAgendada ? 'agendado' : 'disponível'),
    rotulo,
    ehCancelada,
    ehRetirada,
    ehAgendada,
    ehDisponivel,
    bloquearDados: Boolean(regras.bloquear_dados || ehCancelada || ehRetirada),
    requerCatador: Boolean(regras.regra_catador === 'requer_catador' || (ehAgendada && !ehCancelada && !ehRetirada)),
    semCatador: Boolean(regras.regra_catador === 'sem_catador' || ehDisponivel),
    regras
  };
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
        const filtroNorm = (statusFiltro || '').toLowerCase().trim();
        const codFiltroNum = parseInt(statusFiltro, 10);
        enriquecidas = enriquecidas.filter(c => {
          const st = resolverStatusColeta(c);
          if (!isNaN(codFiltroNum) && (st.codigo === codFiltroNum || c.cod_status === codFiltroNum)) return true;
          if (filtroNorm === 'disponível' || filtroNorm === 'disponivel') return st.ehDisponivel;
          if (filtroNorm === 'agendado' || filtroNorm === 'agendada') return st.ehAgendada;
          if (filtroNorm.includes('conclu') || filtroNorm.includes('retirad')) return st.ehRetirada;
          if (filtroNorm.includes('cancel')) return st.ehCancelada;
          if (st.nome.toLowerCase() === filtroNorm || String(st.rotulo || '').toLowerCase() === filtroNorm) return true;
          return false;
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

    if (error) {
      console.error('Erro em listarMinhasColetasCidadao do Supabase:', error);
      throw error;
    }

    if (data) {
      return await enriquecerColetas(data);
    }
  } catch (e) {
    console.warn('Erro em listarMinhasColetasCidadao:', e);
    throw e;
  }

  return [];
}

export async function listarMinhasColetasCatador() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return [];

  const currentUserId = session.user.id;
  const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : null;
  const idsParaBuscar = [currentUserId];

  try {
    let q = supabase.from('catador').select('id');
    if (userEmail) {
      q = q.or(`auth_user_id.eq.${currentUserId},id.eq.${currentUserId},email.ilike.${userEmail}`);
    } else {
      q = q.or(`auth_user_id.eq.${currentUserId},id.eq.${currentUserId}`);
    }
    const { data: cats } = await q;
    if (cats && cats.length > 0) {
      cats.forEach(c => {
        if (c.id && !idsParaBuscar.includes(c.id)) {
          idsParaBuscar.push(c.id);
        }
      });
    }
  } catch (e) {
    console.warn('Erro ao buscar IDs de catador para listar coletas:', e);
  }

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
  // Validação: a coleta precisa ter um catador alocado para ser marcada como retirada
  const { data: col } = await supabase
    .from('coleta')
    .select('catador_id, data, hora')
    .eq('cod_coleta', cod_coleta)
    .maybeSingle();

  if (!col || !col.catador_id) {
    throw new Error('A coleta precisa ter um catador alocado para ser confirmada como retirada.');
  }

  const codStatus = await obterCodStatusReal('retirad', 3);

  const agora = new Date();
  const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
  const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

  const payloadUpdate = {
    cod_status: codStatus,
    atualizado_em: agora.toISOString()
  };

  // Se a coleta ainda não possuía data ou hora gravadas, registra a data e horário da retirada
  if (!col.data) payloadUpdate.data = dataHoje;
  if (!col.hora) payloadUpdate.hora = horaAgora;

  const { data, error } = await supabase
    .from('coleta')
    .update(payloadUpdate)
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao confirmar retirada:', error);
    if (error.message?.includes('foreign key constraint') || error.code === '23503') {
      const lista = await getStatusDisponiveis();
      if (lista.length > 0) {
        const bestSt = lista.find(s => s.status?.toLowerCase().includes('retirad') || s.status?.toLowerCase().includes('conclu')) || lista[0];
        payloadUpdate.cod_status = bestSt.cod_status;
        const { data: retryData, error: retryErr } = await supabase
          .from('coleta')
          .update(payloadUpdate)
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
  // Validação de integridade: não permite desvincular catador de coleta já retirada
  const { data: colStatus } = await supabase
    .from('coleta')
    .select('cod_status')
    .eq('cod_coleta', cod_coleta)
    .maybeSingle();

  if (colStatus && resolverStatusColeta(colStatus).ehRetirada) {
    throw new Error('Esta coleta já foi retirada e concluída. Não é possível alterar o catador ou cancelar o agendamento.');
  }

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
  const { data: colStatus } = await supabase
    .from('coleta')
    .select('cod_status')
    .eq('cod_coleta', cod_coleta)
    .maybeSingle();

  if (colStatus && resolverStatusColeta(colStatus).ehRetirada) {
    throw new Error('Esta coleta já foi retirada e concluída. Não é possível cancelá-la.');
  }

  const codStatus = await obterCodStatusReal('cancel', 5);

  const payloadCancelamento = {
    cod_status: codStatus,
    catador_id: null,
    agenda_id: null,
    data: null,
    hora: null,
    atualizado_em: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('coleta')
    .update(payloadCancelamento)
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao cancelar coleta:', error);
    if (error.message?.includes('foreign key constraint') || error.code === '23503') {
      const lista = await getStatusDisponiveis();
      if (lista.length > 0) {
        const bestSt = lista.find(s => s.status?.toLowerCase().includes('canc')) || lista[lista.length - 1];
        payloadCancelamento.cod_status = bestSt.cod_status;
        const { data: retryData, error: retryErr } = await supabase
          .from('coleta')
          .update(payloadCancelamento)
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

export async function atualizarStatusColeta(cod_coleta, novoCodStatus) {
  const codNum = parseInt(novoCodStatus, 10);
  const vaiSerDisponivel = (codNum === 1);
  const vaiSerCancelada = (codNum === 5);

  const { data: colAtual } = await supabase
    .from('coleta')
    .select('cod_status, catador_id, data, hora')
    .eq('cod_coleta', cod_coleta)
    .maybeSingle();

  if (colAtual) {
    const stAtual = resolverStatusColeta(colAtual);
    if (stAtual.ehRetirada && codNum !== 3) {
      throw new Error('Esta coleta já foi concluída e retirada. O status não pode ser alterado.');
    }
    if (stAtual.ehCancelada && codNum !== 5) {
      throw new Error('Esta coleta está cancelada. O status não pode ser alterado.');
    }
  }

  const updatePayload = {
    cod_status: codNum,
    atualizado_em: new Date().toISOString()
  };

  // Se voltar a coleta para disponível ou cancelada, desvincula o catador e horários
  if (vaiSerDisponivel || vaiSerCancelada) {
    updatePayload.catador_id = null;
    updatePayload.agenda_id = null;
    updatePayload.data = null;
    updatePayload.hora = null;
  } else if (codNum === 3) {
    // Se marcar como Retirada, garante que data e hora estejam registradas
    const { data: colAtual } = await supabase
      .from('coleta')
      .select('data, hora')
      .eq('cod_coleta', cod_coleta)
      .maybeSingle();

    const agora = new Date();
    const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;

    if (colAtual && !colAtual.data) updatePayload.data = dataHoje;
    if (colAtual && !colAtual.hora) updatePayload.hora = horaAgora;
  }

  const { data, error } = await supabase
    .from('coleta')
    .update(updatePayload)
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao atualizar status da coleta:', error);
    throw error;
  }
  return data;
}

export async function atualizarColetaCompleta({
  cod_coleta,
  cod_status,
  catador_id,
  data,
  hora,
  quantidade,
  local_retirada_id
}) {
  const codNum = parseInt(cod_status, 10);
  const catId = (catador_id && String(catador_id).trim() !== '') ? catador_id : null;

  // Consulta situação atual no banco para validação de integridade
  const { data: colAtual } = await supabase
    .from('coleta')
    .select('cod_status, catador_id, data, hora, local_retirada_id')
    .eq('cod_coleta', cod_coleta)
    .maybeSingle();

  if (colAtual) {
    const stAtual = resolverStatusColeta(colAtual);
    if (stAtual.bloquearDados) {
      if (codNum !== colAtual.cod_status) {
        throw new Error(`Esta coleta está com status "${stAtual.rotulo}" (dados bloqueados) e não pode ser alterada.`);
      }
    }
    if (stAtual.ehCancelada && codNum !== 4 && codNum !== 5) {
      throw new Error('Esta coleta está cancelada e não pode ter seu status alterado.');
    }
  }

  const regrasNovoStatus = obterRegrasStatus(codNum);

  // Validação conforme regra do status
  if (regrasNovoStatus.regra_catador === 'requer_catador' && !catId) {
    throw new Error('Para salvar neste status, é obrigatório selecionar um catador responsável.');
  }

  // Validação de horário de funcionamento da agenda se o status requerer catador
  if (regrasNovoStatus.regra_catador === 'requer_catador' && data && hora) {
    const locIdEfetivo = local_retirada_id || (colAtual && colAtual.local_retirada_id);
    const validacaoAgenda = await validarHorarioAgendamento({
      local_retirada_id: locIdEfetivo,
      data,
      hora
    });
    if (!validacaoAgenda.valido) {
      throw new Error(validacaoAgenda.erro);
    }
  }

  const updatePayload = {
    cod_status: codNum,
    catador_id: catId,
    atualizado_em: new Date().toISOString()
  };

  // Se voltar a coleta para status sem catador ou cancelada, desvincula o catador e horários
  if (regrasNovoStatus.regra_catador === 'sem_catador' || codNum === 4 || codNum === 5) {
    updatePayload.catador_id = null;
    updatePayload.agenda_id = null;
    updatePayload.data = null;
    updatePayload.hora = null;
  } else if (codNum === 3 || regrasNovoStatus.bloquear_dados) {
    // Retirada ou status bloqueado: data e hora da ocorrência realizada
    const agora = new Date();
    const dataHoje = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaAgora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    updatePayload.data = (data && data.trim() !== '') ? data : dataHoje;
    updatePayload.hora = (hora && hora.trim() !== '') ? hora : horaAgora;
  } else if (regrasNovoStatus.regra_catador === 'requer_catador') {
    // Se for agendada/reagendada, garante data e hora gravadas
    const agora = new Date();
    if (agora.getHours() >= 17) agora.setDate(agora.getDate() + 1);
    const dataPadrao = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaPadrao = '09:00';

    updatePayload.data = (data && data.trim() !== '') ? data : dataPadrao;
    updatePayload.hora = (hora && hora.trim() !== '') ? hora : horaPadrao;
  }

  if (quantidade !== undefined && quantidade !== null) {
    updatePayload.quantidade = quantidade.trim();
  }

  if (local_retirada_id) {
    updatePayload.local_retirada_id = local_retirada_id;
  }

  const { data: resData, error } = await supabase
    .from('coleta')
    .update(updatePayload)
    .eq('cod_coleta', cod_coleta)
    .select();

  if (error) {
    console.error('Erro ao atualizar informações da coleta:', error);
    throw error;
  }

  return resData;
}

export async function atribuirCatadorColeta(coletaId, catadorId, dataAgendada = null, horaAgendada = null) {
  const catId = (catadorId && catadorId.trim() !== '') ? catadorId : null;

  const { data: col } = await supabase
    .from('coleta')
    .select('cod_status, data, hora, catador_id, local_retirada_id')
    .eq('cod_coleta', coletaId)
    .maybeSingle();

  if (col) {
    const stResolvido = resolverStatusColeta(col);
    if (stResolvido.ehRetirada) {
      throw new Error('Esta coleta já foi retirada e concluída. O catador responsável não pode ser alterado.');
    }
    if (stResolvido.ehCancelada) {
      throw new Error('Esta coleta está cancelada e não permite atribuição de catador.');
    }
  }

  let novoCodStatus = col ? col.cod_status : 1;

  if (catId && novoCodStatus === 1) {
    novoCodStatus = 2; // Altera para 'agendado' ao atribuir um catador
  } else if (!catId && novoCodStatus === 2) {
    novoCodStatus = 1; // Altera para 'disponível' ao remover o catador
  }

  // Validação estrita de agendamento contra o horário de funcionamento da agenda
  if (catId && novoCodStatus === 2) {
    const dataChecar = dataAgendada || (col && col.data);
    const horaChecar = horaAgendada || (col && col.hora);
    if (dataChecar && horaChecar) {
      const validacaoAgenda = await validarHorarioAgendamento({
        local_retirada_id: col?.local_retirada_id,
        data: dataChecar,
        hora: horaChecar
      });
      if (!validacaoAgenda.valido) {
        throw new Error(validacaoAgenda.erro);
      }
    }
  }

  const updatePayload = {
    catador_id: catId,
    cod_status: novoCodStatus,
    atualizado_em: new Date().toISOString()
  };

  if (!catId) {
    updatePayload.agenda_id = null;
    updatePayload.data = null;
    updatePayload.hora = null;
  } else {
    // Ao atribuir catador, garante que data e hora do agendamento fiquem gravadas no banco
    const agora = new Date();
    if (agora.getHours() >= 17) agora.setDate(agora.getDate() + 1);
    const dataPadrao = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
    const horaPadrao = '09:00';

    updatePayload.data = dataAgendada || (col && col.data) || dataPadrao;
    updatePayload.hora = horaAgendada || (col && col.hora) || horaPadrao;
  }

  const { data, error } = await supabase
    .from('coleta')
    .update(updatePayload)
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
      
      let stObj = c.status || stMap[c.cod_status];
      if (!stObj) {
        if (c.cod_status === 4 || c.cod_status === 5) stObj = { cod_status: c.cod_status, status: 'cancelado' };
        else if (c.cod_status === 3) stObj = { cod_status: 3, status: 'retirado' };
        else if (c.cod_status === 2) stObj = { cod_status: 2, status: 'agendado' };
        else if (c.cod_status === 6) stObj = { cod_status: 6, status: 'reagendado' };
        else stObj = { cod_status: 1, status: 'disponível' };
      }

      // Se cod_status for 4 ou 5 ou texto cancelado
      if (c.cod_status === 4 || c.cod_status === 5 || /cancel/i.test(stObj.status || '')) {
        stObj = { cod_status: stObj.cod_status || 4, status: 'cancelado' };
      } else if (c.cod_status === 3 || /(retirad|conclu)/i.test(stObj.status || '')) {
        stObj = { cod_status: 3, status: 'retirado' };
      } else if (c.cod_status === 2) {
        stObj = { cod_status: 2, status: 'agendado' };
      } else if (c.cod_status === 6) {
        stObj = { cod_status: 6, status: 'reagendado' };
      }

      let cData = c.data;
      let cHora = c.hora;
      // Para coletas retiradas, canceladas ou bloqueadas sem data/hora explícita, usa o momento em que a ação foi registrada
      const stRegras = obterRegrasStatus(stObj.cod_status, stObj.status);
      if ((stRegras.bloquear_dados || stObj.cod_status === 3 || stObj.cod_status === 4 || stObj.cod_status === 5) && (!cData || !cHora)) {
        const dtRef = c.atualizado_em ? new Date(c.atualizado_em) : (c.criado_em ? new Date(c.criado_em) : null);
        if (dtRef && !isNaN(dtRef.getTime())) {
          const y = dtRef.getFullYear();
          const m = String(dtRef.getMonth() + 1).padStart(2, '0');
          const d = String(dtRef.getDate()).padStart(2, '0');
          if (!cData) cData = `${y}-${m}-${d}`;
          if (!cHora) cHora = `${String(dtRef.getHours()).padStart(2, '0')}:${String(dtRef.getMinutes()).padStart(2, '0')}`;
        }
      }

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
        data: cData,
        hora: cHora,
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
