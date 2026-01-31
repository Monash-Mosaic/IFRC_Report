import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import { getDirection } from '@/i18n/helper';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { routing } from '@/i18n/routing';
import { getPathname } from '@/i18n/navigation';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const dir = getDirection(locale);
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
    /\/+$/,
    ''
  );
  const defaultLocale = routing.defaultLocale;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const defaultHref = new URL(getPathname({ locale: defaultLocale, href: '/' }), siteUrl).toString();

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="icon" href="/icon" sizes="512x512" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
        <link rel="sitemap" type="application/xml" href={`${siteUrl}/sitemap.xml`} />
        <link rel="alternate" hrefLang="x-default" href={defaultHref} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} locale-${locale} antialiased`}>
        <NextIntlClientProvider>
          <Header />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
