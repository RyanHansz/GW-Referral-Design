"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp } from "lucide-react"
import {
  getSuggestionsForSearch,
  buildRefinedPrompt,
  trackRefinementUsage,
  shouldCollapseByDefault,
  type RefinementSuggestion,
} from "@/lib/prompt-refinement"

interface RefinePromptPanelProps {
  originalPrompt: string
  onRefine: (refinedPrompt: string) => void
  className?: string
}

export function RefinePromptPanel({ originalPrompt, onRefine, className = "" }: RefinePromptPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [manualInput, setManualInput] = useState("")
  const [suggestions, setSuggestions] = useState<RefinementSuggestion[]>([])

  // Initialize suggestions and expansion state
  useEffect(() => {
    const refinementSuggestions = getSuggestionsForSearch(originalPrompt)
    setSuggestions(refinementSuggestions)

    // Set initial expansion state based on user preference
    const shouldCollapse = shouldCollapseByDefault()
    setExpanded(!shouldCollapse)
  }, [originalPrompt])

  const handleChipClick = (chipId: string) => {
    setSelectedChips((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    )
  }

  const handleRefine = () => {
    const selectedSuggestions = suggestions.filter((s) => selectedChips.includes(s.id))
    const refinedPrompt = buildRefinedPrompt(originalPrompt, manualInput, selectedSuggestions)

    // Track usage for analytics
    trackRefinementUsage(selectedChips)

    // Call parent handler
    onRefine(refinedPrompt)

    // Reset state
    setSelectedChips([])
    setManualInput("")
  }

  const handleClear = () => {
    setSelectedChips([])
    setManualInput("")
  }

  const hasSelections = selectedChips.length > 0 || manualInput.trim().length > 0

  // Collapsed state
  if (!expanded) {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-300 rounded-lg p-3 flex items-center justify-between ${className}`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="text-sm font-medium text-gray-700">Get more specific results?</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(true)}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
        >
          Show suggestions
          <ChevronDown className="ml-1 w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Expanded state
  return (
    <div className={`bg-white border-2 border-blue-400 rounded-xl p-5 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="text-lg font-semibold text-gray-900">Get Better Results</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Collapse
          <ChevronUp className="ml-1 w-4 h-4" />
        </Button>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">Add details to narrow your search:</p>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2.5 mb-5">
        {suggestions.map((suggestion) => {
          const isSelected = selectedChips.includes(suggestion.id)
          return (
            <button
              key={suggestion.id}
              onClick={() => handleChipClick(suggestion.id)}
              role="checkbox"
              aria-checked={isSelected}
              aria-label={`Add refinement: ${suggestion.label}`}
              className={`
                inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium
                transition-all duration-150 ease-in-out
                ${
                  isSelected
                    ? "bg-blue-600 border-2 border-blue-700 text-white font-semibold shadow-md"
                    : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-md"
                }
              `}
            >
              <span className="text-base leading-none">{suggestion.icon}</span>
              <span>{suggestion.label}</span>
            </button>
          )
        })}
      </div>

      {/* Manual Input */}
      <div className="mb-4">
        <label htmlFor="manual-refinement" className="block text-sm font-medium text-gray-700 mb-2">
          Or describe the client&apos;s situation:
        </label>
        <Input
          id="manual-refinement"
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && hasSelections && handleRefine()}
          placeholder="e.g., single mother with 2 kids under 5"
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 justify-end">
        <Button variant="outline" onClick={handleClear} className="border-gray-300 hover:bg-gray-50">
          Clear
        </Button>
        <Button
          onClick={handleRefine}
          disabled={!hasSelections}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Refine Search
        </Button>
      </div>
    </div>
  )
}
