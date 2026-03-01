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
    { src: '/contributors/wdr26-logotypes-03.svg', alt: 'Italian Red Cross', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: 'Spanish Red Cross', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: 'American Red Cross', order: 1 },
    { src: '/contributors/wdr26-logotypes-05.svg', alt: 'Global Disaster Preparedness Center', order: 2 },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: 'Australian Red Cross', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: 'Austrian Red Cross', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: 'Canadian Red Cross', order: 5 },
    { src: '/contributors/wdr26-logotypes-09.svg', alt: 'Swedish Red Cross', order: 6 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: 'German Red Cross', order: 7 },
    { src: '/contributors/wdr26-logotypes-11.svg', alt: 'Japanese Red Cross Society', order: 8 },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: 'Danish Red Cross', order: 9 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: 'Swiss Red Cross', order: 10 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: 'Australian Government – DFAT', order: 11 },
  ],
  tertiary: [],
};

export const reports = {
  wdr25: WDR25,
};
