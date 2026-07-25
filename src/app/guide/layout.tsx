import React from 'react';
import { GuideSidebar } from './GuideSidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '指南 | OpenPrice',
  description: 'OpenPrice 指南，了解如何将你的发卡网或渠道收录到平台。',
};

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50/50 py-8 md:py-12">
      <div className="w-full flex flex-col md:flex-row justify-center items-start px-4 sm:px-6 lg:px-8">
        
        {/* 左侧真实的侧边栏 */}
        <div className="w-full md:w-56 lg:w-64 shrink-0 md:mr-8 lg:mr-12 mb-8 md:mb-0">
          <GuideSidebar />
        </div>
        
        {/* 绝对居中的正文区域 */}
        <main className="w-full max-w-4xl min-w-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            {children}
          </div>
        </main>
        
        {/* 右侧占位符（保持和左侧等宽，以确保中间的正文在视觉上完美居中） */}
        <div className="hidden md:block md:w-56 lg:w-64 shrink-0 md:ml-8 lg:ml-12 pointer-events-none" />
      </div>
    </div>
  );
}
