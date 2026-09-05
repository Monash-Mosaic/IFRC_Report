# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "marimo>=0.23.3",
#     "altair==6.2.2",
#     "pandas==3.0.3",
#     "regex==2026.7.19",
#     "mcp==1.28.1",
# ]
# ///
"""WDR25 search — English corpus, token & multi-word ranking analysis (marimo notebook).

Run with:  uvx marimo edit --sandbox search-analysis/en_search_analysis.py
Or:        uv run search-analysis/en_search_analysis.py   (script mode, smoke test)

Companion to search-analysis/README.md (full six-locale report). This notebook
focuses on `en` only and is self-contained: it re-derives every statistic from
the MDX corpus with a Python port of the production FlexSearch encoder, and
validates that port byte-for-byte against ground truth dumped from the real
JS encoder (data/en-token-encodings.json).

Regenerate the data it reads before running:
    node search-analysis/analyze-corpus.mjs        -> data/corpus-stats.json,
                                                      data/en-token-encodings.json
    node search-analysis/multi-match-eval.mjs      -> data/multi-match-eval.json
"""

import marimo

__generated_with = "0.23.14"
app = marimo.App(width="medium")


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # WDR25 Search — English corpus & token analysis

    **Goal:** make search *more straightforward and less fuzzy*. The `en` encoder in
    `src/lib/search/db.js` was **updated** — from `Charset.LatinAdvanced` (soundex
    phonetics) to **`Charset.Normalize`**. This notebook measures the **before/after**:
    it ports both encoders and quantifies what the change fixed (typo over-matching)
    and what it did **not** (the `who` acronym bug — see §4).

    Everything is computed live from `src/reports/en/wdr25/*.mdx` using Python ports
    of the FlexSearch 0.8.212 encoders (current + previous), **validated against the
    real JS encoder** (see the validation cell). The six-locale analysis and the
    intent questions live in [README.md](README.md).
    """)
    return


@app.cell
def _():
    import marimo as mo

    return (mo,)


@app.cell
def _():
    import json
    import re
    import unicodedata
    from collections import Counter
    from pathlib import Path

    import altair as alt
    import pandas as pd
    import regex

    return Counter, Path, alt, json, pd, re, regex, unicodedata


@app.cell
def _(Path, mo):
    try:
        NOTEBOOK_DIR = Path(str(mo.notebook_dir()))
    except Exception:
        NOTEBOOK_DIR = Path(__file__).resolve().parent
    REPO_ROOT = NOTEBOOK_DIR.parent
    CORPUS_DIR = REPO_ROOT / "src" / "reports" / "en" / "wdr25"
    DATA_DIR = NOTEBOOK_DIR / "data"
    return CORPUS_DIR, DATA_DIR


@app.cell
def _(DATA_DIR, json):
    # Ranking benchmark results (node search-analysis/multi-match-eval.mjs). Used by §4
    # for acronym reachability and by all of §7.
    _mm_path = DATA_DIR / "multi-match-eval.json"
    mm = json.loads(_mm_path.read_text()) if _mm_path.exists() else None
    return (mm,)


@app.cell
def _(CORPUS_DIR, re):
    def strip_endnotes(source):
        """Drop the endnotes/references section (citation footnotes).

        Footnote definitions ([^N]: ...) sit under a final heading
        ("Endnotes"/"Notes de fin"/"Referencias"/…) and run to EOF; cut from that
        heading onward, keyed off the first definition so no name is hardcoded.
        Excluded per README Q13 — 7.6% of the EN corpus, mostly citation/URL noise.
        """
        first = re.search(r"^\[\^[0-9]+\]:", source, flags=re.M)
        if not first:
            return source
        cut = first.start()
        headings = list(re.finditer(r"^#{1,6}\s+.*$", source[:cut], flags=re.M))
        if headings:
            cut = headings[-1].start()
        return source[:cut]

    def strip_mdx(source):
        """MDX -> plain text; approximates scripts/build-search-index extraction."""
        headings = []
        text = re.sub(r"^import[\s\S]*?from\s+['\"][^'\"]*['\"];?", "", strip_endnotes(source), flags=re.M)

        def _grab_heading(m):
            headings.append(m.group(3))
            return ""

        text = re.sub(
            r"^export const (title|subtitle)\s*=\s*(['\"])([\s\S]*?)\2;?\s*$",
            _grab_heading, text, flags=re.M,
        )
        text = re.sub(r"^export const \w+\s*=\s*\{[\s\S]*?^\};?", "", text, flags=re.M)
        text = re.sub(r"^export const \w+\s*=\s*\[[\s\S]*?^\];?", "", text, flags=re.M)
        text = re.sub(r"^export .*$", "", text, flags=re.M)
        text = re.sub(r"```[\s\S]*?```", "", text)
        text = re.sub(r"!\[([^\]]*)\]\([^)]*\)", r"\1", text)
        text = re.sub(r"\[([^\]]*)\]\(([^)]*)\)", r"\1", text)
        text = re.sub(r"\[\^[0-9]+\]:?", "", text)

        def _grab_md_heading(m):
            headings.append(m.group(1).strip())
            return m.group(1)

        text = re.sub(r"^#{1,6}\s+(.*)$", _grab_md_heading, text, flags=re.M)
        for _ in range(8):
            text = re.sub(r"\{[^{}]*\}", " ", text, flags=re.S)
        for _ in range(8):
            text = re.sub(r"</?[A-Za-z][^<>]*?>", " ", text, flags=re.S)
        text = re.sub(r"^>\s?", "", text, flags=re.M)
        text = re.sub(r"[*_~`|]+", " ", text)
        text = re.sub(r"^-{3,}\s*$", " ", text, flags=re.M)
        return re.sub(r"[ \t]+", " ", text).strip(), headings

    corpus_files = sorted(_p for _p in CORPUS_DIR.glob("*.mdx"))
    corpus_text = ""
    corpus_headings = []
    for _p in corpus_files:
        _text, _headings = strip_mdx(_p.read_text(encoding="utf-8"))
        corpus_text += "\n" + _text
        corpus_headings.extend(_headings)
    return corpus_files, corpus_headings, corpus_text


@app.cell
def _(Counter, corpus_text, regex):
    # Same tokenizer as analyze-corpus.mjs: /[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu
    WORD_RE = regex.compile(r"[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*")
    raw_tokens = WORD_RE.findall(corpus_text)
    token_freq = Counter(_t.lower() for _t in raw_tokens)
    acronym_freq = Counter(
        _t for _t in raw_tokens if regex.fullmatch(r"[A-Z][A-Z0-9&]+", _t) and len(_t) >= 2
    )
    return acronym_freq, raw_tokens, token_freq


@app.cell(hide_code=True)
def _(corpus_files, corpus_headings, mo, raw_tokens, token_freq):
    mo.hstack(
        [
            mo.stat(value=f"{len(corpus_files)}", label="MDX files"),
            mo.stat(value=f"{len(raw_tokens):,}", label="tokens"),
            mo.stat(value=f"{len(token_freq):,}", label="unique tokens"),
            mo.stat(
                value=f"{len(corpus_headings)}",
                label="headings",
                caption="each heading = one searchable document",
            ),
            mo.stat(
                value=f"{len(token_freq) / max(1, len(raw_tokens)):.3f}",
                label="type/token ratio",
            ),
        ],
        justify="start",
        gap=2,
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 1. The popular corpus — what people will actually search for

    Top content words (FlexSearch's EN stopword list removed). These, plus the
    acronyms below them, are the realistic query vocabulary; every encoder
    decision should be judged against them.
    """)
    return


@app.cell(hide_code=True)
def _(alt, mo, pd):
    try:
        _dark = mo.app_meta().theme == "dark"
    except Exception:
        _dark = False
    chart_hue = "#3987e5" if _dark else "#2a78d6"  # dataviz slot-1 blue, per mode
    chart_ink = "#9a9a9a"
    # Categorical slots 1/2/4 (blue, green, yellow), stepped per mode. Validated for
    # colourblind separation and contrast against both surfaces; every chart that uses
    # more than one of them also carries direct value labels, which is what the
    # blue/green tritan margin and the yellow contrast warning require.
    series_hue = (
        ["#3987e5", "#008300", "#c98500"] if _dark else ["#2a78d6", "#008300", "#eda100"]
    )

    def styled_bar_chart(df, x_field, y_field, x_title, height):
        return (
            alt.Chart(df)
            .mark_bar(
                cornerRadiusTopRight=4,
                cornerRadiusBottomRight=4,
                height={"band": 0.55},
                color=chart_hue,
            )
            .encode(
                x=alt.X(
                    f"{x_field}:Q",
                    title=x_title,
                    axis=alt.Axis(
                        gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                        labelColor=chart_ink, titleColor=chart_ink,
                    ),
                ),
                y=alt.Y(
                    f"{y_field}:N",
                    sort="-x",
                    title=None,
                    axis=alt.Axis(
                        domainOpacity=0, tickOpacity=0,
                        labelColor=chart_ink, labelFontSize=12, labelLimit=180,
                    ),
                ),
                tooltip=[y_field, x_field],
            )
            .properties(width=480, height=height, background="transparent")
            .configure_view(strokeWidth=0)
        )
    _ = pd  # styled_bar_chart consumers pass pandas frames
    return chart_ink, series_hue, styled_bar_chart


@app.cell
def _(pd, token_freq):
    # FlexSearch EN stopword list (flexsearch/dist/module/lang/en.js), verbatim
    EN_STOPWORDS = set(
        "a about above after again against all also am an and any are arent as at back be "
        "because been before being below between both but by can cannot cant come could "
        "couldnt did didnt do does doesnt doing dont down during each even few for from "
        "further get go good had hadnt has hasnt have havent having he hed her here heres "
        "hers herself hes him himself his how hows i id if ill im in into is isnt it its "
        "itself ive just know lets like lot make made me more most mustnt my myself new no "
        "nor not now of off on once one only or other ought our ours ourselves out over own "
        "same say see shant she shed shell shes should shouldnt so some such take than that "
        "thats the their theirs them themselves then there theres these they theyd theyll "
        "theyre theyve think this those through time times to too under until up us use very "
        "want was wasnt way we wed well were werent weve what whats when whens where wheres "
        "which while who whom whos why whys will with wont work would wouldnt ya you youd "
        "youll your youre yours yourself yourselves youve".split()
    )
    content_tokens = pd.DataFrame(
        [
            {"token": _t, "count": _n}
            for _t, _n in token_freq.most_common()
            if _t not in EN_STOPWORDS and not _t.isdigit()
        ]
    )
    return EN_STOPWORDS, content_tokens


