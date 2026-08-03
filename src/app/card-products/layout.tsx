import { Metadata } from 'next';
import React from 'react';
import { DEFAULT_SHARE_IMAGE } from '@/lib/site';

const title = 'AI订阅全网比价｜卡网渠道报价聚合 - OpenPrice';
const description = 'OpenPrice 提供卡网渠道报价聚合与 AI 订阅比价，覆盖 ChatGPT、Claude、Gemini、Grok、Cursor 等 AI 订阅，以及代充、成品号、接码、邮箱和账号等数字产品，是一站式 AI 订阅多渠道比价平台。';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/card-products' },
  openGraph: {
    title,
    description,
    url: '/card-products',
    type: 'website',
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    title,
    description,
    images: [DEFAULT_SHARE_IMAGE],
  },
};

export default function CardProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
