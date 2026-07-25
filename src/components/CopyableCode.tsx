"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group bg-[#1e1e1e] rounded-xl overflow-hidden my-6 shadow-inner">
      <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          title="复制代码"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="p-5 overflow-x-auto">
        <pre className="text-sm text-gray-300 font-mono m-0">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
