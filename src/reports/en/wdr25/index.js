import * as Synthesis from './exec-summary.mdx';
import * as Introduction from './introduction.mdx';
import * as Chapter01 from './chapter-01.mdx';
import * as Chapter02 from './chapter-02.mdx';
import * as Chapter06 from './chapter-06.mdx';
import * as Chapter07 from './chapter-07.mdx';
import * as Chapter08 from './chapter-08.mdx';

export const title = 'World \n Disaster\n Report\n\n 2026';

export const description =
  "The International Federation of Red Cross and Red Crescent Societies' Annual Report for 2025, detailing global disaster response and humanitarian efforts.";

export const author = 'IFRC Secretariat';

export const category = 'Annual Report';

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
    title: 'Quick Guide to Your Limitless Application',
    description:
      "Are you having trouble applying for Limitless? Do you not know where to start? Don't worry. Zikomo is here to tell you how, why and where to apply for the IFRC Limitless Youth Innovation Academy 2024",
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: 'Dive in the localisation of aid — An inclusive initiative',
    description:
      'In this episode, Victoire from Cameroon Red Cross discusses the significance of involving local people in implementing humanitarian action in vulnerable community through the involvement of local people.',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapterRelease = true;

export const chapters = {
  synthesis: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: -2,
      chapterPrefix: 'Synthesis',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Synthesis_EN.pdf',
    thumbnail: '/wdr25/chapters/Synthesis.jpg',
    thumbnailOverlay: 'red',
    released: true,
  },
  acronyms: {
    metadata: {
      chapterKey: 'acronyms',
      chapterNumber: -1,
      chapterPrefix: 'Acronyms',
    },
    title: 'Acronyms',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Acronyms_EN.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
  introduction: {
    metadata: {
      chapterKey: 'introduction',
      chapterNumber: 0,
      chapterPrefix: 'Introduction',
    },
    component: Introduction.default,
    title: Introduction.title,
    subtitle: Introduction.subtitle,
    tableOfContents: Introduction.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Introduction_EN.pdf',
    thumbnail: '/wdr25/chapters/Intro.jpg',
    thumbnailOverlay: 'blue',
    released: true,
  },
  'chapter-01': {
    metadata: {
      chapterKey: 'chapter-01',
      chapterNumber: 1,
      chapterPrefix: 'Chapter 01',
    },
    component: Chapter01.default,
    title: Chapter01.title,
    subtitle: Chapter01.subtitle,
    tableOfContents: Chapter01.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter01_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter1.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Chapter 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter02_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter2.png',
    released: true,
    audios: [
      {
        id: 'intro',
        name: 'Chapter 02 - Overview',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Section 1: Key Findings',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Chapter Summary',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
  'chapter-03': {
    metadata: {
      chapterKey: 'chapter-03',
      chapterNumber: 3,
      chapterPrefix: 'Chapter 3',
    },
    title: 'Global and Local: Dynamics of Harmful Information in a Connected World',
    subtitle: 'Harmful Narratives that Thrive',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter03_EN.pdf',
    tableOfContents: [],
    thumbnail: '/wdr25/chapters/Chapter3.png',
    thumbnailOverlay: 'blue',
    released: true,
  },
  'chapter-04': {
    metadata: {
      chapterKey: 'chapter-04',
      chapterNumber: 4,
      chapterPrefix: 'Chapter 4',
    },
    title:
      'From Context to Consequence: Humanitarian Sector Voices on the Impact of Harmful Information',
    subtitle: 'Harmful Information and Operational Realities',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter04_EN.pdf',
    tableOfContents: [],
    thumbnail: '/wdr25/chapters/Chapter4.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-05': {
    metadata: {
      chapterKey: 'chapter-05',
      chapterNumber: 5,
      chapterPrefix: 'Chapter 5',
    },
    title: 'Navigating Regulation, Rights and Societal Resilience',
    subtitle: 'Information Landscape and Humanitarian Contexts',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter05_EN.pdf',
    tableOfContents: [],
    thumbnail: '/wdr25/chapters/Chapter5.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-06': {
    metadata: {
      chapterKey: 'chapter-06',
      chapterNumber: 6,
      chapterPrefix: 'Chapter 6',
    },
    component: Chapter06.default,
    title: Chapter06.title,
    subtitle: Chapter06.subtitle,
    tableOfContents: Chapter06.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter06_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter6.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-07': {
    metadata: {
      chapterKey: 'chapter-07',
      chapterNumber: 7,
      chapterPrefix: 'Chapter 7',
    },
    component: Chapter07.default,
    title: Chapter07.title,
    subtitle: Chapter07.subtitle,
    tableOfContents: Chapter07.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter07_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter7.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-08': {
    metadata: {
      chapterKey: 'chapter-08',
      chapterNumber: 8,
      chapterPrefix: 'Chapter 08',
    },
    component: Chapter08.default,
    title: Chapter08.title,
    subtitle: Chapter08.subtitle,
    tableOfContents: Chapter08.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter08_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter8.png',
    thumbnailOverlay: 'red',
    released: true,
  },
  glossary: {
    metadata: {
      chapterKey: 'glossary',
      chapterNumber: 9,
      chapterPrefix: 'Glossary',
    },
    title: 'Glossary',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Glossary_EN.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
  annex2: {
    metadata: {
      chapterKey: 'annex2',
      chapterNumber: 10,
      chapterPrefix: 'Annex 2',
    },
    title: 'Annex 2',
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Annex2_EN.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
};
