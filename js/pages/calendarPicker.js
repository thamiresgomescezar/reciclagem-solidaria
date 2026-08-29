export function resetCalendarPendingMap(newMap = null) {
  window._calendarPendingMap = newMap;
}

export function renderCalendarGrid(containerId, { agendaData = [], isAdmin = false, onSaveAgenda, onSelectDay }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!window._calendarPendingMap) {
    const mapAgenda = {};
    if (Array.isArray(agendaData) && agendaData.length > 0) {
      agendaData.forEach(item => {
        if (item && item.data) {
          if (!mapAgenda[item.data]) {
            mapAgenda[item.data] = {
              disponivel: Boolean(item.disponivel),
              hora_inicio: item.hora_inicio || '08:00',
              hora_fim: item.hora_fim || '17:00',
              hora_inicio_2: '',
              hora_fim_2: ''
            };
          } else {
            // Se já há um registro para essa data, armazena no 2º turno/intervalo
            mapAgenda[item.data].hora_inicio_2 = item.hora_inicio || '';
            mapAgenda[item.data].hora_fim_2 = item.hora_fim || '';
          }
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
        <h4 style="color: var(--verde-escuro, #1b6d24); margin: 0; font-size: 1.15rem; font-weight: 800;">
          <i class="fa-solid fa-calendar-days"></i> ${nomesMeses[mesAtual]} ${anoAtual}
        </h4>
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
      isDisponivel = dayOfWeek >= 1 && dayOfWeek <= 5; // Padrão Seg-Sex true
      pendingMap[dateFormatted] = { disponivel: isDisponivel, hora_inicio: horaInicio, hora_fim: horaFim, hora_inicio_2: horaInicio2, hora_fim_2: horaFim2 };
    }

    const isPast = dataObj < new Date(hoje.setHours(0,0,0,0));

    let bgColor = isDisponivel ? '#e8f5e9' : '#fce8e6';
    let borderColor = isDisponivel ? '#33cc33' : '#f5c2c7';
    let textColor = isDisponivel ? '#1b7a1b' : '#c62828';
    let cursorStyle = (isAdmin || (onSelectDay && isDisponivel && !isPast)) ? 'cursor: pointer;' : 'cursor: not-allowed;';

    const labelHorario = formatarLabelHorario(isDisponivel, horaInicio, horaFim, horaInicio2, horaFim2);

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
           title="${isDisponivel ? `Atendimento: ${labelHorario}` : 'Fechado / Sem Atendimento'}">
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
        ">${labelHorario}</span>
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

  // Ouvintes de clique para alternar/configurar dias APENAS QUANDO FOR ADMINISTRADOR
  if (isAdmin) {
    container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-date');
        abrirModalConfigurarDia(dateStr, anoAtual, mesAtual, pendingMap, () => {
          renderCalendarGrid(containerId, { agendaData, isAdmin, onSaveAgenda, onSelectDay });
          const saveStatusMsg = document.getElementById('save-status-msg');
          if (saveStatusMsg) {
            saveStatusMsg.className = 'status-message info';
            saveStatusMsg.style.display = 'block';
            saveStatusMsg.innerHTML = '<i class="fa-solid fa-circle-info"></i> Alteração registrada na grade! Clique em <b>SALVAR ALTERAÇÕES DA AGENDA</b> abaixo para confirmar no banco.';
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
  if (!disponivel) return 'Fechado';
  if (!horaIni || !horaFim) return 'Aberto';

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
  if (horaIni2 && horaFim2) {
    const p2 = fmt(horaIni2, horaFim2);
    return `${p1} / ${p2}`;
  }
  return p1;
}

function abrirModalConfigurarDia(dateStr, ano, mes, pendingMap, onUpdate) {
  const [yyyy, mm, dd] = dateStr.split('-');
  const dataObj = new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const nomeDia = diasSemana[dataObj.getDay()];
  const diaDaSemanaIdx = dataObj.getDay();

  const entry = pendingMap[dateStr] || { disponivel: diaDaSemanaIdx >= 1 && diaDaSemanaIdx <= 5, hora_inicio: '08:00', hora_fim: '12:00', hora_inicio_2: '', hora_fim_2: '' };
  const isDisp = typeof entry === 'boolean' ? entry : Boolean(entry.disponivel);
  const hIni = (typeof entry === 'object' && entry.hora_inicio) ? entry.hora_inicio : '08:00';
  const hFim = (typeof entry === 'object' && entry.hora_fim) ? entry.hora_fim : '12:00';
  const hIni2 = (typeof entry === 'object' && entry.hora_inicio_2) ? entry.hora_inicio_2 : '';
  const hFim2 = (typeof entry === 'object' && entry.hora_fim_2) ? entry.hora_fim_2 : '';
  const temInt2 = Boolean(hIni2 && hFim2);

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
          <span style="font-size: 0.8rem; color: #666;">Configuração de atendimento & turnos</span>
        </div>
        <button id="btn-close-dia-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #666;">✕</button>
      </div>

      <div style="display: flex; align-items: center; gap: 10px; background: #f9fbf9; padding: 12px; border-radius: 12px; border: 1.5px solid #a5d6a7;">
        <input type="checkbox" id="modal_dia_disponivel" ${isDisp ? 'checked' : ''} style="width: 20px; height: 20px; accent-color: var(--verde-escuro, #1b6d24); cursor: pointer;">
        <label for="modal_dia_disponivel" style="font-weight: 700; color: var(--verde-escuro, #1b6d24); font-size: 0.95rem; cursor: pointer;">
          Atendimento Aberto / Disponível
        </label>
      </div>

      <div id="modal_horarios_container" style="display: ${isDisp ? 'flex' : 'none'}; flex-direction: column; gap: 12px;">
        <div>
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <i class="fa-regular fa-clock"></i> 1º Turno (Principal):
          </span>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Início:</label>
              <input type="time" id="modal_dia_inicio" value="${hIni}" class="input-underline" style="width: 100%;">
            </div>
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Término:</label>
              <input type="time" id="modal_dia_fim" value="${hFim}" class="input-underline" style="width: 100%;">
            </div>
          </div>
        </div>

        <div style="border-top: 1px dashed #c8e6c9; padding-top: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <input type="checkbox" id="modal_chk_intervalo_2" ${temInt2 ? 'checked' : ''} style="width: 17px; height: 17px; accent-color: var(--verde-escuro, #1b6d24); cursor: pointer;">
            <label for="modal_chk_intervalo_2" style="font-weight: 700; color: var(--verde-escuro, #1b6d24); font-size: 0.85rem; cursor: pointer;">
              <i class="fa-solid fa-plus-circle"></i> Adicionar 2º Turno / Intervalo (ex: 14h às 19h)
            </label>
          </div>
          <div id="modal_intervalo_2_box" style="display: ${temInt2 ? 'grid' : 'none'}; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Início 2º Turno:</label>
              <input type="time" id="modal_dia_inicio_2" value="${hIni2 || '14:00'}" class="input-underline" style="width: 100%;">
            </div>
            <div class="campo">
              <label style="font-size: 0.8rem; font-weight: 700; color: #555; display: block; margin-bottom: 3px;">Término 2º Turno:</label>
              <input type="time" id="modal_dia_fim_2" value="${hFim2 || '19:00'}" class="input-underline" style="width: 100%;">
            </div>
          </div>
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
  const inputIni = modal.querySelector('#modal_dia_inicio');
  const inputFim = modal.querySelector('#modal_dia_fim');
  const chkInt2 = modal.querySelector('#modal_chk_intervalo_2');
  const int2Box = modal.querySelector('#modal_intervalo_2_box');
  const inputIni2 = modal.querySelector('#modal_dia_inicio_2');
  const inputFim2 = modal.querySelector('#modal_dia_fim_2');

  chkDisp.addEventListener('change', () => {
    horContainer.style.display = chkDisp.checked ? 'flex' : 'none';
  });

  chkInt2.addEventListener('change', () => {
    int2Box.style.display = chkInt2.checked ? 'grid' : 'none';
  });

  const fechar = () => { modal.style.display = 'none'; };
  modal.querySelector('#btn-close-dia-modal').addEventListener('click', fechar);

  modal.querySelector('#btn_aplicar_dia').addEventListener('click', () => {
    const disp = chkDisp.checked;
    const tem2 = chkInt2.checked;
    pendingMap[dateStr] = {
      disponivel: disp,
      hora_inicio: inputIni.value || '08:00',
      hora_fim: inputFim.value || '12:00',
      hora_inicio_2: tem2 ? (inputIni2.value || '14:00') : '',
      hora_fim_2: tem2 ? (inputFim2.value || '19:00') : ''
    };
    fechar();
    onUpdate();
  });

  modal.querySelector('#btn_aplicar_todos_dias_semana').addEventListener('click', () => {
    const disp = chkDisp.checked;
    const tem2 = chkInt2.checked;
    const ini = inputIni.value || '08:00';
    const fim = inputFim.value || '12:00';
    const ini2 = tem2 ? (inputIni2.value || '14:00') : '';
    const fim2 = tem2 ? (inputFim2.value || '19:00') : '';

    const totalDias = new Date(ano, mes + 1, 0).getDate();
    for (let d = 1; d <= totalDias; d++) {
      const dt = new Date(ano, mes, d);
      if (dt.getDay() === diaDaSemanaIdx) {
        const mStr = String(mes + 1).padStart(2, '0');
        const dStr = String(d).padStart(2, '0');
        const formatted = `${ano}-${mStr}-${dStr}`;
        pendingMap[formatted] = {
          disponivel: disp,
          hora_inicio: ini,
          hora_fim: fim,
          hora_inicio_2: ini2,
          hora_fim_2: fim2
        };
      }
    }

    fechar();
    onUpdate();
  });
}
