/**
 * Componente de Modal do Sistema — Reciclagem Solidária
 * Substitui os popups nativos confirm() do navegador por modais modernos da aplicação.
 */

export function showConfirmModal({
  title = 'Confirmação',
  message = 'Deseja prosseguir com esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = '#1b6d24',
  onConfirm = () => {}
}) {
  // Remove modal existente se houver
  const existingModal = document.getElementById('custom-confirm-modal');
  if (existingModal) existingModal.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'custom-confirm-modal';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #ffffff;
    border-radius: 16px;
    max-width: 420px;
    width: 100%;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid #e0e0e0;
  `;

  box.innerHTML = `
    <h3 style="margin: 0; font-size: 1.2rem; font-weight: 800; color: var(--verde-escuro, #1b6d24);">
      ${title}
    </h3>
    <p style="margin: 0; font-size: 0.92rem; color: #555; line-height: 1.5;">
      ${message}
    </p>
    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
      <button id="modal-btn-cancel" style="padding: 10px 20px; font-size: 0.88rem; background: #f1f3f1; color: #444; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; transition: background 0.2s;">
        ${cancelText}
      </button>
      <button id="modal-btn-confirm" style="padding: 10px 20px; font-size: 0.88rem; background: ${confirmColor}; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.15); transition: opacity 0.2s;">
        ${confirmText}
      </button>
    </div>
  `;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  const btnCancel = box.querySelector('#modal-btn-cancel');
  const btnConfirm = box.querySelector('#modal-btn-confirm');

  btnCancel.addEventListener('click', () => {
    backdrop.remove();
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) backdrop.remove();
  });

  btnConfirm.addEventListener('click', async () => {
    backdrop.remove();
    await onConfirm();
  });
}

export function showAlertModal({
  title = 'Aviso do Sistema',
  message = '',
  buttonText = 'Entendido',
  confirmColor = '#1b6d24',
  onOk = () => {}
}) {
  const existingModal = document.getElementById('custom-alert-modal');
  if (existingModal) existingModal.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'custom-alert-modal';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 16px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #ffffff;
    border-radius: 16px;
    max-width: 420px;
    width: 100%;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
    display: flex;
    flex-direction: column;
    gap: 16px;
    border: 1px solid #e0e0e0;
  `;

  box.innerHTML = `
    <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: var(--verde-escuro, #1b6d24); display: flex; align-items: center; gap: 8px;">
      <i class="fa-solid fa-circle-exclamation" style="color: #e65100;"></i> ${title}
    </h3>
    <p style="margin: 0; font-size: 0.92rem; color: #555; line-height: 1.5;">
      ${message}
    </p>
    <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
      <button id="modal-alert-ok" style="padding: 10px 22px; font-size: 0.88rem; background: ${confirmColor}; color: #ffffff; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
        ${buttonText}
      </button>
    </div>
  `;

  backdrop.appendChild(box);
  document.body.appendChild(backdrop);

  const btnOk = box.querySelector('#modal-alert-ok');
  btnOk.addEventListener('click', async () => {
    backdrop.remove();
    await onOk();
  });
}
