import Breadcrumb from '@/components/Breadcrumb';
import { routing } from '@/i18n/routing';
import { getTranslations } from 'next-intl/server';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function SearchPageLayout({ params, children }){
  const { locale } = await params;
  const t = await getTranslations({
    namespace: 'SearchPage',
    locale,
  });

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-full md:max-w-8/10 py-4 mx-auto px-4">
        <Breadcrumb
          locale={locale}
          items={[{ label: t('breadcrumb.searchPage') }]}
        />
        {children}
      </main>
    </div>);
}