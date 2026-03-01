import * as WDR25 from './wdr25';

export const categories = [
  'التقرير السنوي',
  'استراتيجية',
  'صندوق الإغاثة في حالات الكوارث (DREF)',
  'نداءات الطوارئ',
  'إدارة الكوارث',
  'الصحة والرعاية',
  'تطوير الجمعية الوطنية',
  'تغير المناخ',
  'الهجرة',
  'المناصرة',
  'أخرى',
];

export const acknowledgementContributors = {
  primary: [
    { src: '/contributors/wdr26-logotypes-03.svg', alt: 'الصليب الأحمر الإيطالي', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: 'الصليب الأحمر الإسباني', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: 'الصليب الأحمر الأمريكي', order: 1 },
    {
      src: '/contributors/wdr26-logotypes-05.svg',
      alt: 'مركز التأهب للكوارث العالمي',
      order: 2,
    },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: 'الصليب الأحمر الأسترالي', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: 'الصليب الأحمر النمساوي', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: 'الصليب الأحمر الكندي', order: 5 },
  ],
  tertiary: [
    { src: '/contributors/wdr26-logotypes-09.svg', alt: 'الصليب الأحمر السويدي', order: 1 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: 'الصليب الأحمر الألماني', order: 2 },
    { src: '/contributors/wdr26-logotypes-11.svg', alt: 'جمعية الصليب الأحمر الياباني', order: 3 },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: 'الصليب الأحمر الفنلندي', order: 4 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: 'الصليب الأحمر الدنماركي', order: 5 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: 'الصليب الأحمر السويسري', order: 6 },
    {
      src: '/contributors/wdr26-logotypes-15.svg',
      alt: 'الحكومة الأسترالية – وزارة الخارجية والتجارة',
      order: 7,
    },
  ],
};

export const reports = {
  wdr25: WDR25,
};
