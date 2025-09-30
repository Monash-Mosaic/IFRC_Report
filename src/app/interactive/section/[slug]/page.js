"use client"

import { ArrowLeft, Copy, Share2, Palette } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'next-share'
import { title } from "process"

const sectionContent = {
  introduction: {
    title: "Introduction",
    subtitle: "Dedication to volunteers and staff killed in 2024",
    content: [
      "Climate change is a global humanitarian crisis with worsening impacts. 2023 was the warmest year on record (WMO, 2023). More than 200 climate and weather-related disasters were recorded worldwide, affecting about 77 million people.",
      "The year saw unprecedented extreme events, such as the second longest-lived tropical cyclone on record, Freddy, in the South Indian Ocean; Cyclone Mocha, one of the heaviest cyclones ever in the Bay of Bengal, and Storm Daniel in Libya (WMO, 2023).",
      "The Red Cross Red Crescent Climate Centre is part of the World Weather Attribution studies which found that, amongst others, climate change increased the intensity of heavy rainfall in Libya during Daniel by up to 50 per cent, while intense heatwaves in 2023 in China, Europe and North America would have been extremely rare or impossible without climate change.",
      "Between 3.3–3.6 billion people live in contexts highly vulnerable to climate change. It is the world's poorest and most exposed people who suffer the most (IPCC 2023).",
      "In Africa, food and water systems rely heavily on rain-fed agriculture and pastoralism, which are extremely vulnerable to climate change. These challenges worsened the continent's existing and overlapping drivers of vulnerability such as poverty, and limited resources, leading to displacement, food insecurity and deaths.",
      "The Americas face high exposure to warming temperatures, sea level rise, coastal erosion and ocean acidification. The region was affected by a range of extreme events in 2023, including hurricanes and floods and dry seasons generating droughts affecting agriculture and industry production.",
      "In Asia Pacific, climate change is raising the risks of cyclones, and contributing to a rise in vector-borne diseases such as dengue fever and malaria. The region experienced severe flooding, droughts, and extreme weather events throughout 2024.",
      "The European region faced unprecedented heatwaves, wildfires, and flooding events that highlighted the urgent need for climate adaptation measures. Many countries reported record-breaking temperatures and extreme weather patterns.",
      "The Middle East and North Africa region experienced severe water scarcity, extreme heat, and dust storms that affected millions of people. Climate change exacerbated existing vulnerabilities and created new humanitarian challenges.",
      "Small Island Developing States faced existential threats from sea level rise, coastal erosion, and increased frequency of tropical cyclones. Many communities were forced to relocate due to climate impacts.",
      "Arctic regions experienced rapid ice melting, permafrost thaw, and ecosystem changes that affected indigenous communities and global climate patterns. The rate of change exceeded scientific projections.",
      "Mountain regions worldwide faced glacier retreat, changing precipitation patterns, and increased risk of natural disasters. These changes affected water resources for billions of people downstream.",
      "Coastal communities globally experienced increased flooding, storm surge damage, and saltwater intrusion into freshwater systems. Adaptation measures became critical for survival.",
      "Urban areas faced heat island effects, flooding, and air quality issues exacerbated by climate change. Cities became focal points for both vulnerability and innovation in climate response.",
      "Rural communities, particularly those dependent on agriculture, faced crop failures, livestock losses, and changing growing seasons. Traditional knowledge systems were challenged by unprecedented changes.",
      "The humanitarian sector recognized the need for anticipatory action, early warning systems, and climate-resilient programming. Innovation in humanitarian response became essential for effective assistance.",
      "International cooperation and climate finance became critical components of humanitarian response. The IFRC advocated for increased funding for climate adaptation and disaster risk reduction.",
      "Community-based approaches proved most effective in building resilience to climate impacts. Local knowledge and participation were essential for sustainable solutions.",
      "The intersection of climate change, conflict, and displacement created complex humanitarian crises requiring integrated responses. Multi-sectoral approaches became the norm rather than the exception.",
      "Technology and innovation played crucial roles in climate monitoring, early warning, and response coordination. Digital solutions enhanced the effectiveness of humanitarian interventions.",
      "Youth engagement and leadership became central to climate action and humanitarian response. Young people drove innovation and advocacy for climate justice and humanitarian principles.",
    ],
  },
  "annual-overview": {
    title: "Annual Overview",
    subtitle: "Key achievements and milestones in 2024",
    content: [
      "The International Federation of Red Cross and Red Crescent Societies (IFRC) continued its mission to improve the lives of vulnerable people by mobilizing the power of humanity.",
      "Throughout 2024, our network responded to numerous emergencies, supported community resilience building, and advanced humanitarian diplomacy on critical issues affecting the most vulnerable populations.",
      "Key highlights include our response to major disasters, expansion of community-based programs, and strengthening of National Society capacities across all regions.",
      "Our work focused on addressing the root causes of vulnerability while providing immediate humanitarian assistance to those in need.",
    ],
  },
  "harmful-information":{
    title: "Harmful Information and the Erosion of Trust in Humanitarian Response",
    subtitle: "“To be persuasive we must be believable; to be believable we must be credible; to be credible we must be truthful.”",
    content: [
      "So said Ed Murrow, the American broadcaster and correspondent during the Second World War.  The principle still holds: truth and credibility remain essential to building institutional trust.  But in today’s information landscape, applying that principle has become far more complex and frequently contested in an age shaped by harmful information.  In times of crisis or uncertainty – and we are living in profoundly uncertain times – people increasingly turn to information sources they perceive as relevant and aligned with their personal and lived experiences, rather than those grounded solely in factual accuracy.  In this shifting landscape, truth alone no longer always persuades. Emotion, identity and repetition can entrench misbeliefs in powerful and sometimes harmful ways.  In such an environment, even reaching agreement on what constitutes a fact is difficult. For humanitarian organizations, whose access, acceptance and ability to operate depend on trust, navigating this fragmented, emotionally charged information space has become not only an operational challenge but a security one as well",
      "This online dynamic was described by Eli Pariser in 2011 as the “filter bubble,” a term used to explain how search engines and social media platforms are designed to serve us content that algorithms think we want to see, based on our searches, likes and clicks.  Pariser also warned that being confined to such echo chambers could reduce our exposure to diverse perspectives and increase the risk of becoming isolated in our views or reject opposing viewpoints and sources of information due to confirmation bias. ",
      "Although some studies (Nguyen, Pierre) have shown that we do encounter opposing viewpoints online, these interactions often trigger annoyance and hostility rather than reflection or debate. Algorithms further amplify this by promoting divisive content, as hostility tends to drive engagement, and engagement, in turn, drives profits for platform companies.  As Eli Pariser notes, platforms are effectively “incentivizing us to fight with each other when we are online”. This dynamic is reinforced by the online disinhibition effect, a concept popularized by psychologist John Suler, which describes how people tend to express opinions more freely online due to factors like anonymity (hidden identities), invisibility (not being seen by others we communicate with) and asynchronicity (not engaging in real time).",
      "These dynamics contribute to an erosion of shared reality. Increasingly, there are claims that natural disasters never happened, that scientifically validated medical treatments are unsafe, or that documented atrocities are fabricated or exaggerated. This reflects what many describe as a “post-trust” world - one in which people are especially vulnerable to harmful information and polarization around what is considered true or false.  This deepening  polarization increases the risk of social unrest, violence and even armed conflict.",
      "The internet makes it easier than ever to find information that reinforces what we already believe – a phenomenon sometimes referred to as the “Google delusion”. Online spaces amplify confirmation bias by making it easier for users to find like-minded communities, cite, or recall information that supports existing beliefs while ignoring contradictory information or expert advice. While the internet offers access to vast knowledge, it also accelerates the spread of harmful information, polarisation and fosters hostility - encouraging argument over dialogue and conspiracy over evidence.",
      "RAND researchers Jennifer Kavanagh and Michael Rich (2008) have described this phenomenon as  “truth decay”, characterized by: (1) an increasing volume of opinion and opinion over fact; (2) a blurring of the line between opinion and fact; (3) declining trust in formerly respected sources of factual information; and (4) growing disagreement about facts and the interpretations of data. Instead of using facts to inform our beliefs, we increasingly use information – regardless of its veracity (truthfulness) – to justify the beliefs that we and the groups we affiliate with, already hold.  “We are no longer willing to agree on something as seemingly fundamental as what counts as evidence, facts, or truth anymore”."
    ]
  },
  "response-to-emergencies": {
    title: "Response to Emergencies",
    subtitle: "Emergency response operations and disaster management",
    content: [
      "The IFRC network responded to over 300 emergencies in 2024, reaching millions of people with life-saving assistance.",
      "Our emergency response operations included disaster relief, emergency health services, water and sanitation support, and shelter assistance.",
      "We strengthened our disaster preparedness capabilities through early warning systems, community-based disaster risk reduction, and capacity building programs.",
      "Regional response mechanisms were enhanced to ensure rapid and effective deployment of resources and expertise.",
    ],
  },
  "strategic-priorities": {
    title: "Strategic Priorities",
    subtitle: "Long-term strategic goals and initiatives",
    content: [
      "Our strategic priorities focus on building resilient communities, addressing climate change impacts, and promoting social inclusion.",
      "We prioritized strengthening National Society capacities, enhancing humanitarian diplomacy, and fostering innovation in humanitarian action.",
      "Key initiatives included expanding our youth engagement programs, advancing digital transformation, and promoting locally-led humanitarian action.",
      "We continued to advocate for the most vulnerable populations and work towards achieving the Sustainable Development Goals.",
    ],
  },
  "enabling-functions": {
    title: "Enabling Functions",
    subtitle: "Organizational support and capacity building",
    content: [
      "Our enabling functions provide the foundation for effective humanitarian action across the IFRC network.",
      "We invested in organizational development, financial management systems, and human resources capacity building.",
      "Technology and innovation initiatives supported improved service delivery and operational efficiency.",
      "Partnership development and resource mobilization efforts ensured sustainable funding for our humanitarian programs.",
    ],
  },
}

