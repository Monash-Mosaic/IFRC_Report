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

export const landingPage = {
  heroSection: {
    title: 'تقرير الكوارث العالمي',
    description: 'تقرير الكوارث العالمي هو المنشور الرائد للاتحاد الدولي لجمعيات الصليب الأحمر والهلال الأحمر، المصمم لدفع التغيير السياسي وتشكيل التفكير وتعزيز الممارسة في القطاع الإنساني. تركز هذه الطبعة على المعلومات الضارة في السياقات الإنسانية.',
    buttonTexts: {
      read: 'قراءة التقرير',
      download: 'تحميل التقرير',
      share: 'مشاركة'
    }
  },
  
  executiveSummary: {
    title: 'الملخص التنفيذي',
    subtitle: 'في نقطة الأزمة: مواجهة المعلومات الضارة، الدفاع عن الإنسانية',
    description: 'في نقطة الأزمة: مواجهة المعلومات الضارة، الدفاع عن الإنسانية',
    buttonTexts: {
      read: 'قراءة',
      download: 'تحميل'
    }
  },

  featuredVideos: {
    title: 'مقاطع فيديو مميزة من جميع أنحاء العالم',
    videos: [
      {
        id: 1,
        title: "عنوان فرعي",
        description: "نص الجسم لأي شيء تريد إضافته إلى العنوان الفرعي.",
        thumbnailSrc: "/wdr25/thumbnail1.png",
        thumbnailAlt: "صورة مصغرة لفيديو مميز",
        url: "https://www.youtube.com/watch?v=o8NiE3XMPrM"
      },
      {
        id: 2,
        title: "عنوان فرعي",
        description: "نص الجسم لأي شيء تريد توسيعه في النقطة الرئيسية.",
        thumbnailSrc: "/wdr25/thumbnail2.png",
        thumbnailAlt: "صورة مصغرة لفيديو مميز",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      }
    ]
  },

  testimonials: {
    title: "الاقتباسات والتجارب المعيشة",
    testimonialsList: [
      {
        id: 1,
        quote: "خلال COVID-19، كانت هناك معلومات كثيرة لدرجة أنني شعرت بالضياع ولم أعد أعرف ما أصدق",
        name: "عبد الله م.",
        country: "أفغانستان"
      },
      {
        id: 2,
        quote: "العيش في عصر الذكاء الاصطناعي يخيفني: أين الحقيقة وأين المعلومات المضللة",
        name: "كلير",
        country: "المملكة المتحدة"
      },
      {
        id: 3,
        quote: "أتمنى لو كان لدي عصا سحرية تساعدني على التمييز بين المعلومات المضللة والحقيقة",
        name: "أولغا",
        country: "روسيا"
      },
      {
        id: 4,
        quote: "وسائل التواصل الاجتماعي تنشر المعلومات الخاطئة بسرعة كبيرة لدرجة أنه يصبح من الصعب التحقق من صحة المعلومات قبل فوات الأوان",
        name: "ماريا س.",
        country: "الفلبين"
      },
      {
        id: 5,
        quote: "في أوقات الكوارث، يمكن أن تكون المعلومات المضللة أكثر خطورة من الكارثة نفسها",
        name: "جيمس ك.",
        country: "كينيا"
      }
    ]
  }
};

