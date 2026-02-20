import { query } from '../../../lib/database';

// Função SIMPLES para converter data
function converterDataSimples(texto) {
  if (!texto) return null;
  
  const str = String(texto).trim();
  
  // Tentar DD/MM/AA ou DD/MM/AAAA
  const match = str.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (match) {
    let [, dia, mes, ano] = match;
    
    // Converter ano de 2 para 4 dígitos
    if (ano.length === 2) {
      const anoNum = parseInt(ano);
      ano = anoNum >= 50 ? `19${ano}` : `20${ano}`;
    }
    
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
  
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { texto, modo } = req.body;

  if (!texto) {
    return res.status(400).json({ error: 'Texto não fornecido' });
  }

  try {
    const linhas = texto.split('\n').filter(l => l.trim());
    
    // Remover cabeçalho se tiver
    const primeiraLinha = linhas[0].toUpperCase();
    const temCabecalho = primeiraLinha.includes('SÉRIE') || primeiraLinha.includes('SERIE') || primeiraLinha.includes('LOCAL');
    const dadosLinhas = temCabecalho ? linhas.slice(1) : linhas;

    const dadosProcessados = [];
    const errosValidacao = [];

    console.log(`\n📊 Processando ${dadosLinhas.length} linhas...\n`);

    for (let i = 0; i < dadosLinhas.length; i++) {
      const linha = dadosLinhas[i].trim();
      if (!linha) continue;

      const numeroLinha = i + (temCabecalho ? 2 : 1);

      // Tentar diferentes métodos de separação
      let colunas = [];
      
      // Método 1: TAB
      colunas = linha.split('\t').map(c => c.trim()).filter(c => c);
      
      // Método 2: Se só tem 1 coluna, tentar espaços múltiplos (2+)
      if (colunas.length === 1) {
        colunas = linha.split(/\s{2,}/).map(c => c.trim()).filter(c => c);
      }
      
      // Método 3: Se ainda tem poucas colunas, usar regex para encontrar padrões
      if (colunas.length < 5) {
        // Padrão: SÉRIE RG LOCAL LOCAL TOURO... SÉRIE RG DATA DATA RESULT
        // Procurar por: palavra, número, palavra+número, palavra+número, texto longo, palavra, número, data, data, letra
        const regex = /(\S+)\s+(\d+)\s+([\w\s]+?)\s+([\w\s]+?)\s+([\w\s]+?)\s+(\w+)\s+(\d+)\s+([\d\/]+)\s+([\d\/]+)\s+(\w)/;
        const match = linha.match(regex);
        
        if (match) {
          colunas = match.slice(1); // Pegar grupos capturados
          console.log('  → Usando regex, encontrou:', colunas.length, 'colunas');
        } else {
          // Último recurso: separar por espaço simples e tentar agrupar
          const palavras = linha.split(/\s+/).filter(p => p);
          console.log('  → Palavras encontradas:', palavras);
          
          // Tentar identificar as colunas por padrão
          if (palavras.length >= 10) {
            // Assumir: [0]=SÉRIE [1]=RG [2-3]=LOCAL [4-6]=TOURO [7]=SÉRIE(pai) [8]=RG(pai) [9]=DATA_IA [10]=DATA_DG [11]=Result
            colunas = [
              palavras[0],                    // SÉRIE
              palavras[1],                    // RG
              palavras[2],                    // LOCAL (parte 1)
              palavras[2] + ' ' + palavras[3], // LOCAL completo
              palavras.slice(4, palavras.length - 5).join(' '), // TOURO (tudo entre LOCAL e SÉRIE(pai))
              palavras[palavras.length - 5],  // SÉRIE(pai)
              palavras[palavras.length - 4],  // RG(pai)
              palavras[palavras.length - 3],  // DATA IA
              palavras[palavras.length - 2],  // DATA DG
              palavras[palavras.length - 1]   // Result
            ];
            console.log('  → Reorganizado em colunas:', colunas);
          }
        }
      }

      console.log(`Linha ${numeroLinha}: ${colunas.length} colunas:`, colunas);

      // Mínimo: SÉRIE, RG, LOCAL
      if (colunas.length < 3) {
        errosValidacao.push({
          linha: numeroLinha,
          erro: `Apenas ${colunas.length} colunas encontradas. Copie do Excel com Ctrl+C para manter as TABs.`
        });
        continue;
      }

      // Extrair dados básicos
      const serie = colunas[0] || '';
      const rg = colunas[1] || '';
      
      // LOCAL pode estar na coluna 2 ou 3
      let local = '';
      let offsetColunas = 0;
      
      // Se coluna 2 parece ser LOCAL (não é número e não é vazio)
      if (colunas[2] && isNaN(colunas[2]) && colunas[2].length > 1) {
        local = colunas[2];
        offsetColunas = 3;
      } else if (colunas[3]) {
        local = colunas[3];
        offsetColunas = 4;
      } else {
        local = colunas[2] || '';
        offsetColunas = 3;
      }

      // Tentar encontrar as datas nas colunas seguintes
      let dataIA = null;
      let dataDG = null;
      let touroIA = '';
      let resultado = '';

      // Procurar datas nas colunas restantes
      for (let j = offsetColunas; j < colunas.length; j++) {
        const col = colunas[j];
        if (!col) continue;

        // Se parece ser uma data (tem /)
        if (col.includes('/')) {
          if (!dataIA) {
            dataIA = col;
          } else if (!dataDG) {
            dataDG = col;
          }
        }
        // Se é uma letra única, pode ser resultado
        else if (col.length === 1 && /[A-Z]/i.test(col)) {
          resultado = col;
        }
        // Se tem texto, pode ser touro
        else if (col.length > 2 && !touroIA) {
          touroIA = col;
        }
      }

      // Validações básicas
      if (!serie) {
        errosValidacao.push({ linha: numeroLinha, erro: 'SÉRIE vazia' });
        continue;
      }
      if (!rg) {
        errosValidacao.push({ linha: numeroLinha, erro: 'RG vazio' });
        continue;
      }
      if (!local) {
        errosValidacao.push({ linha: numeroLinha, erro: 'LOCAL vazio' });
        continue;
      }

      // Converter datas
      const dataIAFormatada = dataIA ? converterDataSimples(dataIA) : null;
      const dataDGFormatada = dataDG ? converterDataSimples(dataDG) : null;

      console.log(`  → Série: ${serie}, RG: ${rg}, Local: ${local}`);
      console.log(`  → Data IA: ${dataIA} → ${dataIAFormatada}`);
      console.log(`  → Data DG: ${dataDG} → ${dataDGFormatada}`);

      dadosProcessados.push({
        linha: numeroLinha,
        serie,
        rg,
        local,
        touroIA,
        dataIA: dataIAFormatada,
        dataDG: dataDGFormatada,
        resultado,
        tatuagem: `${serie} ${rg}`.trim()
      });
    }

    // Modo validar
    if (modo === 'validar') {
      return res.status(200).json({
        success: true,
        modo: 'validacao',
        totalLinhas: dadosProcessados.length,
        erros: errosValidacao,
        preview: dadosProcessados.slice(0, 10),
        valido: errosValidacao.length === 0
      });
    }

    // Modo importar
    if (modo === 'importar') {
      if (errosValidacao.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Existem erros de validação',
          erros: errosValidacao
        });
      }

      const resultados = {
        piquetesProcessados: 0,
        piquetesCriados: 0,
        animaisProcessados: 0,
        animaisCriados: 0,
        animaisAtualizados: 0,
        iasRegistradas: 0,
        erros: []
      };

      for (const dado of dadosProcessados) {
        try {
          // 1. Criar piquete
          if (dado.local) {
            const piqueteExiste = await query(
              'SELECT id FROM piquetes WHERE codigo = $1',
              [dado.local]
            );

            if (piqueteExiste.rows.length === 0) {
              await query(
                'INSERT INTO piquetes (codigo, nome, ativo) VALUES ($1, $2, true)',
                [dado.local, dado.local]
              );
              resultados.piquetesCriados++;
            }
            resultados.piquetesProcessados++;
          }

          // 2. Criar/atualizar animal - SEMPRE FÊMEA
          const animalExiste = await query(
            'SELECT id FROM animais WHERE serie = $1 AND rg = $2',
            [dado.serie, dado.rg]
          );

          const dataEntrada = new Date().toISOString().split('T')[0];

          if (animalExiste.rows.length === 0) {
            await query(
              `INSERT INTO animais (
                serie, rg, tatuagem, nome, sexo, situacao, 
                piquete_atual, data_entrada_piquete, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [dado.serie, dado.rg, dado.tatuagem, dado.tatuagem, 'Fêmea', 'Ativo', dado.local, dataEntrada]
            );
            resultados.animaisCriados++;
          } else {
            await query(
              `UPDATE animais 
               SET piquete_atual = $1, data_entrada_piquete = $2, sexo = $3, updated_at = CURRENT_TIMESTAMP
               WHERE serie = $4 AND rg = $5`,
              [dado.local, dataEntrada, 'Fêmea', dado.serie, dado.rg]
            );
            resultados.animaisAtualizados++;
          }
          resultados.animaisProcessados++;

          // 3. Registrar IA
          if (dado.dataIA) {
            const animalId = animalExiste.rows.length > 0 
              ? animalExiste.rows[0].id 
              : (await query('SELECT id FROM animais WHERE serie = $1 AND rg = $2', [dado.serie, dado.rg])).rows[0].id;

            const iaExiste = await query(
              'SELECT id FROM inseminacoes WHERE animal_id = $1 AND data_ia = $2',
              [animalId, dado.dataIA]
            );

            if (iaExiste.rows.length === 0) {
              await query(
                `INSERT INTO inseminacoes (
                  animal_id, numero_ia, data_ia, data_dg, 
                  touro_nome, status_gestacao, observacoes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                  animalId, 1, dado.dataIA, dado.dataDG,
                  dado.touroIA || 'Não informado', dado.resultado || 'Pendente',
                  `Importado via texto - Piquete: ${dado.local}`
                ]
              );
              resultados.iasRegistradas++;
            }
          }
        } catch (error) {
          console.error(`Erro na linha ${dado.linha}:`, error);
          resultados.erros.push({
            linha: dado.linha,
            serie: dado.serie,
            rg: dado.rg,
            erro: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        modo: 'importacao',
        resultados
      });
    }

    return res.status(400).json({ error: 'Modo inválido' });

  } catch (error) {
    console.error('Erro ao processar:', error);
    return res.status(500).json({ 
      error: 'Erro ao processar texto',
      details: error.message 
    });
  }
}
