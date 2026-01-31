import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getDirection } from '@/i18n/helper';
import { routing } from '@/i18n/routing';
import './globals.css';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('Metadata', locale);
  return {
    title: {
      default: t('defaultTitle'),
      template: t('titleTemplate'),
    },
  };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const dir = getDirection(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={dir}>
      <body className={`${GeistSans.variable} ${GeistMono.variable} locale-${locale} antialiased`}>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
