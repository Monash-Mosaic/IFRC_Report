import { GoogleTagManager } from '@next/third-parties/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getDirection } from '@/i18n/helper';
import { routing } from '@/i18n/routing';
import './globals.css';
import localFont from 'next/font/local';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'Metadata',
    locale,
  });
  return {
    title: {
      default: t('defaultTitle'),
      template: t('titleTemplate'),
    },
  };
}

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

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const dir = getDirection(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable}  ${bespokeSerif.variable} locale-${locale} antialiased`}
      >
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
