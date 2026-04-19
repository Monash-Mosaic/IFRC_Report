const fs = require('fs');
const xml = fs.readFileSync('./scripts/wdr25/data/WDR26-FR-08.with-links-and-endnotes.xml', 'utf8');

// Get the first story section (stop at TOC)
const storyStart = xml.indexOf('<Story>') + 7;
const tocStart = xml.indexOf('<h1-chapter-toc-title>');
const storyContent = xml.substring(storyStart, tocStart);

// Decode HTML entities
function dec(s) {
  if (!s) return '';
  return s
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#171;/g, '«')
    .replace(/&#187;/g, '»')
    .replace(/&#8249;/g, '‹')
    .replace(/&#8250;/g, '›')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
}

const endnoteMap = {
  'u83621': 1, 'u83625': 2, 'u83627': 3, 'u8362a': 4, 'u8362c': 5,
  'u8362e': 6, 'u83631': 7, 'u83633': 8, 'u83636': 9, 'u83638': 10,
  'u8363a': 11, 'u8363e': 12, 'u83640': 13, 'u83642': 14, 'u83645': 15,
  'u83647': 16, 'u83649': 17, 'u8364b': 18, 'u8364e': 19, 'u83651': 20,
  'u83656': 21, 'u83658': 22, 'u8365a': 23, 'u8365e': 24, 'u83660': 25
};

// External link text → URL mapping (ordered by appearance in document)
const externalLinks = [
  { text: 'guide sur la désinformation', url: 'https://www.unimelb.edu.au/__data/assets/pdf_file/0006/5060724/Disinformation-in-the-City-Reponse-Playbook_compressed-1.pdf' },
  { text: 'boîte à outils sur l\u2019intégrité de l\u2019information', url: 'https://www.unhcr.org/handbooks/informationintegrity/' },
  { text: 'Au cours des cinq dernières années', url: null },  // no external URL available
  { text: 'œuvre de longue date', url: 'https://hdcentre.org/news/hd-receives-carnegie-wateler-peace-prize-for-track-record-of-conflict-mediation/' },
  { text: 'Nigeria', url: 'https://hdcentre.org/news/hd-brokers-landmark-social-media-peace-agreement-in-central-nigeria/' },
  { text: 'au Kosovo', url: 'https://hdcentre.org/news/hd-secures-social-media-conduct-commitments-for-kosovo-elections/' },
  { text: 'en Bosnie-Herzégovine', url: 'https://hdcentre.org/news/hd-citizens-charter-in-bosnia-and-herzegovina-sets-standards-for-social-media-conduct-in-run-up-to-elections/' },
  { text: 'en Thaïlande', url: 'https://hdcentre.org/news/mitigating-electoral-risks-through-dialogue-key-insights-from-hds-innovative-social-media-annex-in-thailand/' },
  { text: 'étude exploratoire sur la mésinformation, la désinformation et les discours de haine', url: 'https://humanitariangrandchallenge.org/mdh-report-launch/' },
  { text: 'indice de confiance des communautés', url: 'https://trust.communityengagementhub.org/fr/a-propos-de-nous/' },
];

// Track which body-hyperlinks we've seen (in order)
let bodyHyperlinksIndex = 0;

// Tokenize XML
function tokenize(s) {
  const tokens = [];
  const re = /<([^>]*)>/g;
  let last = 0, m;
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) {
      const text = dec(s.slice(last, m.index));
      if (text) tokens.push({ type: 'text', val: text });
    }
    const inner = m[1];
    if (inner.startsWith('/')) {
      tokens.push({ type: 'close', name: inner.slice(1).trim() });
    } else {
      const spaceIdx = inner.search(/[\s/]/);
      const rawName = spaceIdx < 0 ? inner : inner.slice(0, spaceIdx);
      const name = rawName.replace(/\/$/, '');
      const attrs = {};
      const attrRe = /(\w[\w-]*)="([^"]*)"/g;
      let am;
      while ((am = attrRe.exec(inner)) !== null) attrs[am[1]] = dec(am[2]);
      if (inner.trimEnd().endsWith('/')) {
        tokens.push({ type: 'selfclose', name, attrs });
      } else {
        tokens.push({ type: 'open', name, attrs });
      }
    }
    last = m.index + m[0].length;
  }
  if (last < s.length) {
    const text = dec(s.slice(last));
    if (text) tokens.push({ type: 'text', val: text });
  }
  return tokens;
}

