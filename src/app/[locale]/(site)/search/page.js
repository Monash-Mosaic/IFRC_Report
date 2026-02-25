import { getTranslations } from 'next-intl/server';
import SearchResultCard from '@/components/SearchResultCard';
import { searchDocuments } from '@/lib/search/flexsearch';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function SearchEngineResultPage({ params, searchParams }) {
  const { locale } = await params;
  const { q: query = '', limit = '20' } = await searchParams;

  const t = await getTranslations({
    namespace: 'SearchPage',
    locale,
  });

  const searchResults = await searchDocuments({
        locale,
        query: decodeURIComponent(query.trim()),
        limit: parseInt(limit, 10),
      });

  return (
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
  );
}
