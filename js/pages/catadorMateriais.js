import { proibirAcessoInvalido } from '../lib/routeGuard.js';
import { listarColetasDisponiveis, assinarColetasEmTempoReal } from '../services/coletas.js';
import { listarAgendaPorLocal } from '../services/agenda.js';
import { renderCalendarGrid } from './calendarPicker.js';
import { logout } from '../services/auth.js';
import { supabase } from '../lib/supabaseClient.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['catador', 'administrador']);
  if (!perfil) return;

  const listaContainer = document.getElementById('lista-coletas');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnLogout = document.getElementById('btn-logout');
  const btnVoltarTop = document.getElementById('btn-voltar-top');

  if (btnVoltarTop && perfil) {
    btnVoltarTop.href = perfil.tipo === 'administrador' ? './dashboard-admin.html' : './dashboard-catador.html';
  }

  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
      window.location.href = './login.html';
    });
  }

  async function carregarLista() {
    try {
      const rawColetas = await listarColetasDisponiveis().catch(err => {
        console.warn('Erro ao consultar ofertas:', err);
        return [];
      });
      
      const coletas = (rawColetas || []).filter(c => {
        const st = (c.status?.status || c.status || '').toLowerCase();
        const cod = c.cod_status;
        const isDisp = (cod === 1 || cod === null || cod === undefined || st === 'disponível' || st === 'disponivel' || st === 'em aberto' || !st);
        const semCatador = !c.catador_id;
        return isDisp && semCatador;
      });

      if (!coletas || coletas.length === 0) {
        listaContainer.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 16px; border: 1.5px dashed #a5d6a7;">
            <div style="width: 52px; height: 52px; background: #e8f5e9; border-radius: 50%; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.5rem;">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <p style="font-weight: 800; font-size: 1.1rem; color: var(--verde-escuro, #1b6d24); margin-bottom: 6px;">Nenhum material disponível no momento</p>
            <p style="font-size: 0.88rem; color: #555; margin-top: 4px;">Novas ofertas cadastradas pelos cidadãos aparecerão aqui automaticamente.</p>
          </div>
        `;
        return;
      }

      listaContainer.innerHTML = '';
      coletas.forEach(coleta => {
        const card = document.createElement('div');
        card.className = 'coleta-card';
        card.style.cssText = `
          background: white;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.05);
          border: 1px solid #c8e6c9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        `;

        const tipoMaterial = coleta.materiais?.tipo || 'Material Reciclável';
        
        let nomeDoador = coleta.cidadao?.nome;
        if (!nomeDoador || typeof nomeDoador !== 'string' || nomeDoador.trim() === '' || nomeDoador.toLowerCase().includes('erro')) {
          nomeDoador = 'Cidadão Doador';
        }

        const localNome = coleta.local_retirada?.nome || 'Fatec Franco da Rocha';
        const localRua = coleta.local_retirada?.rua || '';
        const localBairro = coleta.local_retirada?.bairro || '';
        const localCidade = coleta.local_retirada?.cidade || 'Franco da Rocha';
        const mapsQuery = `${localNome} ${localRua} ${localBairro} ${localCidade}`.trim();
        const fotoTag = coleta.foto_url
          ? `<div style="position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 4px; background: #f0f0f0;">
              <img src="${coleta.foto_url}" data-src="${coleta.foto_url}" alt="${tipoMaterial} (${coleta.quantidade || ''})" class="img-preview-material" style="width: 100%; height: 180px; object-fit: cover; border-radius: 12px; cursor: pointer; transition: transform 0.2s;" title="Clique para ampliar a foto do material">
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.65); color: #ffffff; padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; pointer-events: none; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Toque para ampliar
              </div>
            </div>`
          : '';

        card.innerHTML = `
          ${fotoTag}
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div>
              <span style="font-size: 0.78rem; font-weight: 800; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">
                <i class="fa-solid fa-recycle"></i> ${tipoMaterial}
              </span>
              <h3 style="color: var(--verde-escuro, #1b6d24); margin-top: 8px; font-size: 1.15rem; font-weight: 800;">${coleta.quantidade || 'Quantidade aproximada'}</h3>
            </div>
            <span style="font-size: 0.78rem; color: var(--cinza-texto-aux); font-weight: 600;">
              ${new Date(coleta.criado_em).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div style="font-size: 0.88rem; color: #444; background: #f9fbf9; padding: 12px; border-radius: 10px; border: 1px solid #e8f5e9; display: flex; flex-direction: column; gap: 4px;">
            <p style="margin: 0;"><strong><i class="fa-solid fa-location-dot" style="color: #2e7d32;"></i> Ponto de Retirada:</strong> ${localNome}</p>
            <p style="margin: 0;"><strong><i class="fa-solid fa-user" style="color: #0288d1;"></i> Ofertante (Cidadão):</strong> ${nomeDoador}</p>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
            <button type="button" class="btn-abrir-mapa btn-secondary-pill" data-local="${localNome}" data-endereco="${mapsQuery}" style="padding: 9px 14px; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #ffffff; border: 1.5px solid #2e7d32; color: #2e7d32; flex: 1;">
              <i class="fa-solid fa-map-location-dot" style="color: #2e7d32;"></i> Ver Ponto no Mapa
            </button>
            ${coleta.cidadao_id ? `
              <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-secondary-pill" style="padding: 9px 14px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; flex: 1;">
                <i class="fa-solid fa-comments"></i> Tirar Dúvidas com Ofertante
              </a>
            ` : ''}
          </div>

          <button class="btn-avancar btn-agendar" data-coleta-id="${coleta.cod_coleta}" data-local-id="${coleta.local_retirada_id}" style="padding: 12px; font-size: 0.95rem; width: 100%; margin-top: 4px;">
            <i class="fa-solid fa-calendar-plus"></i> ASSUMIR E AGENDAR COLETA
          </button>
        `;

        listaContainer.appendChild(card);
      });

      document.querySelectorAll('.img-preview-material').forEach(img => {
        img.addEventListener('click', (e) => {
          const src = e.currentTarget.getAttribute('data-src') || e.currentTarget.src;
          const alt = e.currentTarget.getAttribute('alt');
          abrirModalFoto(src, alt);
        });
      });

      document.querySelectorAll('.btn-abrir-mapa').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const localNome = e.currentTarget.getAttribute('data-local');
          const enderecoCompleto = e.currentTarget.getAttribute('data-endereco');
          abrirModalMapa(localNome, enderecoCompleto);
        });
      });

      document.querySelectorAll('.btn-agendar').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const coletaId = e.currentTarget.getAttribute('data-coleta-id');
          const localId = e.currentTarget.getAttribute('data-local-id');
          await abrirModalAgendamento(coletaId, localId);
        });
      });

    } catch (err) {
      console.error('Erro ao carregar coletas:', err);
      listaContainer.innerHTML = `<div class="feedback-msg error">Erro ao carregar materiais disponíveis.</div>`;
    }
  }

  function abrirModalFoto(url, titulo) {
    let modal = document.getElementById('modal-foto-preview');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-foto-preview';
      modal.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: none; align-items: center; justify-content: center; z-index: 9999; padding: 20px;';
      modal.innerHTML = `
        <div style="position: relative; max-width: 90vw; max-height: 90vh; display: flex; flex-direction: column; align-items: center;">
          <button id="btn-fechar-foto-modal" style="position: absolute; top: -45px; right: 0; background: none; border: none; color: #ffffff; font-size: 1.8rem; cursor: pointer; padding: 8px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
          <img id="img-modal-full" src="" alt="Foto do Material" style="max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <span id="txt-modal-titulo" style="color: #ffffff; margin-top: 12px; font-weight: 700; font-size: 1rem; text-align: center;"></span>
        </div>
      `;
      document.body.appendChild(modal);

      modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.closest('#btn-fechar-foto-modal')) {
          modal.style.display = 'none';
        }
      });
    }

    const imgFull = modal.querySelector('#img-modal-full');
    const txtTitulo = modal.querySelector('#txt-modal-titulo');
    if (imgFull) imgFull.src = url;
    if (txtTitulo) txtTitulo.textContent = titulo || 'Material Reciclável';
    modal.style.display = 'flex';
  }

  // Modal de Agendamento com Calendário Interativo e Escolha de Horário
  async function abrirModalAgendamento(coletaId, localId) {
    let modal = document.getElementById('modal-agendamento');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-agendamento';
      modal.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(3px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
      `;
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background: white; border-radius: 20px; padding: 24px; max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="color: var(--verde-escuro, #1b6d24); margin: 0; font-size: 1.2rem; font-weight: 800;">
            <i class="fa-solid fa-calendar-check"></i> Agendar Retirada de Material
          </h3>
          <button id="close-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--cinza-texto-aux);">✕</button>
        </div>

        <div id="agenda-calendar-picker">Carregando calendário...</div>

        <!-- Box de Confirmação e Escolha de Horário (Aparece após selecionar o dia) -->
        <div id="container-confirmar-agendamento" style="display: none; margin-top: 16px; background: #f9fbf9; padding: 16px; border-radius: 12px; border: 1.5px solid #a5d6a7;">
          <div style="font-size: 0.95rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); margin-bottom: 8px;">
            <i class="fa-solid fa-calendar-day" style="color: #2e7d32;"></i> Data Selecionada: <span id="lbl-data-selecionada" style="color: #0288d1;">--</span>
          </div>

          <div style="margin-top: 10px;">
            <label for="select-horario-retirada" style="font-size: 0.85rem; font-weight: 700; color: #333; display: block; margin-bottom: 4px;">
              <i class="fa-regular fa-clock"></i> Horário Previsto para Retirada:
            </label>
            <select id="select-horario-retirada" class="input-underline" style="font-weight: 700; cursor: pointer;">
              <option value="08:00">08:00 hs</option>
              <option value="08:30">08:30 hs</option>
              <option value="09:00" selected>09:00 hs</option>
              <option value="09:30">09:30 hs</option>
              <option value="10:00">10:00 hs</option>
              <option value="10:30">10:30 hs</option>
              <option value="11:00">11:00 hs</option>
              <option value="11:30">11:30 hs</option>
              <option value="12:00">12:00 hs</option>
              <option value="12:30">12:30 hs</option>
              <option value="13:00">13:00 hs</option>
              <option value="13:30">13:30 hs</option>
              <option value="14:00">14:00 hs</option>
              <option value="14:30">14:30 hs</option>
              <option value="15:00">15:00 hs</option>
              <option value="15:30">15:30 hs</option>
              <option value="16:00">16:00 hs</option>
              <option value="16:30">16:30 hs</option>
              <option value="17:00">17:00 hs</option>
            </select>
          </div>

          <button type="button" id="btn-confirmar-agendamento-final" class="btn-avancar" style="margin-top: 16px; width: 100%; font-size: 0.95rem;">
            <i class="fa-solid fa-check-circle"></i> CONFIRMAR AGENDAMENTO
          </button>
        </div>

        <div id="modal-feedback" class="feedback-msg" style="margin-top: 14px; display: none;"></div>
      </div>
    `;

    document.getElementById('close-modal').addEventListener('click', () => {
      modal.style.display = 'none';
    });

    modal.style.display = 'flex';

    let dataSelecionadaStr = null;

    try {
      const agendaData = await listarAgendaPorLocal(localId);

      renderCalendarGrid('agenda-calendar-picker', {
        agendaData,
        isAdmin: false,
        onSelectDay: (dateStr) => {
          dataSelecionadaStr = dateStr;
          const [ano, mes, dia] = dateStr.split('-');
          const dataFormatada = `${dia}/${mes}/${ano}`;

          const lblData = document.getElementById('lbl-data-selecionada');
          const boxConfirmar = document.getElementById('container-confirmar-agendamento');
          const modalFeedback = document.getElementById('modal-feedback');

          if (lblData) lblData.textContent = dataFormatada;
          if (boxConfirmar) boxConfirmar.style.display = 'block';
          if (modalFeedback) modalFeedback.style.display = 'none';
        }
      });

      const btnConfirmarFinal = document.getElementById('btn-confirmar-agendamento-final');
      btnConfirmarFinal.addEventListener('click', async () => {
        if (!dataSelecionadaStr) return;

        const modalFeedback = document.getElementById('modal-feedback');
        const selectHorario = document.getElementById('select-horario-retirada');
        const horaVal = selectHorario ? selectHorario.value : '09:00';

        try {
          btnConfirmarFinal.disabled = true;
          modalFeedback.textContent = 'Processando agendamento no sistema...';
          modalFeedback.className = 'feedback-msg success';
          modalFeedback.style.display = 'block';

          const itemAgenda = agendaData.find(a => a.data === dataSelecionadaStr && a.disponivel);

          // Chama RPC de agendamento ou atualiza diretamente
          let resErr = null;
          try {
            const { error } = await supabase.rpc('agendar_coleta', {
              p_coleta_id: coletaId,
              p_agenda_id: itemAgenda ? itemAgenda.id : null
            });
            if (error) resErr = error;
          } catch (e) {
            resErr = e;
          }

          // Fallback de atualização direta na tabela coleta caso o RPC tenha restrição
          if (resErr) {
            const { error: errUpdate } = await supabase
              .from('coleta')
              .update({
                catador_id: perfil.id,
                cod_status: 2,
                data: dataSelecionadaStr,
                hora: horaVal,
                atualizado_em: new Date().toISOString()
              })
              .eq('cod_coleta', coletaId);

            if (errUpdate) throw errUpdate;
          }

          const [ano, mes, dia] = dataSelecionadaStr.split('-');
          showSuccess(`Coleta agendada com sucesso para ${dia}/${mes}/${ano} às ${horaVal}!`);
          modal.style.display = 'none';

          setTimeout(() => {
            window.location.href = './minhas-coletas.html';
          }, 1200);

        } catch (err) {
          console.error('Erro no agendamento:', err);
          modalFeedback.textContent = err.message || 'Erro ao agendar a coleta.';
          modalFeedback.className = 'feedback-msg error';
          modalFeedback.style.display = 'block';
          btnConfirmarFinal.disabled = false;
        }
      });

    } catch (err) {
      console.error(err);
    }
  }

  function showError(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg error';
  }

  function showSuccess(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg success';
  }

  await carregarLista();

  assinarColetasEmTempoReal(() => {
    carregarLista();
  });
});

