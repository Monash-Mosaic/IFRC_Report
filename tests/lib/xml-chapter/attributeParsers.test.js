import {
  parseBoolean,
  parseFragmentLink,
  parseHarmTypes,
  parseImageAttributes,
  parseLocalAssetPath,
  parseNumber,
  parseOptionalString,
  parseRequiredString,
} from '@/lib/xml-chapter/attributeParsers';
import { XmlChapterError } from '@/lib/xml-chapter/errors';

describe('XML attribute parsers', () => {
  it('parses required and optional strings', () => {
    expect(parseRequiredString('  value ', 'title')).toBe('value');
    expect(parseOptionalString('  value ', 'title')).toBe('value');
    expect(parseOptionalString(undefined, 'title')).toBeUndefined();
  });

  it('rejects missing required strings', () => {
    expect(() => parseRequiredString(' ', 'title')).toThrow(XmlChapterError);
  });

  it('parses and normalizes harm types', () => {
    expect(parseHarmTypes('physical SOCIAL', 'types')).toEqual(['Physical', 'Social']);
    expect(parseHarmTypes('', 'types')).toEqual([]);
    expect(() => parseHarmTypes('unknown', 'types')).toThrow(XmlChapterError);
  });

  it('parses safe fragment links and local asset paths', () => {
    expect(parseFragmentLink('#section-1', 'href')).toBe('#section-1');
    expect(parseLocalAssetPath('/wdr25/chapter-01/image.webp', 'src'))
      .toBe('/wdr25/chapter-01/image.webp');
    expect(() => parseFragmentLink('javascript:bad', 'href')).toThrow(XmlChapterError);
    expect(() => parseLocalAssetPath('../image.webp', 'src')).toThrow(XmlChapterError);
    expect(() => parseLocalAssetPath('https://example.com/image.webp', 'src'))
      .toThrow(XmlChapterError);
  });

  it('parses booleans and non-negative numbers', () => {
    expect(parseBoolean('true', 'enabled')).toBe(true);
    expect(parseBoolean('false', 'enabled')).toBe(false);
    expect(parseNumber('900', 'width')).toBe(900);
    expect(() => parseBoolean('yes', 'enabled')).toThrow(XmlChapterError);
    expect(() => parseNumber('-1', 'width')).toThrow(XmlChapterError);
  });

  it('adapts XML image attributes to ChapterImage props', () => {
    expect(parseImageAttributes({
      href_fmt: '/wdr25/chapter-01/image.webp',
      title: 'Image title',
      width: '900',
    })).toEqual({
      imagePath: '/wdr25/chapter-01/image.webp',
      imageTitle: 'Image title',
      width: 900,
    });
  });
});
