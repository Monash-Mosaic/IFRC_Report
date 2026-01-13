import React from 'react';
import {
  Deprivational,
  Digital,
  Informational,
  Longitudinal,
  Physical,
  Psychological,
  Social,
  Societal,
} from '@/components/icons/toh';
import { getTranslations } from 'next-intl/server';
import Tooltip from './Tooltip';

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
      style={{
        fontFamily: 'var(--font-bespoke-serif)',
        margin: '1rem 0',
        fontSize: '1.5rem',
        fontWeight: 800,
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
      style={{
        fontFamily: 'var(--font-bespoke-serif)',
        fontWeight: 800,
        borderBottom: '2px solid #030303ff',
        fontSize: '1.5rem',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export async function TohInsight({ children, ...props }) {
  const content = React.Children.toArray(children).toString();
  const parts = content.toString().trim().split(',');
  const c = await getTranslations('ContributionInsight');
  const toh = await getTranslations('TohIcons');

  const svgMap = {
    Physical: (
      <Tooltip key={'PHY_tip'} tooltipText={toh('physical')} orientation="top">
        <Physical key={'PHY'} className="w-10 h-10" />
      </Tooltip>
    ),
    Psychological: (
      <Tooltip key={'PSY_tip'} tooltipText={toh('psychological')} orientation="top">
        <Psychological key={'PSY'} className="w-10 h-10" />
      </Tooltip>
    ),
    Social: (
      <Tooltip key={'SCL_tip'} tooltipText={toh('social')} orientation="top">
        <Social key={'SCL'} className="w-10 h-10" />
      </Tooltip>
    ),
    Societal: (
      <Tooltip key={'SCT_tip'} tooltipText={toh('societal')} orientation="top">
        <Societal key={'SCT'} className="w-10 h-10" />
      </Tooltip>
    ),
    Informational: (
      <Tooltip key={'INF_tip'} tooltipText={toh('informational')} orientation="top">
        <Informational key={'INF'} className="w-10 h-10" />
      </Tooltip>
    ),
    Digital: (
      <Tooltip key={'DIG_tip'} tooltipText={toh('digital')} orientation="top">
        <Digital key={'DIG'} className="w-10 h-10" />
      </Tooltip>
    ),
    Deprivational: (
      <Tooltip key={'DEP_tip'} tooltipText={toh('deprivational')} orientation="top">
        <Deprivational key={'DEP'} className="w-10 h-10" />
      </Tooltip>
    ),
    Longitudinal: (
      <Tooltip key={'LON_tip'} tooltipText={toh('longitudinal')} orientation="top">
        <Longitudinal key={'LON'} className="w-10 h-10" />
      </Tooltip>
    ),
  };

  return (
    <div
      style={{
        borderLeft: '2px solid #ee2435',
        color: '#ee2435',
        paddingLeft: '2vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
      {...props}
    >
      <span>
        {c('title')} {props.index}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {parts.map((code) => {
          return svgMap[code];
        })}
      </div>
    </div>
  );
}

export function DefinitionDescription({ children, ...props }) {
  return (
    <aside
      style={{
        fontFamily: 'var(--font-bespoke-serif)',
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
