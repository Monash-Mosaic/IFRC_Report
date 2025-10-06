import 'client-only'

export const BOOKMARK_KEY = "ifrcReport:bookmarkData"
export const NOTES_KEY = "ifrcReport:notesData"

// ---------- Generic helpers ----------
function getData(key, fallback) {
  if (typeof window === "undefined") {
    // SSR guard
    return fallback
  }
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error("Failed to parse localStorage data for", key, err)
    return fallback
  }
}

function setData(data, key) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (err) {
    console.error("Failed to save localStorage data for", key, err)
  }
}

// ---------- BOOKMARKS ----------
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

// ---------- NOTES ----------
// Store shape: { [sectionSlug]: Array<Note> }
// Note: { id, title, text (HTML), timestamp, position:{x,y}, size:{width,height}, page }

export function getNotes(sectionSlug) {
  const data = getData(NOTES_KEY, {})
  if (!data) return []
  // handle legacy nested shape
  if (data.notes && Array.isArray(data.notes[sectionSlug])) return data.notes[sectionSlug]
  if (Array.isArray(data[sectionSlug])) return data[sectionSlug]
  return []
}

export function saveNotes(sectionSlug, notes) {
  const data = getData(NOTES_KEY, {})
  // remove legacy nested field
  if (data.notes) delete data.notes
  data[sectionSlug] = notes
  setData(data, NOTES_KEY)
}


