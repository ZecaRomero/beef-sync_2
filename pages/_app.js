import React, { useEffect, useState } from 'react'

import "../styles/globals.css";
import { useRouter } from "next/router";
import ModernLayout from "../components/layout/ModernLayout";
import { ToastProvider } from "../contexts/ToastContext";
import { AppProvider } from "../contexts/AppContext";
import ErrorBoundary from "../components/ErrorBoundary";
import DynamicFavicon from "../components/ui/DynamicFavicon";
import logger from "../utils/logger";

// Debug para interceptar erros de total_tokens
if (typeof window !== 'undefined') {
  // Interceptar erros globais
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('total_tokens')) {
      console.error('🚨 Erro total_tokens capturado:', {
        message: event.error.message,
        stack: event.error.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    }
  });
  
  // Interceptar erros de promise rejeitadas
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('total_tokens')) {
      console.error('🚨 Promise rejection total_tokens capturada:', event.reason);
    }
  });
}

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Limpeza preventiva de dados corrompidos
      try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          try {
            const value = localStorage.getItem(key);
            if (value && (
              value.includes('total_tokens') ||
              value.includes('usage') ||
              value.includes('completion')
            )) {
              console.warn(`Removendo dados corrompidos: ${key}`);
              localStorage.removeItem(key);
            }
          } catch (e) {
            console.error(`Erro ao verificar localStorage[${key}]:`, e);
            try {
              localStorage.removeItem(key);
            } catch (removeError) {
              console.error(`Erro ao remover localStorage[${key}]:`, removeError);
            }
          }
        });
      } catch (error) {
        console.error('Erro na limpeza preventiva:', error);
      }
      
      const isDark = localStorage.getItem("darkMode") === "true";
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      }
      
      // Log da inicialização da aplicação
      logger.info('Aplicação iniciada', {
        path: router.pathname,
        darkMode: isDark,
      });
    }
  }, [router.pathname]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem("darkMode", newDarkMode.toString());
      if (newDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      logger.debug('Dark mode toggled', { darkMode: newDarkMode });
    }
  };

  // Pages that don't need layout (like login, 404, 500, etc.)
  const noLayoutPages = ['/login', '/404', '/500'];
  const useLayout = !noLayoutPages.includes(router.pathname);

  return (
    <ErrorBoundary>
      <div className={darkMode ? "dark" : ""}>
        <DynamicFavicon />
        <ToastProvider>
          <AppProvider>
            {useLayout ? (
              <ModernLayout darkMode={darkMode} toggleDarkMode={toggleDarkMode}>
                <Component
                  {...pageProps}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              </ModernLayout>
            ) : (
              <Component
                {...pageProps}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            )}
          </AppProvider>
        </ToastProvider>
      </div>
    </ErrorBoundary>
  );
}