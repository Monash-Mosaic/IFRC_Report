// Matches FlexSearch's own default normalization (NFKD decomposition + stripping combining
// marks - see node_modules/flexsearch/src/encoder.js) so "préjudiciables" and
// "prejudiciables" are treated as the same word, consistent with how they're actually
// indexed and matched.
function normalizeWord(word) {
  return word.normalize('NFKD').replace(/\p{Mn}/gu, '').toLowerCase();
}

const HIGHLIGHT_OPEN = '<em>';
const HIGHLIGHT_CLOSE = '</em>';

// Custom highlighter, replacing FlexSearch's own highlight_fields(). That function
// re-encodes each whitespace-separated word of the raw stored text to find where the
// query matches, then maps the match position back onto the original text via
// substring() - math that assumes encoding only ever shrinks text (its own comments only
// account for stripped punctuation). prepareEn/prepareFr (db.js) expand short acronyms
// during encoding ("AI" -> "ai artificial intelligence", 2 chars -> 26), and the query
// goes through the same expansion, so later expanded query terms overwrite the correct
// short match with garbage positions - producing an empty <em></em> instead of <em>AI</em>.
// Operating directly on raw text with our own word matching sidesteps this entirely.
function findWordMatches(text, queryWords) {
  // Split on runs of letters/numbers, keeping everything else (whitespace, punctuation,
  // hyphens, ...) verbatim, so re-joining reproduces the original text exactly. Odd
  // indices are word-forming runs, even indices are the separator runs between them.
  const parts = (text || '').split(/([\p{L}\p{N}]+)/u);
  // matchLength[i] = how many leading characters of parts[i] to highlight (0 = none).
  // A prefix match ("drive" matching "driven") should only highlight the matched prefix,
  // not the whole word, so this is a length rather than a boolean.
  const matchLength = new Array(parts.length).fill(0);
  let hasMatch = false;

  for (let i = 1; i < parts.length; i += 2) {
    const word = normalizeWord(parts[i]);
    let longest = 0;
    for (const q of queryWords) {
      if (word.startsWith(q) && q.length > longest) {
        longest = q.length;
      }
    }
    if (longest) {
      matchLength[i] = longest;
      hasMatch = true;
    }
  }

  return { parts, matchLength, hasMatch };
}

function renderHighlighted(parts, matchLength, start, end) {
  let str = '';
  for (let i = start; i <= end; i++) {
    const len = matchLength[i];
    str += len
      ? HIGHLIGHT_OPEN + parts[i].slice(0, len) + HIGHLIGHT_CLOSE + parts[i].slice(len)
      : parts[i];
  }
  // collapse a closing tag immediately followed by an opening tag (only whitespace, if
  // anything, between them) so adjacent highlighted words render as one continuous mark
  // instead of two separate ones.
  return str.replace(new RegExp(`${HIGHLIGHT_CLOSE}(\\s*)${HIGHLIGHT_OPEN}`, 'g'), '$1');
}

export function highlightTitle(text, queryWords) {
  const { parts, matchLength } = findWordMatches(text, queryWords);
  return parts.length ? renderHighlighted(parts, matchLength, 0, parts.length - 1) : '';
}

// Windows `parts` outward from `matchIndex` (a "word" index) until the character budget
// is spent, alternating sides so the match stays roughly centered.
function excerptWindow(parts, matchIndex, boundary) {
  let start = matchIndex;
  let end = matchIndex;
  let length = parts[matchIndex] ? parts[matchIndex].length : 0;
  let growRight = true;

  while (length < boundary && (start > 0 || end < parts.length - 1)) {
    const canGrowRight = end + 2 < parts.length;
    const canGrowLeft = start - 2 >= 0;

    if ((growRight && canGrowRight) || (!canGrowLeft && canGrowRight)) {
      end += 2;
      length += parts[end - 1].length + parts[end].length;
    } else if (canGrowLeft) {
      start -= 2;
      length += parts[start].length + parts[start + 1].length;
    } else {
      break;
    }
    growRight = !growRight;
  }

  // `start`/`end` only ever land on word indices (stepping by 2 from an odd index), so a
  // trailing/leading separator-only segment at the very edge of the text (e.g. closing
  // punctuation right after the last word) would otherwise never be included, triggering
  // a spurious ellipsis for text that isn't actually truncated.
  if (end + 1 === parts.length - 1) end++;
  if (start - 1 === 0) start--;

  return { start, end };
}

export function highlightExcerpt(text, queryWords, boundary = 500) {
  const { parts, matchLength, hasMatch } = findWordMatches(text, queryWords);
  if (!parts.length) return '';

  const anchor = hasMatch ? matchLength.findIndex((len) => len > 0) : 0;
  const { start, end } = excerptWindow(parts, anchor, boundary);

  const prefix = start > 0 ? '… ' : '';
  const suffix = end < parts.length - 1 ? ' …' : '';

  return prefix + renderHighlighted(parts, matchLength, start, end).trim() + suffix;
}
