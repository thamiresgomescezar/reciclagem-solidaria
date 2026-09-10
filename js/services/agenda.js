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

/**
 * Consulta e calcula o horário de funcionamento de um ponto de retirada para uma data específica.
 * Prioridade:
 * 1. Registro explícito na tabela 'agenda' para a data
 * 2. Padrão semanal configurado pelo administrador no histórico da agenda
 * 3. Padrão geral do sistema (Segunda a Sexta das 08:00 às 17:00; Sábados e Domingos fechados)
 */
export async function obterHorarioFuncionamentoData(localId, dateStr) {
  if (!dateStr) {
    return { disponivel: false, erro: 'Data não informada.' };
  }

  const dataFmt = dateStr.slice(0, 10);
  const [y, m, d] = dataFmt.split('-').map(Number);
  const dataObj = new Date(y, m - 1, d);
  const diaSemanaIdx = dataObj.getDay(); // 0 = Dom, 6 = Sáb
  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const nomeDia = nomesDias[diaSemanaIdx];

  let targetLocalId = localId;
  if (!targetLocalId) {
    try {
      const { getLocalRetiradaPadrao } = await import('./coletas.js');
      const padrao = await getLocalRetiradaPadrao();
      if (padrao) targetLocalId = padrao.id;
    } catch (e) {}
  }

  let agendaData = [];
  try {
    if (targetLocalId) {
      const { data, error } = await supabase
        .from('agenda')
        .select('*')
        .eq('local_retirada_id', targetLocalId);
      if (!error && data) agendaData = data;
    }
  } catch (e) {
    console.warn('Erro ao consultar agenda no Supabase:', e);
  }

  // 1. Procura se há configuração específica cadastrada para este dia
  const diaEspecifico = agendaData.find(a => a.data === dataFmt);
  if (diaEspecifico) {
    const isDisp = Boolean(diaEspecifico.disponivel);
    let hIni = (diaEspecifico.hora_inicio || '08:00').slice(0, 5);
    let hFim = (diaEspecifico.hora_fim || '17:00').slice(0, 5);
    let pIni = diaEspecifico.pausa_inicio ? diaEspecifico.pausa_inicio.slice(0, 5) : null;
    let pFim = diaEspecifico.pausa_fim ? diaEspecifico.pausa_fim.slice(0, 5) : null;

    if (!pIni && !pFim && diaEspecifico.hora_inicio_2 && diaEspecifico.hora_fim_2 && diaEspecifico.hora_inicio_2 > hFim) {
      pIni = hFim;
      pFim = diaEspecifico.hora_inicio_2.slice(0, 5);
      hFim = diaEspecifico.hora_fim_2.slice(0, 5);
    }

    return {
      disponivel: isDisp,
      nomeDia,
      data: dataFmt,
      hora_inicio: hIni,
      hora_fim: hFim,
      pausa_inicio: pIni,
      pausa_fim: pFim,
      origem: 'especifico'
    };
  }

  // 2. Extrai padrão do histórico configurado para este mesmo dia da semana
  const diasDaMesmaSemana = agendaData.filter(a => {
    if (!a.data) return false;
    const [ay, am, ad] = a.data.split('-').map(Number);
    return new Date(ay, am - 1, ad).getDay() === diaSemanaIdx;
  });

  if (diasDaMesmaSemana.length > 0) {
    diasDaMesmaSemana.sort((a, b) => b.data.localeCompare(a.data));
    const maisRecente = diasDaMesmaSemana[0];
    const isDisp = Boolean(maisRecente.disponivel);
    let hIni = (maisRecente.hora_inicio || '08:00').slice(0, 5);
    let hFim = (maisRecente.hora_fim || '17:00').slice(0, 5);
    let pIni = maisRecente.pausa_inicio ? maisRecente.pausa_inicio.slice(0, 5) : null;
    let pFim = maisRecente.pausa_fim ? maisRecente.pausa_fim.slice(0, 5) : null;

    return {
      disponivel: isDisp,
      nomeDia,
      data: dataFmt,
      hora_inicio: hIni,
      hora_fim: hFim,
      pausa_inicio: pIni,
      pausa_fim: pFim,
      origem: 'padrao_semanal'
    };
  }

  // 3. Padrão Geral do Sistema:
  // Segunda a Sexta: 08:00 às 17:00 (aberto)
  // Sábado e Domingo: fechado
  const ehDiaUtil = (diaSemanaIdx >= 1 && diaSemanaIdx <= 5);
  return {
    disponivel: ehDiaUtil,
    nomeDia,
    data: dataFmt,
    hora_inicio: '08:00',
    hora_fim: '17:00',
    pausa_inicio: null,
    pausa_fim: null,
    origem: 'padrao_sistema'
  };
}

