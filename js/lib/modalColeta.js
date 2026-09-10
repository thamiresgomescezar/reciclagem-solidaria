import { showConfirmModal, showAlertModal } from './modal.js';
import { atualizarColetaCompleta, confirmarRetirada, vincularCatadorColeta, resolverStatusColeta } from '../services/coletas.js';
import { formatarQuantidadePadrao, decomporQuantidade } from './validation.js';
import { obterHorarioFuncionamentoData, validarHorarioAgendamento, gerarHorariosValidosData, listarAgendaPorLocal } from '../services/agenda.js';
import { renderCalendarGrid, resetCalendarPendingMap } from '../pages/calendarPicker.js';
import { obterRegrasStatus } from '../services/status.js';

/**
 * Modal Unificado de Edição de Coleta e Ações de Retirada
 * Utilizado pelo Cidadão (minhas coletas) e pelo Administrador (gestão geral)
 */

/**
 * Garante que ao clicar em qualquer parte do campo de data ou horário (ou no label correspondente),
 * o seletor gráfico nativo (calendário / relógio) abra imediatamente, mesmo sem precisar acertar o ícone nativo.
 */
function habilitarPickerAoClicar(input, label) {
  if (!input) return;
  input.style.cursor = 'pointer';

  const disparar = () => {
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      }
    } catch (err) {
      console.warn('showPicker não suportado neste navegador:', err);
    }
  };

  input.addEventListener('click', disparar);
  if (label) {
    label.style.cursor = 'pointer';
    label.addEventListener('click', () => {
      input.focus();
      disparar();
    });
  }
}

