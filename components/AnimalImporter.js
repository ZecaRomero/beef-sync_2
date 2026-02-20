import React, { useState, useEffect } from 'react'
import {
  DocumentArrowUpIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import logger from "../utils/logger";
import { racasPorSerie } from "../services/mockData";

export default function AnimalImporter({ isOpen, onClose, onImport }) {
  const [importData, setImportData] = useState("");
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMethod, setImportMethod] = useState("excel"); // 'excel', 'csv' ou 'manual'
  const [boletimPadrao, setBoletimPadrao] = useState(""); // Boletim para todos os animais importados
  const [localNascimentoPadrao, setLocalNascimentoPadrao] = useState("");
  const [pastoAtualPadrao, setPastoAtualPadrao] = useState("");
  const [availableLocations, setAvailableLocations] = useState([]);
  const [modoAtualizacao, setModoAtualizacao] = useState(false); // Modo para atualizar apenas campos específicos de animais existentes
  const [camposSelecionados, setCamposSelecionados] = useState({
    nome: true,
    pai: true,
    mae: true,
    receptora: true,
    avoMaterno: true,
    abczg: true,
    deca: true,
    tatuagem: false,
    sexo: false,
    raca: false,
    dataNascimento: false,
    meses: false,
    peso: false,
    situacao: false,
    cor: false,
    tipoNascimento: false,
    dificuldadeParto: false,
    isFiv: false,
    custoTotal: false,
    observacoes: false
  }); // Campos que serão importados/atualizados

  // Carregar locais
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const piquetesUsados = new Set()
        const piquetesList = []

        // 1. Buscar piquetes já usados nas localizações da API
        try {
          const localizacoesResponse = await fetch('/api/localizacoes')
          if (localizacoesResponse.ok) {
            const localizacoesData = await localizacoesResponse.json()
            const localizacoesApi = localizacoesData.data || []
            
            localizacoesApi.forEach(loc => {
              if (loc.piquete && !piquetesUsados.has(loc.piquete)) {
                piquetesUsados.add(loc.piquete)
                piquetesList.push(loc.piquete)
              }
            })
          }
        } catch (error) {
          console.warn('Erro ao buscar localizações da API:', error)
        }

        // 2. Buscar piquetes cadastrados em "Gestão de Piquetes"
        try {
          const piquetesResponse = await fetch('/api/piquetes')
          if (piquetesResponse.ok) {
            const piquetesData = await piquetesResponse.json()
            const piquetesArray = piquetesData.piquetes || piquetesData.data?.piquetes || piquetesData.data || []
            
            if (Array.isArray(piquetesArray) && piquetesArray.length > 0) {
              piquetesArray.forEach(piquete => {
                const nome = typeof piquete === 'object' ? piquete.nome : piquete
                if (nome && !piquetesUsados.has(nome)) {
                  piquetesUsados.add(nome)
                  piquetesList.push(nome)
                }
              })
            }
          }
        } catch (error) {
          console.warn('Erro ao buscar piquetes cadastrados:', error)
        }

        // 3. Fallback: buscar da API de locais
        try {
          const response = await fetch('/api/locais')
          if (response.ok) {
            const data = await response.json()
            if (data.data && data.data.length > 0) {
              data.data.forEach(local => {
                if (!piquetesUsados.has(local.nome)) {
                  piquetesUsados.add(local.nome)
                  piquetesList.push(local.nome)
                }
              })
            }
          }
        } catch (error) {
          console.warn('Erro ao carregar locais da API:', error)
        }

        piquetesList.sort((a, b) => a.localeCompare(b))
        setAvailableLocations(piquetesList)
      } catch (error) {
        console.error('Erro ao carregar locais:', error)
      }
    }

    fetchLocations()
  }, [])


  // Mapeamento de campos (manual/auto) para importação
  const [mappingMode, setMappingMode] = useState('auto')
  const [columnCount, setColumnCount] = useState(15)
  const [headersDetected, setHeadersDetected] = useState([])
  const [fieldMapping, setFieldMapping] = useState({
    nome: { enabled: true, source: 'Coluna 1' },
    serie: { enabled: true, source: 'Coluna 2' },
    rg: { enabled: true, source: 'Coluna 3' },
    sexo: { enabled: true, source: 'Coluna 4' },
    nascimento: { enabled: true, source: 'Coluna 5' },
    meses: { enabled: true, source: 'Coluna 6' },
    nomePai: { enabled: true, source: 'Coluna 7' },
    seriePai: { enabled: true, source: 'Coluna 8' },
    rgPai: { enabled: true, source: 'Coluna 9' },
    nomeMae: { enabled: true, source: 'Coluna 10' },
    serieMae: { enabled: true, source: 'Coluna 11' },
    rgMae: { enabled: true, source: 'Coluna 12' },
    avoMaterno: { enabled: true, source: 'Coluna 13' },
    abczg: { enabled: true, source: 'Coluna 14' },
    deca: { enabled: true, source: 'Coluna 15' },
    receptora: { enabled: true, source: 'Coluna 16' },
    numeroNf: { enabled: false, source: 'Coluna 17' },
    tipo: { enabled: false, source: 'Coluna 18' },
    peso: { enabled: false, source: 'Coluna 19' },
    lote: { enabled: false, source: 'Coluna 20' },
  })
  const [extraFields, setExtraFields] = useState([])
  const [newExtraName, setNewExtraName] = useState('')
  const [newExtraSource, setNewExtraSource] = useState('')

  const splitCells = (linha) => {
    if (!linha) return []
    if (linha.includes('\t')) return linha.split('\t').map((c) => c.trim())
    if (linha.includes(',')) return linha.split(',').map((c) => c.trim())
    return linha.split(/\s+/).filter((c) => c.trim() !== '')
  }

  const updateMapping = (key, changes) => {
    setFieldMapping((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...changes },
    }))
  }

  useEffect(() => {
    const lines = importData.trim().split('\n').filter((l) => l.trim())
    if (lines.length) {
      const first = lines[0]
      const cells = splitCells(first)
      setColumnCount(cells.length || 15)
      const lower = cells.map((c) => c.toLowerCase().trim())
      // Normalizar para comparação (remover acentos e espaços extras)
      const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ')
      const normalizedCells = lower.map(normalize)
      const maybeHeader = normalizedCells.some((s) =>
        ['serie', 'série', 'rg', 'rgn', 'sexo', 'nasc', 'nascimento', 'meses', 'idade',
         'nome do pai', 'nomepai', 'pai', 'serie do pai', 'seriepai', 'serie pai', 'rg do pai', 'rgpai', 'rg pai',
         'nome da mae', 'nome da mãe', 'nomemae', 'mae', 'mãe', 'serie da mae', 'serie da mãe', 'seriemae', 'serie mãe',
         'rg da mae', 'rg da mãe', 'rgmae', 'rg mãe', 'avô materno', 'avo materno', 'avomaterno', 'avô', 'avo',
         'abczg', 'iabcz', 'iabczg', 'deca', 'receptora', 'rec', 'lote', 'peso'].some(term => s.includes(term) || term.includes(s))
      )
      setHeadersDetected(maybeHeader ? cells : [])
    } else {
      setColumnCount(15)
      setHeadersDetected([])
    }
  }, [importData, importMethod])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('animalImportMapping') || '{}')
      if (saved.fieldMapping) setFieldMapping((prev) => ({ ...prev, ...saved.fieldMapping }))
      if (saved.mappingMode) setMappingMode(saved.mappingMode)
      if (saved.extraFields) setExtraFields(saved.extraFields)
    } catch { }
  }, [])

  // Ajustar mapeamento automático quando detectar cabeçalhos específicos ou poucas colunas
  useEffect(() => {
    if (mappingMode === 'auto' && columnCount === 3) {
      if (headersDetected.length > 0) {
        const lowerHeaders = headersDetected.map(h => h.toLowerCase().trim())
        
        // Se detectar apenas 3 colunas com padrão específico (Série, RGN/RG, Avô Materno)
        const temSerie = lowerHeaders.some(h => h.includes('serie') || h.includes('série'))
        const temRg = lowerHeaders.some(h => h.includes('rg') || h.includes('rgn'))
        const temAvo = lowerHeaders.some(h => h.includes('avô') || h.includes('avo') || h.includes('materno'))
        
        if (temSerie && temRg && temAvo) {
          // Mapear automaticamente as 3 colunas
          const serieIdx = lowerHeaders.findIndex(h => h.includes('serie') || h.includes('série'))
          const rgIdx = lowerHeaders.findIndex(h => h.includes('rg') || h.includes('rgn'))
          const avoIdx = lowerHeaders.findIndex(h => h.includes('avô') || h.includes('avo') || h.includes('materno'))
          
          setFieldMapping(prev => ({
            ...prev,
            serie: { enabled: true, source: headersDetected[serieIdx] || 'Coluna 1' },
            rg: { enabled: true, source: headersDetected[rgIdx] || 'Coluna 2' },
            avoMaterno: { enabled: true, source: headersDetected[avoIdx] || 'Coluna 3' },
            sexo: { enabled: false, source: prev.sexo.source },
            nascimento: { enabled: false, source: prev.nascimento.source },
            meses: { enabled: false, source: prev.meses.source },
            nomePai: { enabled: false, source: prev.nomePai.source },
            seriePai: { enabled: false, source: prev.seriePai.source },
            rgPai: { enabled: false, source: prev.rgPai.source },
            nomeMae: { enabled: false, source: prev.nomeMae.source },
            serieMae: { enabled: false, source: prev.serieMae.source },
            rgMae: { enabled: false, source: prev.rgMae.source },
            abczg: { enabled: false, source: prev.abczg.source },
            deca: { enabled: false, source: prev.deca.source },
            receptora: { enabled: false, source: prev.receptora.source },
          }))
        }
      } else {
        // Sem cabeçalhos detectados mas 3 colunas - assumir formato: Série, RG, Avô Materno
        setFieldMapping(prev => ({
          ...prev,
          serie: { enabled: true, source: 'Coluna 1' },
          rg: { enabled: true, source: 'Coluna 2' },
          avoMaterno: { enabled: true, source: 'Coluna 3' },
          sexo: { enabled: false, source: prev.sexo.source },
          nascimento: { enabled: false, source: prev.nascimento.source },
          meses: { enabled: false, source: prev.meses.source },
          nomePai: { enabled: false, source: prev.nomePai.source },
          seriePai: { enabled: false, source: prev.seriePai.source },
          rgPai: { enabled: false, source: prev.rgPai.source },
          nomeMae: { enabled: false, source: prev.nomeMae.source },
          serieMae: { enabled: false, source: prev.serieMae.source },
          rgMae: { enabled: false, source: prev.rgMae.source },
          abczg: { enabled: false, source: prev.abczg.source },
          deca: { enabled: false, source: prev.deca.source },
          receptora: { enabled: false, source: prev.receptora.source },
        }))
      }
    }
  }, [headersDetected, columnCount, mappingMode])

  useEffect(() => {
    localStorage.setItem(
      'animalImportMapping',
      JSON.stringify({ mappingMode, fieldMapping, extraFields })
    )
  }, [mappingMode, fieldMapping, extraFields])

  const getValueBySource = (campos, source) => {
    if (!source) return undefined
    const hdrIndex = headersDetected.length
      ? headersDetected.findIndex((h) => h.toLowerCase() === source.toLowerCase())
      : -1
    if (hdrIndex >= 0) return campos[hdrIndex]
    if (source.startsWith('Coluna')) {
      const idx = parseInt(source.replace('Coluna', '').trim(), 10) - 1
      return campos[idx]
    }
    return undefined
  }

  // Template CSV para download (formato completo com todos os campos)
  const csvTemplate = `Serie,RG,Sexo,Nascimento,Meses,NomePai,SeriePai,RgPai,NomeMae,SerieMae,RgMae,AvoMaterno,ABCZg,DECA,Receptora
FELG,931,F,17/09/2016,109,COLOSSO FTV DA F.E.,CJCJ,179,VAIDOSO DA SILVANIA,CJCJ,150,VAIDOSO DA SILVANIA,,,RPT 1001
FFAL,100,F,08/03/2011,175,C.A.SANSAO MODELO,CJCJ,200,SANT ANNA,CJCJ,250,TE BRASILIA,,,RPT 1002`;

  // Template Excel para download
  const excelTemplate = `Serie\tRG\tSexo\tNascimento\tMeses\tNomePai\tSeriePai\tRgPai\tNomeMae\tSerieMae\tRgMae\tAvoMaterno\tABCZg\tDECA\tReceptora
FELG\t931\tF\t17/09/2016\t109\tCOLOSSO FTV DA F.E.\tCJCJ\t179\tVAIDOSO DA SILVANIA\tCJCJ\t150\tVAIDOSO DA SILVANIA\t\t\tRPT 1001
FFAL\t100\tF\t08/03/2011\t175\tC.A.SANSAO MODELO\tCJCJ\t200\tSANT ANNA\tCJCJ\t250\tTE BRASILIA\t\t\tRPT 1002`;

  // Função para calcular idade em meses
  const calcularIdade = (dataNascimento) => {
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const diffTime = Math.abs(hoje - nascimento);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Média de dias por mês
    return diffMonths;
  };

  // Função para converter data do formato brasileiro para ISO
  const convertDateToISO = (dateStr) => {
    if (!dateStr) return null;

    // Limpar a string de data
    const cleanDateStr = dateStr.toString().trim();

    // Se já está no formato ISO (YYYY-MM-DD)
    if (cleanDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return cleanDateStr;
    }

    // Formato brasileiro DD/MM/YY ou DD/MM/YYYY
    const parts = cleanDateStr.split("/");
    if (parts.length === 3) {
      let [day, month, year] = parts.map((p) => p.trim());

      // Se ano tem 2 dígitos, assumir 20XX
      if (year.length === 2) {
        const currentYear = new Date().getFullYear();
        const currentCentury = Math.floor(currentYear / 100) * 100;
        const yearNum = parseInt(year);

        // Se o ano for maior que os últimos 2 dígitos do ano atual + 10, assumir século anterior
        if (yearNum > (currentYear % 100) + 10) {
          year = (currentCentury - 100 + yearNum).toString();
        } else {
          year = (currentCentury + yearNum).toString();
        }
      }

      // Validar se os valores são números válidos
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);

      if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
        throw new Error(`Formato de data inválido: ${dateStr}`);
      }

      if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12) {
        throw new Error(`Data inválida: ${dateStr}`);
      }

      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    throw new Error(`Formato de data inválido: ${dateStr}`);
  };

  // Função para validar e processar dados
  const validateData = () => {
    // Validar campos obrigatórios globais apenas no modo de importação
    if (!modoAtualizacao && !boletimPadrao) {
      alert("Por favor, selecione o Boletim (Local de Entrada) nas Configurações Gerais.");
      return;
    }

    setIsValidating(true);

    try {
      let linhas = [];

      if (importMethod === "excel") {
        // Processar dados do Excel (separados por TAB ou vírgula)
        linhas = importData.trim().split("\n");

        if (linhas.length === 0) {
          throw new Error("Nenhum dado encontrado");
        }

        // Detectar se a primeira linha é cabeçalho
        const primeiraLinha = linhas[0];
        const isHeader =
          primeiraLinha.toLowerCase().includes("serie") ||
          primeiraLinha.toLowerCase().includes("rg") ||
          primeiraLinha.toLowerCase().includes("nasc");

        if (isHeader) {
          linhas = linhas.slice(1); // Remove cabeçalho
        }
      } else if (importMethod === "csv") {
        // Processar CSV
        linhas = importData.trim().split("\n");
        const header = linhas[0].split(",").map((h) => h.trim());

        // Verificar se tem o cabeçalho correto
        const expectedHeaders = [
          "Serie",
          "RG",
          "Sexo",
          "Nascimento",
        ];
        const hasValidHeader = expectedHeaders.some((h) => header.some((hh) => hh.toLowerCase().includes(h.toLowerCase())));

        if (!hasValidHeader) {
          console.warn(
            "Cabeçalho CSV não corresponde ao formato esperado. Tentando detectar automaticamente..."
          );
        }

        linhas = linhas.slice(1); // Remove cabeçalho
      } else {
        // Processar entrada manual (uma linha por animal)
        linhas = importData.trim().split("\n");
      }

      const animaisProcessados = [];
      const erros = [];

      linhas.forEach((linha, index) => {
        if (!linha.trim()) return; // Pula linhas vazias

        try {
          let dados;
          let manualExtrasLocal = null;

          if (importMethod === "excel") {
            // Processar dados do Excel - formato da planilha do usuário
            // Detectar separador (TAB, vírgula ou espaços múltiplos)
            let campos = [];

            if (linha.includes("\t")) {
              // Separado por TAB
              campos = linha.split("\t").map((c) => c.trim());
            } else if (linha.includes(",")) {
              // Separado por vírgula
              campos = linha.split(",").map((c) => c.trim());
            } else {
              // Separado por espaços múltiplos (formato da imagem)
              // Exemplo real: CJCJ 15628 22 913 42 M 24,62 1 22,05 8 09/08/23 24 REM HERMOSO FIV GEN B2887 DA S.NICE
              campos = linha.split(/\s+/).filter((c) => c.trim() !== "");

              console.log("Campos encontrados:", campos.length, campos); // Debug

              // Reagrupar os últimos campos que podem ter espaços (nomes)
              if (campos.length > 12) {
                // Baseado nos dados reais: CJCJ 16701 FIV 14 289 F 28,83 1 27,41 2 13/11/24 9 A978 FIV RSAN CRIVO SANT ANNA
                // Os primeiros 12 campos são fixos até a data: CJCJ, 16701, FIV, 14, 289, F, 28,83, 1, 27,41, 2, 13/11/24, 9
                const primeiros12 = campos.slice(0, 12);
                const restante = campos.slice(12); // Nome do Pai + Avô Materno

                console.log("Primeiros 12:", primeiros12); // Debug
                console.log("Restante para nomes:", restante); // Debug

                // Estratégia específica para o padrão observado
                // Procurar por códigos típicos de avô materno que começam com letra+número
                let indiceSeparacao = -1;

                for (let i = 0; i < restante.length; i++) {
                  const campo = restante[i];
                  // Procurar por padrões específicos observados: B2887, CJ, etc.
                  if (
                    campo.match(/^[A-Z]\d{3,4}$/) || // B2887, C123, etc (letra + 3-4 números)
                    campo.match(/^[A-Z]{2}$/) || // CJ, etc (2 letras)
                    campo === "DA" ||
                    campo === "DE" ||
                    campo === "DO"
                  ) {
                    // Preposições
                    indiceSeparacao = i;
                    break;
                  }
                }

                if (indiceSeparacao > 0) {
                  const nomePai = restante.slice(0, indiceSeparacao).join(" ");
                  const avoMaterno = restante.slice(indiceSeparacao).join(" ");
                  campos = [...primeiros12, nomePai, avoMaterno];
                  console.log(
                    "Separação encontrada no índice",
                    indiceSeparacao,
                    ":",
                    { nomePai, avoMaterno }
                  ); // Debug
                } else {
                  // Fallback mais inteligente: assumir que o avô materno tem 2-3 palavras no final
                  // Baseado no padrão observado: "B2887 DA S.NICE" (3 palavras)
                  const indiceFallback = Math.max(1, restante.length - 3);
                  const nomePai = restante.slice(0, indiceFallback).join(" ");
                  const avoMaterno = restante.slice(indiceFallback).join(" ");
                  campos = [...primeiros12, nomePai, avoMaterno];
                  console.log("Usando fallback (últimas 3 palavras):", {
                    nomePai,
                    avoMaterno,
                  }); // Debug
                }
              } else if (campos.length === 14) {
                // Exatamente 14 campos, assumir que está correto
                console.log("Exatamente 14 campos, usando como está"); // Debug
              } else if (campos.length < 14) {
                console.log("Menos de 14 campos, pode haver erro no formato"); // Debug
              }
            }

            // Construção via mapeamento MANUAL (se habilitado)
            let __manualMappedDados = null;
            let __manualExtrasLocal = null;
            if (mappingMode === 'manual') {
              const m = fieldMapping;
              const get = (key) => {
                const entry = m[key];
                if (!entry || entry.enabled === false) return undefined;
                return getValueBySource(campos, entry.source);
              };
              const mapped = {};
              const keys = ['serie', 'rg', 'sexo', 'nascimento', 'meses', 'nomePai', 'seriePai', 'rgPai', 'nomeMae', 'serieMae', 'rgMae', 'avoMaterno', 'abczg', 'deca', 'receptora', 'tipo', 'peso', 'lote'];
              keys.forEach((k) => {
                const val = get(k);
                let finalVal = val;
                if (val === undefined) {
                  finalVal = undefined; // omit disabled field
                } else if (val === '' || val == null) {
                  if (k === 'serie') finalVal = 'CJCJ';
                  else if (k === 'sexo') finalVal = 'M';
                  else finalVal = '';
                }
                if (finalVal !== undefined) mapped[k] = finalVal;
              });
              __manualMappedDados = mapped;
              __manualExtrasLocal = {};
              extraFields.forEach((f) => {
                if (f.enabled) {
                  __manualExtrasLocal[f.name] = getValueBySource(campos, f.source);
                }
              });
            }

            // Verificar número mínimo de colunas baseado no modo de mapeamento
            // Se estiver usando mapeamento manual e apenas campos específicos habilitados, permitir menos colunas
            const camposHabilitados = mappingMode === 'manual' 
              ? Object.values(fieldMapping).filter(f => f.enabled).length
              : 4; // Modo automático espera pelo menos 4 colunas
            
            const minimoColunas = mappingMode === 'manual' 
              ? Math.max(2, camposHabilitados) // Pelo menos Série e RG, mais os campos habilitados
              : 4; // Modo automático: pelo menos 4 colunas
            
            if (campos.length < minimoColunas) {
              if (mappingMode === 'manual' && campos.length >= 2) {
                // Permite importação parcial se tiver pelo menos Série e RG
                console.log(`⚠️ Modo manual: Apenas ${campos.length} colunas detectadas. Permitindo importação parcial.`);
              } else {
                throw new Error(
                  `Formato Excel inválido. Esperado pelo menos ${minimoColunas} colunas, encontrado ${campos.length}. Dados: ${linha}`
                );
              }
            }

            logger.debug("Processando linha:", linha);
            logger.debug("Total de campos:", campos.length);

            // Encontrar a data (campo que contém "/") - apenas se nascimento estiver habilitado
            let dataIndex = -1;
            const nascimentoHabilitado = camposSelecionados.dataNascimento && (mappingMode === 'manual' 
              ? fieldMapping.nascimento?.enabled !== false
              : true);
            
            if (nascimentoHabilitado) {
              for (let i = 0; i < campos.length; i++) {
                if (campos[i] && campos[i].includes("/")) {
                  dataIndex = i;
                  break;
                }
              }
              
              // Só exigir data se nascimento estiver habilitado e não estiver usando mapeamento manual parcial
              if (dataIndex === -1 && mappingMode !== 'manual') {
                throw new Error(
                  "Data não encontrada. Esperado formato DD/MM/YY ou DD/MM/YYYY"
                );
              }
            }

            logger.debug(
              "Data encontrada na posição:",
              dataIndex,
              "=",
              campos[dataIndex]
            );

            // Se temos mapeamento manual, usar ele
            if (__manualMappedDados) {
              dados = __manualMappedDados;
              manualExtrasLocal = __manualExtrasLocal;
            } else if (headersDetected.length > 0) {
              // Mapeamento Inteligente via Cabeçalhos Detectados
              const lowerHeaders = headersDetected.map(h => h.toLowerCase().trim());
              
              // Verificar presença de colunas chave para desambiguação
              const hasRgn = lowerHeaders.some(h => h === 'rgn' || h.includes('rgn'));
              const hasRg = lowerHeaders.some(h => h === 'rg' && !h.includes('rgn'));
              
              // Helper para encontrar valor pela coluna (melhorado para reconhecer variações)
              const getVal = (terms) => {
                // Normalizar termos para comparação (remover espaços extras, acentos)
                const normalize = (str) => {
                  if (!str) return '';
                  return str.toLowerCase()
                    .trim()
                    .replace(/\s+/g, ' ')
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
                };
                
                // Tenta encontrar correspondência exata primeiro
                let idx = lowerHeaders.findIndex(h => {
                  const normalizedH = normalize(h);
                  return terms.some(t => normalizedH === normalize(t));
                });
                
                // Se não achar, tenta parcial (contém)
                if (idx === -1) {
                  idx = lowerHeaders.findIndex(h => {
                    const normalizedH = normalize(h);
                    return terms.some(t => {
                      const normalizedT = normalize(t);
                      return normalizedH.includes(normalizedT) || normalizedT.includes(normalizedH);
                    });
                  });
                }
                
                return idx >= 0 ? campos[idx] : "";
              };

              // Detectar qual coluna é o RG do animal vs RG da mãe
              // Se temos RGN, então RGN é o RG do animal
              // Se temos RG e não tem "RG da Mãe" ou "RGN Mãe", então RG pode ser da mãe se vier depois de MAE
              let rgAnimal = getVal(['rgn']);
              let rgMaeDetected = "";
              
              if (rgAnimal) {
                // Temos RGN, então RG pode ser da mãe
                rgMaeDetected = getVal(['rg da mae', 'rgmae', 'rg mãe', 'rg']);
              } else {
                // Não temos RGN, então RG é do animal
                rgAnimal = getVal(['rg']);
                rgMaeDetected = getVal(['rg da mae', 'rgmae', 'rg mãe']);
              }

              dados = {
                nome: getVal(['nome', 'nome do animal', 'animal']),
                serie: getVal(['serie', 'série']),
                rg: rgAnimal || getVal(['rg', 'rgn']), // Usar RGN se existir, senão RG
                sexo: getVal(['sexo']),
                nascimento: getVal(['nasc', 'nascimento', 'data']) || (dataIndex >= 0 ? campos[dataIndex] : ""),
                meses: getVal(['meses', 'idade']),
                nomePai: getVal(['nome do pai', 'nomepai', 'pai']),
                seriePai: getVal(['serie do pai', 'seriepai', 'serie pai']),
                rgPai: getVal(['rg do pai', 'rgpai', 'rg pai']),
                // Mapear MAE: pode ser nome da mãe, série da mãe ou código da mãe
                nomeMae: getVal(['nome da mae', 'nomemae', 'nome da mãe', 'nome mãe']),
                // MAE pode ser série da mãe - tentar detectar pela posição também
                serieMae: getVal(['serie da mae', 'seriemae', 'serie mãe', 'série mãe', 'mae', 'mãe']),
                // RG da mãe - usar a detecção inteligente acima
                rgMae: rgMaeDetected || getVal(['rg da mae', 'rgmae', 'rg mãe']),
                avoMaterno: getVal(['avô materno', 'avô', 'avo materno', 'avo', 'materno']),
                abczg: getVal(['abczg', 'iabcz', 'iabczg', '!abczg', '¡abczg']),
                deca: getVal(['deca']),
                receptora: getVal(['receptora', 'rec']),
                lote: getVal(['lote']),
                peso: getVal(['peso']),
                tipo: getVal(['tipo'])
              };
              
              // Debug: log dos dados mapeados
              console.log('🔍 Dados mapeados da linha:', {
                serie: dados.serie,
                rg: dados.rg,
                nomePai: dados.nomePai,
                serieMae: dados.serieMae,
                rgMae: dados.rgMae,
                receptora: dados.receptora,
                camposOriginais: campos
              });
            } else {
              // Mapeamento automático para formato completo de 15 campos
              // Se temos exatamente 15 campos ou mais, usar formato completo
              if (campos.length >= 15) {
                dados = {
                  serie: campos[0] || "",
                  rg: campos[1] || "",
                  sexo: campos[2] || "",
                  nascimento: campos[3] || campos[dataIndex] || "",
                  meses: campos[4] || "",
                  nomePai: campos[5] || "",
                  seriePai: campos[6] || "",
                  rgPai: campos[7] || "",
                  nomeMae: campos[8] || "",
                  serieMae: campos[9] || "",
                  rgMae: campos[10] || "",
                  avoMaterno: campos[11] || "",
                  abczg: campos[12] || "",
                  deca: campos[13] || "",
                  receptora: campos[14] || "",
                };
              } else {
                // Formato simplificado (compatibilidade com versão antiga)
                // Tentar detectar campos automaticamente
                const mesesIndex = dataIndex + 1;
                
                dados = {
                  serie: campos[0] || "",
                  rg: campos[1] || "",
                  sexo: campos[2] || "",
                  nascimento: campos[dataIndex] || "",
                  meses: campos[mesesIndex] || "",
                  nomePai: campos[5] || "",
                  seriePai: campos[6] || "",
                  rgPai: campos[7] || "",
                  nomeMae: campos[8] || "",
                  serieMae: campos[9] || "",
                  rgMae: campos[10] || "",
                  avoMaterno: campos[11] || "",
                  abczg: campos[12] || "",
                  deca: campos[13] || "",
                  receptora: campos[14] || "",
                };
              }
            }
          } else if (importMethod === "csv") {
            const campos = linha.split(",").map((c) => c.trim());
            dados = {
              serie: campos[0] || "",
              rg: campos[1] || "",
              sexo: campos[2] || "",
              nascimento: campos[3] || "",
              meses: campos[4] || "",
              nomePai: campos[5] || "",
              seriePai: campos[6] || "",
              rgPai: campos[7] || "",
              nomeMae: campos[8] || "",
              serieMae: campos[9] || "",
              rgMae: campos[10] || "",
              avoMaterno: campos[11] || "",
              abczg: campos[12] || "",
              deca: campos[13] || "",
              receptora: campos[14] || "",
            };
          } else {
            // Formato manual: Serie|RG|Sexo|Nascimento|Meses|NomePai|SeriePai|RgPai|NomeMae|SerieMae|RgMae|AvoMaterno|ABCZg|DECA|Receptora
            const campos = linha.split("|").map((c) => c.trim());
            if (campos.length < 4) {
              throw new Error(
                "Formato inválido. Use pelo menos: Serie|RG|Sexo|Nascimento|Meses|NomePai|SeriePai|RgPai|NomeMae|SerieMae|RgMae|AvoMaterno|ABCZg|DECA|Receptora"
              );
            }

            dados = {
              serie: campos[0] || "",
              rg: campos[1] || "",
              sexo: campos[2] || "",
              nascimento: campos[3] || "",
              meses: campos[4] || "",
              nomePai: campos[5] || "",
              seriePai: campos[6] || "",
              rgPai: campos[7] || "",
              nomeMae: campos[8] || "",
              serieMae: campos[9] || "",
              rgMae: campos[10] || "",
              avoMaterno: campos[11] || "",
              abczg: campos[12] || "",
              deca: campos[13] || "",
              receptora: campos[14] || "",
            };
          }

          // Validações baseadas no método de importação
          let rg, sexo, nascimento, pai, avoMaterno, meses, peso, lote, nome;
          let nomePai, seriePai, rgPai, nomeMae, serieMae, rgMae, receptora;
          let abczg, deca;

          if (importMethod === "excel") {
            nome = dados.nome || "";
            rg = dados.rg;
            sexo =
              dados.sexo === "M"
                ? "Macho"
                : dados.sexo === "F"
                  ? "Fêmea"
                  : dados.sexo;

            // Debug: verificar qual campo está sendo usado como data
            console.log(
              "Campo nascimento:",
              dados.nascimento,
              "Tipo:",
              typeof dados.nascimento
            );

            // Verificar se o campo nascimento parece uma data válida
            // Se nascimento não estiver habilitado ou não fornecido, permitir ausência
            const nascimentoHabilitado = camposSelecionados.dataNascimento && (mappingMode === 'manual' 
              ? fieldMapping.nascimento?.enabled !== false
              : true);
            
            if (dados.nascimento && dados.nascimento.toString().trim() !== '') {
              if (dados.nascimento.toString().includes("/")) {
                nascimento = convertDateToISO(dados.nascimento);
              } else if (dados.nascimento.toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
                nascimento = dados.nascimento; // Já está no formato ISO
              } else if (nascimentoHabilitado) {
                throw new Error(
                  `Campo de data não parece válido: ${dados.nascimento}`
                );
              } else {
                // Nascimento não habilitado, usar null
                nascimento = null;
              }
            } else if (!nascimentoHabilitado) {
              // Nascimento não fornecido e não habilitado - permitir ausência
              nascimento = null;
            } else {
              // Nascimento não fornecido mas é obrigatório
              throw new Error(
                `Campo de data não parece válido: ${dados.nascimento}`
              );
            }

            // Campos do pai
            nomePai = dados.nomePai || dados.pai || "";
            seriePai = dados.seriePai || "";
            rgPai = dados.rgPai || "";
            
            // Campos da mãe - melhorar detecção quando MAE é série da mãe
            nomeMae = dados.nomeMae || "";
            // Se temos dados.mae, verificar se é série ou nome
            if (dados.mae && !nomeMae && !dados.serieMae) {
              // Se MAE parece ser código/série (curto, alfanumérico), tratar como série
              const maeValue = String(dados.mae).trim();
              if (maeValue.length <= 10 && /^[A-Z0-9\s-]+$/i.test(maeValue)) {
                serieMae = maeValue;
              } else {
                nomeMae = maeValue;
              }
            } else {
              serieMae = dados.serieMae || "";
            }
            rgMae = dados.rgMae || "";
            
            // Log para debug
            console.log('🔍 Processando mãe:', { nomeMae, serieMae, rgMae, dadosMae: dados.mae });
            
            // Se não temos nomePai mas temos pai, usar pai como nomePai
            if (!nomePai && dados.pai) {
              nomePai = dados.pai;
            }
            
            avoMaterno = dados.avoMaterno || "";
            abczg = dados.abczg || "";
            deca = dados.deca || "";
            receptora = dados.receptora || "";
            meses = parseInt(dados.meses) || calcularIdade(nascimento);
            peso = parseFloat(dados.peso) || null;
            lote = dados.lote;
            
            // Construir campo pai completo se temos série e RG
            if (nomePai && (seriePai || rgPai)) {
              pai = `${seriePai || ""} ${rgPai || ""} ${nomePai}`.trim();
            } else {
              pai = nomePai || "";
            }
          } else {
            rg = dados.rg || dados.rgn;
            sexo = dados.sexo;
            
            // Processar data para CSV e manual
            if (dados.nascimento && dados.nascimento.toString().includes("/")) {
              nascimento = convertDateToISO(dados.nascimento);
            } else if (dados.nascimento && dados.nascimento.toString().match(/^\d{4}-\d{2}-\d{2}$/)) {
              nascimento = dados.nascimento; // Já está no formato ISO
            } else {
              nascimento = dados.nascimento || "";
            }
            
            nomePai = dados.nomePai || dados.pai || "";
            seriePai = dados.seriePai || "";
            rgPai = dados.rgPai || "";
            nomeMae = dados.nomeMae || dados.mae || "";
            serieMae = dados.serieMae || "";
            rgMae = dados.rgMae || "";
            avoMaterno = dados.avoMaterno || "";
            abczg = dados.abczg || "";
            deca = dados.deca || "";
            receptora = dados.receptora || "";
            
            if (nomePai && (seriePai || rgPai)) {
              pai = `${seriePai || ""} ${rgPai || ""} ${nomePai}`.trim();
            } else {
              pai = nomePai || "";
            }
            
            meses = parseInt(dados.meses) || calcularIdade(nascimento);
            peso = null;
            lote = null;
          }

          // Construir campo mãe completo se temos série e RG
          let mae = null;
          if (nomeMae && (serieMae || rgMae)) {
            // Temos nome e série/RG - combinar tudo
            const partes = [serieMae, rgMae].filter(v => v && String(v).trim() !== "");
            if (partes.length > 0) {
              mae = `${partes.join("-")} ${nomeMae}`.trim();
            } else {
              mae = nomeMae;
            }
          } else if (serieMae || rgMae) {
            // Temos apenas série e/ou RG - usar formato série-RG ou apenas série/RG
            const partes = [serieMae, rgMae].filter(v => v && String(v).trim() !== "");
            mae = partes.length > 0 ? partes.join("-") : null;
          } else if (nomeMae) {
            // Temos apenas nome
            mae = nomeMae;
          }
          
          // Log para debug
          console.log('🔍 Campo mãe construído:', { mae, nomeMae, serieMae, rgMae });

          // Validações - campos obrigatórios sempre: Série e RG
          if (!dados.serie || dados.serie.trim() === "") {
            throw new Error("Série é obrigatória");
          }
          
          if (!rg || rg.toString().trim() === "") {
            throw new Error("RG é obrigatório");
          }

          // No modo de atualização, verificar se pelo menos um campo de atualização foi fornecido
          if (modoAtualizacao) {
            const foiFornecido = (valor) => {
              return valor !== undefined && valor !== null && valor !== ''
            }
            const temPai = foiFornecido(pai) || foiFornecido(nomePai);
            const temMae = foiFornecido(mae) || foiFornecido(nomeMae);
            const temReceptora = foiFornecido(receptora);
            
            if (!temPai && !temMae && !temReceptora) {
              throw new Error("No modo de atualização, é necessário fornecer pelo menos um dos campos: Pai, Mãe ou Receptora");
            }
          }

          // Verificar quais campos são obrigatórios baseado no mapeamento
          const sexoHabilitado = camposSelecionados.sexo && (mappingMode === 'manual' 
            ? fieldMapping.sexo?.enabled !== false
            : true);
          const nascimentoHabilitado = camposSelecionados.dataNascimento && (mappingMode === 'manual' 
            ? fieldMapping.nascimento?.enabled !== false
            : true);

          // Validar sexo apenas se estiver habilitado e fornecido
          if (sexoHabilitado && sexo) {
            if (!["Macho", "Fêmea", "Femea", "M", "F"].includes(sexo)) {
              throw new Error("Sexo deve ser: Macho, Fêmea, M ou F");
            }
          } else if (sexoHabilitado && !sexo && mappingMode !== 'manual') {
            // Modo automático exige sexo
            throw new Error("Sexo é obrigatório");
          }

          // Validar nascimento apenas se estiver habilitado
          if (nascimentoHabilitado && !nascimento && mappingMode !== 'manual') {
            throw new Error("Nascimento é obrigatório");
          }

          // Validar data convertida apenas se nascimento foi fornecido
          if (nascimento) {
            const dataNascimento = new Date(nascimento);
            if (isNaN(dataNascimento.getTime())) {
              throw new Error(`Data de nascimento inválida: ${dados.nascimento}`);
            }
          }

          // Determinar tipo de cobertura e custos baseado no campo "tipo"
          let isFiv = false
          let custos = []
          let custoTotal = 0
          let tipoCobertura = 'IA' // Padrão

          if (importMethod === 'excel' && dados.tipo) {
            const tipo = dados.tipo.toUpperCase()

            if (tipo.includes('FIV') || tipo.includes('FV')) {
              // É FIV - aplicar custos completos
              isFiv = true
              tipoCobertura = 'FIV'
              custoTotal = 120.00 // DNA Paternidade (40) + Genômica (80)
              custos = [
                {
                  id: 1,
                  tipo: 'DNA',
                  subtipo: 'Paternidade',
                  valor: 40.00,
                  data: nascimento,
                  observacoes: 'DNA Paternidade - FIV (Importação)'
                },
                {
                  id: 2,
                  tipo: 'DNA',
                  subtipo: 'Genômica',
                  valor: 80.00,
                  data: nascimento,
                  observacoes: 'DNA Genômica - FIV (Importação)'
                }
              ]
            } else if (tipo.includes('IA') || tipo.includes('I.A')) {
              // É IA - aplicar apenas genômica
              isFiv = false
              tipoCobertura = 'IA'
              custoTotal = 80.00 // Apenas DNA Genômica
              custos = [
                {
                  id: 1,
                  tipo: 'DNA',
                  subtipo: 'Genômica',
                  valor: 80.00,
                  data: nascimento,
                  observacoes: 'DNA Genômica - IA (Importação)'
                }
              ]
            } else {
              // Outros tipos - sem custos automáticos
              isFiv = false
              tipoCobertura = tipo || 'Natural'
              custoTotal = 0 // Sem custos automáticos
              custos = []
            }
          } else {
            // Método CSV ou manual - sem custos automáticos
            isFiv = false
            tipoCobertura = 'Natural'
            custoTotal = 0
            custos = []
          }

          // Determinar raça baseada na série
          const racaPorSerie = racasPorSerie[dados.serie] || 'Nelore';
          
          // Usar valores padrão se campos não foram fornecidos (importação parcial)
          const sexoFinal = sexo || (mappingMode === 'manual' && !sexoHabilitado ? null : 'Macho');
          const nascimentoFinal = nascimento || null;
          const mesesFinal = meses || (nascimentoFinal ? calcularIdade(nascimentoFinal) : null);
          
          // Criar objeto do animal - apenas com campos selecionados
          const animal = {
            id: Date.now() + Math.random(), // ID único temporário
            nome: camposSelecionados.nome ? nome : null,
            serie: dados.serie,
            rg: rg,
            // Aplicar apenas campos selecionados
            raca: camposSelecionados.raca ? racaPorSerie : null,
            sexo: camposSelecionados.sexo ? sexoFinal : null,
            dataNascimento: camposSelecionados.dataNascimento ? nascimentoFinal : null,
            meses: camposSelecionados.meses ? mesesFinal : null,
            situacao: camposSelecionados.situacao ? "Ativo" : null,
            pai: camposSelecionados.pai ? (pai || null) : null,
            nomePai: camposSelecionados.pai ? nomePai || null : null,
            paiSerie: camposSelecionados.pai ? seriePai || null : null,
            paiRg: camposSelecionados.pai ? rgPai || null : null,
            mae: camposSelecionados.mae ? (mae || null) : null,
            nomeMae: camposSelecionados.mae ? nomeMae || null : null,
            maeSerie: camposSelecionados.mae ? serieMae || null : null,
            maeRg: camposSelecionados.mae ? rgMae || null : null,
            avoMaterno: camposSelecionados.avoMaterno ? (avoMaterno || null) : null,
            abczg: camposSelecionados.abczg ? (abczg || null) : null,
            deca: camposSelecionados.deca ? (deca || null) : null,
            receptora: camposSelecionados.receptora ? (receptora || null) : null,
            receptoraRg: camposSelecionados.receptora ? receptora || null : null,
            isFiv: camposSelecionados.isFiv ? isFiv : null,
            tipoCobertura: camposSelecionados.isFiv ? tipoCobertura : null,
            peso: camposSelecionados.peso ? peso : null,
            lote: camposSelecionados.lote ? lote : null,
            custoTotal: camposSelecionados.custoTotal ? custoTotal : null,
            valorVenda: null,
            valorReal: null,
            custos: camposSelecionados.custoTotal ? custos : null,
            boletim: modoAtualizacao ? null : boletimPadrao || null,
            localNascimento: modoAtualizacao ? null : localNascimentoPadrao || null,
            pastoAtual: modoAtualizacao ? null : pastoAtualPadrao || null,
            extras: modoAtualizacao ? null : manualExtrasLocal || undefined,
            modoAtualizacao: modoAtualizacao, // Flag para indicar que é atualização
            atualizarApenasVazios: true, // Flag para atualizar apenas campos vazios
          };

          animaisProcessados.push(animal);
        } catch (error) {
          erros.push({
            linha: index + 1,
            dados: linha,
            erro: error.message,
          });
        }
      });

      setValidationResults({
        sucesso: animaisProcessados,
        erros: erros,
        total: linhas.length,
      });
    } catch (error) {
      setValidationResults({
        sucesso: [],
        erros: [{ linha: 0, dados: "", erro: error.message }],
        total: 0,
      });
    }

    setIsValidating(false);
  };

  const handleImport = async () => {
    if (!validationResults || validationResults.sucesso.length === 0) {
      return;
    }

    try {
      setIsImporting(true);
      console.log('🔄 Iniciando importação de', validationResults.sucesso.length, 'animais');
      
      // Verificar se onImport existe e é uma função
      if (!onImport || typeof onImport !== 'function') {
        throw new Error('Função de importação não está disponível');
      }

      // Chamar a função de importação e aguardar
      await onImport(validationResults.sucesso);
      
      console.log('✅ Importação concluída com sucesso');
      
      // Limpar dados
      setImportData("");
      setValidationResults(null);
      
      // Fechar modal após um pequeno delay para mostrar feedback
      setTimeout(() => {
        setIsImporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('❌ Erro ao importar animais:', error);
      setIsImporting(false);
      alert(`❌ Erro ao importar animais: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_importacao_cjcj.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <DocumentArrowUpIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Importar Animais
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Importe múltiplos animais de qualquer série
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Método de Importação */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Escolha o Método de Importação
            </h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={importMethod === "excel"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-white">
                  📊 Excel/Planilha (Recomendado)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={importMethod === "csv"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-white">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="manual"
                  checked={importMethod === "manual"}
                  onChange={(e) => setImportMethod(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-white">Manual</span>
              </label>
            </div>
          </div>

          {/* Seleção de Campos para Importação */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              📋 Campos para Importar/Atualizar
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                <strong>Selecione quais campos deseja importar:</strong> Marque apenas os campos que você quer atualizar. 
                Campos não marcados serão ignorados na importação.
              </p>
              
              {/* Campos de Genealogia */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">👨‍👩‍👧 Genealogia</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.pai}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, pai: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">👨 Pai</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.mae}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, mae: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">👩 Mãe</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.receptora}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, receptora: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">🐄 Receptora</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.avoMaterno}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, avoMaterno: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">👴 Avô Materno</span>
                  </label>
                </div>
              </div>

              {/* Campos Genéticos */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">🧬 Genética</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.abczg}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, abczg: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📊 ABCZg</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.deca}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, deca: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📈 DECA</span>
                  </label>
                </div>
              </div>

              {/* Campos Básicos */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">📝 Informações Básicas</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.nome}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, nome: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">🏷️ Nome</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.tatuagem}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, tatuagem: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">🔖 Tatuagem</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.sexo}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, sexo: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">⚧️ Sexo</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.raca}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, raca: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">🐂 Raça</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.dataNascimento}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, dataNascimento: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📅 Data Nascimento</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.meses}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, meses: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📆 Idade (Meses)</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.peso}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, peso: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">⚖️ Peso</span>
                  </label>
                  <label className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={camposSelecionados.situacao}
                      onChange={(e) => setCamposSelecionados({...camposSelecionados, situacao: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">📊 Situação</span>
                  </label>
                </div>
              </div>

              {/* Botões de Ação Rápida */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Ações rápidas:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCamposSelecionados({
                      pai: true, mae: true, receptora: true, avoMaterno: true, abczg: true, deca: true,
                      nome: false, tatuagem: false, sexo: false, raca: false, dataNascimento: false,
                      meses: false, peso: false, situacao: false, cor: false, tipoNascimento: false,
                      dificuldadeParto: false, isFiv: false, custoTotal: false, observacoes: false
                    })}
                    className="text-xs px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    📋 Apenas Genealogia
                  </button>
                  <button
                    onClick={() => setCamposSelecionados({
                      pai: true, mae: true, receptora: true, avoMaterno: true, abczg: true, deca: true,
                      nome: true, tatuagem: true, sexo: true, raca: true, dataNascimento: true,
                      meses: true, peso: true, situacao: true, cor: true, tipoNascimento: true,
                      dificuldadeParto: true, isFiv: true, custoTotal: true, observacoes: true
                    })}
                    className="text-xs px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                  >
                    ✅ Todos os Campos
                  </button>
                  <button
                    onClick={() => setCamposSelecionados({
                      pai: false, mae: false, receptora: false, avoMaterno: false, abczg: false, deca: false,
                      nome: false, tatuagem: false, sexo: false, raca: false, dataNascimento: false,
                      meses: false, peso: false, situacao: false, cor: false, tipoNascimento: false,
                      dificuldadeParto: false, isFiv: false, custoTotal: false, observacoes: false
                    })}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  >
                    ❌ Desmarcar Todos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modo de Operação */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Modo de Operação
            </h3>
            <div className="flex space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="importar"
                  checked={!modoAtualizacao}
                  onChange={() => setModoAtualizacao(false)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-white">
                  📥 Importar Novos Animais
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="atualizar"
                  checked={modoAtualizacao}
                  onChange={() => setModoAtualizacao(true)}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-white">
                  🔄 Atualizar Animais Existentes (Pai, Mãe, Receptora)
                </span>
              </label>
            </div>
            {modoAtualizacao && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>⚠️ Modo de Atualização Inteligente:</strong> Este modo atualiza apenas os campos selecionados acima de animais que já existem no sistema. 
                  Os animais serão identificados pela Série e RG. Se o animal não existir, será ignorado.
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  <strong>🔄 Atualização Inteligente:</strong> Apenas campos que estão <strong>vazios ou null</strong> no banco de dados serão preenchidos. 
                  Campos que já têm valor serão preservados (não serão sobrescritos).
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>🛡️ Proteção contra Duplicatas:</strong> Se já existir um animal com a mesma Série e RG, ele será atualizado ao invés de criar duplicata.
                </p>
              </div>
            )}
            {!modoAtualizacao && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  <strong>📥 Modo de Importação:</strong> Importa novos animais ou atualiza animais existentes com os campos selecionados acima.
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>🛡️ Proteção contra Duplicatas:</strong> Se já existir um animal com a mesma Série e RG, apenas os campos <strong>vazios</strong> serão preenchidos. 
                  Campos existentes não serão sobrescritos.
                </p>
              </div>
            )}
          </div>

          {/* Configurações Gerais */}
          {!modoAtualizacao && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Configurações Gerais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Boletim (Local de Entrada) <span className="text-red-500">*</span>
                </label>
                <select
                  value={boletimPadrao}
                  onChange={(e) => setBoletimPadrao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o Boletim...</option>
                  <option value="AGROPECUARIA PARDINHO">AGROPECUARIA PARDINHO</option>
                  <option value="FAZENDA SANT ANNA RANCHARIA">FAZENDA SANT ANNA RANCHARIA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Local de Nascimento
                </label>
                <select
                  value={localNascimentoPadrao}
                  onChange={(e) => setLocalNascimentoPadrao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione (Opcional)...</option>
                  {availableLocations.map(loc => (
                    <option key={`nasc-${loc}`} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Localização Atual (Piquete)
                </label>
                <select
                  value={pastoAtualPadrao}
                  onChange={(e) => setPastoAtualPadrao(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione (Opcional)...</option>
                  {availableLocations.map(loc => (
                    <option key={`atual-${loc}`} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          )}

          {/* Template e Instruções */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              📋 Instruções de Importação
            </h4>

            {importMethod === "excel" ? (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>📊 Formato Excel:</strong> Cole os dados diretamente
                  do Excel (com TAB ou vírgulas)
                </p>
                {modoAtualizacao ? (
                  <>
                    <p>
                      <strong>Colunas (mínimo 3 campos):</strong> Série, RG, e pelo menos um dos campos: Pai, Mãe, Receptora
                    </p>
                    <p>
                      <strong>Formato completo (recomendado):</strong> Série, RG, Nome do Pai, Série do Pai, RG do Pai, Nome da Mãe, Série da Mãe, RG da Mãe, Receptora
                    </p>
                    <p>
                      <strong>Exemplo:</strong> CJCJ	17000	COLOSSO FTV	CJCJ	179	VAIDOSO DA SILVANIA	CJCJ	150	RPT 1001
                    </p>
                  </>
                ) : (
                  <>
                <p>
                  <strong>Colunas (13 campos):</strong> Série, RG, Sexo, Nascimento, Meses, Nome do Pai, Série do Pai, RG do Pai, Nome da Mãe, Série da Mãe, RG da Mãe, Avô Materno, Receptora
                </p>
                <p>
                  <strong>💡 Dica:</strong> Para atualizar apenas Pai, Mãe e Receptora de animais existentes, use o modo "Atualizar Animais Existentes" acima.
                </p>
                  </>
                )}
                <p>
                  <strong>Exemplo completo:</strong> FELG	931	F	17/09/2016	109	COLOSSO FTV	CJCJ	179	VAIDOSO DA SILVANIA	CJCJ	150	AVO MATERNO	RPT 1001
                </p>
                <p>
                  <strong>💡 Dica:</strong> Selecione as linhas no Excel e cole
                  aqui (Ctrl+C → Ctrl+V)
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📥 Baixar Template Excel
                </button>
              </div>
            ) : importMethod === "csv" ? (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Formato CSV:</strong> Use vírgulas para separar os
                  campos
                </p>
                <p>
                  <strong>Cabeçalho:</strong>{" "}
                  Serie,RG,Sexo,Nascimento,Meses,NomePai,SeriePai,RgPai,NomeMae,SerieMae,RgMae,AvoMaterno,Receptora
                </p>
                <p>
                  <strong>Exemplo:</strong> FELG,931,F,17/09/2016,109,COLOSSO FTV,CJCJ,179,VAIDOSO DA SILVANIA,CJCJ,150,AVO MATERNO,RPT 1001
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  📥 Baixar Template CSV
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Formato Manual:</strong> Use | (pipe) para separar os
                  campos
                </p>
                <p>
                  <strong>Ordem:</strong>{" "}
                  Serie|RG|Sexo|Nascimento|Meses|NomePai|SeriePai|RgPai|NomeMae|SerieMae|RgMae|AvoMaterno|Receptora
                </p>
                <p>
                  <strong>Exemplo:</strong> FELG|931|F|17/09/2016|109|COLOSSO FTV|CJCJ|179|VAIDOSO DA SILVANIA|CJCJ|150|AVO MATERNO|RPT 1001
                </p>
                <p>
                  <strong>Uma linha por animal</strong>
                </p>
              </div>
            )}

            <div className="mt-3 text-sm text-blue-800 dark:text-blue-300">
              <p>
                <strong>📅 Data:</strong> Use formato YYYY-MM-DD (ex:
                2022-01-15)
              </p>
              <p>
                <strong>👥 Sexo:</strong> Macho, Femea ou Fêmea
              </p>
              <p>
                <strong>🧬 Custos:</strong> Apenas aplicados para FIV (R$ 120) ou IA (R$ 80). Outros tipos: sem custos automáticos
              </p>
            </div>
          </div>

          {/* Área de Entrada de Dados */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {importMethod === "excel"
                ? "📊 Cole os dados do Excel aqui (Ctrl+C → Ctrl+V):"
                : importMethod === "csv"
                  ? "Cole os dados CSV aqui:"
                  : "Digite os dados (uma linha por animal):"}
            </label>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder={
                importMethod === "excel"
                  ? "FELG\t931\tF\t17/09/2016\t109\tCOLOSSO FTV\tCJCJ\t179\tVAIDOSO DA SILVANIA\tCJCJ\t150\tAVO MATERNO\tRPT 1001\nFFAL\t100\tF\t08/03/2011\t175\tC.A.SANSAO MODELO\tCJCJ\t200\tSANT ANNA\tCJCJ\t250\tTE BRASILIA\tRPT 1002"
                  : importMethod === "csv"
                    ? "Serie,RG,Sexo,Nascimento,Meses,NomePai,SeriePai,RgPai,NomeMae,SerieMae,RgMae,AvoMaterno,Receptora\nFELG,931,F,17/09/2016,109,COLOSSO FTV,CJCJ,179,VAIDOSO DA SILVANIA,CJCJ,150,AVO MATERNO,RPT 1001\nFFAL,100,F,08/03/2011,175,C.A.SANSAO MODELO,CJCJ,200,SANT ANNA,CJCJ,250,TE BRASILIA,RPT 1002"
                    : "FELG|931|F|17/09/2016|109|COLOSSO FTV|CJCJ|179|VAIDOSO DA SILVANIA|CJCJ|150|AVO MATERNO|RPT 1001\nFFAL|100|F|08/03/2011|175|C.A.SANSAO MODELO|CJCJ|200|SANT ANNA|CJCJ|250|TE BRASILIA|RPT 1002"
              }
            />
          </div>

          {/* Configuração dos Campos */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Configuração dos Campos</h4>
            <div className="flex items-center space-x-4 mb-3">
              <label className="flex items-center text-gray-700 dark:text-white">
                <input
                  type="radio"
                  value="auto"
                  checked={mappingMode === 'auto'}
                  onChange={(e) => setMappingMode(e.target.value)}
                  className="mr-2"
                />
                Automático
              </label>
              <label className="flex items-center text-gray-700 dark:text-white">
                <input
                  type="radio"
                  value="manual"
                  checked={mappingMode === 'manual'}
                  onChange={(e) => setMappingMode(e.target.value)}
                  className="mr-2"
                />
                Manual (mapear colunas)
              </label>
              <span className="text-xs text-gray-500 dark:text-white">
                {headersDetected.length ? 'Cabeçalhos detectados' : `${columnCount} colunas detectadas`}
              </span>
            </div>

            {mappingMode === 'manual' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['serie', 'rg', 'sexo', 'nascimento', 'meses', 'nomePai', 'seriePai', 'rgPai', 'nomeMae', 'serieMae', 'rgMae', 'avoMaterno', 'abczg', 'deca', 'receptora', 'tipo', 'peso', 'lote'].map((key) => {
                    const labels = {
                      serie: 'Série',
                      rg: 'RG',
                      sexo: 'Sexo',
                      nascimento: 'Nascimento',
                      meses: 'Meses',
                      nomePai: 'Nome do Pai',
                      seriePai: 'Série do Pai',
                      rgPai: 'RG do Pai',
                      nomeMae: 'Nome da Mãe',
                      serieMae: 'Série da Mãe',
                      rgMae: 'RG da Mãe',
                      avoMaterno: 'Avô Materno',
                      abczg: '¡ABCZg',
                      deca: 'DECA',
                      receptora: 'Receptora',
                      tipo: 'Tipo',
                      peso: 'Peso',
                      lote: 'Lote'
                    };
                    return (
                    <div key={key} className="p-2 border border-gray-200 dark:border-gray-700 rounded">
                      <label className="flex items-center text-xs text-gray-700 dark:text-white mb-1">
                        <input
                          type="checkbox"
                          checked={fieldMapping[key]?.enabled ?? true}
                          onChange={(e) => updateMapping(key, { enabled: e.target.checked })}
                          className="mr-2"
                        />
                        {labels[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                      </label>
                      <select
                        value={fieldMapping[key]?.source || ''}
                        onChange={(e) => updateMapping(key, { source: e.target.value })}
                        className="w-full text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {(headersDetected.length ? headersDetected : Array.from({ length: columnCount }, (_, i) => `Coluna ${i + 1}`)).map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                  })}
                </div>

                <div className="mt-2">
                  <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Campos adicionais</h5>
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      value={newExtraName}
                      onChange={(e) => setNewExtraName(e.target.value)}
                      placeholder="Nome do campo"
                      className="text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <select
                      value={newExtraSource}
                      onChange={(e) => setNewExtraSource(e.target.value)}
                      className="text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      {(headersDetected.length ? headersDetected : Array.from({ length: columnCount }, (_, i) => `Coluna ${i + 1}`)).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        if (!newExtraName || !newExtraSource) return
                        setExtraFields((prev) => [
                          ...prev,
                          { name: newExtraName, source: newExtraSource, enabled: true },
                        ])
                        setNewExtraName('')
                        setNewExtraSource('')
                      }}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Adicionar
                    </button>
                  </div>

                  {extraFields.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {extraFields.map((f) => (
                        <div key={f.name} className="flex items-center justify-between text-xs p-1 border border-gray-200 dark:border-gray-700 rounded">
                          <label className="flex items-center text-gray-700 dark:text-white">
                            <input
                              type="checkbox"
                              checked={f.enabled}
                              onChange={(e) =>
                                setExtraFields((prev) =>
                                  prev.map((x) => (x.name === f.name ? { ...x, enabled: e.target.checked } : x))
                                )
                              }
                              className="mr-2"
                            />
                            {f.name}
                          </label>
                          <div className="flex items-center space-x-2">
                            <select
                              value={f.source}
                              onChange={(e) =>
                                setExtraFields((prev) =>
                                  prev.map((x) => (x.name === f.name ? { ...x, source: e.target.value } : x))
                                )
                              }
                              className="text-xs p-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              {(headersDetected.length ? headersDetected : Array.from({ length: columnCount }, (_, i) => `Coluna ${i + 1}`)).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => setExtraFields((prev) => prev.filter((x) => x.name !== f.name))}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botão de Validação */}
          <div className="mb-6">
            <button
              onClick={validateData}
              disabled={!importData.trim() || isValidating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isValidating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Validar Dados
                </>
              )}
            </button>
          </div>

          {/* Resultados da Validação */}
          {validationResults && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {validationResults.sucesso.length}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Válidos
                  </div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {validationResults.erros.length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400">
                    Erros
                  </div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {validationResults.total}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Total
                  </div>
                </div>
              </div>

              {/* Erros */}
              {validationResults.erros.length > 0 && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    Erros Encontrados
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResults.erros.map((erro, index) => (
                      <div
                        key={index}
                        className="text-sm text-red-800 dark:text-red-300"
                      >
                        <strong>Linha {erro.linha}:</strong> {erro.erro}
                        {erro.dados && (
                          <div className="font-mono text-xs mt-1 bg-red-100 dark:bg-red-900/40 p-1 rounded">
                            {erro.dados}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview dos Animais Válidos */}
              {validationResults.sucesso.length > 0 && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Animais Prontos para Importação (
                    {validationResults.sucesso.length})
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {validationResults.sucesso
                      .slice(0, 5)
                      .map((animal, index) => (
                        <div
                          key={index}
                          className="text-sm text-green-800 dark:text-green-300 flex justify-between"
                        >
                          <span>
                            {animal.serie} {animal.rg} - {animal.sexo}
                          </span>
                          <span>
                            {[
                              animal.meses != null ? `${animal.meses} meses` : null,
                              animal.custoTotal != null ? `R$ ${animal.custoTotal.toFixed(2)}` : null
                            ].filter(val => val !== null).join(' - ')}
                          </span>
                        </div>
                      ))}
                    {validationResults.sucesso.length > 5 && (
                      <div className="text-sm text-green-600 dark:text-green-400">
                        ... e mais {validationResults.sucesso.length - 5}{" "}
                        animais
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={
              !validationResults || 
              validationResults.sucesso.length === 0 ||
              isImporting
            }
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isImporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              <>
                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                Importar {validationResults
                  ? validationResults.sucesso.length
                  : 0}{" "}
                Animais
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

