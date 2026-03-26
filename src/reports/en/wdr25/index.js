import * as Synthesis from './exec-summary.mdx';
import * as Acronyms from './acronyms.mdx';
import * as Introduction from './introduction.mdx';
import * as Chapter01 from './chapter-01.mdx';
import * as Chapter02 from './chapter-02.mdx';
import * as Chapter05 from './chapter-05.mdx';
import * as Chapter03 from './chapter-03.mdx';
import * as Chapter04 from './chapter-04.mdx';
import * as Chapter06 from './chapter-06.mdx';
import * as Chapter07 from './chapter-07.mdx';
import * as Chapter08 from './chapter-08.mdx';
import * as Glossary from './glossary.mdx';

export const title = 'World \n Disaster\n Report\n\n 2026';

export const description =
  "The International Federation of Red Cross and Red Crescent Societies' Annual Report for 2025, detailing global disaster response and humanitarian efforts.";

export const author = 'IFRC Secretariat';

export const category = 'Annual Report';

export const releaseDate = new Date('2025-11-15');

const fullReportUrl = 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_FullReport_EN.pdf';

export const reportFile = {
  url: fullReportUrl,
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
    title: 'World Disasters Report 2026: Truth, Trust and Humanitarian Action in the Age of Harmful Information',
    description: `The International Federation of Red Cross and Red Crescent Societies (IFRC) launches the World Disasters Report 2026: Truth, Trust and Humanitarian Action in the Age of Harmful Information.

In a world where rumours can spread faster than rescue teams, harmful information has become a defining challenge for humanitarian action. The 2026 edition of the World Disasters Report frames harmful information as a de facto humanitarian crisis — one that undermines access to aid, erodes trust, destabilizes social cohesion and increases risks for staff, volunteers and communities.

Across eight chapters, the Report examines how misinformation, disinformation and dehumanizing narratives are reshaping disaster response, public health emergencies, migration and conflict. It brings together insights from nearly 100 contributors, 60 organizations and over 30 Red Cross and Red Crescent National Societies, grounded in real-world case studies and community perspectives from around the globe.

For the first time, the Report presents a typology of harm, mapping the physical, psychological, societal and operational impacts of harmful information. It explores how these harms disrupt preparedness, response and recovery — and why responding to them is no longer optional.

The World Disasters Report 2026 goes beyond analysis. It provides practical recommendations for humanitarian actors, governments, technology platforms and communities to strengthen information resilience, safeguard principled humanitarian action and rebuild trust.

In today's emergencies, information can determine access, safety and dignity.`,
    url: 'https://www.youtube.com/watch?v=jaoy6Wgi5qg',
  },
  {
    id: 2,
    title: 'Truth, Trust and Humanitarian Action: The World Disasters Report 2026',
    description: `The World Disasters Report 2026 explores one of the most urgent challenges facing humanitarian action today: harmful information.

From disasters and health emergencies to migration and conflict, harmful information is reshaping crises—affecting who is trusted, who receives help, and who is left at risk.

Drawing on insights from more than 100 contributors and Red Cross and Red Crescent National Societies worldwide, the report introduces a new framework for understanding how harmful information causes physical, psychological, societal and operational harm.

For the first time, the report is accompanied by an innovative interactive playbook, allowing readers to explore chapters online, highlight and share insights, access lived experiences and multimedia content, and navigate the report in a more dynamic way.

Beyond analysis, the report provides practical recommendations to help safeguard humanitarian principles, protect humanitarian workers and rebuild trust in times of crisis.

Because today, information can determine access, safety and dignity.`,
    url: 'https://youtu.be/nabMyC5cVrU',
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
    thumbnail: '/wdr25/chapters/Synthesis.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  acronyms: {
    metadata: {
      chapterKey: 'acronyms',
      chapterNumber: -1,
      chapterPrefix: 'Acronyms',
    },
    component: Acronyms.default,
    title: Acronyms.title,
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
    thumbnail: '/wdr25/chapters/Intro.webp',
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
    thumbnail: '/wdr25/chapters/Chapter1.webp',
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
    thumbnail: '/wdr25/chapters/Chapter2.webp',
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
      chapterPrefix: 'Chapter 03',
    },
    component: Chapter03.default,
    title: Chapter03.title,
    subtitle: Chapter03.subtitle,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter03_EN.pdf',
    tableOfContents: Chapter03.tableOfContents,
    thumbnail: '/wdr25/chapters/Chapter3.webp',
    thumbnailOverlay: 'blue',
    released: true,
  },
  'chapter-04': {
    metadata: {
      chapterKey: 'chapter-04',
      chapterNumber: 4,
      chapterPrefix: 'Chapter 04',
    },
    component: Chapter04.default,
    title: Chapter04.title,
    subtitle: Chapter04.subtitle,
    tableOfContents: Chapter04.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter04_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter4.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-05': {
    metadata: {
      chapterKey: 'chapter-05',
      chapterNumber: 5,
      chapterPrefix: 'Chapter 05',
    },
    component: Chapter05.default,
    title: Chapter05.title,
    subtitle: Chapter05.subtitle,
    tableOfContents: Chapter05.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter05_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter5.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-06': {
    metadata: {
      chapterKey: 'chapter-06',
      chapterNumber: 6,
      chapterPrefix: 'Chapter 06',
    },
    component: Chapter06.default,
    title: Chapter06.title,
    subtitle: Chapter06.subtitle,
    tableOfContents: Chapter06.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter06_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter6.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-07': {
    metadata: {
      chapterKey: 'chapter-07',
      chapterNumber: 7,
      chapterPrefix: 'Chapter 07',
    },
    component: Chapter07.default,
    title: Chapter07.title,
    subtitle: Chapter07.subtitle,
    tableOfContents: Chapter07.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Chapter07_EN.pdf',
    thumbnail: '/wdr25/chapters/Chapter7.webp',
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
    thumbnail: '/wdr25/chapters/Chapter8.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  glossary: {
    metadata: {
      chapterKey: 'glossary',
      chapterNumber: 9,
      chapterPrefix: 'Annex 1',
    },
    component: Glossary.default,
    title: Glossary.title,
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
