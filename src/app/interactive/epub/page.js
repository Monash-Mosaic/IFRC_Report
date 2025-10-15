"use client"

import { useState, useRef, useEffect } from "react"
import { ReactReader } from 'react-reader'

export const Example = ({ title, actions, children, above = null }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <h1 className="h1">{title}</h1>
        {actions && (
          <div className="flex items-start flex-wrap gap-2">{actions}</div>
        )}
      </div>
      {above}
      <div className="md:aspect-video aspect-[3/4] w-full border border-stone-300 rounded overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function EPUBPage() {
  const epubpath = `/WDR25-CHAPTER-02/OEBPS/content.opf`;
  const [largeText, setLargeText] = useState(false)
  const rendition = useRef(undefined)
  const [location, setLocation] = useState(0)
  useEffect(() => {
    rendition.current?.themes.fontSize(largeText ? '140%' : '100%')
  }, [largeText])
  return (
    <Example
      title="Basic example"
      actions={
        <>
          <button onClick={() => setLargeText(!largeText)} className="btn">
            Toggle font-size
          </button>
        </>
      }
    >
      <ReactReader
        url={epubpath}
        // title={DEMO_NAME}
        location={location}
        locationChanged={(loc) => setLocation(loc)}
        getRendition={(_rendition) => {
          rendition.current = _rendition
          rendition.current.themes.fontSize(largeText ? '140%' : '100%')
        }}
      />
    </Example>
  )
}