export function abrirModalEdicaoColeta({ coleta, catadores = [], listaStatus = [], locaisRetirada = [], onSalvar, ehAdmin = false }) {
  let modal = document.getElementById('modal-editar-coleta');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-editar-coleta';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 10000; padding: 16px;';
    document.body.appendChild(modal);
  }

  const tipoMaterial = coleta.materiais?.tipo || 'Material Reciclável';
  const statusInfo = resolverStatusColeta(coleta);
  const ehRetirada = statusInfo.ehRetirada;
  const ehCancelada = statusInfo.ehCancelada;
  const ehAgendada = statusInfo.ehAgendada;
  const ehFinalizada = statusInfo.bloquearDados || ehRetirada || ehCancelada;

  const stNomeAtual = statusInfo.nome;
  const catadorAtualId = coleta.catador_id || '';

  // Monta opções de Status dinamicamente com base nas regras cadastradas
  let statusOptionsHtml = '';
  if (ehFinalizada) {
    statusOptionsHtml = `<option value="${coleta.cod_status || (ehRetirada ? 3 : 4)}" selected>${statusInfo.rotulo || (ehRetirada ? 'Retirada' : 'Cancelada')}</option>`;
  } else if (listaStatus && listaStatus.length > 0) {
    listaStatus.forEach(st => {
      const cod = st.cod_status;
      const isSelected = (coleta.cod_status === cod || (!coleta.cod_status && cod === 1)) ? 'selected' : '';
      const nomeFmt = st.status.charAt(0).toUpperCase() + st.status.slice(1);
      const r = st.regras || obterRegrasStatus(cod, st.status);
      let extra = '';
      if (r.regra_catador === 'requer_catador') extra = ' (Requer Catador / Agenda)';
      else if (r.regra_catador === 'sem_catador') extra = ' (Liberar para outros)';
      else if (r.bloquear_dados) extra = ' (Finalizar / Bloquear)';
      statusOptionsHtml += `<option value="${cod}" ${isSelected}>${nomeFmt}${extra}</option>`;
    });
  } else {
    // Fallback padrão se listaStatus não tiver sido repassada
    statusOptionsHtml = `
      <option value="1" ${coleta.cod_status === 1 ? 'selected' : ''}>Disponível (Liberar para outros)</option>
      <option value="2" ${coleta.cod_status === 2 ? 'selected' : ''}>Agendada (Definir Catador e Data)</option>
      <option value="3" ${coleta.cod_status === 3 ? 'selected' : ''}>Retirada (Concluída)</option>
      <option value="4" ${coleta.cod_status === 4 || coleta.cod_status === 5 ? 'selected' : ''}>Cancelada</option>
      <option value="6" ${coleta.cod_status === 6 ? 'selected' : ''}>Reagendada (Definir Catador e Data)</option>
    `;
  }

  // Monta opções de Catadores
  let catadoresOptionsHtml = `<option value="">-- Sem Catador (Disponível) --</option>`;
  catadores.forEach(cat => {
    const isSelected = catadorAtualId === cat.id ? 'selected' : '';
    catadoresOptionsHtml += `<option value="${cat.id}" ${isSelected}>${cat.nome}</option>`;
  });

  // Monta opções de Locais de Retirada
  let locaisOptionsHtml = '';
  locaisRetirada.forEach(loc => {
    const isSelected = coleta.local_retirada_id === loc.id ? 'selected' : '';
    const desc = loc.bairro ? `${loc.nome} (${loc.bairro})` : loc.nome;
    locaisOptionsHtml += `<option value="${loc.id}" ${isSelected}>${desc}</option>`;
  });

  // Data mínima: hoje (impede agendar em datas passadas)
  const agora = new Date();
  const hojeMin = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  const dataCriacaoObj = coleta.criado_em ? new Date(coleta.criado_em) : null;
  const dataCriacaoFormatada = (dataCriacaoObj && !isNaN(dataCriacaoObj.getTime()))
    ? dataCriacaoObj.toLocaleDateString('pt-BR')
    : '';

  let dataValor = statusInfo.ehDisponivel ? '' : (coleta.data ? coleta.data.slice(0, 10) : '');
  let horaValor = statusInfo.ehDisponivel ? '' : (coleta.hora ? coleta.hora.slice(0, 5) : '');

  // Se a coleta já foi retirada e não possui data ou hora cadastrada expressamente,
  // utiliza o momento em que a retirada foi registrada (atualizado_em / criado_em),
  // garantindo que os detalhes históricos nunca fiquem vazios (--/--/---- e --:--)
  if (statusInfo.ehRetirada && (!dataValor || !horaValor)) {
    const dtRef = coleta.atualizado_em ? new Date(coleta.atualizado_em) : (coleta.criado_em ? new Date(coleta.criado_em) : null);
    if (dtRef && !isNaN(dtRef.getTime())) {
      const y = dtRef.getFullYear();
      const m = String(dtRef.getMonth() + 1).padStart(2, '0');
      const d = String(dtRef.getDate()).padStart(2, '0');
      if (!dataValor) dataValor = `${y}-${m}-${d}`;
      if (!horaValor) horaValor = `${String(dtRef.getHours()).padStart(2, '0')}:${String(dtRef.getMinutes()).padStart(2, '0')}`;
    }
  }

  // Se a coleta foi cancelada, busca a data e horário em que o cancelamento foi registrado (atualizado_em / criado_em)
  // garantindo a padronização e exibição do momento exato do cancelamento
  if (ehCancelada) {
    const dtRef = coleta.atualizado_em ? new Date(coleta.atualizado_em) : (coleta.criado_em ? new Date(coleta.criado_em) : null);
    if (dtRef && !isNaN(dtRef.getTime())) {
      const y = dtRef.getFullYear();
      const m = String(dtRef.getMonth() + 1).padStart(2, '0');
      const d = String(dtRef.getDate()).padStart(2, '0');
      dataValor = `${y}-${m}-${d}`;
      horaValor = `${String(dtRef.getHours()).padStart(2, '0')}:${String(dtRef.getMinutes()).padStart(2, '0')}`;
    }
  }

  const qtdDecomposta = decomporQuantidade(coleta.quantidade);

  let dataFormatadaExibir = '--/--/----';
  if (dataValor) {
    const pD = dataValor.split('-');
    if (pD.length === 3) {
      dataFormatadaExibir = `${pD[2]}/${pD[1]}/${pD[0]}`;
    } else {
      dataFormatadaExibir = dataValor;
    }
  }

  modal.innerHTML = `
    <div style="background: #ffffff; width: 100%; max-width: 560px; max-height: 90vh; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,0.25); display: flex; flex-direction: column; overflow: hidden; border: 1.5px solid #a5d6a7; animation: modalFadeIn 0.2s ease-out;">
      
      <!-- Cabeçalho do Modal -->
      <div style="background: linear-gradient(135deg, var(--verde-escuro, #1b6d24), #2e7d32); color: white; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          ${ehFinalizada 
            ? '<i class="fa-solid fa-file-lines"></i> Detalhes da Coleta' 
            : '<i class="fa-solid fa-pen-to-square"></i> Editar Informações da Coleta'}
        </h3>
        <button type="button" id="btn-fechar-modal-coleta" style="background: none; border: none; color: white; font-size: 1.3rem; cursor: pointer; padding: 4px 8px; line-height: 1;" title="Fechar">✕</button>
      </div>

      <!-- Resumo Informativo do Material -->
      <div style="background: #f4fbf5; padding: 10px 20px; border-bottom: 1px solid #e0f2e9; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 8px;">
          <strong style="color: var(--verde-escuro, #1b6d24); font-size: 0.95rem;">${tipoMaterial}</strong>
          ${coleta.quantidade ? `<span style="font-size: 0.85rem; color: #444; font-weight: 600;">— ${coleta.quantidade}</span>` : ''}
          ${dataCriacaoFormatada ? `
            <span style="font-size: 0.76rem; color: #2e7d32; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
              <i class="fa-regular fa-calendar" style="color: #2e7d32;"></i> Criada em ${dataCriacaoFormatada}
            </span>
          ` : ''}
        </div>
        ${coleta.cidadao?.nome ? `<span style="font-size: 0.78rem; color: #555;"><i class="fa-solid fa-user"></i> ${coleta.cidadao.nome}</span>` : ''}
      </div>

      <!-- Formulário com Rolagem Vertical -->
      <form id="form-editar-coleta" style="padding: 16px 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 14px; margin: 0;">
        <div id="modal-coleta-msg" class="status-message" style="margin: 0; display: none;"></div>

        <!-- Aviso Geral Discreto para Coletas Finalizadas (Retirada / Cancelada) -->
        ${ehFinalizada ? `
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 9px 13px; color: #475569; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-lock" style="color: #64748b; font-size: 0.95rem; flex-shrink: 0;"></i>
            <span>${ehRetirada 
              ? 'Coleta concluída e retirada. As informações são históricas e não podem ser alteradas.' 
              : 'Coleta cancelada. As informações são definitivas e não podem ser alteradas.'}</span>
          </div>
        ` : ''}

        <!-- 1. Status da Coleta -->
        <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
          <label for="input_modal_status" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-list-check"></i> Status da Coleta:${ehFinalizada ? '' : '<span style="color:#c62828;">*</span>'}
          </label>
          <select id="input_modal_status" class="input-pill" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 12px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : ''}" ${ehFinalizada ? 'disabled' : 'required'}>
            ${statusOptionsHtml}
          </select>
          <div id="box-dica-agendar" style="display: none;"></div>
          ${!ehFinalizada ? `
            <span id="txt_ajuda_status_geral" style="font-size: 0.75rem; color: #666;">Defina a situação atual do material no fluxo de reciclagem.</span>
          ` : ''}
        </div>

        <!-- 2. Catador Atribuído -->
        <div id="container-modal-catador" class="campo" style="display: ${ehCancelada ? 'none' : 'flex'}; flex-direction: column; gap: 4px;">
          <label for="input_modal_catador" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-user-check"></i> ${ehRetirada ? 'Catador Responsável pela Retirada:' : 'Catador Atribuído:'}
          </label>
          <select id="input_modal_catador" class="input-pill" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 12px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : ''}" ${ehFinalizada ? 'disabled' : ''}>
            ${catadoresOptionsHtml}
          </select>
          ${!ehFinalizada ? `
            <span style="font-size: 0.75rem; color: #666;">Obrigatório quando a retirada for vinculada a um catador parceiro.</span>
          ` : ''}
        </div>

        <!-- 3. Data e Horário -->
        <div id="container-modal-data-hora" style="display: ${statusInfo.ehDisponivel ? 'none' : 'block'};">
          ${ehFinalizada ? `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
                <label id="lbl_modal_data" for="input_modal_data" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
                  ${ehCancelada 
                    ? '<i class="fa-solid fa-calendar-xmark"></i> Data do Cancelamento:' 
                    : '<i class="fa-solid fa-calendar-check"></i> Data da Retirada:'}
                </label>
                <input type="text" id="input_modal_data" value="${dataFormatadaExibir}" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-family: inherit; background: #f1f5f9; color: #475569; cursor: not-allowed;" disabled>
              </div>

              <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
                <label id="lbl_modal_hora" for="input_modal_hora" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
                  ${ehCancelada 
                    ? '<i class="fa-regular fa-clock"></i> Horário do Cancelamento:' 
                    : '<i class="fa-regular fa-clock"></i> Horário da Retirada:'}
                </label>
                <input type="text" id="input_modal_hora" value="${horaValor ? horaValor.replace(/\s*hs?$/i, '') + ' hs' : '--:--'}" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-family: inherit; background: #f1f5f9; color: #475569; cursor: not-allowed;" disabled>
              </div>
            </div>
          ` : `
            <!-- Calendário Visual Padronizado Direto -->
            <input type="hidden" id="input_modal_data" value="${dataValor}">

            <div style="display: flex; flex-direction: column; gap: 6px;">
              <label style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
                <i class="fa-regular fa-calendar-days"></i> Dia da Retirada (clique na data desejada):<span style="color:#c62828;">*</span>
              </label>
              <div id="box-calendario-container-edicao" style="width: 100%; border: 1.5px solid #c8e6c9; border-radius: 12px; padding: 4px; background: #ffffff; box-sizing: border-box;">
                <div id="cal-picker-modal-edicao" style="width: 100%;">
                  <div style="text-align: center; padding: 24px 12px; color: #666; font-size: 0.85rem;">
                    <i class="fa-solid fa-circle-notch fa-spin"></i> Carregando calendário de atendimento...
                  </div>
                </div>
              </div>
            </div>

            <!-- Dia Selecionado e Horário de Retirada (exibido ao escolher data) -->
            <div id="box-confirmar-data-hora-edicao" style="display: ${dataValor ? 'flex' : 'none'}; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 12px 14px; flex-direction: column; gap: 10px; margin-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
                <span style="font-size: 0.88rem; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-calendar-check" style="color: #16a34a; font-size: 1rem;"></i>
                  <span>Dia Selecionado: <strong id="lbl-data-edicao-display" style="color: #1b6d24; text-decoration: underline;">${dataFormatadaExibir}</strong></span>
                </span>
                <span id="lbl-horario-funcionamento-dia-edicao" style="font-size: 0.75rem; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 6px; font-weight: 600;"></span>
              </div>

              <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
                <label for="input_modal_hora" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
                  <i class="fa-regular fa-clock"></i> Horário Previsto para Retirada:<span style="color:#c62828;">*</span>
                </label>
                <select id="input_modal_hora" class="input-pill" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 9px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-family: inherit; font-weight: 700; cursor: pointer; background: #ffffff;">
                  <option value="${horaValor || ''}">${horaValor ? horaValor + ' hs' : 'Carregando horários...'}</option>
                </select>
                <span style="font-size: 0.74rem; color: #555;">Horários gerados conforme o funcionamento e pausas do ponto de retirada.</span>
              </div>
            </div>

            <div id="dica-selecionar-dia-cal-edicao" style="display: ${dataValor ? 'none' : 'flex'}; align-items: center; justify-content: center; gap: 6px; font-size: 0.8rem; color: #2e7d32; background: #e8f5e9; border: 1px dashed #a5d6a7; border-radius: 8px; padding: 8px 12px; text-align: center; margin-top: 6px;">
              <i class="fa-regular fa-hand-pointer"></i> Clique em um dia com atendimento (em verde) no calendário acima para escolher o horário.
            </div>
          `}
        </div>

        <!-- 4. Quantidade de Material -->
        <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
          <label for="input_modal_qtd_numero" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-boxes-stacked"></i> Quantidade Estimada:${ehFinalizada ? '' : '<span style="color:#c62828;">*</span>'}
          </label>
          <div style="display: grid; grid-template-columns: 85px 1fr; gap: 8px; width: 100%;">
            <input type="number" id="input_modal_qtd_numero" min="1" max="9999" value="${qtdDecomposta.numero}" placeholder="1" required style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 10px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; text-align: center; font-weight: 700; font-family: inherit; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : ''}" ${ehFinalizada ? 'disabled' : ''}>
            <select id="input_modal_qtd_unidade" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 12px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; font-weight: 600; font-family: inherit; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : 'cursor: pointer;'}" ${ehFinalizada ? 'disabled' : ''}>
              <option value="saco(s) grande(s)" ${qtdDecomposta.unidade === 'saco(s) grande(s)' ? 'selected' : ''}>saco(s) grande(s)</option>
              <option value="saco(s) médio(s)" ${qtdDecomposta.unidade === 'saco(s) médio(s)' ? 'selected' : ''}>saco(s) médio(s)</option>
              <option value="caixa(s)" ${qtdDecomposta.unidade === 'caixa(s)' ? 'selected' : ''}>caixa(s)</option>
              <option value="sacola(s)" ${qtdDecomposta.unidade === 'sacola(s)' ? 'selected' : ''}>sacola(s)</option>
              <option value="pacote(s)" ${qtdDecomposta.unidade === 'pacote(s)' ? 'selected' : ''}>pacote(s)</option>
              <option value="kg" ${qtdDecomposta.unidade === 'kg' ? 'selected' : ''}>kg (quilos)</option>
              <option value="unidade(s)" ${qtdDecomposta.unidade === 'unidade(s)' ? 'selected' : ''}>unidade(s)</option>
              <option value="fardo(s)" ${qtdDecomposta.unidade === 'fardo(s)' ? 'selected' : ''}>fardo(s)</option>
              <option value="outro" ${qtdDecomposta.unidade === 'outro' ? 'selected' : ''}>Outro (especificar)</option>
            </select>
          </div>
          <div id="box_modal_qtd_outro" style="display: ${qtdDecomposta.unidade === 'outro' ? 'block' : 'none'}; margin-top: 4px;">
            <input type="text" id="input_modal_qtd_outro" value="${qtdDecomposta.outro || ''}" placeholder="Especifique a unidade (ex: tambores, baldes)" style="width: 100%; box-sizing: border-box; font-size: 0.85rem; padding: 7px 10px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; font-family: inherit; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : ''}" ${ehFinalizada ? 'disabled' : ''}>
          </div>
        </div>

        <!-- 5. Ponto de Retirada (se houver opções) -->
        ${locaisOptionsHtml ? `
          <div class="campo" style="display: flex; flex-direction: column; gap: 4px;">
            <label for="input_modal_local" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-location-dot"></i> Ponto de Retirada:
            </label>
            <select id="input_modal_local" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 8px 12px; border: 1.5px solid ${ehFinalizada ? '#cbd5e1' : '#a5d6a7'}; border-radius: 8px; font-family: inherit; ${ehFinalizada ? 'background: #f1f5f9; color: #475569; cursor: not-allowed;' : ''}" ${ehFinalizada ? 'disabled' : ''}>
              ${locaisOptionsHtml}
            </select>
          </div>
        ` : ''}

      </form>

      <!-- Rodapé com Botões de Ação -->
      <div style="background: #f9fbf9; padding: 12px 20px; border-top: 1px solid #e0f2e9; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
        ${ehFinalizada ? `
          <button type="button" id="btn-cancelar-modal-coleta" class="btn-secondary-pill" style="padding: 8px 24px; font-size: 0.88rem; font-weight: 700; cursor: pointer;">
            Fechar
          </button>
        ` : `
          <button type="button" id="btn-cancelar-modal-coleta" class="btn-secondary-pill" style="padding: 8px 18px; font-size: 0.85rem; cursor: pointer;">
            Cancelar
          </button>
          <button type="button" id="btn-salvar-modal-coleta" class="btn-avancar" style="width: auto; padding: 8px 22px; font-size: 0.85rem; margin-top: 0; cursor: pointer;">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Informações
          </button>
        `}
      </div>

    </div>
  `;

  modal.style.display = 'flex';

  const fechar = () => { modal.style.display = 'none'; };

  const btnFechar = modal.querySelector('#btn-fechar-modal-coleta');
  const btnCancelar = modal.querySelector('#btn-cancelar-modal-coleta');
  const btnSalvar = modal.querySelector('#btn-salvar-modal-coleta');
  const msgEl = modal.querySelector('#modal-coleta-msg');

  if (btnFechar) btnFechar.onclick = fechar;
  if (btnCancelar) btnCancelar.onclick = fechar;

  modal.onclick = (e) => {
    if (e.target === modal) fechar();
  };

  // Alternância do campo de unidade customizada "Outro"
  const selQtdUnidade = modal.querySelector('#input_modal_qtd_unidade');
  const boxQtdOutro = modal.querySelector('#box_modal_qtd_outro');
  const inputQtdOutro = modal.querySelector('#input_modal_qtd_outro');

  if (selQtdUnidade && boxQtdOutro) {
    selQtdUnidade.addEventListener('change', () => {
      const ehOutro = selQtdUnidade.value === 'outro';
      boxQtdOutro.style.display = ehOutro ? 'block' : 'none';
      if (ehOutro && inputQtdOutro) {
        inputQtdOutro.focus();
      }
    });
  }

  // Preenchimento automático de data/hora e alternância de campos conforme status
  const inputData = modal.querySelector('#input_modal_data');
  const inputHora = modal.querySelector('#input_modal_hora');
  const selStatusModal = modal.querySelector('#input_modal_status');
  const selCatadorModal = modal.querySelector('#input_modal_catador');
  const boxDataHora = modal.querySelector('#container-modal-data-hora');
  const lblModalData = modal.querySelector('#lbl_modal_data');
  const lblModalHora = modal.querySelector('#lbl_modal_hora');
  const txtAjudaHorario = modal.querySelector('#txt_modal_ajuda_horario');

  let dataSelecionadaEdicaoStr = (dataValor && dataValor >= hojeMin) ? dataValor : null;
  let horaSelecionadaEdicaoStr = horaValor || '09:00';
  let calendarioEdicaoInicializado = false;

  async function onDiaSelecionadoEdicao(dateStr) {
    dataSelecionadaEdicaoStr = dateStr;
    const inputOcultoData = modal.querySelector('#input_modal_data');
    if (inputOcultoData) inputOcultoData.value = dateStr;

    const partes = dateStr.split('-');
    const dataFmt = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dateStr;

    const lblDataDisp = modal.querySelector('#lbl-data-edicao-display');
    const boxConf = modal.querySelector('#box-confirmar-data-hora-edicao');
    const dicaCal = modal.querySelector('#dica-selecionar-dia-cal-edicao');
    const lblFunc = modal.querySelector('#lbl-horario-funcionamento-dia-edicao');
    const selHora = modal.querySelector('#input_modal_hora');

    if (lblDataDisp) lblDataDisp.textContent = dataFmt;
    if (boxConf) {
      boxConf.style.display = 'flex';
      setTimeout(() => {
        boxConf.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    if (dicaCal) dicaCal.style.display = 'none';

    const selLoc = modal.querySelector('#input_modal_local');
    const locId = selLoc ? selLoc.value : (coleta.local_retirada_id || coleta.local_retirada?.id);

    if (selHora) {
      selHora.innerHTML = '<option value="">Carregando horários...</option>';
      try {
        const infoFunc = await obterHorarioFuncionamentoData(locId, dateStr);
        if (lblFunc) {
          if (infoFunc && infoFunc.disponivel) {
            let txtPausa = (infoFunc.pausa_inicio && infoFunc.pausa_fim) ? ` • Almoço: ${infoFunc.pausa_inicio} às ${infoFunc.pausa_fim}` : '';
            lblFunc.textContent = `${infoFunc.hora_inicio} às ${infoFunc.hora_fim}${txtPausa}`;
            lblFunc.style.display = 'inline-block';
          } else {
            lblFunc.style.display = 'none';
          }
        }

        const slots = await gerarHorariosValidosData(locId, dateStr);
        if (!slots || slots.length === 0) {
          selHora.innerHTML = '<option value="" disabled selected>Nenhum horário disponível para esta data</option>';
          return;
        }

        selHora.innerHTML = slots.map(h => {
          const isSel = (horaSelecionadaEdicaoStr && (horaSelecionadaEdicaoStr === h || horaSelecionadaEdicaoStr.startsWith(h))) ? 'selected' : '';
          return `<option value="${h}" ${isSel}>${h} hs</option>`;
        }).join('');

        if (!selHora.value) {
          const slotPadrao = slots.find(s => s === '09:00') || slots[0];
          selHora.value = slotPadrao;
        }
        horaSelecionadaEdicaoStr = selHora.value;
      } catch (err) {
        console.warn('Erro ao carregar horários para data na edição:', err);
        selHora.innerHTML = '<option value="" disabled selected>Erro ao consultar horários</option>';
      }
    }
  }

  async function inicializarCalendarioModalEdicao() {
    if (ehFinalizada) return;
    const calCont = modal.querySelector('#cal-picker-modal-edicao');
    if (!calCont) return;

    try {
      resetCalendarPendingMap();
      const selLoc = modal.querySelector('#input_modal_local');
      const locId = selLoc ? selLoc.value : (coleta.local_retirada_id || coleta.local_retirada?.id);
      const agendaData = await listarAgendaPorLocal(locId);

      let initialAno = null;
      let initialMes = null;
      if (dataSelecionadaEdicaoStr) {
        const p = dataSelecionadaEdicaoStr.split('-').map(Number);
        if (p.length === 3) {
          initialAno = p[0];
          initialMes = p[1] - 1;
        }
      }

      renderCalendarGrid('cal-picker-modal-edicao', {
        agendaData,
        isAdmin: false,
        ano: initialAno,
        mes: initialMes,
        onSelectDay: (dateStr) => {
          onDiaSelecionadoEdicao(dateStr);
        }
      });

      calendarioEdicaoInicializado = true;

      // Se já possui data pré-definida válida (coleta agendada), destaca visualmente o dia
      if (dataSelecionadaEdicaoStr) {
        const cell = calCont.querySelector(`#cell_${dataSelecionadaEdicaoStr}`);
        if (cell && cell.classList.contains('disponivel')) {
          cell.style.transform = 'scale(1.06)';
          cell.style.boxShadow = '0 0 0 3px #1b6d24';
        }
        await onDiaSelecionadoEdicao(dataSelecionadaEdicaoStr);
      }
    } catch (err) {
      console.warn('Erro ao carregar calendário na edição:', err);
      calCont.innerHTML = '<div style="color: #c62828; font-size: 0.85rem; padding: 16px; text-align: center;">Não foi possível carregar o calendário de atendimento deste local.</div>';
    }
  }

  function atualizarCamposConformeStatus(origem = 'init') {
    if (ehFinalizada) return;

    const codSt = parseInt(selStatusModal.value, 10);
    const catId = (selCatadorModal ? selCatadorModal.value : '').trim();
    
    // Transição automática apenas quando o usuário alterar o catador
    if (origem === 'catador') {
      if (catId && codSt === 1) {
        // Selecionou um catador em uma coleta Disponível -> Muda status para Agendada
        selStatusModal.value = '2';
      } else if (!catId && codSt === 2) {
        // Desmarcou o catador em uma coleta Agendada -> Retorna para Disponível
        selStatusModal.value = '1';
      }
    }

    const codStAtualizado = parseInt(selStatusModal.value, 10);
    const optSelecionada = selStatusModal.options[selStatusModal.selectedIndex];
    const stTexto = (optSelecionada?.text || '').toLowerCase();
    const regrasLocal = obterRegrasStatus(codStAtualizado, stTexto);
    
    const ehCanceladaLocal = (codStAtualizado === 4 || codStAtualizado === 5 || /cancel/i.test(stTexto));
    const ehRetiradaLocal = (codStAtualizado === 3 || /(retirad|conclu)/i.test(stTexto));
    const ehAgendadaLocal = (codStAtualizado === 2 || codStAtualizado === 6 || regrasLocal.regra_catador === 'requer_catador' || /agend/i.test(stTexto));
    const ehDisponivelLocal = (codStAtualizado === 1 || regrasLocal.regra_catador === 'sem_catador' || /dispon/i.test(stTexto));

    const boxCatador = modal.querySelector('#container-modal-catador');
    const boxDica = modal.querySelector('#box-dica-agendar');

    // Cenário: Cancelada
    if (ehCanceladaLocal) {
      if (boxCatador) boxCatador.style.display = 'none';
      if (boxDataHora) boxDataHora.style.display = 'none';
      if (boxDica) {
        boxDica.style.cssText = 'background: #fff5f5; border: 1.5px solid #ef9a9a; border-radius: 8px; padding: 10px 14px; margin-top: 6px; color: #c62828; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';
        boxDica.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #c62828; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">Ao salvar, esta oferta será encerrada e desvinculada de agendamentos.</div>';
        boxDica.style.display = 'flex';
      }
      return;
    }

    // Cenário: Sem Catador (Disponível ou regra sem_catador)
    if (ehDisponivelLocal) {
      if (boxCatador) boxCatador.style.display = 'flex';
      if (boxDataHora) boxDataHora.style.display = 'none';
      // Se o usuário selecionou diretamente status sem catador, limpa a seleção de catador
      if (origem === 'status' && selCatadorModal) {
        selCatadorModal.value = '';
      }
      if (boxDica) {
        if (origem === 'status' && (statusInfo.ehAgendada || coleta.cod_status === 2)) {
          boxDica.style.cssText = 'background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 8px; padding: 10px 14px; margin-top: 6px; color: #1e40af; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';
          boxDica.innerHTML = '<i class="fa-solid fa-circle-info" style="color: #1e40af; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">A coleta ficará disponível no mural público para novos catadores.</div>';
          boxDica.style.display = 'flex';
        } else if (regrasLocal.bloquear_dados) {
          boxDica.style.cssText = 'background: #fffbe6; border: 1.5px solid #ffe58f; border-radius: 8px; padding: 10px 14px; margin-top: 6px; color: #d48806; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';
          boxDica.innerHTML = '<i class="fa-solid fa-lock" style="color: #d48806; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">Ao salvar, os dados desta coleta ficarão bloqueados para alterações posteriores.</div>';
          boxDica.style.display = 'flex';
        } else {
          boxDica.style.display = 'none';
        }
      }
      return;
    }

    // Cenário: Retirada
    if (ehRetiradaLocal) {
      if (boxCatador) boxCatador.style.display = 'flex';
      if (boxDataHora) boxDataHora.style.display = 'block';
      if (lblModalData) lblModalData.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Data da Retirada:<span style="color:#c62828;">*</span>';
      if (lblModalHora) lblModalHora.innerHTML = '<i class="fa-regular fa-clock"></i> Horário da Retirada:';
      if (txtAjudaHorario) txtAjudaHorario.innerHTML = '<i class="fa-solid fa-circle-info" style="color: var(--verde-escuro, #1b6d24);"></i> Confirme a data e o horário em que o material foi recolhido.';
      if (boxDica) {
        boxDica.style.cssText = 'background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px 14px; margin-top: 6px; color: #166534; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';
        boxDica.innerHTML = '<i class="fa-solid fa-circle-check" style="color: #16a34a; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">Confirme o catador parceiro e os horários para registrar a conclusão da retirada.</div>';
        boxDica.style.display = 'flex';
      }
      return;
    }

    // Cenário: Requer Catador (Agendada, Reagendada ou custom)
    if (ehAgendadaLocal) {
      if (boxCatador) boxCatador.style.display = 'flex';
      if (boxDataHora) boxDataHora.style.display = 'block';
      if (lblModalData) lblModalData.innerHTML = '<i class="fa-regular fa-calendar-days"></i> Data Prevista:<span style="color:#c62828;">*</span>';
      if (lblModalHora) lblModalHora.innerHTML = '<i class="fa-regular fa-clock"></i> Horário Previsto:';
      if (txtAjudaHorario) txtAjudaHorario.innerHTML = '<i class="fa-solid fa-circle-info" style="color: var(--verde-escuro, #1b6d24);"></i> Defina a data e o horário previstos para a retirada do material.';

      const catadorEscolhido = selCatadorModal ? selCatadorModal.value.trim() : '';
      const dataEscolhida = modal.querySelector('#input_modal_data')?.value?.trim();

      if (boxDica) {
        boxDica.style.cssText = 'background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 10px 14px; margin-top: 6px; color: #166534; font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';

        if (!catadorEscolhido) {
          boxDica.innerHTML = '<i class="fa-solid fa-user-plus" style="color: #16a34a; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">Selecione o catador e a data de retirada abaixo.</div>';
          boxDica.style.display = 'flex';
          if (origem === 'status' && selCatadorModal) {
            selCatadorModal.focus();
          }
        } else if (!dataEscolhida) {
          boxDica.innerHTML = '<i class="fa-regular fa-calendar-plus" style="color: #16a34a; font-size: 1.1rem; flex-shrink: 0;"></i><div style="flex: 1; min-width: 0; line-height: 1.4;">Clique na data desejada no calendário abaixo para definir o recolhimento.</div>';
          boxDica.style.display = 'flex';
        } else {
          boxDica.style.display = 'none';
        }
      }

      if (!calendarioEdicaoInicializado) {
        inicializarCalendarioModalEdicao();
      }
    }
  }

  if (selStatusModal && !ehFinalizada) selStatusModal.addEventListener('change', () => atualizarCamposConformeStatus('status'));
  if (selCatadorModal && !ehFinalizada) selCatadorModal.addEventListener('change', () => atualizarCamposConformeStatus('catador'));
  const selLocalEl = modal.querySelector('#input_modal_local');
  if (selLocalEl && !ehFinalizada) {
    selLocalEl.addEventListener('change', () => {
      if (calendarioEdicaoInicializado) {
        inicializarCalendarioModalEdicao();
      }
    });
  }

  // Inicializa o estado visual correto dos campos conforme o status inicial
  if (!ehFinalizada) {
    atualizarCamposConformeStatus('init');
    if (!statusInfo.ehDisponivel) {
      inicializarCalendarioModalEdicao();
    }
  }

  if (btnSalvar && !ehFinalizada) {
    btnSalvar.onclick = async () => {
      try {
        const selStatus = modal.querySelector('#input_modal_status');
        const selCatador = modal.querySelector('#input_modal_catador');
        const inputQtdNum = modal.querySelector('#input_modal_qtd_numero');
        const inputQtdOutro = modal.querySelector('#input_modal_qtd_outro');
        const selLocal = modal.querySelector('#input_modal_local');

        const novoCodStatus = parseInt(selStatus.value, 10);
        const nomeNovoStatus = selStatus.options[selStatus.selectedIndex]?.text || '';
        let catadorId = (selCatador ? selCatador.value : '').trim() || null;
        const nomeCatador = selCatador?.options[selCatador.selectedIndex]?.text || '';
        let dataVal = modal.querySelector('#input_modal_data')?.value?.trim() || null;
        let horaVal = modal.querySelector('#input_modal_hora')?.value?.trim() || null;
        const localId = selLocal ? selLocal.value : null;

        const regrasNovoStatus = obterRegrasStatus(novoCodStatus, nomeNovoStatus);
        const ehCancelada = novoCodStatus === 4 || novoCodStatus === 5 || /cancel/i.test(nomeNovoStatus);
        const ehDisponivel = novoCodStatus === 1 || regrasNovoStatus.regra_catador === 'sem_catador' || /dispon/i.test(nomeNovoStatus);

        // Se a coleta for cancelada ou sem catador (ex: disponível), desvincula catador e limpa horários
        if (ehCancelada || ehDisponivel || regrasNovoStatus.regra_catador === 'sem_catador') {
          catadorId = null;
          dataVal = null;
          horaVal = null;
        }

        const qtdNumVal = inputQtdNum ? inputQtdNum.value : '1';
        const qtdUnidadeVal = selQtdUnidade ? selQtdUnidade.value : 'caixa(s)';
        const qtdOutroVal = inputQtdOutro ? inputQtdOutro.value : '';

        let qtdVal = '';
        try {
          qtdVal = formatarQuantidadePadrao(qtdNumVal, qtdUnidadeVal, qtdOutroVal);
        } catch (errQtd) {
          showAlertModal({
            title: 'Quantidade Inválida',
            message: errQtd.message || 'Por favor, informe uma quantidade válida maior que zero.',
            buttonText: 'Entendido',
            confirmColor: '#c62828'
          });
          return;
        }

        // REGRA 1: Para Agendada, Reagendada, Retirada ou qualquer status que requeira catador, catador e data são estritamente obrigatórios
        const precisaCatador = (regrasNovoStatus.regra_catador === 'requer_catador') ||
          ((novoCodStatus === 2 || novoCodStatus === 3 || novoCodStatus === 6 || /agend|retirad|conclu/i.test(nomeNovoStatus)) && !ehCancelada && !ehDisponivel);
        if (precisaCatador && !catadorId) {
          showAlertModal({
            title: 'Catador Obrigatório',
            message: `Para a coleta ter o status de "${nomeNovoStatus}", é obrigatório selecionar um catador.\n\nPor favor, escolha um catador parceiro no campo "Catador Atribuído".`,
            buttonText: 'Selecionar Catador',
            confirmColor: '#c62828',
            icon: '<i class="fa-solid fa-user-plus" style="color: #c62828; font-size: 1.25rem;"></i>'
          });
          if (selCatador) selCatador.focus();
          return;
        }

        if (precisaCatador && !dataVal) {
          showAlertModal({
            title: 'Data Prevista Obrigatória',
            message: 'Por favor, informe a Data Prevista em que o material será recolhido pelo catador.',
            buttonText: 'Escolher Data',
            confirmColor: '#1b6d24',
            icon: '<i class="fa-regular fa-calendar-days" style="color: #1b6d24; font-size: 1.25rem;"></i>'
          });
          if (inputData) {
            inputData.focus();
            inputData.style.border = '2px solid #c62828';
          }
          return;
        }

        if (precisaCatador && !horaVal) {
          horaVal = '09:00';
        }

        // REGRA 1.1: Validação de horário de funcionamento pelo calendário ao agendar (status 2, 6 ou requer catador)
        if (novoCodStatus === 2 || novoCodStatus === 6 || regrasNovoStatus.regra_catador === 'requer_catador') {
          const locIdEfetivo = localId || coleta.local_retirada_id || coleta.local_retirada?.id;
          const validacaoAgenda = await validarHorarioAgendamento({
            local_retirada_id: locIdEfetivo,
            data: dataVal,
            hora: horaVal
          });
          if (!validacaoAgenda.valido) {
            showAlertModal({
              title: 'Horário Fora do Funcionamento',
              message: validacaoAgenda.erro,
              buttonText: 'Ajustar Horário',
              confirmColor: '#c62828',
              icon: '<i class="fa-regular fa-clock" style="color: #c62828; font-size: 1.25rem;"></i>'
            });
            if (inputHora) inputHora.focus();
            return;
          }
        }

        // REGRA 2: Confirmação de alteração
        const eraDisponivel = coleta.cod_status === 1 || stNomeAtual.includes('dispon');
        const vaiSerDisponivel = ehDisponivel;
        const ehAgendadaOuRetirada = precisaCatador || (novoCodStatus === 2 || novoCodStatus === 3 || novoCodStatus === 6);

        let confirmTitle = 'Confirmar Alterações da Coleta';
        let confirmMsg = 'Deseja salvar as novas informações desta coleta?';
        let confirmBtnTxt = 'Sim, Salvar';

        if (ehCancelada) {
          confirmTitle = 'Cancelar Oferta de Coleta';
          confirmMsg = 'Deseja realmente cancelar esta oferta de coleta? Ao cancelar, a data prevista e o catador atribuído serão removidos e a coleta ficará arquivada como Cancelada.';
          confirmBtnTxt = 'Sim, Cancelar Coleta';
        } else if (ehAgendadaOuRetirada && !eraDisponivel) {
          const partesD = dataVal ? dataVal.split('-') : [];
          const dataFormatadaExibir = partesD.length === 3 ? `${partesD[2]}/${partesD[1]}/${partesD[0]}` : (dataVal || '');
          if (novoCodStatus === 6 || /reagend/i.test(nomeNovoStatus)) {
            confirmTitle = 'Confirmar Reagendamento da Coleta';
            confirmMsg = `Deseja reagendar a coleta com o catador "${nomeCatador}" para o dia ${dataFormatadaExibir} às ${horaVal}?`;
            confirmBtnTxt = 'Sim, Reagendar Coleta';
          } else if (novoCodStatus === 3 || /retirad/i.test(nomeNovoStatus)) {
            confirmTitle = 'Confirmar Retirada da Coleta';
            confirmMsg = `Deseja registrar a retirada da coleta pelo catador "${nomeCatador}"?`;
            confirmBtnTxt = 'Sim, Confirmar Retirada';
          } else {
            confirmTitle = 'Confirmar Agendamento da Coleta';
            confirmMsg = `Deseja agendar a coleta com o catador "${nomeCatador}" para o dia ${dataFormatadaExibir} às ${horaVal}?`;
            confirmBtnTxt = 'Sim, Confirmar Agendamento';
          }
        } else if (eraDisponivel && !vaiSerDisponivel) {
          const partesD = dataVal ? dataVal.split('-') : [];
          const dataFormatadaExibir = partesD.length === 3 ? `${partesD[2]}/${partesD[1]}/${partesD[0]}` : (dataVal || '');
          confirmTitle = (novoCodStatus === 6 || /reagend/i.test(nomeNovoStatus)) ? 'Reagendar Coleta' : 'Vincular Catador e Salvar';
          confirmMsg = `Esta coleta está atualmente "Disponível".\n\nAo salvar com o catador "${nomeCatador}" para ${dataFormatadaExibir} às ${horaVal}, ela será agendada. Deseja prosseguir?`;
          confirmBtnTxt = 'Sim, Salvar Coleta';
        } else if (vaiSerDisponivel && !eraDisponivel) {
          confirmTitle = 'Retornar Coleta para Disponível';
          confirmMsg = `Ao retornar a coleta para "Disponível", o catador e horários combinados serão desvinculados automaticamente.\n\nDeseja prosseguir?`;
          confirmBtnTxt = 'Sim, Voltar para Disponível';
        }

        showConfirmModal({
          title: confirmTitle,
          message: confirmMsg,
          confirmText: confirmBtnTxt,
          cancelText: 'Voltar',
          confirmColor: '#1b6d24',
          icon: '<i class="fa-solid fa-floppy-disk" style="color: #1b6d24; font-size: 1.25rem;"></i>',
          onConfirm: async () => {
            try {
              btnSalvar.disabled = true;
              btnSalvar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Salvando...';

              await atualizarColetaCompleta({
                cod_coleta: coleta.cod_coleta,
                cod_status: novoCodStatus,
                catador_id: catadorId,
                data: dataVal,
                hora: horaVal,
                quantidade: qtdVal,
                local_retirada_id: localId
              });

              fechar();
              if (typeof onSalvar === 'function') {
                const qtdExibicao = qtdVal ? ` (${qtdVal})` : (coleta.quantidade ? ` (${coleta.quantidade})` : '');
                onSalvar(`Coleta de ${tipoMaterial}${qtdExibicao} atualizada com sucesso!`);
              }
            } catch (err) {
              btnSalvar.disabled = false;
              btnSalvar.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Informações';
              if (msgEl) {
                msgEl.textContent = 'Erro ao salvar: ' + err.message;
                msgEl.className = 'status-message error';
                msgEl.style.display = 'block';
              }
              showAlertModal({
                title: 'Erro ao Salvar',
                message: err.message || 'Não foi possível salvar as alterações da coleta.',
                buttonText: 'Fechar',
                confirmColor: '#c62828'
              });
            }
          }
        });
      } catch (errVal) {
        console.error('Erro na validação do salvamento da coleta:', errVal);
        showAlertModal({
          title: 'Erro ao Processar',
          message: errVal.message || 'Não foi possível processar as alterações da coleta.',
          buttonText: 'Fechar',
          confirmColor: '#c62828'
        });
      }
    };
  }
}

/**
 * Confirmar Retirada de Coleta com Diálogo Modal e Validação de Catador
 */
export function confirmarRetiradaComModal({ cod_coleta, catador_id, material, quantidade, onConfirmada }) {
  if (!catador_id) {
    showAlertModal({
      title: 'Catador Obrigatório',
      message: 'Para a coleta ter a retirada confirmada, é obrigatório haver um catador alocado.\n\nPor favor, utilize a opção "Editar Informações" ou atribua um catador antes de confirmar a retirada.',
      buttonText: 'Entendido',
      confirmColor: '#c62828',
      icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #c62828; font-size: 1.25rem;"></i>'
    });
    return;
  }

  showConfirmModal({
    title: 'Confirmar Retirada do Material',
    message: 'Confirma que o material reciclável já foi recolhido do ponto de retirada pelo catador?',
    confirmText: 'Sim, Confirmar Retirada',
    cancelText: 'Voltar',
    confirmColor: '#1b6d24',
    icon: '<i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 1.25rem;"></i>',
    onConfirm: async () => {
      try {
        await confirmarRetirada(cod_coleta);
        if (typeof onConfirmada === 'function') {
          const matTxt = material ? ` de ${material}${quantidade ? ` (${quantidade})` : ''}` : '';
          onConfirmada(`Retirada da coleta${matTxt} confirmada com sucesso!`);
        }
      } catch (err) {
        showAlertModal({
          title: 'Erro ao Confirmar Retirada',
          message: err.message || 'Não foi possível confirmar a retirada no momento.',
          buttonText: 'Fechar',
          confirmColor: '#c62828'
        });
      }
    }
  });
}

/**
 * Modal Especializado: Atribuir Catador e Agendar Retirada com Escolha Explícita de Data e Horário
 */
export function abrirModalAtribuirCatador({ coleta, catadores = [], onSalvar }) {
  const statusInfo = resolverStatusColeta(coleta);
  if (statusInfo.ehRetirada) {
    showAlertModal({
      title: 'Coleta Já Retirada',
      message: 'Esta coleta já foi recolhida e retirada. O catador responsável não pode ser alterado.',
      buttonText: 'Entendido',
      confirmColor: '#1b6d24',
      icon: '<i class="fa-solid fa-lock" style="color: #1b6d24; font-size: 1.25rem;"></i>'
    });
    return;
  }
  if (statusInfo.ehCancelada) {
    showAlertModal({
      title: 'Coleta Cancelada',
      message: 'Esta coleta está cancelada e não permite atribuição de catador.',
      buttonText: 'Entendido',
      confirmColor: '#c62828',
      icon: '<i class="fa-solid fa-ban" style="color: #c62828; font-size: 1.25rem;"></i>'
    });
    return;
  }

  let modal = document.getElementById('modal-atribuir-catador');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-atribuir-catador';
    modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 10000; padding: 16px; box-sizing: border-box; overflow-y: auto;';
    document.body.appendChild(modal);
  }

  const tipoMaterial = coleta.materiais?.tipo || coleta.materiais?.nome || 'Material Reciclável';
  const localNome = coleta.local_retirada?.nome || 'Fatec Franco da Rocha';
  const catadorAtualId = coleta.catador_id || '';
  const dataAtual = coleta.data ? coleta.data.slice(0, 10) : '';
  const horaAtual = coleta.hora ? coleta.hora.slice(0, 5) : '09:00';

  const agora = new Date();
  const hojeMin = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;

  const dataCriacaoObj = coleta.criado_em ? new Date(coleta.criado_em) : null;
  const dataCriacaoFormatada = (dataCriacaoObj && !isNaN(dataCriacaoObj.getTime()))
    ? dataCriacaoObj.toLocaleDateString('pt-BR')
    : '';

  let catadoresOptions = '<option value="">-- Selecione o Catador Parceiro --</option>';
  catadores.forEach(c => {
    const isSel = (catadorAtualId === c.id) ? 'selected' : '';
    catadoresOptions += `<option value="${c.id}" ${isSel}>${c.nome}</option>`;
  });

  modal.innerHTML = `
    <div style="background: #ffffff; width: 100%; max-width: 530px; border-radius: 16px; box-shadow: 0 12px 36px rgba(0,0,0,0.25); display: flex; flex-direction: column; max-height: calc(100vh - 32px); max-height: 90vh; overflow: hidden; border: 1.5px solid #a5d6a7; animation: modalFadeIn 0.2s ease-out; margin: auto;">
      
      <!-- Cabeçalho (Fixo) -->
      <div style="background: linear-gradient(135deg, var(--verde-escuro, #1b6d24), #2e7d32); color: white; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
        <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-calendar-plus"></i> Atribuir Catador & Agendar
        </h3>
        <button type="button" id="btn-fechar-modal-atribuir" style="background: none; border: none; color: white; font-size: 1.3rem; cursor: pointer; padding: 4px 8px; line-height: 1;" title="Fechar">✕</button>
      </div>

      <!-- Resumo Informativo (Fixo) -->
      <div style="background: #f4fbf5; padding: 12px 20px; border-bottom: 1px solid #e0f2e9; display: flex; flex-direction: column; gap: 4px; flex-shrink: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--verde-escuro, #1b6d24);">
            ${tipoMaterial} — ${coleta.quantidade || 'Qtd aproximada'}
          </div>
          ${dataCriacaoFormatada ? `
            <span style="font-size: 0.76rem; color: #2e7d32; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 2px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; font-weight: 600;">
              <i class="fa-regular fa-calendar" style="color: #2e7d32;"></i> Criada em ${dataCriacaoFormatada}
            </span>
          ` : ''}
        </div>
        <div style="font-size: 0.82rem; color: #555;">
          <i class="fa-solid fa-location-dot" style="color: #2e7d32;"></i> <strong>Local:</strong> ${localNome}
        </div>
      </div>

      <!-- Formulário de Escolha Ativa (Corpo com rolagem vertical suave) -->
      <div id="body-modal-atribuir" style="padding: 16px 20px; overflow-y: auto; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 14px; -webkit-overflow-scrolling: touch;">
        
        <!-- 1. Seleção do Catador -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <label for="select_atribuir_catador" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-user-check"></i> Catador Responsável:<span style="color:#c62828;">*</span>
          </label>
          <select id="select_atribuir_catador" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 9px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-family: inherit; font-weight: 600;">
            ${catadoresOptions}
          </select>
        </div>

        <!-- 2. Calendário Visual Direto -->
        <div style="display: flex; flex-direction: column; gap: 6px;">
          <label style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
            <i class="fa-regular fa-calendar-days"></i> Dia da Retirada (clique na data desejada):<span style="color:#c62828;">*</span>
          </label>
          <div id="box-calendario-container-atribuir" style="width: 100%; border: 1.5px solid #c8e6c9; border-radius: 12px; padding: 4px; background: #ffffff; box-sizing: border-box;">
            <div id="cal-picker-modal-atribuir" style="width: 100%;">
              <div style="text-align: center; padding: 24px 12px; color: #666; font-size: 0.85rem;">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Carregando calendário de atendimento...
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Dia Selecionado e Horário de Retirada (exibido ao escolher data) -->
        <div id="box-confirmar-data-hora-atribuir" style="display: none; background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 12px 14px; flex-direction: column; gap: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <span style="font-size: 0.88rem; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-calendar-check" style="color: #16a34a; font-size: 1rem;"></i>
              <span>Dia Selecionado: <strong id="lbl-data-atribuir-display" style="color: #1b6d24; text-decoration: underline;">--/--/----</strong></span>
            </span>
            <span id="lbl-horario-funcionamento-dia" style="font-size: 0.75rem; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 6px; font-weight: 600;"></span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label for="select_atribuir_hora" style="font-size: 0.85rem; font-weight: 700; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 6px;">
              <i class="fa-regular fa-clock"></i> Horário Previsto para Retirada:<span style="color:#c62828;">*</span>
            </label>
            <select id="select_atribuir_hora" style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 9px 12px; border: 1.5px solid #a5d6a7; border-radius: 8px; font-family: inherit; font-weight: 700; cursor: pointer; background: #ffffff;">
              <option value="">Carregando horários...</option>
            </select>
            <span id="msg-ajuda-horario-atribuir" style="font-size: 0.74rem; color: #555;">Horários gerados conforme o funcionamento e pausas do ponto de retirada.</span>
          </div>
        </div>

        <div id="dica-selecionar-dia-cal" style="display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.8rem; color: #2e7d32; background: #e8f5e9; border: 1px dashed #a5d6a7; border-radius: 8px; padding: 8px 12px; text-align: center;">
          <i class="fa-regular fa-hand-pointer"></i> Clique em um dia com atendimento (em verde) no calendário acima para escolher o horário.
        </div>

      </div>

      <!-- Rodapé com Ações (Fixo) -->
      <div style="background: #f9fbf9; padding: 12px 20px; border-top: 1px solid #e0f2e9; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0;">
        <button type="button" id="btn-cancelar-atribuir" class="btn-secondary-pill" style="padding: 8px 18px; font-size: 0.85rem; cursor: pointer;">
          Cancelar
        </button>
        <button type="button" id="btn-salvar-atribuir" class="btn-avancar" style="width: auto; padding: 8px 24px; font-size: 0.85rem; margin-top: 0; cursor: pointer;">
          <i class="fa-solid fa-calendar-check"></i> Confirmar Agendamento
        </button>
      </div>

    </div>
  `;

  modal.style.display = 'flex';

  const fechar = () => { modal.style.display = 'none'; };
  modal.querySelector('#btn-fechar-modal-atribuir').onclick = fechar;
  modal.querySelector('#btn-cancelar-atribuir').onclick = fechar;
  modal.onclick = (e) => { if (e.target === modal) fechar(); };

  const selCat = modal.querySelector('#select_atribuir_catador');
  const selHora = modal.querySelector('#select_atribuir_hora');
  const btnSalvar = modal.querySelector('#btn-salvar-atribuir');
  const calContainer = modal.querySelector('#cal-picker-modal-atribuir');
  const boxConfirmar = modal.querySelector('#box-confirmar-data-hora-atribuir');
  const dicaCal = modal.querySelector('#dica-selecionar-dia-cal');
  const lblDataDisplay = modal.querySelector('#lbl-data-atribuir-display');
  const lblFuncDia = modal.querySelector('#lbl-horario-funcionamento-dia');

  const locIdEfetivo = coleta.local_retirada_id || coleta.local_retirada?.id;

  let dataSelecionadaStr = (dataAtual && dataAtual >= hojeMin) ? dataAtual : null;
  let horaSelecionadaStr = horaAtual || '09:00';

  async function onDiaSelecionado(dateStr) {
    dataSelecionadaStr = dateStr;
    const partes = dateStr.split('-');
    const dataFmt = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : dateStr;

    if (lblDataDisplay) lblDataDisplay.textContent = dataFmt;
    if (boxConfirmar) {
      boxConfirmar.style.display = 'flex';
      setTimeout(() => {
        boxConfirmar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
    if (dicaCal) dicaCal.style.display = 'none';

    if (selHora) {
      selHora.innerHTML = '<option value="">Carregando horários...</option>';
      try {
        const infoFunc = await obterHorarioFuncionamentoData(locIdEfetivo, dateStr);
        if (lblFuncDia) {
          if (infoFunc && infoFunc.disponivel) {
            let txtPausa = (infoFunc.pausa_inicio && infoFunc.pausa_fim) ? ` • Almoço: ${infoFunc.pausa_inicio} às ${infoFunc.pausa_fim}` : '';
            lblFuncDia.textContent = `${infoFunc.hora_inicio} às ${infoFunc.hora_fim}${txtPausa}`;
            lblFuncDia.style.display = 'inline-block';
          } else {
            lblFuncDia.style.display = 'none';
          }
        }

        const slots = await gerarHorariosValidosData(locIdEfetivo, dateStr);
        if (!slots || slots.length === 0) {
          selHora.innerHTML = '<option value="" disabled selected>Nenhum horário disponível para esta data</option>';
          return;
        }

        selHora.innerHTML = slots.map(h => {
          const isSel = (horaSelecionadaStr && (horaSelecionadaStr === h || horaSelecionadaStr.startsWith(h))) ? 'selected' : '';
          return `<option value="${h}" ${isSel}>${h} hs</option>`;
        }).join('');

        if (!selHora.value) {
          const slotPadrao = slots.find(s => s === '09:00') || slots[0];
          selHora.value = slotPadrao;
        }
        horaSelecionadaStr = selHora.value;
      } catch (err) {
        console.warn('Erro ao carregar horários para data:', err);
        selHora.innerHTML = '<option value="" disabled selected>Erro ao consultar horários</option>';
      }
    }
  }

  async function inicializarCalendarioModal() {
    try {
      resetCalendarPendingMap();
      const agendaData = await listarAgendaPorLocal(locIdEfetivo);

      let initialAno = null;
      let initialMes = null;
      if (dataSelecionadaStr) {
        const p = dataSelecionadaStr.split('-').map(Number);
        if (p.length === 3) {
          initialAno = p[0];
          initialMes = p[1] - 1;
        }
      }

      renderCalendarGrid('cal-picker-modal-atribuir', {
        agendaData,
        isAdmin: false,
        ano: initialAno,
        mes: initialMes,
        onSelectDay: (dateStr) => {
          onDiaSelecionado(dateStr);
        }
      });

      // Se já tinha data pré-definida válida, ativa visualmente a célula e carrega os horários
      if (dataSelecionadaStr) {
        const cell = calContainer.querySelector(`#cell_${dataSelecionadaStr}`);
        if (cell && cell.classList.contains('disponivel')) {
          cell.style.transform = 'scale(1.06)';
          cell.style.boxShadow = '0 0 0 3px #1b6d24';
        }
        await onDiaSelecionado(dataSelecionadaStr);
      }
    } catch (err) {
      console.warn('Erro ao carregar calendário do modal:', err);
      calContainer.innerHTML = '<div style="color: #c62828; font-size: 0.85rem; padding: 16px; text-align: center;">Não foi possível carregar o calendário de atendimento deste local.</div>';
    }
  }

  inicializarCalendarioModal();

  btnSalvar.onclick = async () => {
    const catadorId = (selCat.value || '').trim();
    const nomeCatador = selCat.options[selCat.selectedIndex]?.text || '';
    const dataVal = (dataSelecionadaStr || '').trim();
    const horaVal = (selHora ? selHora.value : '').trim();

    if (!catadorId) {
      showAlertModal({
        title: 'Selecione um Catador',
        message: 'Por favor, selecione qual catador parceiro será responsável pela retirada.',
        buttonText: 'Selecionar Catador',
        confirmColor: '#c62828',
        icon: '<i class="fa-solid fa-user-plus" style="color: #c62828; font-size: 1.25rem;"></i>'
      });
      selCat.focus();
      return;
    }

    if (!dataVal) {
      showAlertModal({
        title: 'Selecione a Data no Calendário',
        message: 'Por favor, clique em um dia com atendimento (em verde) no calendário para definir a data de retirada.',
        buttonText: 'Escolher Dia',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-regular fa-calendar-days" style="color: #1b6d24; font-size: 1.25rem;"></i>'
      });
      return;
    }

    if (!horaVal) {
      showAlertModal({
        title: 'Horário Obrigatório',
        message: 'Por favor, selecione na lista o horário previsto para a retirada.',
        buttonText: 'Definir Horário',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-regular fa-clock" style="color: #1b6d24; font-size: 1.25rem;"></i>'
      });
      if (selHora) selHora.focus();
      return;
    }

    // Validação estrita contra a agenda de funcionamento
    const validacaoAgenda = await validarHorarioAgendamento({
      local_retirada_id: locIdEfetivo,
      data: dataVal,
      hora: horaVal
    });

    if (!validacaoAgenda.valido) {
      showAlertModal({
        title: 'Horário Fora do Funcionamento',
        message: validacaoAgenda.erro,
        buttonText: 'Ajustar Horário',
        confirmColor: '#c62828',
        icon: '<i class="fa-regular fa-clock" style="color: #c62828; font-size: 1.25rem;"></i>'
      });
      if (selHora) selHora.focus();
      return;
    }

    const partesD = dataVal.split('-');
    const dataFmt = partesD.length === 3 ? `${partesD[2]}/${partesD[1]}/${partesD[0]}` : dataVal;

    showConfirmModal({
      title: 'Confirmar Agendamento de Retirada',
      message: `Deseja agendar a retirada desta coleta com o catador "${nomeCatador}" para o dia ${dataFmt} às ${horaVal}?`,
      confirmText: 'Sim, Confirmar Agendamento',
      cancelText: 'Voltar e Ajustar',
      confirmColor: '#1b6d24',
      icon: '<i class="fa-solid fa-calendar-check" style="color: #1b6d24; font-size: 1.25rem;"></i>',
      onConfirm: async () => {
        try {
          btnSalvar.disabled = true;
          btnSalvar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Agendando...';

          await vincularCatadorColeta(coleta.cod_coleta, catadorId, dataVal, horaVal);

          fechar();
          if (typeof onSalvar === 'function') {
            const qtdExibicao = coleta.quantidade ? ` (${coleta.quantidade})` : '';
            onSalvar(`Coleta de ${tipoMaterial}${qtdExibicao} agendada com sucesso com o catador "${nomeCatador}" para ${dataFmt} às ${horaVal}!`);
          }
        } catch (err) {
          btnSalvar.disabled = false;
          btnSalvar.innerHTML = '<i class="fa-solid fa-calendar-check"></i> Confirmar Agendamento';
          showAlertModal({
            title: 'Erro ao Agendar',
            message: 'Não foi possível agendar a coleta: ' + err.message,
            buttonText: 'Fechar',
            confirmColor: '#c62828'
          });
        }
      }
    });
  };
}
