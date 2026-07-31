import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50];

const getPageNumbers = (page, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [1];
  if (page > 3) pages.push('...');
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < totalPages - 2) pages.push('...');
  pages.push(totalPages);
  return pages;
};

const Pagination = ({ count, start, end, page, totalPages, pageSize, setPageSize, setPage }) => {
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          Showing {count === 0 ? 0 : start + 1}–{end} of {count}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous page"
        >
          <FiChevronLeft size={16} />
        </button>

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-xs text-slate-400">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`min-w-[28px] h-7 px-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                p === page
                  ? 'bg-[#1E3A8A] text-white'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-[#1E3A8A]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1E3A8A] hover:bg-blue-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next page"
        >
          <FiChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
