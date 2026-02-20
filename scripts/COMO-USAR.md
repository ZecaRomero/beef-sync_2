# Como Atualizar Avô Materno em Lote

## Passo 1: Criar arquivo CSV

Crie um arquivo CSV (por exemplo: `avo-materno.csv`) com o seguinte formato:

```csv
serie,rg,avo_materno
BENT,6167,CALVARIO SANT FIV 51
CJCJ,16173,NOME DO AVO MATERNO AQUI
```

**Importante:**
- Primeira linha deve ser o cabeçalho: `serie,rg,avo_materno`
- Use vírgula para separar os campos
- Não use aspas a menos que o nome do avô tenha vírgulas

## Passo 2: Executar o script

```bash
node scripts/atualizar-avo-materno-lote.js avo-materno.csv
```

Ou com caminho completo:

```bash
node scripts/atualizar-avo-materno-lote.js C:\caminho\para\seu\arquivo.csv
```

## Exemplo completo:

1. Crie o arquivo `avo-materno.csv` na pasta `scripts/`:

```csv
serie,rg,avo_materno
BENT,6167,CALVARIO SANT FIV 51
CJCJ,16173,REMP 1197 REM JACARANDA GENETICA ADITIVA
```

2. Execute:

```bash
cd "C:\Users\zeca8\Documents\Sistemas\Beef-Sync_TOP _x"
node scripts/atualizar-avo-materno-lote.js scripts/avo-materno.csv
```

## Resultado:

O script vai:
- ✅ Atualizar cada animal encontrado
- ⚠️  Listar animais não encontrados
- ❌ Listar erros (se houver)
- 📄 Gerar um arquivo de log JSON com todos os resultados

## Dica:

Você pode criar o CSV diretamente do Excel:
1. Abra o Excel
2. Crie as colunas: serie | rg | avo_materno
3. Preencha os dados
4. Salve como CSV (UTF-8)
5. Use esse arquivo no script

