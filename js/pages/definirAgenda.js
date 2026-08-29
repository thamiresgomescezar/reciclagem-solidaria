import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { renderCalendarGrid } from './calendarPicker.js';
import { gerarAgendaRecorrente, toggleDisponibilidadeData, listarAgendaPorLocal } from '../services/agenda.js';
import { getLocalRetiradaPadrao } from '../services/coletas.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['administrador']);
  if (!perfil) return;

  const feedbackMsg = document.getElementById('feedback-msg');
  const btnGerarRecorrente = document.getElementById('btn-gerar-recorrente');
  const inputInicio = document.getElementById('horario_inicio');
  const inputFim = document.getElementById('horario_fim');
  const btnVoltar = document.getElementById('btn-voltar');
  const weekdayBtns = document.querySelectorAll('.weekday-btn');

  let localPadrao = null;
  let agendaDataAtual = [];

  // Dias da semana pré-selecionados por padrão (Segunda a Sexta = 1, 2, 3, 4, 5)
  let diasSelecionados = [1, 2, 3, 4, 5];

  weekdayBtns.forEach(btn => {
    const dayVal = parseInt(btn.getAttribute('data-day'), 10);
    if (diasSelecionados.includes(dayVal)) {
      btn.classList.add('selected');
    }

    btn.addEventListener('click', () => {
      if (diasSelecionados.includes(dayVal)) {
        diasSelecionados = diasSelecionados.filter(d => d !== dayVal);
        btn.classList.remove('selected');
      } else {
        diasSelecionados.push(dayVal);
        btn.classList.add('selected');
      }
    });
  });

  btnVoltar.addEventListener('click', (e) => {
    e.preventDefault();
    redirecionarPorPerfil(perfil.tipo);
  });

  async function carregarEExibirAgenda() {
    try {
      if (!localPadrao) {
        localPadrao = await getLocalRetiradaPadrao();
      }

      agendaDataAtual = await listarAgendaPorLocal(localPadrao.id);

      renderCalendarGrid('calendar-container', {
        agendaData: agendaDataAtual,
        isAdmin: true,
        onToggleDay: async (dateStr, novoStatusDisponivel) => {
          try {
            await toggleDisponibilidadeData(
              localPadrao.id,
              dateStr,
              novoStatusDisponivel,
              inputInicio.value || '08:00',
              inputFim.value || '17:00'
            );

            showSuccess(`Data ${dateStr} alterada para: ${novoStatusDisponivel ? 'DISPONÍVEL ✅' : 'INDISPONÍVEL/FERIADO ❌'}`);
            carregarEExibirAgenda();
          } catch (err) {
            showError('Erro ao alterar data: ' + err.message);
          }
        }
      });

    } catch (err) {
      console.error(err);
      showError('Erro ao carregar dados da agenda.');
    }
  }

  btnGerarRecorrente.addEventListener('click', async () => {
    if (diasSelecionados.length === 0) {
      showError('Selecione pelo menos um dia da semana para atendimento.');
      return;
    }

    try {
      btnGerarRecorrente.disabled = true;
      btnGerarRecorrente.innerText = 'GERANDO AGENDA...';

      if (!localPadrao) {
        localPadrao = await getLocalRetiradaPadrao();
      }

      await gerarAgendaRecorrente({
        local_retirada_id: localPadrao.id,
        diasSemana: diasSelecionados,
        hora_inicio: inputInicio.value || '08:00',
        hora_fim: inputFim.value || '17:00'
      });

      showSuccess('Agenda recorrente de dias úteis gerada com sucesso para os próximos 45 dias!');
      await carregarEExibirAgenda();

    } catch (err) {
      console.error(err);
      showError('Erro ao gerar agenda recorrente: ' + err.message);
    } finally {
      btnGerarRecorrente.disabled = false;
      btnGerarRecorrente.innerText = '⚡ GERAR AGENDA AUTOMÁTICA (PRÓXIMOS 45 DIAS)';
    }
  });

  function showError(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg error';
  }

  function showSuccess(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg success';
  }

  await carregarEExibirAgenda();
});
