"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import type { ProductType, ProductDetail } from '../../../data';
import { DetailTable } from '../../../components/DetailTable';
import { Filter, ArrowLeft, X } from 'lucide-react';
import { FilterBar } from '../../../components/FilterBar';
import { CustomDropdown } from '../../../components/CustomDropdown';
import { BackButton } from '../../../components/BackButton';
import { StickyHeaderAddon } from '../../../components/StickyHeaderAddon';
import { BuyDisclaimerModal } from '../../../components/BuyDisclaimerModal';
import { FeedbackModal } from '../../../components/FeedbackModal';
import { useBuyAction } from '../../../hooks/useBuyAction';
import { PlatformCountBadge } from '../../../components/PlatformCountBadge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ProductDetailClientProps {
  slug: string;
  initialProduct: ProductType;
  initialDetails: ProductDetail[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ slug, initialProduct, initialDetails }) => {
  const [feedbackModalItem, setFeedbackModalItem] = useState<ProductDetail | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isBuyModalOpen, handleBuyClick, handleBuyConfirm, handleBuyCancel } = useBuyAction();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  
  const onBuyClick = (item: ProductDetail) => {
    handleBuyClick(item.url, item.channel);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [customMinPrice, setCustomMinPrice] = useState('');
  const [customMaxPrice, setCustomMaxPrice] = useState('');

  const selectedProduct = initialProduct;
  const currentDetails = initialDetails;

  const availableChannelsForDetails = useMemo(() => {
    return Array.from(new Set(currentDetails.map(d => d.channel)));
  }, [currentDetails]);

  const checkPriceMatch = (price: number) => {
    const min = customMinPrice ? parseFloat(customMinPrice) : 0;
    const max = customMaxPrice ? parseFloat(customMaxPrice) : Infinity;
    return price >= min && price <= max;
  };

  const filteredCurrentDetails = useMemo(() => {
    const filtered = currentDetails.filter(d => {
      const matchSearch = d.originalName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchPrice = checkPriceMatch(d.price);
      const matchChannel = selectedChannel ? d.channel === selectedChannel : true;
      return matchSearch && matchPrice && matchChannel;
    });

    return filtered.sort((a, b) => {
      // 1. 优先展示有货商品
      const getStatusPriority = (status: string) => {
        if (status === 'in_stock') return 1;
        if (status === 'out_of_stock') return 2;
        if (status === 'offline') return 3;
        return 99;
      };
      
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 2. 状态相同的情况下，按价格从低到高排序
      return a.price - b.price;
    });
  }, [currentDetails, searchQuery, selectedChannel, customMinPrice, customMaxPrice]);

  return (
    <>
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        <PlatformCountBadge count={selectedProduct.channelCount} prefix="该商品有" suffix="个渠道报价" />
        
        {/* Option A: Static Header with Title and Back Button */}
        <div className="mb-10 flex flex-col md:flex-row items-start gap-4 md:gap-6">
          <BackButton href="/card-products" />
          <div className="flex-1 w-full">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3 flex items-center gap-3">
              {selectedProduct.name}
              <span className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">{selectedProduct.platform}</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
              {selectedProduct.shortDesc || '暂无详细描述'}
            </p>
          </div>
        </div>

        <div className="flex flex-col relative">
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onReset={() => {
              setSearchQuery("");
              setSelectedChannel("");
              setCustomMinPrice("");
              setCustomMaxPrice("");
            }}
            searchPlaceholder="在当前商品中搜索..."
            isExpanded={isScrolled}
            leftAddon={<StickyHeaderAddon title={selectedProduct.name} />}
          >
            <div className="flex items-center justify-center bg-white/95 rounded-lg shadow-sm px-1.5 sm:px-3 h-8 sm:h-10 shrink-0 transition-all focus-within:ring-2 focus-within:ring-white/50">
              <span className="text-gray-400 text-[12px] sm:text-sm mr-0.5 sm:mr-1">¥</span>
              <input
                type="number"
                min="0"
                placeholder="最低"
                value={customMinPrice}
                onChange={(e) => setCustomMinPrice(e.target.value)}
                className="w-9 sm:w-16 bg-transparent text-[12px] sm:text-[14px] text-gray-900 focus:outline-none placeholder-gray-400 text-center px-0"
              />
              <span className="text-gray-300 mx-0.5 sm:mx-2">-</span>
              <span className="text-gray-400 text-[12px] sm:text-sm mr-0.5 sm:mr-1">¥</span>
              <input
                type="number"
                min="0"
                placeholder="最高"
                value={customMaxPrice}
                onChange={(e) => setCustomMaxPrice(e.target.value)}
                className="w-9 sm:w-16 bg-transparent text-[12px] sm:text-[14px] text-gray-900 focus:outline-none placeholder-gray-400 text-center px-0"
              />
            </div>
          </FilterBar>
          
          <div className="min-h-[400px] relative">
            <DetailTable 
              details={filteredCurrentDetails} 
              onBuyClick={onBuyClick}
              onFeedbackClick={(item) => setFeedbackModalItem(item)}
              
            />
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!feedbackModalItem}
        onClose={() => setFeedbackModalItem(null)}
        offerId={feedbackModalItem?.id || ''}
        productName={feedbackModalItem?.originalName || ''}
        channelName={feedbackModalItem?.channel || ''}
      />

      <BuyDisclaimerModal 
        isOpen={isBuyModalOpen}
        onClose={handleBuyCancel}
        onConfirm={handleBuyConfirm}
      />
    </>
  );
};
