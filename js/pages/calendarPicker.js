import { showAlertModal } from '../lib/modal.js';

export function resetCalendarPendingMap(newMap = null) {
  window._calendarPendingMap = newMap;
}

export function extrairPadraoSemanal(agendaData) {
  const padrao = {
    0: { disponivel: false, hora_inicio: '08:00', hora_fim: '12:00', hora_inicio_2: '', hora_fim_2: '' }, // Dom
    1: { disponivel: true, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' },  // Seg
    2: { disponivel: true, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' },  // Ter
    3: { disponivel: true, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' },  // Qua
    4: { disponivel: true, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' },  // Qui
    5: { disponivel: true, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' },  // Sex
    6: { disponivel: false, hora_inicio: '08:00', hora_fim: '12:00', hora_inicio_2: '', hora_fim_2: '' }  // Sáb
  };

  if (!Array.isArray(agendaData) || agendaData.length === 0) return padrao;

  // Agrupa slots por data
  const slotsPorData = {};
  agendaData.forEach(item => {
    if (item && item.data) {
      if (!slotsPorData[item.data]) slotsPorData[item.data] = [];
      slotsPorData[item.data].push({
        hora_inicio: item.hora_inicio,
        hora_fim: item.hora_fim,
        pausa_inicio: item.pausa_inicio || null,
        pausa_fim: item.pausa_fim || null,
        disponivel: Boolean(item.disponivel)
      });
    }
  });

  // Ordena por data decrescente para priorizar as configurações mais recentes (último mês configurado)
  const datasOrdenadas = Object.keys(slotsPorData).sort((a, b) => b.localeCompare(a));

  const diasEncontrados = new Set();
  datasOrdenadas.forEach(dtStr => {
    const [y, m, d] = dtStr.split('-').map(Number);
    const dayOfWeek = new Date(y, m - 1, d).getDay();
    if (!diasEncontrados.has(dayOfWeek)) {
      diasEncontrados.add(dayOfWeek);
      const slots = slotsPorData[dtStr];
      const isDisp = slots.some(s => s.disponivel);
      const consolidados = consolidarIntervalos(slots);

      padrao[dayOfWeek] = {
        disponivel: isDisp,
        hora_inicio: consolidados[0]?.hora_inicio || '08:00',
        hora_fim: consolidados[0]?.hora_fim || '17:00',
        hora_inicio_2: consolidados[1]?.hora_inicio || '',
        hora_fim_2: consolidados[1]?.hora_fim || '',
        pausa_inicio: slots[0]?.pausa_inicio || null,
        pausa_fim: slots[0]?.pausa_fim || null
      };
    }
  });

  return padrao;
}

export function renderCalendarGrid(containerId, { agendaData = [], isAdmin = false, onSaveAgenda, onSelectDay, ano = null, mes = null }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hoje = new Date();
  if (ano !== null && ano !== undefined) {
    window._currentCalendarYear = ano;
  } else if (!window._currentCalendarYear) {
    window._currentCalendarYear = hoje.getFullYear();
  }

  if (mes !== null && mes !== undefined) {
    window._currentCalendarMonth = mes;
  } else if (window._currentCalendarMonth === undefined || window._currentCalendarMonth === null) {
    window._currentCalendarMonth = hoje.getMonth();
  }

  const anoAtual = window._currentCalendarYear;
  const mesAtual = window._currentCalendarMonth;

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Extrai o padrão de dias úteis e horários do histórico recente/mês anterior
  const padraoSemanal = extrairPadraoSemanal(agendaData);

  if (!window._calendarPendingMap) {
    const mapAgenda = {};
    if (Array.isArray(agendaData) && agendaData.length > 0) {
      const slotsPorData = {};
      agendaData.forEach(item => {
        if (item && item.data) {
          if (!slotsPorData[item.data]) slotsPorData[item.data] = [];
          if (item.hora_inicio && item.hora_fim) {
            slotsPorData[item.data].push({
              hora_inicio: item.hora_inicio,
              hora_fim: item.hora_fim,
              pausa_inicio: item.pausa_inicio || null,
              pausa_fim: item.pausa_fim || null,
              disponivel: Boolean(item.disponivel)
            });
          }
        }
      });

      Object.keys(slotsPorData).forEach(dtStr => {
        const slots = slotsPorData[dtStr];
        const isDisp = slots.some(s => s.disponivel);
        const consolidados = consolidarIntervalos(slots);

        if (consolidados.length > 0) {
          mapAgenda[dtStr] = {
            disponivel: isDisp,
            hora_inicio: consolidados[0].hora_inicio,
            hora_fim: consolidados[0].hora_fim,
            hora_inicio_2: consolidados[1] ? consolidados[1].hora_inicio : '',
            hora_fim_2: consolidados[1] ? consolidados[1].hora_fim : ''
          };
        }
      });
    }
    window._calendarPendingMap = mapAgenda;
  }

  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDiasMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  const pendingMap = window._calendarPendingMap;

  let subtitleText = 'Consulte os dias e horários de atendimento';
  if (isAdmin) subtitleText = 'Clique nos dias para alterar ou use os botões acima para configurar e salvar';
  else if (onSelectDay) subtitleText = 'Selecione no calendário a data desejada para a coleta';

  let gridHtml = `
    <div style="background: white; border-radius: 16px; padding: 18px 14px; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 4px 12px rgba(0,0,0,0.04); width: 100%; box-sizing: border-box; overflow: hidden;">
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <button type="button" id="btn_cal_prev_month" class="btn-secondary-pill" style="padding: 5px 11px; font-size: 0.8rem; border-radius: 8px; cursor: pointer; background: #e8f5e9; border: 1px solid #c8e6c9; color: var(--verde-escuro, #1b6d24);" title="Mês Anterior">
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          <h4 style="color: var(--verde-escuro, #1b6d24); margin: 0; font-size: 1.15rem; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-calendar-days"></i> ${nomesMeses[mesAtual]} ${anoAtual}
          </h4>
          <button type="button" id="btn_cal_next_month" class="btn-secondary-pill" style="padding: 5px 11px; font-size: 0.8rem; border-radius: 8px; cursor: pointer; background: #e8f5e9; border: 1px solid #c8e6c9; color: var(--verde-escuro, #1b6d24);" title="Próximo Mês">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
        <span style="font-size: 0.78rem; color: var(--cinza-texto-aux); font-weight: 600;">
          ${subtitleText}
        </span>
      </div>

      <!-- Legenda -->
      <div style="display: flex; gap: 12px; margin-bottom: 12px; font-size: 0.8rem; font-weight: 700; flex-wrap: wrap;">
        <span style="display: flex; align-items: center; gap: 6px; color: #1b7a1b;">
          <span style="width: 12px; height: 12px; border-radius: 3px; background: #e8f5e9; border: 1.5px solid #33cc33; display: inline-block;"></span>
          Disponível
        </span>
        <span style="display: flex; align-items: center; gap: 6px; color: #c62828;">
          <span style="width: 12px; height: 12px; border-radius: 3px; background: #fce8e6; border: 1.5px solid #f5c2c7; display: inline-block;"></span>
          Indisponível (Fechado)
        </span>
      </div>

      <!-- Cabeçalho dos Dias da Semana -->
      <div class="calendar-header-grid" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px; text-align: center; font-weight: 800; font-size: 0.78rem; color: var(--verde-escuro, #1b6d24); margin-bottom: 6px;">
        ${diasSemanaNomes.map(d => `<div style="padding: 2px 0;">${d}</div>`).join('')}
      </div>

      <!-- Grid dos Dias do Mês -->
      <div class="calendar-days-grid" style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 3px;" id="calendar_days_grid">
  `;

  for (let i = 0; i < primeiroDiaSemana; i++) {
    gridHtml += `<div style="height: 50px; background: #fafafa; border-radius: 8px;"></div>`;
  }

  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const monthStr = String(mesAtual + 1).padStart(2, '0');
    const dayStr = String(dia).padStart(2, '0');
    const dateFormatted = `${anoAtual}-${monthStr}-${dayStr}`;

    const dataObj = new Date(anoAtual, mesAtual, dia);
    const dayOfWeek = dataObj.getDay();

    let isDisponivel = false;
    let horaInicio = '08:00';
    let horaFim = '17:00';
    let horaInicio2 = '';
    let horaFim2 = '';

    const entry = pendingMap[dateFormatted];
    if (entry !== undefined) {
      if (typeof entry === 'boolean') {
        isDisponivel = entry;
      } else {
        isDisponivel = Boolean(entry.disponivel);
        horaInicio = entry.hora_inicio || '08:00';
        horaFim = entry.hora_fim || '17:00';
        horaInicio2 = entry.hora_inicio_2 || '';
        horaFim2 = entry.hora_fim_2 || '';
      }
    } else {
      // Herda automaticamente o padrão configurado no mês anterior para este dia da semana
      const padraoDia = padraoSemanal[dayOfWeek] || { disponivel: false, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' };
      isDisponivel = padraoDia.disponivel;
      horaInicio = padraoDia.hora_inicio || '08:00';
      horaFim = padraoDia.hora_fim || '17:00';
      horaInicio2 = padraoDia.hora_inicio_2 || '';
      horaFim2 = padraoDia.hora_fim_2 || '';
      pendingMap[dateFormatted] = { 
        disponivel: isDisponivel, 
        hora_inicio: horaInicio, 
        hora_fim: horaFim, 
        hora_inicio_2: horaInicio2, 
        hora_fim_2: horaFim2 
      };
    }

    const isPast = dataObj < new Date(hoje.setHours(0,0,0,0));

    let bgColor = isDisponivel ? '#e8f5e9' : '#fce8e6';
    let borderColor = isDisponivel ? '#33cc33' : '#f5c2c7';
    let textColor = isDisponivel ? '#1b7a1b' : '#c62828';
    let cursorStyle = 'cursor: pointer;';

    const labelInfo = formatarLabelHorario(isDisponivel, horaInicio, horaFim, horaInicio2, horaFim2);

    gridHtml += `
      <div class="calendar-day-cell ${isDisponivel ? 'disponivel' : 'indisponivel'}" 
           data-date="${dateFormatted}" 
           id="cell_${dateFormatted}"
           style="
             height: 52px;
             border-radius: 8px;
             background-color: ${bgColor};
             border: 1.5px solid ${borderColor};
             color: ${textColor};
             display: flex;
             flex-direction: column;
             align-items: center;
             justify-content: center;
             font-weight: 800;
             font-size: 13px;
             padding: 2px 1px;
             min-width: 0;
             box-sizing: border-box;
             overflow: hidden;
             ${cursorStyle}
             transition: transform 0.15s, background-color 0.2s;
             position: relative;
             opacity: ${isPast ? '0.45' : '1'};
           "
           title="${isDisponivel ? `Atendimento: ${labelInfo.texto}` : 'Fechado / Sem Atendimento'}">
        <span style="line-height: 1; margin-bottom: 2px;">${dia}</span>
        <span class="day-status-label" style="
          font-size: 8.5px; 
          font-weight: 700; 
          text-align: center;
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          max-width: 100%;
          display: block;
          opacity: 0.95;
        ">${labelInfo.html}</span>
      </div>
    `;
  }

  gridHtml += `
      </div>
    </div>
  `;

  // Se for admin, adiciona botão de Salvar Alterações
  if (isAdmin && onSaveAgenda) {
    gridHtml += `
      <div style="margin-top: 18px; display: flex; flex-direction: column; gap: 10px;">
        <button type="button" id="btn_salvar_agenda" class="btn-avancar" style="width: 100%; font-size: 1rem; padding: 13px;">
          <i class="fa-solid fa-floppy-disk"></i> SALVAR ALTERAÇÕES DA AGENDA
        </button>
        <div id="save-status-msg" class="status-message" style="display: none;"></div>
      </div>
    `;
  }

  container.innerHTML = gridHtml;

  // Ouvintes de navegação entre meses
  const btnPrev = container.querySelector('#btn_cal_prev_month');
  const btnNext = container.querySelector('#btn_cal_next_month');

  if (btnPrev) {
    btnPrev.addEventListener('click', () => {
      let prevM = mesAtual - 1;
      let prevY = anoAtual;
      if (prevM < 0) {
        prevM = 11;
        prevY--;
      }
      renderCalendarGrid(containerId, { agendaData, isAdmin, onSaveAgenda, onSelectDay, ano: prevY, mes: prevM });
      const evt = new CustomEvent('calendar-month-changed', { detail: { ano: prevY, mes: prevM } });
      window.dispatchEvent(evt);
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      let nextM = mesAtual + 1;
      let nextY = anoAtual;
      if (nextM > 11) {
        nextM = 0;
        nextY++;
      }
      renderCalendarGrid(containerId, { agendaData, isAdmin, onSaveAgenda, onSelectDay, ano: nextY, mes: nextM });
      const evt = new CustomEvent('calendar-month-changed', { detail: { ano: nextY, mes: nextM } });
      window.dispatchEvent(evt);
    });
  }

  // Ouvintes de clique para selecionar data (Visão do Catador)
  if (onSelectDay) {
    container.querySelectorAll('.calendar-day-cell.disponivel').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const [y, m, d] = dateStr.split('-');
      const cellDate = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));

      if (cellDate >= new Date(hoje.setHours(0,0,0,0))) {
        cell.addEventListener('click', (e) => {
          container.querySelectorAll('.calendar-day-cell').forEach(c => {
            c.style.transform = 'none';
            c.style.boxShadow = 'none';
          });

          const targetCell = e.currentTarget;
          targetCell.style.transform = 'scale(1.06)';
          targetCell.style.boxShadow = '0 0 0 3px #1b6d24';

          const entryDia = pendingMap[dateStr] || {};
          onSelectDay(dateStr, entryDia);
        });
      }
    });
  }

  // Ouvintes de clique para consulta informativa detalhada (Visão do Catador / Cidadão)
  if (!isAdmin && !onSelectDay) {
    container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-date');
        const [y, m, d] = dateStr.split('-');
        const dataObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const nomeDia = diasSemana[dataObj.getDay()];
        const entry = pendingMap[dateStr] || {};
        const isDisp = typeof entry === 'boolean' ? entry : Boolean(entry.disponivel);

        let rawIni = (typeof entry === 'object' && entry.hora_inicio) ? entry.hora_inicio.slice(0, 5) : '08:00';
        let rawFim = (typeof entry === 'object' && entry.hora_fim) ? entry.hora_fim.slice(0, 5) : '17:00';
        let rawIni2 = (typeof entry === 'object' && entry.hora_inicio_2) ? entry.hora_inicio_2.slice(0, 5) : '';
        let rawFim2 = (typeof entry === 'object' && entry.hora_fim_2) ? entry.hora_fim_2.slice(0, 5) : '';

        const labelInfo = formatarLabelHorario(isDisp, rawIni, rawFim, rawIni2, rawFim2);

        let msg = '';
        if (isDisp) {
          msg = `<b>Data:</b> ${d}/${m}/${y} (${nomeDia})<br><br>` +
                `<b>Status:</b> <span style="color: #2e7d32; font-weight: 700;">Disponível para Atendimento</span><br>` +
                `<b>Horário de Atendimento:</b> ${labelInfo.texto}<br>` +
                `<b>Local / Unidade:</b> Fatec Franco da Rocha`;
        } else {
          msg = `<b>Data:</b> ${d}/${m}/${y} (${nomeDia})<br><br>` +
                `<b>Status:</b> <span style="color: #c62828; font-weight: 700;">Indisponível (Fechado)</span><br>` +
                `A unidade estará fechada para atendimento aos catadores e recebimento de coletas nesta data.`;
        }

        showAlertModal({
          title: '📅 Horário de Atendimento',
          message: msg,
          buttonText: 'Entendido',
          confirmColor: '#1b6d24'
        });
      });
    });
  }

  // Ouvintes de clique para alternar/configurar dias APENAS QUANDO FOR ADMINISTRADOR
  if (isAdmin) {
    container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-date');
        abrirModalConfigurarDia(dateStr, anoAtual, mesAtual, pendingMap, () => {
          renderCalendarGrid(containerId, { agendaData, isAdmin, onSaveAgenda, onSelectDay, ano: anoAtual, mes: mesAtual });
          const saveStatusMsg = document.getElementById('save-status-msg');
          if (saveStatusMsg) {
            saveStatusMsg.className = 'status-message info';
            saveStatusMsg.style.display = 'block';
            saveStatusMsg.innerHTML = '<i class="fa-solid fa-circle-info"></i> Alteração registrada na grade! Clique em <b>SALVAR ALTERAÇÕES DA AGENDA</b> abaixo para confirmar.';
          }
        });
      });
    });

    const btnSalvar = document.getElementById('btn_salvar_agenda');
    if (btnSalvar && onSaveAgenda) {
      btnSalvar.addEventListener('click', () => {
        onSaveAgenda(pendingMap);
      });
    }
  }
}

