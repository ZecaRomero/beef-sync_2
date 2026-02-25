import databaseService from '../../../services/databaseService'
import logger from '../../../utils/logger'
import { asyncHandler } from '../../../utils/apiResponse'
import { 
  sendSuccess, 
  sendValidationError, 
  sendConflict, 
  sendNotFound, 
  sendMethodNotAllowed,
  sendForbidden
} from '../../../utils/apiResponse'
import { canDelete } from '../../../utils/permissions'
import { racasPorSerie } from '../../../services/mockData'

// Função para criar nota fiscal de saída automaticamente
async function criarNotaFiscalSaidaAutomatica(animal) {
  try {
    const nfData = {
      numeroNF: `AUTO-SAIDA-${animal.serie}${animal.rg}-${Date.now()}`,
      data: new Date().toISOString().split('T')[0],
      destino: animal.comprador || 'Venda Direta',
      naturezaOperacao: 'Venda',
      observacoes: `NF gerada automaticamente para venda do animal ${animal.serie} ${animal.rg}`,
      tipoProduto: 'bovino',
      tipo: 'saida',
      itens: [{
        tatuagem: `${animal.serie}-${animal.rg}`,
        sexo: animal.sexo,
        era: calcularEra(animal.meses, animal.sexo),
        raca: animal.raca,
        peso: animal.peso || 0,
        valorUnitario: animal.valor_venda || 0,
        tipoProduto: 'bovino'
      }],
      valorTotal: animal.valor_venda || 0,
      dataCadastro: new Date().toISOString()
    }

    // Salvar NF no banco de dados
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3020'}/api/notas-fiscais`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nfData)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar NF: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    logger.error('Erro ao criar NF de saída automática:', error)
    throw error
  }
}

// Função para calcular era baseada na idade em meses e sexo
function calcularEra(meses, sexo) {
  if (!meses || meses <= 0) return 'Não informado'
  
  const isFemea = sexo && (sexo.toLowerCase().includes('fêmea') || sexo.toLowerCase().includes('femea') || sexo === 'F')
  const isMacho = sexo && (sexo.toLowerCase().includes('macho') || sexo === 'M')
  
  if (isFemea) {
    // FÊMEA: 0-7 / 7-12 / 12-18 / 18-24 / 24+
    if (meses <= 7) return '0/7'
    if (meses <= 12) return '7/12'
    if (meses <= 18) return '12/18'
    if (meses <= 24) return '18/24'
    return '24+'
  } else if (isMacho) {
    // MACHO: 0-7 / 7-15 / 15-18 / 18-22 / 22+
    if (meses <= 7) return '0/7'
    if (meses <= 15) return '7/15'
    if (meses <= 18) return '15/18'
    if (meses <= 22) return '18/22'
    return '22+'
  }
  
  // Se não tem sexo definido, usar padrão antigo para compatibilidade
  if (meses <= 7) return '0/7'
  if (meses <= 12) return '7/12'
  if (meses <= 18) return '12/18'
  if (meses <= 24) return '18/24'
  return '24+'
}

export default asyncHandler(async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return sendValidationError(res, 'ID do animal é obrigatório')
  }

  const { method } = req

  switch (method) {
    case 'GET':
      await handleGet(req, res, id)
      break
    case 'PUT':
      await handlePut(req, res, id)
      break
    case 'DELETE':
      await handleDelete(req, res, id)
      break
    default:
      return sendMethodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
  }
})

