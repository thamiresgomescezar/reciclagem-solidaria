import { renderEnderecoForm, getEnderecoValues, validarEndereco } from './enderecoForm.js';
import { cadastrarCidadao, cadastrarCatador, redirectPorPerfil } from '../services/auth.js';
import { supabase } from '../lib/supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
  renderEnderecoForm('endereco-container');

  const form = document.getElementById('cadastro-form');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnCadastrar = document.getElementById('btn-cadastrar');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedbackMsg.className = 'feedback-msg';
    feedbackMsg.style.display = 'none';

    const tipoPerfil = document.getElementById('tipo_perfil').value;
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const email = document.getElementById('email').value.trim();
    
    const emailConfirmaElem = document.getElementById('email_confirma');
    const emailConfirma = emailConfirmaElem ? emailConfirmaElem.value.trim() : email;

    const senha = document.getElementById('senha').value;
    const senhaConfirma = document.getElementById('senha_confirma').value;

    const endereco = getEnderecoValues();

    // Validações no cliente
    if (!nome) {
      showError('Por favor, informe seu nome completo.');
      return;
    }

    if (!email) {
      showError('Por favor, informe seu e-mail.');
      return;
    }

    if (emailConfirmaElem && email.toLowerCase() !== emailConfirma.toLowerCase()) {
      showError('Os e-mails informados não coincidem.');
      return;
    }

    if (senha.length < 6) {
      showError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== senhaConfirma) {
      showError('As senhas informadas não coincidem.');
      return;
    }

    const erroEndereco = validarEndereco();
    if (erroEndereco) {
      showError(erroEndereco);
      return;
    }

    try {
      btnCadastrar.disabled = true;
      btnCadastrar.innerText = 'CADASTRANDO...';

      let res;
      if (tipoPerfil === 'cidadao') {
        res = await cadastrarCidadao({ nome, email, telefone, password: senha, endereco });
      } else {
        res = await cadastrarCatador({ nome, email, telefone, password: senha, endereco });
      }

      if (!res.ok) {
        showError(res.erro);
        btnCadastrar.disabled = false;
        btnCadastrar.innerText = 'CADASTRAR';
        return;
      }

      try {
        localStorage.setItem('reciclagem_tipo_usuario', tipoPerfil);
        sessionStorage.setItem('reciclagem_tipo_usuario', tipoPerfil);
      } catch (e) {}

      showSuccess('Cadastro realizado com sucesso! Redirecionando para o seu painel...');
      setTimeout(async () => {
        const { data: sData } = await supabase.auth.getSession().catch(() => ({ data: { session: null } }));
        if (sData?.session?.user) {
          redirectPorPerfil(tipoPerfil);
        } else {
          window.location.href = './login.html';
        }
      }, 1500);

    } catch (err) {
      console.error('Erro no cadastro:', err);
      showError(err.message || 'Ocorreu um erro ao realizar o cadastro.');
      btnCadastrar.disabled = false;
      btnCadastrar.innerText = 'CADASTRAR';
    }
  });

  function showError(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg error';
    feedbackMsg.style.display = 'block';
    feedbackMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showSuccess(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg success';
    feedbackMsg.style.display = 'block';
    feedbackMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
