import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { ChannelDetailClient } from './ChannelDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 600;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  const { data: channel } = await supabaseAdmin
    .from('crawler_targets')
    .select('name')
    .eq('id', id)
    .single();

  if (!channel) {
    return { title: '渠道未找到 - OpenPrice' };
  }

  return {
    title: `${channel.name} 渠道收录详情 - OpenPrice`,
    description: `查看 ${channel.name} 渠道收录的所有商品、分类及价格信息。`,
  };
}

export default async function ChannelDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  const { data: channel } = await supabaseAdmin
    .from('crawler_targets')
    .select('id, name, scraper_type, created_at, updated_at')
    .eq('id', id)
    .single();

  if (!channel) {
    notFound();
  }

  // Fetch offers for this channel
  const { data: offersData } = await supabaseAdmin
    .from('market_offers')
    .select('id, product_title, price, status, url, updated_at, product_catalog(name, product_platforms(name))')
    .eq('target_id', id)
    .eq('status', 'in_stock')
    .order('updated_at', { ascending: false });

  const mappedOffers = (offersData || []).map((offer: any) => {
    const platformData = offer.product_catalog?.product_platforms;
    const platformName = Array.isArray(platformData) ? platformData[0]?.name : platformData?.name;
    const category = offer.product_catalog?.name ? `${platformName || '未知平台'} - ${offer.product_catalog.name}` : '未分类';

    return {
      id: offer.id,
      title: offer.product_title,
      price: Number(offer.price || 0),
      url: offer.url,
      updatedAt: offer.updated_at,
      category,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <ChannelDetailClient channel={channel} offers={mappedOffers} />
    </div>
  );
}
