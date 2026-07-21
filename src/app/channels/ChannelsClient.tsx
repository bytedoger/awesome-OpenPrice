"use client";

import React, { useState, useMemo } from 'react';
import { FilterBar } from '../../components/FilterBar';
import { getRelativeTime } from '../../lib/utils';
import { ViewDetailsButton } from '../../components/ViewDetailsButton';
import { PlatformCountBadge } from '../../components/PlatformCountBadge';
import { Info } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  scraper_type: string;
  created_at: string;
  updated_at: string;
  productCount?: number;
}

interface ChannelsClientProps {
  initialChannels: Channel[];
}

function formatScraperType(type: string) {
  if (type === 'ldxp') return '链动小铺';
  if (type === 'dujiao') return '独角数卡';
  if (type === 'lizhi') return '二次元发卡';
  if (type === 'other') return '其它';
  return type || '未知';
}



export const ChannelsClient: React.FC<ChannelsClientProps> = ({ initialChannels }) => {
  const [searchQuery, setSearchQuery] = useState('');



  const filteredChannels = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return initialChannels;
    
    return initialChannels.filter(c => {
      return c.name.toLowerCase().includes(query) || 
             formatScraperType(c.scraper_type).toLowerCase().includes(query);
    });
  }, [initialChannels, searchQuery]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      <PlatformCountBadge count={initialChannels.length} />
      <div className="mb-10 flex flex-col md:flex-row items-start gap-4 md:gap-6">
        <div className="flex-1 w-full">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3 flex items-center gap-3">
            渠道商列表
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed mb-3">
            在这里可以查看所有被收录并正在活跃更新的渠道，感谢各位渠道商和用户的提交，共同维护这片生态。
          </p>
          <div className="inline-flex items-center gap-1.5 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100/50 shadow-sm">
            <Info className="w-4 h-4 shrink-0" />
            <span>为保证展示公平，所有渠道均根据其<strong>最新成功抓取更新的时间</strong>自动排序。</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col relative">
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={() => setSearchQuery("")}
          searchPlaceholder="搜索渠道名称或类型..."
        />
        
        {/* Mobile Card Layout */}
        <div className="flex flex-col gap-3 md:hidden mt-4">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((channel) => (
              <div key={channel.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="font-bold text-gray-900 text-[15px]">{channel.name}</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100/50 shrink-0">
                    {formatScraperType(channel.scraper_type)}
                  </span>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 mb-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                      {channel.productCount || 0} 件商品
                    </span>
                    <span suppressHydrationWarning>更新于 {getRelativeTime(channel.updated_at)}</span>
                  </div>
                  <ViewDetailsButton href={`/channels/${channel.id}`} variant="text" />
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
              未找到符合条件的渠道
            </div>
          )}
        </div>

        {/* Desktop Table Layout */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative mt-4">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">渠道名称</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">系统类型</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">收录商品数</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">收录时间</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap">最近更新</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredChannels.length > 0 ? (
                  filteredChannels.map((channel) => (
                    <tr key={channel.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{channel.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100/50">
                          {formatScraperType(channel.scraper_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                          {channel.productCount || 0} 件
                        </span>
                      </td>
                      <td suppressHydrationWarning className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {getRelativeTime(channel.created_at)}
                      </td>
                      <td suppressHydrationWarning className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {getRelativeTime(channel.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                        <ViewDetailsButton href={`/channels/${channel.id}`} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <div className="text-lg mb-2">未找到符合条件的渠道</div>
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
    </div>
  );
};
