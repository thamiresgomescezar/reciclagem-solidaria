/**
 * Módulo de Validação e Padronização de Dados de Entrada
 * Garante que nomes, e-mails, telefones e endereços fiquem padronizados no banco de dados.
 */

// Lista de preposições e conectivos mantidos em minúsculas
const CONECTIVOS_MINUSCULOS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'van', 'von', 'del', 'd']);

/**
 * Formata um nome em Title Case (Primeira letra maiúscula), preservando conectivos.
 * Exemplo: "CLÁUDIA NUNES DA SILVA" -> "Cláudia Nunes da Silva"
 */
export function formatarNomeTitleCase(str) {
  if (!str || typeof str !== 'string') return '';
  const limpo = str.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!limpo) return '';

  return limpo
    .split(' ')
    .map((palavra, index) => {
      if (index > 0 && CONECTIVOS_MINUSCULOS.has(palavra)) {
        return palavra;
      }
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(' ');
}

/**
 * Valida se o nome contém apenas letras, acentos e espaços (sem números ou símbolos)
 */
export function validarENormalizarNome(nome) {
  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    return { ok: false, erro: 'O nome deve ter pelo menos 3 caracteres.' };
  }

  const regexSomenteLetras = /^[A-Za-zÀ-ÖØ-öø-ÿ\s\-']+$/;
  if (!regexSomenteLetras.test(nome.trim())) {
    return { ok: false, erro: 'O nome deve conter apenas letras e acentos (sem números ou caracteres especiais).' };
  }

  return { ok: true, valor: formatarNomeTitleCase(nome) };
}

/**
 * Valida e normaliza e-mail (lowercase e sem espaços extras)
 */
export function validarENormalizarEmail(email) {
  if (!email || typeof email !== 'string') {
    return { ok: false, erro: 'Por favor, informe um e-mail válido.' };
  }

  const emailLimpo = email.trim().toLowerCase();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regexEmail.test(emailLimpo)) {
    return { ok: false, erro: 'O formato do e-mail é inválido. Ex: nome@exemplo.com' };
  }

  return { ok: true, valor: emailLimpo };
}

/**
 * Normaliza e valida número de telefone (10 ou 11 dígitos apenas com números)
 */
export function validarENormalizarTelefone(telefone) {
  if (!telefone) return { ok: true, valor: '' }; // Opcional se for vazio

  const apenasNumeros = String(telefone).replace(/\D/g, '');
  if (apenasNumeros.length > 0 && (apenasNumeros.length < 10 || apenasNumeros.length > 11)) {
    return { ok: false, erro: 'O telefone deve ter DDD + número (10 ou 11 dígitos numericos).' };
  }

  return { ok: true, valor: apenasNumeros };
}

/**
 * Formata um objeto de endereço padronizando os campos de texto sem impor valores padrão de cidade/estado
 */
export function formatarEndereco(end = {}) {
  const cidadeTrim = (end.cidade || '').trim();
  const estadoTrim = (end.estado || '').trim();

  return {
    rua: formatarNomeTitleCase(end.rua || ''),
    numero: (end.numero || '').trim().toUpperCase(),
    complemento: (end.complemento || '').trim(),
    bairro: formatarNomeTitleCase(end.bairro || ''),
    cidade: cidadeTrim ? formatarNomeTitleCase(cidadeTrim) : null,
    estado: estadoTrim ? estadoTrim.toUpperCase() : null,
    cep: (end.cep || '').replace(/\D/g, ''),
    sem_residencia: !!end.sem_residencia
  };
}
