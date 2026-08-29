import { supabase } from '../lib/supabaseClient.js';

/**
 * Serviço de Materiais — Reciclagem Solidária
 */

// Função auxiliar para ordenar a lista preservando a ordem por cod_material e mantendo "Outros" sempre no final
export function ordenarMateriaisComOutrosNoFinal(lista) {
  if (!Array.isArray(lista)) return [];
  return [...lista].sort((a, b) => {
    const aIsOutros = (a.tipo || '').toLowerCase().trim() === 'outros';
    const bIsOutros = (b.tipo || '').toLowerCase().trim() === 'outros';
    if (aIsOutros && !bIsOutros) return 1;
    if (!aIsOutros && bIsOutros) return -1;
    return parseInt(a.cod_material, 10) - parseInt(b.cod_material, 10);
  });
}

// Lista os tipos de materiais disponíveis no catálogo fixo (com fallback de segurança)
export async function listarTiposMaterial(incluirContagem = false) {
  try {
    const { data, error } = await supabase
      .from('materiais')
      .select('*')
      .order('cod_material', { ascending: true });

    if (error || !data || data.length === 0) {
      return ordenarMateriaisComOutrosNoFinal([
        { cod_material: 1, tipo: 'Papel', total_coletas: 0 },
        { cod_material: 2, tipo: 'Plástico', total_coletas: 0 },
        { cod_material: 3, tipo: 'Vidro', total_coletas: 0 },
        { cod_material: 4, tipo: 'Metal', total_coletas: 0 },
        { cod_material: 5, tipo: 'Outros', total_coletas: 0 }
      ]);
    }

    let resultado = data;

    if (incluirContagem) {
      const { data: coletas } = await supabase.from('coleta').select('cod_material');
      const contagemMap = {};
      (coletas || []).forEach(c => {
        if (c.cod_material) {
          contagemMap[c.cod_material] = (contagemMap[c.cod_material] || 0) + 1;
        }
      });

      resultado = data.map(m => ({
        ...m,
        total_coletas: contagemMap[m.cod_material] || 0
      }));
    }

    return ordenarMateriaisComOutrosNoFinal(resultado);
  } catch (err) {
    console.warn('Usando catálogo fallback de materiais:', err);
    return ordenarMateriaisComOutrosNoFinal([
      { cod_material: 1, tipo: 'Papel', total_coletas: 0 },
      { cod_material: 2, tipo: 'Plástico', total_coletas: 0 },
      { cod_material: 3, tipo: 'Vidro', total_coletas: 0 },
      { cod_material: 4, tipo: 'Metal', total_coletas: 0 },
      { cod_material: 5, tipo: 'Outros', total_coletas: 0 }
    ]);
  }
}

// Adiciona um novo tipo de material ao catálogo (Admin)
export async function adicionarTipoMaterial(tipo) {
  const tipoTrim = (tipo || '').trim();
  if (!tipoTrim) {
    return { ok: false, erro: 'Informe a descrição do tipo de material.' };
  }

  if (tipoTrim.length < 2) {
    return { ok: false, erro: 'O nome do material deve ter pelo menos 2 caracteres.' };
  }

  // Capitaliza a primeira letra para manter padrão estético
  const tipoFormatado = tipoTrim.charAt(0).toUpperCase() + tipoTrim.slice(1);

  try {
    const { data, error } = await supabase
      .from('materiais')
      .insert([{ tipo: tipoFormatado }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        return { ok: false, erro: `O tipo de material "${tipoFormatado}" já está cadastrado no sistema.` };
      }
      return { ok: false, erro: error.message };
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, erro: err.message || 'Erro ao cadastrar tipo de material.' };
  }
}

// Edita o nome de um tipo de material existente (Admin)
export async function editarTipoMaterial(cod_material, novoTipo) {
  const tipoTrim = (novoTipo || '').trim();
  if (!tipoTrim) {
    return { ok: false, erro: 'Informe o novo nome para o tipo de material.' };
  }

  const tipoFormatado = tipoTrim.charAt(0).toUpperCase() + tipoTrim.slice(1);

  try {
    const { data, error } = await supabase
      .from('materiais')
      .update({ tipo: tipoFormatado })
      .eq('cod_material', cod_material)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        return { ok: false, erro: `Já existe outro tipo de material cadastrado com o nome "${tipoFormatado}".` };
      }
      return { ok: false, erro: error.message };
    }

    return { ok: true, data };
  } catch (err) {
    return { ok: false, erro: err.message || 'Erro ao atualizar tipo de material.' };
  }
}

// Exclui um tipo de material do catálogo (Admin)
export async function excluirTipoMaterial(cod_material) {
  try {
    // Verifica se existem coletas usando este material
    const { data: coletasVinculadas, error: errCheck } = await supabase
      .from('coleta')
      .select('cod_coleta')
      .eq('cod_material', cod_material)
      .limit(1);

    if (!errCheck && coletasVinculadas && coletasVinculadas.length > 0) {
      return {
        ok: false,
        erro: 'Não é possível excluir este tipo de material porque existem ofertas de coleta vinculadas a ele no sistema.'
      };
    }

    const { error } = await supabase
      .from('materiais')
      .delete()
      .eq('cod_material', cod_material);

    if (error) {
      if (error.code === '23503' || error.message?.includes('foreign key')) {
        return {
          ok: false,
          erro: 'Este tipo de material está sendo utilizado em ofertas de coleta e não pode ser excluído.'
        };
      }
      return { ok: false, erro: error.message };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, erro: err.message || 'Erro ao excluir tipo de material.' };
  }
}

// Função auxiliar para comprimir imagem no cliente em Base64 leve e responsivo
export function compressImageToBase64(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => {
        console.warn('Erro ao carregar imagem no elemento Image, utilizando DataURL original:', err);
        resolve(event.target.result);
      };
    };
    reader.onerror = (err) => reject(err);
  });
}

// Upload de imagem da oferta de coleta com fallback automático garantido
export async function uploadFotoMaterial(file) {
  if (!file) return null;

  // Aceita qualquer formato de imagem comum
  const isImage = (file.type && file.type.startsWith('image/')) || /\.(jpe?g|png|webp|gif|bmp|jfif|heic|heif)$/i.test(file.name || '');
  if (!isImage) {
    throw new Error('Formato de arquivo inválido. Por favor, selecione um arquivo de imagem (JPEG, PNG, WEBP, etc).');
  }

  // 1. Tenta upload no Supabase Storage
  try {
    const fileExt = (file.name || 'foto.jpg').split('.').pop().toLowerCase();
    const fileName = `coleta_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `ofertas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('materiais-fotos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('materiais-fotos')
        .getPublicUrl(filePath);

      if (publicUrl && publicUrl.startsWith('http')) {
        return publicUrl;
      }
    }
  } catch (storageErr) {
    console.warn('Storage bucket indisponível ou sem permissão pública, utilizando fallback Base64:', storageErr);
  }

  // 2. Fallback 100% garantido: compacta a imagem em Base64 otimizado para gravação direta no banco
  try {
    const base64Data = await compressImageToBase64(file);
    return base64Data;
  } catch (compErr) {
    console.error('Erro ao processar imagem em Base64:', compErr);
    return null;
  }
}
