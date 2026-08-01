import { Metadata } from 'next';
import React from 'react';
import { DEFAULT_SHARE_IMAGE } from '@/lib/site';

const title = 'OpenPrice | 卡网渠道AI订阅价格汇总';
const description = '获取Claude 、ChatGPT、Gemini、Grok、cursor、谷歌邮箱、接码、住宅代理等卡网源头渠道报价，收录Claude成品号、Claude代付、Claude订阅、ChatGPT成品号、ChatGPT日抛、ChatGPT代付、ChatGPT订阅等 AI 订阅的多渠道价格';

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
