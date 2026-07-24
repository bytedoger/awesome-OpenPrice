import React from 'react';
import { RotateCcw, Search } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onReset: () => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  leftAddon?: React.ReactNode;
  isExpanded?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  onReset,
  searchPlaceholder = "搜索...",
  children,
  leftAddon,
  isExpanded = true
}) => {
  return (
    <div className="flex justify-end items-start sticky top-14 sm:top-16 z-40 mb-6 sm:mb-10 px-0 pointer-events-none max-w-7xl mx-auto w-full">
      <div className="bg-[#01c573] rounded-xl shadow-md p-1 sm:p-2 w-full md:w-fit max-w-full flex flex-row items-center pointer-events-auto gap-1 sm:gap-2 md:gap-0 transition-all duration-500 ease-in-out">
        {leftAddon && (
          <div className={`flex overflow-hidden justify-start md:transition-all md:duration-500 md:ease-in-out ${isExpanded ? 'w-auto md:w-[1200px] opacity-100 pr-0 md:pr-4' : 'w-auto md:w-0 opacity-100 md:opacity-0 pr-0'}`}>
            <div className="w-full min-w-0">
              {leftAddon}
            </div>
          </div>
        )}
        <div className={`flex flex-row flex-wrap items-center gap-1 sm:gap-2 flex-1 md:flex-none md:w-auto md:max-w-fit shrink-0 justify-end min-w-0`}>
          
          {/* Dynamic Dropdowns (Children Slot) */}
          {children}

          {/* Search Input */}
          <div className="relative flex-1 min-w-0 md:w-80 md:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 md:pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="w-full pl-8 md:pl-11 pr-3 md:pr-4 h-8 sm:h-10 bg-white/95 border-none shadow-sm rounded-lg text-[12px] sm:text-[13px] md:text-[14px] font-medium text-gray-900 placeholder-gray-500 hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all truncate"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              onReset();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 bg-black/10 hover:bg-black/20 text-white rounded-lg transition-colors shrink-0 tooltip-trigger relative group"
            aria-label="重置筛选"
          >
            <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 stroke-[3px]" />
            <span className="hidden md:block absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] font-medium px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
              重置筛选
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
