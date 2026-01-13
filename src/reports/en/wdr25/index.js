import * as Chapter02 from './chapter-02.mdx';
import * as Chapter01 from './chapter-01.mdx';
import * as ExecSummary from './exec-summary.mdx';
import * as Foreword from './WDR26-Foreword-EN.mdx';

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
  'foreword': {
    component: Foreword.default,
    title: Foreword.title,
    subtitle: Foreword.subtitle,
    tableOfContents: Foreword.tableOfContents,
  },
  'exec-summary': {
    component: ExecSummary.default,
    title: ExecSummary.title,
    subtitle: ExecSummary.subtitle,
    tableOfContents: ExecSummary.tableOfContents,
  },
  'chapter-01': {
    component: Chapter01.default,
    title: Chapter01.title,
    subtitle: Chapter01.subtitle,
    tableOfContents: Chapter01.tableOfContents,
  },
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
