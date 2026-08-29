import { supabase } from '../lib/supabaseClient.js';
import { validarENormalizarNome, validarENormalizarEmail, validarENormalizarTelefone, formatarEndereco } from '../lib/validation.js';

/**
 * Serviço de Autenticação e Perfis — Reciclagem Solidária
 */

export async function cadastrarCidadao(dados) {
  const { nome, email, telefone, senha, password, endereco, rua, numero, complemento, bairro, cidade, estado, cep, sem_residencia } = dados;
  const pwd = senha || password;

  const valNome = validarENormalizarNome(nome);
  if (!valNome.ok) return { ok: false, erro: valNome.erro };
  const nomePadrao = valNome.valor;

  const valEmail = validarENormalizarEmail(email);
  if (!valEmail.ok) return { ok: false, erro: valEmail.erro };
  const emailPadrao = valEmail.valor;

  const valTel = validarENormalizarTelefone(telefone);
  if (!valTel.ok) return { ok: false, erro: valTel.erro };
  const telPadrao = valTel.valor;

  const endPadrao = formatarEndereco({
    rua: rua || endereco?.rua,
    numero: numero || endereco?.numero,
    complemento: complemento || endereco?.complemento,
    bairro: bairro || endereco?.bairro,
    cidade: cidade || endereco?.cidade,
    estado: estado || endereco?.estado,
    cep: cep || endereco?.cep,
    sem_residencia: sem_residencia !== undefined ? sem_residencia : endereco?.sem_residencia
  });

  const { data, error } = await supabase.auth.signUp({
    email: emailPadrao,
    password: pwd,
    options: {
      data: { nome: nomePadrao, perfil: 'cidadao' }
    }
  });

  if (error) {
    if (error.message?.includes('User already registered')) {
      return { ok: false, erro: 'Este e-mail já está cadastrado no sistema. Tente fazer login ou use outro e-mail.' };
    }
    if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
      return { ok: false, erro: 'Limite de envio de e-mails de confirmação excedido pelo Supabase. Aguarde alguns minutos para tentar novamente.' };
    }
    return { ok: false, erro: error.message };
  }
  
  if (!data.user) return { ok: false, erro: 'Não foi possível registrar o usuário no Supabase Auth.' };

  let session = data.session;
  if (!session) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email: emailPadrao, password: pwd }).catch(() => ({}));
    if (signInData?.session) {
      session = signInData.session;
    }
  }

  const { error: profileError } = await supabase
    .from('cidadao')
    .insert([{
      id: data.user.id,
      nome: nomePadrao,
      email: emailPadrao,
      telefone: telPadrao,
      rua: endPadrao.rua,
      numero: endPadrao.numero,
      complemento: endPadrao.complemento,
      bairro: endPadrao.bairro,
      cidade: endPadrao.cidade,
      estado: endPadrao.estado,
      cep: endPadrao.cep,
      sem_residencia: endPadrao.sem_residencia,
      nivel_acesso: 'cidadao',
      situacao: 'ativo'
    }]);

  if (profileError) {
    console.error('Erro ao inserir perfil de cidadão:', profileError);
    if (profileError.code === '42P01' || profileError.message?.includes('relation "public.cidadao" does not exist')) {
      return { ok: false, erro: 'A tabela "cidadao" não existe no Supabase. Por favor, execute o script db/schema.sql no SQL Editor do Supabase.' };
    }
    if (profileError.message?.includes('row-level security') || profileError.code === '42501') {
      return { ok: false, erro: 'Conta criada, mas a confirmação de e-mail está ativa no Supabase. Desative "Confirm email" em Authentication -> Providers -> Email no Supabase.' };
    }
    return { ok: false, erro: profileError.message };
  }

  return { ok: true, data };
}

