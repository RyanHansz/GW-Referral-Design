"use client"

import * as HoverCard from "@radix-ui/react-hover-card"
import { ExternalLink } from "lucide-react"

export interface Citation {
  number: string
  title: string
  url: string
  description?: string
  quote?: string
}

interface InlineCitationProps {
  citation: Citation
}

export function InlineCitation({ citation }: InlineCitationProps) {
  // Extract domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace("www.", "")
    } catch {
      return url
    }
  }

  return (
    <HoverCard.Root openDelay={300}>
      <HoverCard.Trigger asChild>
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 no-underline whitespace-nowrap align-baseline"
          style={{ fontSize: "0.7em", marginLeft: "0.15em" }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-medium">{getDomain(citation.url)}</span>
          <span className="font-medium">+{citation.number}</span>
        </a>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className="w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg z-50"
          sideOffset={5}
        >
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight">{citation.title}</h4>
              <a
                href={citation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            {citation.quote && (
              <blockquote className="text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 py-1">
                {citation.quote}
              </blockquote>
            )}
            {citation.description && <p className="text-sm text-gray-600">{citation.description}</p>}
            <div className="text-xs text-gray-500 truncate">{citation.url}</div>
          </div>
          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}

// Helper function to parse content with inline citations
export function parseContentWithCitations(content: string, citations: Citation[]) {
  // Create a map of citation numbers to citation objects
  const citationMap = new Map(citations.map((c) => [c.number, c]))

  // Split content by citation markers [1], [2], etc.
  const parts: Array<{ type: "text" | "citation"; content: string; citation?: Citation }> = []
  const citationRegex = /\[(\d+)\]/g
  let lastIndex = 0
  let match

  while ((match = citationRegex.exec(content)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: content.substring(lastIndex, match.index),
      })
    }

    // Add citation
    const citationNumber = match[1]
    const citation = citationMap.get(citationNumber)
    if (citation) {
      parts.push({
        type: "citation",
        content: match[0],
        citation,
      })
    } else {
      // If citation not found, treat as regular text
      parts.push({
        type: "text",
        content: match[0],
      })
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: "text",
      content: content.substring(lastIndex),
    })
  }

  return parts
}
