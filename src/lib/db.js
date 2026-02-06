'use client';

import Dexie from 'dexie';

export const db = new Dexie('ifrcReportDB');

db.version(1).stores({
  bookmarks: '++id, sectionName',
});

db.version(2).stores({
  bookmarks: '++id, sectionName',
  highlights: '++id, urlKey, createdAt, color',
});

// v3: add groupId for linked highlight segments (for split/merge/remove as one)
db.version(3)
  .stores({
    bookmarks: '++id, sectionName',
    highlights: '++id, urlKey, createdAt, color, groupId',
  })
  .upgrade(async (tx) => {
    // backfill groupId for existing highlights so removal works consistently
    await tx.table('highlights').toCollection().modify((h) => {
      if (!h.groupId) h.groupId = h.id; // stable fallback
    });
  });
