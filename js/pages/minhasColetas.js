import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { 
  listarMinhasColetasCidadao, 
  listarMinhasColetasCatador, 
  listarTodasColetasAdmin, 
  cancelarAgendamento,
  listarCatadoresParaVincular,
  vincularCatadorColeta,
  getStatusDisponiveis,
  getStatusDisponiveisCache,
  atualizarStatusColeta,
  atualizarColetaCompleta,
  listarLocaisRetirada,
  resolverStatusColeta
} from '../services/coletas.js';
import { supabase } from '../lib/supabaseClient.js';
import { showConfirmModal, showAlertModal } from '../lib/modal.js';
import { abrirModalEdicaoColeta, confirmarRetiradaComModal, abrirModalAtribuirCatador } from '../lib/modalColeta.js';
import { obterRegrasStatus, obterCoresStatus } from '../services/status.js';

async function init() {
  const listaContainer = document.getElementById('lista-minhas-coletas');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');

  // 1. Verificação de permissão autorizando Cidadão, Administrador e Catador
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador', 'catador']).catch(() => null);
  if (!perfil) return;

  // 2. Carregamento da lista apropriada para o perfil
  const urlParams = new URLSearchParams(window.location.search);
  const statusParam = urlParams.get('status') || 'todos';
  await carregarLista(listaContainer, feedbackMsg, perfil, statusParam);

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

      // Lista de status a exibir na toolbar: se listaStatus existir e tiver itens, usa ela; senão usa cache ou padrão
      const statusEmCache = getStatusDisponiveisCache();
      let statusListaEfetiva = (listaStatus && listaStatus.length > 0) ? [...listaStatus] : (statusEmCache ? [...statusEmCache] : [
        { cod_status: 1, status: 'disponível' },
        { cod_status: 2, status: 'agendada' },
        { cod_status: 6, status: 'reagendada' },
        { cod_status: 3, status: 'retirada' },
        { cod_status: 4, status: 'cancelada' }
      ]);

      if (éCatador) {
        statusListaEfetiva = statusListaEfetiva.filter(st => {
          const s = (st.status || '').toLowerCase().trim();
          return st.cod_status !== 1 && !/dispon/i.test(s);
        });
      }

      let tabsHtml = `
        <button type="button" class="btn-tab ${filtroStatusAtivo === 'todos' ? 'active' : ''}" data-filtro="todos" data-status="todos">
          <i class="fa-solid fa-layer-group"></i> Todas (${countTodas})
        </button>
      `;

      statusListaEfetiva.forEach(st => {
        const cod = st.cod_status;
        const stNomeLower = (st.status || '').toLowerCase().trim();
        const regras = st.regras || obterRegrasStatus(st.cod_status, st.status);
        let iconClass = regras.icone;
        let nomeDisplay = st.status.charAt(0).toUpperCase() + st.status.slice(1);

        if (/cancel/i.test(stNomeLower) || cod === 4 || cod === 5) {
          iconClass = 'fa-ban';
          nomeDisplay = 'Canceladas';
        } else if (!iconClass) {
          if (/(retirad|conclu)/i.test(stNomeLower)) {
            iconClass = 'fa-circle-check';
            nomeDisplay = 'Retiradas';
          } else if (/reagend/i.test(stNomeLower)) {
            iconClass = 'fa-calendar-days';
            nomeDisplay = 'Reagendadas';
          } else if (/agend/i.test(stNomeLower)) {
            iconClass = 'fa-calendar-check';
            nomeDisplay = 'Agendadas';
          } else if (/dispon/i.test(stNomeLower)) {
            iconClass = 'fa-box-open';
            nomeDisplay = 'Disponíveis';
          } else {
            iconClass = 'fa-tag';
          }
        } else {
          if (/(retirad|conclu)/i.test(stNomeLower)) nomeDisplay = 'Retiradas';
          else if (/reagend/i.test(stNomeLower)) nomeDisplay = 'Reagendadas';
          else if (/agend/i.test(stNomeLower)) nomeDisplay = 'Agendadas';
          else if (/dispon/i.test(stNomeLower)) nomeDisplay = 'Disponíveis';
          else if (/cancel/i.test(stNomeLower)) nomeDisplay = 'Canceladas';
        }

        const icon = `<i class="fa-solid ${iconClass}"></i>`;

        // Calcula contagem com suporte a canceladas (cod 4 e 5) e compatibilidade de nome
        let count = contagemPorCodigo[cod] || 0;
        if (/cancel/i.test(stNomeLower)) {
          count = (contagemPorCodigo[4] || 0) + (contagemPorCodigo[5] || 0);
        } else if (count === 0 && contagemPorNome[stNomeLower]) {
          count = contagemPorNome[stNomeLower];
        }

        const ehAtivo = filtroStatusAtivo === String(cod) || filtroStatusAtivo === stNomeLower ||
          (filtroStatusAtivo === 'disponivel' && /dispon/i.test(stNomeLower)) ||
          (filtroStatusAtivo === 'cancelada' && /cancel/i.test(stNomeLower)) ||
          (filtroStatusAtivo === 'retirada' && /(retirad|conclu)/i.test(stNomeLower)) ||
          (filtroStatusAtivo === 'agendada' && /agend/i.test(stNomeLower));

        const temaCor = obterCoresStatus(cod, stNomeLower);
        const corId = (regras && regras.cor) ? regras.cor : (temaCor ? temaCor.id : 'verde');

        tabsHtml += `
          <button type="button" class="btn-tab ${ehAtivo ? 'active' : ''}" data-filtro="${cod}" data-status="${cod}" data-nome="${stNomeLower}" data-cor="${corId}" style="--cor-bg: ${temaCor.bg}; --cor-texto: ${temaCor.cor}; --cor-borda: ${temaCor.borda}; --cor-dot: ${temaCor.dot};" title="${st.status}">
            ${icon} <span>${nomeDisplay} (${count})</span>
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

        const temaCard = statusInfo.temaCor || { bg: '#f0fdf4', cor: '#166534', borda: '#bbf7d0', dot: '#16a34a' };
        const iconeCard = statusInfo.regras?.icone || (ehRetirada ? 'fa-circle-check' : ehAgendada ? 'fa-calendar-check' : ehCancelada ? 'fa-ban' : 'fa-clock');
        const rotuloCard = (statusInfo.rotulo || 'COLETA')
          .replace(/RETIRADO/gi, 'RETIRADA')
          .replace(/CANCELADO/gi, 'CANCELADA')
          .replace(/REAGENDADO/gi, 'REAGENDADA')
          .replace(/AGENDADO/gi, 'AGENDADA');
        const nomeCap = statusInfo.nome ? (statusInfo.nome.charAt(0).toUpperCase() + statusInfo.nome.slice(1)) : 'Status';

        let badgeBg = temaCard.bg;
        let badgeTexto = temaCard.cor;
        let badgeBorda = temaCard.borda;
        let stFormatado = rotuloCard;

        let acoesHtml = '';
        if (éCatador) {
          if (ehAgendada) {
            acoesHtml = `
              <div class="card-coleta-acoes">
                <div class="acoes-sublinha-dupla">
                  <button type="button" class="btn-abrir-mapa btn-coleta-secondary" data-local="${localNome}" data-endereco="${enderecoCompleto}">
                    <i class="fa-solid fa-map-location-dot"></i> Ver no Mapa
                  </button>
                  ${coleta.cidadao_id ? `
                    <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-coleta-secondary">
                      <i class="fa-solid fa-comments"></i> Conversar
                    </a>
                  ` : ''}
                </div>
                <button type="button" class="btn-desistir-agendamento btn-coleta-danger" data-id="${coleta.cod_coleta}" style="width: 100%;">
                  <i class="fa-solid fa-calendar-xmark"></i> Cancelar Agendamento
                </button>
              </div>
            `;
          } else if (ehRetirada) {
            acoesHtml = `
              <div class="card-coleta-finalizada">
                <div class="acoes-finalizadas-botoes">
                  <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-eye"></i> Detalhes
                  </button>
                  ${coleta.cidadao_id ? `
                    <a href="./mensagens.html?destinatario=${coleta.cidadao_id}" class="btn-coleta-secondary">
                      <i class="fa-solid fa-comments"></i> Mensagens
                    </a>
                  ` : ''}
                </div>
              </div>
            `;
          } else if (ehCancelada) {
            acoesHtml = `
              <div class="card-coleta-finalizada">
                <div class="acoes-finalizadas-botoes">
                  <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-eye"></i> Detalhes
                  </button>
                </div>
              </div>
            `;
          }
        } else {
          // CIDADÃO (ou Admin): Ações contextuais limpas e diretas
          const catadorAuthId = coleta.catador?.auth_user_id || (coleta.catador?.id ? coleta.catador.id : null);
          acoesHtml = `
            ${ehAgendada ? `
              <div class="card-coleta-acoes">
                <button type="button" class="btn-confirmar-retirada btn-coleta-primary btn-acao-destaque" data-id="${coleta.cod_coleta}" data-catador="${coleta.catador_id || ''}">
                  <i class="fa-solid fa-circle-check"></i> Confirmar Retirada
                </button>
                <div class="acoes-linha-botoes">
                  <button type="button" class="btn-atribuir-catador btn-coleta-secondary btn-acao-larga" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-calendar-days"></i> Reagendar / Trocar Catador
                  </button>
                  <div class="acoes-sublinha-dupla">
                    <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                      <i class="fa-solid fa-pen-to-square"></i> Editar Dados
                    </button>
                    ${catadorAuthId ? `
                      <a href="./mensagens.html?destinatario=${catadorAuthId}" class="btn-coleta-secondary">
                        <i class="fa-solid fa-comments"></i> Conversar
                      </a>
                    ` : ''}
                  </div>
                </div>
              </div>
            ` : ehRetirada ? `
              <div class="card-coleta-finalizada">
                <div class="acoes-finalizadas-botoes">
                  <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-eye"></i> Ver Detalhes
                  </button>
                  ${catadorAuthId ? `
                    <a href="./mensagens.html?destinatario=${catadorAuthId}" class="btn-coleta-secondary">
                      <i class="fa-solid fa-comments"></i> Conversar
                    </a>
                  ` : ''}
                </div>
              </div>
            ` : ehCancelada ? `
              <div class="card-coleta-finalizada">
                <div class="acoes-finalizadas-botoes">
                  <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-eye"></i> Ver Detalhes
                  </button>
                </div>
              </div>
            ` : `
              <!-- Disponível -->
              <div class="card-coleta-acoes">
                <div class="acoes-linha-botoes">
                  <button type="button" class="btn-atribuir-catador btn-coleta-primary btn-acao-larga" data-id="${coleta.cod_coleta}">
                    <i class="fa-solid fa-user-plus"></i> Atribuir Catador / Agendar
                  </button>
                  <div class="acoes-sublinha-dupla">
                    <button type="button" class="btn-editar-coleta btn-coleta-secondary" data-id="${coleta.cod_coleta}">
                      <i class="fa-solid fa-pen-to-square"></i> Editar Dados
                    </button>
                    ${catadorAuthId ? `
                      <a href="./mensagens.html?destinatario=${catadorAuthId}" class="btn-coleta-secondary">
                        <i class="fa-solid fa-comments"></i> Conversar
                      </a>
                    ` : ''}
                  </div>
                </div>
              </div>
            `}
          `;
        }

        const fotoTag = (coleta.foto_url && coleta.foto_url.trim() !== '')
          ? `<div style="position: relative; overflow: hidden; border-radius: 12px; background: #e8f5e9; border: 1.5px solid #a5d6a7; margin-top: 8px; margin-bottom: 2px;">
              <img src="${coleta.foto_url}" data-src="${coleta.foto_url}" alt="${tipoMaterial} (${coleta.quantidade || ''})" class="img-preview-material" style="width: 100%; height: 180px; object-fit: cover; border-radius: 10px; cursor: pointer; transition: transform 0.2s;" title="Clique para ampliar a foto">
              <div style="position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.7); color: #ffffff; padding: 3px 10px; border-radius: 999px; font-size: 0.72rem; font-weight: 700; pointer-events: none; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-magnifying-glass-plus"></i> Ampliar
              </div>
            </div>`
          : '';

        let tituloBanner = 'Coleta';
        if (ehRetirada || /retirad/i.test(statusInfo.nome)) tituloBanner = 'Coleta Retirada';
        else if (ehAgendada) tituloBanner = 'Coleta Agendada';
        else if (ehCancelada) tituloBanner = 'Coleta Cancelada';
        else if (ehDisponivel) tituloBanner = 'Oferta Disponível';
        else {
          const n = String(statusInfo.nome || '').trim().toLowerCase();
          if (n.endsWith('o')) {
            tituloBanner = 'Coleta ' + (n.charAt(0).toUpperCase() + n.slice(1, -1) + 'a');
          } else {
            tituloBanner = 'Coleta ' + nomeCap;
          }
        }

        let bannerDataHoraHtml = '';
        if (ehRetirada || /retirad/i.test(statusInfo.nome)) {
          bannerDataHoraHtml = `
            <div style="background: ${temaCard.bg}; border: 1px solid ${temaCard.borda}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; margin-top: 4px;">
              <i class="fa-solid ${iconeCard}" style="color: ${temaCard.dot || temaCard.cor}; font-size: 1.15rem; flex-shrink: 0;"></i>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: ${temaCard.cor};">${tituloBanner}</span>
                <span style="font-size: 0.8rem; color: #4b5563;">Retirada em: <strong style="color: #111827; font-weight: 600;">${dataHoraRetiradaFormatada || dataFormatada || 'Data registrada'}</strong></span>
              </div>
            </div>
          `;
        } else if (ehAgendada) {
          bannerDataHoraHtml = `
            <div style="background: ${temaCard.bg}; border: 1px solid ${temaCard.borda}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; margin-top: 4px;">
              <i class="fa-solid ${iconeCard}" style="color: ${temaCard.dot || temaCard.cor}; font-size: 1.15rem; flex-shrink: 0;"></i>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: ${temaCard.cor};">${tituloBanner}</span>
                <span style="font-size: 0.8rem; color: #57534e;">Data e horário previsto: <strong style="color: #1c1917; font-weight: 600;">${dataHoraAgendadaFormatada || 'A combinar'}</strong></span>
              </div>
            </div>
          `;
        } else if (ehCancelada) {
          bannerDataHoraHtml = `
            <div style="background: ${temaCard.bg}; border: 1px solid ${temaCard.borda}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; margin-top: 4px;">
              <i class="fa-solid ${iconeCard}" style="color: ${temaCard.dot || temaCard.cor}; font-size: 1.15rem; flex-shrink: 0;"></i>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: ${temaCard.cor};">${tituloBanner}</span>
                <span style="font-size: 0.8rem; color: #4b5563;">Cancelada em: <strong style="color: #111827; font-weight: 600;">${dataHoraCanceladaFormatada || dataFormatada || 'Data arquivada'}</strong></span>
              </div>
            </div>
          `;
        } else {
          bannerDataHoraHtml = `
            <div style="background: ${temaCard.bg}; border: 1.5px dashed ${temaCard.borda}; border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; margin-top: 4px;">
              <i class="fa-solid ${iconeCard}" style="color: ${temaCard.dot || temaCard.cor}; font-size: 1.15rem; flex-shrink: 0;"></i>
              <div style="display: flex; flex-direction: column; gap: 1px;">
                <span style="font-size: 0.84rem; font-weight: 800; color: ${temaCard.cor};">${tituloBanner}</span>
                <span style="font-size: 0.8rem; color: ${temaCard.cor}; opacity: 0.9; font-weight: 500;">Aguardando atribuição de catador e agendamento da retirada</span>
              </div>
            </div>
          `;
        }


        card.innerHTML = `
          <!-- Cabeçalho Único: Material + Data de Criação + Status -->
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px;">
            <div style="display: flex; flex-direction: column; gap: 2px;">
              <strong style="color: var(--verde-escuro, #1b6d24); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <i class="fa-solid fa-recycle" style="color: var(--verde-escuro, #1b6d24);"></i> ${tipoMaterial} — ${coleta.quantidade || 'Qtd aproximada'}
              </strong>
              <span style="font-size: 0.76rem; color: #6b7280; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                <i class="fa-regular fa-calendar" style="color: #9ca3af;"></i> Criada em ${dataFormatada || 'Data recente'}
              </span>
            </div>
            <span style="font-size: 0.72rem; font-weight: 700; background: ${badgeBg}; color: ${badgeTexto}; border: 1px solid ${badgeBorda}; padding: 3px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.04em;">
              ${stFormatado}
            </span>
          </div>

          <!-- Corpo de Dados Integrado (Bloco Único) -->
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.86rem; color: #374151; padding: 2px 0;">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; color: var(--verde-escuro, #1b6d24); margin-top: 1px;">
                <i class="fa-solid fa-location-dot" style="font-size: 0.95rem;"></i>
              </span>
              <div>
                <span style="color: #4b5563; font-weight: 600;">Ponto de Retirada:</span>
                <span style="color: #111827; font-weight: 600;">${localNome}</span>
                <div style="font-size: 0.8rem; color: #6b7280; margin-top: 1px;">${enderecoCompleto}</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; flex-shrink: 0; color: var(--verde-escuro, #1b6d24);">
                <i class="fa-solid ${éCatador ? 'fa-user' : 'fa-user-check'}" style="font-size: 0.95rem;"></i>
              </span>
              <span style="color: #4b5563; font-weight: 600;">${éCatador ? 'Ofertante:' : 'Catador Atribuído:'}</span>
              <span style="color: ${coleta.catador_id || éCatador ? '#111827' : '#9ca3af'}; font-weight: ${coleta.catador_id || éCatador ? '600' : '500'};">
                ${éCatador ? doadorNome : (coleta.catador_id ? catadorNome : 'Aguardando atribuição de catador')}
              </span>
            </div>

            <!-- Banner Informativo de Situação e Horário -->
            ${bannerDataHoraHtml}
          </div>

          ${fotoTag}

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
        coleta: coletaAlvo,
        cod_coleta: id,
        catador_id: catId,
        material: coletaAlvo?.materiais?.tipo || coletaAlvo?.materiais?.nome,
        quantidade: coletaAlvo?.quantidade,
        onConfirmada: (msg, infoStatus) => {
          showSuccess(feedbackMsg, msg);
          const statusDestino = (infoStatus && infoStatus.cod_status) ? String(infoStatus.cod_status) : '3';
          carregarLista(listaContainer, feedbackMsg, perfil, statusDestino);
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
        onSalvar: (msg, infoStatus) => {
          showSuccess(feedbackMsg, msg);
          const statusDestino = (infoStatus && (infoStatus.cod_status || infoStatus.nome_status))
            ? String(infoStatus.cod_status || infoStatus.nome_status)
            : filtroStatusAtivo;
          carregarLista(listaContainer, feedbackMsg, perfil, statusDestino);
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
        onSalvar: (msg, infoStatus) => {
          showSuccess(feedbackMsg, msg);
          const statusDestino = (infoStatus && infoStatus.cod_status) ? String(infoStatus.cod_status) : '2';
          carregarLista(listaContainer, feedbackMsg, perfil, statusDestino);
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
