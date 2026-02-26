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
    title: 'Quick Guide to Your Limitless Application',
    description:
      "Are you having trouble applying for Limitless? Do you not know where to start? Don't worry. Zikomo is here to tell you how, why and where to apply for the IFRC Limitless Youth Innovation Academy 2024",
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: 'Dive in the localisation of aid — An inclusive initiative',
    description:
      'In this episode, Victoire from Cameroon Red Cross discusses the significance of involving local people in implementing humanitarian action in vulnerable community through the involvement of local people.',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapters = {
  synthesis: {
    metadata: {
      chapterKey: 'synthesis',
      chapterNumber: null,
      chapterPrefix: 'Synthesis',
    },
    component: Chapter02.default,
    title: 'Truth, Trust and Humanitarian Action in the Age of Harmful Information',
    subtitle: null,
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-01': {
    metadata: {
      chapterKey: 'chapter-01',
      chapterNumber: 1,
      chapterPrefix: 'Chapter 1',
    },
    component: Chapter02.default,
    title: 'Crisis, Chaos and Confusion: Understanding Harmful Information',
    subtitle: null,
    tableOfContents: [
      { id: '1', value: 'Defining Harmful Information', children: [] },
      { id: '2', value: 'The Evolving Information Ecosystem', children: [] },
      { id: '3', value: 'Who are the Threat Actors?', children: [] },
      { id: '4', value: 'Information Integrity in Crisis Situation', children: [] },
      { id: '5', value: 'From Broadcast to Two-Way Engagement', children: [] },
      { id: '6', value: 'Who is Most Vulnerable to Harmful Information—and Why?', children: [] },
      { id: '7', value: 'What is the Impact and Harm?', children: [] },
      { id: '8', value: 'Typology of Harm', children: [] },
      { id: '9', value: 'Artificial Intelligence and Harmful Information', children: [] },
      { id: '10', value: 'Framework for Analysis of Harmful Information', children: [] },
    ],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: true,
  },
  'chapter-02': {
    metadata: {
      chapterKey: 'chapter-02',
      chapterNumber: 2,
      chapterPrefix: 'Chapter 02',
    },
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    downloadLink: 'https://www.dfat.gov.au/sites/default/files/vic-cef.pdf',
    thumbnail: null,
    released: true,
    audios: [
      {
        id: 'intro',
        name: 'Chapter 02 - Overview',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'Section 1: Key Findings',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'Chapter Summary',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
  'chapter-03': {
    metadata: {
      chapterKey: 'chapter-03',
      chapterNumber: 3,
      chapterPrefix: 'Chapter 3',
    },
    component: Chapter02.default,
    title: 'Global and Local: Dynamics of Harmful Information in a Connected World',
    subtitle: 'Harmful Narratives that Thrive',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'blue',
    released: false,
  },
  'chapter-04': {
    metadata: {
      chapterKey: 'chapter-04',
      chapterNumber: 4,
      chapterPrefix: 'Chapter 4',
    },
    component: Chapter02.default,
    title: 'From Context to Consequence: Humanitarian Sector Voices on the Impact of Harmful Information',
    subtitle: 'Harmful Information and Operational Realities',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: false,
  },
  'chapter-05': {
    metadata: {
      chapterKey: 'chapter-05',
      chapterNumber: 5,
      chapterPrefix: 'Chapter 5',
    },
    component: Chapter02.default,
    title: 'Navigating Regulation, Rights and Societal Resilience',
    subtitle: 'Information Landscape and Humanitarian Contexts',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: false,
  },
  'chapter-06': {
    metadata: {
      chapterKey: 'chapter-06',
      chapterNumber: 6,
      chapterPrefix: 'Chapter 6',
    },
    component: Chapter02.default,
    title: 'Rooted in Resilience: Community-first approach to Harmful Information',
    subtitle: 'The Importance of Community for Resilience',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: false,
  },
  'chapter-07': {
    metadata: {
      chapterKey: 'chapter-07',
      chapterNumber: 7,
      chapterPrefix: 'Chapter 7',
    },
    component: Chapter02.default,
    title: 'Upholding Humanitarian Principles in the Age of Echo Chambers',
    subtitle: 'Humanitarian Action in the Era of Instant Narratives',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: false,
  },
  'chapter-08': {
    metadata: {
      chapterKey: 'chapter-08',
      chapterNumber: 8,
      chapterPrefix: 'Chapter 8',
    },
    component: Chapter02.default,
    title: "What's Next for Truth and Trust? Toward a Resilient Humanitarian Sector",
    subtitle: 'The Stakes of Harmful Information',
    tableOfContents: [],
    thumbnail: null,
    thumbnailOverlay: 'red',
    released: false,
  },
};
