import 'client-only'

export const BOOKMARK_KEY = "ifrcReport:bookmarkData"


function getData(key, fallback) {
  if (typeof window === "undefined") {
    console.error("localStorage is not available on the server side")
    return fallback
  }
  const raw = localStorage.getItem(key)
  return raw ? JSON.parse(raw) : fallback
}

function setData(data, key) {
  localStorage.setItem(key, JSON.stringify(data))
}


export function getBookmarks() {
  const data = getData(BOOKMARK_KEY, { bookmarks: {} })
  return new Set(Object.keys(data.bookmarks).filter((key) => data.bookmarks[key]))
}

export function toggleBookmark(sectionName) {
  const data = getData(BOOKMARK_KEY, { bookmarks: {} })
  data.bookmarks[sectionName] = !data.bookmarks[sectionName]
  setData(data, BOOKMARK_KEY)
  return getBookmarks()
}

/* TODO:
  Local storage in the future will hold the following:
    - Highlights
    - Proggress
    - Notes
*/