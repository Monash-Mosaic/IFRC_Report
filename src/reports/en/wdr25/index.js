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
    tableOfContents: Chapter02.tableOfContents,
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
    ],
  },
};

export const landingPage = {
  heroSection: {
    title: 'World Disasters Report',
    description: 'The World Disasters Report is the flagship publication of the International Federation of the Red Cross and Red Crescent Societies (IFRC), designed to drive policy change, shape thinking and strengthen practice across the humanitarian sector. This edition focuses on harmful information in humanitarian contexts.',
    buttonTexts: {
      read: 'Read report',
      download: 'Download report',
      share: 'Share'
    }
  },

  executiveSummary: {
    title: 'Executive Summary',
    subtitle: 'At Crisis Point: Countering Harmful Information, Defending Humanity',
    description: 'At Crisis Point: Countering Harmful Information, Defending Humanity',
    buttonTexts: {
      read: 'Read',
      download: 'Download'
    }
  },

  featuredVideos: {
    title: 'Featured Videos from Around the World',
    videos: [
      {
        id: 1,
        title: "Subheading",
        description: "Body text for whatever you'd like to add more to the subheading.",
        thumbnailSrc: "/wdr25/thumbnail1.png",
        thumbnailAlt: "Featured video thumbnail",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM"
      },
      {
        id: 2,
        title: "Subheading", 
        description: "Body text for whatever you'd like to expand on the main point.",
        thumbnailSrc: "/wdr25/thumbnail2.png",
        thumbnailAlt: "Featured video thumbnail",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },

  testimonials: {
    title: "Citations & Lived Experiences",
    testimonialsList: [
      {
        id: 1,
        quote: "During COVID-19, there was so much information that I felt lost and did not know what to believe",
        name: "Abdul M.",
        country: "Afghanistan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdul&backgroundColor=b6e3f4&clothesColor=262e33"
      },
      {
        id: 2,
        quote: "Living in the age of AI scares me: where is the truth and where is the misinformation",
        name: "Clair",
        country: "UK",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Clair&backgroundColor=ffd93d&clothesColor=3c4f5c"
      },
      {
        id: 3,
        quote: "I wish I had a magic wand that would help me to distinguish misinformation and truth",
        name: "Olga",
        country: "Russia",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga&backgroundColor=ffdfbf&clothesColor=929598"
      },
      {
        id: 4,
        quote: "Social media spreads false information so quickly that it becomes hard to verify what's real before it's too late",
        name: "Maria S.",
        country: "Philippines",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=c0aede&clothesColor=65c9ff"
      },
      {
        id: 5,
        quote: "In times of disaster, misinformation can be more dangerous than the disaster itself",
        name: "James K.",
        country: "Kenya",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=a7f3d0&clothesColor=83d0c9"
      }
    ]
  }
};