export async function cadastrarCatador(dados) {
  const { nome, email, telefone, senha, password, endereco, rua, numero, complemento, bairro, cidade, estado, cep, sem_residencia } = dados;
  const pwd = senha || password;

  const valNome = validarENormalizarNome(nome);
  if (!valNome.ok) return { ok: false, erro: valNome.erro };
  const nomePadrao = valNome.valor;

  const valEmail = validarENormalizarEmail(email);
  if (!valEmail.ok) return { ok: false, erro: valEmail.erro };
  const emailPadrao = valEmail.valor;

  const valTel = validarENormalizarTelefone(telefone);
  if (!valTel.ok) return { ok: false, erro: valTel.erro };
  const telPadrao = valTel.valor;

  const endPadrao = formatarEndereco({
    rua: rua || endereco?.rua,
    numero: numero || endereco?.numero,
    complemento: complemento || endereco?.complemento,
    bairro: bairro || endereco?.bairro,
    cidade: cidade || endereco?.cidade,
    estado: estado || endereco?.estado,
    cep: cep || endereco?.cep,
    sem_residencia: sem_residencia !== undefined ? sem_residencia : endereco?.sem_residencia
  });

  const { data, error } = await supabase.auth.signUp({
    email: emailPadrao,
    password: pwd,
    options: {
      data: { nome: nomePadrao, perfil: 'catador' }
    }
  });

  if (error) {
    if (error.message?.includes('User already registered')) {
      return { ok: false, erro: 'Este e-mail já está cadastrado no sistema. Tente fazer login ou use outro e-mail.' };
    }
    if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
      return { ok: false, erro: 'Limite de envio de e-mails de confirmação excedido pelo Supabase. Aguarde alguns minutos para tentar novamente.' };
    }
    return { ok: false, erro: error.message };
  }

  if (!data.user) return { ok: false, erro: 'Não foi possível registrar o usuário no Supabase Auth.' };

  let session = data.session;
  if (!session) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email: emailPadrao, password: pwd }).catch(() => ({}));
    if (signInData?.session) {
      session = signInData.session;
    }
  }

  // Verifica se já existe um registro pré-existente de catador cadastrado por terceiros com este e-mail
  let catadorExistente = null;
  try {
    const { data: catPre } = await supabase
      .from('catador')
      .select('id, auth_user_id')
      .ilike('email', emailPadrao)
      .is('auth_user_id', null)
      .maybeSingle();
    catadorExistente = catPre;
  } catch (e) {}

  let profileError = null;

  if (catadorExistente) {
    // Vincula a nova conta de login ao registro pré-existente do catador (preservando o ID, histórico de coletas e agendamentos)
    const { error: updateErr } = await supabase
      .from('catador')
      .update({
        auth_user_id: data.user.id,
        nome: nomePadrao,
        telefone: telPadrao,
        rua: endPadrao.rua,
        numero: endPadrao.numero,
        complemento: endPadrao.complemento,
        bairro: endPadrao.bairro,
        cidade: endPadrao.cidade,
        estado: endPadrao.estado,
        cep: endPadrao.cep,
        sem_residencia: endPadrao.sem_residencia,
        situacao: 'ativo'
      })
      .eq('id', catadorExistente.id);

    profileError = updateErr;
  } else {
    // Insere novo catador caso não exista cadastro prévio
    const { error: insertErr } = await supabase
      .from('catador')
      .insert([{
        auth_user_id: data.user.id,
        nome: nomePadrao,
        email: emailPadrao,
        telefone: telPadrao,
        rua: endPadrao.rua,
        numero: endPadrao.numero,
        complemento: endPadrao.complemento,
        bairro: endPadrao.bairro,
        cidade: endPadrao.cidade,
        estado: endPadrao.estado,
        cep: endPadrao.cep,
        sem_residencia: endPadrao.sem_residencia,
        situacao: 'ativo',
        cadastrado_por: null
      }]);

    profileError = insertErr;
  }

  if (profileError) {
    console.error('Erro ao vincular/inserir perfil de catador:', profileError);
    if (profileError.code === '42P01' || profileError.message?.includes('relation "public.catador" does not exist')) {
      return { ok: false, erro: 'A tabela "catador" não existe no Supabase. Por favor, execute o script db/schema.sql no SQL Editor do Supabase.' };
    }
    return { ok: false, erro: profileError.message };
  }

  return { ok: true, data };
}

