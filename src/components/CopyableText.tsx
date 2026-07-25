"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyableText({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 group cursor-pointer ${className || ''}`} 
      onClick={handleCopy} 
      title="点击复制"
    >
      <span>{text}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-purple-600 transition-all shrink-0" />
      )}
    </span>
  );
}