/**
 * Validação rigorosa de horário de agendamento contra o funcionamento real definido no calendário
 */
export async function validarHorarioAgendamento({ local_retirada_id, data, hora }) {
  if (!data) return { valido: false, erro: 'Por favor, selecione uma data para o agendamento.' };
  if (!hora) return { valido: false, erro: 'Por favor, selecione o horário previsto para a retirada.' };

  const dataFmt = data.slice(0, 10);
  const horaFmt = hora.slice(0, 5);

  const info = await obterHorarioFuncionamentoData(local_retirada_id, dataFmt);

  // 1. O ponto de retirada precisa estar aberto/disponível nesta data
  if (!info.disponivel) {
    return {
      valido: false,
      erro: `O ponto de retirada não possui atendimento em ${info.nomeDia} (${dataFmt.split('-').reverse().join('/')}), pois está fechado ou marcado como feriado/recesso no calendário. Por favor, escolha um dia útil.`
    };
  }

  // 2. Não permite agendar horários que já passaram na data de hoje
  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
  if (dataFmt === hojeStr) {
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const [th, tm] = horaFmt.split(':').map(Number);
    const targetMin = th * 60 + (tm || 0);

    if (targetMin <= minutosAgora) {
      return {
        valido: false,
        erro: `O horário informado (${horaFmt}) já passou na data de hoje. Por favor, escolha um horário futuro ou selecione uma data posterior.`
      };
    }
  }

  // 3. Validação de horário de abertura e fechamento
  const [hIni, mIni] = info.hora_inicio.split(':').map(Number);
  const [hFim, mFim] = info.hora_fim.split(':').map(Number);
  const [hTarget, mTarget] = horaFmt.split(':').map(Number);

  const minAbertura = hIni * 60 + (mIni || 0);
  const minFechamento = hFim * 60 + (mFim || 0);
  const minSelecionado = hTarget * 60 + (mTarget || 0);

  if (minSelecionado < minAbertura) {
    return {
      valido: false,
      erro: `O horário informado (${horaFmt}) é anterior ao início do atendimento (${info.hora_inicio}). O funcionamento em ${info.nomeDia} é das ${info.hora_inicio} às ${info.hora_fim}.`
    };
  }

  if (minSelecionado > minFechamento) {
    return {
      valido: false,
      erro: `O horário informado (${horaFmt}) ultrapassa o encerramento do atendimento (${info.hora_fim}). O funcionamento em ${info.nomeDia} é das ${info.hora_inicio} às ${info.hora_fim}.`
    };
  }

  // 4. Validação de pausa para almoço / intervalo
  if (info.pausa_inicio && info.pausa_fim) {
    const [ph1, pm1] = info.pausa_inicio.split(':').map(Number);
    const [ph2, pm2] = info.pausa_fim.split(':').map(Number);
    const minPausaIni = ph1 * 60 + (pm1 || 0);
    const minPausaFim = ph2 * 60 + (pm2 || 0);

    if (minSelecionado >= minPausaIni && minSelecionado < minPausaFim) {
      return {
        valido: false,
        erro: `O ponto de retirada estará em pausa para almoço/intervalo das ${info.pausa_inicio} às ${info.pausa_fim}. Por favor, informe um horário antes das ${info.pausa_inicio} ou a partir das ${info.pausa_fim}.`
      };
    }
  }

  return {
    valido: true,
    erro: null,
    info
  };
}

