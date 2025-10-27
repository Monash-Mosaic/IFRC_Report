"use client"

import { ArrowLeft, Copy, Share2 } from "lucide-react"
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
import NotesComponent from '../../../components/NotesComponent'

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
  const contentRef = useRef(null)

  const section = sectionContent[slug]
  const totalParagraphs = section ? section.content.length : 0
  const totalPages = Math.ceil(totalParagraphs / paragraphsPerPage)
  const startIndex = (currentPage - 1) * paragraphsPerPage
  const endIndex = startIndex + paragraphsPerPage
  const currentContent = section ? section.content.slice(startIndex, endIndex) : []
  const progress = Math.round((currentPage / totalPages) * 100)

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setSelectedText(selection.toString())
      setToolbarPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 60,
      })
      setShowToolbar(true)
    } else {
      setShowToolbar(false)
      setSelectedText("")
    }
  }

  const handleCopy = async () => {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText)
        setShowToolbar(false)
        setSelectedText("")
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
      } catch (err) {
        console.error("Failed to share text:", err)
      }
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

  // Hide toolbar when clicking outside content area
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only hide toolbar if clicking outside the content area and not on the toolbar itself
      if (contentRef.current && !contentRef.current.contains(event.target)) {
        const toolbar = document.querySelector('[data-toolbar="selection"]')
        if (!toolbar || !toolbar.contains(event.target)) {
          setShowToolbar(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!section) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Section not found</h1>
          <button
            onClick={() => router.push("/interactive")}
            className="bg-gray-800 text-white px-6 py-3 rounded hover:bg-gray-700"
          >
            Back to Interactive Report
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
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
          <span className="text-black font-medium">{section.title}</span>
          <span className="text-black mx-2">&gt;</span>
          <span className="text-black font-medium">{section.subtitle}</span>
          <span className="text-gray-500 ml-4">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="mb-12" ref={contentRef}>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-black leading-relaxed"
            onMouseUp={handleTextSelection}
          >
            {currentContent.map((paragraph, index) => (
              <p key={startIndex + index} className="text-justify select-text cursor-text">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Selection Toolbar */}
        {showToolbar && (
          <div
            data-toolbar="selection"
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex items-center gap-2"
            style={{
              left: `${toolbarPosition.x}px`,
              top: `${toolbarPosition.y}px`,
              transform: "translateX(-50%)",
            }}
          >
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
        )}

        {/* Progress and Navigation */}
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

      {/* Notes Component */}
      <NotesComponent sectionSlug={slug} currentPage={currentPage} />
    </div>
  )
}