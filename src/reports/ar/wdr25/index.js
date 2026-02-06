import * as Chapter02 from './chapter-02.mdx';
import * as Synthesis from './exec-summary.mdx';
export const title = 'تقرير الكوارث العالمي 2025';

export const description =
  'التقرير السنوي للاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر لعام 2025، الذي يستعرض الاستجابة العالمية للكوارث والجهود الإنسانية.';

export const author = 'أمانة الاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر';

export const category = 'تقرير سنوي';

export const releaseDate = new Date('2025-11-15');

export const reportFile = {
  url: '/reports/wdr2025.pdf',
  size: 19_389_263,
};

export const testimonialsList = [
  {
    id: 1,
    quote: 'خلال كوفيد-19، كانت هناك معلومات كثيرة جداً لدرجة أنني شعرت بالضياع ولم أعرف ماذا أصدق',
    name: 'عبد الرحمن م.',
    country: 'أفغانستان',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 2,
    quote: 'العيش في عصر الذكاء الاصطناعي يخيفني: أين الحقيقة وأين المعلومات المضللة',
    name: 'كلير',
    country: 'المملكة المتحدة',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 3,
    quote: 'أتمنى لو كان لدي عصا سحرية تساعدني على التمييز بين المعلومات المضللة والحقيقة',
    name: 'فاطمة',
    country: 'مصر',
    avatar: '/avatar/avatar-1.svg',
  },
  {
    id: 4,
    quote:
      'وسائل التواصل الاجتماعي تنشر المعلومات الخاطئة بسرعة كبيرة لدرجة أنه يصبح من الصعب التحقق مما هو حقيقي قبل فوات الأوان',
    name: 'ماريا س.',
    country: 'الفلبين',
    avatar: '/avatar/avatar-2.svg',
  },
  {
    id: 5,
    quote: 'في أوقات الكوارث، يمكن أن تكون المعلومات المضللة أكثر خطورة من الكارثة نفسها',
    name: 'جيمس ك.',
    country: 'كينيا',
    avatar: '/avatar/avatar-1.svg',
  },
];

export const featuredVideos = [
  {
    id: 1,
    title: 'دليل سريع لتطبيق Limitless',
    description:
      'هل تواجه مشكلة في التقديم على برنامج Limitless؟ هل لا تعرف من أين تبدأ؟ لا تقلق. Zikomo هنا لتخبرك بكيفية ومكان التقديم لأكاديمية IFRC Limitless للابتكار الشبابي 2024',
    url: 'https://www.youtube.com/watch?v=k5WL45qWU78',
  },
  {
    id: 2,
    title: 'الغوص في محلية المساعدات - مبادرة شاملة',
    description:
      'في هذه الحلقة، تناقش فيكتوار من الصليب الأحمر الكاميروني أهمية إشراك السكان المحليين في تنفيذ العمل الإنساني في المجتمعات الضعيفة من خلال مشاركة السكان المحليين.',
    url: 'https://www.youtube.com/watch?v=_8cmKGTOluo',
  },
];

export const chapters = {
  synthesis: {
    component: Synthesis.default,
    title: Synthesis.title,
    subtitle: Synthesis.subtitle,
    tableOfContents: Synthesis.tableOfContents,
  },
  'الفصل-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: 'intro',
        name: 'الفصل 02 - نظرة عامة',
        duration: '02:31',
        url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
      },
      {
        id: 'section-1',
        name: 'القسم 1: النتائج الرئيسية',
        duration: '04:12',
        url: 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3',
      },
    ],
    videos: [
      {
        id: 'summary',
        name: 'ملخص الفصل',
        duration: '03:45',
        url: 'https://www.youtube.com/watch?v=o8NiE3XMPrM',
        thumbnail: '/window.svg',
      },
    ],
  },
};
