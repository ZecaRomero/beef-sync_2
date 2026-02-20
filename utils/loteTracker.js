import { query } from '../lib/database'
import logger from './logger'

/**
 * Sistema de rastreamento de operações em lotes
 */
class LoteTracker {
  /**
   * Registra uma nova operação no sistema de lotes
   */
  static async registrarOperacao({
    tipo_operacao,
    descricao,
    modulo,
    detalhes = null,
    usuario = 'Sistema',
    quantidade_registros = 1,
    status = 'concluido',
    req = null
  }) {
    try {
      // Gerar número do lote único
      const timestamp = Date.now()
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      const numero_lote = `${modulo.substring(0, 3).toUpperCase()}-${timestamp}-${random}`

      // Capturar informações da requisição se disponível
      let ip_origem = null
      let user_agent = null
      
      if (req) {
        ip_origem = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
        user_agent = req.headers['user-agent'] || 'unknown'
      }

      // Inserir no banco
      const result = await query(`
        INSERT INTO lotes_operacoes (
          numero_lote,
          tipo_operacao,
          descricao,
          detalhes,
          usuario,
          data_criacao,
          quantidade_registros,
          status,
          modulo,
          ip_origem,
          user_agent
        ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        numero_lote,
        tipo_operacao,
        descricao,
        detalhes ? JSON.stringify(detalhes) : null,
        usuario,
        quantidade_registros,
        status,
        modulo,
        ip_origem,
        user_agent
      ])

      logger.info(`Operação registrada: ${numero_lote} - ${tipo_operacao}`)
      return result.rows[0]

    } catch (error) {
      logger.error('Erro ao registrar operação:', error)
      throw error
    }
  }

  /**
   * Registra operação de localização de animal
   */
  static async registrarLocalizacao({
    animal_id,
    animal_identificacao,
    piquete_origem,
    piquete_destino,
    motivo,
    usuario = 'Sistema',
    req = null
  }) {
    const descricao = piquete_origem 
      ? `Animal ${animal_identificacao} transferido de ${piquete_origem} para ${piquete_destino}`
      : `Animal ${animal_identificacao} localizado em ${piquete_destino}`

    const detalhes = {
      animal_id,
      animal_identificacao,
      piquete_origem,
      piquete_destino,
      motivo,
      timestamp: new Date().toISOString()
    }

    return await this.registrarOperacao({
      tipo_operacao: 'LOCALIZACAO_ANIMAL',
      descricao,
      modulo: 'ANIMAIS',
      detalhes,
      usuario,
      quantidade_registros: 1,
      status: 'concluido',
      req
    })
  }

  /**
   * Registra operação de cadastro de animal
   */
  static async registrarCadastroAnimal({
    animal_id,
    animal_identificacao,
    dados_animal,
    usuario = 'Sistema',
    req = null
  }) {
    const descricao = `Novo animal cadastrado: ${animal_identificacao} (${dados_animal.raca}, ${dados_animal.sexo})`

    const detalhes = {
      animal_id,
      animal_identificacao,
      dados_animal,
      timestamp: new Date().toISOString()
    }

    return await this.registrarOperacao({
      tipo_operacao: 'CADASTRO_ANIMAL',
      descricao,
      modulo: 'ANIMAIS',
      detalhes,
      usuario,
      quantidade_registros: 1,
      status: 'concluido',
      req
    })
  }

  /**
   * Registra operação em lote (múltiplos animais)
   */
  static async registrarOperacaoLote({
    tipo_operacao,
    animais,
    descricao_base,
    detalhes_extras = {},
    usuario = 'Sistema',
    req = null
  }) {
    const quantidade = animais.length
    const descricao = `${descricao_base} - ${quantidade} animal(is) processado(s)`

    const detalhes = {
      animais: animais.map(animal => ({
        id: animal.id,
        identificacao: `${animal.serie}-${animal.rg}`,
        raca: animal.raca,
        sexo: animal.sexo
      })),
      quantidade_processada: quantidade,
      ...detalhes_extras,
      timestamp: new Date().toISOString()
    }

    return await this.registrarOperacao({
      tipo_operacao,
      descricao,
      modulo: 'ANIMAIS',
      detalhes,
      usuario,
      quantidade_registros: quantidade,
      status: 'concluido',
      req
    })
  }

  /**
   * Registra erro em operação
   */
  static async registrarErro({
    tipo_operacao,
    descricao,
    erro,
    modulo = 'SISTEMA',
    usuario = 'Sistema',
    req = null
  }) {
    const detalhes = {
      erro: erro.message || erro,
      stack: erro.stack || null,
      timestamp: new Date().toISOString()
    }

    return await this.registrarOperacao({
      tipo_operacao,
      descricao: `ERRO: ${descricao}`,
      modulo,
      detalhes,
      usuario,
      quantidade_registros: 0,
      status: 'erro',
      req
    })
  }
}

export default LoteTracker