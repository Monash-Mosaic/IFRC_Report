// Lightweight placeholder components used by MDX content.
// These are intentionally minimal so pages render without styling dependencies.
// TODO: Enhance these components with styling as needed.

export function Contributors({ children, ...props }) {
  return (
    <div
      role="group"
      aria-label="Contributors"
      style={{
        borderBottom: "2px solid #ee2435",
        paddingBottom: "4px",
        fontWeight: "600"
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function ContributorRole({ children, ...props }) {
  return (
    <div style={{ fontStyle: "italic" }} {...props}>
      {children}
    </div>
  );
}

export function Spotlight({ children, ...props }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "5% 95%",
        width: "100%",
        height: "auto"
      }}
    >
      <div
        style={{
          background: "#ee2435",
          transform: "translateY(20px)"
        }}
      ></div>
      <div
        style={{
          alignSelf: "start",
          paddingLeft: "2vw",
          background: "#a4def8ff",
          fontWeight: "700",
          fontSize: "2.25rem"
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
        padding: "0.75rem",
        borderLeft: "4px solid #ee2435",
        background: "#f8fafc"
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
        margin: "1rem 0",
        fontSize: "1.5rem",
        fontFamily: "Math",
        fontWeight: 600,
        paddingLeft: "1rem",
        borderLeft: "4px solid #ee2435"
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
        textAlign: "left",
        fontWeight: 200,
        borderTop: "2px solid #ee2435"
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
        padding: "1rem",
        border: "1px dashed #d1d5db",
        borderRadius: 8,
        background: "#ffffff"
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
    <div style={{ color: "#6b7280" }} {...props}>
      {children}
    </div>
  );
}

export function ContributorSpotlightRole({ children, ...props }) {
  return (
    <div style={{ fontStyle: "italic" }} {...props}>
      {children}
    </div>
  );
}

export function ChapterQuote({ children, ...props }) {
  return (
    <div style={{ color: "#6b7280", fontStyle: "italic" }} {...props}>
      {children}
    </div>
  );
}

const CustomComponents = {
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
  ContributorSpotlightRole
};

export default CustomComponents;
