import { pool } from '../../../lib/database'
import { 
  sendSuccess, 
  sendValidationError, 
  sendMethodNotAllowed, 
  asyncHandler, 
  HTTP_STATUS 
} from '../../../utils/apiResponse'
import { criarLoteManual } from '../../../utils/loteMiddleware'

export default asyncHandler(async function handler(req, res) {
  // Aumentar timeout da conexão se possível
  req.setTimeout && req.setTimeout(300000); // 5 minutos

  if (req.method !== 'POST') {
    return sendMethodNotAllowed(res, ['POST'])
  }

  const { animais, usuario = 'sistema' } = req.body

  console.log(`📥 Recebido pedido de atualização em lote para ${animais?.length} animais`)

  if (!animais || !Array.isArray(animais) || animais.length === 0) {
    return sendValidationError(res, 'Lista de animais é obrigatória e deve conter pelo menos um animal')
  }

  // Validar cada animal - Série e RG são sempre obrigatórios
  // Sexo e raça são obrigatórios apenas para animais novos (não para atualizações parciais)
  for (let i = 0; i < animais.length; i++) {
    const animal = animais[i]
    if (!animal.serie || !animal.rg) {
      return sendValidationError(res, `Animal ${i + 1}: Série e RG são obrigatórios`, {
        required: ['serie', 'rg'],
        animal_index: i + 1
      })
    }
  }

  let lote = null
  const resultados = {
    sucessos: [],
    erros: [],
    total_processados: 0,
    total_sucessos: 0,
    total_erros: 0
  }

  const client = await pool.connect()

  try {
    // NÃO usar transação para permitir que cada animal seja salvo individualmente
    // Se um animal falhar, os outros ainda serão salvos
    console.log('🚀 Iniciando processamento sem transação (commits individuais)')

    // Criar lote ANTES de processar os animais (fora da transação)
    try {
      lote = await criarLoteManual({
        tipo_operacao: 'CADASTRO_ANIMAIS',
        descricao: `Cadastro em lote de ${animais.length} animais`,
        detalhes: {
          quantidade_animais: animais.length,
          tipos_raca: [...new Set(animais.map(a => a.raca).filter(Boolean))],
          preview_brincos: animais.slice(0, 10).map(a => `${a.serie}-${a.rg}`),
          origem_dados: 'cadastro_lote_api'
        },
        usuario,
        quantidade_registros: animais.length,
        modulo: 'ANIMAIS',
        req
      })
      console.log(`🚀 Iniciando processamento do lote ${lote.numero_lote} com ${animais.length} animais`)
    } catch (loteError) {
      console.error('❌ Erro ao criar lote:', loteError)
      console.error('📋 Stack do erro de lote:', loteError.stack)
      // Fallback para lote fictício se falhar - não bloquear o processamento
      lote = { numero_lote: 'LOTE-MANUAL-' + Date.now() }
      console.log(`⚠️ Usando lote temporário: ${lote.numero_lote}`)
    }

    // Contar total de animais ANTES de processar qualquer um
    const totalAntes = await client.query('SELECT COUNT(*) as total FROM animais')
    const totalAntesNum = parseInt(totalAntes.rows[0].total, 10)
    console.log(`📊 Total de animais ANTES da importação: ${totalAntesNum}`)

    // Processar cada animal
    for (let i = 0; i < animais.length; i++) {
      const animalData = animais[i]
      resultados.total_processados++

      try {
        // Normalizar formato do sexo para o banco de dados
        let sexoNormalizado = animalData.sexo
        if (sexoNormalizado) {
          sexoNormalizado = sexoNormalizado.toString().trim()
          // Converter diferentes formatos para o padrão do banco
          if (sexoNormalizado === 'M' || sexoNormalizado.toUpperCase() === 'MACHO') {
            sexoNormalizado = 'Macho'
          } else if (sexoNormalizado === 'F' || sexoNormalizado.toUpperCase() === 'FEMEA' || sexoNormalizado.toUpperCase() === 'FÊMEA') {
            sexoNormalizado = 'Fêmea'
          }
        }

        // Verificar se animal já existe (serie + rg único)
        const checkExisting = await client.query(
          'SELECT id FROM animais WHERE serie = $1 AND rg = $2',
          [animalData.serie, animalData.rg]
        )

        if (checkExisting.rows.length > 0) {
          // Animal já existe - atualizar ao invés de inserir
          const existingId = checkExisting.rows[0].id
          console.log(`⚠️ Animal ${animalData.serie}-${animalData.rg} já existe (ID: ${existingId}), atualizando...`)
          
          // Buscar dados existentes do animal para preservar campos não fornecidos
          const existingAnimal = await client.query(
            'SELECT * FROM animais WHERE id = $1',
            [existingId]
          )
          
          if (!existingAnimal.rows || existingAnimal.rows.length === 0) {
            console.error(`❌ Animal existente não encontrado no banco (ID: ${existingId}). Pulando atualização.`)
            resultados.erros.push({
              index: i + 1,
              brinco: `${animalData.serie}-${animalData.rg}`,
              erro: `Animal já existe mas não foi possível buscar dados existentes (ID: ${existingId})`,
              codigo_erro: 'FETCH_ERROR',
              animal_id: existingId
            })
            resultados.total_erros++
            continue
          }
          
          const animalExistente = existingAnimal.rows[0]
          
          // Não contar como sucesso de importação se já existia
          // O objetivo da importação é ADICIONAR novos animais, não atualizar existentes
          
          // Validar e sanitizar campo meses para UPDATE também
          let mesesSanitizado = null
          if (animalData.meses !== null && animalData.meses !== undefined) {
            const mesesValue = parseInt(animalData.meses, 10)
            if (!isNaN(mesesValue) && mesesValue >= 0 && mesesValue <= 9999) {
              mesesSanitizado = mesesValue
            } else {
              console.warn(`⚠️ Valor inválido para meses: ${animalData.meses}. Animal ${animalData.serie}-${animalData.rg}`)
              mesesSanitizado = null
            }
          }

          // Validar e sanitizar peso
          let pesoSanitizado = null
          if (animalData.peso !== null && animalData.peso !== undefined) {
            const pesoValue = parseFloat(animalData.peso)
            if (!isNaN(pesoValue) && pesoValue >= 0 && pesoValue <= 999999) {
              pesoSanitizado = pesoValue
            }
          }

          // Validar e sanitizar custo_total
          let custoTotalSanitizado = null
          if (animalData.custoTotal !== null && animalData.custoTotal !== undefined || animalData.custo_total !== null && animalData.custo_total !== undefined) {
            const custoValue = parseFloat(animalData.custoTotal || animalData.custo_total)
            if (!isNaN(custoValue) && custoValue >= 0) {
              custoTotalSanitizado = custoValue
            }
          }

          // Função auxiliar para verificar se um valor foi fornecido (não é undefined, null ou string vazia)
          const foiFornecido = (valor) => {
            return valor !== undefined && valor !== null && valor !== ''
          }

          // Função auxiliar para verificar se campo está vazio no banco
          const estaVazio = (valor) => {
            return valor === null || valor === undefined || valor === '' || (typeof valor === 'string' && valor.trim() === '')
          }

          // Atualização inteligente: só preencher campos vazios se a flag estiver ativa
          const atualizarApenasVazios = animalData.atualizarApenasVazios === true

          // Log para debug - campos de genealogia recebidos
          console.log(`🔍 Animal ${animalData.serie}-${animalData.rg} - Campos recebidos:`, {
            pai: animalData.pai,
            mae: animalData.mae,
            receptora: animalData.receptora,
            atualizarApenasVazios: atualizarApenasVazios,
            camposExistentes: {
              pai: animalExistente.pai,
              mae: animalExistente.mae,
              receptora: animalExistente.receptora
            }
          })

          // Usar COALESCE para preservar valores existentes quando o novo valor for null/undefined/vazio
          // Se atualizarApenasVazios estiver ativo, só atualizar campos que estão vazios no banco
          const dadosAnimal = {
            nome: atualizarApenasVazios 
              ? (foiFornecido(animalData.nome) && estaVazio(animalExistente.nome) ? animalData.nome : animalExistente.nome)
              : (foiFornecido(animalData.nome) ? animalData.nome : animalExistente.nome),
            serie: animalData.serie,
            rg: animalData.rg,
            tatuagem: atualizarApenasVazios
              ? (foiFornecido(animalData.tatuagem) && estaVazio(animalExistente.tatuagem) ? animalData.tatuagem : animalExistente.tatuagem)
              : (foiFornecido(animalData.tatuagem) ? animalData.tatuagem : animalExistente.tatuagem),
            sexo: atualizarApenasVazios
              ? (sexoNormalizado && estaVazio(animalExistente.sexo) ? sexoNormalizado : animalExistente.sexo)
              : (sexoNormalizado || animalExistente.sexo),
            raca: atualizarApenasVazios
              ? (foiFornecido(animalData.raca) && estaVazio(animalExistente.raca) ? animalData.raca : animalExistente.raca)
              : (animalData.raca || animalExistente.raca),
            data_nascimento: atualizarApenasVazios
              ? (foiFornecido(animalData.dataNascimento || animalData.data_nascimento) && estaVazio(animalExistente.data_nascimento)
                  ? (animalData.dataNascimento || animalData.data_nascimento)
                  : animalExistente.data_nascimento)
              : (foiFornecido(animalData.dataNascimento || animalData.data_nascimento)
                  ? (animalData.dataNascimento || animalData.data_nascimento)
                  : animalExistente.data_nascimento),
            hora_nascimento: atualizarApenasVazios
              ? (foiFornecido(animalData.horaNascimento || animalData.hora_nascimento) && estaVazio(animalExistente.hora_nascimento)
                  ? (animalData.horaNascimento || animalData.hora_nascimento)
                  : animalExistente.hora_nascimento)
              : (foiFornecido(animalData.horaNascimento || animalData.hora_nascimento)
                  ? (animalData.horaNascimento || animalData.hora_nascimento)
                  : animalExistente.hora_nascimento),
            peso: atualizarApenasVazios
              ? (pesoSanitizado !== null && estaVazio(animalExistente.peso) ? pesoSanitizado : animalExistente.peso)
              : (pesoSanitizado !== null ? pesoSanitizado : animalExistente.peso),
            cor: atualizarApenasVazios
              ? (foiFornecido(animalData.cor) && estaVazio(animalExistente.cor) ? animalData.cor : animalExistente.cor)
              : (foiFornecido(animalData.cor) ? animalData.cor : animalExistente.cor),
            tipo_nascimento: atualizarApenasVazios
              ? (foiFornecido(animalData.tipoNascimento || animalData.tipo_nascimento) && estaVazio(animalExistente.tipo_nascimento)
                  ? (animalData.tipoNascimento || animalData.tipo_nascimento)
                  : animalExistente.tipo_nascimento)
              : (foiFornecido(animalData.tipoNascimento || animalData.tipo_nascimento)
                  ? (animalData.tipoNascimento || animalData.tipo_nascimento)
                  : animalExistente.tipo_nascimento),
            dificuldade_parto: atualizarApenasVazios
              ? (foiFornecido(animalData.dificuldadeParto || animalData.dificuldade_parto) && estaVazio(animalExistente.dificuldade_parto)
                  ? (animalData.dificuldadeParto || animalData.dificuldade_parto)
                  : animalExistente.dificuldade_parto)
              : (foiFornecido(animalData.dificuldadeParto || animalData.dificuldade_parto)
                  ? (animalData.dificuldadeParto || animalData.dificuldade_parto)
                  : animalExistente.dificuldade_parto),
            meses: atualizarApenasVazios
              ? (mesesSanitizado !== null && estaVazio(animalExistente.meses) ? mesesSanitizado : animalExistente.meses)
              : (mesesSanitizado !== null ? mesesSanitizado : animalExistente.meses),
            situacao: atualizarApenasVazios
              ? (foiFornecido(animalData.situacao) && estaVazio(animalExistente.situacao) ? animalData.situacao : animalExistente.situacao)
              : (animalData.situacao || animalExistente.situacao || 'Ativo'),
            // Campos de genealogia: SEMPRE atualizar se fornecidos, mesmo em modo atualizarApenasVazios
            // Estes campos são críticos e devem ser atualizados quando fornecidos
            pai: foiFornecido(animalData.pai) ? animalData.pai : animalExistente.pai,
            mae: foiFornecido(animalData.mae) ? animalData.mae : animalExistente.mae,
            avo_materno: foiFornecido(animalData.avoMaterno || animalData.avo_materno)
              ? (animalData.avoMaterno || animalData.avo_materno)
              : animalExistente.avo_materno,
            receptora: foiFornecido(animalData.receptora) ? animalData.receptora : animalExistente.receptora,
            is_fiv: animalData.isFiv !== undefined ? animalData.isFiv : animalExistente.is_fiv,
            custo_total: custoTotalSanitizado !== null ? custoTotalSanitizado : animalExistente.custo_total,
            valor_venda: foiFornecido(animalData.valorVenda || animalData.valor_venda)
              ? (animalData.valorVenda || animalData.valor_venda)
              : animalExistente.valor_venda,
            valor_real: foiFornecido(animalData.valorReal || animalData.valor_real)
              ? (animalData.valorReal || animalData.valor_real)
              : animalExistente.valor_real,
            veterinario: foiFornecido(animalData.veterinario) ? animalData.veterinario : animalExistente.veterinario,
            abczg: foiFornecido(animalData.abczg) ? animalData.abczg : animalExistente.abczg,
            deca: foiFornecido(animalData.deca) ? animalData.deca : animalExistente.deca,
            observacoes: animalData.observacoes || animalExistente.observacoes || `Atualizado via lote ${lote.numero_lote}`
          }

          const updateQuery = `
            UPDATE animais SET
              nome = $1, tatuagem = $2, sexo = $3, raca = $4, data_nascimento = $5,
              hora_nascimento = $6, peso = $7, cor = $8, tipo_nascimento = $9,
              dificuldade_parto = $10, meses = $11, situacao = $12, pai = $13,
              mae = $14, avo_materno = $15, receptora = $16, is_fiv = $17, custo_total = $18,
              valor_venda = $19, valor_real = $20, veterinario = $21, abczg = $22,
              deca = $23, observacoes = $24, updated_at = CURRENT_TIMESTAMP
            WHERE serie = $25 AND rg = $26
            RETURNING *
          `

          const updateValues = [
            dadosAnimal.nome, dadosAnimal.tatuagem, dadosAnimal.sexo, dadosAnimal.raca,
            dadosAnimal.data_nascimento, dadosAnimal.hora_nascimento, dadosAnimal.peso,
            dadosAnimal.cor, dadosAnimal.tipo_nascimento, dadosAnimal.dificuldade_parto,
            dadosAnimal.meses, dadosAnimal.situacao, dadosAnimal.pai, dadosAnimal.mae,
            dadosAnimal.avo_materno, dadosAnimal.receptora, dadosAnimal.is_fiv, dadosAnimal.custo_total,
            dadosAnimal.valor_venda, dadosAnimal.valor_real, dadosAnimal.veterinario,
            dadosAnimal.abczg, dadosAnimal.deca, dadosAnimal.observacoes,
            dadosAnimal.serie, dadosAnimal.rg
          ]

          // Log antes de atualizar
          console.log(`💾 Atualizando animal ${animalData.serie}-${animalData.rg} com dados:`, {
            pai: dadosAnimal.pai,
            mae: dadosAnimal.mae,
            receptora: dadosAnimal.receptora
          })

          const updateResult = await client.query(updateQuery, updateValues)
          const animal = updateResult.rows[0]
          
          // Log após atualizar
          console.log(`✅ Animal ${animalData.serie}-${animalData.rg} atualizado. Valores salvos:`, {
            pai: animal.pai,
            mae: animal.mae,
            receptora: animal.receptora
          })
          
          // Contar atualizações bem-sucedidas como sucessos (não erros)
          // Importação parcial (atualização de campos específicos) também é um sucesso
          resultados.sucessos.push({
            index: i + 1,
            brinco: `${animalData.serie}-${animalData.rg}`,
            animal_id: existingId,
            tipo: 'atualizado', // Indica que foi atualização, não inserção
            mensagem: `Animal atualizado com sucesso (ID: ${existingId})`
          })
          resultados.total_sucessos++

          console.log(`✅ Animal ${i + 1}/${animais.length} atualizado com sucesso: ${animal.serie}-${animal.rg} (ID: ${existingId})`)
          continue
        }

        // Validar e sanitizar campo meses (INTEGER: -2147483648 a 2147483647)
        let mesesSanitizado = null
        if (animalData.meses !== null && animalData.meses !== undefined) {
          const mesesValue = parseInt(animalData.meses, 10)
          if (!isNaN(mesesValue) && mesesValue >= 0 && mesesValue <= 9999) {
            mesesSanitizado = mesesValue
          } else {
            console.warn(`⚠️ Valor inválido para meses: ${animalData.meses}. Animal ${animalData.serie}-${animalData.rg}`)
            mesesSanitizado = null
          }
        }

        // Validar e sanitizar peso
        let pesoSanitizado = null
        if (animalData.peso !== null && animalData.peso !== undefined) {
          const pesoValue = parseFloat(animalData.peso)
          if (!isNaN(pesoValue) && pesoValue >= 0 && pesoValue <= 999999) {
            pesoSanitizado = pesoValue
          }
        }

        // Validar e sanitizar custo_total
        let custoTotalSanitizado = 0
        if (animalData.custoTotal !== null && animalData.custoTotal !== undefined || animalData.custo_total !== null && animalData.custo_total !== undefined) {
          const custoValue = parseFloat(animalData.custoTotal || animalData.custo_total)
          if (!isNaN(custoValue) && custoValue >= 0) {
            custoTotalSanitizado = custoValue
          }
        }

        // Mapear dados do formulário para o formato do banco
        // Usar valores padrão se não fornecidos para animais novos
        const dadosAnimal = {
          nome: animalData.nome || null,
          serie: animalData.serie,
          rg: animalData.rg,
          tatuagem: animalData.tatuagem || null,
          sexo: sexoNormalizado || 'Macho', // Padrão se não fornecido
          raca: animalData.raca || 'Nelore', // Padrão se não fornecido
          data_nascimento: animalData.dataNascimento || animalData.data_nascimento || null,
          hora_nascimento: animalData.horaNascimento || animalData.hora_nascimento || null,
          peso: pesoSanitizado,
          cor: animalData.cor || null,
          tipo_nascimento: animalData.tipoNascimento || animalData.tipo_nascimento || null,
          dificuldade_parto: animalData.dificuldadeParto || animalData.dificuldade_parto || null,
          meses: mesesSanitizado,
          situacao: animalData.situacao || 'Ativo',
          pai: animalData.pai || null,
          mae: animalData.mae || null,
          avo_materno: animalData.avoMaterno || animalData.avo_materno || null,
          receptora: animalData.receptora || null,
          is_fiv: animalData.isFiv || false,
          custo_total: custoTotalSanitizado,
          valor_venda: animalData.valorVenda || animalData.valor_venda || null,
          valor_real: animalData.valorReal || animalData.valor_real || null,
          veterinario: animalData.veterinario || null,
          abczg: animalData.abczg || null,
          deca: animalData.deca || null,
          observacoes: animalData.observacoes || `Cadastrado via lote ${lote.numero_lote}`
        }

        const query = `
          INSERT INTO animais (
            nome, serie, rg, tatuagem, sexo, raca, data_nascimento, hora_nascimento,
            peso, cor, tipo_nascimento, dificuldade_parto, meses, situacao,
            pai, mae, avo_materno, receptora, is_fiv, custo_total, valor_venda, valor_real,
            veterinario, abczg, deca, observacoes, created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
          RETURNING *
        `

        const values = [
          dadosAnimal.nome,
          dadosAnimal.serie,
          dadosAnimal.rg,
          dadosAnimal.tatuagem,
          dadosAnimal.sexo,
          dadosAnimal.raca,
          dadosAnimal.data_nascimento,
          dadosAnimal.hora_nascimento,
          dadosAnimal.peso,
          dadosAnimal.cor,
          dadosAnimal.tipo_nascimento,
          dadosAnimal.dificuldade_parto,
          dadosAnimal.meses,
          dadosAnimal.situacao,
          dadosAnimal.pai,
          dadosAnimal.mae,
          dadosAnimal.avo_materno,
          dadosAnimal.receptora,
          dadosAnimal.is_fiv,
          dadosAnimal.custo_total,
          dadosAnimal.valor_venda,
          dadosAnimal.valor_real,
          dadosAnimal.veterinario,
          dadosAnimal.abczg,
          dadosAnimal.deca,
          dadosAnimal.observacoes
        ]

        console.log(`🔄 Tentando inserir animal ${i + 1}/${animais.length}: ${animalData.serie}-${animalData.rg}`)
        console.log(`📋 Dados preparados:`, JSON.stringify({
          serie: dadosAnimal.serie,
          rg: dadosAnimal.rg,
          sexo: dadosAnimal.sexo,
          raca: dadosAnimal.raca,
          meses: dadosAnimal.meses,
          data_nascimento: dadosAnimal.data_nascimento
        }))
        
        // Executar INSERT
        console.log(`📝 Executando INSERT para ${animalData.serie}-${animalData.rg}...`)
        const result = await client.query(query, values)
        
        if (!result || !result.rows || result.rows.length === 0) {
          throw new Error('INSERT não retornou dados. Animal não foi criado.')
        }
        
        const animal = result.rows[0]
        
        if (!animal || !animal.id) {
          throw new Error('INSERT retornou dados inválidos. Animal não tem ID.')
        }
        
        console.log(`✅ INSERT executado! Animal criado com ID: ${animal.id}`)
        console.log(`📊 Animal retornado pelo banco:`, JSON.stringify({
          id: animal.id,
          serie: animal.serie,
          rg: animal.rg,
          sexo: animal.sexo,
          raca: animal.raca
        }))
        
        // Verificar IMEDIATAMENTE se foi salvo (sem usar cache)
        const verificarAposInsert = await client.query(
          'SELECT id, serie, rg FROM animais WHERE id = $1',
          [animal.id]
        )
        
        if (verificarAposInsert.rows.length === 0) {
          console.error(`❌ ERRO CRÍTICO: Animal ${animal.id} não encontrado imediatamente após INSERT!`)
          throw new Error(`Animal inserido mas não encontrado no banco (ID: ${animal.id})`)
        } else {
          const encontrado = verificarAposInsert.rows[0]
          console.log(`✅ Confirmado: Animal ${encontrado.id} (${encontrado.serie}-${encontrado.rg}) encontrado no banco`)
        }
        
        resultados.sucessos.push({
          index: i + 1,
          animal_id: animal.id,
          brinco: `${animal.serie}-${animal.rg}`,
          animal: animal,
          acao: 'criado'
        })
        resultados.total_sucessos++

        console.log(`✅ Animal ${i + 1}/${animais.length} CRIADO COM SUCESSO: ${animal.serie}-${animal.rg} (ID: ${animal.id})`)

      } catch (error) {
        resultados.erros.push({
          index: i + 1,
          brinco: `${animalData.serie}-${animalData.rg}`,
          erro: error.message,
          codigo_erro: error.code || 'UNKNOWN'
        })
        resultados.total_erros++

        console.error(`❌ Erro no animal ${i + 1}/${animais.length} (${animalData.serie}-${animalData.rg}): ${error.message}`)
      }
    }

    // Atualizar o lote com os resultados finais
    try {
      await atualizarLoteComResultados(lote.numero_lote, resultados, client)
    } catch (updateError) {
      console.error(`Erro ao atualizar lote: ${updateError.message}`)
    }

    // Cada INSERT já foi commitado automaticamente (sem transação)
    // Aguardar um pouco para garantir que todos os commits foram finalizados
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Contar total de animais DEPOIS da importação
    const totalDepois = await client.query('SELECT COUNT(*) as total FROM animais')
    const totalDepoisNum = parseInt(totalDepois.rows[0].total, 10)
    const diferenca = totalDepoisNum - totalAntesNum
    
    // Verificar quantos animais realmente foram salvos verificando os RGs específicos
    const rgsParaVerificar = animais.map(a => a.rg.toString())
    const seriesParaVerificar = [...new Set(animais.map(a => a.serie))]
    
    let totalNoBanco = 0
    for (const serie of seriesParaVerificar) {
      const animaisDestaSerie = animais.filter(a => a.serie === serie)
      const rgsDestaSerie = animaisDestaSerie.map(a => a.rg.toString())
      
      const verificarCount = await client.query(
        `SELECT COUNT(*) as total FROM animais WHERE serie = $1 AND rg = ANY($2::text[])`,
        [serie, rgsDestaSerie]
      )
      totalNoBanco += parseInt(verificarCount.rows[0].total, 10)
    }
    console.log(`✅ Processamento concluído!`)
    console.log(`📊 Animais processados com sucesso: ${resultados.total_sucessos}`)
    console.log(`📊 Total de erros: ${resultados.total_erros}`)
    console.log(`📊 Animais esperados: ${animais.length}`)

    // VALIDAÇÃO CRÍTICA: Se nenhum animal foi salvo, retornar erro
    if (resultados.total_sucessos === 0 && resultados.total_erros === 0) {
      console.error('❌ ERRO CRÍTICO: Nenhum animal foi processado!')
      throw new Error('Nenhum animal foi processado. Verifique os dados enviados.')
    }

    // Não lançar erro se todos falharam - retornar resposta com os erros detalhados
    // O frontend pode decidir como tratar baseado nos erros específicos
    if (resultados.total_sucessos === 0 && resultados.total_erros > 0) {
      console.warn('⚠️ ATENÇÃO: Todos os animais falharam na importação, mas retornando resposta detalhada ao invés de erro fatal')
      // Retornar resposta 200 com os erros detalhados ao invés de lançar erro
      return sendSuccess(res, {
        lote: lote?.numero_lote || null,
        resultados,
        resumo: {
          total_processados: resultados.total_processados,
          total_sucessos: resultados.total_sucessos,
          total_erros: resultados.total_erros,
          total_antes: totalAntesNum,
          total_depois: totalDepoisNum,
          diferenca: diferenca,
          taxa_sucesso: '0%',
          aviso: 'Todos os animais falharam. Verifique os erros detalhados abaixo.'
        }
      }, `Processamento concluído com ${resultados.total_erros} erros`, HTTP_STATUS.OK)
    }

    // Usar os valores já calculados acima (linhas 394-396)
    console.log(`📊 Total de animais DEPOIS da importação: ${totalDepoisNum}`)
    console.log(`📊 Diferença (animais adicionados): ${diferenca}`)
    
    // Verificar se realmente foram adicionados
    if (diferenca === 0 && resultados.total_sucessos > 0) {
      console.error(`❌ ERRO CRÍTICO: ${resultados.total_sucessos} animais foram processados mas NENHUM foi adicionado ao banco!`)
      console.error(`📋 Total antes: ${totalAntesNum}, Total depois: ${totalDepoisNum}`)
      throw new Error(`Animais processados mas não foram salvos no banco. Total não aumentou de ${totalAntesNum} para ${totalDepoisNum + resultados.total_sucessos}`)
    }
    
    if (diferenca < resultados.total_sucessos) {
      console.warn(`⚠️ ATENÇÃO: Apenas ${diferenca} de ${resultados.total_sucessos} animais foram realmente adicionados ao banco`)
    }
    
    console.log(`✅ Confirmação: ${diferenca} novos animais foram adicionados ao banco de dados`)

    const mensagem = `Processamento do lote ${lote.numero_lote} concluído: ${resultados.total_sucessos} sucessos, ${resultados.total_erros} erros`
    
    console.log(`🎉 ${mensagem}`)
    console.log(`📊 Confirmado: ${totalNoBanco} animais encontrados no banco de dados`)

    return sendSuccess(res, {
      lote: lote.numero_lote,
      resultados,
      resumo: {
        total_processados: resultados.total_processados,
        total_sucessos: resultados.total_sucessos,
        total_erros: resultados.total_erros,
        total_verificado_no_banco: totalNoBanco,
        total_antes: totalAntesNum,
        total_depois: totalDepoisNum,
        diferenca: diferenca,
        taxa_sucesso: ((resultados.total_sucessos / resultados.total_processados) * 100).toFixed(2) + '%'
      }
    }, mensagem, HTTP_STATUS.CREATED)

  } catch (error) {
    console.error('❌ Erro geral no processamento:', error)
    console.error('📋 Stack trace:', error.stack)
    console.error('📋 Mensagem de erro:', error.message)
    console.error('📋 Código de erro:', error.code)

    // Se houve erro geral, atualizar o lote como erro
    if (lote && lote.numero_lote) {
      try {
        // Tentar fazer update sem transação se possível
        const tempClient = await pool.connect()
        try {
          await atualizarLoteComErro(lote.numero_lote, error.message, tempClient)
        } catch (updateError) {
          console.error(`Erro ao atualizar lote com erro: ${updateError.message}`)
        } finally {
          tempClient.release()
        }
      } catch (updateError) {
        console.error(`Erro ao conectar para atualizar lote: ${updateError.message}`)
      }
    }

    // Não lançar o erro novamente - o asyncHandler vai capturar
    // Mas garantir que a resposta seja enviada corretamente
    throw error
  } finally {
    if (client) {
      client.release()
      console.log('🔌 Conexão liberada')
    }
  }
})

