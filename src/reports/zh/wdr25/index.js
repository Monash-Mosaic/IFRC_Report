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

export const testimonialsList = [
  {
    "id": 1,
    "quote": "在COVID-19期间，信息太多了，我感到迷茫，不知道该相信什么",
    "name": "阿卜杜勒 M.",
    "country": "阿富汗",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdul&backgroundColor=b6e3f4&clothesColor=262e33"
  },
  {
    "id": 2,
    "quote": "在AI时代生活让我害怕：哪里是真相，哪里是错误信息",
    "name": "克莱尔",
    "country": "英国",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Clair&backgroundColor=ffd93d&clothesColor=3c4f5c"
  },
  {
    "id": 3,
    "quote": "我希望有一根魔法棒能帮助我区分错误信息和真相",
    "name": "王丽",
    "country": "中国",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Wang&backgroundColor=ffdfbf&clothesColor=929598"
  },
  {
    "id": 4,
    "quote": "社交媒体传播虚假信息如此之快，以至于在为时已晚之前很难验证什么是真的",
    "name": "玛丽亚 S.",
    "country": "菲律宾",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=c0aede&clothesColor=65c9ff"
  },
  {
    "id": 5,
    "quote": "在灾难期间，错误信息可能比灾难本身更危险",
    "name": "詹姆斯 K.",
    "country": "肯尼亚",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=a7f3d0&clothesColor=83d0c9"
  }
];

export const featuredVideos = [
  {
    "id": 1,
    "title": "副标题",
    "description": "您想要添加到副标题中的所有内容的正文。",
    "thumbnailSrc": "/wdr25/thumbnail1.png",
    "thumbnailAlt": "精选视频缩略图",
    "url": "https://www.youtube.com/watch?v=o8NiE3XMPrM"
  },
  {
    "id": 2,
    "title": "副标题",
    "description": "您想要在要点中详细说明的所有内容的正文。",
    "thumbnailSrc": "/wdr25/thumbnail2.png",
    "thumbnailAlt": "精选视频缩略图",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

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
