import fs from 'node:fs/promises';
import { fromXml } from 'xast-util-from-xml';
import { XmlChapterError } from './errors.js';

/** Reads and safely parses an XML file as UTF-8 into an XML Abstract Syntax Tree. */
export async function parseXmlFile(filePath) {
  let source;
  try {
    source = await fs.readFile(filePath, 'utf8');
  } catch (error) {
    throw new XmlChapterError(`Unable to read XML source: ${error.message}`, { filePath });
  }

  return parseXmlSource(source, filePath);
}

/** Safely parses an XML string into an XML syntax tree. */
export function parseXmlSource(source, filePath = '<XML source>') {
  if (typeof source !== 'string') {
    throw new XmlChapterError('XML source must be a string', { filePath });
  }

  let safeSource;
  try {
    safeSource = stripExternalDoctype(source);
    rejectUnsafeDeclarations(safeSource);
    rejectUnexpectedProcessingInstructions(safeSource);
  } catch (error) {
    if (error instanceof XmlChapterError && !error.filePath) {
      error.filePath = filePath;
      error.message = `${filePath} ${error.message}`;
    }
    throw error;
  }

  try {
    return fromXml(safeSource);
  } catch (error) {
    const location = error?.line && error?.column
      ? `${filePath}:${error.line}:${error.column}`
      : filePath;
    throw new XmlChapterError(
      `Could not parse XML${error?.reason ? `: ${error.reason}` : ''}`,
      { filePath: location }
    );
  }
}

/** Removes the DOCTYPE declaration after checking it for unsafe declarations. */
export function stripExternalDoctype(source) {
  const doctypeStart = source.search(/<!DOCTYPE\b/i);
  if (doctypeStart === -1) {
    return source;
  }

  const doctypeEnd = findDoctypeEndIndex(source, doctypeStart + 9);
  if (doctypeEnd === -1) {
    throw new XmlChapterError('Unterminated DOCTYPE declaration');
  }

  const doctype = source.slice(doctypeStart, doctypeEnd);
  rejectUnsafeDeclarations(doctype);
  return `${source.slice(0, doctypeStart)}${source.slice(doctypeEnd)}`;
}

/** Finds the end of a DOCTYPE declaration, including any internal subset. */
function findDoctypeEndIndex(source, start) {
  let bracketDepth = 0;
  let quote = null;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '[') {
      bracketDepth += 1;
    } else if (character === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (character === '>' && bracketDepth === 0) {
      return index + 1;
    }
  }

  return -1;
}

/** Rejects entity and notation declarations from XML input. */
function rejectUnsafeDeclarations(source) {
  if (/<!(?:ENTITY|NOTATION)\b/i.test(source)) {
    throw new XmlChapterError(
      'Entity and notation declarations are not allowed in chapter XML'
    );
  }
}

/** Rejects processing instructions other than the standard XML declaration. */
function rejectUnexpectedProcessingInstructions(source) {
  const instructions = source.match(/<\?(?!xml\b)[\s\S]*?\?>/gi);
  if (instructions?.length) {
    throw new XmlChapterError('Processing instructions are not allowed in chapter XML');
  }
}

