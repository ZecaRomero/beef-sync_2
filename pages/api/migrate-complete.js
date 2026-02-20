import { query } from '../../lib/database';
import { logger } from '../../utils/logger';

/**
 * API para migração completa do localStorage para PostgreSQL
 * Endpoint: POST /api/migrate-complete
 * 
 * Migra todos os tipos de dados:
 * - Animais
 * - Notas Fiscais
 * - Estoque de Sêmen
 * - Gestações
 * - Nascimentos
 * - Transferências de Embriões
 * - Serviços
 * - Custos
 * - Localizações
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const data = req.body;
    const results = {
      animaisMigrados: 0,
      nfsMigradas: 0,
      semenMigrado: 0,
      gestacoesMigradas: 0,
      nascimentosMigrados: 0,
      transferenciasMigradas: 0,
      servicosMigrados: 0,
      custosMigrados: 0,
      localizacoesMigradas: 0,
      erros: [],
      timestamp: new Date().toISOString()
    };

    logger.info('Iniciando migração completa do localStorage para PostgreSQL');

    // 1. Migrar Animais
    if (data.animals && Array.isArray(data.animals)) {
      logger.info(`Migrando ${data.animals.length} animais...`);
      for (const animal of data.animals) {
        try {
          await query(`
            INSERT INTO animais (
              serie, rg, tatuagem, sexo, raca, data_nascimento, hora_nascimento,
              peso, cor, tipo_nascimento, dificuldade_parto, meses, situacao,
              pai, mae, receptora, is_fiv, custo_total, valor_venda, valor_real,
              veterinario, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT (serie, rg) DO UPDATE SET
              tatuagem = EXCLUDED.tatuagem,
              sexo = EXCLUDED.sexo,
              raca = EXCLUDED.raca,
              data_nascimento = EXCLUDED.data_nascimento,
              hora_nascimento = EXCLUDED.hora_nascimento,
              peso = EXCLUDED.peso,
              cor = EXCLUDED.cor,
              tipo_nascimento = EXCLUDED.tipo_nascimento,
              dificuldade_parto = EXCLUDED.dificuldade_parto,
              meses = EXCLUDED.meses,
              situacao = EXCLUDED.situacao,
              pai = EXCLUDED.pai,
              mae = EXCLUDED.mae,
              receptora = EXCLUDED.receptora,
              is_fiv = EXCLUDED.is_fiv,
              custo_total = EXCLUDED.custo_total,
              valor_venda = EXCLUDED.valor_venda,
              valor_real = EXCLUDED.valor_real,
              veterinario = EXCLUDED.veterinario,
              observacoes = EXCLUDED.observacoes,
              updated_at = CURRENT_TIMESTAMP
          `, [
            animal.serie,
            animal.rg,
            animal.tatuagem || null,
            animal.sexo,
            animal.raca,
            animal.dataNascimento || animal.data_nascimento || null,
            animal.horaNascimento || animal.hora_nascimento || null,
            animal.peso ? parseFloat(animal.peso) : null,
            animal.cor || null,
            animal.tipoNascimento || animal.tipo_nascimento || null,
            animal.dificuldadeParto || animal.dificuldade_parto || null,
            animal.meses ? parseInt(animal.meses) : null,
            animal.situacao || 'Ativo',
            animal.pai || null,
            animal.mae || null,
            animal.receptora || null,
            animal.isFiv || animal.is_fiv || false,
            animal.custoTotal || animal.custo_total ? parseFloat(animal.custoTotal || animal.custo_total) : 0,
            animal.valorVenda || animal.valor_venda ? parseFloat(animal.valorVenda || animal.valor_venda) : null,
            animal.valorReal || animal.valor_real ? parseFloat(animal.valorReal || animal.valor_real) : null,
            animal.veterinario || null,
            animal.observacoes || null
          ]);
          results.animaisMigrados++;
        } catch (error) {
          results.erros.push({
            tipo: 'animal',
            identificacao: `${animal.serie}-${animal.rg}`,
            erro: error.message
          });
        }
      }
    }

    // 2. Migrar Notas Fiscais
    if (data.notasFiscais && Array.isArray(data.notasFiscais)) {
      logger.info(`Migrando ${data.notasFiscais.length} notas fiscais...`);
      for (const nf of data.notasFiscais) {
        try {
          await query(`
            INSERT INTO notas_fiscais (
              numero_nf, data_compra, data, origem, fornecedor, destino,
              valor_total, quantidade_receptoras, valor_por_receptora,
              observacoes, natureza_operacao, tipo, tipo_produto, itens
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (numero_nf) DO UPDATE SET
              data_compra = EXCLUDED.data_compra,
              data = EXCLUDED.data,
              origem = EXCLUDED.origem,
              fornecedor = EXCLUDED.fornecedor,
              destino = EXCLUDED.destino,
              valor_total = EXCLUDED.valor_total,
              quantidade_receptoras = EXCLUDED.quantidade_receptoras,
              valor_por_receptora = EXCLUDED.valor_por_receptora,
              observacoes = EXCLUDED.observacoes,
              natureza_operacao = EXCLUDED.natureza_operacao,
              tipo = EXCLUDED.tipo,
              tipo_produto = EXCLUDED.tipo_produto,
              itens = EXCLUDED.itens,
              updated_at = CURRENT_TIMESTAMP
          `, [
            nf.numeroNF || nf.numero_nf,
            nf.dataCompra || nf.data_compra || null,
            nf.data || null,
            nf.origem || null,
            nf.fornecedor || null,
            nf.destino || null,
            nf.valorTotal || nf.valor_total ? parseFloat(nf.valorTotal || nf.valor_total) : 0,
            nf.quantidadeReceptoras || nf.quantidade_receptoras ? parseInt(nf.quantidadeReceptoras || nf.quantidade_receptoras) : null,
            nf.valorPorReceptora || nf.valor_por_receptora ? parseFloat(nf.valorPorReceptora || nf.valor_por_receptora) : null,
            nf.observacoes || null,
            nf.naturezaOperacao || nf.natureza_operacao || null,
            nf.tipo || 'entrada',
            nf.tipoProduto || nf.tipo_produto || 'bovino',
            JSON.stringify(nf.itens || [])
          ]);
          results.nfsMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'nota_fiscal',
            numero: nf.numeroNF || nf.numero_nf,
            erro: error.message
          });
        }
      }
    }

    // 3. Migrar Estoque de Sêmen
    if (data.estoqueSemen && Array.isArray(data.estoqueSemen)) {
      logger.info(`Migrando ${data.estoqueSemen.length} registros de estoque de sêmen...`);
      for (const semen of data.estoqueSemen) {
        try {
          await query(`
            INSERT INTO estoque_semen (
              nome_touro, rg_touro, raca, localizacao, rack_touro, botijao, caneca,
              tipo_operacao, fornecedor, destino, numero_nf, valor_compra, data_compra,
              quantidade_doses, doses_disponiveis, doses_usadas, certificado,
              data_validade, origem, linhagem, observacoes, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT DO NOTHING
          `, [
            semen.nomeTouro || semen.nome_touro,
            semen.rgTouro || semen.rg_touro || null,
            semen.raca || null,
            semen.localizacao || null,
            semen.rackTouro || semen.rack_touro || null,
            semen.botijao || null,
            semen.caneca || null,
            semen.tipoOperacao || semen.tipo_operacao || 'entrada',
            semen.fornecedor || null,
            semen.destino || null,
            semen.numeroNF || semen.numero_nf || null,
            semen.valorCompra || semen.valor_compra ? parseFloat(semen.valorCompra || semen.valor_compra) : 0,
            semen.dataCompra || semen.data_compra || null,
            semen.quantidadeDoses || semen.quantidade_doses ? parseInt(semen.quantidadeDoses || semen.quantidade_doses) : 0,
            semen.dosesDisponiveis || semen.doses_disponiveis ? parseInt(semen.dosesDisponiveis || semen.doses_disponiveis) : 0,
            semen.dosesUsadas || semen.doses_usadas ? parseInt(semen.dosesUsadas || semen.doses_usadas) : 0,
            semen.certificado || null,
            semen.dataValidade || semen.data_validade || null,
            semen.origem || null,
            semen.linhagem || null,
            semen.observacoes || null,
            semen.status || 'disponivel'
          ]);
          results.semenMigrado++;
        } catch (error) {
          results.erros.push({
            tipo: 'estoque_semen',
            touro: semen.nomeTouro || semen.nome_touro,
            erro: error.message
          });
        }
      }
    }

    // 4. Migrar Gestações
    if (data.gestacoes && Array.isArray(data.gestacoes)) {
      logger.info(`Migrando ${data.gestacoes.length} gestações...`);
      for (const gestacao of data.gestacoes) {
        try {
          await query(`
            INSERT INTO gestacoes (
              pai_serie, pai_rg, mae_serie, mae_rg, receptora_nome,
              receptora_serie, receptora_rg, data_cobertura, custo_acumulado,
              situacao, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT DO NOTHING
          `, [
            gestacao.paiSerie || gestacao.pai_serie || null,
            gestacao.paiRG || gestacao.pai_rg || null,
            gestacao.maeSerie || gestacao.mae_serie || null,
            gestacao.maeRG || gestacao.mae_rg || null,
            gestacao.receptoraNome || gestacao.receptora_nome || null,
            gestacao.receptoraSerie || gestacao.receptora_serie || null,
            gestacao.receptoraRG || gestacao.receptora_rg || null,
            gestacao.dataCobertura || gestacao.data_cobertura,
            gestacao.custoAcumulado || gestacao.custo_acumulado ? parseFloat(gestacao.custoAcumulado || gestacao.custo_acumulado) : 0,
            gestacao.situacao || 'Ativa',
            gestacao.observacoes || null
          ]);
          results.gestacoesMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'gestacao',
            identificacao: `${gestacao.paiSerie || gestacao.pai_serie}-${gestacao.paiRG || gestacao.pai_rg}`,
            erro: error.message
          });
        }
      }
    }

    // 5. Migrar Nascimentos
    if (data.nascimentos && Array.isArray(data.nascimentos)) {
      logger.info(`Migrando ${data.nascimentos.length} nascimentos...`);
      for (const nascimento of data.nascimentos) {
        try {
          await query(`
            INSERT INTO nascimentos (
              serie, rg, sexo, data_nascimento, hora_nascimento, peso, cor,
              tipo_nascimento, dificuldade_parto, custo_nascimento,
              veterinario, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT DO NOTHING
          `, [
            nascimento.serie,
            nascimento.rg,
            nascimento.sexo,
            nascimento.dataNascimento || nascimento.data_nascimento,
            nascimento.horaNascimento || nascimento.hora_nascimento || null,
            nascimento.peso ? parseFloat(nascimento.peso) : null,
            nascimento.cor || null,
            nascimento.tipoNascimento || nascimento.tipo_nascimento || null,
            nascimento.dificuldadeParto || nascimento.dificuldade_parto || null,
            nascimento.custoNascimento || nascimento.custo_nascimento ? parseFloat(nascimento.custoNascimento || nascimento.custo_nascimento) : 0,
            nascimento.veterinario || null,
            nascimento.observacoes || null
          ]);
          results.nascimentosMigrados++;
        } catch (error) {
          results.erros.push({
            tipo: 'nascimento',
            identificacao: `${nascimento.serie}-${nascimento.rg}`,
            erro: error.message
          });
        }
      }
    }

    // 6. Migrar Transferências de Embriões
    if (data.transferenciasEmbrioes && Array.isArray(data.transferenciasEmbrioes)) {
      logger.info(`Migrando ${data.transferenciasEmbrioes.length} transferências de embriões...`);
      for (const te of data.transferenciasEmbrioes) {
        try {
          await query(`
            INSERT INTO transferencias_embrioes (
              numero_te, data_te, local_te, data_fiv, raca,
              tecnico_responsavel, observacoes, status, resultado, data_diagnostico
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (numero_te) DO UPDATE SET
              data_te = EXCLUDED.data_te,
              local_te = EXCLUDED.local_te,
              data_fiv = EXCLUDED.data_fiv,
              raca = EXCLUDED.raca,
              tecnico_responsavel = EXCLUDED.tecnico_responsavel,
              observacoes = EXCLUDED.observacoes,
              status = EXCLUDED.status,
              resultado = EXCLUDED.resultado,
              data_diagnostico = EXCLUDED.data_diagnostico,
              updated_at = CURRENT_TIMESTAMP
          `, [
            te.numeroTE || te.numero_te,
            te.dataTE || te.data_te,
            te.localTE || te.local_te || null,
            te.dataFIV || te.data_fiv || null,
            te.raca || null,
            te.tecnicoResponsavel || te.tecnico_responsavel || null,
            te.observacoes || null,
            te.status || 'realizada',
            te.resultado || null,
            te.dataDiagnostico || te.data_diagnostico || null
          ]);
          results.transferenciasMigradas++;
        } catch (error) {
          results.erros.push({
            tipo: 'transferencia_embriao',
            numero: te.numeroTE || te.numero_te,
            erro: error.message
          });
        }
      }
    }

    // 7. Migrar Serviços
    if (data.servicos && Array.isArray(data.servicos)) {
      logger.info(`Migrando ${data.servicos.length} serviços...`);
      for (const servico of data.servicos) {
        try {
          await query(`
            INSERT INTO servicos (
              tipo, descricao, data_aplicacao, custo, status,
              responsavel, observacoes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING
          `, [
            servico.tipo,
            servico.descricao,
            servico.dataAplicacao || servico.data_aplicacao,
            servico.custo ? parseFloat(servico.custo) : 0,
            servico.status || 'Pendente',
            servico.responsavel || 'Não informado',
            servico.observacoes || null
          ]);
          results.servicosMigrados++;
        } catch (error) {
          results.erros.push({
            tipo: 'servico',
            descricao: servico.descricao,
            erro: error.message
          });
        }
      }
    }

    logger.info('Migração completa finalizada', results);

    return res.status(200).json({
      message: 'Migração completa concluída com sucesso',
      results,
      summary: {
        totalMigrados: results.animaisMigrados + results.nfsMigradas + results.semenMigrado + 
                      results.gestacoesMigradas + results.nascimentosMigrados + results.transferenciasMigradas + 
                      results.servicosMigrados + results.custosMigrados + results.localizacoesMigradas,
        totalErros: results.erros.length
      }
    });

  } catch (error) {
    logger.error('Erro na migração completa:', error);
    return res.status(500).json({
      message: 'Erro ao executar migração completa',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}