import * as WDR25 from './wdr25';

export const categories = [
  'Annual Report',
  'Strategy',
  'DREF',
  'Emergency Appeals',
  'Disaster Management',
  'Health and Care',
  'National Society Development',
  'Climate Change',
  'Migration',
  'Advocacy',
  'Other',
];

export const acknowledgementContributors = {
  primary: [
    { src: '/contributors/wdr26-logotypes-03.svg', alt: 'Cruz Roja Italiana', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: 'Cruz Roja Española', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: 'Cruz Roja Americana', order: 1 },
    {
      src: '/contributors/wdr26-logotypes-05.svg',
      alt: 'Centro Global de Preparación para Desastres',
      order: 2,
    },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: 'Cruz Roja Australiana', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: 'Cruz Roja Austriaca', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: 'Cruz Roja Canadiense', order: 5 },
  ],
  tertiary: [
    { src: '/contributors/wdr26-logotypes-09.svg', alt: 'Cruz Roja Sueca', order: 1 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: 'Cruz Roja Alemana', order: 2 },
    {
      src: '/contributors/wdr26-logotypes-11.svg',
      alt: 'Sociedad de la Cruz Roja Japonesa',
      order: 3,
    },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: 'Cruz Roja Finlandesa', order: 4 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: 'Cruz Roja Danesa', order: 5 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: 'Cruz Roja Suiza', order: 6 },
    { src: '/contributors/wdr26-logotypes-15.svg', alt: 'Gobierno Australiano – DFAT', order: 7 },
  ],
};

export const reports = {
  wdr25: WDR25,
};
