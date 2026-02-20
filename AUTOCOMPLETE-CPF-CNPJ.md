# ✅ Autocomplete de CPF/CNPJ Implementado

## 📋 Resumo
Implementado sistema de autocomplete que busca contatos cadastrados conforme o usuário digita CPF/CNPJ no campo de Nota Fiscal.

## 🎯 Funcionalidades Implementadas

### 1. Busca Inteligente por Documento
- Busca inicia após digitar 3 caracteres
- Remove formatação automaticamente (pontos, traços, barras)
- Busca parcial: encontra "123" em "12.345.678/0001-90"
- Limita a 5 sugestões para não poluir a tela

### 2. Dropdown de Sugestões
- Aparece automaticamente ao digitar
- Mostra informações do contato:
  - Nome completo (destaque)
  - CPF/CNPJ formatado
  - Cidade/UF (se disponível)
- Design responsivo com scroll para muitos resultados
- Suporte a tema claro/escuro

### 3. Preenchimento Automático
- Ao clicar em uma sugestão, preenche automaticamente:
  - Nome/Razão Social
  - CPF/CNPJ
  - Endereço completo
  - Bairro
  - CEP
  - Município
  - UF
  - Telefone
  - Inscrição Estadual

### 4. Fallback para API Externa
- Se não encontrar contato local, busca na ReceitaWS (apenas CNPJ)
- Busca automática ao completar 14 dígitos
- Não interrompe fluxo do usuário em caso de erro

## 🔧 Implementação Técnica

### Estados Adicionados
```javascript
const [mostrarSugestoesDocumento, setMostrarSugestoesDocumento] = useState(false);
```

### Função de Filtro
```javascript
const filtrarContatosPorDocumento = () => {
  if (!dadosNF.cnpjOrigemDestino) return [];
  const termo = dadosNF.cnpjOrigemDestino.replace(/\D/g, '');
  if (termo.length < 3) return [];
  
  return contatos.filter(c => {
    if (!c.documento) return false;
    const docLimpo = c.documento.replace(/\D/g, '');
    return docLimpo.includes(termo);
  }).slice(0, 5);
};
```

### Campo com Autocomplete
- Input com eventos `onChange`, `onFocus`, `onBlur`
- Dropdown posicionado absolutamente
- Delay de 200ms no `onBlur` para permitir clique na sugestão
- Z-index 50 para ficar acima de outros elementos

## 📁 Arquivo Modificado
- `components/nota-fiscal-modal/index.js`

## 🎨 UX/UI
- Feedback visual imediato ao digitar
- Hover effect nos itens da lista
- Informações hierarquizadas (nome > documento > localização)
- Cores adaptadas ao tema (claro/escuro)
- Scroll suave para muitos resultados

## 🔄 Fluxo de Uso

1. Usuário começa a digitar CPF/CNPJ
2. Após 3 caracteres, dropdown aparece com sugestões
3. Usuário vê nome e documento dos contatos encontrados
4. Ao clicar, todos os campos são preenchidos automaticamente
5. Se não encontrar, pode continuar digitando e buscar na ReceitaWS
6. Se não encontrar na ReceitaWS, pode preencher manualmente

## ✨ Benefícios
- Reduz erros de digitação
- Acelera cadastro de notas fiscais
- Reutiliza dados já cadastrados
- Experiência fluida e intuitiva
- Compatível com CPF (11 dígitos) e CNPJ (14 dígitos)
