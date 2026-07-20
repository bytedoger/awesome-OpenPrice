import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ViewDetailsButtonProps {
  href: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'outline' | 'text';
}

export const ViewDetailsButton: React.FC<ViewDetailsButtonProps> = ({ href, className = "", onClick, variant = 'outline' }) => {
  if (variant === 'text') {
    return (
      <Link 
        href={href}
        onClick={onClick}
        className={`inline-flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-700 ${className}`}
      >
        查看详情 <ArrowRight className="ml-1 h-4 w-4" />
      </Link>
    );
  }

  return (
    <Link 
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white ${className}`}
    >
      查看详情
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
};
