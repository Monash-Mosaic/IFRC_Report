import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'zh', 'ar', 'ru', 'es'],
  defaultLocale: 'en',
  pathnames: {
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
    '/coming-soon': {
      en: '/coming-soon',
      fr: '/à-venir',
      zh: '/敬请期待',
      ar: '/قريباً',
      ru: '/скоро',
      es: '/próximamente',
    },
  },
  alternateLinks: false, // We handle alternate links manually in HTML head
  localeCookie: false, // Use URL to determine locale avoid international regulations on cookie issues
});
