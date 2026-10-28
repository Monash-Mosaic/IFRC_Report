import fs from 'node:fs/promises';
import { jest } from '@jest/globals';
import { XmlChapterError } from '@/lib/xml-chapter/errors';

let parseXmlFile;
let parseXmlSource;
let stripExternalDoctype;

describe('XML chapter parsing', () => {
  beforeAll(async () => {
    ({ parseXmlFile, parseXmlSource, stripExternalDoctype } = await import(
      '@/lib/xml-chapter/parseXml'
    ));
  });

  it('removes an external doctype without resolving it', () => {
    const source = `<!DOCTYPE Root SYSTEM "/outside/chapter.dtd"><Story><chapter-title>Title</chapter-title></Story>`;

    expect(stripExternalDoctype(source)).toBe(
      '<Story><chapter-title>Title</chapter-title></Story>'
    );
    expect(parseXmlSource(source).children[0].name).toBe('Story');
  });

  it('removes a doctype with an internal subset', () => {
    const source =
      '<!DOCTYPE Root [<!ELEMENT Root ANY>]><Story><chapter-title>Title</chapter-title></Story>';

    expect(parseXmlSource(source).children[0].name).toBe('Story');
  });

  it('rejects entity declarations', () => {
    expect(() =>
      parseXmlSource('<!DOCTYPE Root [<!ENTITY external SYSTEM "file:///secret">]><Story />')
    ).toThrow(XmlChapterError);
  });

  it('rejects unexpected processing instructions', () => {
    expect(() => parseXmlSource('<?danger execute?><Story />')).toThrow(
      'Processing instructions are not allowed'
    );
  });

  it('reports the source file for malformed XML', () => {
    expect(() => parseXmlSource('<Story><chapter-title>Title</Story>', 'chapter-01.xml')).toThrow(
      'chapter-01.xml'
    );
  });

  it('reads and parses an XML file as UTF-8', async () => {
    const readFileSpy = jest.spyOn(fs, 'readFile').mockResolvedValue(
      '<Story><chapter-title>Crisis – test</chapter-title></Story>'
    );

    const tree = await parseXmlFile('chapter-01.xml');

    expect(readFileSpy).toHaveBeenCalledWith('chapter-01.xml', 'utf8');
    expect(tree.children[0].children[0].children[0].value).toContain('Crisis');
    readFileSpy.mockRestore();
  });
});
