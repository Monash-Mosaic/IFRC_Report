import * as enReports from './en';
// import * as frReports from './fr';
// import * as zhReports from './zh';
import * as arReports from './ar';
// import * as ruReports from './ru';
import * as zhReports from './zh';

// For simplicity, we will hardcode locale and report and chapter combinations.
export const reportsByLocale = {
  en: enReports.reports,
  // fr: frReports.reports,
  ar: arReports.reports,
  zh: zhReports.reports,
  // ru: ruReports.reports,
};