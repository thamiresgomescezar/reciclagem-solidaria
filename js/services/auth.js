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

  // Verifica se este e-mail já pertence a um Catador cadastrado no sistema
  try {
    const { data: catExistente } = await supabase
      .from('catador')
      .select('id, nome, email')
      .ilike('email', emailPadrao)
      .limit(1);

    if (catExistente && catExistente.length > 0) {
      await supabase.auth.signOut();
      return {
        ok: false,
        erro: 'Este e-mail já está associado a um perfil de Catador no sistema. Entre em contato com a administração para alterações.'
      };
    }
  } catch (errCheckCat) {
    console.warn('Erro ao checar se email pertence a catador:', errCheckCat);
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
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: emailPadrao,
        password: pwd
      });
      if (signInErr || !signInData?.user) {
        return { ok: false, erro: 'Este e-mail já está cadastrado no sistema com outra senha. Tente fazer login ou use outro e-mail.' };
      }
      data = signInData;
    } else if (error.message?.includes('rate limit') || error.message?.includes('Rate limit')) {
      return { ok: false, erro: 'Limite de envio de e-mails de confirmação excedido pelo Supabase. Aguarde alguns minutos para tentar novamente.' };
    } else {
      return { ok: false, erro: error.message };
    }
  }

  if (!data.user) return { ok: false, erro: 'Não foi possível registrar o usuário no Supabase Auth.' };

  let session = data.session;
  if (!session) {
    const { data: signInData } = await supabase.auth.signInWithPassword({ email: emailPadrao, password: pwd }).catch(() => ({}));
    if (signInData?.session) {
      session = signInData.session;
    }
  }

  // Verifica se o e-mail pertence a um Administrador
  try {
    const { data: admCheck } = await supabase
      .from('cidadao')
      .select('id, nivel_acesso')
      .ilike('email', emailPadrao)
      .limit(1);

    if (admCheck && admCheck.length > 0 && admCheck[0].nivel_acesso === 'administrador') {
      await supabase.auth.signOut();
      return { ok: false, erro: 'Este e-mail pertence a um Administrador do sistema. Não é possível criar um perfil de Catador.' };
    }
  } catch (e) {}

  // Localiza todos os registros pré-existentes de catador cadastrados com este e-mail
  let catadoresExistentes = [];
  try {
    const { data: cats } = await supabase
      .from('catador')
      .select('*')
      .ilike('email', emailPadrao)
      .order('criado_em', { ascending: true });
    catadoresExistentes = cats || [];
  } catch (e) {
    console.warn('Erro ao consultar catadores existentes:', e);
  }

  let profileError = null;

  if (catadoresExistentes.length > 0) {
    // Vincula a nova conta de login ao registro ORIGINAL do catador (preservando o ID, coletas e agendamentos)
    const catOriginal = catadoresExistentes[0];
    const { error: updateErr } = await supabase
      .from('catador')
      .update({
        auth_user_id: data.user.id,
        nome: nomePadrao,
        telefone: telPadrao || catOriginal.telefone,
        rua: endPadrao.rua || catOriginal.rua,
        numero: endPadrao.numero || catOriginal.numero,
        complemento: endPadrao.complemento || catOriginal.complemento,
        bairro: endPadrao.bairro || catOriginal.bairro,
        cidade: endPadrao.cidade || catOriginal.cidade,
        estado: endPadrao.estado || catOriginal.estado,
        cep: endPadrao.cep || catOriginal.cep,
        sem_residencia: endPadrao.sem_residencia !== undefined ? endPadrao.sem_residencia : catOriginal.sem_residencia,
        situacao: 'ativo'
      })
      .eq('id', catOriginal.id);

    profileError = updateErr;

    // Se houver registros duplicados, migra todas as coletas para o original e remove as duplicatas
    if (catadoresExistentes.length > 1) {
      for (let i = 1; i < catadoresExistentes.length; i++) {
        const catDup = catadoresExistentes[i];
        if (catDup.id !== catOriginal.id) {
          try {
            await supabase.from('coleta').update({ catador_id: catOriginal.id }).eq('catador_id', catDup.id);
            await supabase.from('catador').delete().eq('id', catDup.id);
          } catch (e) {}
        }
      }
    }

    // Se havia registro de cidadão criado indevidamente com este user id, remove-o
    try {
      await supabase.from('cidadao').delete().eq('id', data.user.id);
    } catch (e) {}

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
    if (emailPadrao) {
      const { data: cidExiste } = await supabase
        .from('cidadao')
        .select('id')
        .ilike('email', emailPadrao)
        .limit(1);

      if (cidExiste && cidExiste.length > 0) {
        return { ok: false, erro: 'Este e-mail já está associado a uma conta de Cidadão no sistema.' };
      }

      const { data: catExiste } = await supabase
        .from('catador')
        .select('id')
        .ilike('email', emailPadrao)
        .limit(1);

      if (catExiste && catExiste.length > 0) {
        return { ok: false, erro: 'Já existe um catador cadastrado com este e-mail.' };
      }
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
        return { ok: false, erro: 'Permissão negada. Certifique-se de estar logado como Administrador ou Cidadão.' };
      }
      return { ok: false, erro: error.message || 'Erro ao registrar catador no sistema.' };
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
    const emailLimpo = (email || '').trim().toLowerCase();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailLimpo,
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
  const userEmail = session.user.email ? session.user.email.trim().toLowerCase() : null;
  const metaPerfil = session.user.user_metadata?.perfil;

  try {
    // 1. Verifica se é Administrador na tabela cidadao
    const { data: cidadaoData, error: cidadaoErr } = await supabase
      .from('cidadao')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (cidadaoData && cidadaoData.nivel_acesso === 'administrador') {
      if (cidadaoData.nome) {
        try {
          const cache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');
          cache[userId] = cidadaoData.nome;
          localStorage.setItem('sys_user_names', JSON.stringify(cache));
        } catch (e) {}
      }
      try { localStorage.setItem('reciclagem_tipo_usuario', 'administrador'); } catch (e) {}
      return {
        tipo: 'administrador',
        dados: { ...cidadaoData, situacao: cidadaoData.situacao || 'ativo' },
        user: session.user,
        id: cidadaoData.id
      };
    }

    // 2. Busca na tabela catador por auth_user_id, id ou email
    let catQuery = supabase.from('catador').select('*');
    if (userEmail) {
      catQuery = catQuery.or(`auth_user_id.eq.${userId},id.eq.${userId},email.ilike.${userEmail}`);
    } else {
      catQuery = catQuery.or(`auth_user_id.eq.${userId},id.eq.${userId}`);
    }
    const { data: catRecords, error: catErr } = await catQuery.order('criado_em', { ascending: true });

    if (catRecords && catRecords.length > 0) {
      // O registro principal é o original (mais antigo, onde as coletas foram vinculadas)
      const catPrincipal = catRecords[0];

      // Garante que o auth_user_id está vinculado ao registro principal
      if (catPrincipal.auth_user_id !== userId) {
        try {
          await supabase.from('catador').update({ auth_user_id: userId }).eq('id', catPrincipal.id);
          catPrincipal.auth_user_id = userId;
        } catch (e) {
          console.warn('Erro ao atualizar auth_user_id no catador:', e);
        }
      }

      // Se houver duplicatas de catador com mesmo email, migra as coletas para o principal e deleta duplicatas
      if (catRecords.length > 1) {
        for (let i = 1; i < catRecords.length; i++) {
          const catDup = catRecords[i];
          if (catDup.id !== catPrincipal.id) {
            try {
              await supabase.from('coleta').update({ catador_id: catPrincipal.id }).eq('catador_id', catDup.id);
              await supabase.from('catador').delete().eq('id', catDup.id);
            } catch (e) {}
          }
        }
      }

      // Se o usuário tinha um registro de cidadão criado indevidamente:
      // se o metadado é catador OU se ele é catador com email vinculado, limpa a entrada conflitante de cidadão
      if (cidadaoData && (metaPerfil === 'catador' || !metaPerfil)) {
        try {
          await supabase.from('cidadao').delete().eq('id', userId);
        } catch (e) {}
      }

      if (metaPerfil === 'catador' || !cidadaoData || catPrincipal.auth_user_id === userId) {
        if (catPrincipal.nome) {
          try {
            const cache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');
            cache[userId] = catPrincipal.nome;
            localStorage.setItem('sys_user_names', JSON.stringify(cache));
          } catch (e) {}
        }
        try { localStorage.setItem('reciclagem_tipo_usuario', 'catador'); } catch (e) {}
        return {
          tipo: 'catador',
          dados: { ...catPrincipal, auth_user_id: userId, situacao: catPrincipal.situacao || 'ativo' },
          user: session.user,
          id: catPrincipal.id
        };
      }
    }

    // 3. Se não é catador, mas possui registro de Cidadão
    if (cidadaoData) {
      if (cidadaoData.nome) {
        try {
          const cache = JSON.parse(localStorage.getItem('sys_user_names') || '{}');
          cache[userId] = cidadaoData.nome;
          localStorage.setItem('sys_user_names', JSON.stringify(cache));
        } catch (e) {}
      }
      try { localStorage.setItem('reciclagem_tipo_usuario', 'cidadao'); } catch (e) {}
      return {
        tipo: 'cidadao',
        dados: { ...cidadaoData, situacao: cidadaoData.situacao || 'ativo' },
        user: session.user,
        id: cidadaoData.id
      };
    }

    if (cidadaoErr || catErr) {
      return null;
    }
  } catch (err) {
    console.warn('Erro ao consultar perfil no banco:', err);
    return null;
  }

  // AUTO-HEAL SEGURO: Apenas se o perfil realmente não existir em nenhuma tabela
  if (metaPerfil === 'catador') {
    const autoCat = {
      auth_user_id: userId,
      nome: session.user.user_metadata?.nome || session.user.email?.split('@')[0] || 'Catador',
      email: userEmail,
      telefone: session.user.user_metadata?.telefone || null,
      situacao: 'ativo'
    };
    try {
      const { data: createdCat } = await supabase.from('catador').insert([autoCat]).select().maybeSingle();
      if (createdCat) {
        try { localStorage.setItem('reciclagem_tipo_usuario', 'catador'); } catch (e) {}
        return {
          tipo: 'catador',
          dados: createdCat,
          user: session.user,
          id: createdCat.id
        };
      }
    } catch (e) {}
  }

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
    const { data: created, error: insertErr } = await supabase
      .from('cidadao')
      .insert([autoProfile])
      .select()
      .maybeSingle();

    if (!insertErr && created) {
      return {
        tipo: created.nivel_acesso || 'cidadao',
        dados: created,
        user: session.user,
        id: created.id
      };
    }
  } catch (e) {
    console.warn('Auto-heal seguro falhou:', e);
  }

  return {
    tipo: autoProfile.nivel_acesso,
    dados: autoProfile,
    user: session.user,
    id: userId
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
  const emailLimpo = (email || '').trim().toLowerCase();
  const redirectUrl = `${window.location.origin}${window.location.pathname.includes('/pages/') ? '' : '/pages'}/nova-senha.html`;
  const { data, error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
    redirectTo: redirectUrl
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  try { localStorage.removeItem('reciclagem_tipo_usuario'); } catch (e) {}
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
