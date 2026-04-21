import * as Synthesis from './exec-summary.mdx';
import * as Acronyms from './acronyms.mdx';
import * as Introduction from './introduction.mdx';
import * as Chapter01 from './chapter-01.mdx';
import * as Chapter02 from './chapter-02.mdx';
import * as Chapter05 from './chapter-05.mdx';
import * as Chapter03 from './chapter-03.mdx';
import * as Chapter04 from './chapter-04.mdx';
import * as Chapter06 from './chapter-06.mdx';
import * as Chapter07 from './chapter-07.mdx';
import * as Chapter08 from './chapter-08.mdx';
import * as Glossary from './glossary.mdx';
import * as Annex02 from './annex-02.mdx';

export const title = 'Rapport mondial sur les catastrophes 2026';

export const description =
  'Rapport annuel 2026 de la Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge, détaillant la réponse mondiale aux catastrophes et les efforts humanitaires.';

export const author = "Secrétariat de l'IFRC";

export const category = 'Rapport annuel';

export const releaseDate = new Date('2026-03-26');

export const reportFile = {
  url: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_FullReport_FR.pdf',
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
    title: 'Rapport mondial sur les catastrophes 2026 : Vérité, confiance et action humanitaire à l\'ère de l\'information nocive',
    description: `La Fédération internationale des Sociétés de la Croix-Rouge et du Croissant-Rouge (FICR) présente le Rapport mondial sur les catastrophes 2026 : Vérité, confiance et action humanitaire à l'ère de l'information nocive.

Dans un monde où les rumeurs peuvent se propager plus vite que les équipes de secours, l'information nocive est devenue un défi majeur pour l'action humanitaire. L'édition 2026 du Rapport mondial sur les catastrophes présente l'information nocive comme une crise humanitaire de fait — qui compromet l'accès à l'aide, érode la confiance, déstabilise la cohésion sociale et accroît les risques pour le personnel, les volontaires et les communautés.

À travers huit chapitres, le Rapport examine comment la désinformation, les fausses nouvelles et les récits déshumanisants refaçonnent la réponse aux catastrophes, les urgences sanitaires, les migrations et les conflits. Il rassemble les points de vue de près de 100 contributeurs, 60 organisations et plus de 30 Sociétés nationales de la Croix-Rouge et du Croissant-Rouge, ancrés dans des études de cas réels et des perspectives communautaires du monde entier.

Pour la première fois, le Rapport présente une typologie des préjudices, cartographiant les impacts physiques, psychologiques, sociétaux et opérationnels de l'information nocive. Il explore comment ces préjudices perturbent la préparation, la réponse et le relèvement — et pourquoi y répondre n'est plus optionnel.

Le Rapport mondial sur les catastrophes 2026 va au-delà de l'analyse. Il fournit des recommandations pratiques aux acteurs humanitaires, aux gouvernements, aux plateformes technologiques et aux communautés pour renforcer la résilience informationnelle, sauvegarder l'action humanitaire fondée sur les principes et reconstruire la confiance.

Dans les urgences d'aujourd'hui, l'information peut déterminer l'accès, la sécurité et la dignité.`,
    url: 'https://www.youtube.com/watch?v=jaoy6Wgi5qg',
  },
  {
    id: 2,
    title: 'Vérité, confiance et action humanitaire : Rapport mondial sur les catastrophes 2026',
    description: `Le Rapport mondial sur les catastrophes 2026 explore l'un des défis les plus urgents auxquels l'action humanitaire est confrontée aujourd'hui : l'information nocive.

Des catastrophes et urgences sanitaires aux migrations et conflits, l'information nocive refaçonne les crises — en affectant qui fait confiance, qui reçoit de l'aide et qui est laissé en danger.

S'appuyant sur les points de vue de plus de 100 contributeurs et des Sociétés nationales de la Croix-Rouge et du Croissant-Rouge dans le monde, le rapport introduit un nouveau cadre pour comprendre comment l'information nocive cause des préjudices physiques, psychologiques, sociétaux et opérationnels.

Pour la première fois, le rapport est accompagné d'un guide interactif innovant, permettant aux lecteurs d'explorer les chapitres en ligne, de souligner et partager des points de vue, d'accéder à des expériences vécues et à du contenu multimédia, et de naviguer dans le rapport de manière plus dynamique.

Au-delà de l'analyse, le rapport fournit des recommandations pratiques pour sauvegarder les principes humanitaires, protéger les travailleurs humanitaires et reconstruire la confiance en temps de crise.

Car aujourd'hui, l'information peut déterminer l'accès, la sécurité et la dignité.`,
    url: 'https://youtu.be/nabMyC5cVrU',
  },
];

