'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Bug, Box, LogOut, DatabaseBackup, Inbox, MessageSquare, Layers } from 'lucide-react';
import { logoutAction } from '../actions';

const navigation = [
  { name: '数据总览', href: '/admin', icon: LayoutDashboard },
  { name: '用户提报', href: '/admin/submissions', icon: Inbox },
  { name: '爬虫渠道', href: '/admin/targets', icon: Bug },
  { name: '平台管理', href: '/admin/platforms', icon: Layers },
  { name: '商品目录', href: '/admin/catalog', icon: Box },
  { name: '报价审计', href: '/admin/offers', icon: DatabaseBackup },
  { name: '用户投诉', href: '/admin/feedbacks', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col fixed h-full z-10">
        <div className="p-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Bug className="w-6 h-6" />
            管理控制台
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/50 hover:text-gray-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-zinc-800">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-gray-600 dark:text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-500 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              退出登录
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center px-8 sticky top-0 z-10">
          <h2 className="text-sm font-medium text-gray-500 dark:text-zinc-400 tracking-wider">
            {navigation.find((item) => item.href === pathname)?.name || '控制台'}
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
