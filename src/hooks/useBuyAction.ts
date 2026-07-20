import { useState } from 'react';

export function useBuyAction() {
  const [buyModalItem, setBuyModalItem] = useState<{ url?: string; channelName: string } | null>(null);

  const handleBuyClick = (url: string | undefined, channelName: string) => {
    const hideDate = localStorage.getItem('hideBuyDisclaimerDate');
    const today = new Date().toDateString();
    
    if (hideDate === today) {
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        alert(`正在为您跳转至渠道：${channelName}...`);
      }
    } else {
      setBuyModalItem({ url, channelName });
    }
  };

  const handleBuyConfirm = (doNotRemind: boolean) => {
    if (doNotRemind) {
      localStorage.setItem('hideBuyDisclaimerDate', new Date().toDateString());
    }
    if (buyModalItem) {
      if (buyModalItem.url) {
        window.open(buyModalItem.url, '_blank', 'noopener,noreferrer');
      } else {
        alert(`正在为您跳转至渠道：${buyModalItem.channelName}...`);
      }
    }
    setBuyModalItem(null);
  };

  const handleBuyCancel = () => {
    setBuyModalItem(null);
  };

  return {
    isBuyModalOpen: buyModalItem !== null,
    handleBuyClick,
    handleBuyConfirm,
    handleBuyCancel,
  };
}
