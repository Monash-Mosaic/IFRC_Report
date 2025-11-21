import * as Chapter02 from './chapter-02.mdx';

export const title = 'Всемирный доклад о бедствиях 2025';

export const description =
  'Годовой отчет Международной федерации обществ Красного Креста и Красного Полумесяца за 2025 год, с подробным описанием глобального реагирования на бедствия и гуманитарной деятельности.';

export const author = 'Секретариат IFRC';

export const category = 'Годовой отчет';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const chapters = {
  'глава-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
  },
};

export const media = {
  'глава-02': {
    audios: [
      {
        id: "intro",
        name: "Глава 02 - Обзор",
        duration: "02:31",
        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
      },
      {
        id: "section-1",
        name: "Раздел 1: Ключевые выводы",
        duration: "04:12",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
      }
    ],
    videos: [
      {
        id: "summary",
        name: "Краткое изложение главы",
        duration: "03:45",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM",
        thumbnail: "/window.svg"
      }
    ]
  }
};
