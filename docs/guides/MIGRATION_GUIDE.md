# 📖 Guia de Migração - Beef Sync v3.0

Este guia ajudará você a migrar o código existente para usar as novas funcionalidades da refatoração.

## 🔄 Migrações Obrigatórias

### 1. Sistema de Toast/Notificações

#### Antes:
```javascript
// SimpleToast.js
Toast.success('Mensagem');
Toast.error('Erro');

// ou Toast.js
const { toast } = useToast();
toast.success('Mensagem', 'Título');
```

#### Depois:
```javascript
import { useToast } from '../contexts/ToastContext';

function Component() {
  const toast = useToast();
  
  toast.success('Mensagem de sucesso');
  toast.error('Mensagem de erro');
  toast.warning('Aviso');
  toast.info('Informação');
}
```

**Passos:**
1. Remover imports de `SimpleToast` ou antigo `Toast`
2. Adicionar `import { useToast } from '../contexts/ToastContext'`
3. Chamar hook dentro do componente
4. Usar métodos `toast.success()`, etc

---

### 2. Acesso a localStorage

#### Antes:
```javascript
const animals = JSON.parse(localStorage.getItem('animals') || '[]');
localStorage.setItem('animals', JSON.stringify(newAnimals));
```

#### Depois:
```javascript
// Opção 1: Usar Context (recomendado)
import { useApp } from '../contexts/AppContext';

function Component() {
  const { animals, setAnimals } = useApp();
  
  // animals é automaticamente sincronizado
  setAnimals([...animals, newAnimal]);
}

// Opção 2: Usar hook useLocalStorage
import { useLocalStorage } from '../hooks/useLocalStorage';

function Component() {
  const [animals, setAnimals] = useLocalStorage('animals', []);
}
```

**Passos:**
1. Identificar todos os usos de `localStorage.getItem` e `setItem`
2. Para dados globais, usar `useApp()`
3. Para dados locais do componente, usar `useLocalStorage()`

---

### 3. Console.log e Erros

#### Antes:
```javascript
console.log('Usuário logado:', user);
console.error('Erro:', error);
```

#### Depois:
```javascript
import logger from '../utils/logger';

logger.debug('Usuário logado:', user);
logger.info('Operação concluída');
logger.warn('Aviso importante');
logger.error('Erro:', error);

// Logs específicos
logger.api('GET', '/api/users', { params });
logger.db('INSERT', 'users', { data });
logger.component('UserForm', 'mounted', { props });
```

**Passos:**
1. Substituir `console.log` por `logger.debug()`
2. Substituir `console.error` por `logger.error()`
3. Usar métodos específicos quando aplicável

---

### 4. Formatação de Dados

#### Antes:
```javascript
// Espalhado pelo código
const formatted = `R$ ${value.toFixed(2)}`;
const date = new Date(data).toLocaleDateString('pt-BR');
```

#### Depois:
```javascript
import { formatCurrency, formatDate } from '../utils/formatters';

const formatted = formatCurrency(value);
const date = formatDate(data);
```

**Tabela de Conversão:**

| Antes | Depois |
|-------|--------|
| `'R$ ' + value.toFixed(2)` | `formatCurrency(value)` |
| `new Date().toLocaleDateString('pt-BR')` | `formatDate(date)` |
| CPF manual | `formatCPF(cpf)` |
| CNPJ manual | `formatCNPJ(cnpj)` |
| Telefone manual | `formatPhone(phone)` |

---

### 5. Validação de Dados

#### Antes:
```javascript
if (!email || !email.includes('@')) {
  alert('Email inválido');
}

// Validação CPF manual
if (cpf.length !== 11) { ... }
```

#### Depois:
```javascript
import { validateEmail, validateCPF } from '../utils/validators';

if (!validateEmail(email)) {
  toast.error('Email inválido');
}

if (!validateCPF(cpf)) {
  toast.error('CPF inválido');
}
```

**Tabela de Conversão:**

| Validação | Função |
|-----------|--------|
| Email | `validateEmail(email)` |
| CPF | `validateCPF(cpf)` |
| CNPJ | `validateCNPJ(cnpj)` |
| Telefone | `validatePhone(phone)` |
| Data | `validateDate(date)` |
| Número positivo | `validatePositiveNumber(value)` |
| Obrigatório | `validateRequired(value)` |

---

## 🔧 Migrações Opcionais (Recomendadas)

### 6. Otimização de Componentes

#### Antes:
```javascript
export default function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
```

#### Depois:
```javascript
import { memo } from 'react';

export default memo(function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
});
```

