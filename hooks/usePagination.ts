/**
 * Hook para gerenciar paginação de forma eficiente
 */
import { useCallback, useMemo, useState } from 'react'

;

interface UsePaginationProps<T> {
  items: T[];
  itemsPerPage?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  currentItems: T[];
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export function usePagination<T>({
  items,
  itemsPerPage = 10,
  initialPage = 1,
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Calcular total de páginas
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);

  // Garantir que a página atual é válida
  const validCurrentPage = useMemo(() => {
    return Math.min(Math.max(1, currentPage), totalPages);
  }, [currentPage, totalPages]);

  // Calcular índices
  const startIndex = useMemo(() => {
    return (validCurrentPage - 1) * itemsPerPage;
  }, [validCurrentPage, itemsPerPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + itemsPerPage, items.length);
  }, [startIndex, itemsPerPage, items.length]);

  // Obter itens da página atual
  const currentItems = useMemo(() => {
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex]);

  // Navegação
  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  // Estados de navegação
  const hasNextPage = validCurrentPage < totalPages;
  const hasPrevPage = validCurrentPage > 1;

  return {
    currentPage: validCurrentPage,
    totalPages,
    currentItems,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    totalItems: items.length,
  };
}

