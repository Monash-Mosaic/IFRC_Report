import 'client-only'
export const STORAGE_KEY = "ifrcReport:bookmarkData"

function getData() {
  if (typeof window === "undefined") {
    console.log("localStorage is not available on the server side")
    return {}
  }
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : { bookmarks: {} }
}

function setData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getBookmarks() {
  const data = getData()
  return new Set(Object.keys(data.bookmarks).filter((key) => data.bookmarks[key]))
}

export function toggleBookmark(sectionName) {
  const data = getData()
  data.bookmarks[sectionName] = !data.bookmarks[sectionName]
  setData(data)
  return getBookmarks()
}

/* TODO:
  Local storage in the future will hold the following:
    - Highlights
    - Proggress
    - Notes
*/