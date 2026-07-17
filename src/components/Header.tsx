"use client";

import React, { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Store, Plus, X, Tags, Github } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
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
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                <Tags className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
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

            </nav>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSubmitModalOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                提交渠道
              </button>
              <a 
                href="https://github.com/kawang01/awesome-OpenPrice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg hover:opacity-80 transition-opacity"
                title="GitHub Repository"
              >
                <img src="/github.png" alt="GitHub" className="h-8 w-8 object-contain" />
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
    </>
  );
}
