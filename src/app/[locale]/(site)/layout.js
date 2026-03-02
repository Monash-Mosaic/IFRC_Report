import { Suspense } from 'react';
import { routing } from '@/i18n/routing';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function SiteLayout({ params, children }) {
  const { locale } = await params;
  return (
    <>
      <Header locale={locale} />
      {children}
      <Footer />
    </>
  );
}