async function handleGet(req, res, id) {
  const { history } = req.query
  
  console.log(`🔍 Buscando animal com ID/RG: ${id} (tipo: ${typeof id}, history: ${history})`)
  
  let animal = null
  
  // 1. Tentar buscar por ID numérico primeiro
  const animalId = parseInt(id, 10)
  if (!isNaN(animalId)) {
    console.log(`📋 Tentando buscar por ID numérico: ${animalId}`)
    
    if (history === 'true') {
      animal = await databaseService.buscarHistoricoAnimal(animalId)
    } else {
      animal = await databaseService.buscarAnimalPorId(animalId)
    }
    
    if (animal) {
      console.log(`✅ Animal encontrado por ID: ${animalId}`)
    } else {
      console.log(`⚠️ Animal não encontrado por ID: ${animalId}`)
    }
  }
  
  // 2. Se não encontrou por ID, tentar buscar por RG
  if (!animal) {
    console.log(`📋 Tentando buscar por RG: ${id}`)
    try {
      const { query } = require('../../../lib/database')
      
      // Buscar por RG exato
      const resultRG = await query(
        `SELECT * FROM animais WHERE rg = $1 LIMIT 1`,
        [id]
      )
      
      if (resultRG.rows.length > 0) {
        const animalRG = resultRG.rows[0]
        console.log(`✅ Animal encontrado por RG ${id}: ID ${animalRG.id} (${animalRG.serie}-${animalRG.rg})`)
        
        // Buscar animal completo usando o ID encontrado
        if (history === 'true') {
          animal = await databaseService.buscarHistoricoAnimal(animalRG.id)
        } else {
          animal = await databaseService.buscarAnimalPorId(animalRG.id)
        }
      } else {
        // Tentar buscar por série-RG combinado (ex: "CJCJ-17836")
        if (id.includes('-')) {
          const [serie, rg] = id.split('-')
          console.log(`📋 Tentando buscar por série-RG: ${serie}-${rg}`)
          
          const resultSerieRG = await query(
            `SELECT * FROM animais WHERE serie = $1 AND rg = $2 LIMIT 1`,
            [serie.trim(), rg.trim()]
          )
          
          if (resultSerieRG.rows.length > 0) {
            const animalSerieRG = resultSerieRG.rows[0]
            console.log(`✅ Animal encontrado por série-RG ${id}: ID ${animalSerieRG.id}`)
            
            // Buscar animal completo usando o ID encontrado
            if (history === 'true') {
              animal = await databaseService.buscarHistoricoAnimal(animalSerieRG.id)
            } else {
              animal = await databaseService.buscarAnimalPorId(animalSerieRG.id)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar por RG:', error)
    }
  }
  
  // 3. Se ainda não encontrou, tentar buscar animais próximos (apenas para IDs numéricos)
  if (!animal && !isNaN(animalId)) {
    console.log(`⚠️ Animal ${id} não encontrado, buscando animais próximos...`)
    try {
      const { query } = require('../../../lib/database')
      const animaisProximos = await query(
        `SELECT id, serie, rg, nome FROM animais 
         WHERE id BETWEEN $1 AND $2 
         ORDER BY ABS(id - $3) 
         LIMIT 5`,
        [animalId - 10, animalId + 10, animalId]
      )
      
      if (animaisProximos.rows.length > 0) {
        console.log(`💡 Animais próximos encontrados:`, animaisProximos.rows.map(a => `${a.id} (${a.serie}-${a.rg})`))
      }
    } catch (error) {
      console.error('Erro ao buscar animais próximos:', error)
    }
  }
  
  // Se não encontrou no PostgreSQL, retornar erro (fallback desativado)
  if (!animal) {
    return sendNotFound(res, 'Animal não encontrado')
  }
  
  // Corrigir raça baseada na série
  if (animal.serie && racasPorSerie[animal.serie] && animal.raca !== racasPorSerie[animal.serie]) {
    animal.raca = racasPorSerie[animal.serie]
  }

  // Enriquecer com série e RG da mãe quando não estiverem preenchidos
  if (animal.mae && !(animal.serie_mae || animal.rg_mae)) {
    try {
      const { query: dbQuery } = require('../../../lib/database')
      let maeResult = await dbQuery(
        `SELECT id, serie, rg, nome FROM animais WHERE UPPER(TRIM(nome)) = UPPER(TRIM($1)) LIMIT 1`,
        [animal.mae]
      )
      if (maeResult.rows.length === 0) {
        maeResult = await dbQuery(
          `SELECT id, serie, rg, nome FROM animais WHERE UPPER(nome) LIKE UPPER($1) LIMIT 1`,
          [`%${String(animal.mae).trim()}%`]
        )
      }
      if (maeResult.rows.length > 0) {
        const mae = maeResult.rows[0]
        animal.serie_mae = mae.serie
        animal.rg_mae = mae.rg
      }
    } catch (e) {
      console.warn('Erro ao buscar série/RG da mãe:', e)
    }
  }

  // Garantir localizacoes (piquete) para exibição na consulta - buscar se não vier do banco
  let localizacoes = animal.localizacoes
  if (!localizacoes || !Array.isArray(localizacoes) || localizacoes.length === 0) {
    try {
      const { query: dbQuery } = require('../../../lib/database')
      const locResult = await dbQuery(
        'SELECT * FROM localizacoes_animais WHERE animal_id = $1 ORDER BY data_entrada DESC',
        [animal.id]
      )
      localizacoes = locResult.rows || []
    } catch (e) {
      localizacoes = []
    }
  }
  
  // Adicionar campos para compatibilidade
  const animalComIdentificacao = {
    ...animal,
    localizacoes,
    identificacao: `${animal.serie}-${animal.rg}`,
    dataNascimento: animal.data_nascimento,
    precoVenda: animal.valor_venda,
    status: animal.situacao,
    // Garantir que ambos os formatos de nome do campo estejam presentes
    avo_materno: animal.avo_materno || animal.avoMaterno || null,
    avoMaterno: animal.avo_materno || animal.avoMaterno || null
  }
  
  console.log(`✅ GET Animal ${animal.serie}-${animal.rg} (ID: ${animal.id})`)
  
  return sendSuccess(res, animalComIdentificacao)
}

async function handlePut(req, res, id) {
  console.log(`📝 Recebido PUT para animal ${id}:`, req.body);
  const animal = await databaseService.atualizarAnimal(id, req.body)
  
  // Se não retornou registro, evitar acessar propriedades indefinidas
  if (!animal) {
    return sendNotFound(res, 'Animal não encontrado para atualização')
  }
  
  // DESABILITADO: Não criar nota fiscal de saída automaticamente
  // A NF deve ser criada manualmente através do módulo de Notas Fiscais
  // if (req.body.situacao === 'Vendido' && req.body.valor_venda) {
  //   try {
  //     await criarNotaFiscalSaidaAutomatica(animal)
  //     logger.info(`NF de saída criada automaticamente para: ${animal.serie}${animal.rg}`)
  //   } catch (nfError) {
  //     logger.error(`Erro ao criar NF de saída automática: ${nfError.message}`)
  //     // Não falhar a atualização do animal se a NF falhar
  //   }
  // }
  
  // Corrigir raça baseada na série
  if (animal.serie && racasPorSerie[animal.serie] && animal.raca !== racasPorSerie[animal.serie]) {
    animal.raca = racasPorSerie[animal.serie]
  }
  
  // Adicionar campos para compatibilidade
  const animalComIdentificacao = {
    ...animal,
    identificacao: `${animal.serie}-${animal.rg}`,
    dataNascimento: animal.data_nascimento,
    precoVenda: animal.valor_venda,
    status: animal.situacao,
    // Garantir que ambos os formatos de nome do campo estejam presentes
    avo_materno: animal.avo_materno || animal.avoMaterno || null,
    avoMaterno: animal.avo_materno || animal.avoMaterno || null
  }
  
  return sendSuccess(res, animalComIdentificacao)
}

async function handleDelete(req, res, id) {
  // Verificar permissão de exclusão
  if (!canDelete(req)) {
    return sendForbidden(res, 'Acesso negado. Esta ação é permitida apenas para o desenvolvedor (acesso local).')
  }

  const animal = await databaseService.deletarAnimal(id)
  
  return sendSuccess(res, {
    message: 'Animal deletado com sucesso',
    data: animal
  })
}
