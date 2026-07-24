import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StickyHeaderAddonProps {
  title: string;
  fallbackBackUrl?: string;
}

export const StickyHeaderAddon: React.FC<StickyHeaderAddonProps> = ({ 
  title, 
  fallbackBackUrl = '/card-products' 
}) => {
  const router = useRouter();
  
  return (
    <div className="w-fit min-w-0">
      <div className="flex items-center bg-white/95 rounded-lg shadow-sm h-8 w-8 md:w-auto md:h-10 md:pr-4 transition-all hover:bg-white min-w-0 max-w-full justify-center md:justify-start">
        <button 
          onClick={() => {
            if (window.history.length > 2) {
              router.back();
            } else {
              router.push(fallbackBackUrl);
            }
          }}
          className="inline-flex h-8 w-8 md:h-7 md:w-7 md:ml-1.5 md:mr-1.5 items-center justify-center text-gray-500 hover:text-emerald-500 md:hover:bg-emerald-500 md:hover:text-white rounded-lg md:rounded-md transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="hidden md:block w-[1px] h-4 bg-gray-200 mr-2 shrink-0"></div>
        <h2 className="hidden md:block text-gray-900 font-medium text-[14px] truncate">{title}</h2>
      </div>
    </div>
  );
};
