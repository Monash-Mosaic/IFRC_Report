import * as Chapter02 from './chapter-02.mdx';

export const title = 'World Disaster Report 2025';

export const description =
  "The International Federation of Red Cross and Red Crescent Societies' Annual Report for 2025, detailing global disaster response and humanitarian efforts.";

export const author = 'IFRC Secretariat';

export const category = 'Annual Report';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const chapters = {
  'chapter-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
  },
};

export const media = {
  'chapter-02': {
    audios: [
      {
        id: "intro",
        name: "Chapter 02 - Overview",
        duration: "02:31",
        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
      },
      {
        id: "section-1",
        name: "Section 1: Key Findings",
        duration: "04:12",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
      }
    ],
    videos: [
      {
        id: "summary",
        name: "Chapter Summary",
        duration: "03:45",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM",
        thumbnail: "/window.svg"
      }
    ]
  }
};
