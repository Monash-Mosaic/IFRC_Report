import { Link } from '@/i18n/navigation';

export default function SearchResultCard({ title, highlight, href }) {
  return (
    <Link href={href} className="block">
      <article className="bg-gray-100 rounded-lg p-6 hover:bg-gray-200 transition-colors cursor-pointer">
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 [&_em]:text-yellow-500" dangerouslySetInnerHTML={{ __html: excerpt }}/>
      </article>
    </Link>
  );
}
