import * as CustomComponents from '@/components/CustomComponents';
import { XmlChapterError } from './errors.js';
import {
  parseFragmentLink,
  parseHarmTypes,
  parseImageAttributes,
  parseOptionalString,
  parseRequiredString,
} from './attributeParsers.js';

const COMPONENT_REGISTRY = {
  Box: {
    component: CustomComponents.Box,
    attributes: new Set(['index', 'types', 'arrowHref', 'arrowLabel']),
    validate(node, props) {
      props.index = parseRequiredString(props.index, 'index', node);
      if (!/^\d+\.\d+$/.test(props.index)) {
        throw new XmlChapterError('Box requires a valid index', { node, attribute: 'index' });
      }
      props.types = parseHarmTypes(props.types, 'types', node);
      props.arrowHref = parseFragmentLink(props.arrowHref, 'arrowHref', node);
      props.arrowLabel = parseOptionalString(props.arrowLabel, 'arrowLabel', node);
    },
    children: 'flow',
  },
  TohInsight: { component: CustomComponents.TohInsight, attributes: new Set(['align', 'types']), children: 'flow' },
  Anchor: { component: CustomComponents.Anchor, attributes: new Set(['meta', 'index']), children: 'inline' },
  ChapterImage: {
    component: CustomComponents.ChapterImage,
    attributes: new Set([
      'imagePath', 'src', 'href_fmt', 'title', 'imageTitle', 'imageSubtitle', 'caption',
      'imageIndex', 'imageLabel', 'alt', 'width', 'height',
    ]),
    parse: parseImageAttributes,
    children: 'inline',
  },
  ContributorTag: { component: CustomComponents.ContributorTag, attributes: new Set(), children: new Set(['Contributor']) },
  Contributor: {
    component: CustomComponents.Contributor,
    attributes: new Set(),
    children: new Set(['ContributorName', 'ContributorEntity', 'ContributorRole']),
  },
  ContributorName: { component: CustomComponents.ContributorName, attributes: new Set(), children: 'inline' },
  ContributorEntity: { component: CustomComponents.ContributorEntity, attributes: new Set(), children: 'inline' },
  ContributorRole: { component: CustomComponents.ContributorRole, attributes: new Set(), children: 'inline' },
  SmallQuote: { component: CustomComponents.SmallQuote, attributes: new Set(), children: 'inline' },
  SmallQuoteAuthor: { component: CustomComponents.SmallQuoteAuthor, attributes: new Set(), children: 'inline' },
  Definition: { component: CustomComponents.Definition, attributes: new Set(), children: 'inline' },
  DefinitionDescription: { component: CustomComponents.DefinitionDescription, attributes: new Set(), children: 'flow' },
  AsksAims: { component: CustomComponents.AsksAims, attributes: new Set(), children: new Set(['Asks', 'Aims']) },
  Asks: { component: CustomComponents.Asks, attributes: new Set(), children: new Set(['recommendations']) },
  Aims: { component: CustomComponents.Aims, attributes: new Set(), children: new Set(['recommendations']) },
  Reccomendations: { component: CustomComponents.Reccomendations, attributes: new Set(), children: 'inline' },
  ReccomendationsTitle: { component: CustomComponents.ReccomendationsTitle, attributes: new Set(), children: 'inline' },
};

const FLOW_TAGS = new Set([
  'normal', 'normal-tight', 'normal-super-tight', 'normal-box', 'h1', 'h2', 'h3', 'h4',
  'h1-box', 'h1-fig-box', 'h2-box', 'h3-box', 'quote', 'quote-author', 'fig', 'anchor',
  'caption', 'bullet-list', 'bullet-list-2c', 'normal-box-bullet-list',
  'normal-spotlight-bullet-list', 'normal-box-alt', 'normal-box-tight',
  'normal-box-expanded', 'normal-box-expander-super', 'normal-first',
  'normal-expanded', 'normal-definition', 'normal-definition-first',
  'normal-first-col', 'normal-last-col', 'normal-last-col-next',
  'normal-box-numbered-list', 'numbered-list', 'recommendations', 'toh-body-box', 'toh-body',
  'ContributorTag', 'Anchor', 'AsksAims',
  'TohInsight', 'ChapterImage',
]);

/** Returns the approved component registry entry for an XML component name. */
export function getComponentDefinition(name) {
  return COMPONENT_REGISTRY[name];
}

/** Validates an XML component's attributes and direct child structure. */
export function validateComponentNode(node) {
  const definition = getComponentDefinition(node.name);
  if (!definition) {
    throw new XmlChapterError(`Unsupported component "${node.name}"`, { node });
  }

  // Vallidate attributes 
  const attributes = node.attributes || {};
  for (const attribute of Object.keys(attributes)) {
    if (!definition.attributes.has(attribute)) {
      throw new XmlChapterError(
        `Unknown attribute "${attribute}" on component "${node.name}"`,
        { node, attribute }
      );
    }
  }

  // Validate children
  const children = Array.isArray(node.children) ? node.children : [];
  for (const child of children) {
    if (child.type !== 'element') continue;
    const allowed = definition.children;
    const valid = allowed === 'inline'
      ? !FLOW_TAGS.has(child.name)
      : allowed === 'flow'
        ? FLOW_TAGS.has(child.name)
        : allowed.has(child.name);
    if (!valid) {
      throw new XmlChapterError(
        `Invalid child "${child.name}" in component "${node.name}"`,
        { node: child }
      );
    }
  }

  const props = definition.parse
    ? definition.parse(attributes, node)
    : { ...attributes };
  definition.validate?.(node, props);
  return definition;
}

/** Parses and validates XML attributes into safe component props. */
export function parseComponentProps(node) {
  const definition = validateComponentNode(node);
  const props = definition.parse
    ? definition.parse(node.attributes || {}, node)
    : { ...(node.attributes || {}) };
  definition.validate?.(node, props);
  return props;
}

export { COMPONENT_REGISTRY };
