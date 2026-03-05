import * as Synthesis from './exec-summary.mdx';
import * as Chapter01 from './chapter-01.mdx';
import * as Chapter02 from './chapter-02.mdx';
export const title = 'تقرير الكوارث العالمي 2026';

export const description =
  'التقرير السنوي للاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر لعام 2025، الذي يستعرض الاستجابة العالمية للكوارث والجهود الإنسانية.';

export const author = 'أمانة الاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر';

export const category = 'تقرير سنوي';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  // TODO: Update with the full report file details
  // url: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Synthesis_AR.pdf',
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
  تركيب: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: 0,
      chapterPrefix: 'تركيب',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Synthesis_AR.pdf',
    thumbnail: '/wdr25/chapters/Synthesis.jpg',
    thumbnailOverlay: 'red',
    released: true,
  },
  'الفصل-01': {
    metadata: {
      chapterKey: 'chapter-01',
      chapterNumber: 1,
      chapterPrefix: 'الفصل 01',
    },
    component: Chapter01.default,
    title: Chapter01.title,
    subtitle: Chapter01.subtitle,
    tableOfContents: Chapter01.tableOfContents,
    audios: [],
    videos: [],
  },
  'الفصل-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'الفصل 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: 'الفصل 02 - نظرة عامة',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'القسم 1: النتائج الرئيسية',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'ملخص الفصل',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
};
