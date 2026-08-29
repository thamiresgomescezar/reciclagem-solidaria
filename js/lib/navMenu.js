import { getPerfilAtual, logout } from '../services/auth.js';
import { podeInstalarPWA, dispararInstalacaoPWA } from './pwa.js';

/**
 * Módulo de Menu de Navegação Hambúrguer (Drawer Slide-Out)
 * Funciona em todas as páginas do sistema e inclui o guia permanente de atalho na tela inicial
 */

export async function initNavMenu() {
  const menuBtn = document.querySelector('.top-menu-btn') || document.getElementById('btn_menu_drawer');

  if (menuBtn && !document.getElementById('nav-drawer-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'nav-drawer-overlay';
    overlay.className = 'sidebar-overlay';

    const drawer = document.createElement('aside');
    drawer.id = 'nav-drawer';
    drawer.className = 'sidebar-drawer';

    document.body.appendChild(overlay);
    document.body.appendChild(drawer);

    let perfil = null;
    try {
      perfil = await getPerfilAtual();
    } catch (e) {
      console.log('Navegação visitante');
    }

    const isLogged = !!perfil;
    const tipo = perfil ? perfil.tipo : null;
    const nome = perfil && perfil.dados ? (perfil.dados.nome || perfil.dados.email) : 'Visitante';

    const inPages = window.location.pathname.includes('/pages/');
    const p = (path) => inPages ? path : `pages/${path}`;

    let linksHtml = '';

    if (!isLogged) {
      linksHtml += `
        <li class="sidebar-nav-item"><a href="${p('login.html')}"><i class="fa-solid fa-right-to-bracket"></i> Fazer Login</a></li>
        <li class="sidebar-nav-item"><a href="${p('cadastro.html')}"><i class="fa-solid fa-user-plus"></i> Criar Conta</a></li>
      `;
    } else {
      if (tipo === 'administrador') {
        linksHtml += `
          <li class="sidebar-nav-item"><a href="${p('dashboard-admin.html')}"><i class="fa-solid fa-house"></i> Início / Painel Admin</a></li>
          <li class="sidebar-nav-item"><a href="${p('meu-perfil.html')}"><i class="fa-solid fa-user-gear"></i> Meu Perfil / Dados</a></li>
          <li class="sidebar-nav-item"><a href="${p('inserir-material.html')}"><i class="fa-solid fa-circle-plus"></i> Inserir Material</a></li>
          <li class="sidebar-nav-item"><a href="${p('gestao-coletas.html')}"><i class="fa-solid fa-recycle"></i> Gestão de Coletas</a></li>
          <li class="sidebar-nav-item"><a href="${p('definir-agenda.html')}"><i class="fa-solid fa-calendar-days"></i> Definir Agenda</a></li>
          <li class="sidebar-nav-item"><a href="${p('editar-local.html')}"><i class="fa-solid fa-map-location-dot"></i> Locais de Coleta</a></li>
          <li class="sidebar-nav-item"><a href="${p('gestao-materiais.html')}"><i class="fa-solid fa-boxes-stacked"></i> Tipos de Materiais</a></li>
          <li class="sidebar-nav-item"><a href="${p('relatorios.html')}"><i class="fa-solid fa-chart-column"></i> Relatórios</a></li>
          <li class="sidebar-nav-item"><a href="${p('usuarios-cadastrados.html')}"><i class="fa-solid fa-users"></i> Usuários Cadastrados</a></li>
          <li class="sidebar-nav-item"><a href="${p('catadores-cadastrados.html')}"><i class="fa-solid fa-sitemap"></i> Catadores Cadastrados</a></li>
          <li class="sidebar-nav-item"><a href="${p('cadastrar-catador.html')}"><i class="fa-solid fa-id-card"></i> Cadastrar Catador</a></li>
          <li class="sidebar-nav-item"><a href="${p('mensagens.html')}"><i class="fa-solid fa-comments"></i> Mensagens</a></li>
          <li class="sidebar-nav-item"><a href="${p('publicacoes.html')}"><i class="fa-solid fa-bullhorn"></i> Publicações</a></li>
        `;
      } else if (tipo === 'catador') {
        linksHtml += `
          <li class="sidebar-nav-item"><a href="${p('dashboard-catador.html')}"><i class="fa-solid fa-house"></i> Início / Painel Catador</a></li>
          <li class="sidebar-nav-item"><a href="${p('meu-perfil.html')}"><i class="fa-solid fa-user-gear"></i> Meu Perfil / Dados</a></li>
          <li class="sidebar-nav-item"><a href="${p('catador-materiais.html')}"><i class="fa-solid fa-recycle"></i> Materiais Disponíveis</a></li>
          <li class="sidebar-nav-item"><a href="${p('minhas-coletas.html')}"><i class="fa-solid fa-clipboard-check"></i> Minhas Coletas</a></li>
          <li class="sidebar-nav-item"><a href="${p('agenda-horarios.html')}"><i class="fa-solid fa-calendar-days"></i> Agenda & Horários</a></li>
          <li class="sidebar-nav-item"><a href="${p('relatorios-catador.html')}"><i class="fa-solid fa-chart-column"></i> Meus Relatórios</a></li>
          <li class="sidebar-nav-item"><a href="${p('mensagens.html')}"><i class="fa-solid fa-comments"></i> Mensagens</a></li>
          <li class="sidebar-nav-item"><a href="${p('publicacoes.html')}"><i class="fa-solid fa-bullhorn"></i> Publicações</a></li>
        `;
      } else {
        linksHtml += `
          <li class="sidebar-nav-item"><a href="${p('dashboard-cidadao.html')}"><i class="fa-solid fa-house"></i> Início / Painel Cidadão</a></li>
          <li class="sidebar-nav-item"><a href="${p('meu-perfil.html')}"><i class="fa-solid fa-user-gear"></i> Meu Perfil / Dados</a></li>
          <li class="sidebar-nav-item"><a href="${p('inserir-material.html')}"><i class="fa-solid fa-circle-plus"></i> Inserir Material</a></li>
          <li class="sidebar-nav-item"><a href="${p('minhas-ofertas.html')}"><i class="fa-solid fa-clipboard-check"></i> Minhas Ofertas</a></li>
          <li class="sidebar-nav-item"><a href="${p('agenda-horarios.html')}"><i class="fa-solid fa-calendar-days"></i> Agenda & Horários</a></li>
          <li class="sidebar-nav-item"><a href="${p('catadores-cadastrados.html')}"><i class="fa-solid fa-sitemap"></i> Catadores Cadastrados</a></li>
          <li class="sidebar-nav-item"><a href="${p('mensagens.html')}"><i class="fa-solid fa-comments"></i> Mensagens</a></li>
          <li class="sidebar-nav-item"><a href="${p('publicacoes.html')}"><i class="fa-solid fa-bullhorn"></i> Publicações</a></li>
        `;
      }
    }

    // Itens Comuns Globais (Atalho na Tela Inicial, Quem Somos e Logout)
    linksHtml += `
      <li class="sidebar-nav-item" style="border-top: 1px solid rgba(0,0,0,0.06); margin-top: 8px; padding-top: 8px;">
        <a href="#" id="menu_link_adicionar_atalho" style="color: var(--verde-escuro, #1b6d24); font-weight: 700;">
          <i class="fa-solid fa-mobile-screen-button"></i> Adicionar à Tela Inicial
        </a>
      </li>
      <li class="sidebar-nav-item"><a href="${p('quem-somos.html')}"><i class="fa-solid fa-circle-info"></i> Quem Somos</a></li>
    `;

    if (isLogged) {
      linksHtml += `
        <li class="sidebar-nav-item"><a href="#" class="btn-logout" id="menu-logout-btn" style="color: #c62828;"><i class="fa-solid fa-right-from-bracket"></i> Sair (${nome})</a></li>
      `;
    }

    drawer.innerHTML = `
      <div class="sidebar-header">
        <h2>Navegação</h2>
        <button class="nav-drawer-close" id="btnCloseNavDrawer" aria-label="Fechar menu"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <ul class="sidebar-nav-list">
        ${linksHtml}
      </ul>
    `;

    function openMenu() {
      overlay.classList.add('active');
      drawer.classList.add('active');
    }

    function closeMenu() {
      overlay.classList.remove('active');
      drawer.classList.remove('active');
    }

    menuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMenu();
    });

    overlay.addEventListener('click', closeMenu);
    const closeBtn = drawer.querySelector('#btnCloseNavDrawer');
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Evento do Link "Adicionar à Tela Inicial"
    const linkAtalho = drawer.querySelector('#menu_link_adicionar_atalho');
    if (linkAtalho) {
      linkAtalho.addEventListener('click', async (e) => {
        e.preventDefault();
        closeMenu();

        if (podeInstalarPWA()) {
          const instalou = await dispararInstalacaoPWA();
          if (instalou) return;
        }

        abrirModalInstrucoesAtalho();
      });
    }
  }
}

