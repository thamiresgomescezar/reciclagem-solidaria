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

// Salva o mapa completo de agenda no banco de dados de uma só vez (1 registro por data com upsert em lotes atômicos)
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
      hFim = entry.hora_fim_2 || entry.hora_fim || hora_fim;
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
  const BATCH_SIZE = 80;
  const todosResultados = [];

  for (let i = 0; i < registros.length; i += BATCH_SIZE) {
    const chunk = registros.slice(i, i + BATCH_SIZE);
    let { data, error } = await supabase
      .from('agenda')
      .upsert(chunk, { onConflict: 'local_retirada_id,data' })
      .select();

    if (error) {
      // Fallback caso a tabela no Supabase ainda não tenha as colunas pausa_inicio/pausa_fim
      if (error.code === '42703' || error.message?.includes('pausa_inicio') || error.message?.includes('pausa_fim')) {
        const fallbackRegistros = chunk.map(r => ({
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
        if (fbData) todosResultados.push(...fbData);
      } else {
        throw error;
      }
    } else if (data) {
      todosResultados.push(...data);
    }
  }

  return todosResultados;
}

/**
 * Cálculo 100% matemático e offline de feriados nacionais brasileiros (fixos e móveis).
 * Não depende de nenhuma API, rede ou integração externa.
 */
export function calcularFeriadosNacionaisOffline(ano) {
  const pad = (n) => String(n).padStart(2, '0');
  const fixos = [
    { date: `${ano}-01-01`, name: 'Confraternização Universal' },
    { date: `${ano}-04-21`, name: 'Tiradentes' },
    { date: `${ano}-05-01`, name: 'Dia do Trabalho' },
    { date: `${ano}-09-07`, name: 'Independência do Brasil' },
    { date: `${ano}-10-12`, name: 'Nossa Senhora Aparecida' },
    { date: `${ano}-11-02`, name: 'Finados' },
    { date: `${ano}-11-15`, name: 'Proclamação da República' },
    { date: `${ano}-11-20`, name: 'Dia Nacional de Zumbi e da Consciência Negra' },
    { date: `${ano}-12-25`, name: 'Natal' }
  ];

  // Algoritmo Meeus/Jones/Butcher para Páscoa
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mesPascoa = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const diaPascoa = ((h + l - 7 * m + 114) % 31) + 1;
  const pascoa = new Date(ano, mesPascoa, diaPascoa);

  const addDias = (dias) => {
    const dt = new Date(pascoa);
    dt.setDate(dt.getDate() + dias);
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
  };

  const moveis = [
    { date: addDias(-47), name: 'Carnaval' },
    { date: addDias(-2), name: 'Sexta-feira Santa (Paixão de Cristo)' },
    { date: addDias(0), name: 'Páscoa' },
    { date: addDias(60), name: 'Corpus Christi' }
  ];

  const todos = [...fixos, ...moveis];
  todos.sort((x, y) => x.date.localeCompare(y.date));
  return todos;
}

/**
 * Gera a agenda padrão do ano completo (todos os 12 meses)
 * aplicando os dias da semana e horários definidos pelo administrador.
 * 100% autônomo no software, sem necessidade de nenhuma API externa.
 */
export async function gerarAgendaAnual({
  local_retirada_id,
  ano,
  diasSemana = [1, 2, 3, 4, 5],
  hora_inicio = '08:00',
  hora_fim = '17:00',
  pausa_inicio = null,
  pausa_fim = null,
  fecharFeriados = false
}) {
  const anoNum = parseInt(ano, 10) || new Date().getFullYear();
  let feriadosList = [];
  if (fecharFeriados) {
    feriadosList = calcularFeriadosNacionaisOffline(anoNum);
  }
  const feriadosMap = new Map();
  feriadosList.forEach(f => feriadosMap.set(f.date, f.name));

  const pad = (n) => String(n).padStart(2, '0');
  const mapaDatas = {};

  const isBissexto = (anoNum % 4 === 0 && anoNum % 100 !== 0) || (anoNum % 400 === 0);
  const diasPorMes = [31, isBissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let totalDisponiveis = 0;
  let totalFeriadosFechados = 0;

  for (let m = 0; m < 12; m++) {
    const totalDiasMes = diasPorMes[m];
    for (let d = 1; d <= totalDiasMes; d++) {
      const dataStr = `${anoNum}-${pad(m + 1)}-${pad(d)}`;
      const dtObj = new Date(anoNum, m, d);
      const dayOfWeek = dtObj.getDay();

      const ehFeriado = feriadosMap.has(dataStr);
      const diaPermitido = diasSemana.includes(dayOfWeek);

      if (ehFeriado && fecharFeriados) {
        totalFeriadosFechados++;
        mapaDatas[dataStr] = {
          disponivel: false,
          hora_inicio,
          hora_fim,
          pausa_inicio: null,
          pausa_fim: null
        };
      } else if (diaPermitido) {
        totalDisponiveis++;
        mapaDatas[dataStr] = {
          disponivel: true,
          hora_inicio,
          hora_fim,
          pausa_inicio: (pausa_inicio && pausa_fim && pausa_fim > pausa_inicio) ? pausa_inicio : null,
          pausa_fim: (pausa_inicio && pausa_fim && pausa_fim > pausa_inicio) ? pausa_fim : null
        };
      } else {
        mapaDatas[dataStr] = {
          disponivel: false,
          hora_inicio,
          hora_fim,
          pausa_inicio: null,
          pausa_fim: null
        };
      }
    }
  }

  await salvarAgendaEmLote({
    local_retirada_id,
    mapaDatas,
    hora_inicio,
    hora_fim
  });

  return {
    ano: anoNum,
    totalDias: Object.keys(mapaDatas).length,
    totalDisponiveis,
    totalFeriadosFechados,
    feriados: feriadosList
  };
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

  let { data, error } = await query
    .order('data', { ascending: true })
    .order('hora_inicio', { ascending: true });

  if (error) throw error;

  // Se filtrou por localId mas não encontrou registros, tenta sem filtro de localId
  // pois há apenas 1 polo de atendimento físico (Fatec Franco da Rocha)
  if (localId && (!data || data.length === 0)) {
    const { data: allData, error: allErr } = await supabase
      .from('agenda')
      .select('*')
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true });
    if (!allErr && allData && allData.length > 0) {
      return allData;
    }
  }

  return data || [];
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

  let { data, error } = await query.order('data', { ascending: true });
  if (error) throw error;

  if (localId && (!data || data.length === 0)) {
    const { data: allData, error: allErr } = await supabase
      .from('agenda')
      .select('*')
      .eq('disponivel', true)
      .gte('data', hojeStr)
      .order('data', { ascending: true });
    if (!allErr && allData && allData.length > 0) {
      return allData;
    }
  }

  return data || [];
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
 * 3. Configuração persistida da agenda em localStorage (definida pelo administrador)
 * 4. Padrão geral do sistema (Segunda a Sexta das 08:00 às 17:00; Sábados e Domingos fechados)
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
      if (!error && data && data.length > 0) agendaData = data;
    }

    if (agendaData.length === 0) {
      const { data: allData, error: allErr } = await supabase
        .from('agenda')
        .select('*');
      if (!allErr && allData && allData.length > 0) agendaData = allData;
    }
  } catch (e) {
    console.warn('Erro ao consultar agenda no Supabase:', e);
  }

  // 1. Procura se há configuração específica cadastrada para este dia
  const diaEspecifico = agendaData.find(a => String(a.data || '').slice(0, 10) === dataFmt);
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
    const dStr = String(a.data).slice(0, 10);
    const [ay, am, ad] = dStr.split('-').map(Number);
    return new Date(ay, am - 1, ad).getDay() === diaSemanaIdx;
  });

  if (diasDaMesmaSemana.length > 0) {
    diasDaMesmaSemana.sort((a, b) => String(b.data).localeCompare(String(a.data)));
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

  // 3. Fallback sincronizado com a configuração salva pelo Administrador no navegador
  try {
    const rawStorage = localStorage.getItem('reciclagem_ultimo_horario_agenda');
    if (rawStorage) {
      const cfg = JSON.parse(rawStorage);
      if (cfg && (cfg.abertura || cfg.fechamento)) {
        const diasPermitidos = Array.isArray(cfg.diasSemana) ? cfg.diasSemana : [1, 2, 3, 4, 5];
        const isDisp = diasPermitidos.includes(diaSemanaIdx);
        const temP = Boolean(cfg.temPausa && cfg.pausaIni && cfg.pausaFim);
        return {
          disponivel: isDisp,
          nomeDia,
          data: dataFmt,
          hora_inicio: (cfg.abertura || '08:00').slice(0, 5),
          hora_fim: (cfg.fechamento || '17:00').slice(0, 5),
          pausa_inicio: temP ? cfg.pausaIni.slice(0, 5) : null,
          pausa_fim: temP ? cfg.pausaFim.slice(0, 5) : null,
          origem: 'local_storage'
        };
      }
    }
  } catch (e) {}

  // 4. Padrão Geral do Sistema:
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

  // 4. Validação de pausa para intervalo
  if (info.pausa_inicio && info.pausa_fim) {
    const [ph1, pm1] = info.pausa_inicio.split(':').map(Number);
    const [ph2, pm2] = info.pausa_fim.split(':').map(Number);
    const minPausaIni = ph1 * 60 + (pm1 || 0);
    const minPausaFim = ph2 * 60 + (pm2 || 0);

    if (minSelecionado >= minPausaIni && minSelecionado < minPausaFim) {
      return {
        valido: false,
        erro: `O ponto de retirada estará em intervalo das ${info.pausa_inicio} às ${info.pausa_fim}. Por favor, informe um horário antes das ${info.pausa_inicio} ou a partir das ${info.pausa_fim}.`
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
