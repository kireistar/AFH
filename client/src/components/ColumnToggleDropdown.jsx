import React, { useState, useRef, useEffect } from 'react';
import { FiColumns, FiCheck, FiRefreshCw } from 'react-icons/fi';

const ColumnToggleDropdown = ({ columns = [], visibleColumns = {}, onToggleColumn, onResetColumns }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
        title="Customize visible table columns"
      >
        <FiColumns className="text-slate-500" size={14} />
        <span>Columns</span>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white border border-slate-100 ring-1 ring-black ring-opacity-5 z-40 p-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Toggle Columns</span>
            {onResetColumns && (
              <button
                type="button"
                onClick={onResetColumns}
                className="text-[11px] font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1"
              >
                <FiRefreshCw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
            {columns.map((col) => {
              const isChecked = visibleColumns[col.key] !== false;
              return (
                <label
                  key={col.key}
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleColumn(col.key)}
                      className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{col.label}</span>
                  </div>
                  {isChecked && <FiCheck className="text-emerald-600 shrink-0" size={13} />}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnToggleDropdown;
