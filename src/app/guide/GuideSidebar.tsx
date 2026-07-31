"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, CheckCircle, Star, ChevronRight, Scale } from 'lucide-react';

const NAV_SECTIONS = [
  {
    name: '用户指南',
    items: [
      { name: '官方订阅与卡网渠道', href: '/guide/official-vs-card-products', icon: Scale },
    ],
  },
  {
    name: '渠道商指南',
    items: [
      { name: '如何被收录', href: '/guide/getting-started', icon: CheckCircle },
      { name: '获取更好的展示', href: '/guide/best-practices', icon: Star },
    ],
  },
];

export function GuideSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <div className="sticky top-24">
        <Link
          href="/guide"
          className={`group mb-5 flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
            pathname === '/guide'
              ? 'bg-emerald-50 font-semibold text-emerald-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <span className="flex items-center gap-3">
            <BookOpen className={`h-5 w-5 ${pathname === '/guide' ? 'text-emerald-600' : 'text-gray-400'}`} />
            指南首页
          </span>
          {pathname === '/guide' && <ChevronRight className="h-4 w-4 text-emerald-500" />}
        </Link>

        <div className="space-y-6">
          {NAV_SECTIONS.map(section => (
            <section key={section.name}>
              <h2 className="mb-2 px-3 text-xs font-bold tracking-wider text-gray-400">
                {section.name}
              </h2>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 ${
                          isActive
                            ? 'bg-emerald-50 font-semibold text-emerald-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                          {item.name}
                        </span>
                        {isActive && <ChevronRight className="h-4 w-4 text-emerald-500" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </nav>
  );
}
