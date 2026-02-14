import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import SearchResultCard from '@/components/SearchResultCard';
import Breadcrumb from '@/components/Breadcrumb';
import { searchDocuments } from '@/lib/search/flexsearch';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export const dynamic = 'force-dynamic';

export default async function SearchEngineResultPage({ params, searchParams }) {
  const { locale } = await params;
  const { q: query = '', limit = '20' } = await searchParams;
  const t = await getTranslations('SearchPage', locale);
  const searchResults = await searchDocuments({
        locale,
        query: decodeURIComponent(query.trim()),
        limit: parseInt(limit, 10),
      });

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-full md:max-w-8/10 py-4 mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb
          ariaLabel={t('breadcrumb.ariaLabel')}
          homeLabel={t('breadcrumb.home')}
          items={[{ label: t('breadcrumb.searchPage') }]}
        />

        {/* Search Results */}
        <section aria-label={t('results.ariaLabel')}>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <SearchResultCard
                key={result.id}
                title={result.title}
                highlight={result.highlight}
                href={result.href}
              />
            ))}
          </div>

          {searchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('results.noResults')}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
