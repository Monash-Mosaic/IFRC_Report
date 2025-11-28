import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import LocaleSwitcher from '@/components/LocaleSwitcher';

export async function generateMetadata({ params, searchParams }) {
	const { locale } = await params;
	// Reuse generic copy if dedicated Search messages are not available
	const t = await getTranslations('ReportListingPage', locale);
	return {
		title: `${t('search.label')} – IFRC Reports`,
		description: t('description'),
	};
}

export async function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }));
}

async function fetchResults(locale, q, limit = 20) {
	if (!q || q.trim().length === 0) return { query: q ?? '', results: [], total: 0 };
	try {
		const res = await fetch(
			`/api/v1/search?q=${encodeURIComponent(q)}&limit=${limit}&lang=${encodeURIComponent(
				locale
			)}`,
			{ cache: 'no-store' }
		);
		if (!res.ok) {
			// Return empty state but with the query preserved
			return { query: q, results: [], total: 0, error: `HTTP ${res.status}` };
		}
		return await res.json();
	} catch (e) {
		return { query: q, results: [], total: 0, error: e?.message || 'Search failed' };
	}
}

export default async function SearchPage({ params, searchParams }) {
	const { locale } = await params;
	const q = (await searchParams)?.q || '';
	const data = await fetchResults(locale, q);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Navigation */}
			<nav className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-4">
						<div className="flex items-center gap-3">
							<Link href="/">
								<Image src="/globe.svg" alt="IFRC Logo" width={40} height={40} className="w-10 h-10" />
							</Link>
							<span className="text-xl font-bold text-gray-900">IFRC Reports</span>
						</div>
						<div className="flex items-center gap-4">
							<LocaleSwitcher />
						</div>
					</div>
				</div>
			</nav>

			{/* Main */}
			<main className="px-4 sm:px-6 lg:px-8 py-10">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-3xl font-bold text-gray-900 mb-6">Search</h1>

					{/* Search form: GET to this page so URL carries the query */}
					<form action="" method="get" className="mb-6">
						<label htmlFor="q" className="sr-only">
							Search query
						</label>
						<div className="relative">
							<input
								id="q"
								name="q"
								type="text"
								defaultValue={q}
								placeholder="Search within the chapter..."
								className="w-full pl-4 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
							/>
							<button
								type="submit"
								className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors"
							>
								Search
							</button>
						</div>
					</form>

					{/* States */}
					{!q && (
						<div className="text-center py-16 text-gray-500 bg-white/60 rounded-lg border border-gray-200">
							Enter a keyword above to search the chapter content.
						</div>
					)}

					{q && data?.error && (
						<div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
							{data.error}
						</div>
					)}

					{q && !data?.error && (
						<div className="bg-white rounded-lg border border-gray-200">
							<div className="px-4 py-3 border-b text-sm text-gray-600">
								Found {data.total} result{data.total === 1 ? '' : 's'} for “{q}”
							</div>
							<ul className="divide-y">
								{data.results.map((r) => (
									<li key={r.id} className="p-4 hover:bg-gray-50">
										{r.heading && (
											<h3 className="font-semibold text-gray-900 mb-1">{r.heading}</h3>
										)}
										<p className="text-gray-700 text-sm leading-relaxed">{r.excerpt}</p>
										<div className="mt-2 text-xs text-gray-500">Section level: {r.level}</div>
									</li>
								))}
								{data.results.length === 0 && (
									<li className="p-8 text-center text-gray-500">No results found.</li>
								)}
							</ul>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}

