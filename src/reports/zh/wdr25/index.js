import * as Chapter02 from './chapter-02.mdx';

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

export const chapters = {
  '章节-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: "intro",
        name: "第02章 - 概述",
        duration: "02:31",
        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
      },
      {
        id: "section-1",
        name: "第1节：主要发现",
        duration: "04:12",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
      }
    ],
    videos: [
      {
        id: "summary",
        name: "章节摘要",
        duration: "03:45",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "/window.svg"
      }
    ],
  },
};

export const landingPage = {
  heroSection: {
    title: '世界灾难报告',
    description: '世界灾难报告是国际红十字与红新月联合会的旗舰出版物，旨在推动政策变化、塑造思维并加强人道主义部门的实践。本版重点关注人道主义背景下的有害信息。',
    buttonTexts: {
      read: '阅读报告',
      download: '下载报告',
      share: '分享'
    }
  },
  
  executiveSummary: {
    title: '执行摘要',
    subtitle: '危机时刻：对抗有害信息，捍卫人性',
    description: '危机时刻：对抗有害信息，捍卫人性',
    buttonTexts: {
      read: '阅读',
      download: '下载'
    }
  },

  featuredVideos: {
    title: '来自世界各地的精选视频',
    videos: [
      {
        id: 1,
        title: "副标题",
        description: "您想添加到副标题的正文文本。",
        thumbnailSrc: "/landing-page/thumbnail1.png",
        thumbnailAlt: "精选视频缩略图",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM"
      },
      {
        id: 2,
        title: "副标题",
        description: "您想要扩展主要观点的正文文本。",
        thumbnailSrc: "/landing-page/thumbnail2.png",
        thumbnailAlt: "精选视频缩略图",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },

  testimonials: {
    title: "引文和生活经验",
    testimonialsList: [
      {
        id: 1,
        quote: "在COVID-19期间，信息太多了，我感到迷失，不知道该相信什么",
        name: "阿卜杜勒·M.",
        country: "阿富汗"
      },
      {
        id: 2,
        quote: "生活在AI时代让我害怕：哪里是真相，哪里是错误信息",
        name: "克莱尔",
        country: "英国"
      },
      {
        id: 3,
        quote: "我希望有一根魔法棒来帮助我区分错误信息和真相",
        name: "奥尔加",
        country: "俄罗斯"
      }
    ]
  }
};
