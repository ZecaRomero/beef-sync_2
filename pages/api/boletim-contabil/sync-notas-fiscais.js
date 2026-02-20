import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' })
  }

  try {
    logger.info('Iniciando sincronização de notas fiscais com boletim contábil')

    // Buscar todas as notas fiscais
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020'}/api/notas-fiscais`)
    let notasFiscais = []
    
    if (response.ok) {
      const data = await response.json()
      notasFiscais = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : [])
    } else {
      // Fallback para localStorage se a API não estiver disponível
      logger.warn('API de notas fiscais não disponível, usando dados locais')
    }

    logger.info(`Encontradas ${notasFiscais.length} notas fiscais para sincronizar`)

    let sincronizadas = 0
    let erros = 0

    // Processar cada nota fiscal
    for (const nf of notasFiscais) {
      try {
        await sincronizarNotaFiscal(nf)
        sincronizadas++
        logger.info(`NF ${nf.numeroNF} sincronizada com sucesso`)
      } catch (error) {
        erros++
        logger.error(`Erro ao sincronizar NF ${nf.numeroNF}:`, error)
      }
    }

    const resultado = {
      success: true,
      message: `Sincronização concluída: ${sincronizadas} notas fiscais processadas, ${erros} erros`,
      detalhes: {
        total: notasFiscais.length,
        sincronizadas,
        erros
      }
    }

    logger.info('Sincronização de notas fiscais concluída', resultado)
    res.status(200).json(resultado)

  } catch (error) {
    logger.error('Erro na sincronização de notas fiscais:', error)
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    })
  }
}

async function sincronizarNotaFiscal(nf) {
  try {
    // Verificar se a NF já foi sincronizada
    const jaSincronizada = await verificarNFSincronizada(nf.id)
    if (jaSincronizada) {
      logger.info(`NF ${nf.numeroNF} já foi sincronizada anteriormente`)
      return
    }

    // Processar itens da NF
    for (const item of nf.itens || []) {
      if (nf.tipoProduto === 'bovino' && item.tipoProduto === 'bovino') {
        await processarAnimalBovino(nf, item)
      } else if (nf.tipoProduto === 'semen' && item.tipoProduto === 'semen') {
        await processarSemen(nf, item)
      } else if (nf.tipoProduto === 'embriao' && item.tipoProduto === 'embriao') {
        await processarEmbriao(nf, item)
      }
    }

    // Marcar NF como sincronizada
    await marcarNFSincronizada(nf.id)
    
  } catch (error) {
    logger.error(`Erro ao sincronizar NF ${nf.numeroNF}:`, error)
    throw error
  }
}

async function processarAnimalBovino(nf, item) {
  try {
    // Verificar se o animal já existe
    const animalExistente = await buscarAnimalPorIdentificacao(item.tatuagem)
    
    if (nf.tipo === 'entrada') {
      if (!animalExistente) {
        // Criar novo animal
        const animalData = {
          serie: item.tatuagem?.split('-')[0] || 'NF',
          rg: item.tatuagem?.split('-')[1] || item.tatuagem,
          tatuagem: item.tatuagem,
          sexo: item.sexo,
          raca: item.raca || 'Não informada',
          data_nascimento: nf.data,
          peso: item.peso || null,
          situacao: 'Ativo',
          valor_compra: item.valorUnitario,
          fornecedor: nf.fornecedor,
          nota_fiscal: nf.numeroNF,
          created_at: new Date().toISOString()
        }

        await databaseService.criarAnimal(animalData)
        logger.info(`Animal ${item.tatuagem} criado a partir da NF ${nf.numeroNF}`)
      } else {
        // Atualizar dados do animal existente
        await databaseService.atualizarAnimal(animalExistente.id, {
          valor_compra: item.valorUnitario,
          fornecedor: nf.fornecedor,
          nota_fiscal: nf.numeroNF,
          updated_at: new Date().toISOString()
        })
        logger.info(`Animal ${item.tatuagem} atualizado a partir da NF ${nf.numeroNF}`)
      }
    } else if (nf.tipo === 'saida' && animalExistente) {
      // Registrar saída do animal
      await databaseService.atualizarSituacaoAnimal(animalExistente.id, 'Vendido')
      
      // Registrar custo de venda se houver
      if (item.valorUnitario > 0) {
        await databaseService.registrarCusto({
          animal_id: animalExistente.id,
          tipo: 'venda',
          subtipo: 'receita',
          valor: item.valorUnitario,
          data: nf.data,
          observacoes: `Venda via NF ${nf.numeroNF} - ${nf.destino}`,
          created_at: new Date().toISOString()
        })
      }
      
      logger.info(`Animal ${item.tatuagem} vendido via NF ${nf.numeroNF}`)
    }
  } catch (error) {
    logger.error(`Erro ao processar animal bovino ${item.tatuagem}:`, error)
    throw error
  }
}

