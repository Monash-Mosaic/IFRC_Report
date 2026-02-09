'use client';

import { useEffect, useRef } from 'react';

export default function ActiveHeadingTracker({
  containerSelector = 'article',
  headingSelector = 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]',
  rootMargin = '0px 0px -70% 0px',
}) {
  const cleanupRef = useRef(() => {});

  useEffect(() => {
    let disposed = false;

    const setHash = (id) => {
      if (!id) return;
      const url = new URL(window.location.href);
      if (url.hash === `#${id}`) return;
      url.hash = id;
      window.history.replaceState({}, '', url.toString());
    };

    const setup = () => {
      const container = document.querySelector(containerSelector);
      if (!container) return false;

      const headings = Array.from(container.querySelectorAll(headingSelector));
      if (!headings.length) return false;

      const visible = new Map();

      const observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const id = e.target?.id;
            if (!id) continue;
            if (e.isIntersecting) visible.set(id, e.intersectionRatio);
            else visible.delete(id);
          }

          if (visible.size) {
            const best = [...visible.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
            if (best) setHash(best);
            return;
          }

          // fallback: last heading above viewport
          const y = window.scrollY + 120;
          let candidate = null;
          for (const h of headings) {
            if (h.offsetTop <= y) candidate = h;
            else break;
          }
          if (candidate?.id) setHash(candidate.id);
        },
        { root: null, rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
      );

      headings.forEach((h) => observer.observe(h));

      // init once
      const y = window.scrollY + 120;
      let candidate = null;
      for (const h of headings) {
        if (h.offsetTop <= y) candidate = h;
        else break;
      }
      if (candidate?.id) setHash(candidate.id);

      cleanupRef.current = () => observer.disconnect();
      return true;
    };

    if (!setup()) {
      const mo = new MutationObserver(() => {
        if (disposed) return;
        if (setup()) mo.disconnect();
      });
      mo.observe(document.body, { childList: true, subtree: true });
      cleanupRef.current = () => mo.disconnect();
    }

    return () => {
      disposed = true;
      cleanupRef.current?.();
    };
  }, [containerSelector, headingSelector, rootMargin]);

  return null;
}
