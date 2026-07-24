'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;
  className?: string;
  iconClassName?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ href, className = "h-9 w-9 md:h-12 md:w-12", iconClassName = "h-4 w-4 md:h-5 md:w-5" }) => {
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
