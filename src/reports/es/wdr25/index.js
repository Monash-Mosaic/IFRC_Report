import * as Chapter02 from './chapter-02.mdx';
import * as Synthesis from './exec-summary.mdx';
export const title = 'Informe Mundial sobre Desastres 2026';

export const description =
  'Informe Anual 2025 de la Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja, que detalla la respuesta global ante desastres y los esfuerzos humanitarios.';

export const author = 'Secretariado de la FICR';

export const category = 'Informe Anual';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  // TODO: Update with the full report file details
  // url: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Synthesis_SP.pdf',
  // size: 19_389_263,
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
    title: 'Informe Mundial sobre Desastres 2026: Verdad, confianza y acción humanitaria en la era de la información perjudicial',
    description: `La Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja (FICR) presenta el Informe Mundial sobre Desastres 2026: Verdad, confianza y acción humanitaria en la era de la información perjudicial.

En un mundo donde los rumores pueden propagarse más rápido que los equipos de rescate, la información perjudicial se ha convertido en un desafío definitorio para la acción humanitaria. La edición 2026 del Informe Mundial sobre Desastres presenta la información perjudicial como una crisis humanitaria de hecho — una que socava el acceso a la ayuda, erosiona la confianza, desestabiliza la cohesión social y aumenta los riesgos para el personal, los voluntarios y las comunidades.

A lo largo de ocho capítulos, el Informe examina cómo la desinformación, las noticias falsas y las narrativas deshumanizadoras están reconfigurando la respuesta ante desastres, las emergencias de salud pública, la migración y los conflictos. Reúne las perspectivas de casi 100 colaboradores, 60 organizaciones y más de 30 Sociedades Nacionales de la Cruz Roja y de la Media Luna Roja, basadas en estudios de caso reales y perspectivas comunitarias de todo el mundo.

Por primera vez, el Informe presenta una tipología del daño, cartografiando los impactos físicos, psicológicos, sociales y operativos de la información perjudicial. Explora cómo estos daños alteran la preparación, la respuesta y la recuperación — y por qué responder a ellos ya no es opcional.

El Informe Mundial sobre Desastres 2026 va más allá del análisis. Ofrece recomendaciones prácticas para los actores humanitarios, los gobiernos, las plataformas tecnológicas y las comunidades para fortalecer la resiliencia informativa, salvaguardar la acción humanitaria basada en principios y reconstruir la confianza.

En las emergencias actuales, la información puede determinar el acceso, la seguridad y la dignidad.`,
    url: 'https://www.youtube.com/watch?v=jaoy6Wgi5qg',
  },
  {
    id: 2,
    title: 'Verdad, confianza y acción humanitaria: Informe Mundial sobre Desastres 2026',
    description: `El Informe Mundial sobre Desastres 2026 explora uno de los desafíos más urgentes que enfrenta la acción humanitaria en la actualidad: la información perjudicial.

Desde desastres y emergencias sanitarias hasta la migración y los conflictos, la información perjudicial está reconfigurando las crisis — afectando en quién se confía, quién recibe ayuda y quién queda en situación de riesgo.

Basándose en las perspectivas de más de 100 colaboradores y Sociedades Nacionales de la Cruz Roja y de la Media Luna Roja en todo el mundo, el informe presenta un nuevo marco para comprender cómo la información perjudicial causa daños físicos, psicológicos, sociales y operativos.

Por primera vez, el informe va acompañado de un innovador manual interactivo que permite a los lectores explorar los capítulos en línea, resaltar y compartir perspectivas, acceder a experiencias vividas y contenido multimedia, y navegar el informe de forma más dinámica.

Más allá del análisis, el informe ofrece recomendaciones prácticas para salvaguardar los principios humanitarios, proteger a los trabajadores humanitarios y reconstruir la confianza en tiempos de crisis.

Porque hoy, la información puede determinar el acceso, la seguridad y la dignidad.`,
    url: 'https://youtu.be/nabMyC5cVrU',
  },
];

export const chapterRelease = false;

export const chapters = {
  síntesis: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: -1,
      chapterPrefix: 'Síntesis',
    },
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
    downloadLink: 'https://www.ifrc.org/sites/default/files/2026-03/WDR2026_Synthesis_SP.pdf',
    thumbnail: '/wdr25/chapters/Synthesis.webp',
    thumbnailOverlay: 'red',
    released: true,
  },
  'capitulo-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Capítulo 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: 'Capítulo 02 - Descripción general',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Sección 1: Hallazgos clave',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Resumen del capítulo',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
};