// Collect text+inline markup until closing tag
function collectText(tokens, idx, closeTag) {
  let text = '';
  let i = idx;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type === 'close' && t.name === closeTag) {
      return { text, i: i + 1 };
    }
    if (t.type === 'text') {
      text += t.val;
    } else if (t.type === 'open' && t.name === 'endnotes-ref') {
      const id = t.attrs && t.attrs.endnoteId;
      if (id && endnoteMap[id]) text += `[^${endnoteMap[id]}]`;
      while (i < tokens.length && !(tokens[i].type === 'close' && tokens[i].name === 'endnotes-ref')) i++;
    } else if (t.type === 'selfclose' && t.name === 'endnotes-ref') {
      const id = t.attrs && t.attrs.endnoteId;
      if (id && endnoteMap[id]) text += `[^${endnoteMap[id]}]`;
    } else if (t.type === 'open' && t.name === 'bold') {
      const r = collectText(tokens, i + 1, 'bold');
      text += `**${r.text.trim()}**`;
      i = r.i; continue;
    } else if (t.type === 'open' && t.name === 'italic') {
      const r = collectText(tokens, i + 1, 'italic');
      text += `*${r.text.trim()}*`;
      i = r.i; continue;
    } else if (t.type === 'open' && t.name === 'cross-reference-link') {
      const r = collectText(tokens, i + 1, 'cross-reference-link');
      text += `<span className='text-purple-600'>${r.text.trim()}</span>`;
      i = r.i; continue;
    } else if (t.type === 'open' && t.name === 'body-hyperlinks') {
      const r = collectText(tokens, i + 1, 'body-hyperlinks');
      const linkInfo = externalLinks[bodyHyperlinksIndex];
      bodyHyperlinksIndex++;
      if (linkInfo && linkInfo.url) {
        text += `<ChapterLink href="${linkInfo.url}" target="_blank" rel="noopener noreferrer">${r.text.trim()}</ChapterLink>`;
      } else {
        text += r.text.trim();
      }
      i = r.i; continue;
    } else if (t.type === 'open' && t.name === 'a') {
      const href = t.attrs && t.attrs.href;
      const r = collectText(tokens, i + 1, 'a');
      if (href) text += `[${r.text.trim()}](${href})`;
      else text += r.text.trim();
      i = r.i; continue;
    }
    i++;
  }
  return { text, i };
}

const tokens = tokenize(storyContent);

// Helper: get text of a simple tag
function getTagText(tokens, i) {
  const closeTag = tokens[i - 1].name; // calling code handles this differently
  return collectText(tokens, i, closeTag);
}

// Build contributor from sequential t1/t2/t3 span tags
function buildContributor(name, entity, role) {
  if (!name && !entity && !role) return '';
  let c = `    <Contributor>\n`;
  if (name) c += `      <ContributorName>${name.trim()}</ContributorName>\n`;
  if (entity) c += `      <ContributorEntity>${entity.trim()}</ContributorEntity>\n`;
  if (role) c += `      <ContributorRole>${role.trim()}</ContributorRole>\n`;
  c += `    </Contributor>\n`;
  return c;
}

