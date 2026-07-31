"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
      <div className="flex justify-around items-center h-11">
        <Link 
          href="/card-products" 
          className={`flex items-center justify-center w-full h-full transition-colors ${pathname === '/card-products' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50/50'}`}
        >
          <span className="text-[13px]">卡网商品</span>
        </Link>
        <div className="w-[1px] h-4 bg-gray-100 shrink-0"></div>
        <Link
          href="/official-prices"
          className={`flex items-center justify-center w-full h-full transition-colors ${pathname === '/official-prices' ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50/50'}`}
        >
          <span className="text-[13px]">官方订阅</span>
        </Link>
        <div className="w-[1px] h-4 bg-gray-100 shrink-0"></div>
        <Link 
          href="/guide"
          className={`flex items-center justify-center w-full h-full transition-colors ${pathname.startsWith('/guide') ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50/50'}`}
        >
          <span className="text-[13px]">指南</span>
        </Link>
      </div>
    </div>
  );
}
