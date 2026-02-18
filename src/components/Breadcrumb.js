import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Home, ChevronRight, ChevronLeft } from 'lucide-react';
import { isRtlLocale } from '@/i18n/helper';
import 'server-only';

/**
 * Breadcrumb component for navigation
 * @param {Object} props
 * @param {string} props.ariaLabel - Accessible label for the nav element
 * @param {string} props.homeLabel - Label for the home link
 * @param {Array<{label: string, href?: string}>} props.items - Breadcrumb items (last item has no href)
 */
export default async function Breadcrumb({ locale, ariaLabel = '', items = [] }) {
  const t = await getTranslations({
    namespace: 'Breadcrumb',
    locale,
  });
  const isRtl = isRtlLocale(locale);
  return (
    <nav aria-label={ariaLabel} className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            href="/"
            className="text-red-600 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            {isRtl ?  <ChevronLeft className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            {item.href ? (
              <Link href={item.href} className="text-red-600 hover:text-red-700 transition-colors">
                {item.key ? t(item.key) : item.label}
              </Link>
            ) : (
              <span className="text-red-600 font-medium">{item.key ? t(item.key) : item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
