import React, { Children } from 'react';
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

export function ContributorTag({ children, ...props }) {
  const numberOfContributors = React.Children.count(children);
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-${numberOfContributors} gap-4`}
    >
      {children}
    </div>
  );
}

export function Contributor( { children, ...props }) {
  // this component only accept ContributorName, ContributorRole, and ContributorEntity as children
  const childrenArray = React.Children.toArray(children);
  const name = childrenArray.find((child) => child.type === ContributorName);
  const role = childrenArray.find((child) => child.type === ContributorRole);
  const entity = childrenArray.find((child) => child.type === ContributorEntity);
  return (
    <div
      {...props}
    >
      {name}
      {entity}
      {role}
    </div>
  );
}

export function ContributorEntity({ children, ...props }) {
  return (
    <div>
      <div 
        className='inline-block text-sm font-bold border-b-1 border-[#ee2435]' 
      {...props}>
        {children}
      </div>
    </div>
  );
}

export function ContributorName({ children, ...props }) {
  return (
    <div {...props} className='inline-block text-sm font-medium border-b-2 border-[#ee2435]'>
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
    <div className='text-sm' {...props}>
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
      className="border-l-1 border-l-[#ee2435]"
    >
      <div
        style={{
          background: '#ee2435',
          transform: 'translateY(20px)',
          marginLeft: '-1px',
          width: 'calc(100% - 0px)', // NOT A BUG: to align with border
        }}
      ></div>
      <div
        style={{
          alignSelf: 'start',
          background: '#b3ffff',
          fontWeight: '700',
          fontSize: '2.25rem',
          marginLeft: '-1px',
        }}
        className="p-6"
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

export async function TohInsight({ children, types = [], ...props }) {
  const toh = await getTranslations('TohIcons');

  const svgMap = {
    Physical: (
      <Tooltip key={'PHY_tip'} tooltipText={toh('physical')} orientation="top">
        <Physical key={'PHY'} className="w-5 h-5" />
      </Tooltip>
    ),
    Psychological: (
      <Tooltip key={'PSY_tip'} tooltipText={toh('psychological')} orientation="top">
        <Psychological key={'PSY'} className="w-5 h-5" />
      </Tooltip>
    ),
    Social: (
      <Tooltip key={'SCL_tip'} tooltipText={toh('social')} orientation="top">
        <Social key={'SCL'} className="w-5 h-5" />
      </Tooltip>
    ),
    Societal: (
      <Tooltip key={'SCT_tip'} tooltipText={toh('societal')} orientation="top">
        <Societal key={'SCT'} className="w-5 h-5" />
      </Tooltip>
    ),
    Informational: (
      <Tooltip key={'INF_tip'} tooltipText={toh('informational')} orientation="top">
        <Informational key={'INF'} className="w-5 h-5" />
      </Tooltip>
    ),
    Digital: (
      <Tooltip key={'DIG_tip'} tooltipText={toh('digital')} orientation="top">
        <Digital key={'DIG'} className="w-5 h-5" />
      </Tooltip>
    ),
    Deprivational: (
      <Tooltip key={'DEP_tip'} tooltipText={toh('deprivational')} orientation="top">
        <Deprivational key={'DEP'} className="w-5 h-5" />
      </Tooltip>
    ),
    Longitudinal: (
      <Tooltip key={'LON_tip'} tooltipText={toh('longitudinal')} orientation="top">
        <Longitudinal key={'LON'} className="w-5 h-5" />
      </Tooltip>
    ),
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {types.map((code) => {
        return svgMap[code];
      })}
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

export const Box = async ({ children, ...props }) => {
  const c = await getTranslations('ContributionInsight');
  const [h2, ...rest] = Children.toArray(children);
  const anchorId = h2.props.id; // move id to wrapper div
  // clone h2 without id to avoid duplicate ids
  const h2WithoutId = React.cloneElement(h2, { id: undefined });
  const contributorTagIndex = rest.findIndex((child => child.type === ContributorTag));
  const contributorTag = rest.splice(contributorTagIndex, 1); // extract ContributorTag if exists
  return (
    <div id={anchorId}>
      <div>
        <div
          style={{
            color: '#ee2435',
            display: 'grid',
            gridTemplateColumns: '5% 95%',
            width: '100%',
            height: 'auto',
          }}
          {...props}
        >
          <div
            style={{
              borderLeft: '1px solid #ee2435',
            }}
          />
          <div
            style={{    
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              paddingBottom: '16px',
            }}
          >
            <span>
              {c('title')} {props.index}
            </span>
            {props.types && (
              <TohInsight types={props.types} />
            )}
          </div>
        </div>
        {<Spotlight>{h2WithoutId}</Spotlight>}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5% 95%',
          width: '100%',
          height: 'auto',
        }}
      >
        <div className='border-r-1 border-r-[#ee2435]'></div>
        <div
        className="grid grid-cols-1 gap-8 pl-6 pt-[20px] pb-[calc(var(--spacing)*8)]"
          {...props}
        >
          {rest}
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5% 95%',
          width: '100%',
          height: 'auto',
        }}
      >
        <div className='border-r-1 border-r-[#ee2435]'></div>
        <div
          className="grid grid-cols-1 gap-8 pl-6 border-l-4 border-l-[#ee2435] [&_div]:ml-[-2px]"
          {...props}
        >
          {contributorTag}
        </div>
      </div> 
    </div>
  );
}

const CustomComponents = {
  Box,
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
