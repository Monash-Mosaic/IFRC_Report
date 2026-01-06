import * as Chapter02 from './chapter-02.mdx';

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
    "id": 1,
    "quote": "خلال كوفيد-19، كانت هناك معلومات كثيرة جداً لدرجة أنني شعرت بالضياع ولم أعرف ماذا أصدق",
    "name": "عبد الرحمن م.",
    "country": "أفغانستان",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Abdul&backgroundColor=b6e3f4&clothesColor=262e33"
  },
  {
    "id": 2,
    "quote": "العيش في عصر الذكاء الاصطناعي يخيفني: أين الحقيقة وأين المعلومات المضللة",
    "name": "كلير",
    "country": "المملكة المتحدة",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Clair&backgroundColor=ffd93d&clothesColor=3c4f5c"
  },
  {
    "id": 3,
    "quote": "أتمنى لو كان لدي عصا سحرية تساعدني على التمييز بين المعلومات المضللة والحقيقة",
    "name": "فاطمة",
    "country": "مصر",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Olga&backgroundColor=ffdfbf&clothesColor=929598"
  },
  {
    "id": 4,
    "quote": "وسائل التواصل الاجتماعي تنشر المعلومات الخاطئة بسرعة كبيرة لدرجة أنه يصبح من الصعب التحقق مما هو حقيقي قبل فوات الأوان",
    "name": "ماريا س.",
    "country": "الفلبين",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria&backgroundColor=c0aede&clothesColor=65c9ff"
  },
  {
    "id": 5,
    "quote": "في أوقات الكوارث، يمكن أن تكون المعلومات المضللة أكثر خطورة من الكارثة نفسها",
    "name": "جيمس ك.",
    "country": "كينيا",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=James&backgroundColor=a7f3d0&clothesColor=83d0c9"
  }
];

export const featuredVideos = [
  {
    "id": 1,
    "title": "عنوان فرعي",
    "description": "نص أساسي لكل ما تريد إضافته إلى العنوان الفرعي.",
    "thumbnailSrc": "/wdr25/thumbnail1.png",
    "thumbnailAlt": "صورة مصغرة للفيديو المميز",
    "url": "https://www.youtube.com/watch?v=o8NiE3XMPrM"
  },
  {
    "id": 2,
    "title": "عنوان فرعي",
    "description": "نص أساسي لكل ما تريد توسيعه في النقطة الرئيسية.",
    "thumbnailSrc": "/wdr25/thumbnail2.png",
    "thumbnailAlt": "صورة مصغرة للفيديو المميز",
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }
];

export const chapters = {
  'الفصل-02': {
    component: Chapter02.default,
    title: Chapter02.title,
    subtitle: Chapter02.subtitle,
    tableOfContents: Chapter02.tableOfContents,
    audios: [
      {
        id: "intro",
        name: "الفصل 02 - نظرة عامة",
        duration: "02:31",
        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3"
      },
      {
        id: "section-1",
        name: "القسم 1: النتائج الرئيسية",
        duration: "04:12",
        url: "https://samplelib.com/lib/preview/mp3/sample-15s.mp3"
      }
    ],
    videos: [
      {
        id: "summary",
        name: "ملخص الفصل",
        duration: "03:45",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM",
        thumbnail: "/window.svg"
      }
    ],
  },
};
