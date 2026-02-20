// Utilitário para gerenciar lotes de operações

class LoteManager {
  static async criarLote({
    tipo_operacao,
    descricao,
    detalhes = {},
    usuario = 'sistema',
    quantidade_registros = 1,
    modulo,
    req = null
  }) {
    try {
      const body = {
        tipo_operacao,
        descricao,
        detalhes,
        usuario,
        quantidade_registros,
        modulo
      };

      const response = await fetch('/api/lotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar lote: ${response.statusText}`);
      }

      const result = await response.json();
      return result.lote;
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      throw error;
    }
  }

  static async criarLoteServidor({
    tipo_operacao,
    descricao,
    detalhes = {},
    usuario = 'sistema',
    quantidade_registros = 1,
    modulo,
    pool
  }) {
    const client = await pool.connect();
    
    try {
      const query = `
        INSERT INTO lotes_operacoes 
        (numero_lote, tipo_operacao, descricao, detalhes, usuario, quantidade_registros, modulo)
        VALUES (gerar_proximo_lote(), $1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const result = await client.query(query, [
        tipo_operacao,
        descricao,
        JSON.stringify(detalhes),
        usuario,
        quantidade_registros,
        modulo
      ]);

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Tipos de operação predefinidos
  static TIPOS = {
    // Animais
    CADASTRO_ANIMAIS: 'CADASTRO_ANIMAIS',
    EDICAO_ANIMAL: 'EDICAO_ANIMAL',
    EXCLUSAO_ANIMAL: 'EXCLUSAO_ANIMAL',
    MOVIMENTACAO_ANIMAL: 'MOVIMENTACAO_ANIMAL',
    BAIXA_ANIMAL: 'BAIXA_ANIMAL',
    
    // Contabilidade
    ENTRADA_NF: 'ENTRADA_NF',
    LANCAMENTO_CUSTO: 'LANCAMENTO_CUSTO',
    EXCLUSAO_NF: 'EXCLUSAO_NF',
    
    // Gestação
    CADASTRO_GESTACAO: 'CADASTRO_GESTACAO',
    FINALIZACAO_GESTACAO: 'FINALIZACAO_GESTACAO',
    
    // Nascimentos
    REGISTRO_NASCIMENTO: 'REGISTRO_NASCIMENTO',
    EDICAO_NASCIMENTO: 'EDICAO_NASCIMENTO',
    
    // Mortes
    REGISTRO_MORTE: 'REGISTRO_MORTE',
    EDICAO_MORTE: 'EDICAO_MORTE',
    
    // Sêmen
    ENTRADA_SEMEN: 'ENTRADA_SEMEN',
    SAIDA_SEMEN: 'SAIDA_SEMEN',
    AJUSTE_ESTOQUE_SEMEN: 'AJUSTE_ESTOQUE_SEMEN',
    
    // Receptoras
    CADASTRO_RECEPTORAS: 'CADASTRO_RECEPTORAS',
    EDICAO_RECEPTORA: 'EDICAO_RECEPTORA',
    
    // Transferências
    TRANSFERENCIA_EMBRIAO: 'TRANSFERENCIA_EMBRIAO',
    
    // Sistema
    BACKUP_DADOS: 'BACKUP_DADOS',
    IMPORTACAO_DADOS: 'IMPORTACAO_DADOS',
    LIMPEZA_DADOS: 'LIMPEZA_DADOS'
  };

  // Módulos do sistema
  static MODULOS = {
    ANIMAIS: 'ANIMAIS',
    CONTABILIDADE: 'CONTABILIDADE',
    GESTACAO: 'GESTACAO',
    NASCIMENTOS: 'NASCIMENTOS',
    MORTES: 'MORTES',
    SEMEN: 'SEMEN',
    RECEPTORAS: 'RECEPTORAS',
    TRANSFERENCIAS: 'TRANSFERENCIAS',
    SISTEMA: 'SISTEMA'
  };

  // Função helper para criar lote de cadastro em lote
  static async criarLoteCadastroLote({
    tipo_entidade,
    quantidade,
    detalhes_adicionais = {},
    usuario = 'sistema',
    modulo
  }) {
    const descricao = `Cadastro em lote de ${quantidade} ${tipo_entidade}`;
    
    return await this.criarLote({
      tipo_operacao: `CADASTRO_${tipo_entidade.toUpperCase()}`,
      descricao,
      detalhes: {
        tipo_entidade,
        quantidade,
        ...detalhes_adicionais
      },
      usuario,
      quantidade_registros: quantidade,
      modulo
    });
  }

  // Função helper para operações individuais
  static async criarLoteOperacaoIndividual({
    tipo_operacao,
    entidade_id,
    entidade_tipo,
    descricao_personalizada = null,
    detalhes_adicionais = {},
    usuario = 'sistema',
    modulo
  }) {
    const descricao = descricao_personalizada || 
      `${tipo_operacao.replace('_', ' ').toLowerCase()} - ${entidade_tipo} ID: ${entidade_id}`;
    
    return await this.criarLote({
      tipo_operacao,
      descricao,
      detalhes: {
        entidade_id,
        entidade_tipo,
        ...detalhes_adicionais
      },
      usuario,
      quantidade_registros: 1,
      modulo
    });
  }
}

export default LoteManager;