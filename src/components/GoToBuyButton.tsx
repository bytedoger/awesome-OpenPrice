import React from 'react';
import { ArrowRight } from 'lucide-react';

interface GoToBuyButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
  href?: string;
}

export const GoToBuyButton: React.FC<GoToBuyButtonProps> = ({ onClick, disabled, className = "", href }) => {
  const baseClasses = `inline-flex items-center justify-center gap-1 rounded-lg border border-emerald-500 px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
  
  if (href) {
    return (
      <a 
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={`${baseClasses} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        前往购买
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={baseClasses}
    >
      前往购买
      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
};
