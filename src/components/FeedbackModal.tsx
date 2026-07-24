"use client";

import React, { useTransition } from 'react';
import { X } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  productName: string;
  channelName: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose, 
  offerId, 
  productName, 
  channelName 
}) => {
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleFeedbackSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      // @ts-ignore
      const { submitFeedback } = await import('@/app/actions');
      const res = await submitFeedback(formData);
      if (res.success) {
        alert('反馈提交成功，感谢您的协助！');
        onClose();
      } else {
        alert(res.error || '提交失败');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">渠道反馈</h3>
          <button 
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form 
          className="space-y-4" 
          onSubmit={handleFeedbackSubmit}
        >
          <input type="hidden" name="offer_id" value={offerId} />
          <div className="rounded-lg bg-gray-50 p-4 mb-2 space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">您正在反馈的商品：</p>
              <p className="font-medium text-gray-900">{productName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">所属渠道：</p>
              <p className="font-medium text-gray-900">{channelName}</p>
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
              onClick={onClose}
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
  );
};
