'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FloatingButtons() {
  const router = useRouter();
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 sm:right-10 z-50 flex flex-col gap-3">
      {/* 返回列表按钮（常驻显示） */}
      <button
        onClick={() => router.push('/blog')}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white text-gray-600 shadow-md border border-gray-100 hover:text-emerald-600 hover:border-emerald-200 hover:-translate-y-1 transition-all focus:outline-none"
        title="返回博客列表"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      {/* 回到顶部按钮（滚动后显示） */}
      <button
        onClick={scrollToTop}
        className={`flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:-translate-y-1 transition-all focus:outline-none ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
        title="回到顶部"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}
