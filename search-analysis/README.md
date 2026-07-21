# WDR25 Search — Corpus, Token & Ranking Analysis

**Date:** 2026-07-21 · **Branch:** `search-bug` · **FlexSearch:** 0.8.212 (D1-backed)

> **Update (config + ranking logic changed).** Two rounds of changes have landed since the
> first version of this report.
>
> **Round 1 — `src/lib/search/db.js`:** Latin locales moved off the soundex charsets
> (`LatinAdvanced`/`LatinBalance`) to **`Charset.Normalize`**; the **FR stemmer is now off**;
> **`rtl` is off for Arabic**; apostrophes are normalized per-locale before tokenizing; and
> **en acronym expansion is disabled** (the call in `prepareEn` is commented out), while `fr`
> keeps a **bidirectional** expansion.
>
> **Round 2 — `src/lib/search/flexsearch.js`:** `pluck` removed (titles are searched again),
> **`suggest: true`** (a document no longer needs every query term), and a hand-written
> **context re-rank** that scores title/excerpt proximity.
>
> **Net:** en/es typo-fuzz fixed; **fr is fixed too** now the stemmer is off (`santé` no longer
> stems to `s`); **Arabic returns results at all** again; the **`who` pronoun bug is gone** — but
> so is all acronym matching in en (`WHO` now returns **nothing**). The open problem has moved
> from *matching* to **ranking**: see §6.

Pre-work for making search "more straightforward with the search query and less fuzzy" across all
six locales. Everything below is measured from the actual MDX corpus in `src/reports/<locale>/wdr25`
and the **exact encoder configuration** in `src/lib/search/db.js`, using in-memory FlexSearch probes.
Reproduce with `node search-analysis/analyze-corpus.mjs` (raw numbers in `data/corpus-stats.json`).

**Scope note:** the citation **endnotes/references section is excluded** from all corpus statistics
below (per Q13). It is cut at the final "Endnotes"/"Notes de fin"/"Referencias"/… heading in each
file. This removed ~7.6% of the EN corpus and, notably, most URL-fragment noise — e.g. zh embedded
Latin tokens dropped from 332 (mostly citation URLs) to 17 (actual author names in prose).

---

## TL;DR — per-language verdict

