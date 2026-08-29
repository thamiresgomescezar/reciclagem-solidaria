/**
 * Componente Reutilizável: Grid Visual de Calendário de Dias Úteis
 * Efetua alterações no banco de dados SOMENTE quando o usuário clica em SALVAR ALTERAÇÕES.
 */

export function renderCalendarGrid(containerId, { agendaData = [], isAdmin = false, onSaveAgenda, onSelectDay }) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth();

  const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const diasSemanaNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Mapeia agenda existente por data no formato YYYY-MM-DD
  const mapAgenda = {};
  if (Array.isArray(agendaData) && agendaData.length > 0) {
    agendaData.forEach(item => {
      if (item && item.data) {
        mapAgenda[item.data] = {
          disponivel: item.disponivel,
          hora_inicio: item.hora_inicio || '08:00',
          hora_fim: item.hora_fim || '17:00'
        };
      }
    });
    window._calendarPendingMap = { ...mapAgenda };
  }

  const primeiroDiaSemana = new Date(anoAtual, mesAtual, 1).getDay();
  const totalDiasMes = new Date(anoAtual, mesAtual + 1, 0).getDate();

  // Dicionário de alterações locais em memória
  const pendingMap = window._calendarPendingMap || { ...mapAgenda };
  window._calendarPendingMap = pendingMap;

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

  // Espaços vazios antes do dia 1 do mês
  for (let i = 0; i < primeiroDiaSemana; i++) {
    gridHtml += `<div style="height: 50px; background: #fafafa; border-radius: 8px;"></div>`;
  }

  // Renderiza dias do mês
  for (let dia = 1; dia <= totalDiasMes; dia++) {
    const monthStr = String(mesAtual + 1).padStart(2, '0');
    const dayStr = String(dia).padStart(2, '0');
    const dateFormatted = `${anoAtual}-${monthStr}-${dayStr}`;

    const dataObj = new Date(anoAtual, mesAtual, dia);
    const dayOfWeek = dataObj.getDay();

    let isDisponivel = false;
    let horaInicio = '08:00';
    let horaFim = '17:00';

    const entry = pendingMap[dateFormatted];
    if (entry !== undefined) {
      if (typeof entry === 'boolean') {
        isDisponivel = entry;
      } else {
        isDisponivel = Boolean(entry.disponivel);
        horaInicio = entry.hora_inicio || '08:00';
        horaFim = entry.hora_fim || '17:00';
      }
    } else {
      isDisponivel = dayOfWeek >= 1 && dayOfWeek <= 5; // Padrão Seg-Sex true
      pendingMap[dateFormatted] = { disponivel: isDisponivel, hora_inicio: horaInicio, hora_fim: horaFim };
    }

    const isPast = dataObj < new Date(hoje.setHours(0,0,0,0));

    let bgColor = isDisponivel ? '#e8f5e9' : '#fce8e6';
    let borderColor = isDisponivel ? '#33cc33' : '#f5c2c7';
    let textColor = isDisponivel ? '#1b7a1b' : '#c62828';
    let cursorStyle = (isAdmin || (onSelectDay && isDisponivel && !isPast)) ? 'cursor: pointer;' : 'cursor: not-allowed;';

    const labelHorario = isDisponivel ? `${horaInicio.slice(0,2)}h-${horaFim.slice(0,2)}h` : 'Fechado';

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
           title="${dateFormatted}: ${isDisponivel ? `${horaInicio} às ${horaFim}` : 'Fechado'}">
        <span style="line-height: 1;">${dia}</span>
        <span class="day-status-label" style="font-size: 9px; font-weight: 700; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; display: block; line-height: 1.1;">
          ${labelHorario}
        </span>
      </div>
    `;
  }

  gridHtml += `
      </div>

      <!-- Botão de Salvar Alterações da Agenda com Mensagem de Status DIRETAMENTE ABAIXO DELE -->
      ${isAdmin ? `
        <div style="margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <button type="button" id="btn_salvar_agenda" class="btn-avancar" style="max-width: 360px;">
            <i class="fa-solid fa-floppy-disk"></i> SALVAR ALTERAÇÕES DA AGENDA
          </button>
          
          <!-- Mensagem de Status Localizada ABAIXO do Botão de Salvar -->
          <div id="save-status-msg" class="status-message" style="display: none; width: 100%; max-width: 520px; text-align: center;"></div>
        </div>
      ` : ''}
    </div>
  `;

  container.innerHTML = gridHtml;

  // Modo Seleção de Data (Catador agendando coleta)
  if (onSelectDay) {
    container.querySelectorAll('.calendar-day-cell.disponivel').forEach(cell => {
      const dateStr = cell.getAttribute('data-date');
      const dataObj = new Date(dateStr + 'T00:00:00');
      const isPast = dataObj < new Date(hoje.setHours(0,0,0,0));

      if (!isPast) {
        cell.addEventListener('click', (e) => {
          container.querySelectorAll('.calendar-day-cell').forEach(c => {
            c.style.transform = 'none';
            c.style.boxShadow = 'none';
          });

          const targetCell = e.currentTarget;
          targetCell.style.transform = 'scale(1.06)';
          targetCell.style.boxShadow = '0 0 0 3px #1b6d24';

          onSelectDay(dateStr);
        });
      }
    });
  }

  // Ouvintes de clique para alternar dias APENAS QUANDO FOR ADMINISTRADOR
  if (isAdmin) {
    container.querySelectorAll('.calendar-day-cell').forEach(cell => {
      cell.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-date');
        const entry = pendingMap[dateStr];
        const currentDisp = (typeof entry === 'boolean') ? entry : (entry?.disponivel ?? true);
        const newDisp = !currentDisp;

        const inputInicio = document.getElementById('horario_inicio');
        const inputFim = document.getElementById('horario_fim');
        const horaIni = inputInicio?.value || '08:00';
        const horaF = inputFim?.value || '17:00';

        pendingMap[dateStr] = {
          disponivel: newDisp,
          hora_inicio: horaIni,
          hora_fim: horaF
        };

        const cellEl = document.getElementById(`cell_${dateStr}`);
        const labelEl = cellEl.querySelector('.day-status-label');

        if (newDisp) {
          cellEl.style.backgroundColor = '#e8f5e9';
          cellEl.style.borderColor = '#33cc33';
          cellEl.style.color = '#1b7a1b';
          labelEl.textContent = `${horaIni.slice(0,2)}h-${horaF.slice(0,2)}h`;
        } else {
          cellEl.style.backgroundColor = '#fce8e6';
          cellEl.style.borderColor = '#f5c2c7';
          cellEl.style.color = '#c62828';
          labelEl.textContent = 'Fechado';
        }

        // Oculta mensagem anterior ao alterar um dia
        const saveStatusMsg = document.getElementById('save-status-msg');
        if (saveStatusMsg) saveStatusMsg.style.display = 'none';
      });
    });

    // Botão de salvar alterações da agenda
    const btnSalvar = document.getElementById('btn_salvar_agenda');
    if (btnSalvar && onSaveAgenda) {
      btnSalvar.addEventListener('click', () => {
        onSaveAgenda(pendingMap);
      });
    }
  }
}
