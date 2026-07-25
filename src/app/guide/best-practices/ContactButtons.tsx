"use client";

import React, { useState } from 'react';
import { QQGroupModal } from '@/components/QQGroupModal';

export default function ContactButtons() {
  const [isQQModalOpen, setIsQQModalOpen] = useState(false);

  return (
    <>
      <div className="flex gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
        <a 
          href="https://t.me/openprice1" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#2CA5E0] hover:bg-[#258ebf] px-3.5 py-2 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.66 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram
        </a>
        <button 
          onClick={() => setIsQQModalOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 rounded-lg bg-[#12B7F5] hover:bg-[#10a5dd] px-3.5 py-2 text-sm font-bold text-white transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
            <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/>
          </svg>
          QQ群
        </button>
      </div>

      <QQGroupModal 
        isOpen={isQQModalOpen} 
        onClose={() => setIsQQModalOpen(false)} 
      />
    </>
  );
}
