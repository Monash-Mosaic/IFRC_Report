import * as arReports from './ar';
import * as enReports from './en';
import * as frReports from './fr';
import * as ruReports from './ru';
import * as zhReports from './zh';

// For simplicity, we will hardcode locale and report and chapter combinations.
export const reportsByLocale = {
  ar: arReports,
  en: enReports,
  fr: frReports,
  ru: ruReports,
  zh: zhReports,
};
