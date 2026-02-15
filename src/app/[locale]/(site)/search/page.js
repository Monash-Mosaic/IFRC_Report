import { getTranslations } from 'next-intl/server';
import SearchResultCard from '@/components/SearchResultCard';
import { searchDocuments } from '@/lib/search/sqlite-search';

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
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';
  const limit = resolvedSearchParams?.limit || '20';

  const t = await getTranslations({
    namespace: 'SearchPage',
    locale,
  });

  // Only search if we have a query
  const searchResults = query.trim()
    ? await searchDocuments({
        locale,
        query: decodeURIComponent(query.trim()),
        limit: parseInt(limit, 10),
      })
    : [];

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
