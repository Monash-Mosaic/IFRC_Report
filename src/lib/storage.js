import { db } from './db';

export async function getBookmarks() {
  const all = await db.bookmarks.toArray();
  return new Set(all.map((b) => b.sectionName));
}

export async function toggleBookmark(sectionName) {
  const existing = await db.bookmarks.where('sectionName').equals(sectionName).first();

  if (existing) {
    await db.bookmarks.delete(existing.id);
  } else {
    await db.bookmarks.add({ sectionName });
  }
  return getBookmarks();
}
