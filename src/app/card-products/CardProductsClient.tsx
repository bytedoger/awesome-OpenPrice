"use client";

import React, { useState, useMemo } from 'react';
import { ProductType } from '../../data';
import { MasterTable } from '../../components/MasterTable';
import { FilterBar } from '../../components/FilterBar';
import { CustomDropdown } from '../../components/CustomDropdown';
import { PlatformCountBadge } from '../../components/PlatformCountBadge';

interface CardProductsClientProps {
  initialProducts: ProductType[];
  platformCount: number;
}

export const CardProductsClient: React.FC<CardProductsClientProps> = ({ initialProducts, platformCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  const availablePlatforms = useMemo(() => {
    return Array.from(new Set(initialProducts.map(p => p.platform)));
  }, [initialProducts]);

  const handlePlatformChange = (val: string) => {
    setSelectedPlatform(val);
  };

  const filteredProducts = useMemo(() => {
    const filtered = initialProducts.filter(p => {
      const query = searchQuery.toLowerCase();
      const matchSearch = p.name.toLowerCase().includes(query) || 
                          p.platform.toLowerCase().includes(query) ||
                          (p.searchKeywords && p.searchKeywords.some(kw => kw.toLowerCase().includes(query)));
      const matchPlatform = selectedPlatform ? p.platform === selectedPlatform : true;
      
      return matchSearch && matchPlatform;
    });

    return filtered.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      const platformCompare = a.platform.localeCompare(b.platform);
      if (platformCompare !== 0) return platformCompare;
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, selectedPlatform, initialProducts]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <PlatformCountBadge count={platformCount} />
      <div className="mb-12 max-w-3xl pt-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-4">
          卡网商品聚合
        </h1>
        <p className="text-lg text-gray-500 max-w-3xl leading-relaxed">
          打破信息差，轻松触达全网底价。OpenPrice 实时聚合全网卡网渠道，无论是 ChatGPT、Claude 等 AI订阅、成品号等，还是接码、邮箱、社媒账号等，海量底价一目了然，让大家以最优的价格购买合适的产品。也希望您一键提交知道的靠谱渠道，共同完善这个平台。
        </p>
      </div>

      <div className="flex flex-col relative">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={() => {
            setSearchQuery("");
            setSelectedPlatform("");
          }}
          searchPlaceholder="搜索商品或平台..."
        >
          <CustomDropdown
            value={selectedPlatform}
            onChange={handlePlatformChange}
            options={availablePlatforms.map(platform => ({ value: platform, label: platform }))}
            placeholder="所有平台"
            allOptionLabel="所有平台"
          />
        </FilterBar>
        
        <div className="min-h-[400px] relative mt-8">
          <MasterTable products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};
