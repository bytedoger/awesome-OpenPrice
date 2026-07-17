"use client";

import React, { useEffect, useState } from 'react';
import { Github, X } from 'lucide-react';

export function FloatingGithubBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = localStorage.getItem('github_banner_dismissed');
    if (!isDismissed) {
      setShowBanner(true);
    }
  }, []);

  const handleClose = () => {
    setShowBanner(false);
    localStorage.setItem('github_banner_dismissed', 'true');
  };

  if (!mounted || !showBanner) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-700 hidden sm:block">
      <div className="group relative rounded-2xl bg-white p-4 shadow-xl border-2 border-emerald-700 transition-all hover:-translate-y-1 hover:shadow-2xl pr-10">
        <a 
          href="https://github.com/kawang01/awesome-OpenPrice" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-800 text-white transition-transform group-hover:scale-110">
            <Github className="h-5 w-5" />
          </div>
          <div className="pr-2">
            <p className="text-sm font-bold text-gray-900 mb-0.5">对您有帮助吗？</p>
            <p className="text-xs text-gray-500">欢迎在 GitHub 给我们点个 ⭐</p>
          </div>
        </a>
        <button 
          onClick={handleClose}
          className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="关闭提示"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
