import React from 'react';
import { Metadata } from 'next';
import { supabaseAdmin } from '../../lib/supabase-admin';
import { ChannelsClient } from './ChannelsClient';

export const revalidate = 300; // 每5分钟刷新一次静态缓存

export const metadata: Metadata = {
  title: '渠道商 - OpenPrice',
  description: '查看所有收录的活着的爬取渠道，获取最新的AI订阅和充值账号来源。',
};

export default async function ChannelsPage() {
  const { data: targets, error } = await supabaseAdmin
    .from('crawler_targets')
    .select('id, name, scraper_type, created_at, updated_at')
    .eq('is_active', true)
    .order('updated_at', { ascending: false });

  const { data: offers } = await supabaseAdmin
    .from('market_offers')
    .select('target_id')
    .eq('status', 'in_stock');

  if (error) {
    console.error('Error fetching active channels:', error);
  }

  const channelsWithCounts = (targets || []).map(target => {
    const productCount = (offers || []).filter(offer => offer.target_id === target.id).length;
    return { ...target, productCount };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ChannelsClient initialChannels={channelsWithCounts} />
    </div>
  );
}
