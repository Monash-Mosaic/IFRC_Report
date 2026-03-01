'use client';

import { db } from './db';

export async function addHighlight(highlight) {
  return db.highlights.add(highlight);
}

export async function getHighlightsByUrlKey(urlKey) {
  return db.highlights.where('urlKey').equals(urlKey).toArray();
}

export async function deleteHighlight(id) {
  await db.highlights.delete(id);
}

export async function deleteHighlightGroup(groupId) {
  const items = await db.highlights.where('groupId').equals(groupId).toArray();
  await db.highlights.bulkDelete(items.map((x) => x.id));
}


function getNodePath(node, container) {
  const path = [];
  let current = node.nodeType === Node.TEXT_NODE ? node.parentNode : node;

  while (current && current !== container) {
    const parent = current.parentNode;
    if (!parent) break;
    const index = Array.prototype.indexOf.call(parent.childNodes, current);
    path.unshift(index);
    current = parent;
  }
  return path;
}

function resolveNodePath(path, container) {
  let current = container;
  for (const index of path) {
    if (!current || !current.childNodes || !current.childNodes[index]) return null;
    current = current.childNodes[index];
  }
  return current;
}

export function serializeRange(range, containerEl) {
  return {
    startPath: getNodePath(range.startContainer, containerEl),
    startOffset: range.startOffset,
    endPath: getNodePath(range.endContainer, containerEl),
    endOffset: range.endOffset,
  };
}

export function restoreRange(serialized, containerEl) {
  const startNode = resolveNodePath(serialized.startPath, containerEl);
  const endNode = resolveNodePath(serialized.endPath, containerEl);
  if (!startNode || !endNode) return null;

  const range = document.createRange();

  // If paths resolve to element nodes, try to use a text node
  const start = startNode.nodeType === Node.TEXT_NODE ? startNode : startNode.firstChild;
  const end = endNode.nodeType === Node.TEXT_NODE ? endNode : endNode.firstChild;
  if (!start || !end) return null;

  range.setStart(start, Math.min(serialized.startOffset, start.textContent?.length ?? 0));
  range.setEnd(end, Math.min(serialized.endOffset, end.textContent?.length ?? 0));
  return range;
}