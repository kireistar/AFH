import { useState, useMemo } from 'react';

const normalizeValue = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed);
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return parsed;
    return value;
  }
  return value;
};

const compareValues = (a, b) => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
};

const useTable = (items = [], options = {}) => {
  const { pageSize: initialPageSize = 10, accessors = {} } = options;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const count = items.length;

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    const accessor = accessors[sortKey] || ((row) => row[sortKey]);
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...items].sort((a, b) => {
      const av = normalizeValue(accessor(a));
      const bv = normalizeValue(accessor(b));
      return compareValues(av, bv) * dir;
    });
  }, [items, sortKey, sortDir, accessors]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = Math.min(start + pageSize, count);
  const pageItems = sortedItems.slice(start, end);

  const onSort = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    pageItems,
    count,
    start,
    end,
    page: currentPage,
    setPage,
    totalPages,
    pageSize,
    setPageSize: changePageSize,
    sortKey,
    sortDir,
    onSort,
  };
};

export default useTable;
