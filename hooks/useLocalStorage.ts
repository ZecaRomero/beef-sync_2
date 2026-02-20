/**
 * Hook otimizado para trabalhar com localStorage
 * Com suporte a SSR e sincronização entre abas
 */
import { useCallback, useEffect, useState } from 'react'

;

type SetValue<T> = T | ((prev: T) => T);

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Ref para rastrear se é a primeira renderização (removido por não estar sendo usado)

  // Função para setar o valor
  const setValue = useCallback((value: SetValue<T>) => {
    try {
      // Permitir que value seja uma função para ter a mesma API do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);

      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Disparar evento customizado para sincronizar entre componentes
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Função para remover o item
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        
        window.dispatchEvent(new CustomEvent('localStorageChange', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.error(`Erro ao remover localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sincronizar entre abas e componentes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Handler para mudanças do localStorage de outras abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Erro ao parsear storage change para key "${key}":`, error);
        }
      }
    };

    // Handler para mudanças do localStorage na mesma aba
    const handleLocalStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value ?? initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleLocalStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleLocalStorageChange as EventListener);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

