import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import './globals.css';
import { getDirection } from '@/i18n/helper';

export const metadata = {
  title: 'IFRC Reports',
  description: 'Welcome to the IFRC Report',
};

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
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
