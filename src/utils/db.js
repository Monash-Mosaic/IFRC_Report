"use client"

import Dexie from 'dexie';

export const db = new Dexie("ifrcReportDB");

db.version(1).stores({
    bookmarks: '++id, sectionName',

});

/* TODO:
  In the future, IndexedDB will hold the following:
    - Highlights
    - Proggress
    - Notes
*/