import HighlightToolbar from '@/components/HighlightToolbar';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';

/* =========================
   Mocks
========================= */

jest.mock('@/lib/highlights', () => ({
  addHighlight: jest.fn(),
  getHighlightsByUrlKey: jest.fn(),
  deleteHighlight: jest.fn(),
  deleteHighlightGroup: jest.fn(),
}));

import { addHighlight, getHighlightsByUrlKey, deleteHighlightGroup } from '@/lib/highlights';

// Mock next-share icons/buttons
jest.mock('next-share', () => ({
  FacebookShareButton: ({ children }) => <button>{children}</button>,
  FacebookIcon: () => <span data-testid="facebook-icon" />,
  LinkedinShareButton: ({ children }) => <button>{children}</button>,
  LinkedinIcon: () => <span data-testid="linkedin-icon" />,
  WhatsappIcon: () => <span data-testid="whatsapp-icon" />,
}));

/* =========================
   Helpers
========================= */

const setupDOM = () => {
  document.body.innerHTML = `
    <article>
      <h2 id="section-1">Section 1</h2>
      <p id="text">Hello world from IFRC</p>
    </article>
  `;
};

const mockTextSelection = (text = 'Hello') => {
  const range = {
    startContainer: document.querySelector('#text').firstChild,
    endContainer: document.querySelector('#text').firstChild,
    startOffset: 0,
    endOffset: text.length,
    commonAncestorContainer: document.querySelector('#text'),
    getBoundingClientRect: () => ({
      top: 100,
      left: 100,
      bottom: 120,
      width: 80,
      height: 20,
    }),
  };

  const selection = {
    rangeCount: 1,
    getRangeAt: () => range,
    toString: () => text,
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
  };

  jest.spyOn(window, 'getSelection').mockReturnValue(selection);
};

/* =========================
   Tests
========================= */

describe('HighlightToolbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    setupDOM();

    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });

    // ✅ Use same-origin path only (jsdom blocks cross-origin pushState)
    window.history.pushState({}, '', '/report');

    getHighlightsByUrlKey.mockResolvedValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const flushToolbarTimer = () => {
    act(() => {
      jest.advanceTimersByTime(60); // component waits 50ms
    });
  };

  it('does not render toolbar when no text is selected', () => {
    render(<HighlightToolbar containerSelector="article" />);
    expect(screen.queryByLabelText('Copy')).not.toBeInTheDocument();
  });

  it('renders toolbar when text is selected', () => {
    mockTextSelection('Hello');

    render(<HighlightToolbar containerSelector="article" />);
    fireEvent.mouseUp(document);

    flushToolbarTimer();

    expect(screen.getByLabelText('Copy')).toBeInTheDocument();
    expect(screen.getByLabelText('Share')).toBeInTheDocument();
  });

  it('matches snapshot when toolbar is visible', () => {
    mockTextSelection('Hello');

    const { container } = render(<HighlightToolbar containerSelector="article" />);

    fireEvent.mouseUp(document);
    flushToolbarTimer();

    expect(container).toMatchSnapshot();
  });

    it('creates highlight when a color is clicked', async () => {
    mockTextSelection('Hello');

    render(<HighlightToolbar containerSelector="article" />);
    fireEvent.mouseUp(document);
    flushToolbarTimer();

    await act(async () => {
        fireEvent.click(screen.getByLabelText('Highlight in Yellow'));
    });

    expect(addHighlight).toHaveBeenCalledTimes(1);

    const payload = addHighlight.mock.calls[0][0];

    // stable assertions
    expect(payload).toEqual(
        expect.objectContaining({
        quote: 'Hello',
        color: 'yellow',
        urlKey: 'http://localhost/report',
        createdAt: expect.any(Number),
        groupId: expect.any(Number),
        })
    );

    // offsets: assert shape/logic, not exact numbers
    expect(typeof payload.startAbs).toBe('number');
    expect(typeof payload.endAbs).toBe('number');
    expect(payload.endAbs).toBeGreaterThan(payload.startAbs);

    // (optional) selection length should match
    expect(payload.endAbs - payload.startAbs).toBe('Hello'.length);
    });


  it('copies selected text to clipboard', async () => {
    mockTextSelection('Hello');

    render(<HighlightToolbar containerSelector="article" />);
    fireEvent.mouseUp(document);
    flushToolbarTimer();

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Copy'));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Hello');
  });

  it('shows delete button when clicking an existing highlight', async () => {
    getHighlightsByUrlKey.mockResolvedValue([
      { id: 1, groupId: 123, color: 'yellow', startAbs: 0, endAbs: 5 },
    ]);

    render(<HighlightToolbar containerSelector="article" />);

    // allow rerenderHighlights effect to run
    await act(async () => {});

    const span = document.querySelector('.highlight-span');
    expect(span).toBeTruthy();

    fireEvent.click(span);

    expect(screen.getByLabelText('Remove highlight')).toBeInTheDocument();
  });

  it('removes highlight group when delete button is clicked', async () => {
    getHighlightsByUrlKey.mockResolvedValue([
      { id: 1, groupId: 999, color: 'yellow', startAbs: 0, endAbs: 5 },
    ]);

    render(<HighlightToolbar containerSelector="article" />);

    await act(async () => {});

    fireEvent.click(document.querySelector('.highlight-span'));

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Remove highlight'));
    });

    expect(deleteHighlightGroup).toHaveBeenCalledWith(999);
  });

  it('does not show toolbar for empty selection (edge case)', () => {
    mockTextSelection('   ');

    render(<HighlightToolbar containerSelector="article" />);
    fireEvent.mouseUp(document);

    flushToolbarTimer();

    expect(screen.queryByLabelText('Copy')).not.toBeInTheDocument();
  });
});
