import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import SearchResultCard from '@/components/SearchResultCard';
import Breadcrumb from '@/components/Breadcrumb';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export const dynamic = 'force-dynamic';

// Mock search results data - same results regardless of search input
const mockSearchResults = [
  {
    id: 1,
    title:
      'Harmful Information and the Erosion of Trust in Humanitarian Response: the Role of Truth, Trust ...',
    highlight:
      'Confirmation Bias – Confirmation Bias refers to the tendency to seek out, favour and recall information that supports our existing beliefs, while ignoring or dismissing contradictory ...',
    href: '/reports/wdr25/chapter-02',
  },
  {
    id: 2,
    title: 'Trust: What is being lost',
    highlight:
      'Trust: What is being lost – Trust is grounded in expectations, involves vulnerability and builds gradually, yet once broken it may be lost completely. Rousseau et al. (1998) define trust as ...',
    href: '/reports/wdr25/chapter-02',
  },
  {
    id: 3,
    title: 'Trust, Misinformation and the Power of Local Connection in Crisis Response',
    highlight:
      "Misinformation – In today's increasingly connected world, misinformation, disinformation, and harmful speech pose serious threats to humanitarian access, public health and social cohesion. Understanding ...",
    href: '/reports/wdr25/chapter-02',
  },
];

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);

  // Get search query from URL params (for display purposes)
  const query = decodeURIComponent((await searchParams)?.q || '');

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
            {mockSearchResults.map((result) => (
              <SearchResultCard
                key={result.id}
                title={result.title}
                highlight={result.highlight}
                href={result.href}
              />
            ))}
          </div>

          {/* No results state - hidden for now since we're using mock data */}
          {mockSearchResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">{t('results.noResults')}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
