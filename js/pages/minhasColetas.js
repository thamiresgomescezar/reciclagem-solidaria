import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { 
  listarMinhasColetasCidadao, 
  listarMinhasColetasCatador, 
  listarTodasColetasAdmin, 
  cancelarAgendamento,
  listarCatadoresParaVincular,
  vincularCatadorColeta,
  getStatusDisponiveis,
  atualizarStatusColeta,
  atualizarColetaCompleta,
  listarLocaisRetirada,
  resolverStatusColeta
} from '../services/coletas.js';
import { supabase } from '../lib/supabaseClient.js';
import { showConfirmModal, showAlertModal } from '../lib/modal.js';
import { abrirModalEdicaoColeta, confirmarRetiradaComModal, abrirModalAtribuirCatador } from '../lib/modalColeta.js';

async function init() {
  const listaContainer = document.getElementById('lista-minhas-coletas');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');

  // 1. Verificação de permissão autorizando Cidadão, Administrador e Catador
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador', 'catador']).catch(() => null);
  if (!perfil) return;

  // 2. Carregamento da lista apropriada para o perfil
  await carregarLista(listaContainer, feedbackMsg, perfil);

  if (btnVoltar && perfil) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      redirecionarPorPerfil(perfil.tipo);
    });
  }
}

