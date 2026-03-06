import * as Chapter02 from './chapter-02.mdx';
import * as Synthesis from './exec-summary.mdx';

export const title = '红十字会与红新月会国际联合会 2026 年世界灾害报告';

export const description =
  '国际红十字与红新月联合会 2026 年度报告，详述全球灾害响应与人道救援工作。';

export const author = 'IFRC 秘书处';

export const category = '年度报告';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  // TODO: Update with the full report file details
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
    title: '2026年世界灾害报告：有害信息时代的真相、信任与人道行动',
    description: `国际红十字与红新月运动（IFRC）发布《2026年世界灾害报告：有害信息时代的真相、信任与人道行动》。

在一个谣言传播比救援队还快的世界里，有害信息已成为人道行动面临的关键挑战。《2026年世界灾害报告》将有害信息视为事实上的人道主义危机——它削弱获得援助的机会、侵蚀信任、破坏社会凝聚力，并增加工作人员、志愿者和社区面临的风险。

报告通过八个章节，探讨错误信息、虚假信息和去人性化叙事如何重塑灾害应对、突发公共卫生事件、移民与冲突。报告汇集了近100位撰稿人、60个组织和30多个国家红会与红新月会的见解，基于全球真实案例和社区视角。

报告首次提出伤害类型学，描绘有害信息对生理、心理、社会和行动层面的影响。报告探讨这些伤害如何破坏备灾、响应与恢复——以及为何应对它们已不再可选。

《2026年世界灾害报告》超越分析本身。它为人道行为体、政府、技术平台和社区提供实用建议，以加强信息韧性、维护有原则的人道行动并重建信任。

在当今的紧急状况中，信息可以决定获取、安全与尊严。`,
    url: 'https://www.youtube.com/watch?v=jaoy6Wgi5qg',
  },
  {
    id: 2,
    title: '真相、信任与人道行动：《2026年世界灾害报告》',
    description: `《2026年世界灾害报告》探讨当今人道行动面临的最紧迫挑战之一：有害信息。

从灾害和突发卫生事件到移民与冲突，有害信息正在重塑危机——影响谁被信任、谁获得帮助、谁被置于风险之中。

报告借鉴全球100多位撰稿人和各国红会与红新月会的见解，提出新的框架，以理解有害信息如何造成生理、心理、社会和行动层面的伤害。

报告首次配有创新的互动手册，使读者能够在线浏览章节、高亮与分享见解、获取亲历经验与多媒体内容，并以更动态的方式阅读报告。

除分析外，报告还提供实用建议，以维护人道原则、保护人道工作者并在危机时期重建信任。

因为今天，信息可以决定获取、安全与尊严。`,
    url: 'https://youtu.be/nabMyC5cVrU',
  },
];

export const chapterRelease = false;

export const chapters = {
  合成: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: 0,
      chapterPrefix: '综合报告',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    // downloadLink:
    //   'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_FullReport_EN.pdf',
    thumbnail: '/wdr25/chapters/Synthesis.webp',
    thumbnailOverlay: 'red',
    released: true,
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