// Cadastro de Catador por Terceiros (sem app/login)
export async function cadastrarCatadorPorTerceiros({ nome, email, telefone, endereco }) {
  try {
    const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
    if (sessionErr || !session || !session.user) {
      return { ok: false, erro: 'Usuário não autenticado. Faça login novamente.' };
    }

    const valNome = validarENormalizarNome(nome);
    if (!valNome.ok) return { ok: false, erro: valNome.erro };
    const nomePadrao = valNome.valor;

    let emailPadrao = null;
    if (email && typeof email === 'string' && email.trim().length > 0) {
      const valEmail = validarENormalizarEmail(email.trim());
      if (!valEmail.ok) return { ok: false, erro: valEmail.erro };
      emailPadrao = valEmail.valor;
    }

    let telPadrao = null;
    if (telefone && typeof telefone === 'string' && telefone.trim().length > 0) {
      const valTel = validarENormalizarTelefone(telefone.trim());
      if (!valTel.ok) return { ok: false, erro: valTel.erro };
      telPadrao = valTel.valor || null;
    }

    const endPadrao = formatarEndereco(endereco || {});

    const { data, error } = await supabase
      .from('catador')
      .insert([{
        auth_user_id: null,
        nome: nomePadrao,
        email: emailPadrao,
        telefone: telPadrao,
        rua: endPadrao.rua,
        numero: endPadrao.numero,
        complemento: endPadrao.complemento,
        bairro: endPadrao.bairro,
        cidade: endPadrao.cidade,
        estado: endPadrao.estado,
        cep: endPadrao.cep,
        sem_residencia: endPadrao.sem_residencia,
        situacao: 'ativo',
        cadastrado_por: session.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao cadastrar catador no banco:', error);
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return { ok: false, erro: 'Permissão negada pelo banco de dados (RLS). Certifique-se de estar logado como Administrador ou Cidadão.' };
      }
      return { ok: false, erro: error.message || 'Erro ao registrar catador no banco de dados.' };
    }

    return { ok: true, data };
  } catch (err) {
    console.error('Exceção ao cadastrar catador por terceiros:', err);
    return { ok: false, erro: err.message || 'Erro inesperado ao registrar o catador.' };
  }
}

// Realiza login e valida situação do perfil
export async function login(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      if (error.message?.includes('Invalid login credentials')) {
        return { ok: false, erro: 'E-mail ou senha incorretos.' };
      }
      if (error.message?.includes('Email not confirmed')) {
        return { ok: false, erro: 'E-mail pendente de confirmação. Desative a opção "Confirm email" em Authentication -> Providers -> Email no Supabase para permitir login imediato.' };
      }
      return { ok: false, erro: error.message };
    }

    if (!data.session) {
      return { ok: false, erro: 'Não foi possível iniciar sessão. Tente novamente.' };
    }

    const perfil = await getPerfilAtual();

    if (!perfil) {
      await logout();
      return { ok: false, erro: 'Perfil de usuário não encontrado na base de dados.' };
    }

    if (perfil.dados && perfil.dados.situacao === 'bloqueado') {
      await logout();
      return { ok: false, erro: 'Acesso negado: Sua conta foi bloqueada pela administração do sistema.' };
    }

    if (perfil.dados && perfil.dados.situacao === 'desabilitado') {
      try {
        const tabela = perfil.tipo === 'catador' ? 'catador' : 'cidadao';
        const campoId = perfil.tipo === 'catador' ? 'auth_user_id' : 'id';
        await supabase
          .from(tabela)
          .update({ situacao: 'ativo' })
          .eq(campoId, perfil.user.id);

        perfil.dados.situacao = 'ativo';
        sessionStorage.setItem('reciclagem_conta_reativada', 'true');
      } catch (e) {
        console.warn('Erro ao reativar conta automaticamente:', e);
      }
    }

    sessionStorage.setItem('reciclagem_acabou_de_logar', 'true');
    return { ok: true, session: data.session, perfil };
  } catch (err) {
    return { ok: false, erro: err.message || 'Erro ao realizar login.' };
  }
}

