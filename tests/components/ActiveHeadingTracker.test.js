import { render, act } from '@testing-library/react';
import ActiveHeadingTracker from '@/components/ActiveHeadingTracker';

class IntersectionObserverMock {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    this.callback([
      {
        target: element,
        isIntersecting: true,
        intersectionRatio: 1,
      },
    ]);
  }

  disconnect() {}
  unobserve() {}
}

describe('ActiveHeadingTracker', () => {
  let replaceStateSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    global.IntersectionObserver = IntersectionObserverMock;
    replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    document.body.innerHTML = `
      <article>
        <h2 id="intro">Intro</h2>
        <h2 id="methods">Methods</h2>
      </article>
    `;
  });

  afterEach(() => {
    jest.useRealTimers();
    replaceStateSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('renders nothing', () => {
    const { container } = render(<ActiveHeadingTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('updates URL hash based on visible headings', () => {
    render(<ActiveHeadingTracker />);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('uses scroll fallback when no headings are intersecting', () => {
    class NonIntersectingObserver {
      constructor(callback) {
        this.callback = callback;
      }

      observe(element) {
        this.callback([
          {
            target: element,
            isIntersecting: false,
            intersectionRatio: 0,
          },
        ]);
      }

      disconnect() {}
      unobserve() {}
    }

    global.IntersectionObserver = NonIntersectingObserver;
    Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
    Object.defineProperty(document.querySelector('#methods'), 'offsetTop', {
      configurable: true,
      value: 100,
    });

    render(<ActiveHeadingTracker />);

    act(() => {
      jest.advanceTimersByTime(150);
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });

  it('waits for headings via MutationObserver when container is missing initially', () => {
    document.body.innerHTML = '';
    let mutationCallback;

    global.MutationObserver = class {
      constructor(callback) {
        mutationCallback = callback;
      }

      observe() {}
      disconnect() {}
    };

    render(<ActiveHeadingTracker />);

    const article = document.createElement('article');
    const heading = document.createElement('h2');
    heading.id = 'late-heading';
    article.appendChild(heading);
    document.body.appendChild(article);

    act(() => {
      mutationCallback([{ type: 'childList' }]);
      jest.advanceTimersByTime(150);
    });

    expect(replaceStateSpy).toHaveBeenCalled();
  });
});
