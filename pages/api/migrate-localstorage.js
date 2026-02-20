import { query } from '../../lib/database';

/**
 * API para migrar dados do localStorage para PostgreSQL
 * Endpoint: POST /api/migrate-localstorage
 * 
 * Body esperado:
 * {
 *   nfsReceptoras: [...],  // Dados do localStorage
 *   naturezasOperacao: [...],
 *   origensReceptoras: [...]
 * }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { nfsReceptoras, naturezasOperacao, origensReceptoras } = req.body;
    const results = {
      nfsMigradas: 0,
      naturezasMigradas: 0,
      origensMigradas: 0,
      erros: []
    };

    // Migrar Notas Fiscais
    if (nfsReceptoras && Array.isArray(nfsReceptoras)) {
      for (const nf of nfsReceptoras) {
        try {
          await query(`
            INSERT INTO notas_fiscais (
              numero_nf, origem, data_compra, valor_total,
              quantidade_receptoras, valor_por_receptora, fornecedor, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT DO NOTHING
          `, [
            nf.numeroNF || nf.numero_nf,
            nf.origem,
            nf.dataCompra || nf.data_compra,
            parseFloat(nf.valorTotal || nf.valor_total || 0),
            parseInt(nf.quantidadeReceptoras || nf.quantidade_receptoras || 0),
            parseFloat(nf.valorPorReceptora || nf.valor_por_receptora || 0),
            nf.fornecedor,
            nf.observacoes
          ]);
          results.nfsMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'nota_fiscal',
            nf: nf.numeroNF || nf.numero_nf,
            erro: error.message
          });
        }
      }
    }

    // Migrar Naturezas de Operação
    if (naturezasOperacao && Array.isArray(naturezasOperacao)) {
      for (const natureza of naturezasOperacao) {
        try {
          await query(`
            INSERT INTO naturezas_operacao (nome, tipo, descricao, ativo)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (nome) DO NOTHING
          `, [
            natureza.nome,
            natureza.tipo,
            natureza.descricao || null,
            natureza.ativo !== false
          ]);
          results.naturezasMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'natureza_operacao',
            nome: natureza.nome,
            erro: error.message
          });
        }
      }
    }

    // Migrar Origens de Receptoras
    if (origensReceptoras && Array.isArray(origensReceptoras)) {
      for (const origem of origensReceptoras) {
        try {
          await query(`
            INSERT INTO origens_receptoras (nome, descricao, ativo)
            VALUES ($1, $2, $3)
            ON CONFLICT (nome) DO NOTHING
          `, [
            origem.nome,
            origem.descricao || null,
            origem.ativo !== false
          ]);
          results.origensMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'origem_receptora',
            nome: origem.nome,
            erro: error.message
          });
        }
      }
    }

    return res.status(200).json({
      message: 'Migração concluída',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro na migração:', error);
    return res.status(500).json({
      message: 'Erro ao migrar dados',
      error: error.message
    });
  }
}

