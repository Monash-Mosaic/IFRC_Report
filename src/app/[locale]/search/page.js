import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import SearchResultCard from '@/components/SearchResultCard';
import { Home, ChevronRight } from 'lucide-react';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);
  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Mock search results data - same results regardless of search input
const mockSearchResults = [
  {
    id: 1,
    title:
      'Harmful Information and the Erosion of Trust in Humanitarian Response: the Role of Truth, Trust ...',
    excerpt:
      'Confirmation Bias – Confirmation Bias refers to the tendency to seek out, favour and recall information that supports our existing beliefs, while ignoring or dismissing contradictory ...',
    href: '/reports/wdr25/chapter-02',
  },
  {
    id: 2,
    title: 'Trust: What is being lost',
    excerpt:
      'Trust: What is being lost – Trust is grounded in expectations, involves vulnerability and builds gradually, yet once broken it may be lost completely. Rousseau et al. (1998) define trust as ...',
    href: '/reports/wdr25/chapter-02',
  },
  {
    id: 3,
    title: 'Trust, Misinformation and the Power of Local Connection in Crisis Response',
    excerpt:
      "Misinformation – In today's increasingly connected world, misinformation, disinformation, and harmful speech pose serious threats to humanitarian access, public health and social cohesion. Understanding ...",
    href: '/reports/wdr25/chapter-02',
  },
];

export default async function SearchPage({ params, searchParams }) {
  const { locale } = await params;
  const t = await getTranslations('SearchPage', locale);

  // Get search query from URL params (for display purposes)
  const query = (await searchParams)?.q || '';

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
            {mockSearchResults.map((result) => (
              <SearchResultCard
                key={result.id}
                title={result.title}
                excerpt={result.excerpt}
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