function abrirModalMapa(nomePonto, enderecoCompleto) {
  let modal = document.getElementById('modal-mapa');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-mapa';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(3px);
      z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px;
    `;
    document.body.appendChild(modal);
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;

  modal.innerHTML = `
    <div style="background: white; border-radius: 20px; padding: 20px; max-width: 640px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="color: var(--verde-escuro, #1b6d24); margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-map-location-dot" style="color: #2e7d32;"></i> ${nomePonto}
        </h3>
        <button id="close-mapa-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">✕</button>
      </div>

      <div style="font-size: 0.88rem; color: #555; background: #f9fbf9; padding: 10px 14px; border-radius: 10px; border: 1px solid #e8f5e9;">
        <i class="fa-solid fa-location-dot" style="color: #2e7d32;"></i> <strong>Endereço:</strong> ${enderecoCompleto}
      </div>

      <iframe 
        width="100%" 
        height="320" 
        style="border: 0; border-radius: 12px;" 
        loading="lazy" 
        allowfullscreen 
        src="${embedUrl}">
      </iframe>

      <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-top: 4px;">
        <a href="${mapsExternalUrl}" target="_blank" class="btn-secondary-pill" style="padding: 8px 16px; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; font-weight: 700; background: #ffffff; border: 1.5px solid #2e7d32; color: #2e7d32;">
          <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir no Google Maps App
        </a>
        <button id="btn-fechar-mapa" class="btn-avancar" style="width: auto; padding: 8px 20px; font-size: 0.85rem;">
          Fechar
        </button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const fechar = () => { modal.style.display = 'none'; };
  modal.querySelector('#close-mapa-modal').addEventListener('click', fechar);
  modal.querySelector('#btn-fechar-mapa').addEventListener('click', fechar);
}

