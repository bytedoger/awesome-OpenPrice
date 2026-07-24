import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ChevronDown, Filter } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  value: string;
  onChange: (val: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  disabled?: boolean;
  allOptionLabel?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择...',
  icon,
  searchable = true,
  disabled = false,
  allOptionLabel
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const activeOptionLabel = useMemo(() => {
    if (value === "") return allOptionLabel || placeholder;
    return options.find(o => o.value === value)?.label || placeholder;
  }, [value, options, allOptionLabel, placeholder]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim() || !searchable) return options;
    return options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery, searchable]);

  return (
    <div className={`relative w-20 sm:w-auto shrink-0 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={dropdownRef}>
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-4 flex items-center pointer-events-none z-50">
            {icon}
          </div>
        )}
        <input
          type="text"
          readOnly={!searchable || disabled}
          className={`w-full sm:w-40 lg:w-48 ${icon ? 'pl-8 sm:pl-11' : 'pl-2.5 sm:pl-4'} pr-7 sm:pr-10 h-8 sm:h-10 bg-white/95 border-none shadow-sm rounded-lg text-[12px] sm:text-[14px] font-medium text-gray-900 placeholder-gray-500 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 z-40 relative truncate ${disabled ? 'pointer-events-none' : 'cursor-text'}`}
          placeholder={placeholder}
          value={isOpen && searchable ? searchQuery : activeOptionLabel}
          onChange={(e) => {
            if (!disabled && searchable) {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }
          }}
          onClick={() => {
            if (!disabled) {
              setIsOpen(true);
              setSearchQuery("");
            }
          }}
        />
        <div className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2 flex items-center gap-0.5 sm:gap-1 z-50 pointer-events-none">
          {searchQuery && searchable && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery("");
                if (onChange && activeOptionLabel !== allOptionLabel) {
                  onChange("");
                }
              }}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors pointer-events-auto"
            >
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
            {allOptionLabel && (
              <button
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                  value === "" ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {allOptionLabel}
              </button>
            )}
            
            {filteredOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] sm:text-[14px] font-medium transition-colors ${
                  value === option.value ? 'bg-primary-50 text-primary-600 font-bold' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.icon && (
                  <div className="shrink-0">
                    {option.icon}
                  </div>
                )}
                <span className="truncate">{option.label}</span>
              </button>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-center text-[12px] text-gray-500">
                未找到匹配项
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
