"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, Store } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-gray-100 pb-safe">
      <div className="flex justify-around items-center h-14">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">首页</span>
        </Link>
        <Link 
          href="/card-products" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/card-products' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <LayoutGrid className="h-5 w-5" />
          <span className="text-[10px] font-medium">卡网商品</span>
        </Link>
        <Link 
          href="/channels" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/channels' ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Store className="h-5 w-5" />
          <span className="text-[10px] font-medium">渠道商</span>
        </Link>
      </div>
    </div>
  );
}
