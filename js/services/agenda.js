import { supabase } from '../lib/supabaseClient.js';

/**
 * Serviço de Agenda — Reciclagem Solidária (Calendário de Dias Úteis e Feriados)
 */

export async function criarHorarioAgenda({ local_retirada_id, data, hora_inicio, hora_fim, disponivel = true }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado.');

  const { data: existing } = await supabase
    .from('agenda')
    .select('id')
    .eq('local_retirada_id', local_retirada_id)
    .eq('data', data)
    .maybeSingle();

  if (existing) {
    const { data: updated, error } = await supabase
      .from('agenda')
      .update({
        hora_inicio,
        hora_fim,
        disponivel
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  } else {
    const { data: inserted, error } = await supabase
      .from('agenda')
      .insert([{
        local_retirada_id,
        data,
        hora_inicio,
        hora_fim,
        disponivel,
        criado_por: session.user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  }
}

// Salva o mapa completo de agenda no banco de dados de uma só vez (Somente quando o usuário clica em Salvar)
export async function salvarAgendaEmLote({ local_retirada_id, mapaDatas, hora_inicio = '08:00', hora_fim = '17:00' }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado.');

  const datas = Object.keys(mapaDatas);
  if (datas.length === 0) return [];

  // Remove registros existentes das datas enviadas
  await supabase.from('agenda').delete().eq('local_retirada_id', local_retirada_id).in('data', datas);

  const registros = datas.map(dateStr => {
    const entry = mapaDatas[dateStr];
    let isDisp = false;
    let hIni = hora_inicio;
    let hFim = hora_fim;

    if (typeof entry === 'boolean') {
      isDisp = entry;
    } else if (entry) {
      isDisp = Boolean(entry.disponivel);
      hIni = entry.hora_inicio || hora_inicio;
      hFim = entry.hora_fim || hora_fim;
    }

    return {
      local_retirada_id,
      data: dateStr,
      hora_inicio: hIni,
      hora_fim: hFim,
      disponivel: isDisp,
      criado_por: session.user.id
    };
  });

  const { data, error } = await supabase.from('agenda').insert(registros).select();
  if (error) throw error;
  return data;
}

// Alterna a disponibilidade de uma data específica
export async function toggleDisponibilidadeData(local_retirada_id, dataStr, statusDisponivel, hora_inicio = '08:00', hora_fim = '17:00') {
  return await criarHorarioAgenda({
    local_retirada_id,
    data: dataStr,
    hora_inicio,
    hora_fim,
    disponivel: statusDisponivel
  });
}

// Lista os horários e dias cadastrados na agenda por local
export async function listarAgendaPorLocal(localId) {
  let query = supabase.from('agenda').select('*');
  if (localId) {
    query = query.eq('local_retirada_id', localId);
  }

  const { data, error } = await query
    .order('data', { ascending: true })
    .order('hora_inicio', { ascending: true });

  if (error) throw error;
  return data;
}

// Retorna apenas os dias marcados como DISPONÍVEIS para o catador agendar
export async function listarDatasDisponiveisCatador(localId) {
  const hojeStr = new Date().toISOString().split('T')[0];

  let query = supabase
    .from('agenda')
    .select('*')
    .eq('disponivel', true)
    .gte('data', hojeStr);

  if (localId) {
    query = query.eq('local_retirada_id', localId);
  }

  const { data, error } = await query.order('data', { ascending: true });
  if (error) throw error;
  return data;
}

export async function deletarHorarioAgenda(agendaId) {
  const { error } = await supabase.from('agenda').delete().eq('id', agendaId);
  if (error) throw error;
}
