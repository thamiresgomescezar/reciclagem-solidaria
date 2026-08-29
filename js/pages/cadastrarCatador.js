import { proibirAcessoInvalido, redirecionarPorPerfil } from '../lib/routeGuard.js';
import { renderEnderecoForm, getEnderecoValues } from './enderecoForm.js';
import { cadastrarCatadorPorTerceiros } from '../services/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const perfil = await proibirAcessoInvalido(['administrador', 'cidadao', 'catador']);
  if (!perfil) return;

  renderEnderecoForm('endereco-container');

  const btnVoltar = document.getElementById('btn-voltar') || document.getElementById('btn-voltar-top');
  if (btnVoltar) {
    btnVoltar.addEventListener('click', (e) => {
      e.preventDefault();
      redirecionarPorPerfil(perfil.tipo);
    });
  }

  const form = document.getElementById('cadastrar-catador-form');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnSalvar = document.getElementById('btn-salvar');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    esconderFeedback();

    const inputNome = document.getElementById('nome');
    const nome = inputNome?.value.trim();
    const telefone = document.getElementById('telefone')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const endereco = getEnderecoValues();

    if (!nome) {
      showError('O nome do catador é obrigatório.');
      inputNome?.focus();
      return;
    }

    try {
      btnSalvar.disabled = true;
      btnSalvar.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> SALVANDO...';

      const res = await cadastrarCatadorPorTerceiros({ nome, email, telefone, endereco });

      if (!res || !res.ok) {
        showError(res?.erro || 'Erro ao registrar o catador.');
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = '<i class="fa-solid fa-user-check"></i> REGISTRAR CATADOR';
        return;
      }

      // Restaura o botão e limpa o formulário
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = '<i class="fa-solid fa-user-check"></i> REGISTRAR CATADOR';
      form.reset();
      renderEnderecoForm('endereco-container');
      esconderFeedback();

      // Exibe Modal de Sucesso com escolhas claras e sem forçar saída da tela
      mostrarModalSucesso({
        nome,
        onCadastrarOutro: () => {
          form.reset();
          renderEnderecoForm('endereco-container');
          esconderFeedback();
          const elNome = document.getElementById('nome');
          if (elNome) {
            elNome.focus();
            elNome.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        },
        onVerLista: () => {
          window.location.href = './catadores-cadastrados.html';
        }
      });

    } catch (err) {
      console.error('Erro ao cadastrar catador:', err);
      showError(err.message || 'Erro ao registrar o catador.');
      btnSalvar.disabled = false;
      btnSalvar.innerHTML = '<i class="fa-solid fa-user-check"></i> REGISTRAR CATADOR';
    }
  });

  function esconderFeedback() {
    if (!feedbackMsg) return;
    feedbackMsg.style.display = 'none';
    feedbackMsg.className = 'status-message';
    feedbackMsg.textContent = '';
  }

  function showError(msg) {
    if (!feedbackMsg) return;
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'status-message error';
    feedbackMsg.style.display = 'block';
    feedbackMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function mostrarModalSucesso({ nome, onCadastrarOutro, onVerLista }) {
    const existingModal = document.getElementById('modal-sucesso-catador');
    if (existingModal) existingModal.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'modal-sucesso-catador';
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 16px;
    `;

    const box = document.createElement('div');
    box.style.cssText = `
      background: #ffffff;
      border-radius: 20px;
      max-width: 440px;
      width: 100%;
      padding: 28px 24px;
      box-shadow: 0 14px 40px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 14px;
      border: 1.5px solid #a5d6a7;
    `;

    box.innerHTML = `
      <div style="width: 64px; height: 64px; border-radius: 50%; background: #e8f5e9; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; margin-bottom: 2px;">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <h3 style="margin: 0; font-size: 1.3rem; font-weight: 800; color: var(--verde-escuro, #1b6d24);">
        Catador Cadastrado!
      </h3>
      <p style="margin: 0; font-size: 0.95rem; color: #444; line-height: 1.5;">
        O cadastro de <strong>${nome}</strong> foi realizado com sucesso. O catador já está disponível para receber agendamentos.
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; margin-top: 10px;">
        <button type="button" id="btn-modal-novo-cadastro" class="btn-avancar" style="width: 100%; padding: 12px; font-size: 0.95rem;">
          <i class="fa-solid fa-user-plus"></i> Cadastrar Outro Catador
        </button>
        <button type="button" id="btn-modal-ver-lista" class="btn-secondary-pill" style="width: 100%; padding: 11px; font-size: 0.9rem; justify-content: center; background: #ffffff;">
          <i class="fa-solid fa-sitemap"></i> Ver Catadores Cadastrados
        </button>
      </div>
    `;

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);

    const btnNovo = box.querySelector('#btn-modal-novo-cadastro');
    const btnLista = box.querySelector('#btn-modal-ver-lista');

    btnNovo.addEventListener('click', () => {
      backdrop.remove();
      if (onCadastrarOutro) onCadastrarOutro();
    });

    btnLista.addEventListener('click', () => {
      backdrop.remove();
      if (onVerLista) onVerLista();
    });
  }
});
