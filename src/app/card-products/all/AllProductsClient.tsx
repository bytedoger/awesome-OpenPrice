"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { FilterBar } from '../../../components/FilterBar';
import { CustomDropdown } from '../../../components/CustomDropdown';
import { getRelativeTime } from '../../../lib/utils';
import { ArrowRight } from 'lucide-react';
import { BackButton } from '../../../components/BackButton';
import { StickyHeaderAddon } from '../../../components/StickyHeaderAddon';
import { FeedbackModal } from '../../../components/FeedbackModal';
import { BuyDisclaimerModal } from '../../../components/BuyDisclaimerModal';
import { useBuyAction } from '../../../hooks/useBuyAction';
import { GoToBuyButton } from '../../../components/GoToBuyButton';
import { DetailTable } from '../../../components/DetailTable';
import type { ProductDetail } from '../../../data';

export interface OfferItem {
  id: string;
  title: string;
  price: number;
  status: string;
  url: string;
  updatedAt: string;
  shopName: string;
  category: string;
  platform: string;
  platformSortOrder: number;
}

interface AllProductsClientProps {
  initialItems: OfferItem[];
}

export const AllProductsClient: React.FC<AllProductsClientProps> = ({ initialItems }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [feedbackModalItem, setFeedbackModalItem] = useState<OfferItem | null>(null);
  
  const { isBuyModalOpen, handleBuyClick, handleBuyConfirm, handleBuyCancel } = useBuyAction();

  const onBuyClick = (item: OfferItem) => {
    handleBuyClick(item.url, item.shopName);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const availablePlatforms = useMemo(() => {
    const platformMap = new Map<string, number>();
    initialItems.forEach(p => {
      if (!platformMap.has(p.platform)) {
        platformMap.set(p.platform, p.platformSortOrder ?? 9999);
      }
    });
    return Array.from(platformMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
  }, [initialItems]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    initialItems.forEach(p => categories.add(p.category));
    return Array.from(categories).sort();
  }, [initialItems]);

  const filteredItems = useMemo(() => {
    return initialItems.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchSearch = p.title.toLowerCase().includes(query) || p.shopName.toLowerCase().includes(query);
      const matchPlatform = selectedPlatform ? p.platform === selectedPlatform : true;
      const matchCategory = selectedCategory ? p.category === selectedCategory : true;
      
      return matchSearch && matchPlatform && matchCategory;
    }).sort((a, b) => {
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

      if (a.platformSortOrder !== b.platformSortOrder) {
        return a.platformSortOrder - b.platformSortOrder;
      }
      const platformCompare = a.platform.localeCompare(b.platform);
      if (platformCompare !== 0) return platformCompare;
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, selectedPlatform, selectedCategory, initialItems]);

  const productDetails: ProductDetail[] = useMemo(() => {
    return filteredItems.map(item => ({
      id: item.id,
      typeId: '',
      status: (item.status === 'in_stock' || item.status === 'out_of_stock' || item.status === 'offline') 
        ? item.status 
        : 'in_stock',
      channel: item.shopName,
      operateTime: item.updatedAt,
      originalName: item.title,
      price: item.price,
      url: item.url,
      updateTime: item.updatedAt,
      risk: 'low',
      platform: item.platform,
      category: item.category
    }));
  }, [filteredItems]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <div className="mb-10 flex flex-col md:flex-row items-start gap-4 md:gap-6 mt-4">
        <BackButton href="/card-products" />
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3 flex items-center gap-3">
            所有渠道所有商品
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            查看 OpenPrice 收录的所有卡网渠道所有商品，涵盖 ChatGPT、Claude、Gemini、Cursor、Gork、Kiro等AI订阅，以及谷歌邮箱、outlook 邮箱以及苹果账号、telegram 账号以及接码服务等。支持多维度价格和平台筛选，快速找到全网最低价。
          </p>
        </div>
      </div>

      <div className="flex flex-col relative space-y-4">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={() => {
            setSearchQuery("");
            setSelectedPlatform("");
            setSelectedCategory("");
          }}
          searchPlaceholder="搜索商品名称或店铺..."
          isExpanded={isScrolled}
          leftAddon={<StickyHeaderAddon title="所有渠道商品" />}
        >
          <CustomDropdown
            value={selectedPlatform}
            onChange={setSelectedPlatform}
            options={availablePlatforms.map(platform => ({ value: platform, label: platform }))}
            placeholder="所有平台"
            allOptionLabel="所有平台"
          />
          <div className="hidden sm:block">
            <CustomDropdown
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={availableCategories.map(cat => ({ value: cat, label: cat }))}
              placeholder="所有类目"
              allOptionLabel="所有类目"
            />
          </div>
        </FilterBar>
        
        <div className="min-h-[400px] relative mt-8">
          <div className="flex flex-col gap-8">
            <DetailTable 
              details={productDetails}
              mode="all"
              onBuyClick={(detail) => {
                const item = filteredItems.find(i => i.id === detail.id);
                if (item) onBuyClick(item);
              }}
              onFeedbackClick={(detail) => {
                const item = filteredItems.find(i => i.id === detail.id);
                if (item) setFeedbackModalItem(item);
              }}
            />
          </div>
        </div>
      </div>

      <FeedbackModal
        isOpen={!!feedbackModalItem}
        onClose={() => setFeedbackModalItem(null)}
        offerId={feedbackModalItem?.id || ''}
        productName={feedbackModalItem?.title || ''}
        channelName={feedbackModalItem?.shopName || ''}
      />

      <BuyDisclaimerModal 
        isOpen={isBuyModalOpen}
        onClose={handleBuyCancel}
        onConfirm={handleBuyConfirm}
      />
    </div>
  );
};
