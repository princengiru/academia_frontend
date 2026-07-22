import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE_OPTIONS = ['5', '10', '25'];

function defaultSearchFn(row, query) {
  if (!query) return true;
  const q = String(query).toLowerCase();
  if (typeof row?.searchText === 'string') {
    return row.searchText.includes(q);
  }
  return Object.values(row || {}).some((value) => {
    if (value == null || typeof value === 'object') return false;
    return String(value).toLowerCase().includes(q);
  });
}

function defaultFilterFn() {
  return true;
}

function coerceSortValue(value, key, numericKeys) {
  if (numericKeys.includes(key)) {
    return Number(String(value ?? '').replace(/[^0-9.-]+/g, '')) || 0;
  }
  if (typeof value === 'number') return value;
  if (value == null) return '';
  return String(value).toLowerCase();
}

/**
 * Client-side search → filter → sort → paginate pipeline (HOA Learners pattern).
 */
export function useClientTableState({
  rows = [],
  searchFn = defaultSearchFn,
  filterFn = defaultFilterFn,
  defaultFilter = 'all',
  defaultSortKey = null,
  defaultSortDirection = 'asc',
  numericKeys = [],
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  initialPageSize = pageSizeOptions[0] || '5',
  getRowKey = (row) => row?.id,
} = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(defaultFilter);
  const [sortConfig, setSortConfig] = useState({
    key: defaultSortKey,
    direction: defaultSortDirection,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(String(initialPageSize));
  const [selectedKeys, setSelectedKeys] = useState([]);

  const processedRows = useMemo(() => {
    let next = Array.isArray(rows) ? [...rows] : [];

    if (searchQuery.trim()) {
      next = next.filter((row) => searchFn(row, searchQuery.trim()));
    }

    next = next.filter((row) => filterFn(row, activeFilter));

    if (!sortConfig.key) return next;

    const key = sortConfig.key;
    return next.sort((a, b) => {
      const aVal = coerceSortValue(a?.[key], key, numericKeys);
      const bVal = coerceSortValue(b?.[key], key, numericKeys);
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, searchQuery, activeFilter, sortConfig, searchFn, filterFn, numericKeys]);

  const totalItems = processedRows.length;
  const limit = parseInt(pageSize, 10) || 5;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit) || 1);
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * limit;
    return processedRows.slice(start, start + limit);
  }, [processedRows, safePage, limit]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedKeys([]);
  }, [searchQuery, activeFilter, pageSize]);

  useEffect(() => {
    if (currentPage !== safePage) setCurrentPage(safePage);
  }, [currentPage, safePage]);

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const goToPage = (page) => {
    const next = Math.min(Math.max(Number(page) || 1, 1), totalPages);
    setCurrentPage(next);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleRowSelection = (rowKey) => {
    const key = String(rowKey);
    setSelectedKeys((current) => (
      current.includes(key) ? current.filter((id) => id !== key) : [...current, key]
    ));
  };

  const toggleAllVisibleRows = () => {
    const visibleKeys = pageRows.map((row) => String(getRowKey(row)));
    const allSelected = visibleKeys.length > 0
      && visibleKeys.every((key) => selectedKeys.includes(key));
    if (allSelected) {
      setSelectedKeys((current) => current.filter((key) => !visibleKeys.includes(key)));
      return;
    }
    setSelectedKeys((current) => Array.from(new Set([...current, ...visibleKeys])));
  };

  const clearSelection = () => setSelectedKeys([]);

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    let start = Math.max(1, safePage - 1);
    const end = Math.min(totalPages, start + 2);
    start = Math.max(1, end - 2);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [safePage, totalPages]);

  return {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    sortConfig,
    handleSort,
    currentPage: safePage,
    setCurrentPage,
    goToPage,
    pageSize,
    setPageSize,
    pageSizeOptions,
    processedRows,
    pageRows,
    totalItems,
    totalPages,
    limit,
    selectedKeys,
    setSelectedKeys,
    toggleRowSelection,
    toggleAllVisibleRows,
    clearSelection,
    visiblePageNumbers,
    rangeLabel: totalItems === 0
      ? '0'
      : `${(safePage - 1) * limit + 1}-${Math.min(safePage * limit, totalItems)}`,
  };
}

export default useClientTableState;
