import { getBaseUrl } from '@/lib/base-url';

export const metadata = {
  metadataBase: new URL(getBaseUrl()),
  title: {
    default: 'IFRC World Disasters Report 2026',
    template: '%s | IFRC',
  },
  icons: {
    icon: '/icon.jpg',
    apple: '/apple-icon.jpg',
  },
  openGraph: {
    images: ['/wdr25/ifrc_logo.jpg'],
  },
  twitter: {
    images: ['/wdr25/ifrc_logo.jpg'],
  },
};

export default function RootLayout({ children }) {
  return children;
}
