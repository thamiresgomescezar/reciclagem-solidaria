import { getPerfilAtual } from '../services/auth.js';
import { showAlertModal } from './modal.js';

/**
 * Guarda de Rota — Protege páginas restritas por tipo de perfil
 * @param {Array<string>} perfisPermitidos - Array de tipos permitidos, ex: ['administrador', 'cidadao', 'catador']
 */
export async function proibirAcessoInvalido(perfisPermitidos = []) {
  const inPages = window.location.pathname.includes('/pages/');
  const loginUrl = inPages ? './login.html' : './pages/login.html';

  try {
    const perfilPromise = getPerfilAtual();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout de autenticação')), 5000));
    const perfil = await Promise.race([perfilPromise, timeoutPromise]).catch(err => {
      console.warn('Timeout ou erro ao verificar perfil na rota:', err);
      return null;
    });

    // Se não estiver logado, redireciona para login
    if (!perfil) {
      const currentPath = encodeURIComponent(window.location.pathname);
      window.location.href = `${loginUrl}?redirect=${currentPath}`;
      return null;
    }

    // Se a conta estiver desabilitada ou bloqueada
    const situacao = perfil.dados?.situacao || 'ativo';
    if (situacao !== 'ativo') {
      showAlertModal({
        title: 'Acesso Bloqueado',
        message: `Sua conta está ${situacao}. Por favor, entre em contato com a administração.`,
        onOk: () => { window.location.href = loginUrl; }
      });
      return null;
    }

    // Se o perfil do usuário não estiver na lista de permitidos
    const tipo = perfil.tipo || 'cidadao';
    if (perfisPermitidos.length > 0 && !perfisPermitidos.includes(tipo)) {
      showAlertModal({
        title: 'Acesso Restrito',
        message: `Seu perfil (${tipo}) não possui permissão para acessar esta página. Você será redirecionado para o seu painel principal.`,
        onOk: () => { redirecionarPorPerfil(tipo); }
      });
      return null;
    }

    return perfil;
  } catch (err) {
    console.error('Erro na guarda de rota:', err);
    window.location.href = loginUrl;
    return null;
  }
}

export function redirecionarPorPerfil(tipo) {
  const destinos = {
    cidadao: 'dashboard-cidadao.html',
    administrador: 'dashboard-admin.html',
    catador: 'dashboard-catador.html'
  };
  const target = destinos[tipo] || 'dashboard-cidadao.html';
  const path = window.location.pathname;
  if (path.includes('/pages/')) {
    const base = path.substring(0, path.indexOf('/pages/') + 7);
    window.location.href = `${base}${target}`;
  } else {
    window.location.href = `./pages/${target}`;
  }
}

/**
 * Função utilitária compátivel com protegerRota
 */
export async function protegerRota(perfisPermitidos = []) {
  const perfil = await proibirAcessoInvalido(perfisPermitidos);
  if (!perfil) return { permitido: false, perfil: null, user: null, dados: null };
  return {
    permitido: true,
    perfil,
    user: perfil.user,
    dados: perfil.dados
  };
}
