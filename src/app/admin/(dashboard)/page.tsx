import { supabaseAdmin } from '@/lib/supabase-admin';
import { Bug, Box, DatabaseBackup, Inbox, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Disable caching

export default async function AdminDashboardPage() {
  // Fetch counts from Supabase in parallel
  const [
    { count: targetsCount },
    { count: catalogCount },
    { count: offersCount },
    { count: pendingSubmissionsCount }
  ] = await Promise.all([
    supabaseAdmin.from('crawler_targets').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('product_catalog').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('market_offers').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('user_target_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending')
  ]);

  const stats = [
    {
      title: '活跃爬虫渠道',
      value: targetsCount || 0,
      icon: Bug,
      href: '/admin/targets',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
      title: '监控商品总数',
      value: catalogCount || 0,
      icon: Box,
      href: '/admin/catalog',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      title: '已采集报价',
      value: offersCount || 0,
      icon: DatabaseBackup,
      href: '/admin/offers',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
      title: '待审核提报',
      value: pendingSubmissionsCount || 0,
      icon: Inbox,
      href: '/admin/submissions',
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">数据总览</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-1">欢迎来到 OpenPrice 管理控制台，以下是您的系统实时运行状态。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.title} 
            className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 flex flex-col transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400">{stat.title}</h3>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stat.value.toLocaleString()}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <Link 
                href={stat.href} 
                className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                查看详情 
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
