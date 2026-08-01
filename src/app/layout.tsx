import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { FloatingGithubBanner } from '../components/FloatingGithubBanner';
import { GoogleAnalytics } from '@next/third-parties/google';
import NextTopLoader from 'nextjs-toploader';
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from '../components/JsonLd';
import { DEFAULT_SHARE_IMAGE, SITE_URL, absoluteUrl } from '../lib/site';
import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'OpenPrice | 全网卡网渠道比价',
  description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取AI订阅的最低价',
  keywords: ['卡网', '比价', '账号购买', '充值渠道', 'ChatGPT', 'Netflix', 'Spotify'],
  openGraph: {
    title: 'OpenPrice | 全网卡网渠道比价',
    description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取AI订阅的最低价',
    url: '/',
    siteName: 'OpenPrice',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: DEFAULT_SHARE_IMAGE, width: 1200, height: 630, alt: 'OpenPrice 全网卡网渠道 AI 订阅比价' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenPrice | 全网卡网渠道比价',
    description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取AI订阅的最低价',
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
        <Analytics />
      </body>
    </html>
  );
}
