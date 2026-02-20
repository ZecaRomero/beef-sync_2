// API Proxy para buscar dados de CNPJ via BrasilAPI
// Evita problemas de CORS no frontend

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cnpj } = req.query;

  if (!cnpj) {
    return res.status(400).json({ error: 'CNPJ não fornecido' });
  }

  // Limpar CNPJ (remover caracteres especiais)
  const cnpjLimpo = cnpj.replace(/\D/g, '');

  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
  }

  try {
    // Buscar dados na BrasilAPI
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'BeefSync/1.0'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'CNPJ não encontrado' });
      }
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();

    // Retornar dados formatados
    return res.status(200).json({
      success: true,
      data: {
        cnpj: data.cnpj,
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        cep: data.cep,
        municipio: data.municipio,
        uf: data.uf,
        ddd_telefone_1: data.ddd_telefone_1,
        ddd_telefone_2: data.ddd_telefone_2,
        email: data.email
      }
    });

  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar dados do CNPJ',
      message: error.message 
    });
  }
}
