import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { listarTiposMaterial, uploadFotoMaterial } from '../services/materiais.js';
import { listarLocaisRetirada, criarOferta } from '../services/coletas.js';
import { showConfirmModal } from '../lib/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['cidadao', 'administrador']);
  if (!perfil) return;

  const form = document.getElementById('oferta-form');
  const selectMaterial = document.getElementById('cod_material');
  const selectLocal = document.getElementById('local_retirada_id');
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
    }

    if (listaLocais && listaLocais.length > 0) {
      selectLocal.innerHTML = '<option value="">-- Selecione o Ponto de Retirada --</option>';
      listaLocais.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = `${loc.nome} (${loc.bairro || loc.cidade || 'Ponto de Coleta'})`;
        selectLocal.appendChild(opt);
      });
      // Se houver apenas 1 local ativo, seleciona automaticamente
      if (listaLocais.length === 1) {
        selectLocal.value = listaLocais[0].id;
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
    const quantidade = document.getElementById('quantidade').value.trim();
    const fotoFile = inputFoto?.files[0];
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
        quantidade,
        foto_url,
        local_retirada_id
      });

      // Limpa formulário, preview de foto e reabilita botão de envio
      form.reset();
      limparPreviewFoto();
      if (listaLocais.length === 1) {
        selectLocal.value = listaLocais[0].id;
      }
      btnEnviar.disabled = false;
      btnEnviar.innerText = 'CADASTRAR MATERIAL';

      // Abre modal padronizado do sistema perguntando se o usuário deseja ser redirecionado
      showConfirmModal({
        title: 'Material Cadastrado com Sucesso!',
        message: 'Sua oferta de material reciclável foi registrada no sistema e já está disponível para os catadores.\n\nDeseja ir para a tela de Minhas Ofertas para acompanhar o status ou prefere continuar cadastrando outros materiais?',
        confirmText: 'Ver Minhas Ofertas',
        cancelText: 'Cadastrar Outro Material',
        confirmColor: '#1b6d24',
        icon: '<i class="fa-solid fa-circle-check" style="color: #2e7d32; font-size: 1.25rem;"></i>',
        onConfirm: () => {
          window.location.href = './minhas-ofertas.html';
        },
        onCancel: () => {
          showSuccess('Material cadastrado com sucesso! O formulário foi limpo para novos cadastros.');
          document.getElementById('quantidade').focus();
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
