import * as Chapter02 from './chapter-02.mdx';

export const title = 'Rapport mondial sur les catastrophes 2025';

export const description =
  'Rapport annuel 2025 de la Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge, détaillant la réponse mondiale aux catastrophes et les efforts humanitaires.';

export const author = "Secrétariat de l'IFRC";

export const category = 'Rapport annuel';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const chapters = {
  'chapitre-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
  },
};

export const media = {
  'chapitre-02': {
    audios: [
      {
        id: "intro",
        name: "Chapitre 02 - Vue d'ensemble",
        duration: "02:31",
        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
      },
      {
        id: "section-1",
        name: "Section 1 : Principales conclusions",
        duration: "04:12",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
      }
    ],
    videos: [
      {
        id: "summary",
        name: "Résumé du chapitre",
        duration: "03:45",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM",
        thumbnail: "/window.svg"
      }
    ]
  }
};
