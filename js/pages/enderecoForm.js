import { formatarNomeTitleCase, aplicarMascaraCep } from '../lib/validation.js';

export function renderEnderecoForm(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="endereco-box" style="margin-top: 0.5rem; width: 100%;">
      <div class="campo" style="margin-bottom: 0.85rem;">
        <label for="sem_residencia" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 700; color: var(--verde-escuro, #1b6d24); font-size: 0.9rem;">
          <input type="checkbox" id="sem_residencia" name="sem_residencia" style="width: 18px; height: 18px; accent-color: #1b6d24; cursor: pointer;">
          Sem moradia
        </label>
      </div>

      <div id="campos-endereco" style="display: block;">
        <!-- Linha 1: CEP -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="campo">
            <label for="end_cep">CEP:</label>
            <input type="text" id="end_cep" class="input-underline" placeholder="00000-000" maxlength="9">
          </div>
          <div></div>
        </div>

        <!-- Linha 2: Cidade e Estado -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
          <div class="campo">
            <label for="end_cidade">Cidade:</label>
            <input type="text" id="end_cidade" class="input-underline" placeholder="Ex: Franco da Rocha">
          </div>
          <div class="campo">
            <label for="end_estado">Estado:</label>
            <input type="text" id="end_estado" class="input-underline" placeholder="SP" maxlength="2" style="text-transform: uppercase;">
          </div>
        </div>

        <!-- Linha 3: Bairro -->
        <div class="campo">
          <label for="end_bairro">Bairro:</label>
          <input type="text" id="end_bairro" class="input-underline" placeholder="Ex: Centro">
        </div>

        <!-- Linha 4: Rua -->
        <div class="campo">
          <label for="end_rua">Rua:</label>
          <input type="text" id="end_rua" class="input-underline" placeholder="Ex: Rua das Flores">
        </div>

        <!-- Linha 5: Número e Complemento - Opcional -->
        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 12px;">
          <div class="campo">
            <label for="end_numero">Número:</label>
            <input type="text" id="end_numero" class="input-underline" placeholder="Ex: 123 ou S/N">
          </div>
          <div class="campo">
            <label for="end_complemento">Complemento <span style="font-size: 0.8rem; font-weight: 500; color: #777;">- Opcional</span>:</label>
            <input type="text" id="end_complemento" class="input-underline" placeholder="Ex: Bloco B, portaria principal">
          </div>
        </div>
      </div>
    </div>
  `;

  const semResidenciaCheck = document.getElementById('sem_residencia');
  const camposEnderecoBox = document.getElementById('campos-endereco');
  const inputCep = document.getElementById('end_cep');
  const inputRua = document.getElementById('end_rua');
  const inputBairro = document.getElementById('end_bairro');
  const inputCidade = document.getElementById('end_cidade');
  const inputEstado = document.getElementById('end_estado');

  if (semResidenciaCheck && camposEnderecoBox) {
    semResidenciaCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        camposEnderecoBox.style.display = 'none';
      } else {
        camposEnderecoBox.style.display = 'block';
      }
    });
  }

  // Formatação em tempo real do CEP
  if (inputCep) {
    inputCep.addEventListener('input', (e) => {
      e.target.value = aplicarMascaraCep(e.target.value);
    });

    inputCep.addEventListener('blur', async () => {
      const cepVal = inputCep.value.replace(/\D/g, '');
      if (cepVal.length === 8) {
        try {
          const resp = await fetch(`https://viacep.com.br/ws/${cepVal}/json/`);
          const data = await resp.json();
          if (!data.erro) {
            if (data.logradouro && inputRua && !inputRua.value) {
              inputRua.value = formatarNomeTitleCase(data.logradouro);
            }
            if (data.bairro && inputBairro && !inputBairro.value) {
              inputBairro.value = formatarNomeTitleCase(data.bairro);
            }
            if (data.localidade && inputCidade && !inputCidade.value) {
              inputCidade.value = formatarNomeTitleCase(data.localidade);
            }
            if (data.uf && inputEstado) {
              inputEstado.value = data.uf.toUpperCase();
            }
          }
        } catch (e) {}
      }
    });
  }

  // Formatação automática em Title Case ao sair do campo
  if (inputRua) {
    inputRua.addEventListener('blur', (e) => {
      e.target.value = formatarNomeTitleCase(e.target.value);
    });
  }
  if (inputBairro) {
    inputBairro.addEventListener('blur', (e) => {
      e.target.value = formatarNomeTitleCase(e.target.value);
    });
  }
  if (inputCidade) {
    inputCidade.addEventListener('blur', (e) => {
      e.target.value = formatarNomeTitleCase(e.target.value);
    });
  }
  if (inputEstado) {
    inputEstado.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase().slice(0, 2);
    });
  }
}

