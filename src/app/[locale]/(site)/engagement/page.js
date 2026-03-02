import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import EngagementClient from '@/components/engagement/EngagementClient';
import Breadcrumb from '@/components/Breadcrumb';
import DiscoverHero from '@/components/engagement/DiscoverHero';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Engagement',
};

export default async function EngagementPage({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ namespace: 'Engagement', locale });

  return (
    <div className="bg-white text-black min-h-screen">
      <section className="max-w-6xl mx-auto px-4 pt-4">
        <Breadcrumb locale={locale} items={[{ label: t('breadcrumbCurrent') }]} />
      </section>
      <DiscoverHero />
      <EngagementClient />
    </div>
  );
}
