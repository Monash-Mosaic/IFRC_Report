import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { NextIntlClientProvider } from 'next-intl';
import { getDirection } from '@/i18n/helper';
import localFont from 'next/font/local';
import './globals.css';

const bespokeSerif = localFont({
  src: [
    {
      path: './fonts/BespokeSerif-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/BespokeSerif-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: './fonts/BespokeSerif-Extrabold.woff2',
      weight: '800',
      style: 'normal',
    },
    {
      path: './fonts/BespokeSerif-ExtraboldItalic.woff2',
      weight: '800',
      style: 'italic',
    },
  ],
  display: 'swap',
  variable: '--font-bespoke-serif', // Add this!
});

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
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${bespokeSerif.variable} locale-${locale} antialiased`}
      >
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