// Extract endnotes from XML
function extractEndnotes(xml) {
  const re = /<endnote endnoteId="([^"]+)" n="(\d+)"[^>]*><endnote-text>([\s\S]*?)<\/endnote-text><\/endnote>/g;
  const notes = {};
  let m;
  while ((m = re.exec(xml)) !== null) {
    const text = dec(m[3])
      .replace(/&lt;cite&gt;/g, '*')
      .replace(/&lt;\/cite&gt;/g, '*')
      .replace(/&lt;[^&>]+&gt;/g, '');
    notes[parseInt(m[2])] = text;
  }
  return notes;
}

// Process all tokens and generate MDX output
let output = [];
let i = 0;
let inBox = false;
let boxCount = 0;
let inBulletList = false;
let inNumberedList = false;
let inQABox = false;
let questionText = '';
let answerLines = [];
let currentAnswerType = null;

const BOX_ONLY_TAGS = new Set([
  'h1-box', 'h2-box', 'normal-box', 'normal-box-bullet-list', 'normal-box-numbered-list',
  'normal-super-tight', 'normal-tight',
  't1-span', 't2-span', 't3-span', 't3-span-extra',
  't1-c1', 't2-c1', 't3-c1', 't1-c2', 't2-c2', 't3-c2',
  't1-3c-c1', 't2-3c-c1', 't3-3c-c1', 't1-3c-c2', 't2-3c-c2', 't3-3c-c2',
  't1-3c-c3', 't2-3c-c3', 't3-3c-c3',
  'question', 'answer-alt', 'answer-bullet',
]);

const MAIN_TAGS = new Set([
  'h1', 'h2', 'normal', 'quote', 'quote-author', 'definition-icon',
  'h1-definition', 'normal-definition-first', 'h1-conclusion', 'bullet-list', 'fig'
]);

function closeBox() {
  if (inBox) {
    output.push('</Box>');
    output.push('');
    inBox = false;
  }
}

function closeQA() {
  if (inQABox) {
    output.push('  </QuestionAnswerBoxBody>');
    output.push('</QuestionAnswerBox>');
    output.push('');
    inQABox = false;
  }
}

// State for collecting contributors
let t1span = '', t2span = '', t3span = '';
let t1c1 = '', t2c1 = '', t3c1 = '', t1c2 = '', t2c2 = '', t3c2 = '';
let t13cc1 = '', t23cc1 = '', t33cc1 = '';
let t13cc2 = '', t23cc2 = '', t33cc2 = '';
let t13cc3 = '', t23cc3 = '', t33cc3 = '';
let t3spanExtra = '';
let pendingContribBlock = null;

function flushContributor() {
  if (!pendingContribBlock) return;
  const block = pendingContribBlock;
  pendingContribBlock = null;
  output.push('<ContributorTag>');
  output.push(block);
  output.push('</ContributorTag>');
}

