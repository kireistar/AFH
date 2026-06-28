import React from 'react';

function TableSkeleton({ columns = 5, rows = 5 }) {
  const colArray = Array.from({ length: columns });
  const rowArray = Array.from({ length: rows });

  return (
    <div className="w-full animate-pulse">
      {/* Table header skeleton */}
      <div className="border-b border-slate-100 p-4 flex justify-between bg-slate-50/50">
        {colArray.map((_, i) => (
          <div 
            key={`header-${i}`} 
            className={`h-4 bg-slate-200 rounded-md`}
            style={{ width: `${Math.max(15, 80 - i * 12)}px` }}
          />
        ))}
      </div>

      {/* Table rows skeleton */}
      <div className="divide-y divide-slate-50">
        {rowArray.map((_, ri) => (
          <div key={`row-${ri}`} className="p-4 flex justify-between items-center bg-white">
            {colArray.map((_, ci) => (
              <div 
                key={`cell-${ri}-${ci}`} 
                className={`h-3 bg-slate-100 rounded-md`}
                style={{ 
                  width: ci === 0 
                    ? '45px' 
                    : ci === 1 
                      ? '110px' 
                      : `${Math.max(40, 85 - ci * 10)}px` 
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;
