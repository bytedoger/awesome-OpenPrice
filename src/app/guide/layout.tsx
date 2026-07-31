import React from 'react';
import { GuideSidebar } from './GuideSidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '指南 | OpenPrice',
  description: 'OpenPrice 用户与渠道商指南：了解官方订阅和卡网渠道的区别，以及渠道收录和商品展示方法。',
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 md:py-12">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-start px-4 sm:px-6 lg:px-8">
        
        {/* 左侧真实的侧边栏 */}
        <div className="w-full md:w-56 lg:w-64 shrink-0 mb-8 md:mb-0">
          <GuideSidebar />
        </div>
        
        {/* 正文区域 */}
        <main className="w-full md:flex-1 md:pl-8 lg:pl-12 min-w-0">
          <div className="w-full max-w-4xl mx-auto xl:mx-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
