import { getTranslations } from 'next-intl/server';
import SearchAnalyticsEvents from '@/components/SearchAnalyticsEvents';
import SearchResultCard from '@/components/SearchResultCard';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getBaseUrl } from '@/lib/base-url';
import { searchDocuments } from '@/lib/search/flexsearch';

function decodeSearchQuery(rawQuery = '') {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return '';
  }

  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

function parseLimit(rawLimit = '10') {
  const parsed = Number.parseInt(rawLimit, 10);
  if (Number.isNaN(parsed)) {
    return 10;
  }

  return Math.max(0, parsed);
}

function toSearchPath(locale, query = '') {
  const path = getPathname({ locale, href: '/search' });
  if (!query) {
    return path;
  }

  const params = new URLSearchParams({ q: query });
  return `${path}?${params.toString()}`;
}

export async function generateMetadata({ params, searchParams }) {
  const { locale } = await params;
  const { q: rawQuery = '' } = (await searchParams) || {};
  const query = decodeSearchQuery(rawQuery);
  const t = await getTranslations({
    namespace: 'SearchPage',
    locale,
  });
  const title = `${t('meta.title')}: "${query}"`;
  const description = `${t('meta.description')}. "${query}"`;
  const canonical = new URL(getPathname({ locale, href: '/search' }), getBaseUrl()).toString();
  const image = new URL('/wdr25/ifrc_logo.jpg', getBaseUrl()).toString();

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      url: canonical,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const dynamic = 'force-dynamic';

export default async function SearchEngineResultPage({ params, searchParams }) {
  const { locale } = await params;
  const { q: rawQuery = '', limit = '10' } = (await searchParams) || {};
  const query = decodeSearchQuery(rawQuery);

  const t = await getTranslations({
    namespace: 'SearchPage',
    locale,
  });

  const searchResults = await searchDocuments({
    locale,
    query,
    limit: parseLimit(limit),
  });

  const searchPath = toSearchPath(locale, query);
  const searchJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SearchResultsPage',
    name: `${t('meta.title')}: "${query}"`,
    description: t('meta.description'),
    inLanguage: locale,
    url: new URL(searchPath, getBaseUrl()).toString(),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: searchResults.length,
      itemListElement: searchResults.map((result, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: new URL(result.href, getBaseUrl()).toString(),
        name: result.title,
      })),
    },
  };

  const analyticsItems = searchResults.map((result, index) => ({
    item_id: result.id || result.href,
    item_name: result.title,
    index: index + 1,
    item_category: 'search_result',
    item_variant: locale,
    item_url: result.href,
  }));

  return (
    <section aria-label={t('results.ariaLabel')}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchJsonLd) }}
      />
      <SearchAnalyticsEvents
        locale={locale}
        query={query}
        resultCount={searchResults.length}
        items={analyticsItems}
      />
      <div className="space-y-4">
        {searchResults.map((result, index) => (
          <SearchResultCard
            key={result.id}
            title={result.title}
            highlight={result.highlight}
            href={result.href}
            resultIndex={index + 1}
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
