# Relatório de Análise dos Backups - Beef Sync

**Data da Análise:** 11/02/2026  
**Backup Analisado:** backup_completo_2026-02-10

---

## ✅ Dados Restaurados com Sucesso

As seguintes tabelas foram restauradas do backup:

- **animais**: 1.631 registros
- **custos**: 53 registros
- **notas_fiscais**: 6 registros
- **naturezas_operacao**: 11 registros
- **estoque_semen**: 14 registros
- **protocolos_reprodutivos**: 3 registros
- **relatorios_personalizados**: 4 registros
- **locais_disponiveis**: 18 registros
- **causas_morte**: 10 registros
- **access_logs**: 67 registros
- **notificacoes**: 1 registro

**Total:** 1.818 registros restaurados

---

## ⚠️ Tabelas Vazias (Sem Dados)

As seguintes tabelas existem no banco mas estão VAZIAS:

### Tabelas Críticas:
- **dna_envios**: 0 registros
- **exames_andrologicos**: 0 registros  
- **gestacoes**: 0 registros
- **nascimentos**: 0 registros
- **transferencias_embrioes**: 0 registros

### Outras Tabelas Vazias:
- boletim_contabil
- ciclos_reprodutivos
- coleta_fiv
- destinatarios_relatorios
- destinos_semen
- dna_animais
- fornecedores_destinatarios
- historia_ocorrencias
- localizacoes_animais
- lotes_operacoes
- mortes
- movimentacoes_contabeis
- notas_fiscais_itens
- origens_receptoras
- protocolos_aplicados
- servicos

---

## ❌ Tabelas Não Encontradas

- **abastecimento_nitrogenio**: Tabela não existe no banco de dados
- **inseminacao**: Tabela não existe no banco de dados
- **lotes**: Tabela não existe no banco de dados

---

## 🔍 Análise de Todos os Backups Disponíveis

Foram verificados TODOS os backups na pasta `backups/`:

- backup_completo_2025-10-13_12.json
- backup_completo_2025-10-13_12.sql
- backup_completo_2025-10-20_12.sql
- backup_completo_2025-10-22_14.sql
- backup_completo_2025-10-30_12.json
- backup_completo_2025-10-30_12.sql
- backup_completo_2025-11-04_19.sql
- backup_completo_2025-12-16_14.sql
- backup_completo_2026-02-10_12.json
- backup_completo_2026-02-10 (1).sql

**Resultado:** NENHUM backup contém dados de:
- DNA (dna_envios)
- Nitrogênio (abastecimento_nitrogenio)
- Exames Andrológicos (exames_andrologicos)

---

## 💡 Conclusão

Os dados de DNA, Nitrogênio e Exames Andrológicos:

1. **Nunca foram inseridos no sistema**, OU
2. **Foram perdidos ANTES** dos backups serem criados (outubro/2025)

### Recomendações:

1. ✅ **Restaurar o backup atual** - Todos os dados disponíveis serão restaurados
2. ⚠️ **Aceitar que os dados de DNA/Nitrogênio/Andrológicos foram perdidos**
3. 📝 **Começar a inserir novos dados** dessas funcionalidades
4. 🔄 **Configurar backups automáticos** para evitar perdas futuras

---

## 📋 Como Restaurar

Execute o comando:

```cmd
RESTAURAR-BACKUP.bat
```

Ou diretamente:

```cmd
node restaurar-backup.js
```

---

**Observação:** Este relatório foi gerado automaticamente pela análise dos backups disponíveis.
