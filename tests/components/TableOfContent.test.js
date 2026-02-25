import TableOfContent from '@/components/TableOfContent';
import { render, screen } from '@testing-library/react';

const mockChapterTableOfContents = [
  { depth: 1, id: 'introduction', value: 'Introduction' },
  { depth: 1, id: 'getting-started', value: 'Getting Started' },
  { depth: 1, id: 'installation', value: 'Installation' },
  {
    depth: 1,
    id: 'endnotes',
    value: 'Endnotes',
    children: [
      {
        depth: 2,
        id: 'endnotes-header',
        value: 'Endnotes Header',
      },
    ],
  },
];

const mockTitle = 'On This Page';

describe('TableOfContent', () => {
  test('renders without crashing', () => {
    render(
      <TableOfContent chapterTableOfContents={mockChapterTableOfContents} title={mockTitle} />
    );
  });

  test('renders all items', () => {
    render(
      <TableOfContent chapterTableOfContents={mockChapterTableOfContents} title={mockTitle} />
    );

    mockChapterTableOfContents.forEach((item) => {
      const linkElement = screen.getByText(item.value);
      expect(linkElement).toBeInTheDocument();
    });
  });

  test('not render when chapterTableOfContents is empty', () => {
    render(<TableOfContent chapterTableOfContents={[]} title={mockTitle} />);

    // No list items should be present
    const listItems = screen.queryAllByRole('listitem');
    expect(listItems).toHaveLength(0);
  });

  test('renders all table of content items in correct order', () => {
    render(
      <TableOfContent chapterTableOfContents={mockChapterTableOfContents} title={mockTitle} />
    );

    const [rootList] = screen.getAllByRole('list');
    const listItems = Array.from(rootList.children).filter((child) => child.tagName === 'LI');

    // Verify correct number of items
    expect(listItems).toHaveLength(mockChapterTableOfContents.length);

    // Verify each item contains the expected text
    mockChapterTableOfContents.forEach((item, index) => {
      expect(listItems[index]).toHaveTextContent(item.value);
    });
  });
  test('renders all table of content items with empty endnotes children', () => {
    render(
      <TableOfContent chapterTableOfContents={mockChapterTableOfContents} title={mockTitle} />
    );

    const listItems = screen.getAllByRole('listitem');
    const endnoteItem = listItems[listItems.length - 1];

    // Verify correct number of items
    expect(endnoteItem.children).toHaveLength(1);
  });
});