// Função auxiliar para atualizar o lote com os resultados
async function atualizarLoteComResultados(numeroLote, resultados, client) {
  // Verificar se o lote existe (não é um lote temporário)
  if (!numeroLote || numeroLote.startsWith('LOTE-MANUAL-')) {
    console.log(`⚠️ Pulando atualização de lote temporário: ${numeroLote}`)
    return
  }

  try {
    const status = resultados.total_erros > 0 ? 'parcial' : 'concluido'
    const taxaSucesso = resultados.total_processados > 0 
      ? ((resultados.total_sucessos / resultados.total_processados) * 100).toFixed(2) + '%'
      : '0%'
    
    await client.query(`
      UPDATE lotes_operacoes 
      SET 
        detalhes = detalhes || $1,
        status = $2,
        quantidade_registros = $3
      WHERE numero_lote = $4
    `, [
      JSON.stringify({
        resultados_finais: {
          total_processados: resultados.total_processados,
          total_sucessos: resultados.total_sucessos,
          total_erros: resultados.total_erros,
          taxa_sucesso: taxaSucesso,
          erros: resultados.erros.slice(0, 10) // Limitar erros salvos
        }
      }),
      status,
      resultados.total_sucessos,
      numeroLote
    ])
  } catch (error) {
    console.error(`Erro ao atualizar lote ${numeroLote}:`, error.message)
    // Não lançar erro - apenas logar
  }
}

// Função auxiliar para marcar lote como erro
async function atualizarLoteComErro(numeroLote, mensagemErro, client) {
  // Verificar se o lote existe (não é um lote temporário)
  if (!numeroLote || numeroLote.startsWith('LOTE-MANUAL-')) {
    console.log(`⚠️ Pulando atualização de lote temporário com erro: ${numeroLote}`)
    return
  }

  try {
    await client.query(`
      UPDATE lotes_operacoes 
      SET 
        detalhes = detalhes || $1,
        status = 'erro'
      WHERE numero_lote = $2
    `, [
      JSON.stringify({
        erro_geral: {
          mensagem: mensagemErro,
          timestamp: new Date().toISOString()
        }
      }),
      numeroLote
    ])
  } catch (error) {
    console.error(`Erro ao atualizar lote ${numeroLote} com erro:`, error.message)
    // Não lançar erro - apenas logar
  }
}