// Retorna o perfil completo do usuário autenticado no momento
export async function getPerfilAtual() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.user) return null;

  const userId = session.user.id;

  try {
    const { data: cidadaoData, error: cidadaoErr } = await supabase
      .from('cidadao')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (cidadaoErr) {
      console.warn('Erro ao consultar tabela cidadao:', cidadaoErr);
    } else if (cidadaoData) {
      if (cidadaoData.nome) {
        try {
          const cache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');
          cache[userId] = cidadaoData.nome;
          localStorage.setItem('sys_user_names', JSON.stringify(cache));
        } catch (e) {}
      }
      return {
        tipo: cidadaoData.nivel_acesso === 'administrador' ? 'administrador' : 'cidadao',
        dados: { ...cidadaoData, situacao: cidadaoData.situacao || 'ativo' },
        user: session.user
      };
    }

    const { data: catadorData, error: catadorErr } = await supabase
      .from('catador')
      .select('*')
      .or(`auth_user_id.eq.${userId},id.eq.${userId}`)
      .maybeSingle();

    if (catadorErr) {
      console.warn('Erro ao consultar tabela catador:', catadorErr);
    } else if (catadorData) {
      return {
        tipo: 'catador',
        dados: { ...catadorData, situacao: catadorData.situacao || 'ativo' },
        user: session.user
      };
    }

    // Se houve erro na consulta ao banco, NÃO execute auto-heal para não sobrescrever dados legítimos
    if (cidadaoErr || catadorErr) {
      return null;
    }
  } catch (err) {
    console.warn('Erro ao consultar perfil no banco:', err);
    return null;
  }

  // AUTO-HEAL SEGURO: Apenas se o perfil realmente não existir em nenhuma tabela
  const metaPerfil = session.user.user_metadata?.perfil;
  const nivelInicial = metaPerfil === 'administrador' ? 'administrador' : 'cidadao';
  const nomeAuto = session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Cidadão';
  const autoProfile = {
    id: userId,
    nome: nomeAuto,
    email: session.user.email,
    telefone: session.user.user_metadata?.telefone || null,
    cidade: null,
    estado: null,
    sem_residencia: false,
    nivel_acesso: nivelInicial,
    situacao: 'ativo'
  };

  try {
    // Usar insert com ignoreDuplicates para NUNCA sobrescrever registros existentes
    const { data: created, error: insertErr } = await supabase
      .from('cidadao')
      .insert([autoProfile])
      .select()
      .maybeSingle();

    if (!insertErr && created) {
      return {
        tipo: created.nivel_acesso || 'cidadao',
        dados: created,
        user: session.user
      };
    }
  } catch (e) {
    console.warn('Auto-heal seguro falhou:', e);
  }

  return {
    tipo: autoProfile.nivel_acesso,
    dados: autoProfile,
    user: session.user
  };
}

export function redirectPorPerfil(tipo) {
  const destinos = {
    cidadao: 'dashboard-cidadao.html',
    administrador: 'dashboard-admin.html',
    catador: 'dashboard-catador.html'
  };
  const target = destinos[tipo] || 'dashboard-cidadao.html';
  if (window.location.pathname.includes('/pages/')) {
    window.location.href = target;
  } else {
    window.location.href = `pages/${target}`;
  }
}

export async function resetPassword(email) {
  const redirectUrl = `${window.location.origin}${window.location.pathname.includes('/pages/') ? '' : '/pages'}/nova-senha.html`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
