import React, { useCallback, useEffect, useState } from 'react'

export function useContabilidadeLembretes() {
  const [configuracoes, setConfiguracoes] = useState({
    emailContabilidade: '',
    diasAntecedencia: 2,
    ativo: true,
    ultimoEnvio: null,
    horaNotificacao: '09:00'
  });

  const [lembretes, setLembretes] = useState([]);

  // Carregar configurações do localStorage
  useEffect(() => {
    const configSalva = localStorage.getItem('contabilidadeConfig');
    if (configSalva) {
      try {
        setConfiguracoes(JSON.parse(configSalva));
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }

    const lembretessalvos = localStorage.getItem('lembretes');
    if (lembretessalvos) {
      try {
        setLembretes(JSON.parse(lembretessalvos));
      } catch (error) {
        console.error('Erro ao carregar lembretes:', error);
      }
    }
  }, []);

  // Função para calcular o 5º dia útil do mês
  const calcularQuintoDiaUtil = useCallback((ano, mes) => {
    let diasUteis = 0;
    let dia = 1;
    
    while (diasUteis < 5) {
      const data = new Date(ano, mes, dia);
      const diaSemana = data.getDay();
      
      // Se não é sábado (6) nem domingo (0)
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasUteis++;
      }
      
      if (diasUteis < 5) {
        dia++;
      }
    }
    
    return new Date(ano, mes, dia);
  }, []);

  // Função para calcular próximo vencimento
  const calcularProximoVencimento = useCallback(() => {
    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const quintoDiaUtil = calcularQuintoDiaUtil(anoAtual, mesAtual);
    
    // Se já passou, calcular para o próximo mês
    if (quintoDiaUtil < hoje) {
      const proximoMes = mesAtual === 11 ? 0 : mesAtual + 1;
      const proximoAno = mesAtual === 11 ? anoAtual + 1 : anoAtual;
      return calcularQuintoDiaUtil(proximoAno, proximoMes);
    }
    
    return quintoDiaUtil;
  }, [calcularQuintoDiaUtil]);

  // Função para verificar se precisa criar lembrete
  const verificarLembretes = useCallback(() => {
    if (!configuracoes.ativo) return false;

    const hoje = new Date();
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();
    
    const quintoDiaUtil = calcularQuintoDiaUtil(anoAtual, mesAtual);
    const dataLembrete = new Date(quintoDiaUtil);
    dataLembrete.setDate(dataLembrete.getDate() - configuracoes.diasAntecedencia);
    
    const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const lembretesSemHora = new Date(dataLembrete.getFullYear(), dataLembrete.getMonth(), dataLembrete.getDate());
    
    if (hojeSemHora.getTime() === lembretesSemHora.getTime()) {
      const ultimoEnvio = configuracoes.ultimoEnvio ? new Date(configuracoes.ultimoEnvio) : null;
      const mesUltimoEnvio = ultimoEnvio ? ultimoEnvio.getMonth() : -1;
      
      return mesUltimoEnvio !== mesAtual;
    }
    
    return false;
  }, [configuracoes, calcularQuintoDiaUtil]);

  // Função para criar lembrete
  const criarLembrete = useCallback(() => {
    const hoje = new Date();
    const quintoDiaUtil = calcularQuintoDiaUtil(hoje.getFullYear(), hoje.getMonth());
    
    const novoLembrete = {
      id: Date.now(),
      tipo: 'contabilidade',
      titulo: '📊 Lembrete: Envio para Contabilidade',
      descricao: `Prazo até ${quintoDiaUtil.toLocaleDateString('pt-BR')} (5º dia útil)`,
      dataVencimento: quintoDiaUtil,
      itens: [
        '📄 Notas Fiscais do mês',
        '👶 Planilha de Nascimentos',
        '📋 Relatórios de Movimentação',
        '💰 Comprovantes de Vendas',
        '📊 Relatório de Custos'
      ],
      status: 'pendente',
      criadoEm: new Date(),
      prioridade: 'alta'
    };

    const novosLembretes = [novoLembrete, ...lembretes];
    setLembretes(novosLembretes);
    localStorage.setItem('lembretes', JSON.stringify(novosLembretes));
    
    // Atualizar configurações
    const novaConfig = {
      ...configuracoes,
      ultimoEnvio: new Date().toISOString()
    };
    setConfiguracoes(novaConfig);
    localStorage.setItem('contabilidadeConfig', JSON.stringify(novaConfig));
    
    return novoLembrete;
  }, [lembretes, configuracoes, calcularQuintoDiaUtil]);

  // Função para marcar lembrete como concluído
  const marcarConcluido = useCallback((lembreteId) => {
    const lembretesAtualizados = lembretes.map(lembrete => 
      lembrete.id === lembreteId 
        ? { ...lembrete, status: 'concluido', concluidoEm: new Date() }
        : lembrete
    );
    
    setLembretes(lembretesAtualizados);
    localStorage.setItem('lembretes', JSON.stringify(lembretesAtualizados));
  }, [lembretes]);

  // Função para salvar configurações
  const salvarConfiguracoes = useCallback((novasConfig) => {
    setConfiguracoes(novasConfig);
    localStorage.setItem('contabilidadeConfig', JSON.stringify(novasConfig));
  }, []);

  // Função para gerar relatório de nascimentos
  const gerarRelatorioNascimentos = useCallback(() => {
    try {
      const nascimentos = JSON.parse(localStorage.getItem('birthData') || '[]');
      const hoje = new Date();
      const mesPassado = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const ultimoDiaMesPassado = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      
      const nascimentosDoMes = nascimentos.filter(nascimento => {
        const dataNascimento = new Date(nascimento.data_nascimento);
        return dataNascimento >= mesPassado && dataNascimento <= ultimoDiaMesPassado;
      });

      // Criar CSV com mais detalhes
      const csvContent = [
        ['Data Nascimento', 'Nome/Série', 'RG', 'Sexo', 'Raça', 'Mãe', 'Pai', 'Peso Nascimento', 'Observações'],
        ...nascimentosDoMes.map(n => [
          new Date(n.data_nascimento).toLocaleDateString('pt-BR'),
          n.nome || n.serie || '',
          n.rg || '',
          n.sexo || '',
          n.raca || '',
          n.mae || '',
          n.pai || '',
          n.peso_nascimento || '',
          n.observacoes || ''
        ])
      ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

      // Download do arquivo
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      
      const mesAno = `${mesPassado.getFullYear()}_${(mesPassado.getMonth() + 1).toString().padStart(2, '0')}`;
      link.download = `relatorio_nascimentos_${mesAno}.csv`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return {
        sucesso: true,
        quantidade: nascimentosDoMes.length,
        periodo: `${mesPassado.toLocaleDateString('pt-BR')} - ${ultimoDiaMesPassado.toLocaleDateString('pt-BR')}`
      };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return {
        sucesso: false,
        erro: error.message
      };
    }
  }, []);

  // Função para enviar email (simulação)
  const enviarEmailContabilidade = useCallback(async (lembrete) => {
    if (!configuracoes.emailContabilidade) {
      throw new Error('Email da contabilidade não configurado');
    }

    // Simular envio de email
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sucesso: true,
          destinatario: configuracoes.emailContabilidade,
          assunto: lembrete.titulo,
          dataEnvio: new Date()
        });
      }, 1000);
    });
  }, [configuracoes.emailContabilidade]);

  // Verificação automática de lembretes
  useEffect(() => {
    const verificarAutomaticamente = () => {
      if (verificarLembretes()) {
        criarLembrete();
      }
    };

    // Verificar imediatamente
    verificarAutomaticamente();

    // Configurar verificação diária às 9h
    const agora = new Date();
    const proximaVerificacao = new Date();
    proximaVerificacao.setHours(9, 0, 0, 0);
    
    if (proximaVerificacao <= agora) {
      proximaVerificacao.setDate(proximaVerificacao.getDate() + 1);
    }

    const timeout = setTimeout(() => {
      verificarAutomaticamente();
      
      // Depois configurar interval diário
      const interval = setInterval(verificarAutomaticamente, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(interval);
    }, proximaVerificacao - agora);

    return () => clearTimeout(timeout);
  }, [verificarLembretes, criarLembrete]);

  return {
    configuracoes,
    lembretes,
    salvarConfiguracoes,
    marcarConcluido,
    gerarRelatorioNascimentos,
    enviarEmailContabilidade,
    calcularProximoVencimento,
    criarLembrete: () => {
      if (verificarLembretes()) {
        return criarLembrete();
      }
      return null;
    }
  };
}