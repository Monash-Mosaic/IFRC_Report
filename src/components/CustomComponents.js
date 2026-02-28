import React, { Children } from 'react';
import { ArrowRight } from 'lucide-react';
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
import Image from 'next/image';

// Lightweight placeholder components used by MDX content.
// These are intentionally minimal so pages render without styling dependencies.
// TODO: Enhance these components with styling as needed.
// <div className="[border-inline-start:1px_solid_#ee2435]" />

export function ContributorTag({ children, ...props }) {
  const numberOfContributors = React.Children.count(children);
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${numberOfContributors} gap-4`}>{children}</div>
  );
}

export function Contributor({ children, ...props }) {
  // this component only accept ContributorName, ContributorRole, and ContributorEntity as children
  const childrenArray = React.Children.toArray(children);
  const name = childrenArray.find((child) => child.type === ContributorName);
  const role = childrenArray.find((child) => child.type === ContributorRole);
  const entity = childrenArray.find((child) => child.type === ContributorEntity);
  return (
    <div {...props}>
      <div>{name}</div>
      <div>{entity}</div>
      <div>{role}</div>
    </div>
  );
}

export function ContributorEntity({ children, ...props }) {
  return (
    <div className="inline-block text-sm font-bold border-b-1 border-[#ee2435]" {...props}>
      {children}
    </div>
  );
}

export function ContributorName({ children, ...props }) {
  return (
    <div {...props} className="inline-block text-sm font-medium border-b-2 border-[#ee2435]">
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
    // <div className="grid grid-cols-[5%_95%] w-full h-auto border-l border-l-[#ee2435]">
    <div className="grid grid-cols-[5%_95%] w-full h-auto [border-inline-start:1px_solid_#ee2435]">
      <div className="bg-[#ee2435] translate-y-5 w-full [margin-inline-start:-1px]"></div>
      <div
        className="self-start bg-[#b3ffff] font-bold text-4xl p-6 [margin-inline-start:-1px]"
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
      className="font-[var(--font-bespoke-serif)] my-4 text-2xl font-extrabold [padding-inline-start:1rem] [border-inline-start:4px_solid_#ee2435]"
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function SmallQuoteAuthor({ children, ...props }) {
  return (
    <div className="text-start font-extralight border-t-2 border-[#ee2435]" {...props}>
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

export function Anchor({ children, meta, ...props }) {
  return (
    <div className="grid grid-cols-[5%_95%] w-full h-auto pt-4 pb-4 items-center">
      <div className="text-sm text-[#fe4d60] text-end">{meta}</div>
      <div className="[padding-inline-start:1.5rem] font-bold text-2xl" {...props}>
        {children}
      </div>
    </div>
  );
}

export function ColumParagraphs({ children, count = 2, ...props }) {
  return (
    <div className={`grid gap-6 md:grid-cols-${count}`} {...props}>
      {children}
    </div>
  );
}

export function ColumParagraph({ children, ...props }) {
  return (
    <div className="space-y-4" {...props}>
      {children}
    </div>
  );
}

export function FeatureImage({ src, description, ...props }) {
  return (
    <figure>
      <Image className="w-full mb-4" alt={description} src={src} {...props} />
      {description && (
        <figcaption className="text-xs font-medium">
          {description} <span className="text-red-500">@IFRC</span>
        </figcaption>
      )}
    </figure>
  );
}

export function Definition({ children, ...props }) {
  return (
    <div
      className="font-[var(--font-bespoke-serif)] font-extrabold border-b-2 border-[#030303ff] text-2xl"
      {...props}
    >
      {children}
    </div>
  );
}

export function DefinitionDescription({ children, ...props }) {
  return (
    <aside
      className="font-[var(--font-bespoke-serif)] font-normal [padding-inline:0.75rem] [padding-block:0.75rem] [border-inline-start:4px_solid_#030303ff] bg-slate-50 text-xl"
      {...props}
    >
      {children}
    </aside>
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

function chunkByPredicate(array, predicate) {
  const chunkedArray = [];
  if (!array || array.length === 0) {
    return chunkedArray;
  }

  let currentChunk = [array[0]];
  chunkedArray.push(currentChunk);

  for (let i = 1; i < array.length; i++) {
    const currentElement = array[i];
    const previousElement = array[i - 1];

    // If the predicate condition changes between the current and previous element
    if (predicate(currentElement) !== predicate(previousElement)) {
      currentChunk = [currentElement];
      chunkedArray.push(currentChunk);
    } else {
      // Otherwise, add to the current chunk
      currentChunk.push(currentElement);
    }
  }

  return chunkedArray;
}

export const Box = async ({ children, index, types, arrowHref, arrowLabel, ...props }) => {
  const c = await getTranslations('ContributionInsight');
  const [h2, ...rest] = Children.toArray(children);
  const contributorTagIndex = rest.findIndex((child) => child.type === ContributorTag);
  const contributorTag = contributorTagIndex >= 0 ? rest.splice(contributorTagIndex, 1) : [];
  const splittedByAnchor = chunkByPredicate(rest, (child) => child.type === Anchor);
  return (
    <div>
      <div>
        <div className="text-[#ee2435] grid grid-cols-[5%_95%] w-full h-auto" {...props}>
          <div className="[border-inline-start:1px_solid_#ee2435]" />
          <div className="flex items-center justify-between pt-4 pb-4">
            <span>
              {c('title')} {index}
            </span>
            <div className="flex items-center gap-3">
              {types ? <TohInsight types={types} /> : null}
              {arrowHref ? (
                <a
                  href={arrowHref}
                  aria-label={arrowLabel ?? 'Jump to referenced content'}
                  className="text-[#8b5cf6] hover:text-[#7c3aed] transition-colors"
                >
                  <ArrowRight className="w-5 h-5" strokeWidth={2.75} />
                </a>
              ) : null}
            </div>
          </div>
        </div>
        {<Spotlight>{h2}</Spotlight>}
      </div>
      {splittedByAnchor.map((chunk, index) => {
        if (chunk[0].type === Anchor) {
          return chunk[0];
        }
        return (
          <div key={index} className="grid grid-cols-[5%_95%] w-full h-auto">
            <div className="[border-inline-end:1px_solid_#ee2435]" />
            <div className="grid grid-cols-1 gap-8 pt-[20px] pb-[calc(var(--spacing)*8)] [padding-inline-start:1.5rem]">
              {chunk}
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-[5%_95%] w-full h-auto">
        <div className="[border-inline-end:1px_solid_#ee2435]" />
        <div
          className="grid grid-cols-1 gap-8 [padding-inline-start:1.5rem] [border-inline-start:4px_solid_#ee2435] [&_div]:[margin-inline-start:-2px]"
          {...props}
        >
          {contributorTag}
        </div>
      </div>
    </div>
  );
};

export function ChapterImage({ imagePath, alt = 'Alt', width = 900, height = 700 }) {
  return (
    <div className="w-full">
      <div
        className="relative overflow-hidden  select-none w-full rounded-lg"
        style={{
          maxWidth: width,
          aspectRatio: `${width} / ${height}`,
          margin: '0 auto',
        }}
      >
        <Image src={imagePath} alt={alt} fill className="object-cover" />
      </div>
    </div>
  );
}

export function EndnotesLink({ children, ...props }) {
  return (
    <span className="underline decoration-[#68ACFD]" {...props}>
      {children}
    </span>
  );
}

export function ChapterLink({ children, ...props }) {
  return (
    <a className="text-[#f2483a]" {...props}>
      {children}
    </a>
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
  Anchor,
  ColumParagraphs,
  ColumParagraph,
  FeatureImage,
  SmallQuote,
  SmallQuoteAuthor,
  ContributorSpotlight,
  ContributorSpotlightName,
  ContributorSpotlightPosition,
  ContributorSpotlightRole,
  ChapterImage,
  Definition,
  DefinitionDescription,
  H1Contributor,
  Reccomendations,
  ReccomendationsTitle,
  EndnotesLink,
  ChapterLink,
};

export default CustomComponents;
