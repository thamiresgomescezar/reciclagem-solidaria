import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { listarTiposMaterial, uploadFotoMaterial } from '../services/materiais.js';
import { listarLocaisRetirada, criarOferta } from '../services/coletas.js';
import { listarDatasDisponiveisCatador, listarAgendaPorLocal } from '../services/agenda.js';
import { extrairPadraoSemanal } from './calendarPicker.js';
import { showConfirmModal, showAlertModal } from '../lib/modal.js';
import { formatarQuantidadePadrao } from '../lib/validation.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador']);
  if (!perfil) return;

  const form = document.getElementById('oferta-form');
  const selectMaterial = document.getElementById('cod_material');
  const inputQtdNum = document.getElementById('quantidade_numero');
  const selectQtdUnidade = document.getElementById('quantidade_unidade');
  const boxQtdOutro = document.getElementById('box-unidade-outro');
  const inputQtdOutro = document.getElementById('quantidade_outro');
  const selectLocal = document.getElementById('local_retirada_id');
  const boxAgenda = document.getElementById('box-confirmacao-agenda');
  const conteudoAgenda = document.getElementById('conteudo-agenda-resumo');
  const checkConfirmarAgenda = document.getElementById('check-confirmar-agenda');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnEnviar = document.getElementById('btn-enviar');
  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');

  let listaLocais = [];

  if (btnVoltar) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      redirecionarPorPerfil(perfil.tipo);
    });
  }

  // Alternância do campo de unidade customizada "Outro"
  if (selectQtdUnidade && boxQtdOutro) {
    selectQtdUnidade.addEventListener('change', () => {
      boxQtdOutro.style.display = selectQtdUnidade.value === 'outro' ? 'block' : 'none';
      if (selectQtdUnidade.value === 'outro' && inputQtdOutro) {
        inputQtdOutro.focus();
      }
    });
  }

  async function atualizarResumoAgenda(localId) {
    if (!boxAgenda || !conteudoAgenda) return;
    if (!localId) {
      boxAgenda.style.display = 'none';
      return;
    }

    boxAgenda.style.display = 'block';
    conteudoAgenda.innerHTML = '<span style="color: #666;"><i class="fa-solid fa-circle-notch fa-spin"></i> Verificando dias e horários de atendimento da unidade...</span>';

    try {
      const [datas, agendaCompleta] = await Promise.all([
        listarDatasDisponiveisCatador(localId).catch(() => []),
        listarAgendaPorLocal(localId).catch(() => [])
      ]);

      const padraoSemanal = extrairPadraoSemanal(agendaCompleta);
      
      // Agrupa e consolida intervalos sobrepostos por data única (YYYY-MM-DD)
      const mapaDatas = {};
      (datas || []).forEach(d => {
        if (!d.data) return;
        if (!mapaDatas[d.data]) {
          mapaDatas[d.data] = [];
        }
        if (d.hora_inicio && d.hora_fim) {
          mapaDatas[d.data].push({
            hora_inicio: d.hora_inicio,
            hora_fim: d.hora_fim,
            pausa_inicio: d.pausa_inicio || null,
            pausa_fim: d.pausa_fim || null
          });
        }
      });

      let datasUnicas = Object.keys(mapaDatas).sort();

      // Se houver menos de 6 datas futuras cadastradas diretamente (ex: virada de mês ainda não salva pelo admin),
      // projeta os próximos dias úteis seguindo ESTRITAMENTE o padrão configurado no mês anterior!
      if (datasUnicas.length < 6) {
        const hojeObj = new Date();
        for (let i = 0; i < 45 && datasUnicas.length < 6; i++) {
          const checkDate = new Date(hojeObj.getFullYear(), hojeObj.getMonth(), hojeObj.getDate() + i);
          const y = checkDate.getFullYear();
          const m = String(checkDate.getMonth() + 1).padStart(2, '0');
          const d = String(checkDate.getDate()).padStart(2, '0');
          const dtStr = `${y}-${m}-${d}`;

          if (!mapaDatas[dtStr]) {
            const dayOfWeek = checkDate.getDay();
            const configDia = padraoSemanal[dayOfWeek];
            if (configDia && configDia.disponivel) {
              mapaDatas[dtStr] = [{
                hora_inicio: configDia.hora_inicio || '08:00',
                hora_fim: configDia.hora_fim || '17:00',
                hora_inicio_2: configDia.hora_inicio_2 || '',
                hora_fim_2: configDia.hora_fim_2 || '',
                pausa_inicio: configDia.pausa_inicio || null,
                pausa_fim: configDia.pausa_fim || null
              }];
              if (!datasUnicas.includes(dtStr)) {
                datasUnicas.push(dtStr);
              }
            }
          }
        }
        datasUnicas.sort();
      }

      if (datasUnicas.length > 0) {
        const proximas = datasUnicas.slice(0, 6);
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

        const listaHtml = proximas.map(dtStr => {
          const [ano, mes, dia] = dtStr.split('-').map(Number);
          const dateObj = new Date(ano, mes - 1, dia);
          const diaSemanaNome = diasSemana[dateObj.getDay()];
          const dataFmt = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
          
          const intervalosConsolidados = consolidarIntervalos(mapaDatas[dtStr]);
          const turnos = intervalosConsolidados.length > 0 
            ? intervalosConsolidados.map(i => `${i.hora_inicio} às ${i.hora_fim}`).join(' e ')
            : '08:00 às 17:00';

          return `<span style="background: #ffffff; border: 1px solid #c8e6c9; padding: 4px 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 5px; font-weight: 700; font-size: 0.82rem; color: #1b6d24; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">📅 ${dataFmt} (${diaSemanaNome}): <span style="color: #444; font-weight: 600;">${turnos}</span></span>`;
        }).join(' ');

        conteudoAgenda.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="font-weight: 700; color: #1b6d24; font-size: 0.86rem;">
              <i class="fa-solid fa-clock"></i> Próximos dias liberados para retirada pelos catadores:
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;">
              ${listaHtml}
            </div>
          </div>
        `;
      } else {
        conteudoAgenda.innerHTML = `
          <div style="color: #444; font-size: 0.86rem;">
            <strong>Horário de Atendimento da Unidade:</strong> Segunda a Sexta das 08h às 17h.
          </div>
        `;
      }
    } catch (e) {
      conteudoAgenda.innerHTML = `
        <div style="color: #444; font-size: 0.86rem;">
          <strong>Horário de Atendimento da Unidade:</strong> Segunda a Sexta das 08h às 17h.
        </div>
      `;
    }
  }

  if (selectLocal) {
    selectLocal.addEventListener('change', () => {
      atualizarResumoAgenda(selectLocal.value);
    });
  }

  // Carregar catálogo de materiais e pontos de coleta do banco de dados
  try {
    const [materiais, locais] = await Promise.all([
      listarTiposMaterial(),
      listarLocaisRetirada()
    ]);

    listaLocais = locais || [];

    if (materiais && materiais.length > 0) {
      selectMaterial.innerHTML = '<option value="">-- Selecione o Tipo de Material --</option>';
      materiais.forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat.cod_material;
        opt.textContent = mat.tipo;
        selectMaterial.appendChild(opt);
      });
    } else {
      selectMaterial.innerHTML = '<option value="">-- Nenhum Material Disponível no Momento --</option>';
      selectMaterial.disabled = true;
    }

    if (listaLocais && listaLocais.length > 0) {
      selectLocal.innerHTML = '<option value="">-- Selecione o Ponto de Retirada --</option>';
      listaLocais.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.nome;
        selectLocal.appendChild(opt);
      });
      // Se houver apenas 1 local ativo, seleciona automaticamente e carrega agenda
      if (listaLocais.length === 1) {
        selectLocal.value = listaLocais[0].id;
        atualizarResumoAgenda(listaLocais[0].id);
      }
    } else {
      selectLocal.innerHTML = '<option value="">-- Nenhum Ponto de Coleta Ativo no Momento --</option>';
      selectLocal.disabled = true;
      showError('Atenção: Não há nenhum ponto de coleta ativo no sistema no momento. Entre em contato com a administração.');
      btnEnviar.disabled = true;
    }
  } catch (err) {
    console.error('Erro ao carregar dados do banco de dados:', err);
  }

  // Elementos do Preview de Foto
  const inputFoto = document.getElementById('foto');
  const boxPreviewFoto = document.getElementById('box-preview-foto');
  const imgPreview = document.getElementById('img-preview-inserir');
  const btnRemoverFoto = document.getElementById('btn-remover-foto');
  const lblFotoNome = document.getElementById('lbl-foto-nome');

  if (inputFoto) {
    inputFoto.addEventListener('change', () => {
      const file = inputFoto.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (imgPreview) imgPreview.src = e.target.result;
          if (lblFotoNome) {
            const kbSize = Math.round(file.size / 1024);
            lblFotoNome.textContent = `📷 ${file.name} (${kbSize} KB)`;
          }
          if (boxPreviewFoto) boxPreviewFoto.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        limparPreviewFoto();
      }
    });
  }

  if (btnRemoverFoto) {
    btnRemoverFoto.addEventListener('click', () => {
      limparPreviewFoto();
    });
  }

  function limparPreviewFoto() {
    if (inputFoto) inputFoto.value = '';
    if (imgPreview) imgPreview.src = '';
    if (lblFotoNome) lblFotoNome.textContent = '';
    if (boxPreviewFoto) boxPreviewFoto.style.display = 'none';
  }

  // Envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedbackMsg.style.display = 'none';

    const cod_material = selectMaterial.value;
    const qtdNumVal = inputQtdNum ? inputQtdNum.value : '1';
    const qtdUnidadeVal = selectQtdUnidade ? selectQtdUnidade.value : 'caixa(s)';
    const qtdOutroVal = inputQtdOutro ? inputQtdOutro.value : '';
    const fotoFile = inputFoto?.files[0];
    const local_retirada_id = selectLocal.value;

    if (!cod_material) {
      showError('Por favor, selecione o tipo de material.');
      return;
    }

    let quantidadeFormatada = '';
    try {
      quantidadeFormatada = formatarQuantidadePadrao(qtdNumVal, qtdUnidadeVal, qtdOutroVal);
    } catch (qtdErr) {
      showError(qtdErr.message || 'Informe uma quantidade válida.');
      return;
    }

    if (!local_retirada_id) {
      showError('Por favor, selecione o ponto de coleta/retirada.');
      return;
    }

    if (checkConfirmarAgenda && !checkConfirmarAgenda.checked) {
      showError('Por favor, confirme que a unidade estará aberta nos horários indicados para atendimento aos catadores. Se não, entre em contato com um dos administradores para atualizar a agenda.');
      return;
    }

    try {
      btnEnviar.disabled = true;
      btnEnviar.innerText = 'ENVIANDO...';

      let foto_url = null;
      if (fotoFile) {
        btnEnviar.innerText = 'PROCESSANDO FOTO...';
        try {
          foto_url = await uploadFotoMaterial(fotoFile);
        } catch (imgErr) {
          console.warn('Falha no upload da foto, continuando sem imagem:', imgErr);
        }
      }

      btnEnviar.innerText = 'SALVANDO OFERTA...';
      await criarOferta({
        cod_material: parseInt(cod_material, 10),
        quantidade: quantidadeFormatada,
        foto_url,
        local_retirada_id
      });

      // Limpa formulário, preview de foto e reabilita botão de envio
      form.reset();
      if (inputQtdNum) inputQtdNum.value = '1';
      if (selectQtdUnidade) selectQtdUnidade.value = 'caixa(s)';
      if (boxQtdOutro) boxQtdOutro.style.display = 'none';
      if (inputQtdOutro) inputQtdOutro.value = '';
      if (checkConfirmarAgenda) checkConfirmarAgenda.checked = true;
      limparPreviewFoto();

      if (listaLocais.length === 1) {
        selectLocal.value = listaLocais[0].id;
        atualizarResumoAgenda(listaLocais[0].id);
      }
      btnEnviar.disabled = false;
      btnEnviar.innerText = 'CADASTRAR MATERIAL';

      const isAdm = perfil.tipo === 'administrador';
      showConfirmModal({
        title: 'Material Cadastrado com Sucesso!',
        message: `Sua oferta de ${quantidadeFormatada} foi registrada no sistema e já está disponível para os catadores.\n\nDeseja ir para a tela de ${isAdm ? 'Gestão de Coletas' : 'Minhas Ofertas'} para acompanhar o status ou prefere continuar cadastrando outros materiais?`,
        confirmText: isAdm ? 'Ver Gestão de Coletas' : 'Ver Minhas Ofertas',
        cancelText: 'Cadastrar Outro Material',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 1.25rem;"></i>',
        onConfirm: () => {
          window.location.href = isAdm ? './gestao-coletas.html' : './minhas-ofertas.html';
        },
        onCancel: () => {
          showSuccess('Material cadastrado com sucesso! O formulário foi limpo para novos cadastros.');
          if (inputQtdNum) inputQtdNum.focus();
        }
      });

    } catch (err) {
      console.error('Erro ao criar oferta:', err);
      showError(err.message || 'Erro ao cadastrar material para retirada.');
      btnEnviar.disabled = false;
      btnEnviar.innerText = 'CADASTRAR MATERIAL';
    }
  });

  function showError(msg) {
    if (!feedbackMsg) return;
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'status-message error';
    feedbackMsg.style.display = 'block';
    feedbackMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccess(msg) {
    if (!feedbackMsg) return;
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'status-message success';
    feedbackMsg.style.display = 'block';
  }
});

export function consolidarIntervalos(listaIntervalos) {
  if (!listaIntervalos || listaIntervalos.length === 0) return [];

  const intervalosExplicitos = [];
  listaIntervalos.forEach(i => {
    if (!i || !i.hora_inicio || !i.hora_fim) return;
    if (i.pausa_inicio && i.pausa_fim && i.pausa_fim > i.pausa_inicio) {
      intervalosExplicitos.push({ hora_inicio: i.hora_inicio, hora_fim: i.pausa_inicio });
      intervalosExplicitos.push({ hora_inicio: i.pausa_fim, hora_fim: i.hora_fim });
    } else {
      intervalosExplicitos.push({ hora_inicio: i.hora_inicio, hora_fim: i.hora_fim });
    }
  });

  const parsed = intervalosExplicitos
    .map(i => {
      const [h1, m1] = i.hora_inicio.slice(0, 5).split(':').map(Number);
      const [h2, m2] = i.hora_fim.slice(0, 5).split(':').map(Number);
      return { start: h1 * 60 + (m1 || 0), end: h2 * 60 + (m2 || 0) };
    })
    .filter(i => i.end > i.start)
    .sort((a, b) => a.start - b.start);

  if (parsed.length === 0) return [];

  const merged = [parsed[0]];
  for (let i = 1; i < parsed.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = parsed[i];

    if (curr.start <= prev.end) {
      prev.end = Math.max(prev.end, curr.end);
    } else {
      merged.push(curr);
    }
  }

  return merged.map(m => {
    const hIni = String(Math.floor(m.start / 60)).padStart(2, '0');
    const mIni = String(m.start % 60).padStart(2, '0');
    const hFim = String(Math.floor(m.end / 60)).padStart(2, '0');
    const mFim = String(m.end % 60).padStart(2, '0');
    return {
      hora_inicio: `${hIni}:${mIni}`,
      hora_fim: `${hFim}:${mFim}`
    };
  });
}
