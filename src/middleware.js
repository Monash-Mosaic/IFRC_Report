import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import LinkHeader from 'http-link-header';

import { routing } from './i18n/routing';
import { getPathname } from './i18n/navigation';
import { isLocaleReleased } from './reports/release';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const localeFromPath = routing.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  const locale = localeFromPath || routing.defaultLocale;
  const localeHomePath = localeFromPath ? `/${locale}` : '/';
  const isHome = pathname === localeHomePath || pathname === `${localeHomePath}/`;

  if (!isLocaleReleased(locale) && !isHome) {
    const url = request.nextUrl.clone();
    url.pathname = localeHomePath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|icon|apple-icon|apple-touch-icon|opengraph-image|.*\\..*).*)',
};
