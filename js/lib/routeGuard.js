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
    const perfil = await getPerfilAtual();

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
  const inPages = window.location.pathname.includes('/pages/');
  const p = (target) => inPages ? `./${target}` : `./pages/${target}`;

  switch (tipo) {
    case 'administrador':
      window.location.href = p('dashboard-admin.html');
      break;
    case 'catador':
      window.location.href = p('dashboard-catador.html');
      break;
    case 'cidadao':
    default:
      window.location.href = p('dashboard-cidadao.html');
      break;
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
