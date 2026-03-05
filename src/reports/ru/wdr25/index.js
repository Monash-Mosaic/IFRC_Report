import * as Chapter02 from './chapter-02.mdx';
import * as Synthesis from './exec-summary.mdx';

export const title = 'Всемирный доклад о бедствиях 2026';

export const description =
  'Годовой отчет Международной федерации обществ Красного Креста и Красного Полумесяца за 2025 год, с подробным описанием глобального реагирования на бедствия и гуманитарной деятельности.';

export const author = 'Секретариат IFRC';

export const category = 'Годовой отчет';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  // url: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_FullReport_EN.pdf',
  // size: 19_389_263,
};

export const testimonialsList = [
  {
    id: 1,
    quote:
      'False information is particularly effective when it originates within the circle of people you trust, a serious problem since the very ties that bind communities together can make them susceptible to misinformation and its harmful consequences.',
  },
  {
    id: 2,
    quote:
      'Trust is anchored on CEA pillars. when communities have a way of reaching out to people passing information for their views and perspectives to be heard and corrected, it slowly builds trust on the messengers.',
  },
  {
    id: 3,
    quote:
      'You need to understand that when we are dealing with false information, it means that some real disaster situations are being ignored, and people who truly need rescue are being neglected. This is an extremely serious issue.',
  },
  {
    id: 4,
    quote:
      'Les rumeurs érodent la confiance: la propagation rapide d’informations trompeuses crée de la confusion, amène certains à douter des autorités, et complique la relation entre les communautés et ceux qui les soutiennent.',
  },
  {
    id: 5,
    quote:
      'Rumors stop with the wise. With skills and abilities, we can address the issue. While other teams were retreating, we could continue rescuing people because we knew how to handle it.',
  },
];

export const featuredVideos = [
  {
    id: 1,
    title: 'World Disasters Report 2026: Truth, Trust and Humanitarian Action in the Age of Harmful Information',
    description:
      'The International Federation of Red Cross and Red Crescent Societies (IFRC) launches the World Disasters Report 2026: Truth, Trust and Humanitarian Action in the Age of Harmful Information.',
    url: 'https://www.youtube.com/watch?v=jaoy6Wgi5qg',
  },
  {
    id: 2,
    title: 'World Disasters Report 2026',
    description: 'World Disasters Report 2026',
    url: 'https://youtu.be/nabMyC5cVrU',
  },
];

export const chapterRelease = false;

export const chapters = {
  Синтез: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: 0,
      chapterPrefix: 'Синтез',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink:
      'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_FullReport_EN.pdf',
  },
  'глава-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Глава 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: 'Глава 02 - Обзор',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Раздел 1: Ключевые выводы',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Краткое изложение главы',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
};
