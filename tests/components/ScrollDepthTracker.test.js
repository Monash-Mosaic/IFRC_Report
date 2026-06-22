import { render, act } from '@testing-library/react';
import ScrollDepthTracker from '@/components/ScrollDepthTracker';

const trackScrollDepth = jest.fn();

jest.mock('@/lib/gtm', () => ({
  trackScrollDepth: (...args) => trackScrollDepth(...args),
}));

describe('ScrollDepthTracker', () => {
  beforeEach(() => {
    trackScrollDepth.mockClear();
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1000, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 0, configurable: true });
  });

  it('renders nothing', () => {
    const { container } = render(<ScrollDepthTracker />);
    expect(container).toBeEmptyDOMElement();
  });

  it('tracks scroll depth thresholds', () => {
    render(<ScrollDepthTracker />);

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
      Object.defineProperty(document.documentElement, 'scrollTop', { value: 500, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });

    expect(trackScrollDepth).toHaveBeenCalledWith({ depth: 25, url: expect.any(String) });
    expect(trackScrollDepth).toHaveBeenCalledWith({ depth: 50, url: expect.any(String) });
  });
});
