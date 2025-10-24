import LocaleSwitcher from '@/components/LocaleSwitcher';
import { render } from '@testing-library/react';

// Mock navigation helper used by the component
const replaceMock = jest.fn();
const refreshMock = jest.fn();

jest.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ replace: replaceMock, refresh: refreshMock }),
  usePathname: () => '/current-path',
}));

// Mock next-intl hooks used by the component
let currentLocale = 'en';
jest.mock('next-intl', () => ({
  useLocale: () => currentLocale,
  useTranslations: (namespace) => (key) => {
    const translations = {
      'LocaleSwitcher.ariaLabel': 'Select language',
      'LocaleSwitcher.title': 'Select language',
    };
    return translations[`${namespace}.${key}`];
  },
}));

describe('LocaleSwitcher', () => {
  beforeEach(() => {
    replaceMock.mockClear();
    refreshMock.mockClear();
    currentLocale = 'en';
  });

  it(`renders LocaleSwitcher`, async () => {
    const { container } = render(<LocaleSwitcher />);
    expect(container).toMatchSnapshot();
  });
});
