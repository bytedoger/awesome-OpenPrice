import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface BuyDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doNotRemind: boolean) => void;
}

export const BuyDisclaimerModal: React.FC<BuyDisclaimerModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [doNotRemindToday, setDoNotRemindToday] = useState(false);

  // Reset checkbox state when modal opens
  useEffect(() => {
    if (isOpen) {
      setDoNotRemindToday(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">免责与跳转提示</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              本平台仅作为独立的渠道聚合与信息展示工具。
              <br /><br />
              <strong className="text-gray-900 font-medium">商品细节、交付内容、售后规则及最终解释权仍以原店铺为准。</strong> 请在购买前仔细甄别风险。
            </p>
          </div>
        </div>
        <div className="mt-4 mb-2">
          <label className="flex items-center gap-2 cursor-pointer w-max pl-[56px]">
            <input 
              type="checkbox" 
              checked={doNotRemindToday}
              onChange={(e) => setDoNotRemindToday(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600 select-none">今日内不再弹出此提示</span>
          </label>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => onConfirm(doNotRemindToday)}
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            我知道了，继续前往
          </button>
        </div>
      </div>
    </div>
  );
};
