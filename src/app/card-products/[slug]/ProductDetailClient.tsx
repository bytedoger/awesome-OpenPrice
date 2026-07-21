"use client";

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import type { ProductType, ProductDetail } from '../../../data';
import { DetailTable } from '../../../components/DetailTable';
import { Filter, ArrowLeft, X } from 'lucide-react';
import { FilterBar } from '../../../components/FilterBar';
import { CustomDropdown } from '../../../components/CustomDropdown';
import { BackButton } from '../../../components/BackButton';
import { BuyDisclaimerModal } from '../../../components/BuyDisclaimerModal';
import { useBuyAction } from '../../../hooks/useBuyAction';
import { PlatformCountBadge } from '../../../components/PlatformCountBadge';
import Link from 'next/link';

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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // @ts-ignore
      const { submitFeedback } = await import('@/app/actions');
      const res = await submitFeedback(formData);
      if (res.success) {
        alert('反馈提交成功，感谢您的协助！');
        setFeedbackModalItem(null);
      } else {
        alert(res.error || '提交失败');
      }
    });
  };
  
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
            leftAddon={
              <div className="w-full">
                {/* 内层白色框 */}
                <div className="flex items-center bg-white/95 rounded-lg shadow-sm h-10 pr-1.5 md:pr-4 transition-all hover:bg-white w-full min-w-[40px] md:min-w-[280px] xl:min-w-[360px]">
                  <Link 
                    href="/card-products"
                    className="inline-flex h-7 w-7 ml-1.5 mr-0 md:mr-1.5 items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white rounded-md transition-colors shrink-0"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <div className="hidden md:block w-[1px] h-4 bg-gray-200 mr-2 shrink-0"></div>
                  <h2 className="hidden md:block text-gray-900 font-medium text-[14px] truncate">{selectedProduct.name}</h2>
                </div>
              </div>
            }
          >
            <div className="flex items-center justify-center bg-white/95 rounded-lg shadow-sm px-1.5 sm:px-3 h-10 shrink-0 transition-all focus-within:ring-2 focus-within:ring-white/50">
              <span className="text-gray-400 text-[13px] sm:text-sm mr-0.5 sm:mr-1">¥</span>
              <input
                type="number"
                min="0"
                placeholder="最低"
                value={customMinPrice}
                onChange={(e) => setCustomMinPrice(e.target.value)}
                className="w-9 sm:w-16 bg-transparent text-[13px] sm:text-[14px] text-gray-900 focus:outline-none placeholder-gray-400 text-center px-0"
              />
              <span className="text-gray-300 mx-0.5 sm:mx-2">-</span>
              <span className="text-gray-400 text-[13px] sm:text-sm mr-0.5 sm:mr-1">¥</span>
              <input
                type="number"
                min="0"
                placeholder="最高"
                value={customMaxPrice}
                onChange={(e) => setCustomMaxPrice(e.target.value)}
                className="w-9 sm:w-16 bg-transparent text-[13px] sm:text-[14px] text-gray-900 focus:outline-none placeholder-gray-400 text-center px-0"
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

      {feedbackModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">渠道反馈</h3>
              <button 
                onClick={() => setFeedbackModalItem(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form 
              className="space-y-4" 
              onSubmit={handleFeedbackSubmit}
            >
              <input type="hidden" name="offer_id" value={feedbackModalItem.id} />
              <div className="rounded-lg bg-gray-50 p-4 mb-2 space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">您正在反馈的商品：</p>
                  <p className="font-medium text-gray-900">{feedbackModalItem.originalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">所属渠道：</p>
                  <p className="font-medium text-gray-900">{feedbackModalItem.channel}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  问题类型 <span className="text-red-500">*</span>
                </label>
                <select 
                  name="issue_type"
                  required 
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors cursor-pointer" 
                >
                  <option value="">请选择问题类型</option>
                  <option value="price_error">价格不一致</option>
                  <option value="link_invalid">链接失效/店铺关闭</option>
                  <option value="scammer">欺诈跑路风险</option>
                  <option value="out_of_stock">长时间缺货未更新</option>
                  <option value="other">其他问题</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  补充说明 <span className="text-red-500">*</span>
                </label>
                <textarea 
                  name="description"
                  required
                  className="w-full rounded-lg bg-gray-100 border-0 px-4 py-2.5 text-gray-900 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-emerald-600 outline-none transition-colors min-h-[100px] resize-none" 
                  placeholder="请详细描述您遇到的问题，以便我们核实处理..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setFeedbackModalItem(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isPending}
                  className="px-5 py-2.5 text-sm font-medium text-emerald-800 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                >
                  {isPending ? '提交中...' : '提交反馈'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BuyDisclaimerModal 
        isOpen={isBuyModalOpen}
        onClose={handleBuyCancel}
        onConfirm={handleBuyConfirm}
      />
    </>
  );
};
