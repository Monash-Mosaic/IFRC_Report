import * as Chapter02 from './chapter-02.mdx';

export const title = 'تقرير الكوارث العالمي 2025';

export const description =
  'التقرير السنوي للاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر لعام 2025، الذي يستعرض الاستجابة العالمية للكوارث والجهود الإنسانية.';

export const author = 'أمانة الاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر';

export const category = 'تقرير سنوي';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const chapters = {
  'الفصل-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
  },
};
