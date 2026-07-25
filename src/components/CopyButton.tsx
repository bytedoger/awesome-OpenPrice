"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  textToCopy: string;
  buttonText?: string;
  className?: string;
}

export function CopyButton({ textToCopy, buttonText = "一键复制", className = "text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg border-purple-100" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border ${className}`}
      title="一键复制到剪贴板"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
