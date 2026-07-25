"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, Star, ChevronRight } from 'lucide-react';

const NAV_ITEMS = [
  { name: '如何被收录', href: '/guide/getting-started', icon: CheckCircle },
  { name: '获取更好的展示', href: '/guide/best-practices', icon: Star },
];

export function GuideSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <div className="sticky top-24">
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase mb-4 px-3">
          指南
        </h2>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span>{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-emerald-500" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
