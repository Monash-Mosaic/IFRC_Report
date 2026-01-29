import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import SearchResultCard from '@/components/SearchResultCard';
import { Home, ChevronRight } from 'lucide-react';
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
        <nav aria-label={t('breadcrumb.ariaLabel')} className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
              >
                <Home className="w-4 h-4" />
                {t('breadcrumb.home')}
              </Link>
            </li>
            <li>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <span className="text-red-600 font-medium">{t('breadcrumb.searchPage')}</span>
            </li>
          </ol>
        </nav>

        {/* Search Results */}
        <section aria-label={t('results.ariaLabel')}>
          <div className="space-y-4">
            {searchResults.map((result) => (
              <SearchResultCard
                key={result.id}
                title={result.title}
                excerpt={result.excerpt}
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
