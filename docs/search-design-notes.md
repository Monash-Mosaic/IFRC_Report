# Search Feature Design 

## 1. Summary
- **Purpose**: Users can search content throughout the World Disasters Report using a lightweight and high-performance search feature.
- **Scope**: Search across all chapters from current year reports[^1], utilizing [FlexSearch](https://github.com/nextapps-de/flexsearch/tree/master) hosted with Next.js.]

## 2. Goals & Success Metrics
- **Objectives**: Provide fast and efficient search results with minimal latency.
- **Metrics**: (e.g., latency < 100ms, precision@K, zero-result rate)

## 3. Tech usages

The reason of why [FlexSearch](https://github.com/nextapps-de/flexsearch/tree/master) due to it's **flexibility** search, search standard compliance, and high performance on server or browser. It follows with the stand of [OpenSearch](https://opensearch.org/) or [ElasticSearch](https://www.elastic.co/elasticsearch), which making the switch to background technology more seemlessly if the users facing frontend is being well-design + standard. 

The plan is building the index data during build time and loading on demand in Vercel with caching in-mind.

The considered data options (based on [this benchmark](https://github.com/nextapps-de/flexsearch/blob/master/doc/persistent.md#benchmark)):
- JSON files: Simpliest but there is **potential** deserialisation bottle neck due to converting it to `Set` and `Map` speed.
- Fast-boost serialisation as Javascript file: consider using [this unstable features](https://github.com/nextapps-de/flexsearch/blob/master/doc/export-import.md#fast-boot-serialization-for-server-side-rendering-php-python-ruby-rust-java-go-nodejs-).
- SQLite3 (using lib [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)): storing data as [sqlite db in local](https://github.com/nextapps-de/flexsearch/blob/master/doc/persistent-sqlite.md) can avoid serialisation time. [recommended](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#page-load--fast-boot)

- [ ] need benchmark

Backup option would be `redis` and `postgres` for scaling more data.

Estimate: The amount of data is 1.2 MB in pure markdown text for each countries => ~5 MB indexing + contents for each countries => 25 MB in total. 

- [ ] need actual data

## 4. Indexing Strategies

- Each countries has there own database. The nature of this search is contents-based (a.k.a searching within a lot of text instead of )

Propose indexing structure:
```json
{
  "id": (number) unique numberic increasemental
  "chapterNumber": (number) chapter number
  "title": (string) Chapter's title as user are searching within a book.
  "heading": (string[]) list of headings. e.g: ["heading level 1", "heading level 2", "heading level 3", "heading level 4"]
  "slug": the section slug url for navigating
  "content": The paragraph or section as `html` or pure `text`
  "tags": documents tags for faster search
}
```

- [ ] researching the proper way to indexing `content` that navigation friendly, security, and query friendly. PROPOSE METHOD: full leverage of [url fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment) (recommended) and [text fragment](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Fragment/Text_fragments) (need brainstorm).
- [ ] decide on document tagging for `tags`.
- [ ] How to normalise special componets such as tables, highlight, bilbiggophy, links, footnotes.
- [ ] tokenisation + normalsation strategies for each countries
  - [ ] Latin-based `en`, `fr`, `ru`
  - [ ] Arabic `ar`
  - [ ] Mandarin `zh`
- [ ] research on right [context](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#context-options), [preset](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#presets), [encoding](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#fuzzy-search), [suggestion](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#suggestions)
- [ ] [Result caching strategies](https://github.com/nextapps-de/flexsearch/tree/master?tab=readme-ov-file#auto-balanced-cache-by-popularity) with cache invalidation. 

NOTE: splitting the markdown  by using `remark` and `mast` (markdown abstrct syntax tree) will more stable than using `RegEx` base method. 

## 5. Query strategies

TODO: Enhance the query strategy with https://www.infoq.com/news/2019/03/flexsearch-fast-full-text-search/

Users will primary focus on search on the current language [^2]. They can search through `title`, `heading`, and `content`.

Autocompletion: This is just suggestion that provide more low confident search results with simple input texts. Suggesting that user will focus on search through `title`, `heading`.

Basic Strategy: pure input text `this is my search query` - providing more highly confident search results through fluzzy search. The search field would be `title`, `heading`, and `content` and they can add filter such as `tags`

Advanced strategy: Provide [Complex Queries](https://github.com/nextapps-de/flexsearch/blob/master/doc/resolver.md) such as boolean query or exact match. Search by specific fields, matching phrase, etc. Similar to basic search but they can do `("this must be exact") AND this can be fluzzy)`

- [ ] Highlight in the search results.

Pagination: simple limit and offset pagiation is more referred than `load more` or `infinity scroll` pagination.

NOTE: 
- there is only sorting option is `revalance` sort => no sorting option.
- Not able to do symnonym search (E.g: `AI` to `Artificial Intellegence`)

## 6. User Search flow

- `Autocomplete Box`: a component that searching through the book or the chapter [^3]

- `Search Result Page`: dedicate search result page for advance search.

- The website will jump to the chapter page after users clicked on the result (e.g: `/reports/wdr2025/chapter02#heading1:~:text:generative`)

# Footnotes
[^1]: this is assumption of search on non-archive reports. 
[^2]: searching accross languages might not need?
[^3]: need confirmation