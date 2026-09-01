import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { 
  listarMinhasColetasCidadao, 
  listarMinhasColetasCatador, 
  listarTodasColetasAdmin, 
  confirmarRetirada, 
  reabrirColeta, 
  cancelarColeta 
} from '../services/coletas.js';
import { supabase } from '../lib/supabaseClient.js';
import { showConfirmModal, showAlertModal } from '../lib/modal.js';

async function init() {
  const listaContainer = document.getElementById('lista-minhas-coletas');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');

  // 1. Verificação de permissão autorizando Cidadão, Administrador e Catador
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador', 'catador']).catch(() => null);

  // 2. Carregamento da lista apropriada para o perfil
  await carregarLista(listaContainer, feedbackMsg, perfil);

  if (btnVoltar && perfil) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      redirecionarPorPerfil(perfil.tipo);
    });
  }
}

async function carregarLista(listaContainer, feedbackMsg, perfil) {
  if (!listaContainer) return;

  const tituloEl = document.getElementById('titulo_minhas_coletas');
  const subtituloEl = document.getElementById('subtitulo_minhas_coletas');
  const btnTopAcao = document.getElementById('btn_top_acao');
  const linkLeftEl = document.getElementById('link_left_minhas_coletas');

  if (perfil?.tipo === 'catador') {
    if (tituloEl) tituloEl.textContent = 'Minhas Coletas Atribuídas';
    if (subtituloEl) subtituloEl.textContent = 'Histórico e acompanhamento das coletas agendadas e retiradas';
    if (linkLeftEl) linkLeftEl.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Minhas Coletas';
    if (btnTopAcao) {
      btnTopAcao.href = './catador-materiais.html';
      btnTopAcao.innerHTML = '<i class="fa-solid fa-list-check"></i> Ver Materiais Disponíveis';
    }
  } else if (perfil?.tipo === 'cidadao') {
    if (tituloEl) tituloEl.textContent = 'Minhas Ofertas de Reciclagem';
    if (subtituloEl) subtituloEl.textContent = 'Histórico e acompanhamento dos seus materiais recicláveis';
    if (linkLeftEl) linkLeftEl.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Minhas Ofertas';
    if (btnTopAcao) {
      btnTopAcao.href = './inserir-material.html';
      btnTopAcao.innerHTML = '<i class="fa-solid fa-plus"></i> Nova Oferta';
    }
  } else if (perfil?.tipo === 'administrador') {
    if (tituloEl) tituloEl.textContent = 'Gestão de Coletas do Sistema';
    if (subtituloEl) subtituloEl.textContent = 'Visão geral de ofertas e agendamentos';
    if (linkLeftEl) linkLeftEl.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Todas as Coletas';
    if (btnTopAcao) {
      btnTopAcao.href = './gestao-coletas.html';
      btnTopAcao.innerHTML = '<i class="fa-solid fa-gears"></i> Painel de Gestão';
    }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      listaContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 20px; background: #ffffff; border-radius: 12px; border: 1.5px dashed #a5d6a7; margin-top: 0.5rem;">
          <i class="fa-solid fa-user-lock" style="font-size: 2rem; color: var(--verde-escuro, #1b6d24); margin-bottom: 10px;"></i>
          <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); margin-bottom: 6px;">
            Sessão não identificada
          </h3>
          <p style="font-size: 0.88rem; color: #666; margin-bottom: 16px;">
            Faça login com sua conta para acompanhar suas coletas.
          </p>
          <a href="./login.html" class="btn-avancar" style="display: inline-flex; width: auto; padding: 10px 24px; text-decoration: none; font-size: 0.9rem;">
            <i class="fa-solid fa-right-to-bracket"></i> Entrar na Conta
          </a>
        </div>
      `;
      return;
    }

    const éCatador = perfil?.tipo === 'catador';
    const éAdmin = perfil?.tipo === 'administrador';
    let coletas = [];

    try {
      if (éCatador) {
        coletas = await listarMinhasColetasCatador();
      } else if (éAdmin) {
        coletas = await listarTodasColetasAdmin('todos');
      } else {
        coletas = await listarMinhasColetasCidadao();
      }
    } catch (e) {
      console.warn('Erro ao consultar coletas:', e);
    }

    const todasColetas = Array.isArray(coletas) ? coletas : [];
    let filtroStatusAtivo = 'todos';

    const toolbarFiltros = document.getElementById('filtros_status_coletas');
    if (toolbarFiltros) {
      const countAgendadas = todasColetas.filter(c => (c.status?.status || '').toLowerCase() === 'agendado').length;
      const countConcluidas = todasColetas.filter(c => ['retirado', 'concluído', 'concluido'].includes((c.status?.status || '').toLowerCase())).length;
      const countTodas = todasColetas.length;

      const btnTodas = toolbarFiltros.querySelector('[data-filtro="todos"]');
      const btnAgendadas = toolbarFiltros.querySelector('[data-filtro="agendadas"]');
      const btnConcluidas = toolbarFiltros.querySelector('[data-filtro="concluidas"]');

      if (btnTodas) btnTodas.innerHTML = `<i class="fa-solid fa-list-ul"></i> Todas (${countTodas})`;
      if (btnAgendadas) btnAgendadas.innerHTML = `<i class="fa-solid fa-calendar-check"></i> Agendadas (${countAgendadas})`;
      if (btnConcluidas) btnConcluidas.innerHTML = `<i class="fa-solid fa-circle-check"></i> Concluídas (${countConcluidas})`;

      toolbarFiltros.querySelectorAll('.btn-tab').forEach(btn => {
        btn.onclick = (e) => {
          filtroStatusAtivo = e.currentTarget.dataset.filtro;
          toolbarFiltros.querySelectorAll('.btn-tab').forEach(b => {
            if (b.dataset.filtro === filtroStatusAtivo) {
              b.className = 'btn-tab active';
            } else {
              b.className = 'btn-tab btn-secondary-pill';
            }
          });
          renderizarListaFiltrada();
        };
      });
    }

    function renderizarListaFiltrada() {
      let coletasFiltradas = todasColetas;
      if (filtroStatusAtivo === 'agendadas') {
        coletasFiltradas = todasColetas.filter(c => (c.status?.status || '').toLowerCase() === 'agendado');
      } else if (filtroStatusAtivo === 'concluidas') {
        coletasFiltradas = todasColetas.filter(c => ['retirado', 'concluído', 'concluido'].includes((c.status?.status || '').toLowerCase()));
      }

      if (coletasFiltradas.length === 0) {
        let msgVaziaTitle = éCatador 
          ? 'Você ainda não possui coletas atribuídas' 
          : (éAdmin ? 'Nenhuma coleta registrada no sistema' : 'Você ainda não disponibilizou materiais');
        let msgVaziaSub = éCatador 
          ? 'Consulte a lista de materiais disponíveis para agendar e recolher doações.' 
          : (éAdmin ? 'Novas ofertas cadastradas aparecerão aqui.' : 'Cadastre garrafas PET, papelão, vidro ou metal para os catadores recolherem.');

        if (filtroStatusAtivo === 'agendadas') {
          msgVaziaTitle = 'Nenhuma coleta agendada no momento';
          msgVaziaSub = 'Coletas pendentes de retirada aparecerão nesta lista assim que agendadas.';
        } else if (filtroStatusAtivo === 'concluidas') {
          msgVaziaTitle = 'Nenhuma coleta concluída ainda';
          msgVaziaSub = 'Materiais recolhidos e confirmados serão arquivados aqui.';
        }

        const btnLink = éCatador ? './catador-materiais.html' : './inserir-material.html';
        const btnTxt = éCatador ? 'Ver Materiais Disponíveis' : 'Disponibilizar Primeiro Material';

        listaContainer.innerHTML = `
          <div style="text-align: center; padding: 36px 20px; background: #ffffff; border-radius: 14px; border: 2px dashed #a5d6a7; margin-top: 0.5rem;">
            <div style="width: 52px; height: 52px; background: #e8f5e9; border-radius: 50%; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 1.5rem;">
              <i class="fa-solid fa-box-open"></i>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); margin-bottom: 6px;">
              ${msgVaziaTitle}
            </h3>
            <p style="font-size: 0.88rem; color: #555; margin-bottom: 18px; font-weight: 600;">
              ${msgVaziaSub}
            </p>
            ${(!éAdmin && filtroStatusAtivo === 'todos') ? `
              <a href="${btnLink}" class="btn-avancar" style="display: inline-flex; width: auto; padding: 10px 24px; text-decoration: none; justify-content: center; font-size: 0.9rem;">
                <i class="fa-solid fa-list-check"></i> ${btnTxt}
              </a>
            ` : ''}
          </div>
        `;
        return;
      }

      listaContainer.innerHTML = '';
      coletasFiltradas.forEach(coleta => {
        const card = document.createElement('div');
        card.style.cssText = `
          background: #ffffff;
          border-radius: 14px;
          padding: 16px 18px;
          border: 1px solid #c8e6c9;
          box-shadow: 0 3px 8px rgba(0,0,0,0.04);
          display: flex;
          flex-direction: column;
          gap: 10px;
        `;

        const tipoMaterial = coleta.materiais?.tipo || 'Material Reciclável';
        const stNome = coleta.status?.status || 'disponível';
        const catadorNome = coleta.catador?.nome || 'Pendente de agendamento';
        
        let doadorNome = coleta.cidadao?.nome;
        if (!doadorNome || typeof doadorNome !== 'string' || doadorNome.trim() === '' || doadorNome.toLowerCase().includes('erro')) {
          doadorNome = 'Cidadão Doador';
        }

        const dataCriacao = coleta.criado_em ? new Date(coleta.criado_em) : null;
        const dataFormatada = dataCriacao && !isNaN(dataCriacao.getTime())
          ? dataCriacao.toLocaleDateString('pt-BR')
          : '';
        const dataAgendada = coleta.data
          ? `${new Date(coleta.data + 'T00:00:00').toLocaleDateString('pt-BR')}${coleta.hora ? ` às ${coleta.hora.slice(0,5)}` : ''}`
          : null;

        const doadorTel = '';
        const localNome = coleta.local_retirada?.nome || 'Fatec Franco da Rocha';
        const loc = coleta.local_retirada || {};

        const partesEndereco = [];
        if (loc.rua) {
          partesEndereco.push(loc.numero ? `${loc.rua}, ${loc.numero}` : loc.rua);
        }
        if (loc.complemento) {
          partesEndereco.push(`(${loc.complemento})`);
        }
        if (loc.bairro) {
          partesEndereco.push(loc.bairro);
        }
        if (loc.cidade) {
          partesEndereco.push(loc.estado ? `${loc.cidade} - ${loc.estado}` : loc.cidade);
        }
        if (loc.cep) {
          partesEndereco.push(`CEP: ${loc.cep}`);
        }

        const enderecoCompleto = partesEndereco.length > 0 
          ? partesEndereco.join(', ') 
          : `${localNome}, Franco da Rocha - SP`;

        let badgeCor = '#e8f5e9';
        let badgeTexto = '#1b5e20';

        if (stNome === 'agendado') { badgeCor = '#fff8e1'; badgeTexto = '#b78103'; }
        else if (stNome === 'retirado' || stNome === 'concluído') { badgeCor = '#e8f5e9'; badgeTexto = '#1b5e20'; }
        else if (stNome === 'cancelado') { badgeCor = '#ffebee'; badgeTexto = '#c62828'; }

        let acoesHtml = '';
        if (éCatador) {
          if (stNome === 'agendado') {
            acoesHtml = `
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                <button type="button" class="btn-abrir-mapa btn-secondary-pill" data-local="${localNome}" data-endereco="${enderecoCompleto}" style="height: 38px; padding: 0 10px; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #ffffff; border: 1.5px solid #2e7d32; color: #2e7d32; flex: 1; white-space: nowrap; box-sizing: border-box;">
                  <i class="fa-solid fa-map-location-dot" style="color: #2e7d32;"></i> Ver no Mapa
                </button>
                ${coleta.cidadao_id ? `
                  <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-secondary-pill" style="height: 38px; padding: 0 10px; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; flex: 1; white-space: nowrap; box-sizing: border-box;">
                    <i class="fa-solid fa-comments"></i> Tirar Dúvidas
                  </a>
                ` : ''}
                <button type="button" class="btn-desistir-agendamento btn-secondary-pill" data-id="${coleta.cod_coleta}" style="height: 38px; padding: 0 16px; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #fff5f5; border: 1.5px solid #ef9a9a; color: #c62828; width: 100%; border-radius: 999px; white-space: nowrap; box-sizing: border-box;">
                  <i class="fa-solid fa-calendar-xmark"></i> Cancelar Agendamento
                </button>
              </div>
            `;
          } else if (stNome === 'retirado' || stNome === 'concluído') {
            acoesHtml = `
              <div style="font-size: 0.85rem; color: #2e7d32; font-weight: 800; background: #e8f5e9; padding: 8px 12px; border-radius: 8px; display: inline-flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-circle-check"></i> Coleta Retirada e Concluída
              </div>
            `;
          }
        } else {
          if (stNome === 'agendado') {
            acoesHtml = `
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button class="btn-confirmar" data-id="${coleta.cod_coleta}" style="padding: 8px 16px; font-size: 0.82rem; background: var(--verde-escuro, #1b6d24); color: #ffffff; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; flex: 1;">
                  Confirmar Retirada
                </button>
                <button class="btn-reabrir" data-id="${coleta.cod_coleta}" style="padding: 8px 16px; font-size: 0.82rem; background: #ffffff; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; border-radius: 999px; font-weight: 700; cursor: pointer; flex: 1;">
                  Reabrir
                </button>
              </div>
            `;
          } else if (stNome === 'disponível') {
            acoesHtml = `
              <button class="btn-cancelar" data-id="${coleta.cod_coleta}" style="padding: 8px 18px; font-size: 0.85rem; background-color: #ef5350 !important; color: #ffffff !important; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; box-shadow: 0 2px 6px rgba(239,83,80,0.3); transition: all 0.2s ease;">
                <i class="fa-solid fa-xmark" style="color: #ffffff !important;"></i> Cancelar Oferta
              </button>
            `;
          } else if (stNome === 'cancelado') {
            acoesHtml = `
              <button class="btn-reabrir" data-id="${coleta.cod_coleta}" style="padding: 8px 18px; font-size: 0.85rem; background-color: var(--verde-escuro, #1b6d24) !important; color: #ffffff !important; border: none; border-radius: 999px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; width: fit-content; box-shadow: 0 2px 6px rgba(27,109,36,0.3); transition: all 0.2s ease;">
                <i class="fa-solid fa-rotate-left" style="color: #ffffff !important;"></i> Redisponibilizar Oferta
              </button>
            `;
          }
        }

        const fotoTag = (coleta.foto_url && coleta.foto_url.trim() !== '')
          ? `<div style="position: relative; overflow: hidden; border-radius: 12px; margin-bottom: 6px; background: #e8f5e9; border: 1.5px solid #a5d6a7;">
              <img src="${coleta.foto_url}" data-src="${coleta.foto_url}" alt="${tipoMaterial} (${coleta.quantidade || ''})" class="img-preview-material" style="width: 100%; height: 170px; object-fit: cover; border-radius: 10px; cursor: pointer; transition: transform 0.2s;" title="Clique para ampliar a foto do material" onerror="this.parentElement.innerHTML='<div style=\\'padding: 10px; text-align: center; color: #666; font-size: 0.8rem;\\'><i class=\\'fa-regular fa-image\\'></i> Imagem não disponível</div>';">
              <div style="position: absolute; top: 6px; left: 6px; background: rgba(27,109,36,0.85); color: #ffffff; padding: 3px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-camera"></i> Foto Anexada
              </div>
              <div style="position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.7); color: #ffffff; padding: 3px 8px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; pointer-events: none; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar
              </div>
            </div>`
          : `<div style="display: flex; align-items: center; gap: 8px; background: #f8faf8; border: 1px dashed #c8e6c9; border-radius: 10px; padding: 8px 12px; color: #777; font-size: 0.8rem; margin-bottom: 6px;">
               <i class="fa-regular fa-image" style="color: #a5d6a7; font-size: 1rem;"></i>
               <span>Sem foto anexada</span>
             </div>`;

        card.innerHTML = `
          ${fotoTag}
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px;">
            <strong style="color: var(--verde-escuro, #1b6d24); font-size: 1.05rem;">${tipoMaterial} — ${coleta.quantidade || 'Aproximada'}</strong>
            <span style="font-size: 0.75rem; font-weight: 800; background: ${badgeCor}; color: ${badgeTexto}; padding: 4px 10px; border-radius: 8px; text-transform: uppercase;">
              ${stNome}
            </span>
          </div>

          <div style="font-size: 0.88rem; color: #444; display: flex; flex-direction: column; gap: 4px; background: #f9fbf9; padding: 10px 14px; border-radius: 8px; border: 1px solid #e8f5e9;">
            <span><strong><i class="fa-solid fa-location-dot" style="color: #2e7d32;"></i> Local de Retirada:</strong> ${localNome}</span>
            <span style="font-size: 0.82rem; color: #555;"><strong><i class="fa-solid fa-map-pin" style="color: #777;"></i> Endereço:</strong> ${enderecoCompleto}</span>
            ${éCatador ? `<span><strong><i class="fa-solid fa-user" style="color: #0288d1;"></i> Ofertante:</strong> ${doadorNome}${doadorTel}</span>` : `<span><strong><i class="fa-solid fa-id-card" style="color: #2e7d32;"></i> Catador Atribuído:</strong> ${catadorNome}</span>`}
            ${dataAgendada ? `<span style="font-size: 0.82rem; color: #b78103; font-weight: 700;"><i class="fa-regular fa-calendar-check"></i> Agendado para: ${dataAgendada}</span>` : ''}
            ${dataFormatada ? `<span style="font-size: 0.8rem; color: #777;">Data da Oferta: ${dataFormatada}</span>` : ''}
          </div>

          ${acoesHtml}
        `;

        listaContainer.appendChild(card);
      });

      // Reconecta os ouvintes de eventos
      vincularEventosCards(listaContainer, feedbackMsg, perfil);
    }

    renderizarListaFiltrada();

  } catch (err) {
    console.error('Erro ao carregar ofertas:', err);
    listaContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #666; font-size: 0.9rem;">
        Não foi possível carregar as ofertas no momento.
      </div>
    `;
  }
}