async function processarSemen(nf, item) {
  try {
    // Registrar entrada de sêmen no estoque
    if (nf.tipo === 'entrada') {
      const semenData = {
        nome_touro: item.nomeTouro,
        rg_touro: item.rgTouro,
        raca: item.raca || 'Não informada',
        quantidade_doses: item.quantidadeDoses,
        valor_unitario: item.valorUnitario,
        botijao: item.botijao,
        caneca: item.caneca,
        certificado: item.certificado,
        data_validade: item.dataValidade,
        fornecedor: nf.fornecedor,
        nota_fiscal: nf.numeroNF,
        situacao: 'Disponível',
        created_at: new Date().toISOString()
      }

      await databaseService.criarSemen(semenData)
      logger.info(`Sêmen ${item.nomeTouro} adicionado ao estoque via NF ${nf.numeroNF}`)
    }
  } catch (error) {
    logger.error(`Erro ao processar sêmen ${item.nomeTouro}:`, error)
    throw error
  }
}

async function processarEmbriao(nf, item) {
  try {
    // Registrar entrada de embrião
    if (nf.tipo === 'entrada') {
      const embriaoData = {
        doadora: item.doadora,
        touro: item.touro,
        raca: item.raca || 'Não informada',
        quantidade: item.quantidadeEmbrioes,
        valor_unitario: item.valorUnitario,
        tipo: item.tipoEmbriao,
        qualidade: item.qualidade,
        data_coleta: item.dataColeta,
        fornecedor: nf.fornecedor,
        nota_fiscal: nf.numeroNF,
        situacao: 'Disponível',
        created_at: new Date().toISOString()
      }

      await databaseService.criarEmbriao(embriaoData)
      logger.info(`Embrião ${item.doadora}x${item.touro} adicionado via NF ${nf.numeroNF}`)
    }
  } catch (error) {
    logger.error(`Erro ao processar embrião ${item.doadora}x${item.touro}:`, error)
    throw error
  }
}

async function buscarAnimalPorIdentificacao(identificacao) {
  try {
    const animais = await databaseService.buscarAnimais()
    return animais.find(animal => 
      animal.tatuagem === identificacao || 
      `${animal.serie}-${animal.rg}` === identificacao || 
      animal.rg === identificacao
    ) || null
  } catch (error) {
    logger.error('Erro ao buscar animal por identificação:', error)
    return null
  }
}

async function verificarNFSincronizada(nfId) {
  try {
    const result = await databaseService.query(`
      SELECT id FROM notas_fiscais_sincronizadas 
      WHERE nf_id = $1
    `, [nfId])
    
    return result.rows.length > 0
  } catch (error) {
    // Se a tabela não existir, considerar como não sincronizada
    return false
  }
}

async function marcarNFSincronizada(nfId) {
  try {
    await databaseService.query(`
      INSERT INTO notas_fiscais_sincronizadas (nf_id, data_sincronizacao)
      VALUES ($1, CURRENT_TIMESTAMP)
      ON CONFLICT (nf_id) DO NOTHING
    `, [nfId])
  } catch (error) {
    // Se a tabela não existir, criar
    try {
      await databaseService.query(`
        CREATE TABLE IF NOT EXISTS notas_fiscais_sincronizadas (
          id SERIAL PRIMARY KEY,
          nf_id VARCHAR(255) UNIQUE NOT NULL,
          data_sincronizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      await databaseService.query(`
        INSERT INTO notas_fiscais_sincronizadas (nf_id, data_sincronizacao)
        VALUES ($1, CURRENT_TIMESTAMP)
      `, [nfId])
    } catch (createError) {
      logger.error('Erro ao criar tabela de sincronização:', createError)
    }
  }
}
