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
});
