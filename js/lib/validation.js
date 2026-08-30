/**
 * Módulo de Validação e Padronização de Dados de Entrada
 * Garante que nomes, e-mails, telefones, endereços e quantidades fiquem padronizados no banco de dados.
 */

// Lista de preposições, artigos e conectivos mantidos em minúsculas
const CONECTIVOS_MINUSCULOS = new Set([
  'da', 'de', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos', 
  'com', 'para', 'por', 'sem', 'd', 'van', 'von', 'del'
]);

/**
 * Formata um texto em Title Case (Primeira letra de cada palavra maiúscula),
 * preservando conectivos e preposições em minúsculo (exceto no início da frase).
 * Exemplo: "CLÁUDIA NUNES DA SILVA" -> "Cláudia Nunes da Silva"
 * Exemplo: "RUA DAS FLORES DO CENTRO" -> "Rua das Flores do Centro"
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
 * Normaliza qualquer e-mail para caixa baixa e sem espaços em branco
 */
export function formatarEmailMinusculo(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
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
    return { ok: false, erro: 'O telefone deve ter DDD + número (10 ou 11 dígitos numéricos).' };
  }

  return { ok: true, valor: apenasNumeros };
}

/**
 * Formata uma string de telefone em tempo real para máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function aplicarMascaraTelefone(valor) {
  if (!valor) return '';
  let limpo = String(valor).replace(/\D/g, '').slice(0, 11);

  if (limpo.length <= 2) {
    return limpo.length > 0 ? `(${limpo}` : '';
  }
  if (limpo.length <= 6) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2)}`;
  }
  if (limpo.length <= 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`;
  }
  return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7, 11)}`;
}

/**
 * Formata um número de telefone salvo no banco em formato legível de exibição
 */
export function formatarTelefoneExibicao(telefone) {
  if (!telefone) return '';
  const num = String(telefone).replace(/\D/g, '');
  if (num.length === 11) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 7)}-${num.slice(7)}`;
  }
  if (num.length === 10) {
    return `(${num.slice(0, 2)}) ${num.slice(2, 6)}-${num.slice(6)}`;
  }
  return telefone;
}

/**
 * Formata um CEP em tempo real para máscara XXXXX-XXX
 */
export function aplicarMascaraCep(valor) {
  if (!valor) return '';
  let limpo = String(valor).replace(/\D/g, '').slice(0, 8);
  if (limpo.length > 5) {
    return `${limpo.slice(0, 5)}-${limpo.slice(5)}`;
  }
  return limpo;
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

/**
 * Padroniza quantitativos de materiais para inserção no banco de dados.
 * Evita ambiguidades como "um", "uma" vs "1" e padroniza a unidade de medida no singular/plural.
 * Exemplo: (1, "saco(s) grande(s)") -> "1 saco grande"
 * Exemplo: (3, "saco(s) grande(s)") -> "3 sacos grandes"
 * Exemplo: (1, "caixa(s)") -> "1 caixa"
 * Exemplo: (2, "caixa(s)") -> "2 caixas"
 * Exemplo: (15, "kg") -> "15 kg"
 */
export function formatarQuantidadePadrao(numero, unidade, complemento = '') {
  const qtdNum = parseInt(numero, 10);
  if (isNaN(qtdNum) || qtdNum <= 0) {
    throw new Error('Informe uma quantidade numérica válida maior que zero (ex: 1, 2, 5).');
  }

  const u = (unidade || '').trim().toLowerCase();

  switch (u) {
    case 'saco(s) grande(s)':
    case 'sacos grandes':
    case 'saco grande':
      return qtdNum === 1 ? '1 saco grande' : `${qtdNum} sacos grandes`;

    case 'saco(s) médio(s)':
    case 'saco(s) medio(s)':
    case 'sacos médios':
    case 'saco médio':
      return qtdNum === 1 ? '1 saco médio' : `${qtdNum} sacos médios`;

    case 'caixa(s)':
    case 'caixas':
    case 'caixa':
      return qtdNum === 1 ? '1 caixa' : `${qtdNum} caixas`;

    case 'sacola(s)':
    case 'sacolas':
    case 'sacola':
      return qtdNum === 1 ? '1 sacola' : `${qtdNum} sacolas`;

    case 'pacote(s)':
    case 'pacotes':
    case 'pacote':
      return qtdNum === 1 ? '1 pacote' : `${qtdNum} pacotes`;

    case 'fardo(s)':
    case 'fardos':
    case 'fardo':
      return qtdNum === 1 ? '1 fardo' : `${qtdNum} fardos`;

    case 'unidade(s)':
    case 'unidades':
    case 'unidade':
      return qtdNum === 1 ? '1 unidade' : `${qtdNum} unidades`;

    case 'kg':
    case 'quilo(s)':
    case 'quilos':
      return `${qtdNum} kg`;

    case 'outro':
    case 'outro (especificar)':
      const compLimpo = (complemento || '').trim().toLowerCase();
      if (!compLimpo) {
        return qtdNum === 1 ? '1 unidade' : `${qtdNum} unidades`;
      }
      return `${qtdNum} ${compLimpo}`;

    default:
      if (u) {
        return `${qtdNum} ${u}`;
      }
      return qtdNum === 1 ? '1 unidade' : `${qtdNum} unidades`;
  }
}
