import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { FloatingGithubBanner } from '../components/FloatingGithubBanner';
import { GoogleAnalytics } from '@next/third-parties/google';
import NextTopLoader from 'nextjs-toploader';
import { JsonLd } from '../components/JsonLd';
import { DEFAULT_SHARE_IMAGE, SITE_URL, absoluteUrl } from '../lib/site';
import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'OpenPrice | AI订阅比价与卡网渠道价格聚合平台',
  description: 'OpenPrice 聚合 ChatGPT Plus、Claude Pro、Gemini、Grok、Cursor 等 AI 订阅的官方价格与卡网渠道报价，支持查询 AI 订阅价格、卡网渠道比价和实时低价。',
  keywords: ['AI订阅比价', 'AI订阅价格', '卡网渠道比价', 'ChatGPT Plus价格', 'Claude Pro价格', 'Gemini价格', 'Grok价格', 'Cursor价格', 'AI代充价格', '成品号价格'],
  openGraph: {
    title: 'OpenPrice | AI订阅比价与卡网渠道价格聚合平台',
    description: '聚合 ChatGPT Plus、Claude Pro、Gemini、Grok、Cursor 等 AI 订阅官方价格与卡网渠道报价，帮助用户查询和对比 AI 订阅价格。',
    url: '/',
    siteName: 'OpenPrice',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: DEFAULT_SHARE_IMAGE, width: 1200, height: 630, alt: 'OpenPrice 全网卡网渠道 AI 订阅比价' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenPrice | AI订阅比价与卡网渠道价格聚合平台',
    description: '聚合 ChatGPT Plus、Claude Pro、Gemini、Grok、Cursor 等 AI 订阅官方价格与卡网渠道报价，帮助用户查询和对比 AI 订阅价格。',
    images: [DEFAULT_SHARE_IMAGE],
  },
  icons: {
    icon: '/icon.svg?v=2',
  },
};

import { Footer } from '../components/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: 'OpenPrice',
            url: SITE_URL,
            logo: absoluteUrl('/icon.svg'),
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: 'OpenPrice',
            url: SITE_URL,
            inLanguage: 'zh-CN',
            publisher: { '@id': `${SITE_URL}/#organization` },
          },
        ]} />
        <NextTopLoader color="#10b981" showSpinner={false} shadow="0 0 10px #10b981,0 0 5px #10b981" />
        <Header />
        <div className="flex-1 pb-11 md:pb-0">
          {children}
        </div>
        <Footer />
        <MobileNav />
        <FloatingGithubBanner />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
