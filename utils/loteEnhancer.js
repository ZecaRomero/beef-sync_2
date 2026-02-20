// Utilitário para melhorar dados de lotes com informações adicionais

class LoteEnhancer {
  
  // Enriquecer dados do lote com informações calculadas
  static enriquecerLote(lote) {
    const loteEnriquecido = { ...lote };
    
    // Calcular duração
    if (lote.data_criacao) {
      const inicio = new Date(lote.data_criacao);
      const fim = lote.data_conclusao ? new Date(lote.data_conclusao) : new Date();
      loteEnriquecido.duracao_ms = fim - inicio;
      loteEnriquecido.duracao_formatada = this.formatarDuracao(loteEnriquecido.duracao_ms);
    }
    
    // Calcular taxa de sucesso
    if (lote.quantidade_registros && lote.registros_processados) {
      loteEnriquecido.taxa_sucesso = (lote.registros_processados / lote.quantidade_registros) * 100;
    }
    
    // Determinar prioridade baseada no tipo de operação
    loteEnriquecido.prioridade = this.calcularPrioridade(lote.tipo_operacao, lote.modulo);
    
    // Adicionar tags baseadas no conteúdo
    loteEnriquecido.tags = this.gerarTags(lote);
    
    // Calcular impacto estimado
    loteEnriquecido.impacto = this.calcularImpacto(lote);
    
    // Status detalhado
    loteEnriquecido.status_detalhado = this.obterStatusDetalhado(lote);
    
    return loteEnriquecido;
  }
  
  // Formatar duração em formato legível
  static formatarDuracao(milliseconds) {
    if (!milliseconds || milliseconds < 0) return 'N/A';
    
    const segundos = Math.floor(milliseconds / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) return `${dias}d ${horas % 24}h`;
    if (horas > 0) return `${horas}h ${minutos % 60}m`;
    if (minutos > 0) return `${minutos}m ${segundos % 60}s`;
    if (segundos > 0) return `${segundos}s`;
    return `${milliseconds}ms`;
  }
  
  // Calcular prioridade baseada no tipo de operação
  static calcularPrioridade(tipoOperacao, modulo) {
    const prioridades = {
      // Alta prioridade
      'BACKUP_DADOS': 'alta',
      'EXCLUSAO_ANIMAL': 'alta',
      'REGISTRO_MORTE': 'alta',
      'ENTRADA_NF': 'alta',
      
      // Média prioridade
      'CADASTRO_ANIMAIS': 'media',
      'MOVIMENTACAO_ANIMAL': 'media',
      'CADASTRO_GESTACAO': 'media',
      'REGISTRO_NASCIMENTO': 'media',
      
      // Baixa prioridade
      'EDICAO_ANIMAL': 'baixa',
      'AJUSTE_ESTOQUE_SEMEN': 'baixa',
      'LIMPEZA_DADOS': 'baixa'
    };
    
    return prioridades[tipoOperacao] || 'media';
  }
  
  // Gerar tags baseadas no conteúdo do lote
  static gerarTags(lote) {
    const tags = [];
    
    // Tags baseadas no módulo
    tags.push(lote.modulo?.toLowerCase());
    
    // Tags baseadas na quantidade
    if (lote.quantidade_registros > 100) {
      tags.push('lote-grande');
    } else if (lote.quantidade_registros > 10) {
      tags.push('lote-medio');
    } else {
      tags.push('lote-pequeno');
    }
    
    // Tags baseadas no status
    if (lote.status === 'erro') {
      tags.push('requer-atencao');
    }
    
    // Tags baseadas no tempo de execução
    if (lote.data_criacao && lote.data_conclusao) {
      const duracao = new Date(lote.data_conclusao) - new Date(lote.data_criacao);
      if (duracao > 300000) { // > 5 minutos
        tags.push('execucao-lenta');
      } else if (duracao < 10000) { // < 10 segundos
        tags.push('execucao-rapida');
      }
    }
    
    // Tags baseadas no usuário
    if (lote.usuario === 'sistema') {
      tags.push('automatico');
    } else {
      tags.push('manual');
    }
    
    // Tags baseadas nos detalhes
    if (lote.detalhes) {
      try {
        const detalhes = typeof lote.detalhes === 'string' ? JSON.parse(lote.detalhes) : lote.detalhes;
        
        if (detalhes.importacao) tags.push('importacao');
        if (detalhes.exportacao) tags.push('exportacao');
        if (detalhes.migracao) tags.push('migracao');
        if (detalhes.backup) tags.push('backup');
        if (detalhes.validacao) tags.push('validacao');
        
      } catch (error) {
        // Ignorar erros de parsing
      }
    }
    
    return tags.filter(Boolean);
  }
  
