import { supabase } from '../lib/supabaseClient.js';
import { showAlertModal } from '../lib/modal.js';
import { formatarNomeTitleCase } from '../lib/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('relatorio_conteudo_container');
  const btnExportarCsv = document.getElementById('btn_exportar_csv');
  const tabs = document.querySelectorAll('#tabs_relatorios button');

  let tabAtual = 'materiais';
  let dadosExportacao = [];

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.currentTarget.classList.add('active');
      tabAtual = e.currentTarget.getAttribute('data-tab');
      carregarRelatorio(tabAtual);
    });
  });

  async function carregarRelatorio(tab) {
    if (!container) return;
    container.innerHTML = `<div style="text-align: center; color: var(--cinza-texto-aux); padding: 30px;"><i class="fa-solid fa-circle-notch fa-spin"></i> Consultando dados atualizados...</div>`;
    dadosExportacao = [];

    try {
      if (tab === 'materiais') {
        // T1: Volume por Tipo de Material Reciclável
        const { data: coletas, error: errColetas } = await supabase
          .from('coleta')
          .select('cod_material, materiais(tipo)');

        if (errColetas) throw errColetas;

        const contagem = {};
        (coletas || []).forEach(c => {
          const nomeMat = c.materiais?.tipo || 'Material Cadastrado';
          contagem[nomeMat] = (contagem[nomeMat] || 0) + 1;
        });

        const totalGeral = Object.values(contagem).reduce((a, b) => a + b, 0);

        if (totalGeral === 0) {
          container.innerHTML = `<div style="text-align: center; color: var(--cinza-texto-aux); padding: 24px; background: white; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">Nenhum material ofertado registrado até o momento.</div>`;
          return;
        }

        dadosExportacao = Object.entries(contagem)
          .map(([material, ofertas]) => ({
            material,
            ofertas,
            percentual: ((ofertas / totalGeral) * 100).toFixed(1) + '%'
          }))
          .sort((a, b) => b.ofertas - a.ofertas);

        let html = `
          <div class="relatorio-card-box">
            <h5><i class="fa-solid fa-chart-pie"></i> Volume de Ofertas por Tipo de Material Reciclável</h5>
            <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Volume de materiais disponibilizados para coleta (ordenado dos mais ofertados para os menos ofertados).</p>
            <div class="relatorio-table-wrapper">
              <table class="tabela-relatorio-clean">
                <thead>
                  <tr>
                    <th>Posição / Categoria do Material</th>
                    <th style="text-align: center;">Total de Ofertas</th>
                    <th class="text-right">Participação (%)</th>
                  </tr>
                </thead>
                <tbody>
        `;

        dadosExportacao.forEach((item, index) => {
          html += `
            <tr>
              <td style="font-weight: 700;">#${index + 1} ${item.material}</td>
              <td style="text-align: center; font-weight: 800; color: #1b6d24;">${item.ofertas}</td>
              <td style="text-align: right; font-weight: 700; color: #1b6d24;">${item.percentual}</td>
            </tr>
          `;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;

      } else if (tab === 'catadores') {
        // T2: Ranking de Catadores
        const { data: catadores, error: errCat } = await supabase
          .from('catador')
          .select('id, nome, bairro, sem_residencia');

        if (errCat) throw errCat;

        const { data: coletas } = await supabase
          .from('coleta')
          .select('catador_id');

        const contagemColetas = {};
        (coletas || []).forEach(c => {
          if (c.catador_id) contagemColetas[c.catador_id] = (contagemColetas[c.catador_id] || 0) + 1;
        });

        let rankingList = (catadores || []).map(cat => ({
          nome: formatarNomeTitleCase(cat.nome || 'Catador Autônomo'),
          bairro: cat.sem_residencia ? 'Sem moradia' : (cat.bairro ? formatarNomeTitleCase(cat.bairro) : 'Não Informado'),
          total_coletas: contagemColetas[cat.id] || 0
        })).sort((a, b) => b.total_coletas - a.total_coletas);

        if (rankingList.length === 0) {
          container.innerHTML = `<div style="text-align: center; color: var(--cinza-texto-aux); padding: 24px; background: white; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">Nenhum catador cadastrado até o momento.</div>`;
          return;
        }

        dadosExportacao = rankingList;

        let html = `
          <div class="relatorio-card-box">
            <h5><i class="fa-solid fa-trophy" style="color: #fbc02d;"></i> Ranking de Atendimento por Catadores Autônomos</h5>
            <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Catadores cadastrados e volume de coletas atreladas a cada um.</p>
            <div class="relatorio-table-wrapper">
              <table class="tabela-relatorio-clean">
                <thead>
                  <tr>
                    <th>Posição / Catador</th>
                    <th>Bairro</th>
                    <th class="text-right">Coletas Atribuídas</th>
                  </tr>
                </thead>
                <tbody>
        `;

        rankingList.forEach((item, index) => {
          const medalha = index === 0 
            ? '<i class="fa-solid fa-trophy" style="color: #fbc02d;"></i>' 
            : (index === 1 
              ? '<i class="fa-solid fa-medal" style="color: #9e9e9e;"></i>' 
              : (index === 2 
                ? '<i class="fa-solid fa-award" style="color: #cd7f32;"></i>' 
                : `#${index + 1}`));

          html += `
            <tr>
              <td style="font-weight: 700;">${medalha} ${item.nome}</td>
              <td style="color: #555;">${item.bairro}</td>
              <td style="text-align: right; font-weight: 800; color: #1b6d24;">${item.total_coletas} coletas</td>
            </tr>
          `;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;

      } else if (tab === 'cidadaos') {
        // T3: Ranking de Cidadãos
        const { data: cidadaos, error: errCid } = await supabase
          .from('cidadao')
          .select('id, nome, bairro');

        if (errCid) throw errCid;

        const { data: coletas } = await supabase
          .from('coleta')
          .select('cidadao_id');

        const contagemOfertante = {};
        (coletas || []).forEach(c => {
          if (c.cidadao_id) contagemOfertante[c.cidadao_id] = (contagemOfertante[c.cidadao_id] || 0) + 1;
        });

        let rankingCid = (cidadaos || []).map(cid => ({
          nome: formatarNomeTitleCase(cid.nome || 'Cidadão Ofertante'),
          bairro: cid.bairro ? formatarNomeTitleCase(cid.bairro) : 'Não Informado',
          materiais_ofertados: contagemOfertante[cid.id] || 0
        })).sort((a, b) => b.materiais_ofertados - a.materiais_ofertados);

        if (rankingCid.length === 0) {
          container.innerHTML = `<div style="text-align: center; color: var(--cinza-texto-aux); padding: 24px; background: white; border-radius: 12px; border: 1px dashed rgba(0,0,0,0.1);">Nenhum cidadão cadastrado até o momento.</div>`;
          return;
        }

        dadosExportacao = rankingCid;

        let html = `
          <div class="relatorio-card-box">
            <h5><i class="fa-solid fa-medal" style="color: #0288d1;"></i> Ranking de Participação dos Cidadãos</h5>
            <p style="font-size: 0.85rem; color: #555; margin-bottom: 14px; margin-top: 0;">Moradores cadastrados e total de doações de materiais efetuadas.</p>
            <div class="relatorio-table-wrapper">
              <table class="tabela-relatorio-clean">
                <thead>
                  <tr>
                    <th>Cidadão Ofertante</th>
                    <th>Bairro</th>
                    <th class="text-right">Total de Materiais Doados</th>
                  </tr>
                </thead>
                <tbody>
        `;

        rankingCid.forEach((item, index) => {
          html += `
            <tr>
              <td style="font-weight: 700;">#${index + 1} ${item.nome}</td>
              <td style="color: #555;">${item.bairro}</td>
              <td style="text-align: right; font-weight: 800; color: #1b6d24;">${item.materiais_ofertados} ofertas</td>
            </tr>
          `;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML = html;

      } else if (tab === 'geografico') {
        // T4: Mapeamento Territorial & Inclusão Social
        const [catRes, cidRes, colRes] = await Promise.all([
          supabase.from('catador').select('bairro, sem_residencia'),
          supabase.from('cidadao').select('bairro, sem_residencia'),
          supabase.from('coleta').select('local_retirada(nome, bairro), cidadao(bairro)')
        ]);

        const catadores = catRes.data || [];
        const cidadaos = cidRes.data || [];
        const coletas = colRes.data || [];

        // Mapeamento 1: Catadores por Bairro
        const catadoresPorBairro = {};
        let catadoresSemResidencia = 0;
        catadores.forEach(c => {
          if (c.sem_residencia) {
            catadoresSemResidencia++;
          } else {
            const bRaw = c.bairro?.trim() || 'Não Informado';
            const b = bRaw.toLowerCase() === 'não informado' ? 'Não Informado' : formatarNomeTitleCase(bRaw);
            catadoresPorBairro[b] = (catadoresPorBairro[b] || 0) + 1;
          }
        });

        // Mapeamento 2: Cidadãos por Bairro
        const cidadaosPorBairro = {};
        cidadaos.forEach(c => {
          const bRaw = c.bairro?.trim() || 'Não Informado';
          const b = bRaw.toLowerCase() === 'não informado' ? 'Não Informado' : formatarNomeTitleCase(bRaw);
          cidadaosPorBairro[b] = (cidadaosPorBairro[b] || 0) + 1;
        });

        // Mapeamento 3: Volume de Ofertas por Localidade e Bairro (Separados)
        const reciclaPorLocal = {};
        coletas.forEach(c => {
          const localNomeRaw = c.local_retirada?.nome?.trim() || 'Ponto de Coleta Principal';
          const bRaw = c.local_retirada?.bairro?.trim() || c.cidadao?.bairro?.trim() || 'Não Informado';
          const localNome = formatarNomeTitleCase(localNomeRaw);
          const bairroNome = bRaw.toLowerCase() === 'não informado' ? 'Não Informado' : formatarNomeTitleCase(bRaw);
          const chave = `${localNome}|||${bairroNome}`;
          reciclaPorLocal[chave] = (reciclaPorLocal[chave] || 0) + 1;
        });

        dadosExportacao = [];
        Object.entries(catadoresPorBairro).forEach(([b, qtd]) => {
          dadosExportacao.push({ tipo: 'Catador', bairro: b, quantidade: qtd });
        });
        if (catadoresSemResidencia > 0) {
          dadosExportacao.push({ tipo: 'Catador', bairro: 'Sem moradia', quantidade: catadoresSemResidencia });
        }
        Object.entries(cidadaosPorBairro).forEach(([b, qtd]) => {
          dadosExportacao.push({ tipo: 'Cidadão', bairro: b, quantidade: qtd });
        });

        let html = `
          <div style="background: #e8f5e9; border: 1px solid #a5d6a7; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
            <h4 style="color: var(--verde-escuro, #1b6d24); font-size: 1.05rem; font-weight: 800; margin-bottom: 8px;">
              <i class="fa-solid fa-map-location-dot"></i> Mapeamento Territorial & Inclusão Social
            </h4>
            <p style="font-size: 0.9rem; color: #172b16; margin: 0; line-height: 1.6;">
              A opção de cadastro "Sem moradia" (Mapeamento Solidário) foi desenvolvida para promover a inclusão cidadã e produtiva dos catadores em situação de vulnerabilidade social, assegurando o direito de prestar serviços e receber solicitações de coleta com dignidade e sem restrições.
            </p>
          </div>

          <div class="grid-relatorios-duplo">
            
            <!-- Tabela Catadores por Bairro -->
            <div class="relatorio-card-box" style="margin-bottom: 0;">
              <h5><i class="fa-solid fa-id-card"></i> Catadores por Bairro</h5>
              <div class="relatorio-table-wrapper">
                <table class="tabela-relatorio-clean">
                  <thead>
                    <tr>
                      <th>Bairro</th>
                      <th class="text-right">Catadores</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(catadoresPorBairro).sort((a, b) => b[1] - a[1]).map(([b, qtd]) => `
                      <tr>
                        <td style="font-weight: 600;">
                          <i class="fa-solid fa-location-dot" style="color: #2e7d32; font-size: 11px; margin-right: 6px;"></i> ${b}
                        </td>
                        <td style="text-align: right; font-weight: 800; color: #1b6d24;">${qtd}</td>
                      </tr>
                    `).join('')}
                    ${catadoresSemResidencia > 0 ? `
                      <tr class="linha-sem-moradia">
                        <td><i class="fa-solid fa-person-shelter" style="color: #e65100; margin-right: 6px;"></i> Sem moradia</td>
                        <td style="text-align: right;">${catadoresSemResidencia}</td>
                      </tr>
                    ` : ''}
                    ${catadores.length === 0 ? `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #999;">Nenhum catador cadastrado</td></tr>` : ''}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tabela Cidadãos por Bairro -->
            <div class="relatorio-card-box" style="margin-bottom: 0;">
              <h5><i class="fa-solid fa-user"></i> Cidadãos por Bairro</h5>
              <div class="relatorio-table-wrapper">
                <table class="tabela-relatorio-clean">
                  <thead>
                    <tr>
                      <th>Bairro</th>
                      <th class="text-right">Cidadãos</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${Object.entries(cidadaosPorBairro).sort((a, b) => b[1] - a[1]).map(([b, qtd]) => `
                      <tr>
                        <td style="font-weight: 600;">
                          <i class="fa-solid fa-house-user" style="color: #0288d1; font-size: 11px; margin-right: 6px;"></i> ${b}
                        </td>
                        <td style="text-align: right; font-weight: 800; color: #1b6d24;">${qtd}</td>
                      </tr>
                    `).join('')}
                    ${cidadaos.length === 0 ? `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #999;">Nenhum cidadão cadastrado</td></tr>` : ''}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- Regiões e Pontos de Coleta que Mais Reciclam -->
          <div class="relatorio-card-box">
            <h5><i class="fa-solid fa-fire" style="color: #e65100;"></i> Locais e Bairros com Maior Volume de Reciclagem</h5>
            <div class="relatorio-table-wrapper">
              <table class="tabela-relatorio-clean">
                <thead>
                  <tr>
                    <th>Ponto de Coleta (Localidade)</th>
                    <th>Bairro</th>
                    <th class="text-right">Total de Ofertas</th>
                  </tr>
                </thead>
                <tbody>
                  ${Object.entries(reciclaPorLocal).sort((a, b) => b[1] - a[1]).map(([chave, qtd]) => {
                    const [localNome, bairroNome] = chave.split('|||');
                    return `
                      <tr>
                        <td style="font-weight: 700; color: #1b6d24;">
                          <i class="fa-solid fa-location-dot" style="color: #2e7d32; margin-right: 6px;"></i> ${localNome}
                        </td>
                        <td style="color: #555;">${bairroNome}</td>
                        <td style="text-align: right; font-weight: 800; color: #2e7d32;">${qtd} ofertas</td>
                      </tr>
                    `;
                  }).join('')}
                  ${coletas.length === 0 ? `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #999;">Nenhuma oferta registrada ainda</td></tr>` : ''}
                </tbody>
              </table>
            </div>
          </div>
        `;

        container.innerHTML = html;
      }

    } catch (err) {
      console.error('Erro ao processar relatórios:', err);
      container.innerHTML = `<div class="status-message error">Erro ao consultar dados do relatório.</div>`;
    }
  }

  if (btnExportarCsv) {
    btnExportarCsv.addEventListener('click', async () => {
      btnExportarCsv.disabled = true;
      btnExportarCsv.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Gerando Relatório Consolidado...';

      try {
        // Consulta todos os 4 relatórios em paralelo para montar as 4 abas no Excel
        const [resColetas, resCat, resCid, resGeoCat, resGeoCid, resGeoCol] = await Promise.all([
          supabase.from('coleta').select('cod_material, materiais(tipo)'),
          supabase.from('catador').select('id, nome, bairro, sem_residencia'),
          supabase.from('cidadao').select('id, nome, bairro'),
          supabase.from('catador').select('bairro, sem_residencia'),
          supabase.from('cidadao').select('bairro, sem_residencia'),
          supabase.from('coleta').select('cidadao(bairro), catador_id, cidadao_id')
        ]);

        // 1. Aba Material (Ordenado do mais ofertado para o menos ofertado)
        const contagemMat = {};
        (resColetas?.data || []).forEach(c => {
          const nomeMat = c.materiais?.tipo || 'Material Cadastrado';
          contagemMat[nomeMat] = (contagemMat[nomeMat] || 0) + 1;
        });
        const totalMat = Object.values(contagemMat).reduce((a, b) => a + b, 0);
        const matData = Object.entries(contagemMat).map(([material, ofertas]) => ({
          material,
          ofertas,
          percentual: totalMat > 0 ? ((ofertas / totalMat) * 100).toFixed(1) + '%' : '0%'
        })).sort((a, b) => b.ofertas - a.ofertas);

        // 2. Aba Catadores
        const contagemCatColetas = {};
        (resGeoCol?.data || []).forEach(c => {
          if (c.catador_id) contagemCatColetas[c.catador_id] = (contagemCatColetas[c.catador_id] || 0) + 1;
        });
        const catData = (resCat?.data || []).map(cat => ({
          nome: cat.nome || 'Catador Autônomo',
          bairro: cat.sem_residencia ? 'Sem moradia' : (cat.bairro || 'Não Informado'),
          total_coletas: contagemCatColetas[cat.id] || 0
        })).sort((a, b) => b.total_coletas - a.total_coletas);

        // 3. Aba Cidadãos
        const contagemCidColetas = {};
        (resGeoCol?.data || []).forEach(c => {
          if (c.cidadao_id) contagemCidColetas[c.cidadao_id] = (contagemCidColetas[c.cidadao_id] || 0) + 1;
        });
        const cidData = (resCid?.data || []).map(cid => ({
          nome: cid.nome || 'Cidadão Ofertante',
          bairro: cid.bairro || 'Não Informado',
          materiais_ofertados: contagemCidColetas[cid.id] || 0
        })).sort((a, b) => b.materiais_ofertados - a.materiais_ofertados);

        // 4. Aba Mapeamento Territorial
        const geoData = [];
        const catBairros = {};
        let catSemMoradia = 0;
        (resGeoCat?.data || []).forEach(c => {
          if (c.sem_residencia) catSemMoradia++;
          else catBairros[c.bairro?.trim() || 'Não Informado'] = (catBairros[c.bairro?.trim() || 'Não Informado'] || 0) + 1;
        });
        Object.entries(catBairros).sort((a, b) => b[1] - a[1]).forEach(([b, q]) => geoData.push({ tipo: 'Catadores', bairro: b, quantidade: q }));
        if (catSemMoradia > 0) geoData.push({ tipo: 'Catadores', bairro: 'Sem moradia', quantidade: catSemMoradia });

        const cidBairros = {};
        (resGeoCid?.data || []).forEach(c => {
          cidBairros[c.bairro?.trim() || 'Não Informado'] = (cidBairros[c.bairro?.trim() || 'Não Informado'] || 0) + 1;
        });
        Object.entries(cidBairros).sort((a, b) => b[1] - a[1]).forEach(([b, q]) => geoData.push({ tipo: 'Cidadãos', bairro: b, quantidade: q }));

        // Gerar arquivo Excel consolidado com 4 abas (Worksheets)
        exportarRelatorioConsolidadoExcel(matData, catData, cidData, geoData);

      } catch (err) {
        console.error('Erro ao exportar relatório:', err);
        showAlertModal({ title: 'Erro de Exportação', message: 'Erro ao gerar relatório consolidado: ' + err.message });
      } finally {
        btnExportarCsv.disabled = false;
        btnExportarCsv.innerHTML = '<i class="fa-solid fa-file-excel" style="color: #2e7d32;"></i> Exportar Relatório em CSV / Excel (4 Abas)';
      }
    });
  }

  function exportarRelatorioConsolidadoExcel(matData, catData, cidData, geoData) {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1B6D24" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center"/>
  </Style>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="12" ss:Color="#1B6D24"/>
   <Interior ss:Color="#E8F5E9" ss:Pattern="Solid"/>
  </Style>
 </Styles>`;

    // Aba 1: Volume por Material
    let tab1Xml = `<Worksheet ss:Name="Volume por Material"><Table>
      <Row><Cell ss:StyleID="Title"><Data ss:Type="String">RELATÓRIO DE VOLUME POR TIPO DE MATERIAL</Data></Cell></Row>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Categoria do Material</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Total de Ofertas</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Participação (%)</Data></Cell>
      </Row>`;
    (matData || []).forEach(item => {
      tab1Xml += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(item.material)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.ofertas}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.percentual)}</Data></Cell>
      </Row>`;
    });
    tab1Xml += `</Table></Worksheet>`;

    // Aba 2: Ranking Catadores
    let tab2Xml = `<Worksheet ss:Name="Ranking Catadores"><Table>
      <Row><Cell ss:StyleID="Title"><Data ss:Type="String">RANKING DE ATENDIMENTO POR CATADORES</Data></Cell></Row>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Catador</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Bairro</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Coletas Atribuídas</Data></Cell>
      </Row>`;
    (catData || []).forEach(item => {
      tab2Xml += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(item.nome)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.bairro)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.total_coletas}</Data></Cell>
      </Row>`;
    });
    tab2Xml += `</Table></Worksheet>`;

    // Aba 3: Ranking Cidadãos
    let tab3Xml = `<Worksheet ss:Name="Ranking Cidadãos"><Table>
      <Row><Cell ss:StyleID="Title"><Data ss:Type="String">RANKING DE DOAÇÕES DOS CIDADÃOS</Data></Cell></Row>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Cidadão Ofertante</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Bairro</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Materiais Doados</Data></Cell>
      </Row>`;
    (cidData || []).forEach(item => {
      tab3Xml += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(item.nome)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.bairro)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.materiais_ofertados}</Data></Cell>
      </Row>`;
    });
    tab3Xml += `</Table></Worksheet>`;

    // Aba 4: Mapeamento Territorial
    let tab4Xml = `<Worksheet ss:Name="Mapeamento Territorial"><Table>
      <Row><Cell ss:StyleID="Title"><Data ss:Type="String">MAPEAMENTO TERRITORIAL &amp; INCLUSÃO SOCIAL</Data></Cell></Row>
      <Row>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Categoria</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Bairro</Data></Cell>
        <Cell ss:StyleID="Header"><Data ss:Type="String">Quantidade</Data></Cell>
      </Row>`;
    (geoData || []).forEach(item => {
      tab4Xml += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(item.tipo)}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(item.bairro)}</Data></Cell>
        <Cell><Data ss:Type="Number">${item.quantidade}</Data></Cell>
      </Row>`;
    });
    tab4Xml += `</Table></Worksheet>`;

    const xmlFooter = `</Workbook>`;
    const fullXml = xmlHeader + tab1Xml + tab2Xml + tab3Xml + tab4Xml + xmlFooter;

    const blob = new Blob(['\uFEFF' + fullXml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_consolidado_reciclagem_solidaria.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  carregarRelatorio('materiais');
});
