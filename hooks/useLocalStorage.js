/**
 * Hook personalizado para gerenciar localStorage com React
 * @param {string} key - Chave do localStorage
 * @param {*} initialValue - Valor inicial se não existir
 * @returns {[any, Function]} - [valor, setValor]
 */
import React, { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  // Estado para armazenar o valor
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }
      
      const parsed = JSON.parse(item);
      
      // Verificação específica para dados corrompidos com total_tokens
      if (typeof parsed === 'object' && parsed !== null) {
        const jsonString = JSON.stringify(parsed);
        if (jsonString.includes('total_tokens')) {
          console.warn(`Dados corrompidos detectados em localStorage[${key}], usando valor inicial`);
          // Remover dados corrompidos
          window.localStorage.removeItem(key);
          return initialValue;
        }
      }
      
      return parsed;
    } catch (error) {
      console.error(`Erro ao ler localStorage key "${key}":`, error);
      // Tentar remover dados corrompidos
      try {
        window.localStorage.removeItem(key);
      } catch (removeError) {
        console.error(`Erro ao remover localStorage key "${key}":`, removeError);
      }
      return initialValue;
    }
  });

  // Função para atualizar o valor
  const setValue = (value) => {
    try {
      // Permitir que value seja uma função como useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erro ao salvar localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
