import { login } from '../services/auth.js';
import { redirecionarPorPerfil } from '../lib/routeGuard.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const feedbackMsg = document.getElementById('feedback-msg');
  const btnLogin = document.getElementById('btn-login');

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('confirmed') === 'true' || window.location.hash.includes('access_token')) {
    showSuccess('E-mail verificado com sucesso! Digite sua senha para entrar na plataforma.');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedbackMsg.className = 'feedback-msg';
    feedbackMsg.style.display = 'none';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      btnLogin.disabled = true;
      btnLogin.innerText = 'ENTRANDO...';

      const { perfil } = await login(email, password);

      showSuccess(`Autenticado com sucesso! Bem-vindo, ${perfil.dados.nome}.`);
      
      setTimeout(() => {
        const redirectUrl = urlParams.get('redirect');
        if (redirectUrl) {
          window.location.href = decodeURIComponent(redirectUrl);
        } else {
          redirecionarPorPerfil(perfil.tipo);
        }
      }, 1000);

    } catch (err) {
      console.error('Erro no login:', err);
      showError(err.message || 'E-mail ou senha inválidos.');
      btnLogin.disabled = false;
      btnLogin.innerText = 'ENTRAR';
    }
  });

  function showError(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg error';
  }

  function showSuccess(msg) {
    feedbackMsg.textContent = msg;
    feedbackMsg.className = 'feedback-msg success';
  }
});
