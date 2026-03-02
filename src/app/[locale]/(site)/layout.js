import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function SiteLayout({ params, children }) {
  const { locale } = await params;
  return (
    <>
      <Header locale={locale}/>
      {children}
      <Footer />
    </>
  );
}