  // Calcular impacto estimado da operação
  static calcularImpacto(lote) {
    let pontuacao = 0;
    
    // Impacto baseado na quantidade de registros
    pontuacao += Math.min(lote.quantidade_registros || 0, 1000) / 10;
    
    // Impacto baseado no tipo de operação
    const impactoOperacao = {
      'BACKUP_DADOS': 50,
      'EXCLUSAO_ANIMAL': 40,
      'ENTRADA_NF': 35,
      'CADASTRO_ANIMAIS': 30,
      'REGISTRO_MORTE': 25,
      'MOVIMENTACAO_ANIMAL': 20,
      'EDICAO_ANIMAL': 10,
      'LIMPEZA_DADOS': 5
    };
    
    pontuacao += impactoOperacao[lote.tipo_operacao] || 15;
    
    // Impacto baseado no módulo
    const impactoModulo = {
      'SISTEMA': 30,
      'CONTABILIDADE': 25,
      'ANIMAIS': 20,
      'GESTACAO': 15,
      'NASCIMENTOS': 15,
      'MORTES': 15,
      'SEMEN': 10,
      'RECEPTORAS': 10
    };
    
    pontuacao += impactoModulo[lote.modulo] || 10;
    
    // Classificar impacto
    if (pontuacao >= 80) return 'critico';
    if (pontuacao >= 50) return 'alto';
    if (pontuacao >= 25) return 'medio';
    return 'baixo';
  }
  
  // Obter status detalhado com informações adicionais
  static obterStatusDetalhado(lote) {
    const base = {
      status: lote.status || 'desconhecido',
      cor: this.obterCorStatus(lote.status),
      icone: this.obterIconeStatus(lote.status)
    };
    
    // Adicionar informações específicas baseadas no status
    switch (lote.status) {
      case 'concluido':
        base.mensagem = 'Operação concluída com sucesso';
        if (lote.data_conclusao && lote.data_criacao) {
          const duracao = new Date(lote.data_conclusao) - new Date(lote.data_criacao);
          base.detalhes = `Processado em ${this.formatarDuracao(duracao)}`;
        }
        break;
        
      case 'erro':
        base.mensagem = 'Erro durante o processamento';
        base.detalhes = lote.erro_detalhes || 'Detalhes do erro não disponíveis';
        break;
        
      case 'pendente':
        base.mensagem = 'Aguardando processamento';
        if (lote.data_criacao) {
          const tempoEspera = new Date() - new Date(lote.data_criacao);
          base.detalhes = `Aguardando há ${this.formatarDuracao(tempoEspera)}`;
        }
        break;
        
      case 'processando':
        base.mensagem = 'Em processamento';
        if (lote.data_inicio_processamento) {
          const tempoProcessamento = new Date() - new Date(lote.data_inicio_processamento);
          base.detalhes = `Processando há ${this.formatarDuracao(tempoProcessamento)}`;
        }
        break;
        
      default:
        base.mensagem = 'Status desconhecido';
        base.detalhes = 'Informações não disponíveis';
    }
    
    return base;
  }
  
  // Obter cor baseada no status
  static obterCorStatus(status) {
    const cores = {
      'concluido': 'green',
      'erro': 'red',
      'pendente': 'yellow',
      'processando': 'blue',
      'cancelado': 'gray'
    };
    
    return cores[status] || 'gray';
  }
  
  // Obter ícone baseado no status
  static obterIconeStatus(status) {
    const icones = {
      'concluido': 'CheckCircleIcon',
      'erro': 'XCircleIcon',
      'pendente': 'ClockIcon',
      'processando': 'ArrowPathIcon',
      'cancelado': 'StopIcon'
    };
    
    return icones[status] || 'QuestionMarkCircleIcon';
  }
  
  // Gerar resumo executivo do lote
  static gerarResumoExecutivo(lote) {
    const loteEnriquecido = this.enriquecerLote(lote);
    
    return {
      titulo: `Lote ${lote.numero_lote} - ${lote.tipo_operacao}`,
      subtitulo: lote.descricao,
      metricas: {
        registros: lote.quantidade_registros || 0,
        duracao: loteEnriquecido.duracao_formatada,
        status: loteEnriquecido.status_detalhado.mensagem,
        impacto: loteEnriquecido.impacto,
        prioridade: loteEnriquecido.prioridade
      },
      tags: loteEnriquecido.tags,
      recomendacoes: this.gerarRecomendacoes(loteEnriquecido)
    };
  }
  
  // Gerar recomendações baseadas no lote
  static gerarRecomendacoes(lote) {
    const recomendacoes = [];
    
    // Recomendações baseadas no status
    if (lote.status === 'erro') {
      recomendacoes.push({
        tipo: 'erro',
        titulo: 'Investigar Erro',
        descricao: 'Verifique os logs e detalhes do erro para resolução',
        prioridade: 'alta'
      });
    }
    
    // Recomendações baseadas na performance
    if (lote.duracao_ms > 300000) { // > 5 minutos
      recomendacoes.push({
        tipo: 'performance',
        titulo: 'Otimizar Performance',
        descricao: 'Considere dividir em lotes menores ou otimizar o processo',
        prioridade: 'media'
      });
    }
    
    // Recomendações baseadas no tamanho
    if (lote.quantidade_registros > 1000) {
      recomendacoes.push({
        tipo: 'tamanho',
        titulo: 'Lote Grande Detectado',
        descricao: 'Monitore o progresso e considere processamento em paralelo',
        prioridade: 'baixa'
      });
    }
    
    return recomendacoes;
  }
}

export default LoteEnhancer;