import React from 'react';
import { ProductType } from '../data';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MasterTableProps {
  products: ProductType[];
}

export const MasterTable: React.FC<MasterTableProps> = ({ products }) => {
  const router = useRouter();
  
  // Group products by platform and preserve order
  const platformsOrder = Array.from(new Set(products.map(p => p.platform)));
  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.platform]) acc[product.platform] = [];
    acc[product.platform].push(product);
    return acc;
  }, {} as Record<string, ProductType[]>);
  
  const getRelativeTime = (timeStr: string | null) => {
    if (!timeStr) return '暂无更新';
    // 如果是带 T 的标准 ISO 格式，直接解析；如果是普通的 YYYY-MM-DD HH:mm:ss 则替换横杠以兼容老版 Safari
    const time = timeStr.includes('T') 
      ? new Date(timeStr).getTime() 
      : new Date(timeStr.replace(/-/g, '/')).getTime();
    if (isNaN(time)) return timeStr; // fallback in case it's already formatted
    const now = Date.now();
    const diff = Math.max(0, now - time);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}天前`;
    if (hours > 0) return `${hours}小时前`;
    if (mins > 0) return `${mins}分钟前`;
    return '刚刚';
  };
  
  return (
    <div className="flex flex-col gap-8">
      {platformsOrder.map((platform, index) => (
        <div key={platform} className="flex flex-col gap-8">
          
          {/* Platform Title and Divider Outside the Table */}
          <div className="flex items-center gap-4 px-1">
            <span className="font-bold text-brand-dark text-xl tracking-wide shrink-0">{platform}</span>
            <div className="h-[2px] flex-1 bg-brand-dark/50 rounded-full"></div>
          </div>

          <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200">
            
            {/* 电脑端：表格视图 (中等屏幕及以上显示) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th scope="col" className="w-[6%] px-6 py-4 font-semibold text-gray-900">ID</th>
                    <th scope="col" className="w-[10%] px-6 py-4 font-semibold text-gray-900">平台</th>
                    <th scope="col" className="w-[40%] px-6 py-4 font-semibold text-gray-900">标准商品</th>
                    <th scope="col" className="w-[10%] px-6 py-4 font-semibold text-gray-900">最低价</th>
                    <th scope="col" className="w-[10%] px-6 py-4 font-semibold text-gray-900">在售渠道</th>
                    <th scope="col" className="w-[10%] px-6 py-4 font-semibold text-gray-900">最近更新</th>
                    <th scope="col" className="w-[14%] px-6 py-4 font-semibold text-gray-900 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {groupedProducts[platform].map((product) => (
                    <tr 
                      key={product.id}
                      className="even:bg-gray-50/60 hover:bg-blue-50/40 transition-colors cursor-pointer group border-b border-gray-50 last:border-0"
                      onClick={() => router.push(`/card-products/${product.slug}`)}
                    >
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.display_id || '-'}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{product.platform}</td>
                      <td className="px-6 py-4 text-gray-600">{product.name}</td>
                      <td className="px-6 py-4 text-emerald-600 font-medium">¥{product.lowestPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-600">{product.channelCount}</td>
                      <td suppressHydrationWarning className="px-6 py-4 text-gray-500 text-xs">{getRelativeTime(product.updatedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/card-products/${product.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white"
                        >
                          查看详情
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 手机端：卡片视图 (小屏幕显示) */}
            <div className="block md:hidden flex flex-col divide-y divide-gray-100">
              {groupedProducts[platform].map((product) => (
                <div 
                  key={product.id} 
                  className="p-4 active:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/card-products/${product.slug}`)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 leading-snug pr-4">{product.name}</h3>
                    <span className="text-emerald-600 font-bold whitespace-nowrap">¥{product.lowestPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-500 mb-3 mt-2">
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">在售: {product.channelCount}</span>
                    <span suppressHydrationWarning className="text-gray-400">{getRelativeTime(product.updatedAt)}</span>
                  </div>
                  <div className="flex justify-end mt-1">
                     <Link 
                        href={`/card-products/${product.slug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        查看详情 <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      ))}
      
      {products.length === 0 && (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100">
          没有找到对应的商品
        </div>
      )}
    </div>
  );
};