function formatarLabelHorario(disponivel, horaIni, horaFim, horaIni2 = '', horaFim2 = '') {
  if (!disponivel) return { html: 'Fechado', texto: 'Fechado' };
  if (!horaIni || !horaFim) return { html: 'Aberto', texto: 'Aberto' };

  const fmt = (ini, fim) => {
    if (!ini || !fim) return '';
    const h1 = parseInt(ini.split(':')[0], 10);
    const m1 = ini.split(':')[1] || '00';
    const h2 = parseInt(fim.split(':')[0], 10);
    const m2 = fim.split(':')[1] || '00';
    const t1 = (m1 === '00' || !m1) ? `${h1}h` : `${h1}:${m1}`;
    const t2 = (m2 === '00' || !m2) ? `${h2}h` : `${h2}:${m2}`;
    return `${t1}-${t2}`;
  };

  const p1 = fmt(horaIni, horaFim);
  if (horaIni2 && horaFim2 && (horaIni2 !== horaIni || horaFim2 !== horaFim)) {
    const p2 = fmt(horaIni2, horaFim2);
    if (p2 && p2 !== p1) {
      return {
        html: `<span class="t-p1">${p1}</span><span class="t-sep"> e </span><span class="t-p2">${p2}</span>`,
        texto: `${p1} e ${p2}`
      };
    }
  }
  return { html: p1, texto: p1 };
}

