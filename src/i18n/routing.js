import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'zh', 'ar', 'ru', 'es'],
  defaultLocale: 'en',
  pathnames: {
    '/about': {
      en: '/about',
      fr: '/a-propos',
      zh: '/关于',
      ar: '/حول',
      ru: '/о-нас',
      es: '/acerca-de',
    },
    '/acknowledgement': {
      en: '/acknowledgement',
      fr: '/remerciements',
      zh: '/致谢',
      ar: '/الشكر-والتقدير',
      ru: '/благодарности',
      es: '/agradecimientos',
    },
    '/reports': {
      en: '/reports',
      fr: '/reports',
      zh: '/报告',
      ar: '/تقارير',
      ru: '/отчеты',
      es: '/reportaje ',
    },
    '/reports/[report]': {
      en: '/reports/[report]',
      fr: '/reports/[report]',
      zh: '/报告/[report]',
      ar: '/تقارير/[report]',
      ru: '/отчеты/[report]',
      es: '/reportaje/[report]',
    },
    '/reports/[report]/[chapter]': {
      en: '/reports/[report]/[chapter]',
      fr: '/reports/[report]/[chapter]',
      zh: '/报告/[report]/[chapter]',
      ar: '/تقارير/[report]/[chapter]',
      ru: '/отчеты/[report]/[chapter]',
      es: '/reportaje/[report]/[chapter]',
    },
    '/search': {
      en: '/search',
      fr: '/recherche',
      zh: '/搜索',
      ar: '/بحث',
      ru: '/поиск',
      es: '/buscar',
    },
  },
  alternateLinks: false, // We handle alternate links manually in HTML head
  localeCookie: false, // Use URL to determine locale avoid international regulations on cookie issues
});
