import React from 'react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const SortHeader = ({ label, sortKey, onSort, activeKey, sortDir, className = '' }) => {
  const active = activeKey === sortKey;
  return (
    <th className={`p-4 font-semibold select-none ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 transition-colors cursor-pointer ${
          active ? 'text-[#1E3A8A]' : 'hover:text-slate-600'
        }`}
      >
        {label}
        {active &&
          (sortDir === 'asc' ? (
            <FiArrowUp size={12} />
          ) : (
            <FiArrowDown size={12} />
          ))}
      </button>
    </th>
  );
};

export default SortHeader;