export default function SectionPage() {
  const router = useRouter()
  const params = useParams()
  const slug = params.slug
  const [currentPage, setCurrentPage] = useState(1)
  const paragraphsPerPage = 8

  const [selectedText, setSelectedText] = useState("")
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const [highlights, setHighlights] = useState({})
  const [selectedRange, setSelectedRange] = useState(null)
  const [isHighlightedText, setIsHighlightedText] = useState(false)
  const [currentHighlightId, setCurrentHighlightId] = useState(null)
  const contentRef = useRef(null)

  const highlightColors = [
    { name: 'Yellow', color: '#fef08a', class: 'bg-yellow-200' },
    { name: 'Blue', color: '#bfdbfe', class: 'bg-blue-200' },
    { name: 'Pink', color: '#fbcfe8', class: 'bg-pink-200' },
  ]

  const section = sectionContent[slug]
  const totalParagraphs = section ? section.content.length : 0
  const totalPages = Math.ceil(totalParagraphs / paragraphsPerPage)
  const startIndex = (currentPage - 1) * paragraphsPerPage
  const endIndex = startIndex + paragraphsPerPage
  const currentContent = section ? section.content.slice(startIndex, endIndex) : []
  const progress = Math.round((currentPage / totalPages) * 100)
   const iframeRef = useRef(null);

  const handleTextSelection = () => {
    const selection = window.getSelection()
    console.log(selection)
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Check if the selection is within a highlighted span
      let container = range.commonAncestorContainer
      let highlightId = null
      let isHighlighted = false

      // Check if we're selecting within a highlight span
      while (container && container !== contentRef.current) {
        if (container.nodeType === Node.ELEMENT_NODE &&
            container.classList &&
            container.classList.contains('highlight-span')) {
          highlightId = container.getAttribute('data-highlight-id')
          isHighlighted = true
          break
        }
        container = container.parentNode
      }

      setSelectedText(selection.toString())
      setSelectedRange({
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        text: selection.toString(),
      })
      setIsHighlightedText(isHighlighted)
      setCurrentHighlightId(highlightId)
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 60,
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
      setSelectedText("")
      setSelectedRange(null)
      setIsHighlightedText(false)
      setCurrentHighlightId(null)
    }
  }

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
        setShowToolbar(false)
        setSelectedText("")
        setSelectedRange(null)
      } catch (err) {
        console.error("Failed to copy text:", err)
      }
    }
  }



  const handleShare = async () => {
    if (selectedText) {
      try {
        if (navigator.share) {
          await navigator.share({
            title: "IFRC Annual Report 2024",
            text: selectedText,
            url: window.location.href,
          })
        } else {
          await navigator.clipboard.writeText(`"${selectedText}" - IFRC Annual Report 2024`)
        }
        setShowToolbar(false)
        setSelectedText("")
        setSelectedRange(null)
      } catch (err) {
        console.error("Failed to share text:", err)
      }
    }
  }

  const handleHighlight = (color) => {
    if (selectedRange && selectedText) {
      const highlightId = `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newHighlight = {
        id: highlightId,
        text: selectedText,
        color: color.color,
        className: color.class,
        startContainer: selectedRange.startContainer,
        startOffset: selectedRange.startOffset,
        endContainer: selectedRange.endContainer,
        endOffset: selectedRange.endOffset,
        page: currentPage,
        paragraphIndex: null, // Will be set when we identify which paragraph
      }

      // Find which paragraph this highlight belongs to
      if (selectedRange.startContainer.nodeType === Node.TEXT_NODE) {
        const paragraphElement = selectedRange.startContainer.parentElement.closest('p')
        if (paragraphElement) {
          const paragraphs = contentRef.current.querySelectorAll('p')
          newHighlight.paragraphIndex = Array.from(paragraphs).indexOf(paragraphElement)
        }
      }

      setHighlights(prev => ({
        ...prev,
        [highlightId]: newHighlight
      }))

      // Clear selection and toolbar
      window.getSelection().removeAllRanges()
      setShowToolbar(false)
      setSelectedText("")
      setSelectedRange(null)

      // Apply highlight to DOM
      applyHighlightToDOM(newHighlight)
    }
  }

  const applyHighlightToDOM = (highlight) => {
    try {
      const range = document.createRange()
      range.setStart(highlight.startContainer, highlight.startOffset)
      range.setEnd(highlight.endContainer, highlight.endOffset)

      const span = document.createElement('span')
      span.className = `${highlight.className} highlight-span`
      span.setAttribute('data-highlight-id', highlight.id)
      span.style.borderRadius = '2px'
      span.style.padding = '1px 2px'
      span.style.cursor = 'pointer'
      span.style.transition = 'opacity 0.2s ease'

      // Add hover effect
      span.addEventListener('mouseenter', () => {
        span.style.opacity = '0.8'
      })
      span.addEventListener('mouseleave', () => {
        span.style.opacity = '1'
      })

      // Add click handler to show toolbar when clicking highlighted text
      span.addEventListener('click', (e) => {
        e.stopPropagation()
        handleHighlightClick(highlight, e)
      })

      try {
        range.surroundContents(span)
      } catch (e) {
        // If surroundContents fails (e.g., range spans multiple elements), use extractContents
        const contents = range.extractContents()
        span.appendChild(contents)
        range.insertNode(span)
      }
    } catch (error) {
      console.error('Error applying highlight:', error)
    }
  }

  const removeHighlight = () => {
    if (currentHighlightId) {
      // Remove from state
      setHighlights(prev => {
        const updated = { ...prev }
        delete updated[currentHighlightId]
        return updated
      })

      // Remove from DOM
      const highlightElement = document.querySelector(`[data-highlight-id="${currentHighlightId}"]`)
      if (highlightElement) {
        const parent = highlightElement.parentNode
        const textContent = highlightElement.textContent
        const textNode = document.createTextNode(textContent)
        parent.replaceChild(textNode, highlightElement)
        parent.normalize()
      }

      // Clear selection and toolbar
      window.getSelection().removeAllRanges()
      setShowToolbar(false)
      setSelectedText("")
      setSelectedRange(null)
      setIsHighlightedText(false)
      setCurrentHighlightId(null)
    }
  }

  const handleHighlightClick = (highlight, event) => {
    // Find the highlight element
    const highlightElement = document.querySelector(`[data-highlight-id="${highlight.id}"]`)
    if (highlightElement) {
      // Create a selection for the highlighted text
      const range = document.createRange()
      range.selectNodeContents(highlightElement)

      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)

      // Set up the selection state
      setSelectedText(highlight.text)
      setSelectedRange({
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
        text: highlight.text,
      })
      setIsHighlightedText(true)
      setCurrentHighlightId(highlight.id)

      // Position toolbar at click location
      const rect = highlightElement.getBoundingClientRect()
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 60,
      })

      setShowToolbar(true)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    } else {
      router.push("/interactive")
    }
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Reapply highlights when page content changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      Object.values(highlights).forEach(highlight => {
        if (highlight.page === currentPage) {
          // Find the paragraph and reapply highlight
          const paragraphs = contentRef.current?.querySelectorAll('p')
          if (paragraphs && highlight.paragraphIndex !== null && paragraphs[highlight.paragraphIndex]) {
            const paragraph = paragraphs[highlight.paragraphIndex]
            const textContent = paragraph.textContent || paragraph.innerText

            if (textContent.includes(highlight.text)) {
              const startIndex = textContent.indexOf(highlight.text)
              const endIndex = startIndex + highlight.text.length

              // Create a range for the text in this paragraph
              const walker = document.createTreeWalker(
                paragraph,
                NodeFilter.SHOW_TEXT,
                null,
                false
              )

              let currentIndex = 0
              let startNode = null
              let startOffset = 0
              let endNode = null
              let endOffset = 0

              while (walker.nextNode()) {
                const textNode = walker.currentNode
                const textLength = textNode.textContent.length

                if (startNode === null && currentIndex + textLength > startIndex) {
                  startNode = textNode
                  startOffset = startIndex - currentIndex
                }

                if (currentIndex + textLength >= endIndex) {
                  endNode = textNode
                  endOffset = endIndex - currentIndex
                  break
                }

                currentIndex += textLength
              }

              if (startNode && endNode) {
                try {
                  const range = document.createRange()
                  range.setStart(startNode, startOffset)
                  range.setEnd(endNode, endOffset)

                  // Check if this text is already highlighted
                  const existingHighlight = document.querySelector(`[data-highlight-id="${highlight.id}"]`)
                  if (!existingHighlight) {
                    const span = document.createElement('span')
                    span.className = `${highlight.className} highlight-span`
                    span.setAttribute('data-highlight-id', highlight.id)
                    span.style.borderRadius = '2px'
                    span.style.padding = '1px 2px'
                    span.style.cursor = 'pointer'
                    span.style.transition = 'opacity 0.2s ease'

                    // Add hover effect
                    span.addEventListener('mouseenter', () => {
                      span.style.opacity = '0.8'
                    })
                    span.addEventListener('mouseleave', () => {
                      span.style.opacity = '1'
                    })

                    // Add click handler to show toolbar when clicking highlighted text
                    span.addEventListener('click', (e) => {
                      e.stopPropagation()
                      handleHighlightClick(highlight, e)
                    })

                    try {
                      range.surroundContents(span)
                    } catch (e) {
                      const contents = range.extractContents()
                      span.appendChild(contents)
                      range.insertNode(span)
                    }
                  }
                } catch (error) {
                  console.error('Error reapplying highlight:', error)
                }
              }
            }
          }
        }
      })
    }, 100) // Small delay to ensure DOM is ready

    return () => clearTimeout(timeoutId)
  }, [currentPage, currentContent, highlights])



  // Handle clicks outside the toolbar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        const toolbar = event.target.closest('.fixed.z-50')
        if (!toolbar) {
          setShowToolbar(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push("/interactive")}
          className="flex items-center gap-2 text-black hover:text-gray-600 mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">Back</span>
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-6">IFRC Annual Report 2024</h1>
        </div>

        <div className="mb-8">
          {section && (
            <>
              <span className="text-black font-medium">{section.title}</span>
              <span className="text-black mx-2">&gt;</span>
              <span className="text-black font-medium">{section.subtitle}</span>
            </>
          )}
          <span className="text-gray-500 ml-4">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div style={{ position: 'relative', width: '100%', height: '850px' }} onMouseUp={handleTextSelection} >
          <iframe
            ref={iframeRef}
            src={"../../../WDR25-CHAPTER-02/index.html"}
            style={{
              width: '100%',
              height: '100%',
              border: 'border:2px solid navy',
              backgroundColor: 'white'
            }}
            title="InDesign HTML5 Content"

          />
        </div>

        {showToolbar && (
          <div className="fixed z-50" style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: "translateX(-50%)",
          }}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2">
              {isHighlightedText ? (
                // Show remove highlight button for highlighted text
                <button
                  onClick={removeHighlight}
                  className="w-8 h-8 rounded-full border-2 border-red-300 hover:border-red-500 bg-white hover:bg-red-50 transition-colors flex items-center justify-center"
                  title="Remove highlight"
                >
                  <span className="text-red-500 text-sm font-bold">×</span>
                </button>
              ) : (
                // Show all highlight color buttons for normal text
                <>
                  {highlightColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => handleHighlight(color)}
                      className={`w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors ${color.class}`}
                      title={`Highlight in ${color.name}`}
                      style={{ backgroundColor: color.color }}
                    />
                  ))}
                </>
              )}

              <button
                onClick={handleCopy}
                className="p-2 hover:bg-gray-100 rounded"
                title="Copy text"
              >
                <Copy className="w-4 h-4 text-gray-700" />
              </button>

              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded"
                title="Share text"
              >
                <Share2 className="w-4 h-4 text-gray-700" />
              </button>
              <FacebookShareButton
                url={'https://solferinoacademy.com/'}
                quote={selectedText}
                hashtag="#wdr2024 #solferinoacademy"
              >
                <FacebookIcon size={15} round />
             </FacebookShareButton>
              <TwitterShareButton
                url={'https://solferinoacademy.com/'}
                title={selectedText}
              >
                <TwitterIcon size={15} round />
              </TwitterShareButton>
              <WhatsappShareButton
                url={'https://solferinoacademy.com/'}
                title={selectedText}
                separator="-"
              >
                <WhatsappIcon size={15} round />
              </WhatsappShareButton>
            </div>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-gray-800 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="text-lg font-semibold mr-4">{progress}%</span>

          <div className="flex gap-3">
            {currentPage > 1 && (
              <button
                onClick={handlePrevious}
                className="border-gray-800 text-gray-800 hover:bg-gray-100 px-8 py-3 rounded bg-transparent"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded"
            >
              {currentPage < totalPages ? "Next" : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}