**Quando usar memo:**
- Componentes que recebem muitas props
- Componentes renderizados em listas
- Componentes com renderização custosa
- Componentes folha (leaf components)

---

### 7. Callbacks e Efeitos

#### Antes:
```javascript
function Component() {
  const handleClick = () => {
    doSomething();
  };
  
  useEffect(() => {
    loadData();
  }, []);
}
```

#### Depois:
```javascript
import { useCallback, useEffect } from 'react';

function Component() {
  const handleClick = useCallback(() => {
    doSomething();
  }, []); // deps vazias se não usar estado/props
  
  useEffect(() => {
    loadData();
  }, []); // Sem mudanças no useEffect
}
```

**Quando usar useCallback:**
- Funções passadas como props
- Funções usadas como dependências de hooks
- Event handlers em componentes memo

---

### 8. Valores Computados

#### Antes:
```javascript
function Component({ items }) {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const filtered = items.filter(item => item.active);
  
  return <div>Total: {total}</div>;
}
```

#### Depois:
```javascript
import { useMemo } from 'react';

function Component({ items }) {
  const total = useMemo(() => 
    items.reduce((sum, item) => sum + item.price, 0),
    [items]
  );
  
  const filtered = useMemo(() => 
    items.filter(item => item.active),
    [items]
  );
  
  return <div>Total: {total}</div>;
}
```

**Quando usar useMemo:**
- Cálculos custosos
- Transformações de arrays grandes
- Objetos/arrays criados em render

---

### 9. Tratamento de Erros

#### Antes:
```javascript
async function handleSubmit() {
  try {
    await api.save(data);
    alert('Salvo!');
  } catch (error) {
    alert('Erro!');
  }
}
```

#### Depois:
```javascript
import { useErrorHandler } from '../hooks/useErrorHandler';
import { useToast } from '../contexts/ToastContext';
import logger from '../utils/logger';

function Component() {
  const { handleError } = useErrorHandler();
  const toast = useToast();
  
  async function handleSubmit() {
    try {
      await api.save(data);
      toast.success('Dados salvos com sucesso!');
      logger.info('Data saved', { data });
    } catch (error) {
      handleError(error, {
        showToast: true,
        customMessage: 'Erro ao salvar dados'
      });
    }
  }
}
```

---

### 10. Operações Assíncronas

#### Antes:
```javascript
function Component() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
}
```

#### Depois:
```javascript
import { useAsync } from '../hooks/useAsync';

function Component() {
  const { data, error, isPending } = useAsync(
    () => fetchData(),
    true // immediate
  );
  
  if (isPending) return <Loading />;
  if (error) return <Error message={error.message} />;
  return <DataView data={data} />;
}
```

---

## 📋 Checklist de Migração

Para cada arquivo/componente:

- [ ] Substituir Toast antigo por `useToast()`
- [ ] Substituir localStorage direto por `useApp()` ou `useLocalStorage()`
- [ ] Substituir `console.*` por `logger.*`
- [ ] Usar `formatters` para formatação
- [ ] Usar `validators` para validação
- [ ] Adicionar `memo` em componentes adequados
- [ ] Adicionar `useCallback` em funções passadas como props
- [ ] Adicionar `useMemo` em computações custosas
- [ ] Melhorar tratamento de erros com `useErrorHandler`
- [ ] Considerar `useAsync` para operações assíncronas

---

## 🚨 Problemas Comuns

### Problema 1: Hook fora de componente
```javascript
// ❌ ERRO
const toast = useToast(); // Fora do componente

function Component() {
  toast.success('Ok');
}

// ✅ CORRETO
function Component() {
  const toast = useToast(); // Dentro do componente
  toast.success('Ok');
}
```

### Problema 2: Dependências do useCallback
```javascript
// ❌ Pode causar bugs
const handleClick = useCallback(() => {
  doSomething(prop);
}, []); // prop deveria estar nas deps

// ✅ CORRETO
const handleClick = useCallback(() => {
  doSomething(prop);
}, [prop]); // prop nas dependências
```

### Problema 3: Context sem Provider
```javascript
// ❌ ERRO: usar useApp sem o provider
function App() {
  return <Component />; // Sem AppProvider
}

// ✅ CORRETO
function App() {
  return (
    <AppProvider>
      <Component />
    </AppProvider>
  );
}
```

---

## 📞 Ajuda

Se encontrar problemas durante a migração:

1. Verifique a documentação JSDoc do componente
2. Execute os testes: `npm test`
3. Consulte `REFATORACAO_2024.md`
4. Verifique os logs com `logger.debug()`

---

**Boa migração! 🚀**
