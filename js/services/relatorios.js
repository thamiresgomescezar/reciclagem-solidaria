// ==========================================================
// T6.1–T6.5 — Serviço de relatórios
// Consultas agregadas para admin + histórico do catador
// ==========================================================
import { supabase } from '../lib/supabaseClient.js';

/**
 * T6.1 — Volume por tipo de material (admin)
 * @returns {{ok: boolean, dados?: Array<{tipo: string, total: number}>, erro?: string}}
 */
export async function relatorioVolumePorMaterial() {
  try {
    const { data, error } = await supabase
      .from('coleta')
      .select('cod_material, materiais(tipo)');

    if (error) return { ok: false, erro: error.message };

    const contagem = new Map();
    for (const c of data || []) {
      const tipo = c.materiais?.tipo || 'Desconhecido';
      contagem.set(tipo, (contagem.get(tipo) || 0) + 1);
    }

    const resultado = [...contagem.entries()]
      .map(([tipo, total]) => ({ tipo, total }))
      .sort((a, b) => b.total - a.total);

    return { ok: true, dados: resultado };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * T6.2 — Ranking de catadores/cidadãos (admin)
 * @returns {{ok: boolean, dados?: Array<{nome: string, tipo: string, total: number}>, erro?: string}}
 */
export async function relatorioRanking() {
  try {
    // Coletas retiradas por catador
    const { data: statusRetirado } = await supabase
      .from('status')
      .select('cod_status')
      .eq('status', 'retirado')
      .maybeSingle();

    const { data: coletas, error } = await supabase
      .from('coleta')
      .select('catador_id, cidadao_id, cod_status');

    if (error) return { ok: false, erro: error.message };

    const catadorCount = new Map();
    const cidadaoCount = new Map();

    for (const c of coletas || []) {
      if (c.catador_id) {
        catadorCount.set(c.catador_id, (catadorCount.get(c.catador_id) || 0) + 1);
      }
      if (c.cidadao_id) {
        cidadaoCount.set(c.cidadao_id, (cidadaoCount.get(c.cidadao_id) || 0) + 1);
      }
    }

    // Busca nomes
    const catadorIds = [...catadorCount.keys()];
    const cidadaoIds = [...cidadaoCount.keys()];
    const nomes = new Map();

    if (catadorIds.length) {
      const { data: catadores } = await supabase.from('catador').select('id, nome').in('id', catadorIds);
      (catadores || []).forEach((c) => nomes.set(c.id, c.nome));
    }
    if (cidadaoIds.length) {
      const { data: cidadaos } = await supabase.from('cidadao').select('id, nome').in('id', cidadaoIds);
      (cidadaos || []).forEach((c) => nomes.set(c.id, c.nome));
    }

    const resultado = [
      ...[...catadorCount.entries()].map(([id, total]) => ({ nome: nomes.get(id) || 'Catador', tipo: 'Catador', total })),
      ...[...cidadaoCount.entries()].map(([id, total]) => ({ nome: nomes.get(id) || 'Cidadão', tipo: 'Cidadão', total })),
    ].sort((a, b) => b.total - a.total);

    return { ok: true, dados: resultado };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * T6.3 — Relatório geográfico (admin)
 * Distribuição de catadores/cidadãos por bairro/cidade + sem residência.
 * @returns {{ok: boolean, dados?: Array, erro?: string}}
 */
export async function relatorioGeografico() {
  try {
    const [cidadaos, catadores] = await Promise.all([
      supabase.from('cidadao').select('bairro, cidade, sem_residencia'),
      supabase.from('catador').select('bairro, cidade, sem_residencia'),
    ]);

    if (cidadaos.error) return { ok: false, erro: cidadaos.error.message };
    if (catadores.error) return { ok: false, erro: catadores.error.message };

    const mapa = new Map();

    const chave = (bairro, cidade) => `${cidade || '—'} / ${bairro || '—'}`;

    for (const c of cidadaos.data || []) {
      const k = chave(c.bairro, c.cidade);
      const item = mapa.get(k) || { cidade: c.cidade || '—', bairro: c.bairro || '—', cidadaos: 0, catadores: 0, sem_residencia: 0 };
      item.cidadaos++;
      if (c.sem_residencia) item.sem_residencia++;
      mapa.set(k, item);
    }
    for (const c of catadores.data || []) {
      const k = chave(c.bairro, c.cidade);
      const item = mapa.get(k) || { cidade: c.cidade || '—', bairro: c.bairro || '—', cidadaos: 0, catadores: 0, sem_residencia: 0 };
      item.catadores++;
      if (c.sem_residencia) item.sem_residencia++;
      mapa.set(k, item);
    }

    return { ok: true, dados: [...mapa.values()] };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * T6.4 — Histórico do catador logado (via catador_id_atual via RLS)
 * @returns {{ok: boolean, dados?: Array, erro?: string}}
 */
export async function relatorioHistoricoCatador() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { ok: false, erro: 'Não autenticado.' };

    // Busca o id do catador vinculado ao usuário
    const { data: catador } = await supabase
      .from('catador')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!catador) return { ok: false, erro: 'Perfil de catador não encontrado.' };

    const { data, error } = await supabase
      .from('coleta')
      .select('*, materiais(*), status(*)')
      .eq('catador_id', catador.id)
      .order('criado_em', { ascending: false });

    if (error) return { ok: false, erro: error.message };
    return { ok: true, dados: data || [] };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

/**
 * T6.5 — Exporta um array de objetos para CSV (JS puro, sem lib).
 * @param {Array<object>} dados
 * @param {string} nomeArquivo
 */
export function exportarCSV(dados, nomeArquivo = 'relatorio.csv') {
  if (!dados.length) return;

  const colunas = Object.keys(dados[0]);
  const linhas = dados.map((linha) =>
    colunas.map((col) => {
      const valor = linha[col];
      if (valor === null || valor === undefined) return '';
      return `"${String(valor).replace(/"/g, '""')}"`;
    }).join(';')
  );

  const csv = [colunas.join(';'), ...linhas].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}