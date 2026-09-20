import React from 'react';
import { getComponentDefinition } from './componentRegistry.js';
import { XmlChapterError } from './errors.js';

// Keep this list deliberately closed.  XML names must never be used as React
// element names, and no XML attributes are copied to intrinsic elements.
const INTRINSIC = new Map([
  ['paragraph', 'p'],
  ['heading', null],
  ['strong', 'strong'],
  ['emphasis', 'em'],
  ['quote', 'blockquote'],
  ['quoteAuthor', 'cite'],
  ['link', 'a'],
  ['figcaption', 'figcaption'],
]);

/** Renders a normalized chapter tree. */
export function renderChapter(chapterTree) {
  return renderChildren(chapterTree?.children);
}

/** Recursively turns plain ChapterTree nodes into React elements. */
export function renderChildren(children = []) {
  return (Array.isArray(children) ? children : []).map((child, index) =>
    renderNode(child, `${child?.type || 'node'}-${index}`)
  );
}

/** Renders a single normalized node. */
function renderNode(node, key) {
  if (!node) return null;
  if (node.type === 'text') return node.value;

  if (node.type === 'component') {
    const definition = getComponentDefinition(node.name);
    if (!definition) return null;
    if (typeof definition.component !== 'function') {
      throw new XmlChapterError(
        `Component "${node.name}" is not registered with a renderable React component`,
        { node }
      );
    }
    // Props were parsed and validated by the component registry.  Construct a
    // fresh object so a tree cannot mutate registry data or add event props.
    const props = { ...(node.props || {}), key };
    let children;
    try {
      children = renderChildren(node.children);
    } catch (error) {
      if (error instanceof XmlChapterError) throw error;
      throw new XmlChapterError(
        `Failed to render component "${node.name}": ${error.message}`,
        { node }
      );
    }
    return React.createElement(definition.component, props, ...children);
  }

  if (node.type === 'heading') {
    const depth = Number.isInteger(node.depth) && node.depth >= 1 && node.depth <= 4
      ? node.depth : 1;
    return React.createElement(`h${depth}`, { id: node.id, key },
      ...renderChildren(node.children));
  }

  if (node.type === 'list') {
    return React.createElement(node.ordered ? 'ol' : 'ul', { key },
      renderChildren(node.children));
  }
  if (node.type === 'listItem') {
    return React.createElement('li', { key }, renderChildren(node.children));
  }

  const intrinsic = INTRINSIC.get(node.type);
  if (intrinsic) {
    const props = { key };
    if (node.type === 'link' && safeLink(node.props?.href)) {
      props.href = node.props.href;
    }
    return React.createElement(intrinsic, props, renderChildren(node.children));
  }

  if (node.type === 'figure') {
    const props = node.props || {};
    const imageProps = {
      key,
      ...(safeAsset(props.src) ? { src: props.src } : {}),
      ...(typeof props.alt === 'string' ? { alt: props.alt } : { alt: '' }),
    };
    const caption = typeof props.caption === 'string'
      ? React.createElement('figcaption', { key: `${key}-caption` }, props.caption)
      : null;
    return React.createElement('figure', { key },
      React.createElement('img', imageProps),
      renderChildren(node.children),
      caption);
  }

  if (node.type === 'endnoteReference') {
    const id = typeof node.id === 'string' && /^[\w-]+$/.test(node.id) ? node.id : null;
    return id
      ? React.createElement('sup', { key },
        React.createElement('a', { href: `#endnote-${id}` }, node.label || id))
      : null;
  }
  
  if (node.type === 'table' || node.type === 'tableCell' || node.type === 'tableHeaderCell') {
    const tag = node.type === 'table' ? 'table' : node.type === 'tableHeaderCell' ? 'th' : 'td';
    return React.createElement(tag, { key }, renderChildren(node.children));
  }
  return null;
}

/** Returns a safe asset path. */
function safeAsset(value) {
  return typeof value === 'string' && value.startsWith('/') &&
    !value.includes('..') && !value.includes('\\') &&
    !/^[a-z][a-z\d+.-]*:/i.test(value);
}

/** Returns a safe same-document or HTTPS link value. */
function safeLink(value) {
  return typeof value === 'string' &&
    (/^#[A-Za-z][\w-]*$/.test(value) || /^https:\/\//i.test(value));
}

export default renderChapter;
