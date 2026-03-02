import * as WDR25 from './wdr25';

export const categories = [
  'Годовой отчет',
  'Стратегия',
  'DREF',
  'Экстренные обращения',
  'Управление при бедствиях',
  'Здоровье и уход',
  'Развитие национальных обществ',
  'Изменение климата',
  'Миграция',
  'Адвокация',
  'Другое',
];

export const acknowledgementContributors = {
  primary: [
    { src: '/contributors/wdr26-logotypes-03.svg', alt: 'Итальянский Красный Крест', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: 'Испанский Красный Крест', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: 'Американский Красный Крест', order: 1 },
    {
      src: '/contributors/wdr26-logotypes-05.svg',
      alt: 'Глобальный центр по обеспечению готовности к стихийным бедствиям',
      order: 2,
    },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: 'Австралийский Красный Крест', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: 'Австрийский Красный Крест', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: 'Канадский Красный Крест', order: 5 },
  ],
  tertiary: [
    { src: '/contributors/wdr26-logotypes-09.svg', alt: 'Шведский Красный Крест', order: 1 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: 'Немецкий Красный Крест', order: 2 },
    {
      src: '/contributors/wdr26-logotypes-11.svg',
      alt: 'Японское общество Красного Креста',
      order: 3,
    },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: 'Финский Красный Крест', order: 4 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: 'Датский Красный Крест', order: 5 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: 'Швейцарский Красный Крест', order: 6 },
    {
      src: '/contributors/wdr26-logotypes-15.svg',
      alt: 'Правительство Австралии – DFAT',
      order: 7,
    },
  ],
};

export const reports = {
  wdr25: WDR25,
};
