import { XmlChapterError } from './errors.js';

const HARM_TYPES = new Map([
  ['physical', 'Physical'],
  ['psychological', 'Psychological'],
  ['social', 'Social'],
  ['societal', 'Societal'],
  ['informational', 'Informational'],
  ['deprivational', 'Deprivational'],
  ['digital', 'Digital'],
]);

/** Creates a source-aware invalid-attribute error. */
function invalid(attribute, message, node) {
  throw new XmlChapterError(message, { node, attribute });
}

/** Parses a required non-empty string attribute. */
export function parseRequiredString(value, attribute, node) {
  if (typeof value !== 'string' || !value.trim()) {
    invalid(attribute, `Attribute "${attribute}" is required`, node);
  }
  return value.trim();
}

/** Parses an optional string attribute, returning undefined when absent. */
export function parseOptionalString(value, attribute, node) {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') invalid(attribute, `Attribute "${attribute}" must be a string`, node);
  return value.trim();
}

/** Parses space-separated harm types into validated component values. */
export function parseHarmTypes(value, attribute, node) {
  if (value === undefined || value === null || value === '') return [];
  if (typeof value !== 'string') invalid(attribute, `Attribute "${attribute}" must be a string`, node);
  return value.split(/\s+/).filter(Boolean).map((type) => {
    const parsed = HARM_TYPES.get(type.toLowerCase());
    if (!parsed) invalid(attribute, `Invalid harm type "${type}"`, node);
    return parsed;
  });
}

/** Parses a safe same-document fragment link. */
export function parseFragmentLink(value, attribute, node) {
  const parsed = parseOptionalString(value, attribute, node);
  if (parsed === undefined) return undefined;
  if (!/^#[A-Za-z][\w-]*$/.test(parsed)) {
    invalid(attribute, `Attribute "${attribute}" must be a safe fragment link`, node);
  }
  return parsed;
}

/** Parses a safe local asset path without traversal or external URLs. */
export function parseLocalAssetPath(value, attribute, node) {
  const parsed = parseRequiredString(value, attribute, node);
  if (
    parsed.includes('\\') ||
    parsed.includes('..') ||
    parsed.startsWith('//') ||
    /^[a-z][a-z\d+.-]*:/i.test(parsed) ||
    !parsed.startsWith('/')
  ) {
    invalid(attribute, `Attribute "${attribute}" must be a safe local asset path`, node);
  }
  return parsed;
}

/** Parses a boolean attribute using explicit XML boolean values. */
export function parseBoolean(value, attribute, node) {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  invalid(attribute, `Attribute "${attribute}" must be true or false`, node);
}

/** Parses a finite non-negative number attribute. */
export function parseNumber(value, attribute, node) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    invalid(attribute, `Attribute "${attribute}" must be a non-negative number`, node);
  }
  return parsed;
}

/** Adapts XML image attributes to the ChapterImage component props. */
export function parseImageAttributes(attributes, node) {
  const imagePath = parseLocalAssetPath(
    attributes.imagePath ?? attributes.src ?? attributes.href_fmt,
    'imagePath',
    node
  );
  const props = { imagePath };
  const strings = [
    ['imageTitle', attributes.imageTitle ?? attributes.title],
    ['imageSubtitle', attributes.imageSubtitle],
    ['caption', attributes.caption],
    ['imageIndex', attributes.imageIndex],
    ['imageLabel', attributes.imageLabel],
    ['alt', attributes.alt],
  ];
  for (const [name, value] of strings) {
    const parsed = parseOptionalString(value, name, node);
    if (parsed !== undefined) props[name] = parsed;
  }
  for (const name of ['width', 'height']) {
    if (attributes[name] !== undefined) props[name] = parseNumber(attributes[name], name, node);
  }
  return props;
}
