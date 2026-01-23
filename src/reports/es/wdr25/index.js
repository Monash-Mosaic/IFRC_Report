import * as Chapter02 from './chapter-02.mdx';

export const title = 'Informe Mundial sobre Desastres 2025';

export const description =
  'Informe Anual 2025 de la Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja, que detalla la respuesta global ante desastres y los esfuerzos humanitarios.';

export const author = 'Secretariado de la FICR';

export const category = 'Informe Anual';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const testimonialsList = [
  {
    id: 1,
    quote:
      'False information is particularly effective when it originates within the circle of people you trust, a serious problem since the very ties that bind communities together can make them susceptible to misinformation and its harmful consequences.',
    name: 'Abdul M.',
    country: 'Afghanistan',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 2,
    quote:
      'Trust is anchored on CEA pillars. when communities have a way of reaching out to people passing information for their views and perspectives to be heard and corrected, it slowly builds trust on the messengers.',
    name: 'Clair',
    country: 'UK',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 3,
    quote:
      'You need to understand that when we are dealing with false information, it means that some real disaster situations are being ignored, and people who truly need rescue are being neglected. This is an extremely serious issue.',
    name: 'Olga',
    country: 'Russia',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 4,
    quote:
      'Moi, je pense que le canal qui peut être le plus favorable pour faire passer un message dans notre communauté, c’est de face à face, aller au pied des gens, les rencontrer en personne, parce que c’est difficile de rassembler les personnes dans notre communauté, comme les gens sont généralement occupés. Et même au niveau de la télé, tout le monde ne regarde pas les informations, certains se divertissent tout simplement. Je pense que c’est mieux d’aller au pied des gens, les rencontrer dans les différentes maisons et leur faire passer l’information.',
    name: 'Maria S.',
    country: 'Philippines',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 5,
    quote:
      'Rumors stop with the wise. With skills and abilities, we can address the issue. While other teams were retreating, we could continue rescuing people because we knew how to handle it.',
    name: 'James K.',
    country: 'Kenya',
    avatar: '/avatar/avatar-1.svg',
  },
];

export const featuredVideos = [
  {
    id: 1,
    title: 'Guía Rápida para tu Aplicación Limitless',
    description:
      '¿Tienes problemas para solicitar Limitless? ¿No sabes por dónde empezar? No te preocupes. Zikomo está aquí para contarte cómo, por qué y dónde solicitar la Academia de Innovación Juvenil IFRC Limitless 2024',
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: 'Sumérgete en la localización de la ayuda — Una iniciativa inclusiva',
    description:
      'En este episodio, Victoire de la Cruz Roja de Camerún analiza la importancia de involucrar a la población local en la implementación de acciones humanitarias en comunidades vulnerables a través de la participación de la población local.',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapters = {
  'capitulo-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Capítulo 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: 'Capítulo 02 - Descripción general',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Sección 1: Hallazgos clave',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Resumen del capítulo',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
};
