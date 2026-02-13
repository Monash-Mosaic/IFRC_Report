import * as WDR25 from './wdr25';

export const categories = [
  '年度报告',
  '战略',
  'DREF',
  '紧急呼吁',
  '灾害管理',
  '健康与护理',
  '国家协会发展',
  '气候变化',
  '移民',
  '倡导',
  '其他',
];

export const acknowledgementContributors = {
  primary: [
    { src: '/contributors/wdr26-logotypes-03.svg', alt: '意大利红十字会', order: 1 },
    { src: '/contributors/wdr26-logotypes-02.svg', alt: '西班牙红十字会', order: 2 },
  ],
  secondary: [
    { src: '/contributors/wdr26-logotypes-04.svg', alt: '美国红十字会', order: 1 },
    { src: '/contributors/wdr26-logotypes-05.svg', alt: '全球备灾中心', order: 2 },
    { src: '/contributors/wdr26-logotypes-06.svg', alt: '澳大利亚红十字会', order: 3 },
    { src: '/contributors/wdr26-logotypes-07.svg', alt: '奥地利红十字会', order: 4 },
    { src: '/contributors/wdr26-logotypes-08.svg', alt: '加拿大红十字会', order: 5 },
    { src: '/contributors/wdr26-logotypes-09.svg', alt: '瑞典红十字会', order: 6 },
    { src: '/contributors/wdr26-logotypes-10.svg', alt: '德国红十字会', order: 7 },
    { src: '/contributors/wdr26-logotypes-11.svg', alt: '日本红十字会', order: 8 },
    { src: '/contributors/wdr26-logotypes-12.svg', alt: '丹麦红十字会', order: 9 },
    { src: '/contributors/wdr26-logotypes-13.svg', alt: '瑞士红十字会', order: 10 },
    { src: '/contributors/wdr26-logotypes-14.svg', alt: '澳大利亚政府 – DFAT', order: 11 },
  ],
  tertiary: [],
};

export const reports = {
  wdr25: WDR25,
};
