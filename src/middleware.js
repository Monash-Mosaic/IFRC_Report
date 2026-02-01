import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';

import { routing } from './i18n/routing';
import { getPathname } from './i18n/navigation';
import { isLocaleReleased } from './reports/release';

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request) {
  const { pathname } = request.nextUrl;
  const locale = routing.locales
        .find((locale) => pathname.startsWith(`/${locale}`)) || routing.defaultLocale;
  const homePath = `/${locale}`;
  const isHome = pathname === homePath;
  const comingSoonPath = `${homePath}/coming-soon`;
  const isComingSoon = pathname === comingSoonPath;

  if (!isLocaleReleased(locale) && !isComingSoon) {
    const url = request.nextUrl.clone();
    url.pathname = comingSoonPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (isLocaleReleased(locale) && isComingSoon && !isHome) {
    const url = request.nextUrl.clone();
    url.pathname = homePath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|icon|apple-icon|apple-touch-icon|opengraph-image|.*\\..*).*)',
};
