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
    tableOfContents: Chapter02.tableOfContents,
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
    ],
  },
};

export const landingPage = {
  heroSection: {
    title: 'Rapport mondial sur les catastrophes',
    description: 'Le Rapport mondial sur les catastrophes est la publication phare de la Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge (IFRC), conçue pour impulser le changement politique, façonner la réflexion et renforcer la pratique dans le secteur humanitaire. Cette édition se concentre sur les informations nuisibles dans les contextes humanitaires.',
    buttonTexts: {
      read: 'Lire le rapport',
      download: 'Télécharger le rapport',
      share: 'Partager'
    }
  },
  
  executiveSummary: {
    title: 'Résumé exécutif',
    subtitle: 'Au point de crise : Lutter contre les informations nuisibles, défendre l\'humanité',
    description: 'Au point de crise : Lutter contre les informations nuisibles, défendre l\'humanité',
    buttonTexts: {
      read: 'Lire',
      download: 'Télécharger'
    }
  },

  featuredVideos: {
    title: 'Vidéos en vedette du monde entier',
    videos: [
      {
        id: 1,
        title: "Sous-titre",
        description: "Texte corporel pour tout ce que vous aimeriez ajouter au sous-titre.",
        thumbnailSrc: "/landing-page/thumbnail1.png",
        thumbnailAlt: "Miniature vidéo en vedette",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM"
      },
      {
        id: 2,
        title: "Sous-titre",
        description: "Texte corporel pour tout ce que vous aimeriez développer sur le point principal.",
        thumbnailSrc: "/landing-page/thumbnail2.png",
        thumbnailAlt: "Miniature vidéo en vedette",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },

  testimonials: {
    title: "Citations et Expériences Vécues",
    testimonialsList: [
      {
        id: 1,
        quote: "Pendant COVID-19, il y avait tellement d'informations que je me sentais perdu et ne savais pas quoi croire",
        name: "Abdul M.",
        country: "Afghanistan"
      },
      {
        id: 2,
        quote: "Vivre à l'ère de l'IA me fait peur : où est la vérité et où est la désinformation",
        name: "Clair",
        country: "Royaume-Uni"
      },
      {
        id: 3,
        quote: "J'aimerais avoir une baguette magique qui m'aiderait à distinguer la désinformation et la vérité",
        name: "Olga",
        country: "Russie"
      }
    ]
  }
};
