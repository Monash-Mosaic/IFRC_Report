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
      'During COVID-19, there was so much information that I felt lost and did not know what to believe',
    name: 'Abdul M.',
    country: 'Afghanistan',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 2,
    quote: 'Living in the age of AI scares me: where is the truth and where is the misinformation',
    name: 'Clair',
    country: 'UK',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 3,
    quote: 'I wish I had a magic wand that would help me to distinguish misinformation and truth',
    name: 'Olga',
    country: 'Russia',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 4,
    quote:
      "Social media spreads false information so quickly that it becomes hard to verify what's real before it's too late",
    name: 'Maria S.',
    country: 'Philippines',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 5,
    quote: 'In times of disaster, misinformation can be more dangerous than the disaster itself',
    name: 'James K.',
    country: 'Kenya',
    avatar: '/avatar/avatar-1.svg',
  },
];

export const featuredVideos = [
  {
    id: 1,
    title: 'Subheading',
    description: "Body text for whatever you'd like to add more to the subheading.",
    thumbnailSrc: '/wdr25/thumbnail1.png',
    thumbnailAlt: 'Featured video thumbnail',
    url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
  },
  {
    id: 2,
    title: 'Subheading',
    description: "Body text for whatever you'd like to expand on the main point.",
    thumbnailSrc: '/wdr25/thumbnail2.png',
    thumbnailAlt: 'Featured video thumbnail',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
];

export const chapters = {
  'chapter-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
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
};
