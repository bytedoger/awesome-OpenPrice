"use client";

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Plus, X, Tags, Github } from 'lucide-react';
import { QQGroupModal } from './QQGroupModal';

export function Header() {
  const pathname = usePathname();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isQQModalOpen, setIsQQModalOpen] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const handleOpenModal = () => setIsSubmitModalOpen(true);
    window.addEventListener('open-submit-modal', handleOpenModal);
    return () => window.removeEventListener('open-submit-modal', handleOpenModal);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // @ts-ignore - submitChannel is imported dynamically to avoid server component errors in client component if possible, but actually we can just import it at top
      const { submitChannel } = await import('@/app/actions');
      const res = await submitChannel(formData);
      if (res.success) {
        alert('提交成功，我们将尽快审核后收录！');
        setIsSubmitModalOpen(false);
      } else {
        alert(res.error || '提交失败');
      }
    });
  };

  return (
    <>
      {isBannerVisible && (
          <div className="bg-[#12B7F5] text-white px-4 pr-10 sm:pr-12 py-2 text-sm font-medium text-center flex flex-wrap items-center justify-center gap-x-2 gap-y-1 relative z-30 transition-all">
            <span>🎉 已开放 QQ 闲聊群，欢迎大家来划水交流以及提出功能建议！</span>
            <button 
              onClick={() => setIsQQModalOpen(true)} 
              className="underline underline-offset-2 hover:text-white/80 transition-colors cursor-pointer shrink-0"
            >
              立即加入
            </button>
            <button 
              onClick={() => setIsBannerVisible(false)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1"
              title="关闭公告"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        )}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
                <Tags className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
                Open<span className="text-emerald-500">Price</span>
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-base font-medium text-gray-600">
              <Link 
                href="/"
                className={`transition-colors ${pathname === '/' ? 'text-emerald-600' : 'hover:text-gray-900'}`}
              >
                首页
              </Link>
              <Link 
                href="/card-products"
                className={`transition-colors ${pathname === '/card-products' ? 'text-emerald-600' : 'hover:text-gray-900'}`}
              >
                卡网商品
              </Link>
              <Link 
                href="/channels"
                className={`transition-colors ${pathname === '/channels' ? 'text-emerald-600' : 'hover:text-gray-900'}`}
              >
                渠道商
              </Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button 
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">提交渠道</span>
                <span className="inline sm:hidden">提交</span>
              </button>
              <button 
                onClick={() => setIsQQModalOpen(true)}
                className="flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity text-[#12B7F5]"
                title="QQ Group"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor">
                  <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/>
                </svg>
              </button>
              <a 
                href="https://t.me/openprice1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity text-[#2CA5E0]"
                title="Telegram Group"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              <a 
                href="https://github.com/kawang01/awesome-OpenPrice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
                title="GitHub Repository"
              >
                <img src="/github.png" alt="GitHub" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
              </a>
            </div>
          </div>
          </div>
        </header>

      {/* Submit Channel Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">提交渠道收录</h3>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form 
              className="space-y-4" 
              onSubmit={handleSubmit}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  渠道名称
                </label>
                <input 
                  type="text" 
                  name="site_name"
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors" 
                  placeholder="例如：Netflix 优质合租" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  渠道链接 <span className="text-red-500">*</span>
                </label>
                <input 
                  required 
                  type="url" 
                  name="site_url"
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors" 
                  placeholder="https://" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  联系方式
                </label>
                <input 
                  type="text" 
                  name="contact"
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors" 
                  placeholder="Telegram / 微信 / 邮箱" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <textarea 
                  name="remarks"
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors min-h-[100px] resize-none" 
                  placeholder="填写其他说明信息或推荐理由..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? '提交中...' : '确认提交'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <QQGroupModal 
        isOpen={isQQModalOpen} 
        onClose={() => setIsQQModalOpen(false)} 
      />
    </>
  );
}