// --- Main conversion loop ---
while (i < tokens.length) {
  const t = tokens[i];

  if (t.type === 'open') {
    const name = t.name;

    // Skip structural wrappers
    if (name === 'chapter-number' || name === 'chapter-title' || name === 'Story') {
      while (i < tokens.length && !(tokens[i].type === 'close' && tokens[i].name === name)) i++;
      i++; continue;
    }

    if (name === 'h1-introduction') {
      const r = collectText(tokens, i + 1, 'h1-introduction');
      output.push(`# ${r.text.trim()}`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'normal' || name === 'normal-tight') {
      closeQA();
      const r = collectText(tokens, i + 1, name);
      const text = r.text.trim();
      if (text) { output.push(text); output.push(''); }
      i = r.i; continue;
    }

    if (name === 'normal-super-tight') {
      const r = collectText(tokens, i + 1, 'normal-super-tight');
      const text = r.text.trim();
      if (text) { output.push(text); output.push(''); }
      i = r.i; continue;
    }

    if (name === 'quote') {
      const r = collectText(tokens, i + 1, 'quote');
      output.push('<SmallQuote>');
      output.push(`  ${r.text.trim()}`);
      output.push('</SmallQuote>');
      output.push('');
      i = r.i; continue;
    }

    if (name === 'quote-author') {
      const r = collectText(tokens, i + 1, 'quote-author');
      output.push(`<SmallQuoteAuthor>${r.text.trim()}</SmallQuoteAuthor>`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'h1') {
      closeQA();
      closeBox();
      const r = collectText(tokens, i + 1, 'h1');
      const headingLabelIndex = output.filter(l => l.startsWith('# <HeadingLabel')).length + 1;
      output.push(`# <HeadingLabel index="8.${headingLabelIndex}" /> ${r.text.trim()}`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'h2') {
      const r = collectText(tokens, i + 1, 'h2');
      output.push(`## ${r.text.trim()}`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'bullet-list') {
      const r = collectText(tokens, i + 1, 'bullet-list');
      output.push(`- ${r.text.trim()}`);
      i = r.i; continue;
    }

    if (name === 'toh-box') {
      closeQA();
      closeBox();
      const r = collectText(tokens, i + 1, 'toh-box');
      boxCount++;
      const types = r.text.trim();
      if (boxCount === 3) {
        output.push('<Box');
        output.push(`index="8.${boxCount}"`);
        output.push('types={[TypologyOfHarm.Social, TypologyOfHarm.Societal, TypologyOfHarm.Informational, TypologyOfHarm.Deprivational]}');
        output.push('>');
      } else {
        output.push(`<Box index="8.${boxCount}">`);
      }
      output.push('');
      inBox = true;
      i = r.i; continue;
    }

    if (name === 'h1-box') {
      const r = collectText(tokens, i + 1, 'h1-box');
      output.push(`## ${r.text.trim()}`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'h2-box') {
      const r = collectText(tokens, i + 1, 'h2-box');
      output.push(`**${r.text.trim()}**`);
      output.push('');
      i = r.i; continue;
    }

    if (name === 'normal-box') {
      const r = collectText(tokens, i + 1, 'normal-box');
      const text = r.text.trim();
      if (text) { output.push(text); output.push(''); }
      i = r.i; continue;
    }

    if (name === 'normal-box-bullet-list') {
      const r = collectText(tokens, i + 1, 'normal-box-bullet-list');
      const text = r.text.trim();
      if (text) output.push(`- ${text}`);
      i = r.i; continue;
    }

    if (name === 'normal-box-numbered-list') {
      const r = collectText(tokens, i + 1, 'normal-box-numbered-list');
      const text = r.text.trim();
      if (text) output.push(`1. ${text}`);
      i = r.i; continue;
    }

    // Question-answer box — must close any open box first
    if (name === 'question') {
      closeBox();
      const r = collectText(tokens, i + 1, 'question');
      questionText = r.text.trim();
      output.push('<QuestionAnswerBox>');
      output.push('  <QuestionAnswerBoxTitle>');
      output.push(`    ${questionText}`);
      output.push('  </QuestionAnswerBoxTitle>');
      output.push('  <QuestionAnswerBoxBody>');
      output.push('');
      inQABox = true;
      i = r.i; continue;
    }

    if (name === 'answer-alt') {
      const r = collectText(tokens, i + 1, 'answer-alt');
      const text = r.text.trim();
      if (text) { output.push(text); output.push(''); }
      i = r.i; continue;
    }

    if (name === 'answer-bullet') {
      const r = collectText(tokens, i + 1, 'answer-bullet');
      const text = r.text.trim();
      if (text) output.push(`- ${text}`);
      i = r.i; continue;
    }

    // Contributors - single column
    if (name === 't1-span') {
      const r = collectText(tokens, i + 1, 't1-span');
      t1span = r.text.trim(); i = r.i; continue;
    }
    if (name === 't2-span') {
      const r = collectText(tokens, i + 1, 't2-span');
      t2span = r.text.trim(); i = r.i; continue;
    }
    if (name === 't3-span') {
      const r = collectText(tokens, i + 1, 't3-span');
      t3span = r.text.trim();
      // Flush single contributor
      const contrib = buildContributor(t1span, t2span, t3span);
      // Check if next tag is t3-span-extra
      let nextIdx = i + 1;
      while (nextIdx < tokens.length && tokens[nextIdx].type === 'text') nextIdx++;
      if (tokens[nextIdx] && tokens[nextIdx].type === 'open' && tokens[nextIdx].name === 't3-span-extra') {
        // defer until t3-span-extra is processed
        pendingContribBlock = contrib;
      } else {
        output.push('<ContributorTag>');
        output.push(contrib);
        output.push('</ContributorTag>');
        output.push('');
      }
      t1span = ''; t2span = ''; t3span = '';
      i = r.i; continue;
    }
    if (name === 't3-span-extra') {
      const r = collectText(tokens, i + 1, 't3-span-extra');
      const extra = r.text.trim();
      // This is an org-only extra contributor (e.g., "Fédération internationale, Genève")
      const extraContrib = buildContributor(extra, '', '');
      output.push('<ContributorTag>');
      if (pendingContribBlock) output.push(pendingContribBlock);
      output.push(extraContrib);
      output.push('</ContributorTag>');
      output.push('');
      pendingContribBlock = null;
      i = r.i; continue;
    }

    // Contributors - 3 columns
    if (name === 't1-3c-c1') { const r = collectText(tokens, i+1, 't1-3c-c1'); t13cc1 = r.text.trim(); i = r.i; continue; }
    if (name === 't2-3c-c1') { const r = collectText(tokens, i+1, 't2-3c-c1'); t23cc1 = r.text.trim(); i = r.i; continue; }
    if (name === 't3-3c-c1') { const r = collectText(tokens, i+1, 't3-3c-c1'); t33cc1 = r.text.trim(); i = r.i; continue; }
    if (name === 't1-3c-c2') { const r = collectText(tokens, i+1, 't1-3c-c2'); t13cc2 = r.text.trim(); i = r.i; continue; }
    if (name === 't2-3c-c2') { const r = collectText(tokens, i+1, 't2-3c-c2'); t23cc2 = r.text.trim(); i = r.i; continue; }
    if (name === 't3-3c-c2') { const r = collectText(tokens, i+1, 't3-3c-c2'); t33cc2 = r.text.trim(); i = r.i; continue; }
    if (name === 't1-3c-c3') { const r = collectText(tokens, i+1, 't1-3c-c3'); t13cc3 = r.text.trim(); i = r.i; continue; }
    if (name === 't2-3c-c3') { const r = collectText(tokens, i+1, 't2-3c-c3'); t23cc3 = r.text.trim(); i = r.i; continue; }
    if (name === 't3-3c-c3') {
      const r = collectText(tokens, i+1, 't3-3c-c3'); t33cc3 = r.text.trim();
      output.push('<ContributorTag>');
      output.push(buildContributor(t13cc1, t23cc1, t33cc1));
      output.push(buildContributor(t13cc2, t23cc2, t33cc2));
      output.push(buildContributor(t13cc3, t23cc3, t33cc3));
      output.push('</ContributorTag>');
      output.push('');
      t13cc1=t23cc1=t33cc1=t13cc2=t23cc2=t33cc2=t13cc3=t23cc3=t33cc3='';
      i = r.i; continue;
    }

    // Contributors - 2 columns
    if (name === 't1-c1') { const r = collectText(tokens, i+1, 't1-c1'); t1c1 = r.text.trim(); i = r.i; continue; }
    if (name === 't2-c1') { const r = collectText(tokens, i+1, 't2-c1'); t2c1 = r.text.trim(); i = r.i; continue; }
    if (name === 't3-c1') { const r = collectText(tokens, i+1, 't3-c1'); t3c1 = r.text.trim(); i = r.i; continue; }
    if (name === 't1-c2') { const r = collectText(tokens, i+1, 't1-c2'); t1c2 = r.text.trim(); i = r.i; continue; }
    if (name === 't2-c2') { const r = collectText(tokens, i+1, 't2-c2'); t2c2 = r.text.trim(); i = r.i; continue; }
    if (name === 't3-c2') {
      const r = collectText(tokens, i+1, 't3-c2'); t3c2 = r.text.trim();
      output.push('<ContributorTag>');
      output.push(buildContributor(t1c1, t2c1, t3c1));
      output.push(buildContributor(t1c2, t2c2, t3c2));
      output.push('</ContributorTag>');
      output.push('');
      t1c1=t2c1=t3c1=t1c2=t2c2=t3c2='';
      i = r.i; continue;
    }

    // Definition
    if (name === 'definition-icon') {
      while (i < tokens.length && !(tokens[i].type === 'close' && tokens[i].name === 'definition-icon')) i++;
      i++; continue;
    }
    if (name === 'h1-definition') {
      const r = collectText(tokens, i + 1, 'h1-definition');
      output.push(`<Definition>${r.text.trim()}</Definition>`);
      output.push('');
      i = r.i; continue;
    }
    if (name === 'normal-definition-first') {
      const r = collectText(tokens, i + 1, 'normal-definition-first');
      output.push('<DefinitionDescription>');
      output.push(`  ${r.text.trim()}`);
      output.push('</DefinitionDescription>');
      output.push('');
      i = r.i; continue;
    }

    // Conclusion heading
    if (name === 'h1-conclusion') {
      closeQA();
      closeBox();
      const r = collectText(tokens, i + 1, 'h1-conclusion');
      output.push(`# ${r.text.trim()}`);
      output.push('');
      i = r.i; continue;
    }

    // Skip fig (handled in header)
    if (name === 'fig') {
      while (i < tokens.length && !(tokens[i].type === 'close' && tokens[i].name === 'fig')) i++;
      i++; continue;
    }

    // Skip other structural tags
    i++;
  } else {
    i++;
  }
}

closeQA();
closeBox();

// Build endnotes section
const endnotes = extractEndnotes(xml);
const maxNote = Math.max(...Object.keys(endnotes).map(Number));

let endnotesSection = '';
for (let n = 1; n <= maxNote; n++) {
  if (endnotes[n]) {
    endnotesSection += `[^${n}]: ${endnotes[n].trim()}\n`;
  }
}

// Generate final MDX content
const header = `import {
  Anchor,
  Box,
  ChapterImage,
  ChapterLink,
  Contributor,
  ContributorEntity,
  ContributorName,
  ContributorRole,
  ContributorTag,
  ColumParagraphs,
  ColumParagraph,
  Definition,
  DefinitionDescription,
  EndnotesLink,
  HeadingLabel,
  QuestionAnswerBox,
  QuestionAnswerBoxBody,
  QuestionAnswerBoxTitle,
  Reccomendations,
  ReccomendationsTitle,
  SmallQuote,
  SmallQuoteAuthor,
  TableLabel,
  TohInsight,
} from '@/components/CustomComponents';

import {
  Deprivational,
  Digital,
  Informational,
  Longitudinal,
  Physical,
  Psychological,
  Social,
  Societal,
} from '@/components/icons/toh';
import { TypologyOfHarm } from '@/types/TypologyOfHarm';

export const title = 'Vérité, confiance et résilience dans le secteur humanitaire';

export const subtitle = "Les enjeux majeurs de la crise de l'information";

<ChapterImage imagePath="/wdr25/chapter-08/p-CMR481-AB_fmt.png" title="p-CMR481-AB_fmt" />

`;

const body = output.join('\n');
const finalContent = header + body + '\n\n' + endnotesSection;

fs.writeFileSync('./src/reports/fr/wdr25/chapter-08.mdx', finalContent, 'utf8');
console.log('✓ Written chapter-08.mdx (' + finalContent.length + ' chars)');
console.log('Lines:', finalContent.split('\n').length);