| Locale | Verdict (current config) | Headline finding |
|---|---|---|
| en | **Matching fixed; ranking is the open problem** ✅⚠️ | Soundex gone: `govirnmend` no longer matches *government*; collisions 360 → **131**, survivors benign (*people/people's*, *risk/at-risk*). The `who`-pronoun bug is **gone** — but acronym expansion went with it, so `WHO` matches **nothing** and **67%** of acronym mentions are reachable by only one spelling. |
| fr | **Fixed** ✅ | Collisions 1,736 → **882** (baseline 610). The `FrenchPreset` stemmer is **off**, so `santé` is indexed as `sante`, not `s`. Acronym expansion here is **bidirectional** — `IA` and *intelligence artificielle* converge. Cost: a plural query no longer reaches a singular document. |
| es | **Fixed** ✅ | Soundex gone: `copierno` no longer matches *gobierno*; collisions 25 → **1** (== baseline). Still no stopword filter (`y`, `e`, `de` indexed). |
| ru | Mostly sane | Plain normalize + `prepareEn` (now just footnote/apostrophe cleanup). Corpus still largely **untranslated English**. |
| ar | **Unblocked** ✅⚠️ | `rtl: false` — queries return results again, including the exact indexed string. Still open: the definite article `ال` blocks bare-stem queries, and hamza still splits words in half. |
| zh | Works, char-based | Unchanged. Char n-gram + context; no word segmentation; embedded Latin names (e.g. *Pariser*) findable. |

**Cross-locale headline (en, measured):** the ranking now captures **21.2 of a possible 39.8**
click-share points (§6). Half of all searches are 1–2 words, and that is the bucket the ranking
handles worst.

---

## 1. Current pipeline (what is actually indexed and searched)

**Index build** (`scripts/build-search-index/index.mjs`): every MDX heading becomes a document
`{title: heading text, excerpt: following paragraphs}`. Only `paragraph` nodes and four JSX
components (`ChapterQuote`, `SideNote`, `SmallQuote`, `Spotlight`) contribute to excerpts.
**Not indexed:** table contents, the Acronyms page (raw `<div>` layout → empty excerpt → dropped),
`Definition` component bodies, image captions. Sections whose heading is followed only by
non-indexed content are dropped entirely (`.filter(e => !!e.excerpt)`).

**Query path**: full form submit to `/search?q=…` (server-rendered, `searchCacheAsync`), **no
type-ahead / live search**. The page requests **30 results** and renders them as one un-paginated
list. `pluck: "excerpt"` has been **removed**, so title-only matches are returned again; the call now
passes **`suggest: true`**, and the results are re-ordered by a hand-written `contextScore()` before
being sliced to the page limit.

**Per-locale encoder config** (`src/lib/search/db.js`) — **current** vs *(previous)*:

| Locale | Charset (current) | Was | Extras | Tokenize |
|---|---|---|---|---|
| en | **`Normalize`** | *`LatinAdvanced`* | EN stopwords, stemmer **off**, `prepareEn` = footnote + apostrophe strip (**acronym expansion disabled**) | forward |
| fr | **`Normalize`** | *`LatinBalance`* | FR stopwords, **stemmer off**, `prepareFr` = elision-aware apostrophes + **bidirectional** acronym expansion | forward |
| es | **`Normalize`** | *`LatinBalance`* | apostrophe strip, stemmer off | forward |
| zh | `CJK` (split every char) | — | none | strict + context |
| ar | `Normalize` | — | **`rtl: false`** (was `true` — this is what unblocked ar) | forward |
| ru | `Normalize` | — | `prepareEn` + stemmer off | forward |

**Search-time config** (`src/lib/search/flexsearch.js`): `field: ['title','excerpt']`, `merge: true`,
`enrich: true`, `suggest: true`, `limit = pageLimit × 3` (over-fetch, then re-rank, then slice).
`contextScore()` adds **10** for a title proximity match (depth 1 — words must be adjacent) and **3**
for an excerpt one (depth 2), plus a small closeness bonus.

Key mechanics discovered in the FlexSearch source:

- The old `LatinBalance`/`LatinAdvanced` charsets mapped chars **phonetically** (`b→p, v/w→f, z/x→s,
  d→t, n→m, c/g/j/q→k, i/y→e, u→o`, plus digraph merges and vowel-h deletion). **That soundex
  mapping was the main source of fuzziness, and it is now gone** for en/es/fr. `Normalize` keeps only
  lowercasing, NFKD diacritic folding, and consecutive-letter dedupe.
- **`prepare` is independent of the charset** and runs **after** lowercasing — which is why the `who`
  bug could never be fixed by case: the encoder cannot tell the acronym from the pronoun. It was
  fixed by disabling en expansion outright (see §3.1).
- **The language preset's `prepare` runs before the custom one.** The EN preset's contraction rules
  only recognise the *straight* apostrophe (its curly→straight rule is an upstream bug: a literal
  string where a character class was meant), so `people's` → `people` but `people’s` → `peoples`.
- **The FR stemmer lives in `FrenchPreset`, not the charset** — it is now explicitly disabled
  (`stemmer: false`), which is what actually de-fuzzed French (see §3.2).
- `tokenize: 'forward'` indexes every prefix of every term, and query terms also prefix-match
  (query `довер` finds `доверия`; query `trust` finds `trusted`). This is one-directional: a *plural*
  query cannot reach a *singular* document, which matters now that stemming is off.
- **`context` in `db.js` is dead config.** FlexSearch only populates context maps under
  `tokenize: 'strict'` (`src/index/add.js`); our fields are `forward`, so `depth`/`resolution` there
  do nothing. `contextScore()` in `flexsearch.js` is a manual reimplementation over the result set.

---

## 2. Corpus profile (the "popular corpus": what people will search for)

| Locale | Files | Tokens | Unique | Type/token | Headings (≈ docs) | Notes |
|---|---|---|---|---|---|---|
| en | 13 | 113,666 | 8,118 | 0.071 | 311 | Full report |
| fr | 13 | 146,537 | 10,124 | 0.069 | 263 | Full report; 3,334 accented + 1,310 apostrophe (elision) token types |
| es | 3 | 16,459 | 2,645 | 0.161 | 79 | Partial (ch. 1–2 + exec summary); 415 accented types |
| zh | 2 | 25,490 Han chars | 1,090 unique chars | — | 69 | Partial; 17 embedded Latin tokens (author names, e.g. *Pariser*, *Murrow*) |
| ar | 3 | 24,628 | 6,669 | 0.271 | 95 | Partial; **30.4% of tokens carry the definite article `ال`** |
| ru | 2 | 12,841 | 2,391 | 0.186 | 82 | Partial — and largely **still English text** (see §3.4). Production-off in `release.js`. |

**Most popular content terms** (stopwords removed — these are the realistic query vocabulary):

- **en:** information (1,745), humanitarian (1,342), harmful (895), trust (753), community/communities (935), media (405), action (408), actors (357), local (350), narratives, misinformation
- **fr:** informations (1,057), confiance (867), préjudiciables (830), humanitaires/humanitaire (1,309), communautés (648), principes (451)
- **es:** información (262), confianza (131), principios (105), humanitaria (103), dañina (91), acción (91)
- **ar:** المعلومات (313), الإنسانية (254), الضارة (253), الثقة (150), الإنساني (145), العمل (101)
- **zh** (top bigrams): 信息 (333), 人道 (319), 行动 (219), 信任 (135), 社区 (130), 原则 (117)
- **ru:** доверие-family and гуманитарн-family appear, but the top "Russian" tokens are actually *and, the, to, humanitarian, information* — untranslated content dominates.

**Acronyms are a first-class query class** in this corpus: AI (141), IFRC (61), UN (56), WHO (32),
CEA (23), RCCE (18), UNHCR (17), MDH (16), ICRC (14) — users will type these. (Counts dropped from
the endnote-inclusive figures because acronyms are dense in citations.)

---

## 3. Findings per language (with evidence)

### 3.1 English — soundex removed ✅; acronyms lost with the bug ⚠️

**Collisions: 360 (previous) → 131 (current), vs. 59 baseline.** Dropping soundex removed **64%** of
collision groups, and the *character* of the survivors changed completely. Under the old encoder they
were phonetic confusions; under `Normalize` they are almost all **benign** — possessives and
hyphen-compounds that arguably *should* match:

| Encoded as (current) | Conflated corpus words (freq) | Verdict |
|---|---|---|
| `people` | people:377, people's:1 | benign (possessive) |
| `risk` | risk:210, at-risk:9 | benign (compound) |
| `organizations` | organizations:71, organization’s:1 | curly possessive merges with the **plural** |
| `human` | human:97, human-like:4, human-made:2 | benign (compound) |

For comparison, the old encoder merged *need/meet/net/myth* → `met` and *crisis/crises* → `kreses`.
**Probes confirm the fix:** `goverment` and `govirnmend` now return **no match** (both were
*government* before). `trust` → *trusted* still works (forward prefix, desirable).

**✅ The `who` bug is gone — ⚠️ and so is acronym matching.** `prepareEn`'s expansion call is
commented out, so the relative pronoun is no longer rewritten into *world/health/organization*
(previously **81%** of expansions were false: lowercase *who* 122 + *Who* 17 against acronym *WHO*
32). The replacement problem:

- `WHO` as a query encodes to **`[]`** — `who` is on the EN stopword list, so the acronym is
  *unresolvable*, not merely unexpanded. Same shape of failure for `Q&A`, which the preset's
  `& → and` rule reduces to the single letter **`q`**.
- Acronym and expansion are now unrelated token sets. Over the real 327-document index, **18 of 25**
  measurable acronyms appear somewhere in only one of their forms, and **148 of 220 document-mentions
  (67%)** are reachable by one spelling and invisible to the other — *AI* is the extreme: **63**
  documents use the acronym, **8** spell it out, and a search for *artificial intelligence* reaches
  only those 8.
- French shows the shape of the fix: `prepareFr` collapses expansion → acronym **first**, then
  expands, so `IA` and *intelligence artificielle* both encode to `[ia, inteligence, artificiele]`
  and either spelling finds both kinds of document.

**⚠️ Short acronyms are also a _ranking_ failure, and that half is not fixed by expansion.**
`tokenize: 'forward'` matches a query term against every indexed term it prefixes, so a two-letter
acronym is a prefix, not a word. In this corpus `ai…` is mostly **aid** and **aims**:

| indexed term | occurrences | documents |
|---|---|---|
| `ai` | 181 | 63 |
| `aid` | 116 | 60 |
| `aims` | 30 | 30 |
| `aim` | 27 | 25 |

A query for **`AI` returns 104 of 327 sections** — a third of the report — of which only 63 contain
the acronym. And because `contextScore()` pays **10 for a title hit vs 3 for an excerpt hit**, and
pays it for a *prefix* hit, **100% of the top three** are sections called *"Asks, **aims** and
recommendations"* / *"Information as **aid**"*. The pages actually about AI (*"UN action on AI and
information integrity"*, *"Artificial intelligence and harmful information"*) are pushed below them.

| query | encodes to | results | top-3 title hits that are prefix accidents |
|---|---|---|---|
| `AI` | `ai` | 104 | **100%** |
| `AI-generated` | `ai`, `generated` | 104 | 0% (the second term does the filtering) |
| `artificial intelligence` | `artificial`, `inteligence` | 14 | 0% |
| `Q&A` | `q` — the preset rewrites `&`→` and ` | 93 | **67%** (*quality*, *quarter*, *questions*) |
| `WHO` | — (nothing) | 0 | n/a |

No charset change can tell *aid* from *AI* when the user typed two letters — this is fixed in the
ranking, by weighting exact whole-word hits above prefix hits (§7, finding 7).

**Stopword list still removes content words:** FlexSearch's EN filter drops *time, work, good, new,
know, think, way, use, back* — plausible queries here ("aid work", "screen time") that can't match.

### 3.2 French — fixed: the stemmer was the problem, and it is now off ✅

**Collisions: 1,736 (previous) → 882 (current), vs. 610 baseline.** The previous revision of this
report blamed the **`FrenchPreset` stemmer** rather than soundex; that diagnosis held, and
`stemmer: false` is now set. `santé` is indexed as **`sante`**, not the single letter `s`.

Probes: `gonfiance` (soundex typo) returns **no match**; `santé` and `sante` both reach the *santé*
document. Elision handling was rewritten — `stripApostrophesFr` drops the elided particle rather than
fusing it (`l'IA` → `ia`, not `lia`), which is what had made *IA* vanish from French documents.

Two things follow from turning stemming off, and they are real trade-offs, not regressions to undo:

- Morphology now rides entirely on forward prefixes, which only work in one direction: query
  `confiances` no longer reaches indexed `confiance` (the prefix runs the wrong way). Singular →
  plural still works.
- Remaining collisions (882 vs. a 610 baseline) are mostly the acronym expansion doing its job:
  every document that spells out *organisation mondiale de la santé* now shares terms with `OMS`.

### 3.3 Spanish — fixed ✅

**Collisions: 25 (previous) → 1 (current) == baseline.** Soundex gone: `copierno` **no longer
matches** *gobierno* (probe confirms). Diacritic folding still works (`proteccion` = *protección*);
plural matching still works via forward prefix (`gobierno` → *gobiernos*). Remaining gap: **still no
stopword filter**, so `y` (~870×), `e`, `de`, `la` are indexed as terms and add noise.

### 3.4 Russian — encoder is fine; the corpus is the problem

Plain `Normalize` yields only 2 collision groups. Inflection handling is accidentally decent:
probe shows query `доверие` (nominative) matches indexed `доверия` (genitive) via shared-prefix
matching, and `ё→е` folding works (`надёжный` ≡ `надежный` after NFKD). `ru` shares `prepareEn`,
which is now only footnote/apostrophe cleanup — harmless here, and no longer carrying the English
acronym rewrites it once inherited. The real issue remains: the ru files are largely untranslated
English (top tokens *and:905, the:345*), and ru is `production: false` — a content problem, not an
encoder problem.

### 3.5 Arabic — unblocked ✅, two known gaps remain

Controlled probe, exact production config (`Normalize` + **`rtl: false`** + forward):

```
doc: "انعدام الثقة في المؤسسات الإنسانية"
query "الثقة"   → matches   (was 0 results under rtl: true)
query "انعدام"  → matches   (was 0 results)
query "ثقة"     → still 0   (bare stem; the definite article is in the way)
```

**`rtl: true` had caused FlexSearch 0.8 to index forward-prefixes from the wrong end while the query
side looked up the logical string, so nothing ever matched.** That flag is now `false` and Arabic — a
released locale — returns results again. This was the single highest-impact fix in the round.

Two ar-specific issues remain:
- **Hamza fragmentation:** NFKD decomposes `ؤ` into `و` + combining hamza; the combining mark isn't
  in FlexSearch's strip range and acts as a *word splitter*: `المؤسسات` encodes as two tokens
  `["المو", "سات"]`. Queries typed with (or without) hamza variants (`أ إ آ ؤ ئ`) won't match.
  (This also shows up in the corpus stats as bogus single-letter "top tokens" like `ا`, `ت`.)
- **Definite article:** 30.4% of corpus tokens start with `ال`. A bare-stem query `ثقة` cannot match
  indexed `الثقة` (prefix matching works from the left; the article is in the way). Users who type
  without the article get nothing.

### 3.6 Chinese — char-based works, within limits

`Charset.CJK` splits every char; `strict + context` requires query chars to appear in sequence.
Probes: `信任` matches; `Pariser` (Latin name inside zh text) matches — char-split does not break
embedded Latin; `错误信息` (word not contiguous in the doc) correctly does not match. There is **no
word segmentation**, so matching is effectively substring-of-text: querying `人道` also matches
inside `非人道` style compounds — generally acceptable for zh search, and *not* fuzzy in the soundex
sense. The 1,090 unique chars / 25k char corpus is small enough that this stays fast.

---

## 4. Cross-cutting issues (affect all locales)

1. **✅ Fixed — `pluck: "excerpt"` is gone**, so a query matching only a section heading returns that
   section, and titles are weighted 10× excerpts in the re-rank.
2. **✅ Largely resolved — highlighting ↔ matching consistency.** FlexSearch's own `highlight_fields`
   assumed encoding only ever *shrinks* text, which acronym expansion violated (`AI` → 26 chars),
   producing empty `<em></em>`. It has been replaced by `src/lib/search/highlight.js`, which matches
   on raw text with the same prefix rule the index uses, so a prefix hit highlights just the matched
   prefix. With soundex and en expansion both gone, index hits and visible highlights now line up.
3. **⚠️ New — ranking, not matching, is the weak point.** `suggest: true` means partial matches sit
   in the same ordered list as complete ones with nothing to separate them, and `contextScore()` is
   too coarse to order short queries at all. Measured in §6.
4. **Coverage gaps:** Acronyms page (pure `<div>`s), table contents, and `Definition` bodies are
   never indexed. Users searching `DREF` in a locale where the acronym only appears in the acronyms
   page or a table get nothing.
5. **No minimum query length / no query normalization beyond trim** — a 1-char query is allowed and,
   with forward-prefix indexes, matches huge portions of the corpus (especially fr, where whole
   words already collapse to 1–2 letters).
6. **Index size note:** forward tokenization stores every prefix of every term (and for zh, context
   pairs); moving en/fr/es to stricter charsets would also shrink the D1 tables and speed up lookups.

---

## 5. Questions on intent — please answer before implementation

Each question notes the current behavior and a recommended default. These decide what "less fuzzy,
more straightforward" concretely means. **Status tags reflect the config change already applied.**

**Q1 — Typo tolerance. ✅ ADDRESSED.** The soundex charsets were dropped (`LatinAdvanced/Balance` →
`Normalize`) for en/es/fr. Verified: `govirnmend` (en) and `copierno` (es) no longer match; the FR
soundex-typo path (`gonfiance`) is also gone. Diacritic folding is retained. *Note: `suggest: true`
was since enabled, but it loosens **term coverage**, not spelling — a misspelled single-word query
still returns nothing.*

**Q2 — Partial-word (prefix) matching. ➖ UNCHANGED.** `trust` still matches *trusted*, `довер` still
matches *доверия*. The UI is submit-based (no type-ahead). *Recommendation: keep `forward` — it is
cheap, predictable, and it is what rescues ru/ar/es inflections now that soundex is gone. Confirm
whether type-ahead is on the roadmap, since that would lock in `forward`.*

**Q3 — Word-form matching (morphology). ✅ ADDRESSED.** With soundex gone, *crisis/crises* etc. match
via **prefix overlap** rather than phonetics, and the FR stemmer is now **off** (`santé` → `sante`).
*Residual: prefix matching is one-directional, so a plural query cannot reach a singular document
(`confiances` misses `confiance`). If that turns out to matter, the fix is a bounded, single-pass
suffix rule — not the recursive preset stemmer.*

**Q4 — Acronyms. ⚠️ STILL OPEN — the failure mode flipped.** en expansion is now **disabled**, which
killed the pronoun bug and, with it, all acronym↔expansion matching: `WHO` encodes to nothing (it is
a stopword), `Q&A` encodes to `q`, and 67% of acronym mentions are reachable by only one spelling.
`prepareFr` meanwhile was made **bidirectional** and works correctly. Options: (a) leave it — acronyms
match only literally, and `WHO`/`Q&A` never match at all; (b) port `prepareFr`'s bidirectional
collapse to en; (c) expand on the **query** side only, as OR-synonyms. *Recommendation: (b) plus
dropping `who` from the stopword filter, and index the Acronyms page so literal lookups always land
somewhere. Note case cannot disambiguate — the encoder lowercases before `prepare` sees text — so a
bidirectional collapse is safe only because it maps both spellings to the **same** token set rather
than injecting new content words.*

**Q5 — Stopwords.** en filters *time, work, good, new, way…* (plausible queries here); es/ru/ar/zh
filter nothing (so `de`, `и`, `的` are indexed). Should stopword filtering be (a) removed everywhere
for literal predictability, (b) kept but with a corpus-appropriate trimmed list, (c) extended to
es/ru/ar/zh? *Recommendation: (b) for en/fr with the content-words removed from the filter; add a
minimal es list; leave ru/ar/zh unfiltered.*

**Q6 — Arabic priorities. ✅ PARTLY ADDRESSED.** `rtl` is now `false` and ar returns results again —
the highest-impact fix of the round, and done. Remaining: (b) should a bare-stem query `ثقة`
match `الثقة` (article-insensitive matching — needs an `ال`-aware variant index or query rewrite);
(c) should hamza/alef variants (`أ إ آ ا`, `ؤ`, `ئ`, `ة/ه`) be folded? *Recommendation: yes to all
three; (a) is a one-line fix, (b)+(c) via a small ar `prepare`.*

**Q7 — Chinese.** Is char-sequence matching acceptable (matches inside compounds, no true word
segmentation), or is dictionary-based segmentation wanted? Should Latin names/terms inside zh text
remain searchable (they are today)? *Recommendation: keep char-based + context; it is standard for
CJK search at this corpus size.*

**Q8 — Multi-word query semantics. ✅ CHANGED — now `suggest: true`.** A document no longer has to
contain every term. **The measurements back the choice**: on queries whose words are spread across
two documents, strict AND returns **nothing at all 31%** of the time, while the ranking cost of
`suggest: true` is under half a click-point (§6). *But it is only half-implemented: nothing separates
partial matches from complete ones, so 34% of top-3 slots for a 3–5 word query — and 57% for a 6+
word query — go to documents missing a word the user typed. Recommendation: keep `suggest: true`,
add a coverage-first sort (§6); optionally show partial matches under a "fewer terms" divider.*

**Q9 — Title matches. ✅ FIXED.** `pluck: 'excerpt'` is gone; both fields are searched and merged, and
`contextScore()` weights a title match 10 against an excerpt's 3, so heading hits surface first.

**Q10 — Coverage.** Should tables, the Acronyms page, and Definition/glossary bodies be indexed?
*Recommendation: at minimum the Acronyms page and Definition bodies; they are exactly the
lookup-style content people search for.*

**Q11 — Russian rollout.** ru corpus is mostly untranslated English and production-disabled — is ru
search in scope for this round, or deferred until translation lands?

**Q12 — Success criteria. ⚠️ STILL OPEN.** The probe suite in `analyze-corpus.mjs` and the worked
failures in `multi-match-eval.mjs` are ready-made regression tests (e.g. "exact Arabic word must
match", "`govirnmend` must NOT match", "`santé` must not collapse below 4 chars", "a 3-word query
lifted from a section must rank that section top-3"). Should these land in `tests/lib/search` as part
of the implementation? *There is now also a single number to hold the line on: clicks captured
(currently 21.2 / 39.8) — a ranking change that lowers it is a regression.*

**Q13 — Endnotes.** Citation endnotes are 7.6% of the EN corpus (9,289 tokens): one giant "Endnotes"
document per chapter that matches almost any query, including ~1,600 URL-fragment tokens (`www`,
`doi`, `org`, plus `who`-in-URL false acronym expansions). **This analysis now excludes them**
(cut at the final endnotes heading; see the scope note up top) — and so does the **production
index**: `build-search-index` now skips content under an `EXCLUDED_HEADINGS` title
(*endnotes* / *notes de fin*), and sections left with an empty excerpt are dropped. ✅ **Done, both
sides.** *Still open if source/author lookup ever matters: index one document per note with URLs
stripped, ranked below prose.*

**Q14 — Result ordering. ⚠️ OPEN — now the largest lever.** New question, raised by §6. Ranking is
currently a coarse hand-written score (title 10 / excerpt 3 + proximity) applied over a `suggest:true`
result set. It captures **21.2 of a possible 39.8** click-share points; the re-rank itself is worth
+8.7 of that, but short queries — **51% of traffic** — sit at 13.5 with **84%** of first pages
effectively tied. Confirm the priority order in §6: (1) tie-breakers for short queries, (2)
coverage-first sort, (3) stopword-consistent gap calculation. *Recommendation: (1) and (2) together;
they are small, local changes to `flexsearch.js` and are measurable before/after with
`multi-match-eval.mjs`.*

---

## 6. Multi-word queries & ranking (en, measured)

Everything above is about *matching* one word at a time. Roughly **half of all searches are decided
by multi-term behaviour**, and none of the analysis above touches it. Observed query-length mix:
**~51% are 1–2 words, ~43% are 3–5 words, ~6% are 6+ words.**

`multi-match-eval.mjs` builds the real 327-document en index (same mdast extraction as the build
script, encoder imported from `db.js` so it cannot drift), then runs **1,500 known-item queries** in
that 51/43/6 mix — each query is a verbatim word-run lifted from a document, so one correct answer is
known without human labels — through the **real** ranking code from `flexsearch.js`.

**Scoring.** Results are weighted by the organic click curve: **p1 39.8%, p2 18.7%, p3 10.2%
(top-3 = 68.7%), p6 4.4%, p10 1.6%**; p4–5 and p7–9 are geometric interpolation between those
anchors, and below p10 counts as zero (the page is one un-paginated list). A ranking's score is the
**share of clicks it can capture**, ceiling **39.8**.

| Ranking | Clicks captured (weighted) | 1–2 words | 3–5 words | 6+ words |
|---|---|---|---|---|
| `suggest:true`, no re-rank | 12.5 | 10.5 | 15.1 | 11.4 |
| **production** (`suggest:true` + context re-rank) | **21.2** | 13.5 | 28.9 | 31.5 |
| `suggest:false` (AND), no re-rank | 17.9 | 11.5 | 23.8 | 29.3 |
| `suggest:false` (AND) + re-rank | 21.6 | 13.6 | 29.4 | 33.6 |
| **candidate:** `suggest:true` + coverage-first, then context | **21.6** | 13.5 | 29.4 | 34.2 |
| *rejected:* exact-match gate (whole word must outrank prefix) | 15.3 | 12.0 | 19.1 | 16.0 |
| **candidate:** coverage-first + **graded** score | **21.6** | **13.8** | 29.1 | 34.2 |

**Findings:**

1. **The manual context re-rank is worth +8.7 click-points (+69%)** — the largest single effect
   measured anywhere in this analysis. Without it FlexSearch's own ordering captures 12.5.
2. **Short queries are the weak spot, and they are half the traffic.** 1–2 word queries capture
   **13.5 of 39.8** against 28.9 for 3–5 words; the known answer is ranked #1 only **24%** of the
   time, a median of **64 documents** come back, and **84%** of first pages collapse onto ≤2 distinct
   scores — inside a tie the order is FlexSearch's insertion order, i.e. arbitrary. Lifting this
   bucket to the 3–5 word bucket's quality would take the total to **29.0 / 39.8**, roughly **42% of
   all remaining headroom**.
3. **`suggest: true` is right, but half-finished.** It costs ~0.4 click-points against strict AND
   while eliminating a **31%** zero-result rate on cross-document queries. The unpaid half:
   partial matches are not distinguished from complete ones, so **34%** (3–5 words) and **57%**
   (6+ words) of top-3 slots hold documents missing a query term. Sorting complete matches first —
   ~10 lines — recovers most of it (dilution to 17%/32%, cross-document top-3 term coverage
   **63% → 85%**) at equal ranking quality.
4. **`contextScore()` charges the query for words it already discarded.** `contextMatchGap()` strips
   stopwords from the query but not from the document text it walks, so *"trust **in**
   institutions"* must clear a gap the query no longer knows about — fatal at title depth 1, where
   words must be adjacent. Multi-word queries containing a stopword engage the re-rank **82%** of the
   time versus **100%** without, and capture ~7 fewer click-points within the same bucket.
5. **More words currently widen the result set.** A 6+ word query returns a median of **96 of 327**
   documents — the opposite of what someone typing a longer, more specific query expects.
6. **A longer results page is not the fix.** Opening the page limit all the way to the corpus takes
   short-query recall from 82% (at today's `limit=30`) to **100%** — retrieval works, the answer is
   simply buried — but **clicks captured do not move at all**: 13.49 at 10 results, 13.49 at 327,
   because the CTR curve is ~0 past position 10. Reaching 90% recall on short queries would need a
   **49-result** page and a 3× larger fetch, for zero click value.

   | results shown | 1–2 w: answer on page | 1–2 w: clicks | 3–5 w | 6+ w |
   |---|---|---|---|---|
   | 10 | 61.7% | 13.49 | 92.4% | 95.6% |
   | 30 (today) | 82.2% | 13.49 | 96.9% | 98.9% |
   | 49 | 90.2% | 13.49 | 97.8% | 100% |
   | 327 (whole corpus) | 100% | 13.49 | 100% | 100% |

7. **Prefix hits and exact hits must be scored differently — but as a bonus, not a gate.** §3.1's
   `AI` case is a ranking bug: a title containing *aims* earns the same 10 points as one containing
   *AI*. Making a whole-word hit outrank a prefix hit **lexicographically** fixes that query and
   **costs 5.9 click-points overall** (21.2 → 15.3), because prefix matching is what carries
   morphology now that stemming is off — it disqualifies the right document whenever someone types
   *challenge* and the section says *challenges*. Expressing the same preference as a **graded
   score** (title 10 exact / 4 prefix, excerpt 3 / 1, plus a damped term-frequency bonus) scores
   **21.6 — the best measured — and is the only variant that improves the 1–2 word bucket**
   (13.49 → 13.80, top-3 42.5% → 45.1%). On the `AI` query it drops top-3 prefix accidents from
   **100% to 33%** and surfaces the actual AI sections.

Priority order for the ranking work, by clicks recovered: **(1)** the graded score (finding 7),
**(2)** coverage-first sort, **(3)** stopword-consistent gap calculation, **(4)** bidirectional
acronyms (Q4), **(5)** regression tests. Explicitly *not* on the list: raising the page limit
(finding 6) and any further encoder change (§3 — matching is no longer where the loss is). Full
detail, charts and worked failure cases in the notebook's §7.

---

## 7. Files

- `analyze-corpus.mjs` — reproducible corpus/encoder analysis. The **current** config is imported
  from `src/lib/search/db.js` (not copied, so it cannot drift); the **previous** (soundex + acronym
  expansion) config and the plain-`Normalize` baseline are kept locally, so the collision audit stays
  a before/after. Also runs behavioural probes with the production field config and search options.
  Run: `node search-analysis/analyze-corpus.mjs`.
- `multi-match-eval.mjs` — the ranking benchmark behind §6. Rebuilds the real en document set with
  the build script's mdast rules, indexes it with the production encoder, and scores five rankings
  over 1,500 known-item queries in the observed 51/43/6 length mix, plus 400 cross-document queries,
  using the click-through curve. Run: `node search-analysis/multi-match-eval.mjs`.
- `data/corpus-stats.json` — full raw output: per-locale token frequencies, collision groups
  (`currentEncoder` / `previousEncoder` / `normalizeBaseline`) with examples, probe outcomes, samples.
- `data/multi-match-eval.json` — per-bucket and per-variant ranking metrics, cross-document results,
  acronym reachability, and worked failure cases.
- `en_search_analysis.py` — interactive marimo notebook, **English only**: live corpus stats and
  charts, Python ports of **both** en encoders (current + previous), each validated byte-for-byte
  against FlexSearch 0.8.212 over all 8,118 corpus tokens, the before/after collision audit, the
  acronym gap left by disabling expansion, a query explorer showing current-vs-previous reach, and
  the full multi-word ranking analysis with charts.
  Run: `uvx marimo edit --sandbox search-analysis/en_search_analysis.py`.
- `data/en-token-encodings.json` — ground-truth encodings from the real JS encoder for every unique
  EN corpus token, under all three encoders (`current` / `previous` / `baseline`); used by the
  notebook's validation cell. Regenerated by `analyze-corpus.mjs`.
