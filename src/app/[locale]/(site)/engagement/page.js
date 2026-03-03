import { routing } from '@/i18n/routing';
import EngagementClient from '@/components/engagement/EngagementClient';

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata = {
  title: 'Engagement',
};

export default function EngagementPage() {
  return <EngagementClient />;
}
