import * as Chapter02 from './chapter-02.mdx';
import * as Synthesis from './exec-summary.mdx';

export const title = '国际红十字与红新月联合会 2025 年度报告';

export const description =
  '国际红十字与红新月联合会 2025 年度报告，详述全球灾害响应与人道救援工作。';

export const author = 'IFRC 秘书处';

export const category = '年度报告';

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
    title: 'Limitless 申请快速指南',
    description:
      '申请 Limitless 遇到问题了吗？不知道从哪里开始？别担心。Zikomo 在这里告诉你如何、为什么以及在哪里申请 2024 年 IFRC Limitless 青年创新学院',
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: '深入探讨援助本地化——一项包容性倡议',
    description:
      '在本期节目中，喀麦隆红十字会的 Victoire 讨论了通过当地人民的参与，让当地人民参与在脆弱社区实施人道主义行动的重要性。',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapters = {
  '合成': {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: 0,
      chapterPrefix: '合成',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink:
      'https://www.ifrc.org/sites/default/files/2021-05/20201116_WorldDisasters_Full.pdf',
  },
  '章节-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: '第02章',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: '第02章 - 概述',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: '第1节：主要发现',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: '章节摘要',
        duration: '03:45',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: '/window.svg',
      },
    ],
  },
};