export const chapterRelease = true;

export const chapters = {
  synthèse: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: -2,
      chapterPrefix: 'Synthèse',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-02/WDR2026_Synthesis_FR.pdf',
    thumbnail: '/wdr25/chapters/Synthesis.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  acronymes: {
    metadata: {
      chapterKey: 'acronyms',
      chapterNumber: -1,
      chapterPrefix: 'Acronymes',
    },
    component: Acronyms.default,
    title: Acronyms.title,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Acronyms_FR.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
  introduction: {
    metadata: {
      chapterKey: 'introduction',
      chapterNumber: 0,
      chapterPrefix: 'Introduction',
    },
    component: Introduction.default,
    title: Introduction.title,
    subtitle: Introduction.subtitle,
    tableOfContents: Introduction.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Introduction_FR.pdf',
    thumbnail: '/wdr25/chapters/Intro.webp',
    thumbnailOverlay: 'blue',
    released: true,
  },
  'chapitre-01': {
    metadata: {
      chapterKey: 'chapter-01',
      chapterNumber: 1,
      chapterPrefix: 'Chapitre 01',
    },
    component: Chapter01.default,
    title: Chapter01.title,
    subtitle: Chapter01.subtitle,
    tableOfContents: Chapter01.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter01_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter1.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapitre-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Chapitre 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter02_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter2.webp',
    released: true,
    audios: [
      {
        id: 'intro',
        name: "Chapitre 02 - Vue d'ensemble",
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Section 1 : Principales conclusions',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Résumé du chapitre',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
  'chapitre-03': {
    metadata: {
      chapterKey: 'chapter-03',
      chapterNumber: 3,
      chapterPrefix: 'Chapitre 03',
    },
    component: Chapter03.default,
    title: Chapter03.title,
    subtitle: Chapter03.subtitle,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter03_FR.pdf',
    tableOfContents: Chapter03.tableOfContents,
    thumbnail: '/wdr25/chapters/Chapter3.webp',
    thumbnailOverlay: 'blue',
    released: true,
  },
  'chapitre-04': {
    metadata: {
      chapterKey: 'chapter-04',
      chapterNumber: 4,
      chapterPrefix: 'Chapitre 04',
    },
    component: Chapter04.default,
    title: Chapter04.title,
    subtitle: Chapter04.subtitle,
    tableOfContents: Chapter04.tableOfContents,
    sectionNumbers: Chapter04.sectionNumbers,
    tocTitle: Chapter04.tocTitle,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter04_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter4.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapitre-05': {
    metadata: {
      chapterKey: 'chapter-05',
      chapterNumber: 5,
      chapterPrefix: 'Chapitre 05',
    },
    component: Chapter05.default,
    title: Chapter05.title,
    subtitle: Chapter05.subtitle,
    tableOfContents: Chapter05.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter05_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter5.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapitre-06': {
    metadata: {
      chapterKey: 'chapter-06',
      chapterNumber: 6,
      chapterPrefix: 'Chapitre 06',
    },
    component: Chapter06.default,
    title: Chapter06.title,
    subtitle: Chapter06.subtitle,
    tableOfContents: Chapter06.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter06_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter6.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapitre-07': {
    metadata: {
      chapterKey: 'chapter-07',
      chapterNumber: 7,
      chapterPrefix: 'Chapitre 07',
    },
    component: Chapter07.default,
    title: Chapter07.title,
    subtitle: Chapter07.subtitle,
    tableOfContents: Chapter07.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter07_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter7.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapitre-08': {
    metadata: {
      chapterKey: 'chapter-08',
      chapterNumber: 8,
      chapterPrefix: 'Chapitre 08',
    },
    component: Chapter08.default,
    title: Chapter08.title,
    subtitle: Chapter08.subtitle,
    tableOfContents: Chapter08.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Chapter08_FR.pdf',
    thumbnail: '/wdr25/chapters/Chapter8.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  glossaire: {
    metadata: {
      chapterKey: 'glossary',
      chapterNumber: 9,
      chapterPrefix: 'Annexe 1',
    },
    component: Glossary.default,
    title: Glossary.title,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Glossary_FR.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
  annex2: {
    metadata: {
      chapterKey: 'annex2',
      chapterNumber: 10,
      chapterPrefix: 'Annexe 2',
    },
    component: Annex02.default,
    title: Annex02.title,
    tableOfContents: Annex02.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Annex2_FR.pdf',
    thumbnailOverlay: 'red',
    released: true,
  },
};
