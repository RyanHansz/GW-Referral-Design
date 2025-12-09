"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Search, ChevronDown, ChevronUp } from "lucide-react"
import {
  getSuggestionsForSearch,
  type RefinementSuggestion,
} from "@/lib/prompt-refinement"

interface InlinePromptRefinerProps {
  initialPrompt: string
  onSearch: (refinedPrompt: string) => void
  showSuggestions?: boolean
  className?: string
}

export function InlinePromptRefiner({
  initialPrompt,
  onSearch,
  showSuggestions = true,
  className = "",
}: InlinePromptRefinerProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [suggestions, setSuggestions] = useState<RefinementSuggestion[]>([])
  const [showChips, setShowChips] = useState(true)
  const [addedChips, setAddedChips] = useState<Set<string>>(new Set())

  // Update suggestions when prompt changes
  useEffect(() => {
    if (showSuggestions) {
      const refinementSuggestions = getSuggestionsForSearch(prompt)
      setSuggestions(refinementSuggestions)
    }
  }, [prompt, showSuggestions])

  // Update prompt when initial prompt changes
  useEffect(() => {
    setPrompt(initialPrompt)
    setAddedChips(new Set())
  }, [initialPrompt])

  const handleChipClick = (suggestion: RefinementSuggestion) => {
    const chipText = suggestion.value
    const isAdded = addedChips.has(suggestion.id)

    if (isAdded) {
      // Remove chip text from prompt
      // Try to remove the exact value, or a comma-separated version
      let newPrompt = prompt

      // Try removing with comma before
      if (newPrompt.includes(`, ${chipText}`)) {
        newPrompt = newPrompt.replace(`, ${chipText}`, "")
      }
      // Try removing with comma after
      else if (newPrompt.includes(`${chipText}, `)) {
        newPrompt = newPrompt.replace(`${chipText}, `, "")
      }
      // Try removing standalone
      else if (newPrompt.includes(chipText)) {
        newPrompt = newPrompt.replace(chipText, "")
      }

      // Clean up any double spaces or trailing commas
      newPrompt = newPrompt.replace(/\s+/g, " ").replace(/,\s*,/g, ",").trim()

      setPrompt(newPrompt)
      setAddedChips((prev) => {
        const next = new Set(prev)
        next.delete(suggestion.id)
        return next
      })
    } else {
      // Add chip text to prompt
      const currentPrompt = prompt.trim()
      const newPrompt = currentPrompt ? `${currentPrompt}, ${chipText}` : chipText
      setPrompt(newPrompt)
      setAddedChips((prev) => new Set(prev).add(suggestion.id))
    }
  }

  const handleSearch = () => {
    if (prompt.trim()) {
      onSearch(prompt.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSearch()
    }
  }

  return (
    <div className={`bg-gray-100 rounded-2xl p-4 border border-gray-300 ${className}`}>
      {/* Editable Prompt */}
      <div className="mb-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe what the client needs..."
          className="w-full min-h-[80px] text-base bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
        />
        <div className="mt-2 text-xs text-gray-500">
          💡 Tip: Edit the text directly or click chips below to add/remove details
        </div>
      </div>

      {/* Suggestion Chips */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowChips(!showChips)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
          >
            <span>Quick add details:</span>
            {showChips ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showChips && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => {
                const isAdded = addedChips.has(suggestion.id)
                return (
                  <button
                    key={suggestion.id}
                    onClick={() => handleChipClick(suggestion)}
                    className={`
                      inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
                      transition-all duration-150 ease-in-out
                      ${
                        isAdded
                          ? "bg-blue-600 border-2 border-blue-700 text-white shadow-md"
                          : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                      }
                    `}
                  >
                    <span className="text-base leading-none">{suggestion.icon}</span>
                    <span>{suggestion.label}</span>
                    {isAdded && <span className="text-xs">✓</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Search Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSearch}
          disabled={!prompt.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4 mr-2" />
          Update Search
        </Button>
      </div>
    </div>
  )
}
