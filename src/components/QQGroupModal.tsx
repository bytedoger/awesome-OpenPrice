import React from 'react';
import { X } from 'lucide-react';

interface QQGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QQGroupModal({ isOpen, onClose }: QQGroupModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200 text-center relative">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 mx-auto pl-6">加入 QQ 交流群</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors absolute right-4 top-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="bg-[#12B7F5]/10 p-4 rounded-full">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-[#12B7F5]" fill="currentColor">
              <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"/>
            </svg>
          </div>
          <div>
            <p className="text-gray-600 mb-1">加入我们的 QQ 闲聊群，划水、分享最新的AI工具使用技巧</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-gray-500 text-sm font-medium">QQ群号:</span>
              <p className="text-2xl font-bold text-[#12B7F5] tracking-wider select-all">930645690</p>
            </div>
          </div>
          <div className="w-48 h-48 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center text-gray-400 mt-2 mx-auto overflow-hidden relative group">
            {/* 如果您有二维码图片，可以取消下方注释并修改图片路径 */}
            <img src="/qq-qr-code.png" alt="QQ群二维码" className="w-full h-full object-cover" />
            
            {/* 在放入真实二维码图片前，暂时显示占位符
            <div className="text-center p-4">
              <span className="block text-sm">请在此处</span>
              <span className="block text-sm">放置您的群二维码</span>
            </div> */}
          </div>
        </div>
        
        <div className="pt-2">
          <a 
            href="https://qm.qq.com/q/6syItALFu0" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full py-2.5 text-sm font-medium text-white bg-[#12B7F5] rounded-lg hover:bg-[#12B7F5]/90 transition-colors shadow-sm shadow-[#12B7F5]/20"
          >
            一键唤起 QQ 加群
          </a>
        </div>
      </div>
    </div>
  );
}
