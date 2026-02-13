import * as WDR25 from './wdr25';

export const categories = [
  'Rapport annuel',
  'Stratégie',
  'DREF',
  "Appels d'urgence",
  'Gestion des catastrophes',
  'Santé et soins',
  'Développement des Sociétés nationales',
  'Changement climatique',
  'Migration',
  'Plaidoyer',
  'Autre',
];

export const acknowledgementContributors = {
  primary: [
    { src: '/contributors/wdr26-logotypes-03.svg', alt: 'Croix-Rouge italienne', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: 'Croix-Rouge espagnole', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: 'Croix-Rouge américaine', order: 1 },
    { src: '/contributors/wdr26-logotypes-05.svg', alt: 'Centre mondial de préparation aux catastrophes', order: 2 },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: 'Croix-Rouge australienne', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: 'Croix-Rouge autrichienne', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: 'Croix-Rouge canadienne', order: 5 },
    { src: '/contributors/wdr26-logotypes-09.svg', alt: 'Croix-Rouge suédoise', order: 6 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: 'Croix-Rouge allemande', order: 7 },
    { src: '/contributors/wdr26-logotypes-11.svg', alt: 'Société de la Croix-Rouge du Japon', order: 8 },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: 'Croix-Rouge danoise', order: 9 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: 'Croix-Rouge suisse', order: 10 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: 'Gouvernement australien – DFAT', order: 11 },
  ],
  tertiary: [],
};

export const reports = {
  wdr25: WDR25,
};
