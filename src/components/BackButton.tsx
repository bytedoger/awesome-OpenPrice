'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  className?: string;
  iconClassName?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ href, className = "h-12 w-12", iconClassName = "h-5 w-5" }) => {
  const router = useRouter();

  const handleBack = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(href);
    }
  };

  return (
    <button 
      onClick={handleBack}
      className={`group flex shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:shadow-md border border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white ${className}`}
      aria-label="返回"
    >
      <ArrowLeft className={iconClassName} />
    </button>
  );
};
