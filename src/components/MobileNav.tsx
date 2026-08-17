"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wrench, X } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  return (
    <>
      {isToolsOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gray-900/20" onClick={() => setIsToolsOpen(false)}>
          <div
            className="absolute bottom-14 left-3 right-3 rounded-lg border border-gray-100 bg-white p-2 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-1 flex items-center justify-between px-2 py-1">
              <span className="text-sm font-semibold text-gray-900">更多工具</span>
              <button
                type="button"
                onClick={() => setIsToolsOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                aria-label="关闭更多工具"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <a
              href="https://www.fastool.cc/2fn"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              2fn 双因素验证
            </a>
            <a
              href="https://www.fastool.cc/address"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              全球随机地址生成
            </a>
            <a
              href="https://www.youfenk.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              海外社媒增长
            </a>
            <a
              href="https://www.youfenk.com/service/telegram"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              Telegram 群组成员增长
            </a>
          </div>
        </div>
      )}
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
          <div className="w-[1px] h-4 bg-gray-100 shrink-0"></div>
          <button
            type="button"
            onClick={() => setIsToolsOpen((open) => !open)}
            className={`flex items-center justify-center gap-1 w-full h-full transition-colors ${isToolsOpen ? 'text-emerald-600 font-bold bg-emerald-50/50' : 'text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50/50'}`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span className="text-[13px]">工具</span>
          </button>
        </div>
      </div>
    </>
  );
}
