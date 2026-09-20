export class XmlChapterError extends Error {
  constructor(message, { filePath, node, attribute } = {}) {
    const location = formatLocation(filePath, node?.position);
    const context = attribute ? ` Attribute "${attribute}"` : '';
    super(`${location}${context}${location ? ' ' : ''}${message}`);
    this.name = 'XmlChapterError';
    this.filePath = filePath;
    this.node = node;
    this.attribute = attribute;
  }
}

export function formatLocation(filePath, position) {
  const start = position?.start;
  if (!filePath && !start) {
    return '';
  }

  const source = filePath || '<XML source>';
  if (!start?.line || !start?.column) {
    return source;
  }

  return `${source}:${start.line}:${start.column}`;
}

export function createXmlError(message, context) {
  return new XmlChapterError(message, context);
}