/**
 * Gera horários válidos recomendados (intervalos de 30 min) para uma data, respeitando o calendário e pausas
 */
export async function gerarHorariosValidosData(localId, dateStr) {
  const info = await obterHorarioFuncionamentoData(localId, dateStr);
  if (!info.disponivel) return [];

  const [hIni, mIni] = info.hora_inicio.split(':').map(Number);
  const [hFim, mFim] = info.hora_fim.split(':').map(Number);
  let curMin = hIni * 60 + (mIni || 0);
  const endMin = hFim * 60 + (mFim || 0);

  let pIniMin = -1;
  let pFimMin = -1;
  if (info.pausa_inicio && info.pausa_fim) {
    const [ph1, pm1] = info.pausa_inicio.split(':').map(Number);
    const [ph2, pm2] = info.pausa_fim.split(':').map(Number);
    pIniMin = ph1 * 60 + (pm1 || 0);
    pFimMin = ph2 * 60 + (pm2 || 0);
  }

  const agora = new Date();
  const hojeStr = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
  const ehHoje = (dateStr.slice(0, 10) === hojeStr);
  const minutosHoje = agora.getHours() * 60 + agora.getMinutes();

  const slots = [];
  while (curMin <= endMin) {
    if (pIniMin !== -1 && pFimMin !== -1 && curMin >= pIniMin && curMin < pFimMin) {
      curMin += 30;
      continue;
    }

    if (ehHoje && curMin <= minutosHoje) {
      curMin += 30;
      continue;
    }

    const h = String(Math.floor(curMin / 60)).padStart(2, '0');
    const m = String(curMin % 60).padStart(2, '0');
    slots.push(`${h}:${m}`);
    curMin += 30;
  }

  return slots;
}

/**
 * Retorna uma lista consolidada dos próximos dias disponíveis para agendamento (com slots pré-calculados)
 */
export async function listarProximasDatasDisponiveis(localId, maxDias = 35) {
  let targetLocalId = localId;
  if (!targetLocalId) {
    try {
      const { getLocalRetiradaPadrao } = await import('./coletas.js');
      const padrao = await getLocalRetiradaPadrao();
      if (padrao) targetLocalId = padrao.id;
    } catch (e) {}
  }

  const agora = new Date();
  const hojeAno = agora.getFullYear();
  const hojeMes = agora.getMonth();
  const hojeDia = agora.getDate();
  const hojeStr = `${hojeAno}-${String(hojeMes + 1).padStart(2, '0')}-${String(hojeDia).padStart(2, '0')}`;

  const nomesDias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const datasValidas = [];

  for (let i = 0; i < maxDias; i++) {
    const curDate = new Date(hojeAno, hojeMes, hojeDia + i);
    const y = curDate.getFullYear();
    const m = String(curDate.getMonth() + 1).padStart(2, '0');
    const d = String(curDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const diaSemanaIdx = curDate.getDay();
    const nomeDia = nomesDias[diaSemanaIdx];

    const info = await obterHorarioFuncionamentoData(targetLocalId, dateStr);
    if (!info.disponivel) continue;

    const slots = await gerarHorariosValidosData(targetLocalId, dateStr);
    if (slots.length === 0) continue;

    let prefixo = '';
    if (dateStr === hojeStr) prefixo = 'Hoje — ';
    else if (i === 1) prefixo = 'Amanhã — ';

    let textoIntervalo = (info.pausa_inicio && info.pausa_fim) ? ` (Almoço: ${info.pausa_inicio} às ${info.pausa_fim})` : '';
    const rotulo = `${prefixo}${nomeDia}, ${d}/${m}/${y} [${info.hora_inicio} às ${info.hora_fim}${textoIntervalo}]`;

    datasValidas.push({
      data: dateStr,
      rotulo,
      nomeDia,
      hora_inicio: info.hora_inicio,
      hora_fim: info.hora_fim,
      pausa_inicio: info.pausa_inicio,
      pausa_fim: info.pausa_fim,
      slots
    });
  }

  return datasValidas;
}
