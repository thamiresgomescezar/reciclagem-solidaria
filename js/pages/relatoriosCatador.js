import { supabase } from '../lib/supabaseClient.js';
import { protegerRota } from '../lib/routeGuard.js';
import { getPerfilAtual } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const acesso = await protegerRota(['catador']);
  if (!acesso.permitido) return;

  const container = document.getElementById('relatorio_conteudo_container');
  const btnExportarCsv = document.getElementById('btn_exportar_csv');
  const tabs = document.querySelectorAll('#tabs_relatorios_catador button, #tabs_relatorios button');

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
        <div class="relatorio-card-box">
          <h5><i class="fa-solid fa-chart-pie"></i> Materiais Mais Coletados por Você</h5>
          <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Distribuição dos tipos de materiais recicláveis que você assumiu e agendou.</p>
          <div class="relatorio-table-wrapper">
            <table class="tabela-relatorio-clean">
              <thead>
                <tr>
                  <th>Tipo de Material</th>
                  <th style="text-align: center;">Total de Coletas</th>
                  <th class="text-right">Participação (%)</th>
                </tr>
              </thead>
              <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        html += `
          <tr>
            <td style="font-weight: 700; color: #333;">
              <i class="fa-solid fa-recycle" style="color: #2e7d32; margin-right: 6px;"></i> ${item.Material}
            </td>
            <td style="text-align: center; font-weight: 700; color: var(--verde-escuro, #1b6d24);">${item['Coletas Realizadas']}</td>
            <td style="text-align: right;">
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

      html += `</tbody></table></div></div>`;
      container.innerHTML = html;

    } else if (tab === 'pontos') {
      // TAB 2: Pontos de Coleta Mais Buscados pelo Catador
      const contagemLocais = {};
      coletasCatador.forEach(c => {
        const localNome = c.local_retirada?.nome || 'Ponto de Retirada';
        const chave = localNome;
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
        <div class="relatorio-card-box">
          <h5><i class="fa-solid fa-map-location-dot"></i> Pontos de Coleta Atendidos Por Você</h5>
          <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Locais de retirada que você atendeu nas suas coletas.</p>
          <div class="relatorio-table-wrapper">
            <table class="tabela-relatorio-clean">
              <thead>
                <tr>
                  <th style="width: 70px;">Posição</th>
                  <th>Ponto de Retirada</th>
                  <th style="text-align: center;">Total de Atendimentos</th>
                  <th class="text-right">Participação (%)</th>
                </tr>
              </thead>
              <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        html += `
          <tr>
            <td style="font-weight: 800; color: var(--verde-escuro, #1b6d24);">${item.Posição}</td>
            <td style="font-weight: 700; color: #333;">
              <i class="fa-solid fa-location-dot" style="color: #ed6c02; margin-right: 6px;"></i> ${item['Ponto de Coleta']}
            </td>
            <td style="text-align: center; font-weight: 700; color: var(--verde-escuro, #1b6d24);">${item['Vezes Buscado']}</td>
            <td style="text-align: right;">
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

      html += `</tbody></table></div></div>`;
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
        <div class="relatorio-card-box">
          <h5><i class="fa-solid fa-list-check"></i> Resumo por Status de Coleta</h5>
          <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Acompanhamento das suas solicitações ativas e concluídas.</p>
          <div class="relatorio-table-wrapper">
            <table class="tabela-relatorio-clean">
              <thead>
                <tr>
                  <th>Status da Coleta</th>
                  <th style="text-align: center;">Quantidade</th>
                  <th class="text-right">Proporção (%)</th>
                </tr>
              </thead>
              <tbody>
      `;

      dadosExportacao.forEach(item => {
        const pctVal = parseFloat(item['Percentual (%)']);
        const cor = item.Status.includes('RETIRAD') || item.Status.includes('CONCLUÍD') ? '#2e7d32' : '#ed6c02';
        html += `
          <tr>
            <td style="font-weight: 800; color: ${cor};">
              <i class="fa-solid fa-tag" style="margin-right: 6px;"></i> ${item.Status}
            </td>
            <td style="text-align: center; font-weight: 700; color: #333;">${item.Quantidade}</td>
            <td style="text-align: right;">
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

      html += `</tbody></table></div></div>`;
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
