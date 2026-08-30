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

// Salva o mapa completo de agenda no banco de dados de uma só vez (1 registro por data com upsert atômico)
export async function salvarAgendaEmLote({ local_retirada_id, mapaDatas, hora_inicio = '08:00', hora_fim = '17:00' }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Usuário não autenticado.');

  const datas = Object.keys(mapaDatas);
  if (datas.length === 0) return [];

  // Garante estritamente 1 único registro por data
  const mapUnico = new Map();
  datas.forEach(dateStr => {
    const entry = mapaDatas[dateStr];
    let isDisp = false;
    let hIni = hora_inicio;
    let hFim = hora_fim;
    let pIni = null;
    let pFim = null;

    if (typeof entry === 'boolean') {
      isDisp = entry;
    } else if (entry) {
      isDisp = Boolean(entry.disponivel);
      hIni = entry.hora_inicio || hora_inicio;
      hFim = entry.hora_fim || hora_fim;
      pIni = entry.pausa_inicio || null;
      pFim = entry.pausa_fim || null;

      // Se o objeto contiver representação de turnos separados, converte para abertura, fechamento e pausa
      if (!pIni && !pFim && entry.hora_inicio_2 && entry.hora_fim_2 && entry.hora_inicio_2 !== entry.hora_inicio) {
        pIni = entry.hora_fim;
        pFim = entry.hora_inicio_2;
        hFim = entry.hora_fim_2;
      }
    }

    mapUnico.set(dateStr, {
      local_retirada_id,
      data: dateStr,
      hora_inicio: hIni,
      hora_fim: hFim,
      pausa_inicio: pIni,
      pausa_fim: pFim,
      disponivel: isDisp,
      criado_por: session.user.id
    });
  });

  const registros = Array.from(mapUnico.values());

  // Upsert atômico com suporte às colunas pausa_inicio e pausa_fim
  let { data, error } = await supabase
    .from('agenda')
    .upsert(registros, { onConflict: 'local_retirada_id,data' })
    .select();
  
  if (error) {
    // Fallback caso a tabela no Supabase ainda não tenha as colunas pausa_inicio/pausa_fim
    if (error.code === '42703' || error.message?.includes('pausa_inicio') || error.message?.includes('pausa_fim')) {
      const fallbackRegistros = registros.map(r => ({
        local_retirada_id: r.local_retirada_id,
        data: r.data,
        hora_inicio: r.hora_inicio,
        hora_fim: r.hora_fim,
        disponivel: r.disponivel,
        criado_por: r.criado_por
      }));

      const { data: fbData, error: fbError } = await supabase
        .from('agenda')
        .upsert(fallbackRegistros, { onConflict: 'local_retirada_id,data' })
        .select();

      if (fbError) throw fbError;
      return fbData;
    }
    throw error;
  }

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
  const d = new Date();
  const hojeStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

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
