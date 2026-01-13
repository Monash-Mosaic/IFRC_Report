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
      'Durante la COVID-19, había tanta información que me sentí perdido y no sabía en qué creer',
    name: 'Abdul M.',
    country: 'Afganistán',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 2,
    quote: 'Vivir en la era de la IA me asusta: ¿dónde está la verdad y dónde la desinformación?',
    name: 'Clair',
    country: 'Reino Unido',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 3,
    quote:
      'Ojalá tuviera una varita mágica que me ayudara a distinguir la desinformación de la verdad',
    name: 'Olga',
    country: 'Rusia',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 4,
    quote:
      'Las redes sociales difunden información falsa tan rápido que es difícil verificar qué es real antes de que sea demasiado tarde',
    name: 'María S.',
    country: 'Filipinas',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 5,
    quote:
      'En tiempos de desastre, la desinformación puede ser más peligrosa que el propio desastre',
    name: 'James K.',
    country: 'Kenia',
    avatar: '/avatar/avatar-1.svg',
  },
];

export const featuredVideos = [
  {
    id: 1,
    title: 'Subtítulo',
    description: 'Texto del cuerpo para añadir más información al subtítulo.',
    thumbnailSrc: '/wdr25/thumbnail1.png',
    thumbnailAlt: 'Miniatura del video destacado',
    url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
  },
  {
    id: 2,
    title: 'Subtítulo',
    description: 'Texto del cuerpo para desarrollar el punto principal.',
    thumbnailSrc: '/wdr25/thumbnail2.png',
    thumbnailAlt: 'Miniatura del video destacado',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export const chapters = {
  'chapter-02': {
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
