import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiCheck, FiRefreshCw } from 'react-icons/fi';

const MultiSelectFilterDropdown = ({
  label,
  options = [],
  selected = [],
  onChange,
  showActions = true,
  onReset
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = selected.length === 0 || selected.length === options.length;

  const handleToggleOption = (option) => {
    if (selected.includes(option)) {
      const next = selected.filter(item => item !== option);
      onChange(next);
    } else {
      const next = [...selected, option];
      if (next.length === options.length) {
        onChange([]);
      } else {
        onChange(next);
      }
    }
  };

  const handleSelectAll = () => {
    onChange([]);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      onChange([]);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all cursor-pointer flex items-center gap-2 shadow-2xs"
      >
        <span>{label}</span>
        <FiChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-2xl shadow-xl bg-white border border-slate-100 ring-1 ring-black ring-opacity-5 z-40 p-2 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header matching Columns dropdown */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</span>
            {showActions ? (
              <div className="flex items-center gap-2 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[#1E3A8A] hover:underline cursor-pointer"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold text-[#1E3A8A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FiRefreshCw size={10} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Search bar if many options */}
          {options.length > 6 && (
            <div className="p-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Filter ${label.toLowerCase()}...`}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
              />
            </div>
          )}

          {/* Options List matching Columns dropdown */}
          <div className="py-1 max-h-60 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-thumb-slate-200">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-400 text-xs">No options found.</div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selected.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-medium text-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleOption(opt)}
                        className="rounded border-slate-300 text-[#1E3A8A] focus:ring-[#1E3A8A] w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{opt}</span>
                    </div>
                    {isChecked && <FiCheck className="text-emerald-600 shrink-0" size={13} />}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectFilterDropdown;