@app.cell
def _(content_tokens):
    content_tokens
    return


@app.cell(hide_code=True)
def _(content_tokens, styled_bar_chart):
    styled_bar_chart(content_tokens[:100], "count", "token", "occurrences in corpus", 520)
    return


@app.cell(hide_code=True)
def _(acronym_freq, mo, pd, styled_bar_chart):
    _df = pd.DataFrame(
        [{"acronym": _t, "count": _n} for _t, _n in acronym_freq.most_common(50)]
    )
    mo.vstack(
        [
            mo.md(
                "**Acronyms are a first-class query class** — counted on original casing. "
                "Note the Acronyms page itself is *not indexed* (raw `<div>` layout is "
                "skipped by the index builder)."
            ),
            styled_bar_chart(_df, "count", "acronym", "occurrences in corpus", 340),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 2. The encoder — before & after the config change

    **The config was updated:** the en field encoder went from `Charset.LatinAdvanced`
    (soundex) to **`Charset.Normalize`**, and `prepareEn` no longer expands acronyms.
    The pipeline (verified against `flexsearch/dist/module/encoder.js`):

    1. NFKD normalize → strip combining marks → **lowercase**
    2. `prepare`: EnglishPreset contraction rewriting, **then** `prepareEn`
       (`merge_option` chains both, preset first). `prepareEn` today is
       `expandEnAcronyms(stripApostrophes(stripFootnotes(str)))` — footnote refs out,
       apostrophes deleted, then **bidirectional** acronym expansion (expansion →
       acronym, then acronym → *acronym + expansion*)
    3. numeric triplet split → term split on `/[^\p{L}\p{N}]+/u`
    4. stopword filter (stemmer is disabled in both configs)
    5. consecutive-letter dedupe (both configs)
    6. ~~soundex char map (`b→p, v/w→f, c/g/j/q→k…`) + digraph matcher + replacer~~ —
       **removed** in the current config; this was `Charset.LatinAdvanced` steps 5–6
       and the sole source of *phonetic* fuzziness.

    So `encode_en` (current) keeps steps 1–5 with apostrophe stripping and bidirectional
    expansion; `encode_previous` restores step 6 *and* the old one-directional expansion,
    i.e. the config as it stood before any of these changes. Both are ported below and validated against
    the real JS encoder. The practical effect of dropping soundex:
    `government`/`goverment`/`govirnmend` were one term; now they are three distinct
    terms — typos no longer match.

    **Step 2 is order-sensitive in a way that leaks.** The preset's contraction rules run
    *first* and only recognise the **straight** apostrophe, because the preset's own
    "curly → straight" rule is an upstream bug (a literal string `´`’ʼ` where a character
    class was meant). Whatever it does not consume is then deleted outright by
    `stripApostrophes`. The two apostrophe characters therefore encode differently:
    """)
    return


@app.cell(hide_code=True)
def _(encode_en, mo, pd):
    _rows = [
        {"input": _s, "encodes to": ", ".join(encode_en(_s)) or "— (nothing)"}
        for _s in ["people's", "people’s", "peoples", "people", "today’s", "q&a", "WHO", "IFRC"]
    ]
    mo.vstack(
        [
            mo.ui.table(pd.DataFrame(_rows), page_size=8, selection=None),
            mo.md(
                "The corpus is typeset with **curly** apostrophes, so *people’s* is indexed "
                "as `peoples`. A user typing the **straight** form gets `people`, which "
                "still matches by forward prefix — but the reverse (curly query, straight "
                "text) does not, and neither does anything that needs the possessive to be "
                "its own token. `q&a` is worse: the preset rewrites `&` → ` and `, so the "
                "acronym is indexed as the single letter **`q`**."
            ),
        ]
    )
    return


@app.cell
def _(re, unicodedata):
    # ---- Python port of the en encoders (validated below) ------------------------
    # CURRENT config (live db.js): Charset.Normalize + EnglishPreset(filter+prepare)
    #   + prepareEn = strip footnote refs, strip apostrophes. Acronym expansion is
    #   commented out; stemmer OFF; no soundex.
    # PREVIOUS config: Charset.LatinAdvanced (soundex) + prepareEn WITH acronym
    #   expansion — the encoder as it stood before either round of changes, kept as
    #   encode_previous so the notebook can show the before/after.
    # JS \b is ASCII-only; use explicit lookarounds to match JS semantics exactly.
    _BS = r"(?<![A-Za-z0-9_])"
    _BE = r"(?![A-Za-z0-9_])"

    EN_PRESET_PREPARE = [
        ("´`’ʼ", "'"),  # literal sequence (upstream bug: not a char class) — kept for fidelity
        ("&", " and "),
        ("$", " USD "),
        ("£", " GBP "),
        (re.compile(_BS + r"i'm" + _BE), "i am"),
        (re.compile(_BS + r"(can't|cannot)" + _BE), "can not"),
        (re.compile(_BS + r"won't" + _BE), "will not"),
        (re.compile(r"([a-z])'s" + _BE), r"\1 is has"),
        (re.compile(r"([a-z])n't" + _BE), r"\1 not"),
        (re.compile(r"([a-z])'ll" + _BE), r"\1 will"),
        (re.compile(r"([a-z])'re" + _BE), r"\1 are"),
        (re.compile(r"([a-z])'ve" + _BE), r"\1 have"),
        (re.compile(r"([a-z])'d" + _BE), r"\1 would had"),
    ]

    # The list as it stood under the PREVIOUS config: one-directional acronym -> expansion
    # rewriting, including the two entries that also spell ordinary English words.
    ACRONYM_EXPANSIONS = {
        "ai": "artificial intelligence",
        "car": "central african republic",
        "cbs": "community-based surveillance",
        "cdac": "communicating with disaster affected communities",
        "cea": "community engagement and accountability",
        "cred": "centre for research on the epidemiology of disasters",
        "cso": "civil society organization",
        "drc": "democratic republic of the congo",
        "dref": "disaster response emergency fund",
        "drm": "disaster risk management",
        "icrc": "international committee of the red cross",
        "ict": "information and communication technology",
        "idmc": "internal displacement monitoring centre",
        "ifrc": "international federation of red cross and red crescent societies",
        "itu": "international telecommunication union",
        "mdh": "misinformation, disinformation and hate speech",
        "mhpss": "mental health and psychosocial support",
        "ngo": "non-governmental organization",
        "ocha": "office for the coordination of humanitarian affairs (UN)",
        "oecd": "organisation for economic co-operation and development",
        "q&a": "questions and answers",
        "rcce": "risk communication and community engagement",
        "sdg": "sustainable development goal",
        "undp": "un development programme",
        "unhcr": "un high commissioner for refugees",
        "who": "world health organization",
    }
    # EN_ACRONYMS as db.js has it today: `who` and `car` removed (they are also ordinary
    # English words and `prepare` only ever sees lowercased text), and `ocha` without the
    # "(UN)" gloss the old list carried.
    ACRONYM_EXPANSIONS_CURRENT = {
        _k: _v for _k, _v in ACRONYM_EXPANSIONS.items() if _k not in ("who", "car")
    }
    ACRONYM_EXPANSIONS_CURRENT["ocha"] = "office for the coordination of humanitarian affairs"

    # buildAcronymExpander() in db.js is BIDIRECTIONAL: it first collapses every spelled-out
    # expansion back to its acronym, then expands every acronym to "acronym expansion". Both
    # spellings therefore converge on the same term set, so either one finds both kinds of
    # document. Order matters - the collapse has to run over the whole string first.
    _EXPANSION_PATTERNS = [
        (
            re.compile(_BS + r"\s+".join(re.escape(_w) for _w in _v.split()) + _BE),
            _k,
        )
        for _k, _v in ACRONYM_EXPANSIONS_CURRENT.items()
    ]
    _ACRONYM_PATTERNS = [
        (re.compile(_BS + re.escape(_k) + _BE), f"{_k} {_v}")
        for _k, _v in ACRONYM_EXPANSIONS_CURRENT.items()
    ]

    def expand_acronyms(s):
        for _pat, _repl in _EXPANSION_PATTERNS:
            s = _pat.sub(_repl, s)
        for _pat, _repl in _ACRONYM_PATTERNS:
            s = _pat.sub(_repl, s)
        return s

    # prepareEn as it is written in db.js today: footnote refs out, apostrophes deleted,
    # then bidirectional acronym expansion. Deleting rather than splitting on the
    # apostrophe keeps "todays" as one token instead of flooding the index with a
    # single-letter "s" from every possessive.
    PREPARE_CURRENT = [
        (re.compile(r"\[\^[0-9]+\]"), ""),
        (re.compile(r"['‘’]"), ""),
        (expand_acronyms, None),  # callable rule - applied by apply_prepare
    ]
    # prepareEn as it was: footnote refs out, then acronym -> expansion rewriting.
    PREPARE_PREVIOUS = [(re.compile(r"\[\^[0-9]+\]"), "")] + [
        (re.compile(_BS + re.escape(_k) + _BE), _v)
        for _k, _v in ACRONYM_EXPANSIONS.items()
    ]

    SOUNDEX = {
        "b": "p", "v": "f", "w": "f", "z": "s", "x": "s", "d": "t", "n": "m",
        "c": "k", "g": "k", "j": "k", "q": "k", "i": "e", "y": "e", "u": "o",
    }
    MATCHER = {"ae": "a", "oe": "o", "sh": "s", "kh": "k", "th": "t", "ph": "f", "pf": "f"}
    MATCHER_RE = re.compile("(" + "|".join(MATCHER) + ")")
    REPLACER = [
        (re.compile(r"([^aeo])h(.)"), r"\1\2"),
        (re.compile(r"([aeo])h([^aeo]|$)"), r"\1\2"),
        (re.compile(r"(.)\1+"), r"\1"),
    ]

    STRIP_COMBINING = re.compile(r"[̀-ͯ]")
    NUM_PREV = re.compile(r"(\D)(\d{3})")
    NUM_NEXT = re.compile(r"(\d{3})(\D)")
    NUM_LEN = re.compile(r"(\d{3})")

    def js_normalize(s):
        return STRIP_COMBINING.sub("", unicodedata.normalize("NFKD", s)).lower()

    def split_terms(s):
        """FlexSearch default split: /[^\\p{L}\\p{N}]+/u"""
        terms, _cur = [], ""
        for _ch in s:
            if unicodedata.category(_ch)[0] in ("L", "N"):
                _cur += _ch
            elif _cur:
                terms.append(_cur)
                _cur = ""
        if _cur:
            terms.append(_cur)
        return terms

    def numeric_split(s):
        if len(s) > 3:
            s = NUM_PREV.sub(r"\1 \2", s)
            s = NUM_NEXT.sub(r"\1 \2", s)
            s = NUM_LEN.sub(r"\1 ", s)
        return s

    def apply_prepare(s, rules):
        """Rules are (compiled regex, replacement), (literal, replacement), or
        (callable, None) for a rule that needs more than one pass over the string."""
        for _pat, _repl in rules:
            if callable(_pat):
                s = _pat(s)
            elif hasattr(_pat, "sub"):
                s = _pat.sub(_repl, s)
            else:
                s = s.replace(_pat, _repl)
        return s

    def mapper_dedupe(word, mapper, dedupe=True):
        out, _prev = "", ""
        for _char in word:
            if _char != _prev or not dedupe:
                _tmp = mapper.get(_char) if mapper else None
                if _tmp is None:
                    out += _char
                    _prev = _char
                elif _tmp != _prev or not dedupe:
                    _prev = _tmp
                    if _tmp:
                        out += _tmp
        return out

    return (
        EN_PRESET_PREPARE,
        MATCHER,
        MATCHER_RE,
        PREPARE_CURRENT,
        PREPARE_PREVIOUS,
        REPLACER,
        SOUNDEX,
        apply_prepare,
        js_normalize,
        mapper_dedupe,
        numeric_split,
        split_terms,
    )


@app.cell
def _(
    EN_PRESET_PREPARE,
    EN_STOPWORDS,
    MATCHER,
    MATCHER_RE,
    PREPARE_CURRENT,
    PREPARE_PREVIOUS,
    REPLACER,
    SOUNDEX,
    apply_prepare,
    js_normalize,
    mapper_dedupe,
    numeric_split,
    split_terms,
):
    def _encode(text, *, soundex):
        """Shared en pipeline. soundex=False = CURRENT config (Charset.Normalize,
        apostrophes stripped, no acronym expansion); soundex=True = PREVIOUS config
        (Charset.LatinAdvanced + acronym expansion). Both apply the EnglishPreset
        stopword filter + contraction prepare, stemmer OFF. The two differences are
        the prepare chain and the phonetic mapping in steps 5-6."""
        _s = js_normalize(text)
        _s = apply_prepare(_s, EN_PRESET_PREPARE)  # preset prepare runs first
        # then prepareEn — acronym expansion in the old config, apostrophe strip in the new
        _s = apply_prepare(_s, PREPARE_PREVIOUS if soundex else PREPARE_CURRENT)
        _s = numeric_split(_s)
        final, _last_term, _last_enc = [], None, None
        _cache = {}  # FlexSearch's term cache: repeats reuse it and BYPASS the dedupe
        for _word in split_terms(_s):
            if not _word or len(_word) > 1024 or _word == _last_term:
                continue
            _last_term = _word
            if _word in EN_STOPWORDS:
                continue
            _base = _word
            if _base in _cache:
                if _cache[_base]:
                    final.append(_cache[_base])
                continue
            # dedupe consecutive letters runs in BOTH configs (Encoder dedupe=True);
            # the soundex char map only applies in the previous (LatinAdvanced) config.
            _word = mapper_dedupe(_word, SOUNDEX if soundex else None)
            if soundex and len(_word) > 1:
                _word = MATCHER_RE.sub(lambda _m: MATCHER[_m.group(0)], _word)
            if soundex:
                for _pat, _repl in REPLACER:
                    if not _word:
                        break
                    _word = _pat.sub(_repl, _word)
            _cache[_base] = _word
            if _word:
                if _word != _base:
                    if _word == _last_enc:
                        continue
                    _last_enc = _word
                final.append(_word)
        return final

    def encode_en(text):
        """CURRENT en encoder (src/lib/search/db.js): Charset.Normalize +
        EnglishPreset(filter) + prepareEn, stemmer OFF. Soundex was dropped."""
        return _encode(text, soundex=False)

    def encode_previous(text):
        """PREVIOUS en encoder: Charset.LatinAdvanced (soundex phonetics)."""
        return _encode(text, soundex=True)

    def encode_baseline(text):
        """Plain Charset.Normalize: NFKD + strip combining + lowercase + char dedupe.
        No stopword filter, no prepare — the theoretical floor for collisions."""
        _s = numeric_split(js_normalize(text))
        final, _last_term = [], None
        for _word in split_terms(_s):
            if not _word or _word == _last_term:
                continue
            _last_term = _word
            if len(_word) > 1:
                _word = mapper_dedupe(_word, None)
            if _word:
                final.append(_word)
        return final

    return encode_baseline, encode_en, encode_previous


@app.cell(hide_code=True)
def _(DATA_DIR, encode_baseline, encode_en, encode_previous, json, mo):
    _gt_path = DATA_DIR / "en-token-encodings.json"
    _fns = {
        "current": encode_en,
        "previous": encode_previous,
        "baseline": encode_baseline,
    }
    if _gt_path.exists():
        _gt = json.loads(_gt_path.read_text())
        _mismatch = {
            _k: sum(1 for _t, _e in _gt[_k].items() if _fns[_k](_t) != _e)
            for _k in _fns
            if _k in _gt
        }
        _n = len(_gt["current"])
        if all(_v == 0 for _v in _mismatch.values()):
            validation_note = mo.callout(
                mo.md(
                    f"✅ **Port validated:** all three encoders (current / previous / "
                    f"baseline) match the real FlexSearch 0.8.212 output on every one "
                    f"of the **{_n:,}** unique corpus tokens "
                    f"(ground truth: `data/en-token-encodings.json`)."
                ),
                kind="success",
            )
        else:
            validation_note = mo.callout(
                mo.md(
                    f"⚠️ **Port drift:** {_mismatch} mismatches out of {_n:,}. "
                    f"Re-dump ground truth or fix the port before trusting the numbers."
                ),
                kind="warn",
            )
    else:
        validation_note = mo.callout(
            mo.md(
                "ℹ️ Ground-truth file `data/en-token-encodings.json` not found — "
                "numbers below use the (previously validated) Python port only."
            ),
            kind="info",
        )
    validation_note
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 3. Collision audit — before/after the config change

    A **collision group** is a set of different words (beyond case/diacritics) that
    share one index term — a searcher for one always gets the others. We encode every
    unique corpus token three ways: the **current** encoder (`Charset.Normalize`, the
    new config), the **previous** encoder (`Charset.LatinAdvanced` soundex), and the
    plain-`Normalize` **baseline** (the floor). Dropping soundex is what closes the
    gap between *previous* and *baseline*.
    """)
    return


@app.cell
def _(encode_baseline, encode_en, encode_previous, token_freq, unicodedata):
    def _strip_diacritics(s):
        return "".join(
            _c for _c in unicodedata.normalize("NFKD", s)
            if not unicodedata.combining(_c)
        )

    def collision_groups(encode_fn):
        _groups = {}
        for _tok, _n in token_freq.items():
            _enc = encode_fn(_tok)
            if not _enc:
                continue
            _groups.setdefault("+".join(_enc), []).append((_tok, _n))
        nontrivial = {
            _k: sorted(_m, key=lambda _x: -_x[1])
            for _k, _m in _groups.items()
            if len({_strip_diacritics(_t) for _t, _ in _m}) > 1
        }
        return _groups, nontrivial

    _, collisions_current = collision_groups(encode_en)
    _, collisions_previous = collision_groups(encode_previous)
    _, collisions_baseline = collision_groups(encode_baseline)

    # word -> encoded terms map, for the interactive explorer
    word_encodings = {_t: tuple(encode_en(_t)) for _t in token_freq}
    word_encodings_prev = {_t: tuple(encode_previous(_t)) for _t in token_freq}
    return (
        collisions_baseline,
        collisions_current,
        collisions_previous,
        word_encodings,
        word_encodings_prev,
    )


@app.cell(hide_code=True)
def _(collisions_baseline, collisions_current, collisions_previous, mo):
    _cur = len(collisions_current)
    _prev = len(collisions_previous)
    _base = len(collisions_baseline)
    mo.hstack(
        [
            mo.stat(
                value=f"{_prev}",
                label="PREVIOUS — soundex encoder",
                caption=f"{sum(len(_m) for _m in collisions_previous.values())} words affected",
                bordered=True,
            ),
            mo.stat(
                value=f"{_cur}",
                label="CURRENT — Normalize encoder",
                caption=f"{sum(len(_m) for _m in collisions_current.values())} words affected",
                bordered=True,
            ),
            mo.stat(
                value=f"{_base}",
                label="Baseline (plain Normalize)",
                caption="theoretical floor",
                bordered=True,
            ),
            mo.stat(
                value=f"−{100 * (_prev - _cur) / max(1, _prev):.0f}%",
                label="collisions removed",
                caption="by dropping soundex",
                bordered=True,
            ),
        ],
        justify="start",
        gap=2,
    )
    return


@app.cell(hide_code=True)
def _(collisions_current, mo, pd):
    _rows = []
    for _key, _members in sorted(
        collisions_current.items(),
        key=lambda _kv: -sum(_n for _, _n in _kv[1]),
    ):
        _rows.append(
            {
                "indexed as": _key,
                "conflated words (count)": ", ".join(
                    f"{_t} ({_n})" for _t, _n in _members
                ),
            }
        )
    mo.vstack(
        [
            mo.md(
                "Top **current-config** collision groups by corpus frequency. Note the "
                "character has changed: under the old soundex encoder these were "
                "phonetic confusions (*need/meet/net/myth* → one term); under the new "
                "`Normalize` encoder the survivors are overwhelmingly **benign** — "
                "possessives and hyphen-compounds that arguably *should* match "
                "(*people/people's*, *risk/at-risk*, *human/human-like*). The curly-"
                "apostrophe possessives land one step further: *organization’s* is "
                "deleted down to `organizations`, i.e. it merges with the **plural**, "
                "not with the singular the straight form produces:"
            ),
            mo.ui.table(pd.DataFrame(_rows), page_size=10),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 4. Acronyms — the `who` bug, and the fix that replaced it ✅

    `prepareEn` used to rewrite `/\bwho\b/g → "world health organization"`. Because
    `prepare` receives *lowercased* text, the English relative pronoun and the acronym
    were indistinguishable, so every *"people **who** fled"* injected
    `world/health/organization` into the index — 81% of expansions were false.

    The first response was to disable expansion for `en` entirely. That killed the bug
    and the feature together: acronym and spelled-out form became unrelated token sets,
    so a search for *artificial intelligence* reached 14 documents while 55 others said
    only "AI".

    **What is in place now** (this notebook is re-run against it): expansion is back and
    **bidirectional**, as `prepareFr` already was — every spelled-out form is first
    collapsed to its acronym, then every acronym expands to *acronym + expansion*, so
    both spellings converge on one term set. `who` and `car` are **off that list** —
    no encoder-side rule can separate them from the ordinary words — and are instead
    expanded on the **query side** (`expandCasedAcronyms` in `flexsearch.js`), the one
    place the user's capitalization still exists: an all-caps `WHO`, or a query that is
    nothing but that word, becomes *world health organization*; a `who` inside a sentence
    is left alone. The remaining gap is documents that use **only** the acronym and never
    spell the name out — 5 of the 9 sections mentioning WHO — since the doc side still
    cannot index it.
    """)
    return


@app.cell(hide_code=True)
def _(encode_en, encode_previous, mo, raw_tokens):
    _who_counts = {"who": 0, "Who": 0, "WHO": 0}
    for _t in raw_tokens:
        if _t in _who_counts:
            _who_counts[_t] += 1
    _pronoun = _who_counts["who"] + _who_counts["Who"]
    mo.vstack(
        [
            mo.hstack(
                [
                    mo.stat(value=str(_who_counts["who"]), label='"who" (pronoun, lowercase)'),
                    mo.stat(value=str(_who_counts["Who"]), label='"Who" (sentence-start)'),
                    mo.stat(value=str(_who_counts["WHO"]), label='"WHO" (the acronym)'),
                    mo.stat(
                        value=f"{_pronoun / max(1, _pronoun + _who_counts['WHO']):.0%}",
                        label="of old expansions were false",
                        caption="pronoun expanded as if it were the acronym",
                    ),
                ],
                justify="start",
                gap=2,
            ),
            mo.md(
                f"""
                Before / after on the same sentence — the pronoun no longer drags three
                content words into the index:

                ```
                previous:  encode_previous("people who fled their homes")
                           → {encode_previous("people who fled their homes")}
                current:   encode_en("people who fled their homes")
                           → {encode_en("people who fled their homes")}
                ```

                And on the query side:

                ```
                encode_en("AI")                        → {encode_en("AI")}
                encode_en("artificial intelligence")   → {encode_en("artificial intelligence")}
                encode_en("WHO")                       → {encode_en("WHO")}
                ```

                `WHO` encodes to **nothing** — `who` is on the stopword list — which is
                why it is handled before the encoder ever sees it, on the query side.
                Every other acronym now converges
                with its spelled-out form — `encode_en("AI")` and
                `encode_en("artificial intelligence")` produce the same terms — so either
                spelling finds both kinds of document. The table below re-measures the gap
                over the real corpus; it should now be closed everywhere except the two
                entries deliberately left out.
                """
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, pd):
    # Per acronym, how many indexed documents are reachable by the short form only, the
    # spelled-out form only, or both. Computed by multi-match-eval.mjs over the real
    # document set with the real encoder, since a "document" here is a heading section,
    # not a file. A count in either "only" column is a document a searcher misses purely
    # by choosing the other form - exactly what the expansion used to bridge.
    acronym_gap = pd.DataFrame(
        [
            {
                "acronym": _r["acronym"],
                "acronym only": "—" if _r["unsearchable"] else _r["acronymOnly"],
                "expansion only": "—" if _r["unsearchable"] else _r["expansionOnly"],
                "both": "—" if _r["unsearchable"] else _r["both"],
                "note": "query encodes to nothing" if _r["unsearchable"] else "",
            }
            for _r in mm["acronymCoverage"]
        ]
    )
    return (acronym_gap,)


@app.cell(hide_code=True)
def _(acronym_gap, mm, mo):
    _rows = [_r for _r in mm["acronymCoverage"] if not _r["unsearchable"]]
    _one_sided = [_r for _r in _rows if _r["acronymOnly"] or _r["expansionOnly"]]
    _stranded = sum(_r["acronymOnly"] + _r["expansionOnly"] for _r in _rows)
    _reachable = sum(_r["acronymOnly"] + _r["expansionOnly"] + _r["both"] for _r in _rows)
    _worst = max(_rows, key=lambda _r: _r["acronymOnly"] + _r["expansionOnly"])
    mo.vstack(
        [
            mo.md(
                f"**{len(_one_sided)} of {len(_rows)}** acronyms are now reachable by only "
                f"one of their two spellings — {_stranded} of {_reachable} document-mentions "
                f"({_stranded / max(1, _reachable):.0%}). Before expansion was restored that "
                f"figure was **26%**, with *AI* the extreme: 55 documents wrote the acronym, "
                f"8 spelled it out, and searching the long form found only those 8. The "
                f"`both` column is where every row should now sit."
            ),
            mo.ui.table(acronym_gap, page_size=10),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo):
    _ai = next(_p for _p in mm["acronymProbes"] if _p["query"] == "AI")
    _ai_terms = {_t["term"]: _t for _t in mm["aiPrefixNeighbours"]}
    _noise = _ai["results"] - _ai_terms["ai"]["documents"]
    mo.md(
        f"""
        ### 4.1 Worked example: what someone typing **AI** actually gets

        Acronyms are short, and `tokenize: 'forward'` matches a query term against every
        indexed term it is a **prefix of**. Two letters is not a word, it is a prefix — and
        in a humanitarian corpus `ai…` is overwhelmingly **aid**, **aim**, **aims**:

        | indexed term | occurrences | documents |
        |---|---|---|
        """
        + "\n".join(
            f"        | `{_t['term']}` | {_t['occurrences']} | {_t['documents']} |"
            for _t in mm["aiPrefixNeighbours"][:6]
        )
        + f"""

        So the query `AI` returns **{_ai['results']} of {mm['documents']} sections** — about
        a third of the report. Only **{_ai_terms['ai']['documents']}** of them contain the
        acronym; the other **{_noise}** are *aid*/*aim*/*aims* documents that share two
        letters with it.

        Worse than the recall noise is what it does to **ranking**. `contextScore()` pays
        **10 for a title hit** and **3 for an excerpt hit**, and it awards the title score
        for a prefix hit — so a section called *"Asks, **aims** and recommendations"*
        collects the full title weight for a query about artificial intelligence, while a
        section that discusses AI in its body collects 3.
        """
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    def _probe_rows(probe, ranking):
        return pd.DataFrame(
            [
                {
                    "#": _i + 1,
                    "title": _r["title"],
                    "title hit is real": "yes" if _r["titleExact"] else "—",
                    "title matched via": ", ".join(_r["titlePrefixVia"]) or "—",
                }
                for _i, _r in enumerate(probe[ranking]["top5"])
            ]
        )

    _ai = next(_p for _p in mm["acronymProbes"] if _p["query"] == "AI")
    mo.vstack(
        [
            mo.md(
                "**Top 5 for `AI` before the fix** — the top three earned their rank from "
                "words that merely start with *ai*, and the sections actually about AI sat "
                "below them:"
            ),
            mo.ui.table(_probe_rows(_ai, "legacy"), page_size=5),
            mo.md(
                f"**Top 5 for `AI` as it stands now** — expansion makes the query and the "
                f"spelled-out form converge, and the graded score stops a prefix hit in a "
                f"title from outscoring a real one. Top-ten prefix accidents fall from "
                f"**{_ai['legacy']['titleAccidentTop10']:.0%}** to "
                f"**{_ai['production']['titleAccidentTop10']:.0%}**, and every one of the "
                f"top ten now contains the full query "
                f"({_ai['legacy']['exactShareTop10']:.0%} → "
                f"{_ai['production']['exactShareTop10']:.0%}):"
            ),
            mo.ui.table(_probe_rows(_ai, "production"), page_size=5),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    _rows = []
    for _p in mm["acronymProbes"]:
        _rows.append(
            {
                "query": _p["query"],
                "encodes to": ", ".join(_p["encodedTerms"]) or "— (nothing)",
                "results": _p["results"],
                "top-3 prefix accidents (before)": (
                    f"{_p['legacy']['titleAccidentTop3']:.0%}"
                ),
                "top-3 prefix accidents (now)": (
                    f"{_p['production']['titleAccidentTop3']:.0%}"
                ),
                "top-10 with every term (before)": f"{_p['legacy']['exactShareTop10']:.0%}",
                "top-10 with every term (now)": f"{_p['production']['exactShareTop10']:.0%}",
            }
        )
    mo.vstack(
        [
            mo.md(
                "**The acronym query set, end to end.** `AI-generated` splits on the hyphen "
                "into `[ai, generated]`, so it inherits the same 104-document candidate "
                "pool — it only looks better because the second term does the filtering "
                "that the first cannot. `Q&A` is the extreme: the preset rewrites `&` to "
                "` and `, leaving the single letter **`q`**, which then prefix-matches "
                "*quality*, *quarter*, *questions*. `WHO` matches nothing at all."
            ),
            mo.ui.table(pd.DataFrame(_rows), page_size=9),
            mo.md(
                """
                **The general rule this exposes:** the shorter the query term, the more of
                the corpus it prefix-matches, and the more the 10× title weight is handed
                out for coincidences. That is the same defect §7.1 measures from the other
                side — 1–2 word queries are half the traffic and rank worst — seen here in a
                single concrete query. It is a **ranking** fix, not an encoder fix: no
                charset change can tell *aid* from *AI* when the user typed two letters.
                """
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(EN_STOPWORDS, mo, pd, token_freq):
    _lost = pd.DataFrame(
        [
            {"stopword": _t, "corpus occurrences": token_freq[_t]}
            for _t in ("time", "work", "new", "good", "way", "use", "know", "think", "back", "come")
            if _t in EN_STOPWORDS and token_freq.get(_t, 0) > 0
        ]
    ).sort_values("corpus occurrences", ascending=False)
    mo.vstack(
        [
            mo.md(
                "## 5. Stopwords that are content words here\n\n"
                "FlexSearch's EN filter drops these entirely — they can never match, "
                "even though the corpus uses them meaningfully (*aid **work***, "
                "*screen **time***). `who` is on the same list, which is why the "
                "acronym query in §4 comes back empty; trimming the list is one of the "
                "two things that would fix it:"
            ),
            mo.ui.table(_lost, page_size=10),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 6. Interactive: what does a query actually reach?

    Type any query term. The notebook encodes it under **both** the current
    (`Normalize`) and previous (soundex) configs and shows corpus words with an
    **identical** encoding and words reachable via **forward-prefix** matching
    (`tokenize: 'forward'` indexes every prefix of every indexed term). Try a typo
    like `govirnmend` (reached many words under soundex, now reaches none), `who`
    (reaches nothing at all now), or `trust` (prefix reach is what makes short
    queries return so many documents — §7 measures the consequence).
    """)
    return


@app.cell
def _(mo):
    query_input = mo.ui.text(
        value="govirnmend", label="Query term", full_width=False
    )
    query_input
    return (query_input,)


@app.cell(hide_code=True)
def _(
    encode_en,
    encode_previous,
    mo,
    pd,
    query_input,
    token_freq,
    word_encodings,
    word_encodings_prev,
):
    def _reach(q_terms, enc_map):
        _exact, _prefix = [], []
        for _w, _enc in enc_map.items():
            if not _enc:
                continue
            if list(_enc) == q_terms:
                _exact.append((_w, token_freq[_w]))
            elif any(_dt.startswith(_qt) for _dt in _enc for _qt in q_terms):
                _prefix.append((_w, token_freq[_w]))
        _exact.sort(key=lambda _x: -_x[1])
        _prefix.sort(key=lambda _x: -_x[1])
        return _exact, _prefix

    _q = query_input.value.strip()
    _q_terms = encode_en(_q) if _q else []
    _q_terms_prev = encode_previous(_q) if _q else []
    if not _q or not _q_terms:
        _out = mo.md("*Enter a query term above (stopwords encode to nothing).*")
    else:
        _exact, _prefix = _reach(_q_terms, word_encodings)
        _prev_exact, _prev_prefix = _reach(_q_terms_prev, word_encodings_prev)
        _out = mo.vstack(
            [
                mo.md(
                    f"**Encoded** — current (`Normalize`): `{_q_terms}` · "
                    f"previous (soundex): `{_q_terms_prev}`"
                ),
                mo.hstack(
                    [
                        mo.stat(
                            value=f"{len(_exact)} + {len(_prefix)}",
                            label="CURRENT reach (exact + prefix)",
                            bordered=True,
                        ),
                        mo.stat(
                            value=f"{len(_prev_exact)} + {len(_prev_prefix)}",
                            label="PREVIOUS reach (exact + prefix)",
                            caption="soundex over-matching",
                            bordered=True,
                        ),
                    ],
                    justify="start",
                    gap=2,
                ),
                mo.hstack(
                    [
                        mo.vstack(
                            [
                                mo.md(f"**Identical encoding** ({len(_exact)} words)"),
                                mo.ui.table(
                                    pd.DataFrame(_exact, columns=["word", "count"]),
                                    page_size=8,
                                ),
                            ]
                        ),
                        mo.vstack(
                            [
                                mo.md(f"**Also reachable via prefix** ({len(_prefix)} words)"),
                                mo.ui.table(
                                    pd.DataFrame(_prefix[:100], columns=["word", "count"]),
                                    page_size=8,
                                ),
                            ]
                        ),
                    ],
                    widths="equal",
                    gap=2,
                ),
            ]
        )
    _out
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## 7. Multi-word queries — the part the token analysis cannot see

    Everything above is about **one word at a time**. That is not how the search box is
    used. The observed length mix:

    | Query length | Share of searches |
    |---|---|
    | 1–2 words | **~51%** |
    | 3–5 words | **~43%** |
    | 6+ words | **~6%** |

    So ~49% of searches are decided by *multi-term* behaviour: how FlexSearch combines
    terms (`suggest: true` — a document does **not** have to contain all of them), and
    how `contextScore()` in `flexsearch.js` re-orders what comes back.

    **How ranking quality is scored here.** Position matters far more than any average
    rank suggests, so results are weighted by the organic click-through curve: position 1
    takes **39.8%** of clicks, position 2 **18.7%**, position 3 **10.2%** — the top three
    absorb **68.7%** — decaying to **4.4%** at position 6 and **1.6%** at position 10.
    Positions 4–5 and 7–9 are not in the reported figures and are filled by geometric
    interpolation between the anchors. Below position 10 counts as zero: the results page
    renders one un-paginated list, so rank 11 and rank 30 are equally invisible.

    A ranking's score is therefore **the share of clicks it can capture**: put the right
    document first and you collect 39.8; put it fourth and you collect 7.7; lose it off
    the page and you collect nothing. **39.8 is the ceiling.**

    **The benchmark.** `multi-match-eval.mjs` builds the real 327-document index (same
    mdast extraction as the build script, same encoder imported from `db.js`), then draws
    1,500 queries as verbatim word-runs out of known documents, in the 51/43/6 length mix.
    The document a query was lifted from is a *known* correct answer, so "where did it
    rank?" is answerable without human relevance labels. Two caveats, both real:

    - For **1–2 word** queries the source document is usually one of *many* legitimate
      answers, so its rank understates true quality. The tie statistics below are the
      honest measure for that bucket.
    - A query lifted verbatim from a document can never be a zero-result query, which is
      exactly the case `suggest: true` exists for — measured separately at the end.
    """)
    return


@app.cell(hide_code=True)
def _(mm, mo):
    if mm is None:
        _view = mo.callout(
            mo.md("Run `node search-analysis/multi-match-eval.mjs` to generate §7."),
            kind="warn",
        )
    else:
        _prod = mm["variants"]["production"]
        _view = mo.hstack(
            [
                mo.stat(value=f"{mm['documents']}", label="documents indexed"),
                mo.stat(value=f"{mm['queries']:,}", label="benchmark queries"),
                mo.stat(
                    value=f"{_prod['weightedCtrCapture']:.1f}",
                    label="clicks captured (of 39.8)",
                    caption="traffic-weighted across the 51/43/6 mix",
                    bordered=True,
                ),
                mo.stat(
                    value=f"{_prod['weightedCtrCapture'] / 39.8:.0%}",
                    label="of the ceiling",
                    caption="ceiling = right answer always first",
                    bordered=True,
                ),
                mo.stat(
                    value=f"{_prod['overall']['top1']:.0%}",
                    label="known answer ranked #1",
                    caption=f"top-3: {_prod['overall']['top3']:.0%}",
                ),
            ],
            justify="start",
            gap=2,
        )
    _view
    return


@app.cell
def _():
    return


@app.cell(hide_code=True)
def _(alt, chart_ink, mm, mo, pd, series_hue):
    _ctr = pd.DataFrame(
        [{"position": int(_k), "clicks": _v} for _k, _v in mm["ctrCurve"].items()]
    ).sort_values("position")
    _reported = {1, 2, 3, 6, 10}
    _ctr["source"] = _ctr["position"].map(
        lambda _p: "reported" if _p in _reported else "interpolated"
    )
    _base = alt.Chart(_ctr).encode(
        x=alt.X(
            "position:O",
            title="result position",
            axis=alt.Axis(
                labelAngle=0, domainOpacity=0, tickOpacity=0,
                labelColor=chart_ink, titleColor=chart_ink,
            ),
        ),
        y=alt.Y(
            "clicks:Q",
            title="share of all clicks (%)",
            axis=alt.Axis(
                gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                labelColor=chart_ink, titleColor=chart_ink,
            ),
        ),
        tooltip=["position", "clicks", "source"],
    )
    _bars = _base.mark_bar(
        cornerRadiusTopLeft=4, cornerRadiusTopRight=4, width={"band": 0.55},
        color=series_hue[0],
    )
    # Direct labels rather than a second colour: the reported/interpolated distinction is
    # provenance, not a data series, and must not read as a category.
    _labels = _base.mark_text(dy=-8, fontSize=11, color=chart_ink).encode(
        text=alt.Text("clicks:Q", format=".1f")
    )
    mo.vstack(
        [
            mo.md(
                "**The click curve used as the scoring weight.** Positions "
                "1, 2, 3, 6 and 10 are the reported figures; 4–5 and 7–9 are geometric "
                "interpolation between them."
            ),
            (_bars + _labels)
            .properties(width=520, height=240, background="transparent")
            .configure_view(strokeWidth=0),
        ]
    )
    return


@app.cell(hide_code=True)
def _(alt, chart_ink, mm, mo, pd, series_hue):
    _rows = []
    for _b in mm["buckets"]:
        _stats = mm["variants"]["production"]["byBucket"][_b["name"]]
        _rows.append(
            {
                "query length": _b["name"],
                "share of searches": _b["share"],
                "captured": _stats["ctrCapture"],
                "contribution": _b["share"] * _stats["ctrCapture"],
                "#1": _stats["top1"],
                "top 3": _stats["top3"],
                "top 10": _stats["top10"],
                "median results returned": _stats["medianResults"],
            }
        )
    bucket_table = pd.DataFrame(_rows)

    _chart_df = bucket_table.melt(
        id_vars="query length",
        value_vars=["captured"],
        var_name="metric",
        value_name="clicks",
    )
    _chart_df["ceiling"] = 39.8
    _bars = (
        alt.Chart(_chart_df)
        .mark_bar(cornerRadiusTopRight=4, cornerRadiusBottomRight=4, height={"band": 0.5}, color=series_hue[0])
        .encode(
            x=alt.X(
                "clicks:Q",
                title="clicks captured (0 – 39.8 ceiling)",
                scale=alt.Scale(domain=[0, 39.8]),
                axis=alt.Axis(
                    gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                    labelColor=chart_ink, titleColor=chart_ink,
                ),
            ),
            y=alt.Y(
                "query length:N",
                title=None,
                axis=alt.Axis(
                    domainOpacity=0, tickOpacity=0, labelColor=chart_ink, labelFontSize=12
                ),
            ),
            tooltip=["query length", "clicks"],
        )
    )
    _labels = _bars.mark_text(align="left", dx=6, fontSize=11, color=chart_ink).encode(
        text=alt.Text("clicks:Q", format=".1f")
    )
    mo.vstack(
        [
            mo.md(
                "### 7.1 Where the traffic is, and where the ranking is weakest\n\n"
                "Bars are clicks captured per bucket against the 39.8 ceiling — **short "
                "queries, which are the majority of traffic, rank worst**:"
            ),
            (_bars + _labels)
            .properties(width=520, height=140, background="transparent")
            .configure_view(strokeWidth=0),
            mo.ui.table(
                bucket_table.assign(
                    **{
                        "share of searches": bucket_table["share of searches"].map("{:.0%}".format),
                        "captured": bucket_table["captured"].map("{:.2f}".format),
                        "contribution": bucket_table["contribution"].map("{:.2f}".format),
                        "#1": bucket_table["#1"].map("{:.0%}".format),
                        "top 3": bucket_table["top 3"].map("{:.0%}".format),
                        "top 10": bucket_table["top 10"].map("{:.0%}".format),
                    }
                ),
                page_size=5,
            ),
        ]
    )
    return (bucket_table,)


@app.cell(hide_code=True)
def _(bucket_table, mm, mo):
    _short = bucket_table.iloc[0]
    _mid = bucket_table.iloc[1]
    _prod = mm["variants"]["production"]
    _if_short_matched_mid = (
        _short["share of searches"] * _mid["captured"]
        + _mid["contribution"]
        + bucket_table.iloc[2]["contribution"]
    )
    mo.md(
        f"""
        Read the *contribution* column, not the *captured* column: it is the bucket's
        share of searches times what it captures. The 1–2 word bucket is
        **{_short['share of searches']:.0%} of all searches** but contributes only
        **{_short['contribution']:.1f}** of the
        **{_prod['weightedCtrCapture']:.1f}** total, because a short query captures
        **{_short['captured']:.1f}** against **{_mid['captured']:.1f}** for a 3–5 word one.

        Bringing short queries up to the 3–5 word bucket's quality would move the overall
        number to **{_if_short_matched_mid:.1f} / 39.8** — roughly
        **{(_if_short_matched_mid - _prod['weightedCtrCapture']) / max(0.01, 39.8 - _prod['weightedCtrCapture']):.0%}
        of all the headroom that exists.** Everything else on this page is smaller than that.

        The cause is visible in the last column: a 1–2 word query returns a median of
        **{int(_short['median results returned'])}** documents out of {mm['documents']},
        and the re-rank has almost nothing to separate them with — see §7.5.
        """
    )
    return


@app.cell(hide_code=True)
def _(alt, chart_ink, mm, mo, pd, series_hue):
    _rows = []
    for _bucket, _d in mm["depth"].items():
        for _point in _d["byDepth"]:
            _rows.append(
                {
                    "query length": _bucket,
                    "page size": _point["depth"],
                    "recall": 100 * _point["recall"],
                    "clicks": _point["ctrCapture"],
                }
            )
    depth_df = pd.DataFrame(_rows)

    _line = (
        alt.Chart(depth_df)
        .mark_line(strokeWidth=2)
        .encode(
            x=alt.X(
                "page size:Q",
                title="results shown (log scale)",
                scale=alt.Scale(type="log"),
                axis=alt.Axis(
                    values=[3, 10, 30, 100, 327], format="d", gridOpacity=0.15,
                    domainOpacity=0, tickOpacity=0,
                    labelColor=chart_ink, titleColor=chart_ink,
                ),
            ),
            y=alt.Y(
                "recall:Q",
                title="known answer is on the page (%)",
                scale=alt.Scale(domain=[0, 100]),
                axis=alt.Axis(
                    gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                    labelColor=chart_ink, titleColor=chart_ink,
                ),
            ),
            color=alt.Color(
                "query length:N",
                title=None,
                scale=alt.Scale(
                    domain=["1-2 words", "3-5 words", "6+ words"], range=series_hue
                ),
                legend=alt.Legend(labelColor=chart_ink, orient="top"),
            ),
            tooltip=["query length", "page size", alt.Tooltip("recall:Q", format=".1f")],
        )
    )
    # The green/yellow pair sits in the CVD floor band on the dark surface, so colour
    # cannot be the only thing naming a series. Point shape carries it instead of end
    # labels, which would collide where all three lines converge on 100%.
    _points = (
        alt.Chart(depth_df)
        .mark_point(size=45, filled=True, opacity=1)
        .encode(
            x=alt.X("page size:Q", scale=alt.Scale(type="log")),
            y="recall:Q",
            color=alt.Color(
                "query length:N",
                scale=alt.Scale(
                    domain=["1-2 words", "3-5 words", "6+ words"], range=series_hue
                ),
                legend=None,
            ),
            shape=alt.Shape(
                "query length:N",
                title=None,
                scale=alt.Scale(
                    domain=["1-2 words", "3-5 words", "6+ words"],
                    range=["circle", "square", "triangle"],
                ),
                legend=alt.Legend(labelColor=chart_ink, orient="top"),
            ),
            tooltip=["query length", "page size", alt.Tooltip("recall:Q", format=".1f")],
        )
    )
    # Today's page limit, for reference.
    _rule = (
        alt.Chart(pd.DataFrame({"page size": [30]}))
        .mark_rule(strokeDash=[4, 4], strokeWidth=1, opacity=0.5)
        .encode(x=alt.X("page size:Q", scale=alt.Scale(type="log")), color=alt.value(chart_ink))
    )
    mo.vstack(
        [
            mo.md(
                "### 7.2 Would a longer results page fix it?\n\n"
                "For findability, partly — for clicks, **not at all**. The dashed line is "
                "today's `limit=30`."
            ),
            (_line + _points + _rule)
            .properties(width=520, height=250, background="transparent")
            .configure_view(strokeWidth=0),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    _short = mm["depth"]["1-2 words"]
    _at = {_p["depth"]: _p for _p in _short["byDepth"]}
    _table = pd.DataFrame(
        [
            {
                "results shown": _p["depth"],
                "1-2 words: answer on the page": f"{_p['recall']:.1%}",
                "1-2 words: clicks captured": f"{_p['ctrCapture']:.2f}",
                "3-5 words: answer on the page": f"{_q['recall']:.1%}",
                "6+ words: answer on the page": f"{_r['recall']:.1%}",
            }
            for _p, _q, _r in zip(
                _short["byDepth"],
                mm["depth"]["3-5 words"]["byDepth"],
                mm["depth"]["6+ words"]["byDepth"],
            )
        ]
    )
    mo.vstack(
        [
            mo.ui.table(_table, page_size=9),
            mo.md(
                f"""
                **Recall keeps climbing; clicks stop dead.** For 1–2 word queries the known
                answer is on the page **{_at[30]['recall']:.1%}** of the time at today's
                `limit=30`, **{_at[100]['recall']:.1%}** at 100, and **100%** if the whole
                corpus is rendered — so retrieval is not the problem, depth is. Reaching
                **90%** takes a page of **{_short['depthFor90pctRecall']} results** (the
                other buckets get there at **{mm['depth']['3-5 words']['depthFor90pctRecall']}**
                and **{mm['depth']['6+ words']['depthFor90pctRecall']}**).

                But the clicks column is flat from position 10 onward:
                **{_at[10]['ctrCapture']:.2f} → {_at[327]['ctrCapture']:.2f}**. Rendering
                ten times more results is worth **zero** additional clicks, because the CTR
                curve is ~0 past position 10 — and it costs a 3× larger fetch
                (`limit × 3`) plus a `contextScore()` pass over every extra document.

                **A longer page converts "invisible" into "technically present", not into
                clicks.** The only thing that moves the number is moving documents *up*,
                which is §7.5 and §7.8.
                """
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(alt, chart_ink, mm, mo, pd, series_hue):
    _order = [
        "suggest-only", "and-only", "exact-first", "and-rerank",
        "legacy", "coverage-rerank", "production",
    ]
    _short_label = {
        "production": "production (now)",
        "legacy": "previous production",
        "suggest-only": "no re-rank",
        "and-only": "AND, no re-rank",
        "and-rerank": "AND + re-rank",
        "exact-first": "exact-match gate ✗",
        "coverage-rerank": "coverage-first only",
    }
    _rows = []
    for _key in _order:
        _v = mm["variants"][_key]
        for _b in mm["buckets"]:
            _rows.append(
                {
                    "variant": _short_label[_key],
                    "query length": _b["name"],
                    "clicks": _v["byBucket"][_b["name"]]["ctrCapture"],
                }
            )
        _rows.append(
            {
                "variant": _short_label[_key],
                "query length": "weighted (51/43/6)",
                "clicks": _v["weightedCtrCapture"],
            }
        )
    variant_df = pd.DataFrame(_rows)

    # One job, one series: the headline is the traffic-weighted total per ranking, so
    # that is the chart. The per-bucket numbers are detail, and detail belongs in the
    # table underneath rather than in four interleaved colour series.
    _totals = variant_df[variant_df["query length"] == "weighted (51/43/6)"]
    _bars = (
        alt.Chart(_totals)
        .mark_bar(
            cornerRadiusTopRight=4, cornerRadiusBottomRight=4,
            height={"band": 0.55}, color=series_hue[0],
        )
        .encode(
            x=alt.X(
                "clicks:Q",
                title="clicks captured, traffic-weighted (0 – 39.8 ceiling)",
                scale=alt.Scale(domain=[0, 39.8]),
                axis=alt.Axis(
                    gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                    labelColor=chart_ink, titleColor=chart_ink,
                ),
            ),
            y=alt.Y(
                "variant:N",
                title=None,
                sort=[_short_label[_k] for _k in _order],
                axis=alt.Axis(
                    domainOpacity=0, tickOpacity=0, labelColor=chart_ink, labelFontSize=12
                ),
            ),
            tooltip=["variant", alt.Tooltip("clicks:Q", format=".2f")],
        )
    )
    _labels = _bars.mark_text(align="left", dx=6, fontSize=11).encode(
        text=alt.Text("clicks:Q", format=".1f"), color=alt.value(chart_ink)
    )
    _detail = variant_df.pivot(index="variant", columns="query length", values="clicks")
    _detail = _detail.reindex([_short_label[_k] for _k in _order]).round(1).reset_index()
    mo.vstack(
        [
            mo.md(
                "### 7.3 What each part of the ranking logic is worth\n\n"
                "Same queries, same index, the two production switches taken apart, plus "
                "three candidate changes (one of which fails — see below). Bars are the "
                "traffic-weighted total; the table breaks each one down by query length."
            ),
            (_bars + _labels)
            .properties(width=520, height=190, background="transparent")
            .configure_view(strokeWidth=0),
            mo.ui.table(_detail, page_size=6),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo):
    _v = mm["variants"]
    _w = {_k: _v[_k]["weightedCtrCapture"] for _k in _v}
    mo.md(
        f"""
        Three things fall out of that chart:

        **1. The re-rank is doing the heavy lifting.** Without any of it, the same
        result sets capture **{_w['suggest-only']:.1f}**; production is
        **{_w['production']:.1f}** — a **+{_w['production'] - _w['suggest-only']:.1f}**
        swing, {(_w['production'] / _w['suggest-only'] - 1):.0%} more clicks, and the
        single largest effect measured anywhere in this notebook. FlexSearch's own
        relevance ordering is close to useless here, which is expected: the `context`
        option in `db.js` is silently ignored under `tokenize: 'forward'`, so without the
        manual pass there is no proximity signal at all.

        **2. `suggest: true` costs almost nothing in ranking** —
        {_w['production']:.1f} against {_w['and-rerank']:.1f} for a strict AND, and it is
        what keeps a cross-document query from returning an empty page (§7.6). It is
        *not* free, though; it is paid for in §7.4.

        **3. Coverage-first and the graded score are both live now.** Sorting complete
        matches above partial ones takes the previous **{_w['legacy']:.1f}** to
        **{_w['coverage-rerank']:.1f}**; grading the score on top — exact hits above
        prefix hits, repeated mentions above single ones — reaches
        **{_w['production']:.1f}**. Small in aggregate, but it is the only change that
        improves the **1–2 word** bucket, which is half of all traffic:
        {_v['legacy']['byBucket']['1-2 words']['ctrCapture']:.2f} →
        **{_v['production']['byBucket']['1-2 words']['ctrCapture']:.2f}**, top-3
        {_v['legacy']['byBucket']['1-2 words']['top3']:.0%} →
        **{_v['production']['byBucket']['1-2 words']['top3']:.0%}**. §4.1 shows what it
        does to a real query, where the effect is far more visible than the average
        suggests.

        **4. A hard exact-match gate fails — the useful negative result.** Requiring a
        whole-word hit to outrank a prefix hit *lexicographically* also fixes §4.1 and
        **costs {_w['production'] - _w['exact-first']:.1f} clicks overall**
        ({_w['exact-first']:.1f} vs {_w['production']:.1f}), because prefix matching is
        what carries morphology now that stemming is off: it disqualifies the document a
        searcher wanted whenever they typed *challenge* and the section says *challenges*.
        That is why the shipped version expresses the preference as a **weight**, not a
        filter.
        """
    )
    return


@app.cell(hide_code=True)
def _(alt, chart_ink, mm, mo, pd, series_hue):
    _rows = []
    for _b in mm["buckets"]:
        for _key, _label in [
            ("legacy", "before"),
            ("production", "now"),
        ]:
            _rows.append(
                {
                    "query length": _b["name"],
                    "ranking": _label,
                    "diluted": 100 * mm["variants"][_key]["byBucket"][_b["name"]]["dilutedTop3"],
                }
            )
    dilution_df = pd.DataFrame(_rows)

    _bars = (
        alt.Chart(dilution_df)
        .mark_bar(cornerRadiusTopRight=3, cornerRadiusBottomRight=3, height={"band": 0.7})
        .encode(
            x=alt.X(
                "diluted:Q",
                title="share of top-3 slots holding a partial match (%)",
                scale=alt.Scale(domain=[0, 100]),
                axis=alt.Axis(
                    gridOpacity=0.15, domainOpacity=0, tickOpacity=0,
                    labelColor=chart_ink, titleColor=chart_ink,
                ),
            ),
            y=alt.Y("query length:N", title=None,
                    axis=alt.Axis(domainOpacity=0, tickOpacity=0, labelColor=chart_ink)),
            yOffset=alt.YOffset("ranking:N", sort=["before", "now"]),
            color=alt.Color(
                "ranking:N",
                title=None,
                scale=alt.Scale(domain=["before", "now"], range=series_hue[:2]),
                legend=alt.Legend(labelColor=chart_ink, orient="top"),
            ),
            tooltip=["query length", "ranking", alt.Tooltip("diluted:Q", format=".1f")],
        )
    )
    # Values wear the text colour, never the series colour.
    _labels = _bars.mark_text(align="left", dx=6, fontSize=11).encode(
        text=alt.Text("diluted:Q", format=".0f"), color=alt.value(chart_ink)
    )
    mo.vstack(
        [
            mo.md(
                "### 7.4 What `suggest: true` costs: the top three fill up with partial matches\n\n"
                "`suggest: true` lets a document match a *subset* of the query terms, and "
                "nothing downstream distinguishes those from complete matches — they "
                "interleave on context score alone. Below: how much of the top three — "
                "**68.7% of all clicks** — is occupied by documents missing at least one "
                "word the user typed."
            ),
            (_bars + _labels)
            .properties(width=500, height=160, background="transparent")
            .configure_view(strokeWidth=0),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo):
    _prod = mm["variants"]["legacy"]["byBucket"]
    _cov = mm["variants"]["production"]["byBucket"]
    _mid_loss = 68.7 * _prod["3-5 words"]["dilutedTop3"]
    _long_loss = 68.7 * _prod["6+ words"]["dilutedTop3"]
    mo.md(
        f"""
        Before the fix, a 3–5 word query — **43% of all searches** — put
        **{_prod['3-5 words']['dilutedTop3']:.0%}** partial matches in the top three, i.e.
        about **{_mid_loss:.0f} of the 68.7** click points at the top of the page went to
        documents that did not contain everything the user asked for. At 6+ words it was
        **{_prod['6+ words']['dilutedTop3']:.0%}** ({_long_loss:.0f} points). The
        coverage-first sort roughly halves both
        ({_cov['3-5 words']['dilutedTop3']:.0%} and {_cov['6+ words']['dilutedTop3']:.0%})
        without dropping a single result from the page.

        The mechanism is visible in the median result count: a 6+ word query returns
        **{_prod['6+ words']['medianResults']}** of {mm['documents']} documents. More
        words currently *widen* the result set instead of narrowing it — the opposite of
        what someone typing a longer, more specific query expects.
        """
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    _prod = mm["variants"]["production"]["byBucket"]
    _rows = []
    for _b in mm["buckets"]:
        _s = _prod[_b["name"]]
        _rows.append(
            {
                "query length": _b["name"],
                "top-10 effectively tied": f"{_s['tiedTop10']:.0%}",
                "re-rank engaged": f"{_s['rerankEngaged']:.0%}",
                "…when the query has a stopword": (
                    f"{_s['rerankEngagedWithStopword']:.0%}"
                    if _s["rerankEngagedWithStopword"] is not None else "—"
                ),
                "…when it does not": (
                    f"{_s['rerankEngagedNoStopword']:.0%}"
                    if _s["rerankEngagedNoStopword"] is not None else "—"
                ),
                "clicks, stopword query": (
                    f"{_s['ctrCaptureWithStopword']:.1f}"
                    if _s["ctrCaptureWithStopword"] is not None else "—"
                ),
                "clicks, no stopword": (
                    f"{_s['ctrCaptureNoStopword']:.1f}"
                    if _s["ctrCaptureNoStopword"] is not None else "—"
                ),
            }
        )
    mo.vstack(
        [
            mo.md(
                "### 7.5 Two defects inside `contextScore()`\n\n"
                "**Ties.** The score is coarse: a title hit is worth 10, an excerpt hit 3, "
                "plus a small proximity bonus. For a one-word query *every* title match "
                "scores exactly 11, and `Array.sort` is stable, so the order the user sees "
                "inside a tie is FlexSearch's insertion order — arbitrary. The first "
                "column counts queries whose whole first page collapses onto ≤2 distinct "
                "scores.\n\n"
                "**Stopwords are stripped from the query but not from the document.** "
                "`contextMatchGap()` calls `tokenizeWords(text)` with no stopword list "
                "while the query words have been filtered, so *\"trust **in** "
                "institutions\"* has to clear a gap the query no longer knows about. At "
                "title depth 1 that is fatal: the words must be adjacent. Compare the "
                "last four columns."
            ),
            mo.ui.table(pd.DataFrame(_rows), page_size=5),
            mo.md(
                "Within every multi-word bucket, a query containing a stopword engages the "
                "re-rank less often **and captures fewer clicks** — the whole gap is "
                "mechanical, not linguistic. (Compare within a row, never down the column: "
                "short queries rarely contain stopwords, so the column totals mix two "
                "different populations.)"
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    _cross = mm["crossDocument"]
    _rows = [
        {
            "ranking": _v["label"],
            "zero-result rate": f"{_v['zeroResultRate']:.0%}",
            "median results": _v["medianResults"],
            "query terms present in top 3": f"{_v['meanTop3Coverage']:.0%}",
        }
        for _v in _cross["variants"].values()
    ]
    mo.vstack(
        [
            mo.md(
                f"### 7.6 The case for keeping `suggest: true`\n\n"
                f"Every query in §7.1–7.5 was lifted verbatim from a document, so an AND "
                f"search could always find *something*. Real multi-word queries are not "
                f"quotes. These **{_cross['queries']}** queries splice words from two "
                f"different documents — the ordinary case of someone combining concepts "
                f"that never appear in one sentence:"
            ),
            mo.ui.table(pd.DataFrame(_rows), page_size=6),
            mo.md(
                f"Strict AND returns **nothing at all** for "
                f"**{_cross['variants']['and-rerank']['zeroResultRate']:.0%}** of them. "
                f"That is the trade `suggest: true` buys, and it is worth buying — but "
                f"note the last column: production shows the user a top three containing "
                f"only **{_cross['variants']['production']['meanTop3Coverage']:.0%}** of "
                f"what they typed, against "
                f"**{_cross['variants']['coverage-rerank']['meanTop3Coverage']:.0%}** with "
                f"the coverage-first tie-break. Same recall, same zero zero-result rate, "
                f"substantially more of the query actually honoured at the top."
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo, pd):
    mo.vstack(
        [
            mo.md(
                "### 7.7 Worked failures\n\n"
                "Multi-word queries where the document the words were taken from does "
                "**not** reach the top three. Useful as regression-test candidates:"
            ),
            mo.ui.table(
                pd.DataFrame(
                    [
                        {
                            "query": _e["query"],
                            "words": _e["words"],
                            "correct document": _e["targetTitle"],
                            "ranked": _e["rank"] if _e["rank"] else "off the page",
                            "results": _e["results"],
                            "what came first instead": _e["top3"][0] if _e["top3"] else "—",
                        }
                        for _e in mm["examples"]
                    ]
                ),
                page_size=10,
            ),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mm, mo):
    _prod = mm["variants"]["production"]
    _v = mm["variants"]
    _w = {_k: _v[_k]["weightedCtrCapture"] for _k in _v}
    mo.md(
        f"""
        ### 7.8 Status: what shipped, and what is still open

        | # | Change | Where | Status / evidence |
        |---|---|---|---|
        | 1 | **Graded score** — exact whole-word hit outweighs a prefix hit (title 10 vs 4, excerpt 3 vs 1) plus a damped term-frequency bonus, inside the existing proximity structure | `contextScore()` | ✅ **Shipped.** {_w['legacy']:.2f} → **{_w['production']:.2f}** weighted, and the only change that lifts the 1–2 word bucket ({_v['legacy']['byBucket']['1-2 words']['ctrCapture']:.2f} → {_v['production']['byBucket']['1-2 words']['ctrCapture']:.2f}). Deliberately a weight, not a gate: a gate scores {_w['exact-first']:.2f} |
        | 2 | **Coverage-first sort** — complete matches above partial ones, measured in encoder terms so acronym-expanded documents count | `searchDocuments()` | ✅ **Shipped.** Top-3 dilution {_v['legacy']['byBucket']['3-5 words']['dilutedTop3']:.0%} → {_v['production']['byBucket']['3-5 words']['dilutedTop3']:.0%} (3–5 words) and {_v['legacy']['byBucket']['6+ words']['dilutedTop3']:.0%} → {_v['production']['byBucket']['6+ words']['dilutedTop3']:.0%} (6+); cross-document top-3 term coverage {mm['crossDocument']['variants']['legacy']['meanTop3Coverage']:.0%} → {mm['crossDocument']['variants']['production']['meanTop3Coverage']:.0%} |
        | 3 | **Bidirectional acronym expansion**, with `who`/`car` removed from the list because `prepare` cannot see capitalization | `db.js` | ✅ **Shipped.** `AI` and *artificial intelligence* now encode identically; the long form reaches {[_p for _p in mm['acronymProbes'] if _p['query'] == 'artificial intelligence'][0]['results']} documents instead of 14 (§4) |
        | 4 | **Filter stopwords out of the document side too**, or count them as zero-cost gaps | `contextMatchGap()` | ⚠️ **Open.** Multi-word queries containing a stopword engage the re-rank {_prod['byBucket']['3-5 words']['rerankEngagedWithStopword']:.0%} of the time vs {_prod['byBucket']['3-5 words']['rerankEngagedNoStopword']:.0%} without |
        | 5 | **`WHO`/`CAR`** — expanded on the query side, where capitalization survives | `flexsearch.js` | ✅ **Shipped.** `WHO` now finds and highlights *World Health Organization*; *"people who fled"* is untouched. Still unreachable: sections that only ever write the acronym (5 of the 9 that mention it), which needs doc-side handling |
        | 6 | **Short-query ties.** {_prod['byBucket']['1-2 words']['tiedTop10']:.0%} of first pages still collapse onto ≤2 distinct scores — the graded score narrowed this but did not remove it; document length and IDF are the remaining signals | `contextScore()` | ⚠️ **Open, still the biggest lever.** 51% of traffic captures {_prod['byBucket']['1-2 words']['ctrCapture']:.2f} / 39.8 |
        | 7 | **Lock these numbers in.** §7.7 and the probes in §8 are ready-made regression tests | `tests/lib/search` | ⚠️ **Partly.** The suite now asserts ordering rather than result counts, but none of §7 is pinned |
        | — | **Do _not_ raise the page limit to compensate.** 90% recall on short queries needs a **{mm['depth']['1-2 words']['depthFor90pctRecall']}-result** page | `search/page.js` | §7.2: clicks captured are identical at 10 and at 327 results, for 3× the fetch |

        **Ceiling check.** The shipped changes moved the aggregate from
        {_w['legacy']:.2f} to {_w['production']:.2f} — modest, because the benchmark's
        known-item queries are drawn from documents that mostly already ranked. What they
        actually bought is visible in §4.1: queries whose terms are short or acronymic no
        longer hand the top of the page to coincidences. The remaining headroom is still
        concentrated in row 6.
        """
    )
    return


@app.cell(hide_code=True)
def _(DATA_DIR, json, mo, pd):
    _stats_path = DATA_DIR / "corpus-stats.json"
    if _stats_path.exists():
        _probes = json.loads(_stats_path.read_text())["probes"]["en"]
        _df = pd.DataFrame(
            [
                {
                    "probe": _p["label"],
                    "query": _p["query"],
                    "matched": ", ".join(_p["matchedIds"]) or "—",
                }
                for _p in _probes
            ]
        )
        _probe_view = mo.vstack(
            [
                mo.md(
                    "## 8. End-to-end probes (real FlexSearch, exact production field config)\n\n"
                    "From `analyze-corpus.mjs` — tiny in-memory `Document` indexes built by "
                    "the production `createDocument()` and searched with the production "
                    "options (`suggest: true`, both fields). Ready-made regression tests."
                ),
                mo.ui.table(_df, page_size=10),
            ]
        )
    else:
        _probe_view = mo.md(
            "*Run `node search-analysis/analyze-corpus.mjs` to generate probe results.*"
        )
    _probe_view
    return


@app.cell(hide_code=True)
def _(mm, mo):
    mo.md(f"""
    ## 9. Intent questions (EN subset) — status after both rounds of changes

    | # | Question | Status | Notes |
    |---|---|---|---|
    | Q1 | Should typos match? | ✅ **Addressed** | `Normalize` in place — `govirnmend`/`goverment` no longer match. |
    | Q2 | Should partial words match? | ➖ unchanged | `trust` → *trusted* still works (forward prefix). It is also why a one-word query returns ~{mm['variants']['production']['byBucket']['1-2 words']['medianResults']} documents — see Q13. |
    | Q3 | Should word forms match? | ✅ **Improved** | *crisis/crises* are distinct terms; morphology now comes from prefix overlap, not phonetics. Note the direction: a plural query cannot reach a singular document. |
    | Q4 | What should acronyms do? | ✅ **Resolved** | Pronoun-poisoning gone, expansion restored bidirectionally (`AI` ≡ *artificial intelligence*), and word-colliding acronyms (`WHO`, `CAR`) expanded on the query side where capitalization survives. Residual: sections that only ever write `WHO` are still unindexed for it. |
    | Q5 | Keep the stopword list? | ⚠️ still open | *time, work, new, good…* unsearchable — and the filter is what makes `WHO` unresolvable. |
    | Q8 | Multi-word semantics? | ✅ **Changed** — now measured | `suggest: true`: a document need not contain every term. Right call ({mm['crossDocument']['variants']['and-rerank']['zeroResultRate']:.0%} of cross-document queries would otherwise return nothing), but partial matches are not separated from complete ones — §7.4. |
    | Q9 | Title-only matches? | ✅ **Fixed** | `pluck` removed; titles are searched and weighted 10× excerpts in the re-rank. |
    | Q12 | Regression tests? | ⚠️ **Partly** | `tests/lib/search` now asserts *ordering* rather than result counts (the counts encoded the pre-`suggest` contract). §7.7 and §8 are still unpinned. |
    | Q13 | Endnotes in the index? | ✅ **Fixed** | `build-search-index` skips content under *Endnotes* / *Notes de fin*, and empty-excerpt sections are dropped. |
    | Q14 | How should results be **ordered**? | ⚠️ **Improved, still the biggest lever** | Production captures **{mm['variants']['production']['weightedCtrCapture']:.1f} of a possible 39.8** clicks, up from {mm['variants']['legacy']['weightedCtrCapture']:.1f}. The re-rank as a whole is worth +{mm['variants']['production']['weightedCtrCapture'] - mm['variants']['suggest-only']['weightedCtrCapture']:.1f}, but {mm['variants']['production']['byBucket']['1-2 words']['tiedTop10']:.0%} of short-query first pages are still effectively unordered ties — §7.8 row 6. |

    **Scorecard.** Round 1 (encoder) closed Q1/Q3 and, for the other locales, the French
    stemmer (`santé` no longer stems to `s`) and Arabic `rtl` (queries return results at
    all now). Round 2 (ranking) closed Q9 and Q8. Round 3 — bidirectional expansion,
    coverage-first sorting and the graded score — closed most of Q4 and moved Q14 from
    {mm['variants']['legacy']['weightedCtrCapture']:.1f} to
    {mm['variants']['production']['weightedCtrCapture']:.1f} clicks captured. Q14 stays
    open: short queries are half the traffic and still the weakest ranking on the page.
    Full six-locale before/after in [README.md](README.md).
    """)
    return


if __name__ == "__main__":
    app.run()