export function lerDadosEndereco() {
  const semResidencia = document.getElementById('sem_residencia')?.checked || false;
  if (semResidencia) {
    return {
      rua: null,
      numero: null,
      complemento: null,
      bairro: null,
      cidade: null,
      estado: null,
      cep: null,
      sem_residencia: true
    };
  }

  const ruaVal = document.getElementById('end_rua')?.value.trim() || null;
  const bairroVal = document.getElementById('end_bairro')?.value.trim() || null;
  const cidadeVal = document.getElementById('end_cidade')?.value.trim() || null;
  const estadoVal = document.getElementById('end_estado')?.value.trim() || null;
  const cepVal = document.getElementById('end_cep')?.value.replace(/\D/g, '') || null;

  return {
    rua: ruaVal ? formatarNomeTitleCase(ruaVal) : null,
    numero: document.getElementById('end_numero')?.value.trim() || null,
    complemento: document.getElementById('end_complemento')?.value.trim() || null,
    bairro: bairroVal ? formatarNomeTitleCase(bairroVal) : null,
    cidade: cidadeVal ? formatarNomeTitleCase(cidadeVal) : null,
    estado: estadoVal ? estadoVal.toUpperCase().slice(0, 2) : null,
    cep: cepVal || null,
    sem_residencia: false
  };
}

export function getEnderecoValues() {
  return lerDadosEndereco();
}

export function preencherEndereco(dados) {
  if (!dados) return;
  const semResCheck = document.getElementById('sem_residencia');
  const camposBox = document.getElementById('campos-endereco');

  if (dados.sem_residencia) {
    if (semResCheck) semResCheck.checked = true;
    if (camposBox) camposBox.style.display = 'none';
  } else {
    if (semResCheck) semResCheck.checked = false;
    if (camposBox) camposBox.style.display = 'block';
    if (document.getElementById('end_cep')) document.getElementById('end_cep').value = aplicarMascaraCep(dados.cep || '');
    if (document.getElementById('end_cidade')) document.getElementById('end_cidade').value = formatarNomeTitleCase(dados.cidade || '');
    if (document.getElementById('end_estado')) document.getElementById('end_estado').value = (dados.estado || '').toUpperCase();
    if (document.getElementById('end_bairro')) document.getElementById('end_bairro').value = formatarNomeTitleCase(dados.bairro || '');
    if (document.getElementById('end_rua')) document.getElementById('end_rua').value = formatarNomeTitleCase(dados.rua || '');
    if (document.getElementById('end_numero')) document.getElementById('end_numero').value = dados.numero || '';
    if (document.getElementById('end_complemento')) document.getElementById('end_complemento').value = dados.complemento || '';
  }
}

export function validarEndereco() {
  const semRes = document.getElementById('sem_residencia')?.checked || false;
  if (semRes) return null; // Sem residência é válido

  const rua = document.getElementById('end_rua')?.value.trim();
  const bairro = document.getElementById('end_bairro')?.value.trim();
  if (!rua) return 'Informe o nome da rua ou logradouro.';
  if (!bairro) return 'Informe o bairro.';
  return null;
}
