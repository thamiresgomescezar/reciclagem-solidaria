import { supabase } from '../lib/supabaseClient.js';
import { protegerRota } from '../lib/routeGuard.js';
import { getPerfilAtual } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const acesso = await protegerRota(['catador']);
  if (!acesso.permitido) return;

  const container = document.getElementById('relatorio_conteudo_container');
  const btnExportarCsv = document.getElementById('btn_exportar_csv');
  const tabs = document.querySelectorAll('#tabs_relatorios button');

  const kpiTotal = document.getElementById('kpi_total_coletas');
  const kpiMaterial = document.getElementById('kpi_top_material');
  const kpiPonto = document.getElementById('kpi_top_ponto');
  const kpiConclusao = document.getElementById('kpi_taxa_conclusao');

  let tabAtual = 'materiais';
  let coletasCatador = [];
  let dadosExportacao = [];

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      tabAtual = e.currentTarget.getAttribute('data-tab');
      renderizarTab(tabAtual);
    });
  });

  async function carregarDados() {
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--cinza-texto-aux); padding: 30px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Carregando seus indicadores pessoais...</div>`;

    try {
      const perfil = await getPerfilAtual();
      const currentUserId = perfil?.user?.id || perfil?.dados?.id || null;

      if (!currentUserId) {
        container.innerHTML = `<div class="status-message error">Sessão não localizada. Faça login novamente.</div>`;
        return;
      }

      // Localiza o ID de registro do catador
      const { data: catRecord } = await supabase
        .from('catador')
        .select('id')
        .eq('auth_user_id', currentUserId)
        .maybeSingle();

      const catadorIds = [currentUserId];
      if (catRecord && catRecord.id) catadorIds.push(catRecord.id);

      // Busca todas as coletas vinculadas a este catador
      const { data: coletasData, error: errColetas } = await supabase
        .from('coleta')
        .select('*, materiais(tipo), status(status), local_retirada(nome, bairro, cidade)')
        .in('catador_id', catadorIds)
        .order('criado_em', { ascending: false });

      if (errColetas) throw errColetas;

      coletasCatador = coletasData || [];

      // Atualiza KPIs
      atualizarKpis();

      // Renderiza a aba atual
      renderizarTab(tabAtual);

    } catch (err) {
      console.error('Erro ao carregar dados do relatório do catador:', err);
      container.innerHTML = `<div class="status-message error">Erro ao carregar seus relatórios: ${err.message}</div>`;
    }
  }

  function atualizarKpis() {
    const total = coletasCatador.length;
    kpiTotal.textContent = total;

    if (total === 0) {
      kpiMaterial.textContent = 'Nenhum';
      kpiPonto.textContent = 'Nenhum';
      kpiConclusao.textContent = '0%';
      return;
    }

    // Contagem por Material
    const matCount = {};
    // Contagem por Ponto
    const pontoCount = {};
    let concluidas = 0;

    coletasCatador.forEach(c => {
      const mat = c.materiais?.tipo || 'Material';
      matCount[mat] = (matCount[mat] || 0) + 1;

      const ponto = c.local_retirada?.nome || 'Ponto de Retirada';
      pontoCount[ponto] = (pontoCount[ponto] || 0) + 1;

      const st = (c.status?.status || '').toLowerCase();
      if (st === 'retirado' || st === 'concluído') {
        concluidas++;
      }
    });

    // Top Material
    const topMat = Object.entries(matCount).sort((a, b) => b[1] - a[1])[0];
    kpiMaterial.textContent = topMat ? topMat[0] : 'Nenhum';

    // Top Ponto
    const topPonto = Object.entries(pontoCount).sort((a, b) => b[1] - a[1])[0];
    kpiPonto.textContent = topPonto ? topPonto[0] : 'Nenhum';

    // Taxa Conclusão
    const tx = Math.round((concluidas / total) * 100);
    kpiConclusao.textContent = `${tx}%`;
  }

  function renderizarTab(tab) {
    dadosExportacao = [];

    if (coletasCatador.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; color: #555; padding: 28px; margin: auto;">
          <i class="fa-solid fa-clipboard-check" style="font-size: 2.5rem; color: var(--verde-escuro, #1b6d24); margin-bottom: 12px; display: block;"></i>
          <h4 style="font-size: 1.1rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); margin-bottom: 6px;">Nenhuma Coleta Atribuída Ainda</h4>
          <p style="font-size: 0.88rem; color: #666; max-width: 460px; margin: 0 auto 16px;">
            Você ainda não possui coletas agendadas ou finalizadas. Acesse a tela de <b>Materiais Disponíveis</b> para assumir novas ofertas!
          </p>
          <a href="./catador-materiais.html" class="btn-avancar" style="display: inline-flex; width: auto; padding: 10px 22px; text-decoration: none; font-size: 0.88rem;">
            <i class="fa-solid fa-recycle"></i> Ver Materiais Disponíveis
          </a>
        </div>
      `;
      return;
    }

    if (tab === 'materiais') {
      // TAB 1: Materiais Mais Coletados pelo Catador
      const contagem = {};
      coletasCatador.forEach(c => {
        const mat = c.materiais?.tipo || 'Material';
        contagem[mat] = (contagem[mat] || 0) + 1;
      });

      const total = coletasCatador.length;
      dadosExportacao = Object.entries(contagem).map(([material, quantidade]) => ({
        Material: material,
        'Coletas Realizadas': quantidade,
        'Percentual (%)': ((quantidade / total) * 100).toFixed(1) + '%'
      }));

      let html = `
        <h3 style="color: var(--verde-escuro, #1b6d24); font-size: 1.15rem; font-weight: 800; margin-bottom: 8px;">
          <i class="fa-solid fa-chart-pie"></i> Materiais Mais Coletados por Você
        </h3>
        <p style="font-size: 0.85rem; color: #555; margin-bottom: 16px;">Distribuição dos tipos de materiais recicláveis que você assumiu e agendou.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--verde-escuro, #1b6d24); text-align: left; color: var(--verde-escuro, #1b6d24);">
              <th style="padding: 10px;">Tipo de Material</th>
              <th style="padding: 10px; text-align: center;">Total de Coletas</th>
              <th style="padding: 10px; text-align: right;">Participação (%)</th>
            </tr>
          </thead>
          <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        html += `
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.06);">
            <td style="padding: 12px 10px; font-weight: 700; color: #333;">
              <i class="fa-solid fa-recycle" style="color: #2e7d32; margin-right: 6px;"></i> ${item.Material}
            </td>
            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: var(--verde-escuro, #1b6d24);">${item['Coletas Realizadas']}</td>
            <td style="padding: 12px 10px; text-align: right;">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                <div style="width: 80px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pctVal}%; height: 100%; background: var(--verde-escuro, #1b6d24); border-radius: 4px;"></div>
                </div>
                <span style="font-weight: 800; color: #333;">${item['Percentual (%)']}</span>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

    } else if (tab === 'pontos') {
      // TAB 2: Pontos de Coleta Mais Buscados pelo Catador
      const contagemLocais = {};
      coletasCatador.forEach(c => {
        const localNome = c.local_retirada?.nome || 'Ponto de Retirada';
        const bairro = c.local_retirada?.bairro ? ` (${c.local_retirada.bairro})` : '';
        const chave = `${localNome}${bairro}`;
        contagemLocais[chave] = (contagemLocais[chave] || 0) + 1;
      });

      const total = coletasCatador.length;
      const ordenado = Object.entries(contagemLocais).sort((a, b) => b[1] - a[1]);

      dadosExportacao = ordenado.map(([ponto, quantidade], index) => ({
        Posição: `#${index + 1}`,
        'Ponto de Coleta': ponto,
        'Vezes Buscado': quantidade,
        'Percentual (%)': ((quantidade / total) * 100).toFixed(1) + '%'
      }));

      let html = `
        <h3 style="color: var(--verde-escuro, #1b6d24); font-size: 1.15rem; font-weight: 800; margin-bottom: 8px;">
          <i class="fa-solid fa-map-location-dot"></i> Pontos de Coleta Atendidos Por Você
        </h3>
        <p style="font-size: 0.85rem; color: #555; margin-bottom: 16px;">Locais de retirada que você atendeu nas suas coletas.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--verde-escuro, #1b6d24); text-align: left; color: var(--verde-escuro, #1b6d24);">
              <th style="padding: 10px; width: 60px;">Posição</th>
              <th style="padding: 10px;">Ponto de Retirada</th>
              <th style="padding: 10px; text-align: center;">Total de Atendimentos</th>
              <th style="padding: 10px; text-align: right;">Participação (%)</th>
            </tr>
          </thead>
          <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        html += `
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.06);">
            <td style="padding: 12px 10px; font-weight: 800; color: var(--verde-escuro, #1b6d24);">${item.Posição}</td>
            <td style="padding: 12px 10px; font-weight: 700; color: #333;">
              <i class="fa-solid fa-location-dot" style="color: #ed6c02; margin-right: 6px;"></i> ${item['Ponto de Coleta']}
            </td>
            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: var(--verde-escuro, #1b6d24);">${item['Vezes Buscado']}</td>
            <td style="padding: 12px 10px; text-align: right;">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                <div style="width: 80px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pctVal}%; height: 100%; background: #ed6c02; border-radius: 4px;"></div>
                </div>
                <span style="font-weight: 800; color: #333;">${item['Percentual (%)']}</span>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;

    } else if (tab === 'status') {
      // TAB 3: Resumo por Status de Coleta
      const contagemStatus = {};
      coletasCatador.forEach(c => {
        const st = c.status?.status ? c.status.status.toUpperCase() : 'AGENDADO';
        contagemStatus[st] = (contagemStatus[st] || 0) + 1;
      });

      const total = coletasCatador.length;
      dadosExportacao = Object.entries(contagemStatus).map(([status, quantidade]) => ({
        Status: status,
        Quantidade: quantidade,
        'Percentual (%)': ((quantidade / total) * 100).toFixed(1) + '%'
      }));

      let html = `
        <h3 style="color: var(--verde-escuro, #1b6d24); font-size: 1.15rem; font-weight: 800; margin-bottom: 8px;">
          <i class="fa-solid fa-list-check"></i> Resumo por Status de Coleta
        </h3>
        <p style="font-size: 0.85rem; color: #555; margin-bottom: 16px;">Acompanhamento das suas solicitações ativas e concluídas.</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid var(--verde-escuro, #1b6d24); text-align: left; color: var(--verde-escuro, #1b6d24);">
              <th style="padding: 10px;">Status da Coleta</th>
              <th style="padding: 10px; text-align: center;">Quantidade</th>
              <th style="padding: 10px; text-align: right;">Proporção (%)</th>
            </tr>
          </thead>
          <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        const cor = item.Status.includes('RETIRAD') || item.Status.includes('CONCLUÍD') ? '#2e7d32' : '#ed6c02';
        html += `
          <tr style="border-bottom: 1px solid rgba(0,0,0,0.06);">
            <td style="padding: 12px 10px; font-weight: 800; color: ${cor};">
              <i class="fa-solid fa-tag" style="margin-right: 6px;"></i> ${item.Status}
            </td>
            <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #333;">${item.Quantidade}</td>
            <td style="padding: 12px 10px; text-align: right;">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
                <div style="width: 80px; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pctVal}%; height: 100%; background: ${cor}; border-radius: 4px;"></div>
                </div>
                <span style="font-weight: 800; color: #333;">${item['Percentual (%)']}</span>
              </div>
            </td>
          </tr>
        `;
      });

      html += `</tbody></table>`;
      container.innerHTML = html;
    }
  }

  // Exportação CSV
  if (btnExportarCsv) {
    btnExportarCsv.addEventListener('click', () => {
      if (!dadosExportacao || dadosExportacao.length === 0) {
        alert('Não há dados disponíveis para exportação nesta aba.');
        return;
      }

      const headers = Object.keys(dadosExportacao[0]);
      let csvContent = '\uFEFF'; // UTF-8 BOM para acentuação correta no Excel
      csvContent += headers.join(';') + '\n';

      dadosExportacao.forEach(row => {
        const values = headers.map(h => `"${(row[h] || '').toString().replace(/"/g, '""')}"`);
        csvContent += values.join(';') + '\n';
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Meus_Relatorios_Catador_${tabAtual}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  await carregarDados();
});
