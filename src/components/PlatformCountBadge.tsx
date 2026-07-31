import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface PlatformCountBadgeProps {
  count: number;
  prefix?: string;
  suffix?: string;
  href?: string;
}

export function PlatformCountBadge({ count, prefix = '已收录', suffix = '个渠道商', href }: PlatformCountBadgeProps) {
  if (count === 0) return null;

  const content = (
    <>
      <span className="relative flex h-2 w-2 mr-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      {prefix} <span className="text-yellow-400 text-lg font-bold mx-1.5">{count}</span> {suffix}
      {href && <ArrowRight className="ml-1.5 h-4 w-4" />}
    </>
  );

  const className = "absolute top-0 right-0 sm:top-8 sm:right-8 flex items-center text-sm font-medium text-white bg-emerald-600 px-4 py-2 rounded-full shadow-md transition-all hover:bg-emerald-700 z-10 border border-emerald-500";

  return href ? (
    <Link href={href} className={`${className} cursor-pointer`} aria-label={`查看${count}个渠道商`}>
      {content}
    </Link>
  ) : (
    <div className={`${className} cursor-default`}>
      {content}
    </div>
  );
}
