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
    title: 'Краткое руководство по подаче заявки в Limitless',
    description:
      'У вас возникли проблемы с подачей заявки на программу Limitless? Не знаете, с чего начать? Не беспокойтесь. Zikomo расскажет вам, как, почему и куда подавать заявку в Академию инноваций для молодежи IFRC Limitless 2024',
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: 'Погружение в локализацию помощи — Инклюзивная инициатива',
    description:
      'В этом эпизоде Виктуар из Красного Креста Камеруна обсуждает важность вовлечения местного населения в реализацию гуманитарных действий в уязвимых сообществах через участие местных жителей.',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapters = {
  'синтез': {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: null,
      chapterPrefix: 'Синтез',
    },
    component: Chapter02.default,
    title: 'Правда, доверие и гуманитарная деятельность в эпоху вредоносной информации',
    subtitle: null,
    tableOfContents: [],
    thumbnail: '/wdr25/chapters/Synthesis.jpg',
    thumbnailOverlay: 'red',
    released: true,
  },
};
