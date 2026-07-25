"use client";

import React, { useState } from 'react';
import { Link as LinkIcon, Check } from 'lucide-react';

export function ShareLinkButton({ hashId }: { hashId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = new URL(window.location.href);
    url.hash = hashId;
    const shareUrl = url.toString();
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        throw new Error('Clipboard API not available');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed, using fallback:', err);
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed', fallbackErr);
        alert('复制失败，请手动复制链接：\n' + shareUrl);
      }
      textArea.remove();
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors border border-white/10"
      title="复制分享链接"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3" />
          <span>已复制链接</span>
        </>
      ) : (
        <>
          <LinkIcon className="h-3 w-3" />
          <span>分享直达链接</span>
        </>
      )}
    </button>
  );
}
