// Usar o módulo centralizado de conexão com PostgreSQL
const { query, pool } = require('../lib/database');

class NFService {
  // Buscar todas as NFs com filtros
  static async getNotasFiscais(filtros = {}) {
    const { tipo, status, dataInicio, dataFim, fornecedor } = filtros;
    
    let sqlQuery = `
      SELECT 
        nf.*,
        fc.nome as fornecedor_nome,
        no.nome as natureza_nome,
        COUNT(ni.id) as total_itens,
        SUM(ni.valor_unitario) as valor_total_calculado
      FROM notas_fiscais nf
      LEFT JOIN fornecedores_clientes fc ON nf.fornecedor_cliente_id = fc.id
      LEFT JOIN naturezas_operacao no ON nf.natureza_operacao_id = no.id
      LEFT JOIN nf_itens ni ON nf.id = ni.nf_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (tipo) {
      sqlQuery += ` AND nf.tipo = $${++paramCount}`;
      params.push(tipo);
    }
    
    if (status) {
      sqlQuery += ` AND nf.status = $${++paramCount}`;
      params.push(status);
    }
    
    if (dataInicio) {
      sqlQuery += ` AND nf.data_operacao >= $${++paramCount}`;
      params.push(dataInicio);
    }
    
    if (dataFim) {
      sqlQuery += ` AND nf.data_operacao <= $${++paramCount}`;
      params.push(dataFim);
    }
    
    if (fornecedor) {
      sqlQuery += ` AND fc.nome ILIKE $${++paramCount}`;
      params.push(`%${fornecedor}%`);
    }
    
    sqlQuery += `
      GROUP BY nf.id, fc.nome, no.nome
      ORDER BY nf.data_operacao DESC, nf.created_at DESC
    `;
    
    const result = await query(sqlQuery, params);
    return result.rows;
  }

  // Buscar NF por ID com itens
  static async getNotaFiscalById(id) {
    const nfQuery = `
      SELECT 
        nf.*,
        fc.nome as fornecedor_nome,
        fc.documento as fornecedor_documento,
        no.nome as natureza_nome
      FROM notas_fiscais nf
      LEFT JOIN fornecedores_clientes fc ON nf.fornecedor_cliente_id = fc.id
      LEFT JOIN naturezas_operacao no ON nf.natureza_operacao_id = no.id
      WHERE nf.id = $1
    `;
    
    const itensQuery = `
      SELECT * FROM nf_itens WHERE nf_id = $1 ORDER BY id
    `;
    
    const [nfResult, itensResult] = await Promise.all([
      query(nfQuery, [id]),
      query(itensQuery, [id])
    ]);
    
    if (nfResult.rows.length === 0) {
      return null;
    }
    
    return {
      ...nfResult.rows[0],
      itens: itensResult.rows
    };
  }

  // Criar nova NF
  static async createNotaFiscal(nfData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Criar ou buscar fornecedor/cliente
      const fornecedorId = await this.createOrGetFornecedorCliente(nfData.fornecedor, nfData.tipo);
      
      // Inserir NF
      const nfQuery = `
        INSERT INTO notas_fiscais (
          numero_nf, tipo, data_operacao, fornecedor_cliente_id, 
          natureza_operacao_id, valor_total, quantidade_animais, observacoes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      
      const nfResult = await client.query(nfQuery, [
        nfData.numeroNF,
        nfData.tipo,
        nfData.dataOperacao,
        fornecedorId,
        nfData.naturezaOperacaoId,
        nfData.valorTotal || 0,
        nfData.quantidadeAnimais || 0,
        nfData.observacoes
      ]);
      
      const nfId = nfResult.rows[0].id;
      
      // Inserir itens se existirem
      if (nfData.itens && nfData.itens.length > 0) {
        for (const item of nfData.itens) {
          await client.query(`
            INSERT INTO nf_itens (
              nf_id, tatuagem, sexo, era, valor_unitario, peso, raca, observacoes_item
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            nfId, item.tatuagem, item.sexo, item.era, 
            item.valorUnitario, item.peso, item.raca, item.observacoes
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Registrar no histórico
      await this.registrarHistorico(nfId, 'criado', null, nfData);
      
      return await this.getNotaFiscalById(nfId);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Atualizar NF
  static async updateNotaFiscal(id, nfData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Buscar dados anteriores para histórico
      const dadosAnteriores = await this.getNotaFiscalById(id);
      
      // Criar ou buscar fornecedor/cliente
      const fornecedorId = await this.createOrGetFornecedorCliente(nfData.fornecedor, nfData.tipo);
      
      // Atualizar NF
      const nfQuery = `
        UPDATE notas_fiscais SET
          numero_nf = $1,
          data_operacao = $2,
          fornecedor_cliente_id = $3,
          natureza_operacao_id = $4,
          valor_total = $5,
          quantidade_animais = $6,
          observacoes = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;
      
      await client.query(nfQuery, [
        nfData.numeroNF,
        nfData.dataOperacao,
        fornecedorId,
        nfData.naturezaOperacaoId,
        nfData.valorTotal || 0,
        nfData.quantidadeAnimais || 0,
        nfData.observacoes,
        id
      ]);
      
      // Remover itens antigos e inserir novos
      await client.query('DELETE FROM nf_itens WHERE nf_id = $1', [id]);
      
      if (nfData.itens && nfData.itens.length > 0) {
        for (const item of nfData.itens) {
          await client.query(`
            INSERT INTO nf_itens (
              nf_id, tatuagem, sexo, era, valor_unitario, peso, raca, observacoes_item
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            id, item.tatuagem, item.sexo, item.era, 
            item.valorUnitario, item.peso, item.raca, item.observacoes
          ]);
        }
      }
      
      await client.query('COMMIT');
      
      // Registrar no histórico
      await this.registrarHistorico(id, 'editado', dadosAnteriores, nfData);
      
      return await this.getNotaFiscalById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Deletar NF
  static async deleteNotaFiscal(id) {
    const dadosAnteriores = await this.getNotaFiscalById(id);
    
    await query('DELETE FROM notas_fiscais WHERE id = $1', [id]);
    
    // Registrar no histórico
    await this.registrarHistorico(id, 'excluido', dadosAnteriores, null);
    
    return true;
  }

  // Criar ou buscar fornecedor/cliente
  static async createOrGetFornecedorCliente(nome, tipoNF) {
    const tipo = tipoNF === 'entrada' ? 'fornecedor' : 'cliente';
    
    // Buscar existente
    const existing = await query(
      'SELECT id FROM fornecedores_clientes WHERE nome = $1 AND tipo = $2',
      [nome, tipo]
    );
    
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    
    // Criar novo
    const result = await query(
      'INSERT INTO fornecedores_clientes (nome, tipo) VALUES ($1, $2) RETURNING id',
      [nome, tipo]
    );
    
    return result.rows[0].id;
  }

  // Registrar histórico
  static async registrarHistorico(nfId, acao, dadosAnteriores, dadosNovos) {
    await query(`
      INSERT INTO historico_movimentacoes (nf_id, acao, dados_anteriores, dados_novos, usuario)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      nfId, 
      acao, 
      dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
      dadosNovos ? JSON.stringify(dadosNovos) : null,
      'sistema'
    ]);
  }

  // Buscar naturezas de operação com filtros opcionais
  static async getNaturezasOperacao(tipo = null, q = null, limit = null, offset = null) {
    let sqlQuery = 'SELECT * FROM naturezas_operacao WHERE ativo = true';
    const params = [];
    let paramCount = 0;
    
    if (tipo) {
      sqlQuery += ` AND tipo = $${++paramCount}`;
      params.push(tipo);
    }
    
    if (q) {
      sqlQuery += ` AND (nome ILIKE $${++paramCount} OR coalesce(descricao,'') ILIKE $${++paramCount})`;
      params.push(`%${q}%`);
      params.push(`%${q}%`);
    }
    
    sqlQuery += ' ORDER BY nome';
    
    if (limit) {
      sqlQuery += ` LIMIT $${++paramCount}`;
      params.push(parseInt(limit, 10));
    }
    if (offset) {
      sqlQuery += ` OFFSET $${++paramCount}`;
      params.push(parseInt(offset, 10));
    }
    
    const result = await query(sqlQuery, params);
    return result.rows;
  }

  // Buscar natureza de operação por ID
  static async getNaturezaOperacaoById(id) {
    const sqlQuery = 'SELECT * FROM naturezas_operacao WHERE id = $1';
    const result = await query(sqlQuery, [id]);
    return result.rows[0] || null;
  }

  // Criar natureza de operação
  static async createNaturezaOperacao(dados) {
    const { nome, tipo, descricao } = dados;
    const sqlQuery = `
      INSERT INTO naturezas_operacao (nome, tipo, descricao)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await query(sqlQuery, [nome, tipo, descricao || null]);
    return result.rows[0];
  }

  // Atualizar natureza de operação
  static async updateNaturezaOperacao(id, dados) {
    const { nome, tipo, descricao, ativo } = dados;
    const sqlQuery = `
      UPDATE naturezas_operacao
      SET nome = $1, tipo = $2, descricao = $3, ativo = $4
      WHERE id = $5
      RETURNING *
    `;
    const result = await query(sqlQuery, [nome, tipo, descricao || null, ativo !== false, id]);
    return result.rows[0];
  }

  // Deletar natureza de operação (soft delete)
  static async deleteNaturezaOperacao(id) {
    const sqlQuery = 'UPDATE naturezas_operacao SET ativo = false WHERE id = $1';
    await query(sqlQuery, [id]);
    return true;
  }

  // Marcar NF como enviada para contabilidade
  static async marcarEnviadaContabilidade(id) {
    await query(`
      UPDATE notas_fiscais 
      SET status = 'enviado_contabilidade', data_envio_contabilidade = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    await this.registrarHistorico(id, 'enviado_contabilidade', null, { status: 'enviado_contabilidade' });
    
    return true;
  }

  // Buscar NFs para envio à contabilidade
  static async getNFsParaContabilidade(dataInicio, dataFim) {
    const sqlQuery = `
      SELECT 
        nf.*,
        fc.nome as fornecedor_nome,
        fc.documento as fornecedor_documento,
        no.nome as natureza_nome,
        json_agg(
          json_build_object(
            'tatuagem', ni.tatuagem,
            'sexo', ni.sexo,
            'era', ni.era,
            'valor_unitario', ni.valor_unitario,
            'peso', ni.peso,
            'raca', ni.raca
          )
        ) as itens
      FROM notas_fiscais nf
      LEFT JOIN fornecedores_clientes fc ON nf.fornecedor_cliente_id = fc.id
      LEFT JOIN naturezas_operacao no ON nf.natureza_operacao_id = no.id
      LEFT JOIN nf_itens ni ON nf.id = ni.nf_id
      WHERE nf.status = 'ativo'
      AND nf.data_operacao BETWEEN $1 AND $2
      GROUP BY nf.id, fc.nome, fc.documento, no.nome
      ORDER BY nf.data_operacao, nf.numero_nf
    `;
    
    const result = await query(sqlQuery, [dataInicio, dataFim]);
    return result.rows;
  }
}

module.exports = NFService;
