# Como Atualizar Avô Materno usando Excel

## 📋 Formato do Excel

Crie um arquivo Excel (.xlsx) com:

**Coluna A:** Série (ex: BENT, CJCJ)  
**Coluna B:** RG (ex: 6167, 16173)  
**Coluna C:** Avô Materno (ex: CALVARIO SANT FIV 51)

### Exemplo:

| A (Série) | B (RG) | C (Avô Materno) |
|-----------|--------|-----------------|
| BENT      | 6167   | CALVARIO SANT FIV 51 |
| CJCJ      | 16173  | REMP 1197 REM JACARANDA |
| CJCJ      | 16158  | OUTRO NOME |

**Observações:**
- Você pode ter cabeçalho na primeira linha (será detectado automaticamente)
- Ou pode começar direto com os dados
- O script processa automaticamente

## 🚀 Como Executar

1. **Salve seu arquivo Excel** (ex: `avo-materno.xlsx`)

2. **Execute o script:**

```bash
node scripts/atualizar-avo-materno-excel.js caminho/para/seu/arquivo.xlsx
```

**Exemplo:**

```bash
# Se o arquivo está na pasta scripts/
node scripts/atualizar-avo-materno-excel.js scripts/avo-materno.xlsx

# Ou com caminho completo
node scripts/atualizar-avo-materno-excel.js "C:\Users\zeca8\Documents\avo-materno.xlsx"
```

## ✅ O que o script faz:

1. Lê o arquivo Excel
2. Para cada linha:
   - Busca o animal pela série e RG
   - Atualiza o campo `avo_materno` se encontrado
   - Ignora se já está correto
3. Gera um resumo e log detalhado

## 📊 Resultado:

O script mostra:
- ✅ Quantos animais foram atualizados
- ℹ️  Quantos já estavam corretos
- ❌ Quantos erros ocorreram
- ⚠️  Quantos animais não foram encontrados
- 📄 Um arquivo de log JSON com todos os detalhes

## 💡 Dicas:

- O arquivo pode ter qualquer nome (ex: `avo-materno.xlsx`, `dados.xlsx`)
- Pode ter múltiplas planilhas (usa a primeira)
- Suporta cabeçalho ou não
- Valida dados automaticamente

