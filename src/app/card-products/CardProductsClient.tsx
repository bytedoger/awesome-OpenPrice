"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ProductType } from '../../data';
import { MasterTable } from '../../components/MasterTable';
import { FilterBar } from '../../components/FilterBar';
import { CustomDropdown } from '../../components/CustomDropdown';
import { PlatformCountBadge } from '../../components/PlatformCountBadge';
import { useUrlState } from '../../hooks/useUrlState';
import { useRouter } from 'next/navigation';
import { matchesSearchQuery } from '../../lib/search-query';

interface CardProductsClientProps {
  initialProducts: ProductType[];
  platformCount: number;
}

export const CardProductsClient: React.FC<CardProductsClientProps> = ({ initialProducts, platformCount }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useUrlState('q', '');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  
  const availablePlatforms = useMemo(() => {
    const platformMap = new Map<string, number>();
    initialProducts.forEach(p => {
      if (!platformMap.has(p.platform)) {
        platformMap.set(p.platform, p.platform_sort_order ?? 9999);
      }
    });
    return Array.from(platformMap.entries())
      .sort((a, b) => a[1] - b[1])
      .map(entry => entry[0]);
  }, [initialProducts]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const decodedHash = decodeURIComponent(hash.substring(1)).toLowerCase();
        const matchedPlatform = availablePlatforms.find(p => p.toLowerCase() === decodedHash);
        if (matchedPlatform) {
          setSelectedPlatform(matchedPlatform);
        } else {
          setSelectedPlatform('');
        }
      } else {
        setSelectedPlatform('');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [availablePlatforms]);

  const handlePlatformChange = (val: string) => {
    setSelectedPlatform(val);
    const baseUrl = window.location.pathname + window.location.search;
    const targetUrl = val ? `${baseUrl}#${encodeURIComponent(val)}` : baseUrl;
    router.replace(targetUrl, { scroll: false });
  };

  const filteredProducts = useMemo(() => {
    const filtered = initialProducts.filter(p => {
      const matchSearch = matchesSearchQuery(
        [p.name, p.platform, ...(p.searchKeywords ?? [])],
        searchQuery,
      );
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
      <PlatformCountBadge count={platformCount} href="/channels" />
      <div className="mb-6 max-w-3xl pt-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
            AI 订阅比价与卡网渠道报价聚合
          </h1>
        </div>
        <p className="text-sm text-gray-500 max-w-3xl leading-relaxed">
          OpenPrice 提供卡网渠道报价聚合与 AI 订阅比价，覆盖 ChatGPT、Claude、Gemini、Grok、Cursor 等 AI 订阅，以及代充、成品号、接码、邮箱和账号等数字产品，是一站式 AI 订阅多渠道比价平台。
        </p>
      </div>

      <div className="flex flex-col relative">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={() => {
            setSearchQuery("");
            handlePlatformChange("");
          }}
          searchPlaceholder="搜索商品或平台（-关键词可排除）"
          searchHelp="排除不想看的结果：在词语前加“-”。例如输入“-共享”，就不会显示含“共享”的商品。"
        >
          <Link
            href="/card-products/all"
            className="inline-flex items-center justify-center rounded-lg text-[12px] sm:text-sm font-semibold transition-all bg-white/95 text-gray-900 shadow-sm hover:bg-white h-8 sm:h-10 px-2 sm:px-4 whitespace-nowrap shrink-0"
          >
            查看所有商品
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1 sm:ml-2 -mr-0.5 sm:-mr-1 sm:w-4 sm:h-4"><path d="m9 18 6-6-6-6"/></svg>
          </Link>
          <CustomDropdown
            value={selectedPlatform}
            onChange={handlePlatformChange}
            options={availablePlatforms.map(platform => ({ value: platform, label: platform }))}
            placeholder="所有平台"
            allOptionLabel="所有平台"
          />
        </FilterBar>
        
        <div className="min-h-[400px] relative">
          <MasterTable products={filteredProducts} />
        </div>
      </div>
    </div>
  );
};
