import { getBaseUrl } from '@/lib/base-url';

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'IFRC World Disasters Report 2026',
    template: '%s | IFRC',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
};

export default function RootLayout({ children }) {
  return children;
}
