import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { listarTiposMaterial, uploadFotoMaterial } from '../services/materiais.js';
import { listarLocaisRetirada, criarOferta } from '../services/coletas.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador']);
  if (!perfil) return;

  const form = document.getElementById('oferta-form');
  const selectMaterial = document.getElementById('cod_material');
  const selectLocal = document.getElementById('local_retirada_id');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnEnviar = document.getElementById('btn-enviar');
  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');

  if (btnVoltar) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      redirecionarPorPerfil(perfil.tipo);
    });
  }

  // Carregar catálogo de materiais e pontos de coleta do banco de dados
  try {
    const [materiais, locais] = await Promise.all([
      listarTiposMaterial(),
      listarLocaisRetirada()
    ]);

    if (materiais && materiais.length > 0) {
      selectMaterial.innerHTML = '<option value="">-- Selecione o Tipo de Material --</option>';
      materiais.forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat.cod_material;
        opt.textContent = mat.tipo;
        selectMaterial.appendChild(opt);
      });
    }

    if (locais && locais.length > 0) {
      selectLocal.innerHTML = '<option value="">-- Selecione o Ponto de Retirada --</option>';
      locais.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.nome;
        selectLocal.appendChild(opt);
      });
    }
  } catch (err) {
    console.error('Erro ao carregar dados do banco de dados:', err);
  }

  // Envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedbackMsg.style.display = 'none';

    const cod_material = selectMaterial.value;
    const quantidade = document.getElementById('quantidade').value.trim();
    const fotoFile = document.getElementById('foto').files[0];
    const local_retirada_id = selectLocal.value;

    if (!cod_material) {
      showError('Por favor, selecione o tipo de material.');
      return;
    }

    if (!local_retirada_id) {
      showError('Por favor, selecione o ponto de coleta/retirada.');
      return;
    }

    try {
      btnEnviar.disabled = true;
      btnEnviar.innerText = 'ENVIANDO...';

      let foto_url = null;
      if (fotoFile) {
        btnEnviar.innerText = 'ENVIANDO FOTO...';
        try {
          foto_url = await uploadFotoMaterial(fotoFile);
        } catch (imgErr) {
          console.warn('Falha no upload da foto, continuando sem imagem:', imgErr);
        }
      }

      btnEnviar.innerText = 'SALVANDO OFERTA...';
      await criarOferta({
        cod_material: parseInt(cod_material, 10),
        quantidade,
        foto_url,
        local_retirada_id
      });

      showSuccess('Material cadastrado para retirada com sucesso!');
      form.reset();
      
      setTimeout(() => {
        window.location.href = './minhas-ofertas.html';
      }, 1800);

    } catch (err) {
      console.error('Erro ao criar oferta:', err);
      showError(err.message || 'Erro ao cadastrar material para retirada.');
      btnEnviar.disabled = false;
      btnEnviar.innerText = 'CADASTRAR MATERIAL';
    }
  });

  function showError(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg error';
    feedbackMsg.style.display = 'block';
  }

  function showSuccess(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg success';
    feedbackMsg.style.display = 'block';
  }
});
