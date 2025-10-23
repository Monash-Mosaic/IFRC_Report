import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr', 'zh', 'ar', 'ru'],
  defaultLocale: 'en',
  pathnames: {
    '/reports': {
      en: '/reports',
      fr: '/reports',
      zh: '/报告',
      ar: '/تقارير',
      ru: '/отчеты',
    },
    '/reports/[report]': {
      en: '/reports/[report]',
      fr: '/reports/[report]',
      zh: '/报告/[report]',
      ar: '/تقارير/[report]',
      ru: '/отчеты/[report]',
    },
    '/reports/[report]/[chapter]': {
      en: '/reports/[report]/[chapter]',
      fr: '/reports/[report]/[chapter]',
      zh: '/报告/[report]/[chapter]',
      ar: '/تقارير/[report]/[chapter]',
      ru: '/отчеты/[report]/[chapter]',
    },
  },
});
