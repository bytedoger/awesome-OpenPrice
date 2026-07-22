import { Header } from '../components/Header';
import { MobileNav } from '../components/MobileNav';
import { FloatingGithubBanner } from '../components/FloatingGithubBanner';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'OpenPrice | 全网卡网渠道比价',
  description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取价格最低的AI订阅',
  keywords: ['卡网', '比价', '账号购买', '充值渠道', 'ChatGPT', 'Netflix', 'Spotify'],
  openGraph: {
    title: 'OpenPrice | 全网卡网渠道比价',
    description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取最优价格最低的AI订阅',
    url: '/',
    siteName: 'OpenPrice',
    locale: 'zh_CN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OpenPrice | 全网卡网渠道比价',
    description: '开源的收录全网卡网渠道各种AI订阅价格的项目，打破信息差，获取最优价格最低的AI订阅',
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
        <NextTopLoader color="#10b981" showSpinner={false} shadow="0 0 10px #10b981,0 0 5px #10b981" />
        <Header />
        <div className="flex-1 pb-14 md:pb-0">
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
