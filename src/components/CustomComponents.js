// Lightweight placeholder components used by MDX content.
// These are intentionally minimal so pages render without styling dependencies.
// TODO: Enhance these components with styling as needed.

export function Contributors({ children, ...props }) {
  return (
    <div role="group" aria-label="Contributors" {...props}>
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
    <aside
      style={{
        padding: '1rem',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#fafafa',
      }}
      {...props}
    >
      {children}
    </aside>
  );
}

export function SideNote({ children, ...props }) {
  return (
    <aside
      style={{
        padding: '0.75rem',
        borderLeft: '4px solid #93c5fd',
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
      style={{
        margin: '1rem 0',
        paddingLeft: '1rem',
        borderLeft: '4px solid #e5e7eb',
        fontStyle: 'italic',
      }}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function SmallQuoteAuthor({ children, ...props }) {
  return (
    <div style={{ textAlign: 'right', fontWeight: 600 }} {...props}>
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

const CustomComponents = {
  Contributors,
  ContributorRole,
  Spotlight,
  SideNote,
  SmallQuote,
  SmallQuoteAuthor,
  ContributorSpotlight,
  ContributorSpotlightName,
  ContributorSpotlightPosition,
  ContributorSpotlightRole,
};

export default CustomComponents;