function abrirModalConfigurarDia(dateStr, ano, mes, pendingMap, onUpdate) {
  const [yyyy, mm, dd] = dateStr.split('-');
  const dataObj = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const nomeDia = diasSemana[dataObj.getDay()];
  const diaDaSemanaIdx = dataObj.getDay();

  const entry = pendingMap[dateStr] || { disponivel: diaDaSemanaIdx >= 1 && diaDaSemanaIdx <= 5, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' };
  const isDisp = typeof entry === 'boolean' ? entry : Boolean(entry.disponivel);

  let rawIni = (typeof entry === 'object' && entry.hora_inicio) ? entry.hora_inicio.slice(0, 5) : '08:00';
  let rawFim = (typeof entry === 'object' && entry.hora_fim) ? entry.hora_fim.slice(0, 5) : '17:00';
  let rawIni2 = (typeof entry === 'object' && entry.hora_inicio_2) ? entry.hora_inicio_2.slice(0, 5) : '';
  let rawFim2 = (typeof entry === 'object' && entry.hora_fim_2) ? entry.hora_fim_2.slice(0, 5) : '';

  // Determina abertura, fechamento e se há pausa ativa
  let horaAbertura = rawIni;
  let horaFechamento = (rawIni2 && rawFim2) ? rawFim2 : rawFim;
  let temPausa = Boolean(rawIni2 && rawFim2 && rawFim !== rawFim2);
  let pausaInicio = temPausa ? rawFim : '12:00';
  let pausaRetorno = temPausa ? rawIni2 : '14:00';

  if (!temPausa && rawIni2 && rawFim2 && rawIni2 === rawIni) {
    temPausa = false;
    horaFechamento = rawFim;
  }

  let modal = document.getElementById('modal-config-dia');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-config-dia';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px;';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 22px; max-width: 440px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.25); display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8f5e9; padding-bottom: 10px;">
        <div>
          <h3 style="color: var(--verde-escuro, #1b6d24); margin: 0; font-size: 1.15rem; font-weight: 800;">
            <i class="fa-solid fa-calendar-day"></i> ${dd}/${mm}/${yyyy} (${nomeDia})
          </h3>
          <span style="font-size: 0.8rem; color: #666;">Horários de atendimento e pausa</span>
        </div>
        <button id="btn-close-dia-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #666;">✕</button>
      </div>

      <!-- Toggle Aberto / Fechado -->
      <div style="display: flex; align-items: center; gap: 10px; background: #f9fbf9; padding: 12px; border-radius: 12px; border: 1.5px solid #a5d6a7;">
        <input type="checkbox" id="modal_dia_disponivel" ${isDisp ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--verde-escuro, #1b6d24); cursor: pointer;">
        <label for="modal_dia_disponivel" style="font-weight: 700; color: var(--verde-escuro, #1b6d24); font-size: 0.95rem; cursor: pointer;">
          Atendimento Aberto / Disponível
        </label>
      </div>

      <div id="modal_horarios_container" style="display: ${isDisp ? 'flex' : 'none'}; flex-direction: column; gap: 14px;">
        <!-- Horário de Funcionamento Geral -->
        <div>
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <i class="fa-regular fa-clock"></i> Horário de Funcionamento:
          </span>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Abertura:</label>
              <input type="time" id="modal_hora_abertura" value="${horaAbertura}" class="input-underline" style="width: 100%;">
            </div>
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Fechamento:</label>
              <input type="time" id="modal_hora_fechamento" value="${horaFechamento}" class="input-underline" style="width: 100%;">
            </div>
          </div>
        </div>

        <!-- Seção de Pausa / Almoço -->
        <div style="background: #fdfdfd; border: 1px solid #e0e0e0; border-radius: 12px; padding: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <input type="checkbox" id="modal_chk_pausa" ${temPausa ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: var(--verde-escuro, #1b6d24); cursor: pointer;">
            <label for="modal_chk_pausa" style="font-weight: 700; color: var(--verde-escuro, #1b6d24); font-size: 0.86rem; cursor: pointer;">
              <i class="fa-solid fa-utensils"></i> Incluir Pausa para Almoço / Intervalo
            </label>
          </div>

          <div id="modal_pausa_box" style="display: ${temPausa ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e0e0e0;">
            <div class="campo">
              <label style="font-size: 0.78rem; font-weight: 700; color: #555; display: block; margin-bottom: 2px;">Início da Pausa:</label>
              <input type="time" id="modal_pausa_inicio" value="${pausaInicio}" class="input-underline" style="width: 100%;">
            </div>
            <div class="campo">
              <label style="font-size: 0.78rem; font-weight: 700; color: #555; display: block; margin-bottom: 2px;">Retorno do Atendimento:</label>
              <input type="time" id="modal_pausa_fim" value="${pausaRetorno}" class="input-underline" style="width: 100%;">
            </div>
          </div>
        </div>

        <!-- Resumo Dinâmico do Horário -->
        <div id="modal_resumo_horario" style="font-size: 0.8rem; color: #2e7d32; background: #f1f8f1; padding: 8px 10px; border-radius: 8px; font-weight: 600;">
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
        <button type="button" id="btn_aplicar_dia" class="btn-avancar" style="width: 100%; padding: 10px;">
          <i class="fa-solid fa-check"></i> Aplicar a este Dia (${dd}/${mm})
        </button>
        <button type="button" id="btn_aplicar_todos_dias_semana" class="btn-secondary-pill" style="width: 100%; padding: 8px; font-size: 0.85rem; justify-content: center;">
          <i class="fa-solid fa-repeat"></i> Aplicar a todos os(as) ${nomeDia}s do Mês
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const chkDisp = modal.querySelector('#modal_dia_disponivel');
  const horContainer = modal.querySelector('#modal_horarios_container');
  const inputAbertura = modal.querySelector('#modal_hora_abertura');
  const inputFechamento = modal.querySelector('#modal_hora_fechamento');
  const chkPausa = modal.querySelector('#modal_chk_pausa');
  const pausaBox = modal.querySelector('#modal_pausa_box');
  const inputPausaIni = modal.querySelector('#modal_pausa_inicio');
  const inputPausaFim = modal.querySelector('#modal_pausa_fim');
  const resumoEl = modal.querySelector('#modal_resumo_horario');

  function atualizarResumoModal() {
    if (!chkDisp.checked) {
      if (resumoEl) resumoEl.textContent = '❌ Unidade fechada neste dia.';
      return;
    }
    const ab = inputAbertura.value || '08:00';
    const fe = inputFechamento.value || '17:00';
    if (chkPausa.checked) {
      const pIni = inputPausaIni.value || '12:00';
      const pFim = inputPausaFim.value || '14:00';
      if (resumoEl) {
        resumoEl.innerHTML = `<i class="fa-solid fa-clock"></i> <b>Atendimento:</b> ${ab} às ${pIni} e ${pFim} às ${fe} <br><span style="color: #666; font-size: 0.76rem;">(Fechado para almoço das ${pIni} às ${pFim})</span>`;
      }
    } else {
      if (resumoEl) {
        resumoEl.innerHTML = `<i class="fa-solid fa-clock"></i> <b>Atendimento Contínuo:</b> ${ab} às ${fe} (Sem pausa)`;
      }
    }
  }

  chkDisp.addEventListener('change', () => {
    horContainer.style.display = chkDisp.checked ? 'flex' : 'none';
    atualizarResumoModal();
  });

  chkPausa.addEventListener('change', () => {
    pausaBox.style.display = chkPausa.checked ? 'grid' : 'none';
    atualizarResumoModal();
  });

  inputAbertura.addEventListener('input', atualizarResumoModal);
  inputFechamento.addEventListener('input', atualizarResumoModal);
  inputPausaIni.addEventListener('input', atualizarResumoModal);
  inputPausaFim.addEventListener('input', atualizarResumoModal);

  atualizarResumoModal();

  const fechar = () => { modal.style.display = 'none'; };
  modal.querySelector('#btn-close-dia-modal').addEventListener('click', fechar);

  function calcularPeriodosFinais() {
    const disp = chkDisp.checked;
    if (!disp) {
      return { disponivel: false, hora_inicio: '08:00', hora_fim: '17:00', hora_inicio_2: '', hora_fim_2: '' };
    }

    const ab = inputAbertura.value ? inputAbertura.value.slice(0, 5) : '08:00';
    const fe = inputFechamento.value ? inputFechamento.value.slice(0, 5) : '17:00';
    const temP = chkPausa.checked;
    const pIni = inputPausaIni.value ? inputPausaIni.value.slice(0, 5) : '12:00';
    const pFim = inputPausaFim.value ? inputPausaFim.value.slice(0, 5) : '14:00';

    if (temP && pIni > ab && pFim < fe && pFim > pIni) {
      return {
        disponivel: true,
        hora_inicio: ab,
        hora_fim: fe,
        pausa_inicio: pIni,
        pausa_fim: pFim,
        hora_inicio_2: pFim,
        hora_fim_2: fe
      };
    }

    return {
      disponivel: true,
      hora_inicio: ab,
      hora_fim: fe,
      pausa_inicio: null,
      pausa_fim: null,
      hora_inicio_2: '',
      hora_fim_2: ''
    };
  }

  modal.querySelector('#btn_aplicar_dia').addEventListener('click', () => {
    pendingMap[dateStr] = calcularPeriodosFinais();
    fechar();
    onUpdate();
  });

  modal.querySelector('#btn_aplicar_todos_dias_semana').addEventListener('click', () => {
    const configCalculada = calcularPeriodosFinais();
    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let d = 1; d <= totalDias; d++) {
      const dt = new Date(ano, mes, d);
      if (dt.getDay() === diaDaSemanaIdx) {
        const mStr = String(mes + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const formatted = `${ano}-${mStr}-${dStr}`;
        pendingMap[formatted] = { ...configCalculada };
      }
    }

    fechar();
    onUpdate();
  });
}

export function consolidarIntervalos(listaIntervalos) {
  if (!listaIntervalos || listaIntervalos.length === 0) return [];

  const intervalosExplicitos = [];
  listaIntervalos.forEach(i => {
    if (!i || !i.hora_inicio || !i.hora_fim) return;
    if (i.pausa_inicio && i.pausa_fim && i.pausa_fim > i.pausa_inicio) {
      intervalosExplicitos.push({ hora_inicio: i.hora_inicio, hora_fim: i.pausa_inicio });
      intervalosExplicitos.push({ hora_inicio: i.pausa_fim, hora_fim: i.hora_fim });
    } else {
      intervalosExplicitos.push({ hora_inicio: i.hora_inicio, hora_fim: i.hora_fim });
    }
  });

  const parsed = intervalosExplicitos
    .map(i => {
      const [h1, m1] = i.hora_inicio.slice(0, 5).split(':').map(Number);
      const [h2, m2] = i.hora_fim.slice(0, 5).split(':').map(Number);
      return { start: h1 * 60 + (m1 || 0), end: h2 * 60 + (m2 || 0) };
    })
    .filter(i => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  if (parsed.length === 0) return [];

  const merged = [parsed[0]];
  for (let i = 1; i < parsed.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = parsed[i];

    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  return merged.map(m => {
    const hIni = String(Math.floor(m.start / 60)).padStart(2, '0');
    const mIni = String(m.start % 60).padStart(2, '0');
    const hFim = String(Math.floor(m.end / 60)).padStart(2, '0');
    const mFim = String(m.end % 60).padStart(2, '0');
    return {
      hora_inicio: `${hIni}:${mIni}`,
      hora_fim: `${hFim}:${mFim}`
    };
  });
}
