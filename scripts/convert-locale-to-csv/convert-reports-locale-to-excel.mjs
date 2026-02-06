import { register } from 'node:module';
import fs from 'node:fs/promises';
import pl from 'nodejs-polars';

register('./mdx-stub-loader.mjs', import.meta.url);
register('./alias-loader.mjs', import.meta.url);

const __filename = new URL(import.meta.url).pathname;
const __dirname = __filename.substring(0, __filename.lastIndexOf('/'));
const reportInputDir = `${__dirname}/../../src/reports`;
const messageInputDir = `${__dirname}/../../src/messages`;
const { reportsByLocale } = await import(`${reportInputDir}/index.js`);

function flatten(obj, prefix = '', delimiter = '.') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}${delimiter}${key}` : key;
    
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const arrayKey = `${newKey}[${index}]`;
        if (typeof item === 'object' && item !== null) {
          Object.assign(acc, flatten(item, arrayKey, delimiter));
        } else {
          acc[arrayKey] = item;
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(acc, flatten(value, newKey, delimiter));
    } else {
      acc[newKey] = value;
    }
    
    return acc;
  }, {});
}

for await (const locale of ['ar', 'en', 'fr', 'ru', 'zh', 'es']) {
  // const report = reportsByLocale[locale];
  const messageJSON = JSON.parse(
    await fs.readFile(`${messageInputDir}/${locale}.json`, 'utf8')
  );
  const report = reportsByLocale[locale];
  const flattened = {
    ...flatten(report, 'report'),
    ...flatten(messageJSON, 'message'),
  }
  console.log(flattened);
  const filtered = Object.entries(flattened).filter(([key, value]) => 
      ['string', 'number', 'boolean'].includes(typeof value) || 
      /\.(component|title|subtitle|tableOfContents|id)$/.test(key)).reduce((acc, [key, value]) => {
    acc['key'].push(key);
    acc['value'].push(String(value));
    return acc;
  }, {'key': [], 'value': []});
  const df = pl.DataFrame(filtered, );
  df.writeCSV(`${__dirname}/output/reports-${locale}.csv`);
}
