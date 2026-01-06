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

export const testimonialsList = [
  {
    "id": 1,
    "quote": "Pendant la COVID-19, il y avait tellement d'informations que je me sentais perdu et ne savais pas quoi croire",
    "name": "Abdul M.",
    "country": "Afghanistan",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdul&backgroundColor=b6e3f4&clothesColor=262e33"
  },
  {
    "id": 2,
    "quote": "Vivre à l'ère de l'IA me fait peur : où est la vérité et où est la désinformation",
    "name": "Claire",
    "country": "Royaume-Uni",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Clair&backgroundColor=ffd93d&clothesColor=3c4f5c"
  },
  {
    "id": 3,
    "quote": "J'aimerais avoir une baguette magique qui m'aiderait à distinguer la désinformation de la vérité",
    "name": "Marie",
    "country": "France",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga&backgroundColor=ffdfbf&clothesColor=929598"
  },
  {
    "id": 4,
    "quote": "Les réseaux sociaux propagent les fausses informations si rapidement qu'il devient difficile de vérifier ce qui est réel avant qu'il ne soit trop tard",
    "name": "Maria S.",
    "country": "Philippines",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=c0aede&clothesColor=65c9ff"
  },
  {
    "id": 5,
    "quote": "En temps de catastrophe, la désinformation peut être plus dangereuse que la catastrophe elle-même",
    "name": "James K.",
    "country": "Kenya",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=a7f3d0&clothesColor=83d0c9"
  }
];

export const featuredVideos = [
  {
    "id": 1,
    "title": "Sous-titre",
    "description": "Texte de corps pour tout ce que vous aimeriez ajouter au sous-titre.",
    "thumbnailSrc": "/wdr25/thumbnail1.png",
    "thumbnailAlt": "Miniature vidéo en vedette",
    "url": "https://www.youtube.com/watch?v=o8NiE3XMPrM"
  },
  {
    "id": 2,
    "title": "Sous-titre",
    "description": "Texte de corps pour tout ce que vous aimeriez développer sur le point principal.",
    "thumbnailSrc": "/wdr25/thumbnail2.png",
    "thumbnailAlt": "Miniature vidéo en vedette",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

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
