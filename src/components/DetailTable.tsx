import React from 'react';
import { ProductDetail, ProductType } from '../data';
import { Badge } from './Badge';
import { ArrowRight } from 'lucide-react';

interface DetailTableProps {
  details: ProductDetail[];
  types?: ProductType[];
  showCategoryInfo?: boolean;
  onBuyClick?: (detail: ProductDetail) => void;
  onFeedbackClick?: (detail: ProductDetail) => void;
}

export const DetailTable: React.FC<DetailTableProps> = ({ details, types, showCategoryInfo, onBuyClick, onFeedbackClick }) => {
  if (details.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-xl">
        暂无该类商品的详细信息
      </div>
    );
  }

  const getStatusBadge = (detail: ProductDetail) => {
    if (detail.status === 'in_stock') {
      if (detail.inventory != null && detail.inventory >= 0) {
        return (
          <div className="flex flex-col gap-1.5 items-start">
            <Badge variant="success">正常</Badge>
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              库存: {detail.inventory}
            </span>
          </div>
        );
      }
      return <Badge variant="success">正常</Badge>;
    }
    if (detail.status === 'out_of_stock') {
      return <Badge variant="warning">缺货</Badge>;
    }
    if (detail.status === 'offline') {
      return <Badge variant="error">已下架</Badge>;
    }
    return <Badge>未知</Badge>;
  };

  const getRelativeTime = (timeStr: string) => {
    if (!timeStr) return '刚刚更新';
    // 兼容 ISO 格式与老版 Safari 的 YYYY-MM-DD HH:mm:ss 格式
    const time = timeStr.includes('T') 
      ? new Date(timeStr).getTime() 
      : new Date(timeStr.replace(/-/g, '/')).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - time);
    
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} 天前`;
    if (hours > 0) return `${hours} 小时前`;
    if (mins > 0) return `${mins} 分钟前`;
    return '刚刚更新';
  };

  const getIncludedDays = (dateStr: string) => {
    if (!dateStr) return 0;
    // 优先使用标准解析，失败（如 iOS Safari 不支持 YYYY-MM-DD HH:mm:ss）再尝试替换
    let includedDate = new Date(dateStr).getTime();
    if (isNaN(includedDate)) {
      includedDate = new Date(dateStr.replace(/-/g, '/')).getTime();
    }
    if (isNaN(includedDate)) return 0;
    const now = Date.now();
    const diff = Math.max(0, now - includedDate);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Mobile Card Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {details.map((detail) => {
          const typeInfo = types?.find(t => t.id === detail.typeId);
          const isBuyDisabled = detail.status === 'offline' || detail.status === 'out_of_stock';
          return (
            <div key={detail.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
              {/* Top Row: Channel and Status */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    {showCategoryInfo && typeInfo?.platform && (
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 shrink-0">
                        {typeInfo.platform}
                      </span>
                    )}
                    <div className="text-gray-900 font-bold text-[15px] truncate">{detail.channel}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-0.5">
                    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {detail.channelType}
                    </span>
                    <span suppressHydrationWarning className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      收录 {getIncludedDays(detail.includedTime)} 天
                    </span>
                  </div>
                </div>
                <div className="shrink-0 pt-0.5">{getStatusBadge(detail)}</div>
              </div>
              
              {/* Middle Row: Original Name */}
              <div className="text-gray-700 text-[13px] leading-relaxed break-words bg-gray-50/50 rounded-lg p-2.5 border border-gray-50">
                {detail.originalName}
              </div>
              
              {/* Bottom Row: Price, Time, Actions */}
              <div className="flex justify-between items-end mt-0.5">
                <div className="flex flex-col">
                  <span suppressHydrationWarning className="text-[11px] text-gray-400 mb-1">{getRelativeTime(detail.updateTime)}</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-emerald-600 font-semibold text-sm">¥</span>
                    <span className="text-emerald-600 font-bold text-xl leading-none">{detail.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onFeedbackClick?.(detail)}
                    className="text-gray-400 hover:text-emerald-600 font-medium transition-colors text-[13px]"
                  >
                    反馈
                  </button>
                  <button 
                    disabled={isBuyDisabled}
                    onClick={() => onBuyClick?.(detail)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#01c573] text-white px-4 py-2 text-[13px] font-medium transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    前往购买
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block overflow-hidden rounded-xl bg-white shadow-sm w-full">
        <table className="w-full text-left text-sm table-fixed">
          <thead className="bg-gray-100">
            <tr>
              {showCategoryInfo && (
                <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[10%]">平台</th>
              )}
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[8%]">状态</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[15%]">渠道</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[41%]">原始商品名</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[8%]">价格</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 w-[10%]">更新时间</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 text-center text-xs w-[12%]">操作</th>
              <th scope="col" className="px-4 py-4 font-semibold text-gray-900 text-center text-xs w-[6%]">反馈</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {details.map((detail) => {
              const typeInfo = types?.find(t => t.id === detail.typeId);
              const isBuyDisabled = detail.status === 'offline' || detail.status === 'out_of_stock';
              return (
                <tr key={detail.id} className="even:bg-gray-50/80 hover:bg-gray-100 transition-colors">
                  {showCategoryInfo && (
                    <td className="px-4 py-4 text-gray-900 break-words">{typeInfo?.platform || '-'}</td>
                  )}
                  <td className="px-4 py-4">{getStatusBadge(detail)}</td>
                  <td className="px-4 py-4">
                    <div className="text-gray-900 font-medium mb-2 break-words">{detail.channel}</div>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        {detail.channelType}
                      </span>
                      <span suppressHydrationWarning className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                        收录 {getIncludedDays(detail.includedTime)} 天
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 break-words">{detail.originalName}</td>
                  <td className="px-4 py-4 text-emerald-600 font-medium">¥{detail.price.toFixed(2)}</td>
                  <td suppressHydrationWarning className="px-4 py-4 text-gray-500 text-xs">{getRelativeTime(detail.updateTime)}</td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      disabled={isBuyDisabled}
                      onClick={() => onBuyClick?.(detail)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      前往购买
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button 
                      onClick={() => onFeedbackClick?.(detail)}
                      className="text-gray-500 hover:text-emerald-700 font-medium transition-colors text-xs"
                    >
                      反馈
                    </button>
                  </td>
                </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
};