async function carregarLista(listaContainer, feedbackMsg, perfil, filtroDesejado = 'todos') {
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
    if (tituloEl) tituloEl.textContent = 'Histórico de Coletas';
    if (subtituloEl) subtituloEl.textContent = 'Gerencie o status, edite informações, reagende ou confirme a retirada';
    if (linkLeftEl) linkLeftEl.innerHTML = '<i class="fa-solid fa-clipboard-check"></i> Histórico de Coletas';
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
    let catadores = [];
    let listaStatus = [];
    let locaisRetirada = [];

    try {
      if (éCatador) {
        coletas = await listarMinhasColetasCatador().catch(err => {
          console.error('Erro ao consultar coletas do catador:', err);
          return [];
        });
      } else if (éAdmin) {
        const [cols, cats, stats, locs] = await Promise.all([
          listarTodasColetasAdmin('todos').catch(err => {
            console.error('Erro ao consultar coletas admin:', err);
            return [];
          }),
          listarCatadoresParaVincular().catch(() => []),
          getStatusDisponiveis().catch(() => []),
          listarLocaisRetirada().catch(() => [])
        ]);
        coletas = cols;
        catadores = cats;
        listaStatus = stats;
        locaisRetirada = locs;
      } else {
        // Cidadão: lista somente as coletas que ele mesmo disponibilizou
        const [cols, cats, stats, locs] = await Promise.all([
          listarMinhasColetasCidadao().catch(err => {
            console.error('Erro ao consultar coletas do cidadão:', err);
            return [];
          }),
          listarCatadoresParaVincular().catch(() => []),
          getStatusDisponiveis().catch(() => []),
          listarLocaisRetirada().catch(() => [])
        ]);
        coletas = cols;
        catadores = cats;
        listaStatus = stats;
        locaisRetirada = locs;
      }
    } catch (e) {
      console.warn('Erro ao consultar coletas e dados de apoio:', e);
    }

    const todasColetas = Array.isArray(coletas) ? coletas : [];
    let filtroStatusAtivo = (filtroDesejado || 'todos').toLowerCase();

    const toolbarFiltros = document.getElementById('filtros_status_coletas');
    if (toolbarFiltros) {
      const countTodas = todasColetas.length;
      const contagemPorCodigo = {};
      const contagemPorNome = {};

      todasColetas.forEach(c => {
        const st = resolverStatusColeta(c);
        const cod = st.codigo || c.cod_status;
        const nome = (st.nome || '').toLowerCase();
        contagemPorCodigo[cod] = (contagemPorCodigo[cod] || 0) + 1;
        contagemPorNome[nome] = (contagemPorNome[nome] || 0) + 1;
      });

      // Lista de status a exibir na toolbar: se listaStatus existir e tiver itens, usa ela; senão usa padrão
      const statusListaEfetiva = (listaStatus && listaStatus.length > 0) ? listaStatus : [
        { cod_status: 1, status: 'disponível' },
        { cod_status: 2, status: 'agendado' },
        { cod_status: 3, status: 'retirado' },
        { cod_status: 4, status: 'cancelado' }
      ];

      let tabsHtml = `
        <button type="button" class="btn-tab ${filtroStatusAtivo === 'todos' ? 'active' : ''}" data-filtro="todos" data-status="todos">
          <i class="fa-solid fa-layer-group"></i> Todas (${countTodas})
        </button>
      `;

      statusListaEfetiva.forEach(st => {
        const cod = st.cod_status;
        const stNomeLower = (st.status || '').toLowerCase().trim();
        let icon = '<i class="fa-solid fa-tag"></i>';
        let nomeDisplay = st.status.charAt(0).toUpperCase() + st.status.slice(1);

        if (/cancel/i.test(stNomeLower)) {
          icon = '<i class="fa-solid fa-ban"></i>';
          nomeDisplay = 'Canceladas';
        } else if (/(retirad|conclu)/i.test(stNomeLower)) {
          icon = '<i class="fa-solid fa-circle-check"></i>';
          nomeDisplay = 'Retiradas';
        } else if (/reagend/i.test(stNomeLower)) {
          icon = '<i class="fa-solid fa-calendar-days"></i>';
          nomeDisplay = 'Reagendadas';
        } else if (/agend/i.test(stNomeLower)) {
          icon = '<i class="fa-solid fa-calendar-check"></i>';
          nomeDisplay = 'Agendadas';
        } else if (/dispon/i.test(stNomeLower)) {
          icon = '<i class="fa-solid fa-clock"></i>';
          nomeDisplay = 'Disponíveis';
        }

        // Calcula contagem com suporte a canceladas (cod 4 e 5) e compatibilidade de nome
        let count = contagemPorCodigo[cod] || 0;
        if (/cancel/i.test(stNomeLower)) {
          count = (contagemPorCodigo[4] || 0) + (contagemPorCodigo[5] || 0);
        } else if (count === 0 && contagemPorNome[stNomeLower]) {
          count = contagemPorNome[stNomeLower];
        }

        const ehAtivo = filtroStatusAtivo === String(cod) || filtroStatusAtivo === stNomeLower;
        tabsHtml += `
          <button type="button" class="btn-tab ${ehAtivo ? 'active' : ''}" data-filtro="${cod}" data-status="${cod}" data-nome="${stNomeLower}">
            ${icon} ${nomeDisplay} (${count})
          </button>
        `;
      });

      toolbarFiltros.innerHTML = tabsHtml;

      // Função que sincroniza visualmente a classe 'active' nos botões de filtro
      const sincronizarBotoesFiltro = (filtroAlvo) => {
        const fKey = (filtroAlvo || 'todos').toLowerCase();
        toolbarFiltros.querySelectorAll('.btn-tab').forEach(b => {
          const bFiltro = (b.dataset.filtro || '').toLowerCase();
          const bStatus = (b.dataset.status || '').toLowerCase();
          const bNome = (b.dataset.nome || '').toLowerCase();
          const ehAtivo = (bFiltro === fKey || bStatus === fKey || bNome === fKey) || 
                          (fKey === 'todos' && (bFiltro === 'todos' || !bFiltro));
          if (ehAtivo) {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });
      };

      sincronizarBotoesFiltro(filtroStatusAtivo);

      toolbarFiltros.querySelectorAll('.btn-tab').forEach(btn => {
        btn.onclick = (e) => {
          filtroStatusAtivo = (e.currentTarget.dataset.filtro || e.currentTarget.dataset.nome || 'todos').toLowerCase();
          sincronizarBotoesFiltro(filtroStatusAtivo);
          renderizarListaFiltrada();
        };
      });
    }

    function renderizarListaFiltrada() {
      let coletasFiltradas = todasColetas;
      const f = (filtroStatusAtivo || 'todos').toLowerCase().trim();
      const codFiltroNum = parseInt(f, 10);

      if (f !== 'todos') {
        coletasFiltradas = todasColetas.filter(c => {
          const st = resolverStatusColeta(c);
          if (!isNaN(codFiltroNum) && (st.codigo === codFiltroNum || c.cod_status === codFiltroNum)) return true;
          if (f.includes('dispon')) return st.ehDisponivel;
          if (f === 'agendado' || f === 'agendadas' || f === 'agendada') return st.ehAgendada && st.codigo !== 6;
          if (f.includes('retirad') || f.includes('conclu')) return st.ehRetirada;
          if (f.includes('cancel')) return st.ehCancelada;
          if (f.includes('reagend')) return st.codigo === 6 || st.nome.includes('reagend');
          return st.nome.toLowerCase() === f || String(st.codigo) === f;
        });
      }

      if (coletasFiltradas.length === 0) {
        let msgVaziaTitle = '';
        let msgVaziaSub = '';

        if (f.includes('dispon') || f === '1') {
          msgVaziaTitle = 'Nenhuma coleta disponível';
          msgVaziaSub = éCatador 
            ? 'Não há coletas disponíveis na sua lista com este status.' 
            : 'Você não possui materiais com status disponível no momento.';
        } else if (f.includes('reagend') || f === '6') {
          msgVaziaTitle = 'Nenhuma coleta reagendada';
          msgVaziaSub = 'Não há ofertas reagendadas no momento.';
        } else if (f.includes('agend') || f === '2') {
          msgVaziaTitle = 'Nenhuma coleta agendada';
          msgVaziaSub = éCatador 
            ? 'Você não possui coletas agendadas para recolhimento.' 
            : 'Nenhuma de suas ofertas está agendada no momento.';
        } else if (f.includes('retirad') || f.includes('conclu') || f === '3') {
          msgVaziaTitle = 'Nenhuma coleta retirada';
          msgVaziaSub = 'Materiais recolhidos e confirmados aparecerão aqui.';
        } else if (f.includes('cancel') || f === '4' || f === '5') {
          msgVaziaTitle = 'Nenhuma coleta cancelada';
          msgVaziaSub = 'Coletas canceladas ficam arquivadas aqui para consulta.';
        } else {
          msgVaziaTitle = 'Nenhuma coleta com este status';
          msgVaziaSub = 'Não há registros vinculados a este filtro no momento.';
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
            ${(!éAdmin && f === 'todos') ? `
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
        const catadorNome = coleta.catador?.nome || 'Nenhum (Disponível)';
        
        let doadorNome = coleta.cidadao?.nome;
        if (!doadorNome || typeof doadorNome !== 'string' || doadorNome.trim() === '' || doadorNome.toLowerCase().includes('erro')) {
          doadorNome = 'Cidadão Doador';
        }

        const dataCriacao = coleta.criado_em ? new Date(coleta.criado_em) : null;
        const dataFormatada = dataCriacao && !isNaN(dataCriacao.getTime())
          ? dataCriacao.toLocaleDateString('pt-BR')
          : '';
        // 1. Data e Horário para Agendada (Previsão combinada)
        let dataHoraAgendadaFormatada = '';
        if (coleta.data) {
          const partesData = coleta.data.slice(0, 10).split('-');
          const dataPtBr = partesData.length === 3 ? `${partesData[2]}/${partesData[1]}/${partesData[0]}` : coleta.data;
          const horaPtBr = coleta.hora ? coleta.hora.slice(0, 5) : '';
          dataHoraAgendadaFormatada = horaPtBr ? `${dataPtBr} às ${horaPtBr}` : dataPtBr;
        }

        // 2. Data e Horário para Retirada (Momento em que o material foi recolhido)
        let dataHoraRetiradaFormatada = '';
        if (coleta.data) {
          const partesData = coleta.data.slice(0, 10).split('-');
          const dataPtBr = partesData.length === 3 ? `${partesData[2]}/${partesData[1]}/${partesData[0]}` : coleta.data;
          const horaPtBr = coleta.hora ? coleta.hora.slice(0, 5) : '';
          dataHoraRetiradaFormatada = horaPtBr ? `${dataPtBr} às ${horaPtBr}` : dataPtBr;
        } else if (coleta.atualizado_em) {
          const dt = new Date(coleta.atualizado_em);
          if (!isNaN(dt.getTime())) {
            const dStr = String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
            const hStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
            dataHoraRetiradaFormatada = `${dStr} às ${hStr}`;
          }
        } else if (coleta.criado_em) {
          const dt = new Date(coleta.criado_em);
          if (!isNaN(dt.getTime())) {
            const dStr = String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
            const hStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
            dataHoraRetiradaFormatada = `${dStr} às ${hStr}`;
          }
        }

        // 3. Data e Horário para Cancelamento (Momento em que foi cancelada)
        let dataHoraCanceladaFormatada = '';
        if (coleta.atualizado_em) {
          const dt = new Date(coleta.atualizado_em);
          if (!isNaN(dt.getTime())) {
            const dStr = String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
            const hStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
            dataHoraCanceladaFormatada = `${dStr} às ${hStr}`;
          }
        } else if (coleta.criado_em) {
          const dt = new Date(coleta.criado_em);
          if (!isNaN(dt.getTime())) {
            const dStr = String(dt.getDate()).padStart(2, '0') + '/' + String(dt.getMonth() + 1).padStart(2, '0') + '/' + dt.getFullYear();
            const hStr = String(dt.getHours()).padStart(2, '0') + ':' + String(dt.getMinutes()).padStart(2, '0');
            dataHoraCanceladaFormatada = `${dStr} às ${hStr}`;
          }
        }

        const localNome = coleta.local_retirada?.nome || 'Fatec Franco da Rocha';
        const loc = coleta.local_retirada || {};

        const partesEndereco = [];
        if (loc.rua) partesEndereco.push(loc.numero ? `${loc.rua}, ${loc.numero}` : loc.rua);
        if (loc.complemento) partesEndereco.push(`(${loc.complemento})`);
        if (loc.bairro) partesEndereco.push(loc.bairro);
        if (loc.cidade) partesEndereco.push(loc.estado ? `${loc.cidade} - ${loc.estado}` : loc.cidade);
        if (loc.cep) partesEndereco.push(`CEP: ${loc.cep}`);

        const enderecoCompleto = partesEndereco.length > 0 
          ? partesEndereco.join(', ') 
          : `${localNome}, Franco da Rocha - SP`;

        const statusInfo = resolverStatusColeta(coleta);
        const ehRetirada = statusInfo.ehRetirada;
        const ehAgendada = statusInfo.ehAgendada;
        const ehCancelada = statusInfo.ehCancelada;
        const ehDisponivel = statusInfo.ehDisponivel;

        let badgeCor = '#e8f5e9';
        let badgeTexto = '#1b5e20';
        let stFormatado = statusInfo.rotulo;

        if (ehAgendada) {
          badgeCor = '#fff8e1';
          badgeTexto = '#b78103';
        } else if (ehRetirada) {
          badgeCor = '#e8f5e9';
          badgeTexto = '#1b5e20';
        } else if (ehCancelada) {
          badgeCor = '#ffebee';
          badgeTexto = '#c62828';
        }

        let acoesHtml = '';
        if (éCatador) {
          if (ehAgendada) {
            acoesHtml = `
              <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; padding-top: 10px; border-top: 1px solid #edf2ed;">
                <button type="button" class="btn-abrir-mapa btn-secondary-pill" data-local="${localNome}" data-endereco="${enderecoCompleto}" style="height: 38px; padding: 0 12px; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #ffffff; border: 1.5px solid #2e7d32; color: #2e7d32; flex: 1; white-space: nowrap; box-sizing: border-box; border-radius: 999px;">
                  <i class="fa-solid fa-map-location-dot" style="color: #2e7d32;"></i> Ver no Mapa
                </button>
                ${coleta.cidadao_id ? `
                  <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-secondary-pill" style="height: 38px; padding: 0 12px; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; flex: 1; white-space: nowrap; box-sizing: border-box; border-radius: 999px;">
                    <i class="fa-solid fa-comments"></i> Conversar
                  </a>
                ` : ''}
                <button type="button" class="btn-desistir-agendamento btn-secondary-pill" data-id="${coleta.cod_coleta}" style="height: 38px; padding: 0 16px; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #fff5f5; border: 1.5px solid #ef9a9a; color: #c62828; width: 100%; border-radius: 999px; white-space: nowrap; box-sizing: border-box;">
                  <i class="fa-solid fa-calendar-xmark"></i> Cancelar Agendamento
                </button>
              </div>
            `;
          } else if (ehRetirada) {
            acoesHtml = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #edf2ed;">
                <div style="font-size: 0.82rem; color: #2e7d32; font-weight: 800; background: #e8f5e9; padding: 6px 12px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-circle-check"></i> Coleta Concluída
                </div>
                ${coleta.cidadao_id ? `
                  <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-secondary-pill" style="height: 32px; padding: 0 12px; font-size: 0.78rem; text-decoration: none; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; background: #ffffff; color: var(--verde-escuro, #1b6d24); border: 1px solid #a5d6a7; border-radius: 999px;">
                    <i class="fa-solid fa-comments"></i> Mensagens
                  </a>
                ` : ''}
              </div>
            `;
          } else if (ehCancelada) {
            acoesHtml = `
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #edf2ed;">
                <div style="font-size: 0.82rem; color: #c62828; font-weight: 800; background: #ffebee; padding: 6px 12px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-ban"></i> Coleta Cancelada
                </div>
                <button type="button" class="btn-editar-coleta" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: #555; border: 1px solid #ccc; border-radius: 999px; padding: 6px 14px; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-eye"></i> Detalhes
                </button>
              </div>
            `;
          }
        } else {
          // CIDADÃO (ou Admin): Ações contextuais limpas e diretas
          const catadorAuthId = coleta.catador?.auth_user_id || (coleta.catador?.id ? coleta.catador.id : null);
          acoesHtml = `
            <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center; justify-content: flex-end; margin-top: 10px; padding-top: 10px; border-top: 1px solid #edf2ed;">
              ${ehAgendada ? `
                <button type="button" class="btn-confirmar-retirada" data-id="${coleta.cod_coleta}" data-catador="${coleta.catador_id || ''}" style="background: var(--verde-escuro, #1b6d24); color: white; border: none; border-radius: 999px; padding: 9px 18px; font-weight: 700; font-size: 0.84rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(27,109,36,0.25);">
                  <i class="fa-solid fa-circle-check"></i> Confirmar Retirada
                </button>
                <button type="button" class="btn-atribuir-catador" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; border-radius: 999px; padding: 8px 16px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-calendar-days"></i> Reagendar / Trocar Catador
                </button>
                <button type="button" class="btn-editar-coleta" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: #555; border: 1px solid #ccc; border-radius: 999px; padding: 8px 14px; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-pen-to-square"></i> Editar Dados
                </button>
              ` : ehRetirada ? `
                <div style="font-size: 0.82rem; color: #2e7d32; font-weight: 800; background: #e8f5e9; border: 1px solid #c8e6c9; padding: 6px 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-circle-check"></i> Concluída
                </div>
                <button type="button" class="btn-editar-coleta" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: #555; border: 1px solid #ccc; border-radius: 999px; padding: 6px 14px; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-eye"></i> Ver Detalhes
                </button>
              ` : ehCancelada ? `
                <div style="font-size: 0.82rem; color: #c62828; font-weight: 800; background: #ffebee; border: 1px solid #ffcdd2; padding: 6px 14px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px;">
                  <i class="fa-solid fa-ban"></i> Cancelada
                </div>
                <button type="button" class="btn-editar-coleta" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: #555; border: 1px solid #ccc; border-radius: 999px; padding: 6px 14px; font-weight: 600; font-size: 0.8rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-eye"></i> Ver Detalhes
                </button>
              ` : `
                <!-- Disponível -->
                <button type="button" class="btn-atribuir-catador" data-id="${coleta.cod_coleta}" style="background: var(--verde-escuro, #1b6d24); color: white; border: none; border-radius: 999px; padding: 9px 20px; font-weight: 700; font-size: 0.84rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 2px 6px rgba(27,109,36,0.25);">
                  <i class="fa-solid fa-user-plus"></i> Atribuir Catador / Agendar
                </button>
                <button type="button" class="btn-editar-coleta" data-id="${coleta.cod_coleta}" style="background: #ffffff; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; border-radius: 999px; padding: 8px 16px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                  <i class="fa-solid fa-pen-to-square"></i> Editar Dados
                </button>
              `}

              ${catadorAuthId ? `
                <a href="./mensagens.html?destinatario=${catadorAuthId}" class="btn-secondary-pill" style="height: 35px; padding: 0 14px; font-size: 0.82rem; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 700; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); border: 1.5px solid #a5d6a7; border-radius: 999px;">
                  <i class="fa-solid fa-comments"></i> Conversar
                </a>
              ` : ''}
            </div>
          `;
        }

        const fotoTag = (coleta.foto_url && coleta.foto_url.trim() !== '')
          ? `<div style="position: relative; overflow: hidden; border-radius: 12px; background: #e8f5e9; border: 1.5px solid #a5d6a7; margin-bottom: 2px;">
              <img src="${coleta.foto_url}" data-src="${coleta.foto_url}" alt="${tipoMaterial} (${coleta.quantidade || ''})" class="img-preview-material" style="width: 100%; height: 180px; object-fit: cover; border-radius: 10px; cursor: pointer; transition: transform 0.2s;" title="Clique para ampliar a foto do material">
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; pointer-events: none; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar
              </div>
            </div>`
          : '';

        let bannerDataHoraHtml = '';
        if (ehRetirada) {
          bannerDataHoraHtml = `
            <div style="background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; color: #1b5e20;">
              <i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 1.25rem;"></i>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 800;">Coleta Retirada</span>
                <span style="font-size: 0.82rem; color: #2e7d32; font-weight: 600;">Retirado em: <strong>${dataHoraRetiradaFormatada || dataFormatada || 'Data registrada'}</strong></span>
              </div>
            </div>
          `;
        } else if (ehAgendada) {
          bannerDataHoraHtml = `
            <div style="background: #fff8e1; border: 1px solid #ffe082; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; color: #856404;">
              <i class="fa-regular fa-calendar-check" style="color: #b78103; font-size: 1.25rem;"></i>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 800;">Coleta Agendada</span>
                <span style="font-size: 0.82rem; color: #5d4037; font-weight: 600;">Data e Horário Previsto: <strong>${dataHoraAgendadaFormatada || 'A combinar'}</strong></span>
              </div>
            </div>
          `;
        } else if (ehCancelada) {
          bannerDataHoraHtml = `
            <div style="background: #fff5f5; border: 1px solid #ef9a9a; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; color: #c62828;">
              <i class="fa-solid fa-ban" style="color: #c62828; font-size: 1.25rem;"></i>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 800;">Coleta Cancelada</span>
                <span style="font-size: 0.82rem; color: #c62828; font-weight: 600;">Cancelado em: <strong>${dataHoraCanceladaFormatada || dataFormatada || 'Data arquivada'}</strong></span>
              </div>
            </div>
          `;
        } else {
          bannerDataHoraHtml = `
            <div style="background: #f4fbf5; border: 1px dashed #a5d6a7; border-radius: 10px; padding: 10px 14px; display: flex; align-items: center; gap: 10px; color: #2e7d32;">
              <i class="fa-regular fa-clock" style="color: #2e7d32; font-size: 1.25rem;"></i>
              <div style="display: flex; flex-direction: column;">
                <span style="font-size: 0.85rem; font-weight: 800;">Oferta Disponível</span>
                <span style="font-size: 0.82rem; color: #555; font-weight: 500;">Aguardando atribuição de catador e agendamento da retirada</span>
              </div>
            </div>
          `;
        }

        card.innerHTML = `
          ${fotoTag}
          
          <!-- Cabeçalho Único: Material + Data de Criação + Status -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <strong style="color: var(--verde-escuro, #1b6d24); font-size: 1.15rem; font-weight: 800;">
                ${tipoMaterial} — ${coleta.quantidade || 'Qtd aproximada'}
              </strong>
              <span style="font-size: 0.78rem; color: #6b7280; font-weight: 600; display: flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-calendar" style="color: #2e7d32;"></i> Criada em ${dataFormatada || 'Data recente'}
              </span>
            </div>
            <span style="font-size: 0.74rem; font-weight: 800; background: ${badgeCor}; color: ${badgeTexto}; padding: 4px 12px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${stFormatado}
            </span>
          </div>

          <!-- Corpo de Dados Integrado (Bloco Único) -->
          <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.88rem; color: #374151; padding: 4px 0;">
            <div>
              <strong style="color: var(--verde-escuro, #1b6d24);"><i class="fa-solid fa-location-dot" style="color: #2e7d32; width: 18px;"></i> Ponto de Retirada:</strong>
              <span style="font-weight: 600;">${localNome}</span>
              <div style="font-size: 0.81rem; color: #6b7280; padding-left: 22px; margin-top: 2px;">${enderecoCompleto}</div>
            </div>

            <div>
              ${éCatador ? `
                <strong style="color: var(--verde-escuro, #1b6d24);"><i class="fa-solid fa-user" style="color: #0288d1; width: 18px;"></i> Ofertante:</strong>
                <span>${doadorNome}</span>
              ` : `
                <strong style="color: var(--verde-escuro, #1b6d24);"><i class="fa-solid fa-user-check" style="color: #2e7d32; width: 18px;"></i> Catador Atribuído:</strong>
                <span style="font-weight: ${coleta.catador_id ? '700' : '500'}; color: ${coleta.catador_id ? '#1b5e20' : '#777'};">
                  ${coleta.catador_id ? catadorNome : 'Aguardando atribuição de catador'}
                </span>
              `}
            </div>

            <!-- Banner Informativo de Situação e Horário -->
            ${bannerDataHoraHtml}
          </div>

          <!-- Rodapé de Ações Contextuais -->
          ${acoesHtml}
        `;

        listaContainer.appendChild(card);
      });

      // Reconecta os ouvintes de eventos
      vincularEventosCards(listaContainer, feedbackMsg, perfil, todasColetas, catadores, listaStatus, locaisRetirada);
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

function vincularEventosCards(listaContainer, feedbackMsg, perfil, todasColetas, catadores, listaStatus, locaisRetirada) {
  // 1. Modal de Foto Ampliada
  document.querySelectorAll('.img-preview-material').forEach(img => {
    img.addEventListener('click', (e) => {
      const src = e.currentTarget.getAttribute('data-src') || e.currentTarget.src;
      const alt = e.currentTarget.getAttribute('alt');
      abrirModalFoto(src, alt);
    });
  });

  // 2. Modal de Mapa (Catador)
  document.querySelectorAll('.btn-abrir-mapa').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const localNome = e.currentTarget.getAttribute('data-local');
      const enderecoCompleto = e.currentTarget.getAttribute('data-endereco');
      abrirModalMapa(localNome, enderecoCompleto);
    });
  });

  // 3. Desistir de Agendamento (Catador)
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
            await cancelarAgendamento(id);
            showSuccess(feedbackMsg, 'Agendamento cancelado. O material foi liberado para outros catadores.');
            carregarLista(listaContainer, feedbackMsg, perfil);
          } catch (err) {
            showError(feedbackMsg, 'Erro ao cancelar agendamento: ' + err.message);
          }
        }
      });
    });
  });

  // 4. Ação: Confirmar Retirada (Cidadão / Admin)
  document.querySelectorAll('.btn-confirmar-retirada').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const catId = e.currentTarget.getAttribute('data-catador');
      const coletaAlvo = todasColetas.find(c => (c.cod_coleta || c.id) === id);

      confirmarRetiradaComModal({
        cod_coleta: id,
        catador_id: catId,
        material: coletaAlvo?.materiais?.tipo || coletaAlvo?.materiais?.nome,
        quantidade: coletaAlvo?.quantidade,
        onConfirmada: (msg) => {
          showSuccess(feedbackMsg, msg);
          carregarLista(listaContainer, feedbackMsg, perfil);
        }
      });
    });
  });

  // 5. Ação: Editar Informações da Coleta (Cidadão / Admin)
  document.querySelectorAll('.btn-editar-coleta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const coletaAlvo = todasColetas.find(c => (c.cod_coleta || c.id) === id);

      if (!coletaAlvo) {
        showError(feedbackMsg, 'Coleta não localizada para edição.');
        return;
      }

      abrirModalEdicaoColeta({
        coleta: coletaAlvo,
        catadores,
        listaStatus,
        locaisRetirada,
        ehAdmin: perfil?.tipo === 'administrador',
        onSalvar: (msg) => {
          showSuccess(feedbackMsg, msg);
          carregarLista(listaContainer, feedbackMsg, perfil);
        }
      });
    });
  });

  // 6. Atribuir Catador / Agendar Coleta com Escolha Explícita de Data e Horário
  document.querySelectorAll('.btn-atribuir-catador').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      const coletaAlvo = todasColetas.find(c => (c.cod_coleta || c.id) === id);

      if (!coletaAlvo) {
        showError(feedbackMsg, 'Coleta não localizada para agendamento.');
        return;
      }

      abrirModalAtribuirCatador({
        coleta: coletaAlvo,
        catadores,
        onSalvar: (msg) => {
          showSuccess(feedbackMsg, msg);
          carregarLista(listaContainer, feedbackMsg, perfil);
        }
      });
    });
  });
}

function showError(feedbackMsg, msg) {
  if (!feedbackMsg) return;
  feedbackMsg.textContent = msg;
  feedbackMsg.className = 'status-message error';
}

function showSuccess(feedbackMsg, msg) {
  if (!feedbackMsg) return;
  feedbackMsg.textContent = msg;
  feedbackMsg.className = 'status-message success';
}

function abrirModalMapa(nomePonto, enderecoCompleto) {
  showAlertModal({
    title: 'Funcionalidade Futura',
    message: `A visualização e rotas interativas no mapa estarão disponíveis em versões futuras.\n\nLocal de Coleta: ${nomePonto}\nEndereço: ${enderecoCompleto}`,
    buttonText: 'Entendido',
    confirmColor: '#1b6d24',
    icon: '<i class="fa-solid fa-map-location-dot" style="color: var(--verde-escuro, #1b6d24); font-size: 1.25rem;"></i>'
  });
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
