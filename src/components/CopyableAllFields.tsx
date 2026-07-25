"use client";

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyableAllFields() {
  const [copied, setCopied] = useState(false);

  const textToCopy = `关键字段说明：
1. name (必填): 商品标题，尽量清晰准确。
2. url (必填): 指向该商品的直达详情页 URL。
3. price (必填): 商品的售价，纯数字（如 145.00）。
4. priceCurrency (必填): 货币单位，只支持CNY、USD。
5. availability (必填): 库存状态。有货: https://schema.org/InStock，缺货: https://schema.org/OutOfStock
6. inventoryLevel (选填): 具体库存数量（类型为 QuantitativeValue）。提供此项可以让平台显示具体的剩余库存。`;

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-100"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>复制说明</span>
        </>
      )}
    </button>
  );
}