/**
 * Cria e exibe o modal global de instruções de atalho na tela inicial
 */
export function abrirModalInstrucoesAtalho() {
  let modal = document.getElementById('modal_global_instrucoes_atalho');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal_global_instrucoes_atalho';
    modal.style.cssText = 'display: flex; position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 3000; align-items: center; justify-content: center; padding: 20px;';

    modal.innerHTML = `
      <div style="background: white; border-radius: 20px; max-width: 520px; width: 100%; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; animation: fadeIn 0.2s ease;">
        <!-- Cabeçalho -->
        <div style="padding: 18px 24px; background: var(--verde-escuro, #1b6d24); color: white; display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-mobile-screen-button"></i> Adicionar à Tela Inicial
          </h3>
          <button type="button" id="btn_fechar_modal_atalho_top" style="background: none; border: none; color: white; font-size: 1.25rem; cursor: pointer;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Conteúdo -->
        <div style="padding: 24px; font-size: 0.92rem; line-height: 1.6; color: #172b16;">
          <p style="margin-top: 0; margin-bottom: 16px;">
            Adicione o atalho da plataforma <strong>Reciclagem Solidária</strong> à tela inicial do seu celular para abrir com 1 toque:
          </p>

          <!-- Android -->
          <div style="background: #f4f8f3; border: 1px solid #c8e6c9; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px;">
            <strong style="color: var(--verde-escuro, #1b6d24); font-size: 0.95rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <i class="fa-brands fa-android" style="font-size: 1.1rem;"></i> No Android (Google Chrome):
            </strong>
            <ol style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: #444;">
              <li>Toque nos <strong>3 pontinhos</strong> (<i class="fa-solid fa-ellipsis-vertical"></i>) no canto superior direito do Chrome.</li>
              <li>Selecione <strong>"Adicionar à tela inicial"</strong> ou <strong>"Instalar aplicativo"</strong>.</li>
              <li>Toque em <strong>"Adicionar"</strong> (ou <strong>"Instalar"</strong>) para confirmar.</li>
            </ol>
          </div>

          <!-- iPhone -->
          <div style="background: #f4f8f3; border: 1px solid #c8e6c9; border-radius: 12px; padding: 14px 16px;">
            <strong style="color: var(--verde-escuro, #1b6d24); font-size: 0.95rem; display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <i class="fa-brands fa-apple" style="font-size: 1.1rem;"></i> No iPhone (Safari):
            </strong>
            <ol style="margin: 0; padding-left: 20px; font-size: 0.88rem; color: #444;">
              <li>Toque no botão <strong>Compartilhar</strong> (<i class="fa-solid fa-arrow-up-from-bracket"></i>) na barra inferior do Safari.</li>
              <li>Role a lista e toque em <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Toque em <strong>"Adicionar"</strong> no canto superior direito para confirmar.</li>
            </ol>
          </div>
        </div>

        <!-- Rodapé -->
        <div style="padding: 14px 24px; background: #f9fbf9; border-top: 1px solid rgba(0,0,0,0.06); display: flex; justify-content: flex-end;">
          <button type="button" id="btn_fechar_modal_atalho_bottom" class="btn-avancar" style="width: auto; padding: 8px 20px; font-size: 0.9rem;">
            <i class="fa-solid fa-check"></i> Entendi
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const btnCloseTop = modal.querySelector('#btn_fechar_modal_atalho_top');
    const btnCloseBottom = modal.querySelector('#btn_fechar_modal_atalho_bottom');

    const fechar = () => { modal.style.display = 'none'; };
    if (btnCloseTop) btnCloseTop.addEventListener('click', fechar);
    if (btnCloseBottom) btnCloseBottom.addEventListener('click', fechar);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) fechar();
    });
  } else {
    modal.style.display = 'flex';
  }
}

// Handler Global de Logout para qualquer botão de Sair no sistema
document.addEventListener('click', async (e) => {
  const target = e.target.closest('#btn-logout-top, .btn-logout, #menu-logout-btn, #btn-logout');
  if (target) {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.warn('Sessão encerrada localmente:', err);
    }
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? './login.html' : './pages/login.html';
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavMenu);
} else {
  initNavMenu();
}
