import localFont from 'next/font/local';

const bespokeSerif = localFont({
  src: [
    {
      path: '../../public/fonts/BespokeSerif-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BespokeSerif-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../public/fonts/BespokeSerif-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/BespokeSerif-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  display: 'swap',
});

// Lightweight placeholder components used by MDX content.
// These are intentionally minimal so pages render without styling dependencies.
// TODO: Enhance these components with styling as needed.

export function ReccomendationsTitle({ children, ...props }) {
  return (
    <div
      aria-label="ReccomendationsTitle"
      style={{
        color: '#ee2435',
        fontSize: '1.5rem',
        borderBottom: '2px solid #030303ff',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Reccomendations({ children, ...props }) {
  return (
    <div aria-label="Reccomendations" style={{ fontWeight: 700 }} {...props}>
      {children}
    </div>
  );
}

export function H1Contributor({ children, ...props }) {
  return (
    <div
      aria-label="H1Contributors"
      style={{
        borderBottom: '3px solid #ee2435',
        paddingBottom: '2px',
        fontWeight: '400',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Contributors({ children, ...props }) {
  return (
    <div
      role="group"
      aria-label="Contributors"
      style={{
        borderBottom: '2px solid #ee2435',
        paddingBottom: '4px',
        fontWeight: '600',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ContributorRole({ children, ...props }) {
  return (
    <div style={{ fontStyle: 'italic' }} {...props}>
      {children}
    </div>
  );
}

export function Spotlight({ children, ...props }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '5% 95%',
        width: '100%',
        height: 'auto',
      }}
    >
      <div
        style={{
          background: '#ee2435',
          transform: 'translateY(20px)',
        }}
      ></div>
      <div
        style={{
          alignSelf: 'start',
          paddingLeft: '2vw',
          background: '#a4def8ff',
          fontWeight: '700',
          fontSize: '2.25rem',
        }}
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

export function SideNote({ children, ...props }) {
  return (
    <aside
      style={{
        padding: '0.75rem',
        borderLeft: '4px solid #ee2435',
        background: '#f8fafc',
      }}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SmallQuote({ children, ...props }) {
  return (
    <blockquote
      className={bespokeSerif.className}
      style={{
        margin: '1rem 0',
        fontSize: '1.5rem',
        fontWeight: 700,
        paddingLeft: '1rem',
        borderLeft: '4px solid #ee2435',
      }}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function SmallQuoteAuthor({ children, ...props }) {
  return (
    <div
      style={{
        textAlign: 'left',
        fontWeight: 200,
        borderTop: '2px solid #ee2435',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ContributorSpotlight({ children, ...props }) {
  return (
    <section
      style={{
        padding: '1rem',
        border: '1px dashed #d1d5db',
        borderRadius: 8,
        background: '#ffffff',
      }}
      {...props}
    >
      {children}
    </section>
  );
}

export function ContributorSpotlightName({ children, ...props }) {
  return (
    <div style={{ fontWeight: 700 }} {...props}>
      {children}
    </div>
  );
}

export function ContributorSpotlightPosition({ children, ...props }) {
  return (
    <div style={{ color: '#6b7280' }} {...props}>
      {children}
    </div>
  );
}

export function ContributorSpotlightRole({ children, ...props }) {
  return (
    <div style={{ fontStyle: 'italic' }} {...props}>
      {children}
    </div>
  );
}

export function ChapterQuote({ children, ...props }) {
  return (
    <div style={{ color: '#6b7280', fontStyle: 'italic' }} {...props}>
      {children}
    </div>
  );
}

export function Definition({ children, ...props }) {
  return (
    <div
      className={bespokeSerif.className}
      style={{
        fontWeight: 700,
        borderBottom: '2px solid #030303ff',
        fontSize: '1.5rem',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DefinitionDescription({ children, ...props }) {
  return (
    <aside
      className={bespokeSerif.className}
      style={{
        fontWeight: 400,
        padding: '0.75rem',
        borderLeft: '4px solid #030303ff',
        background: '#f8fafc',
        fontSize: '1.25rem',
      }}
      {...props}
    >
      {children}
    </aside>
  );
}

const CustomComponents = {
  H1Contributor,
  Contributors,
  ContributorRole,
  Spotlight,
  SideNote,
  ChapterQuote,
  SmallQuote,
  SmallQuoteAuthor,
  ContributorSpotlight,
  ContributorSpotlightName,
  ContributorSpotlightPosition,
  ContributorSpotlightRole,
  Definition,
  DefinitionDescription,
};

export default CustomComponents;
