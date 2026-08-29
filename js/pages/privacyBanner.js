/**
 * Componente: Banner de Termos de Privacidade e LGPD
 */

export function initPrivacyBanner() {
  if (localStorage.getItem('privacy_accepted') === 'true') return;

  const banner = document.createElement('div');
  banner.id = 'privacy-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #ffffff;
    border-top: 2px solid var(--verde-marca);
    padding: 16px 24px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 13px;
    color: var(--cinza-texto);
  `;

  banner.innerHTML = `
    <div>
       <strong>Privacidade e Proteção de Dados (LGPD):</strong>
      Utilizamos cookies e dados essenciais para o funcionamento do sistema Reciclagem Solidária e gestão de coletas.
      Seus dados sensíveis são protegidos e visíveis apenas conforme as regras da plataforma.
    </div>
    <button id="btn-accept-privacy" class="btn-pill" style="width: auto; padding: 8px 20px; font-size: 13px; white-space: nowrap;">
      CONCORDAR E CONTINUAR
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById('btn-accept-privacy').addEventListener('click', () => {
    localStorage.setItem('privacy_accepted', 'true');
    banner.remove();
  });
}

