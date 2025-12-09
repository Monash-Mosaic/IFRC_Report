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
    tableOfContents: Chapter02.tableOfContents,
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
    ],
  },
};

export const landingPage = {
  heroSection: {
    title: 'Всемирный отчет о катастрофах',
    description: 'Всемирный отчет о катастрофах является флагманской публикацией Международной федерации обществ Красного Креста и Красного Полумесяца, предназначенной для стимулирования политических изменений, формирования мышления и укрепления практики в гуманитарном секторе. Это издание сосредоточено на вредной информации в гуманитарных контекстах.',
    buttonTexts: {
      read: 'Читать отчет',
      download: 'Скачать отчет',
      share: 'Поделиться'
    }
  },
  
  executiveSummary: {
    title: 'Исполнительное резюме',
    subtitle: 'В критической точке: Противодействие вредной информации, защита человечества',
    description: 'В критической точке: Противодействие вредной информации, защита человечества',
    buttonTexts: {
      read: 'Читать',
      download: 'Скачать'
    }
  },

  featuredVideos: {
    title: 'Избранные видео со всего мира',
    videos: [
      {
        id: 1,
        title: "Подзаголовок",
        description: "Основной текст для всего, что вы хотели бы добавить к подзаголовку.",
        thumbnailSrc: "/landing-page/thumbnail1.png",
        thumbnailAlt: "Миниатюра избранного видео",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM"
      },
      {
        id: 2,
        title: "Подзаголовок",
        description: "Основной текст для всего, что вы хотели бы расширить по основной теме.",
        thumbnailSrc: "/landing-page/thumbnail2.png",
        thumbnailAlt: "Миниатюра избранного видео",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },

  testimonials: {
    title: "Цитаты и Жизненный Опыт",
    testimonialsList: [
      {
        id: 1,
        quote: "Во время COVID-19 было так много информации, что я чувствовал себя потерянным и не знал, чему верить",
        name: "Абдул М.",
        country: "Афганистан"
      },
      {
        id: 2,
        quote: "Жизнь в эпоху ИИ пугает меня: где правда, а где дезинформация",
        name: "Клэр",
        country: "Великобритания"
      },
      {
        id: 3,
        quote: "Я бы хотел иметь волшебную палочку, которая помогла бы мне отличить дезинформацию от правды",
        name: "Ольга",
        country: "Россия"
      }
    ]
  }
};
