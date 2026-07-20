"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { FilterBar } from '../../../components/FilterBar';
import { BackButton } from '../../../components/BackButton';
import { getRelativeTime } from '../../../lib/utils';
import { GoToBuyButton } from '../../../components/GoToBuyButton';
import { BuyDisclaimerModal } from '../../../components/BuyDisclaimerModal';
import { useBuyAction } from '../../../hooks/useBuyAction';

interface ChannelOffer {
  id: string;
  title: string;
  price: number;
  url: string;
  updatedAt: string;
  category: string;
}

interface ChannelDetailClientProps {
  channel: {
    id: string;
    name: string;
    scraper_type: string;
    created_at: string;
    updated_at: string;
  };
  offers: ChannelOffer[];
}



export const ChannelDetailClient: React.FC<ChannelDetailClientProps> = ({ channel, offers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isBuyModalOpen, handleBuyClick, handleBuyConfirm, handleBuyCancel } = useBuyAction();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredOffers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return offers;
    
    return offers.filter(o => {
      return o.title.toLowerCase().includes(query) || 
             o.category.toLowerCase().includes(query);
    });
  }, [offers, searchQuery]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 flex flex-col md:flex-row items-start gap-4 md:gap-6">
        <BackButton href="/channels" />
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3 flex items-center gap-3">
            {channel.name} 
            <span className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium shadow-sm border border-blue-200">收录商品数: {offers.length}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            该渠道下的所有在售商品列表，您可以浏览分类及价格。
          </p>
        </div>
      </div>

      <div className="flex flex-col relative">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={() => setSearchQuery("")}
          searchPlaceholder="搜索商品标题或分类..."
          isExpanded={isScrolled}
          leftAddon={
            <div className="w-full">
              <div className="flex items-center bg-white/95 rounded-lg shadow-sm h-10 pr-3 md:pr-4 transition-all hover:bg-white w-full min-w-[40px] md:min-w-[280px]">
                <a 
                  href="/channels"
                  className="inline-flex h-7 w-7 ml-1.5 mr-0 md:mr-1.5 items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white rounded-md transition-colors shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </a>
                <div className="hidden md:block w-[1px] h-4 bg-gray-200 mr-2 shrink-0"></div>
                <h2 className="hidden md:block text-gray-900 font-medium text-[14px] truncate">{channel.name} 商品列表</h2>
              </div>
            </div>
          }
        />
        
        {/* Mobile Card Layout */}
        <div className="flex flex-col gap-3 md:hidden mt-4">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-gray-900 text-[15px] break-words leading-relaxed">
                    {offer.title}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-xs text-gray-500">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-100 text-gray-700">
                    {offer.category}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-1 pt-3 border-t border-gray-50">
                  <div className="flex flex-col">
                    <span suppressHydrationWarning className="text-[11px] text-gray-400 mb-1">{getRelativeTime(offer.updatedAt)}</span>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-emerald-600 font-semibold text-sm">¥</span>
                      <span className="text-emerald-600 font-bold text-xl leading-none">{offer.price.toFixed(2)}</span>
                    </div>
                  </div>
                  <GoToBuyButton 
                    disabled={!offer.url}
                    onClick={() => handleBuyClick(offer.url, channel.name)}
                    className="bg-[#01c573] text-white border-transparent hover:bg-emerald-600"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              未找到符合条件的商品
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative mt-4">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm table-fixed border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-[40%] px-6 py-4 font-semibold text-gray-600">商品标题</th>
                  <th className="w-[20%] px-6 py-4 font-semibold text-gray-600">商品分类</th>
                  <th className="w-[12%] px-6 py-4 font-semibold text-gray-600">价格 (元)</th>
                  <th className="w-[13%] px-6 py-4 font-semibold text-gray-600">最近更新</th>
                  <th className="w-[15%] px-6 py-4 font-semibold text-gray-600 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOffers.length > 0 ? (
                  filteredOffers.map((offer) => (
                    <tr key={offer.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 break-words leading-relaxed" title={offer.title}>
                          {offer.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[13px] font-medium bg-gray-100 text-gray-700 border border-gray-200/50 break-words">
                          {offer.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-emerald-600">
                          ¥{offer.price.toFixed(2)}
                        </span>
                      </td>
                      <td suppressHydrationWarning className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {getRelativeTime(offer.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                        <GoToBuyButton 
                          disabled={!offer.url}
                          onClick={() => handleBuyClick(offer.url, channel.name)} 
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="text-lg mb-2">未找到符合条件的商品</div>
                        <div className="text-sm">尝试调整搜索关键词</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <BuyDisclaimerModal 
        isOpen={isBuyModalOpen}
        onClose={handleBuyCancel}
        onConfirm={handleBuyConfirm}
      />
    </div>
  );
};
