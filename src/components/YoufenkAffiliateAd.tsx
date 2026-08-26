'use client';

import Image from 'next/image';
import { useSyncExternalStore } from 'react';
import { ArrowUpRight, X } from 'lucide-react';

const YOUFENK_AFFILIATE_URL = 'https://www.youfenk.com/affiliate';
const YOUFENK_HORIZONTAL_IMAGE = '/images/ads/youfenk-affiliate-horizontal.webp';
const DISMISSED_STORAGE_KEY = 'openprice:youfenk-affiliate-ad-dismissed';
const DISMISSED_EVENT = 'openprice:youfenk-affiliate-ad-dismissed';
const AD_SLOTS = [1, 2, 3] as const;

let dismissedInMemory = false;

function subscribeToDismissal(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === DISMISSED_STORAGE_KEY) onStoreChange();
  };

  window.addEventListener(DISMISSED_EVENT, onStoreChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(DISMISSED_EVENT, onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function isAdVisible() {
  if (dismissedInMemory) return false;

  try {
    return sessionStorage.getItem(DISMISSED_STORAGE_KEY) !== 'true';
  } catch {
    return true;
  }
}

interface YoufenkAffiliateAdProps {
  className?: string;
}

function useAffiliateAdVisibility() {
  const isVisible = useSyncExternalStore(subscribeToDismissal, isAdVisible, () => true);

  const dismissAd = () => {
    dismissedInMemory = true;
    try {
      sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    } catch {
      // The in-memory flag still keeps the ad closed if storage is unavailable.
    }
    window.dispatchEvent(new Event(DISMISSED_EVENT));
  };

  return { isVisible, dismissAd };
}

interface AffiliateCardProps {
  slot: number;
  showAction?: boolean;
}

function AffiliateCard({ slot, showAction = false }: AffiliateCardProps) {
  if (slot !== 1) {
    return (
      <div
        aria-label={`广告位 ${slot} 招租`}
        className="overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-emerald-50/50"
      >
        <div className="flex aspect-[3/2] items-center justify-center px-4 text-center">
          <div>
            <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-gray-400 shadow-sm ring-1 ring-gray-200">
              广告位 {slot}
            </span>
            <p className="mt-3 text-base font-semibold text-gray-600">广告位招租</p>
            <p className="mt-1 text-xs text-gray-400">期待合作伙伴</p>
          </div>
        </div>
        {showAction && (
          <span className="block border-t border-dashed border-gray-300 px-3 py-2 text-center text-xs font-medium text-gray-400">
            广告位招租
          </span>
        )}
      </div>
    );
  }

  return (
    <a
      href={YOUFENK_AFFILIATE_URL}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label={`访问优粉库推广伙伴计划（广告位 ${slot}，在新窗口打开）`}
      className="group block overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      <Image
        src={YOUFENK_HORIZONTAL_IMAGE}
        width={1536}
        height={1024}
        sizes="(min-width: 1984px) 280px, (min-width: 768px) 33vw, calc(100vw - 2rem)"
        alt=""
        className="h-auto w-full bg-white"
      />
      {showAction && (
        <span className="flex items-center justify-between border-t border-emerald-100 px-3 py-2 text-xs font-semibold text-gray-800 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700">
          访问优粉库
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      )}
    </a>
  );
}

interface AffiliateHeaderProps {
  dismissAd: () => void;
}

function AffiliateHeader({ dismissAd }: AffiliateHeaderProps) {
  return (
    <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-medium text-gray-400">
      <span>合作推广</span>
      <span className="flex items-center gap-1.5">
        优粉库
        <button
          type="button"
          onClick={dismissAd}
          aria-label="关闭优粉库推广广告"
          title="关闭广告"
          className="rounded p-0.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </span>
    </div>
  );
}

export function YoufenkAffiliateAd({ className = '' }: YoufenkAffiliateAdProps) {
  const { isVisible, dismissAd } = useAffiliateAdVisibility();

  if (!isVisible) return null;

  return (
    <aside
      aria-label="优粉库合作推广"
      className={`max-w-[320px] ${className}`}
    >
      <div className="sticky top-28">
        <AffiliateHeader dismissAd={dismissAd} />
        <div className="flex flex-col gap-3">
          {AD_SLOTS.map((slot) => (
            <AffiliateCard key={slot} slot={slot} showAction />
          ))}
        </div>

        <p className="mt-2 px-1 text-center text-[10px] leading-relaxed text-gray-400">
          推广内容，与 OpenPrice 比价结果无关
        </p>
      </div>
    </aside>
  );
}

export function YoufenkAffiliateBanner({ className = '' }: YoufenkAffiliateAdProps) {
  const { isVisible, dismissAd } = useAffiliateAdVisibility();

  if (!isVisible) return null;

  return (
    <aside
      aria-label="优粉库合作推广横幅"
      className={`youfenk-affiliate-banner w-full ${className}`}
    >
      <AffiliateHeader dismissAd={dismissAd} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {AD_SLOTS.map((slot) => (
          <AffiliateCard key={slot} slot={slot} />
        ))}
      </div>
    </aside>
  );
}