function vincularEventosCards(listaContainer, feedbackMsg, perfil) {
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

  document.querySelectorAll('.btn-confirmar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      showConfirmModal({
        title: 'Confirmar Retirada',
        message: 'Confirma que o material reciclável já foi recolhido do ponto de retirada?',
        confirmText: 'Sim, Confirmar Retirada',
        cancelText: 'Voltar',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 1.25rem;"></i>',
        onConfirm: async () => {
          try {
            await confirmarRetirada(id);
            showSuccess(feedbackMsg, 'Retirada confirmada com sucesso!');
            carregarLista(listaContainer, feedbackMsg, perfil);
          } catch (err) {
            showError(feedbackMsg, 'Erro: ' + err.message);
          }
        }
      });
    });
  });

  document.querySelectorAll('.btn-reabrir').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      showConfirmModal({
        title: 'Redisponibilizar Oferta',
        message: 'Deseja redisponibilizar esta oferta para que os catadores possam agendá-la?',
        confirmText: 'Sim, Redisponibilizar',
        cancelText: 'Voltar',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-solid fa-rotate-left" style="color: #2e7d32; font-size: 1.25rem;"></i>',
        onConfirm: async () => {
          try {
            await reabrirColeta(id);
            showSuccess(feedbackMsg, 'Oferta redisponibilizada com sucesso!');
            carregarLista(listaContainer, feedbackMsg, perfil);
          } catch (err) {
            showError(feedbackMsg, 'Erro ao redisponibilizar: ' + err.message);
          }
        }
      });
    });
  });

  document.querySelectorAll('.btn-cancelar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      showConfirmModal({
        title: 'Cancelar Oferta',
        message: 'Tem certeza que deseja cancelar esta oferta de material reciclável?',
        confirmText: 'Sim, Cancelar Oferta',
        cancelText: 'Voltar',
        confirmColor: '#c62828',
        icon: '<i class="fa-solid fa-triangle-exclamation" style="color: #c62828; font-size: 1.25rem;"></i>',
        onConfirm: async () => {
          try {
            await cancelarColeta(id);
            showSuccess(feedbackMsg, 'Oferta cancelada com sucesso.');
            carregarLista(listaContainer, feedbackMsg, perfil);
          } catch (err) {
            showError(feedbackMsg, 'Erro ao cancelar: ' + err.message);
          }
        }
      });
    });
  });

  document.querySelectorAll('.btn-desistir-agendamento').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      showConfirmModal({
        title: 'Cancelar Agendamento',
        message: 'Não conseguirá comparecer para retirar este material?\n\nAo cancelar seu agendamento, a coleta ficará disponível imediatamente para que outros catadores possam agendá-la.',
        confirmText: 'Sim, Cancelar Agendamento',
        cancelText: 'Voltar',
        confirmColor: '#c62828',
        icon: '<i class="fa-solid fa-calendar-xmark" style="color: #c62828; font-size: 1.25rem;"></i>',
        onConfirm: async () => {
          try {
            await reabrirColeta(id);
            showSuccess(feedbackMsg, 'Agendamento cancelado. O material foi liberado para outros catadores.');
            carregarLista(listaContainer, feedbackMsg, perfil);
          } catch (err) {
            showError(feedbackMsg, 'Erro ao cancelar agendamento: ' + err.message);
          }
        }
      });
    });
  });
}

function showError(feedbackMsg, msg) {
  if (!feedbackMsg) return;
  feedbackMsg.textContent = msg;
  feedbackMsg.className = 'feedback-msg error';
}

function showSuccess(feedbackMsg, msg) {
  if (!feedbackMsg) return;
  feedbackMsg.textContent = msg;
  feedbackMsg.className = 'feedback-msg success';
}

function abrirModalMapa(nomePonto, enderecoCompleto) {
  showAlertModal({
    title: 'Funcionalidade Futura',
    message: `A visualização e rotas interativas no mapa estarão disponíveis em versões futuras.\n\nLocal de Coleta: ${nomePonto}\nEndereço: ${enderecoCompleto}`,
    buttonText: 'Entendido',
    confirmColor: '#1b6d24',
    icon: '<i class="fa-solid fa-map-location-dot" style="color: var(--verde-escuro, #1b6d24); font-size: 1.25rem;"></i>'
  });

  /*
  // Código preservado para integração futura com mapas / embed:
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(enderecoCompleto)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const mapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto)}`;
  // ...
  */
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

// Inicialização imediata / resiliente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
