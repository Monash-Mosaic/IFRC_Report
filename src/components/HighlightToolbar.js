'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Share2 } from 'lucide-react';
import {
  addHighlight,
  getHighlightsByUrlKey,
  deleteHighlight,
  deleteHighlightGroup,
} from '@/lib/highlights';

import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappIcon,
} from 'next-share';

const COLOR_META = [
  { key: 'yellow', name: 'Yellow', rgba: 'rgba(253, 224, 71, 0.55)', circleClass: 'bg-yellow-300' },
  { key: 'blue', name: 'Blue', rgba: 'rgba(147, 197, 253, 0.55)', circleClass: 'bg-blue-300' },
  { key: 'pink', name: 'Pink', rgba: 'rgba(249, 168, 212, 0.55)', circleClass: 'bg-pink-300' },
];

const COLOR_MAP = Object.fromEntries(COLOR_META.map((c) => [c.key, c.rgba]));

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getUrlKey() {
  return `${window.location.origin}${window.location.pathname}`;
}

function normalizeNewlines(s) {
  // Converts "\\n" -> "\n" and normalizes Windows newlines.
  return String(s ?? '').replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
}

function shareToWhatsApp({ url, text, separator }) {
  const sep = normalizeNewlines(separator || '\n');
  const message = `${text}${sep}${url}`.trim();
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(wa, '_blank', 'noopener,noreferrer');
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

/* ===========================
   Section / hash helpers
=========================== */

function findNearestHeadingIdForRange(range, containerEl) {
  if (!range || !containerEl) return null;

  const startEl =
    range.startContainer?.nodeType === 1
      ? range.startContainer
      : range.startContainer?.parentElement;

  if (!startEl) return null;

  const headings = Array.from(
    containerEl.querySelectorAll('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]')
  );
  if (!headings.length) return null;

  // If selection is inside a heading
  const direct = startEl.closest?.('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]');
  if (direct?.id) return direct.id;

  // Find last heading before selection in DOM order
  let lastBefore = null;
  for (const h of headings) {
    if (h === startEl) return h.id;
    const pos = h.compareDocumentPosition(startEl);
    const hIsBeforeStart = Boolean(pos & Node.DOCUMENT_POSITION_FOLLOWING);
    if (hIsBeforeStart) lastBefore = h;
    else break;
  }

  return lastBefore?.id || headings[0]?.id || null;
}

function setUrlHash(id) {
  if (!id) return;
  const url = new URL(window.location.href);
  url.hash = id;
  window.history.replaceState({}, '', url.toString());
}

/* ===========================
   Robust highlight helpers
=========================== */

function getTextNodes(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  return nodes;
}

function rangeToAbsoluteOffsets(range, container) {
  const textNodes = getTextNodes(container);

  let startAbs = 0;
  let endAbs = 0;
  let foundStart = false;
  let foundEnd = false;

  let cursor = 0;
  for (const node of textNodes) {
    const len = node.nodeValue.length;

    if (!foundStart && node === range.startContainer) {
      startAbs = cursor + range.startOffset;
      foundStart = true;
    }
    if (!foundEnd && node === range.endContainer) {
      endAbs = cursor + range.endOffset;
      foundEnd = true;
    }

    cursor += len;
    if (foundStart && foundEnd) break;
  }

  if (!foundStart || !foundEnd) return null;
  return { start: Math.min(startAbs, endAbs), end: Math.max(startAbs, endAbs) };
}

function absoluteOffsetsToRange(start, end, container) {
  const textNodes = getTextNodes(container);
  let cursor = 0;

  let startNode = null;
  let startOffset = 0;
  let endNode = null;
  let endOffset = 0;

  for (const node of textNodes) {
    const len = node.nodeValue.length;

    if (!startNode && start >= cursor && start <= cursor + len) {
      startNode = node;
      startOffset = start - cursor;
    }

    if (!endNode && end >= cursor && end <= cursor + len) {
      endNode = node;
      endOffset = end - cursor;
    }

    cursor += len;
    if (startNode && endNode) break;
  }

  if (!startNode || !endNode) return null;

  const range = document.createRange();
  range.setStart(startNode, Math.max(0, Math.min(startOffset, startNode.nodeValue.length)));
  range.setEnd(endNode, Math.max(0, Math.min(endOffset, endNode.nodeValue.length)));
  return range;
}

function collectTextNodeSlicesInRange(range, container) {
  const textNodes = getTextNodes(container);
  const slices = [];

  for (const node of textNodes) {
    const nodeRange = document.createRange();
    nodeRange.selectNodeContents(node);

    if (
      range.compareBoundaryPoints(Range.END_TO_START, nodeRange) >= 0 ||
      range.compareBoundaryPoints(Range.START_TO_END, nodeRange) <= 0
    ) {
      continue;
    }

    const localStart = node === range.startContainer ? range.startOffset : 0;
    const localEnd = node === range.endContainer ? range.endOffset : node.nodeValue.length;

    const s = Math.max(0, Math.min(localStart, node.nodeValue.length));
    const e = Math.max(0, Math.min(localEnd, node.nodeValue.length));

    if (e > s) slices.push({ node, start: s, end: e });
  }

  return slices;
}

function wrapSlice({ node, start, end }, { highlightId, groupId, color }) {
  let working = node;

  let afterNode = null;
  if (end < working.nodeValue.length) afterNode = working.splitText(end);

  let middleNode = working;
  if (start > 0) middleNode = working.splitText(start);

  const span = document.createElement('span');
  span.className = 'highlight-span';
  span.style.backgroundColor = color;
  span.style.borderRadius = '4px';
  span.style.padding = '0 2px';
  span.style.cursor = 'pointer';
  span.dataset.highlightId = String(highlightId);
  span.dataset.groupId = String(groupId ?? highlightId);

  middleNode.parentNode.insertBefore(span, afterNode || middleNode.nextSibling);
  span.appendChild(middleNode);
}

function applyHighlightToRange(range, { highlightId, groupId, color }, containerEl) {
  const slices = collectTextNodeSlicesInRange(range, containerEl);
  for (let i = slices.length - 1; i >= 0; i--) {
    wrapSlice(slices[i], { highlightId, groupId, color });
  }
}

function unwrapHighlightSpan(spanEl) {
  const parent = spanEl.parentNode;
  while (spanEl.firstChild) parent.insertBefore(spanEl.firstChild, spanEl);
  parent.removeChild(spanEl);
  parent.normalize();
}

function unwrapAllHighlights(containerEl) {
  if (!containerEl) return;
  const spans = Array.from(containerEl.querySelectorAll('.highlight-span'));
  for (let i = spans.length - 1; i >= 0; i--) unwrapHighlightSpan(spans[i]);
}

async function rerenderHighlights(containerEl) {
  if (!containerEl) return;
  unwrapAllHighlights(containerEl);

  const stored = await getHighlightsByUrlKey(getUrlKey());
  stored.sort((a, b) => (a.startAbs - b.startAbs) || (a.endAbs - b.endAbs));

  for (const h of stored) {
    const range = absoluteOffsetsToRange(h.startAbs, h.endAbs, containerEl);
    if (!range) continue;
    applyHighlightToRange(
      range,
      { highlightId: h.id, groupId: h.groupId, color: COLOR_MAP[h.color] },
      containerEl
    );
  }
}

/* ===========================
   Component
=========================== */

export default function HighlightToolbar({
  hashtag = '#IFRC',
  whatsappSeparator = '\n',
  containerSelector = 'article',
  shareTitle = 'IFRC Reports',
}) {
  const [selectedText, setSelectedText] = useState('');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const [activeHighlightGroupId, setActiveHighlightGroupId] = useState(null);

  const hideTimer = useRef(null);

  const suppressSelectionToolbarRef = useRef(false);

  const [containerEl, setContainerEl] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = document.querySelector(containerSelector) || document.body;
    setContainerEl(el);
  }, [containerSelector]);


  const getSelectionRangeSafe = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const r = sel.getRangeAt(0);
    const text = sel.toString().trim();
    if (!text) return null;

    if (containerEl) {
      const common =
        r.commonAncestorContainer?.nodeType === 1
          ? r.commonAncestorContainer
          : r.commonAncestorContainer?.parentElement;
      if (common && !containerEl.contains(common)) return null;
    }

    return r;
  };

  const setToolbarPositionFromRect = (rect) => {
    const TOOLBAR_HEIGHT_EST = 52;
    const GAP = 12;

    // rect is viewport-based; convert to page coords
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const xPage = rect.left + rect.width / 2 + scrollX;

    // prefer above selection
    let yPage = rect.top + scrollY - TOOLBAR_HEIGHT_EST - GAP;

    // if too close to top, put below selection
    if (rect.top - TOOLBAR_HEIGHT_EST - GAP < 8) {
      yPage = rect.bottom + scrollY + GAP;
    }

    // convert page coords -> container coords
    const containerRect = containerEl.getBoundingClientRect();
    const containerLeft = containerRect.left + scrollX;
    const containerTop = containerRect.top + scrollY;

    const x = xPage - containerLeft;
    const y = yPage - containerTop;

    setPos({ x, y });
  };


  // Restore highlights on mount
  useEffect(() => {
    if (!containerEl) return;
    rerenderHighlights(containerEl);
  }, [containerEl]);

  useEffect(() => {
    if (!containerEl) return;

    const onPointerDownCapture = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const span = target.closest('.highlight-span');
      if (span && containerEl.contains(span)) {
        suppressSelectionToolbarRef.current = true;
      }
    };

    containerEl.addEventListener('pointerdown', onPointerDownCapture, true);
    return () => containerEl.removeEventListener('pointerdown', onPointerDownCapture, true);
  }, [containerEl]);

  // Delegated click handler for highlight spans (shows delete UI)
  useEffect(() => {
    if (!containerEl) return;

    const onClick = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const span = target.closest('.highlight-span');
      if (!span || !containerEl.contains(span)) return;

      e.preventDefault();
      e.stopPropagation();

      // select highlight text
      const r = document.createRange();
      r.selectNodeContents(span);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);

      // show delete toolbar
      setSelectedText(sel.toString().trim());
      setActiveHighlightGroupId(
        span.getAttribute('data-group-id') ||
        span.getAttribute('data-highlight-id')
      );

      setToolbarPositionFromRect(span.getBoundingClientRect());
      setIsVisible(true);
    };

    containerEl.addEventListener('click', onClick);
    return () => containerEl.removeEventListener('click', onClick);
  }, [containerEl]);


  // General selection detection (shows highlight UI)
  useEffect(() => {
    const onMouseUp = () => {
      if (suppressSelectionToolbarRef.current) {
        suppressSelectionToolbarRef.current = false;
        return;
      }

      if (hideTimer.current) clearTimeout(hideTimer.current);

      hideTimer.current = setTimeout(() => {
        if (suppressSelectionToolbarRef.current) {
          suppressSelectionToolbarRef.current = false;
          return;
        }

        const range = getSelectionRangeSafe();
        if (!range) {
          setIsVisible(false);
          setSelectedText('');
          setActiveHighlightGroupId(null);
          return;
        }

        const headingId = findNearestHeadingIdForRange(range, containerEl);
        if (headingId) setUrlHash(headingId);

        const rect = range.getBoundingClientRect();
        setSelectedText(window.getSelection().toString().trim());
        setActiveHighlightGroupId(null);
        setToolbarPositionFromRect(rect);
        setIsVisible(true);
      }, 50);
    };

    const onKeyUp = (e) => {
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) onMouseUp();
      if (e.key === 'Escape') {
        setIsVisible(false);
        setSelectedText('');
        setActiveHighlightGroupId(null);
      }
    };

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keyup', onKeyUp);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [containerEl]);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  }, [selectedText]);

  const onCopy = async () => {
    if (!selectedText) return;
    try {
      await navigator.clipboard.writeText(selectedText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = selectedText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
    setSelectedText('');
    setActiveHighlightGroupId(null);
  };

  const onShare = async () => {
    if (!selectedText) return;

    const composed = `${selectedText}\n${shareUrl}`; // URL last, single real newline

    try {
      if (navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: selectedText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(composed);
      }
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = composed;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        // ignore
      }
    }

    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
    setSelectedText('');
    setActiveHighlightGroupId(null);
  };

  const onHighlight = async (colorKey) => {
    if (!containerEl) return;

    const range = getSelectionRangeSafe();
    if (!range) return;

    const offsets = rangeToAbsoluteOffsets(range, containerEl);
    if (!offsets) return;

    const quote = window.getSelection().toString().trim();
    const urlKey = getUrlKey();

    const existing = await getHighlightsByUrlKey(urlKey);
    const overlapping = existing.filter((h) =>
      overlaps(offsets.start, offsets.end, h.startAbs, h.endAbs)
    );

    // Split any highlight that fully contains the new selection
    for (const h of overlapping) {
      const contains = h.startAbs < offsets.start && h.endAbs > offsets.end;
      if (!contains) continue;

      await deleteHighlight(h.id);

      // left segment
      if (h.startAbs < offsets.start) {
        await addHighlight({
          urlKey,
          quote: h.quote || '',
          color: h.color,
          startAbs: h.startAbs,
          endAbs: offsets.start,
          createdAt: Date.now(),
          groupId: h.groupId ?? h.id,
        });
      }

      // right segment
      if (offsets.end < h.endAbs) {
        await addHighlight({
          urlKey,
          quote: h.quote || '',
          color: h.color,
          startAbs: offsets.end,
          endAbs: h.endAbs,
          createdAt: Date.now(),
          groupId: h.groupId ?? h.id,
        });
      }
    }

    // Remove highlights fully covered by new selection
    for (const h of overlapping) {
      const covered = offsets.start <= h.startAbs && offsets.end >= h.endAbs;
      if (covered) await deleteHighlight(h.id);
    }

    // Add the new highlight (new group)
    const groupId = Date.now();
    await addHighlight({
      urlKey,
      quote,
      color: colorKey,
      startAbs: offsets.start,
      endAbs: offsets.end,
      createdAt: Date.now(),
      groupId,
    });

    await rerenderHighlights(containerEl);

    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
    setSelectedText('');
    setActiveHighlightGroupId(null);
  };

  const onRemoveHighlight = async () => {
    if (!activeHighlightGroupId) return;

    const groupId = Number(activeHighlightGroupId);
    await deleteHighlightGroup(groupId);

    await rerenderHighlights(containerEl);

    window.getSelection()?.removeAllRanges();
    setIsVisible(false);
    setSelectedText('');
    setActiveHighlightGroupId(null);
  };

  if (!isVisible || !selectedText) return null;

  const iconSize = 16;
  const round = true;

  return (
    <div
      className="absolute z-50"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        transform: 'translateX(-50%)',
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2">
        {activeHighlightGroupId ? (
          <button
            type="button"
            onClick={onRemoveHighlight}
            className="w-8 h-8 rounded-full border-2 border-red-300 hover:border-red-500 bg-white hover:bg-red-50 transition-colors flex items-center justify-center"
            title="Remove highlight"
            aria-label="Remove highlight"
          >
            <span className="text-red-500 text-sm font-bold">×</span>
          </button>
        ) : (
          <>
            {COLOR_META.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => onHighlight(c.key)}
                className={`w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors ${c.circleClass}`}
                title={`Highlight in ${c.name}`}
                aria-label={`Highlight in ${c.name}`}
              />
            ))}
          </>
        )}

        {/* Copy */}
        <button onClick={onCopy} className="p-2 hover:bg-gray-100 rounded" title="Copy" aria-label="Copy">
          <Copy className="w-4 h-4 text-gray-700" />
        </button>

        {/* Web Share */}
        <button onClick={onShare} className="p-2 hover:bg-gray-100 rounded" title="Share" aria-label="Share">
          <Share2 className="w-4 h-4 text-gray-700" />
        </button>

        {/* Social share icons */}
        <FacebookShareButton url={shareUrl} quote={selectedText} hashtag={hashtag}>
          <FacebookIcon size={iconSize} round={round} />
        </FacebookShareButton>

        <TwitterShareButton url={shareUrl} title={selectedText}>
          <TwitterIcon size={iconSize} round={round} />
        </TwitterShareButton>

        {/* WhatsApp: keep icon, custom handler */}
        <button
          type="button"
          onClick={() => shareToWhatsApp({ url: shareUrl, text: selectedText, separator: whatsappSeparator })}
          className="inline-flex"
          title="Share to WhatsApp"
          aria-label="Share to WhatsApp"
        >
          <WhatsappIcon size={iconSize} round={round} />
        </button>
      </div>
    </div>
  );
}
