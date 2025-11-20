"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Search, X, Sparkles } from "lucide-react"

interface EditablePromptHeaderProps {
  prompt: string
  onUpdate: (newPrompt: string) => void
  isEditing?: boolean
  filters?: React.ReactNode
  className?: string
}

export function EditablePromptHeader({
  prompt,
  onUpdate,
  isEditing: initialEditing = false,
  filters,
  className = "",
}: EditablePromptHeaderProps) {
  const [isEditing, setIsEditing] = useState(initialEditing)
  const [editedPrompt, setEditedPrompt] = useState(prompt)

  const handleStartEdit = () => {
    setEditedPrompt(prompt)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setEditedPrompt(prompt)
    setIsEditing(false)
  }

  const handleUpdate = () => {
    if (editedPrompt.trim() && editedPrompt !== prompt) {
      onUpdate(editedPrompt.trim())
    }
    setIsEditing(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleUpdate()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-400 shadow-lg ${className}`}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2 text-blue-900">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Refine your search to get better results</span>
          </div>
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Add more details about what the client needs..."
            className="w-full min-h-[100px] text-base bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            autoFocus
          />
          <div className="mt-2 text-xs text-blue-700">
            💡 Add details like: age, family size, income level, location, urgency, specific needs
          </div>
        </div>

        {/* Show filters in edit mode too */}
        {filters && (
          <div className="mb-4 pb-4 border-b border-blue-300">
            {filters}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">⌘</kbd>+
            <kbd className="px-1.5 py-0.5 bg-gray-200 rounded">Enter</kbd> to search
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
              <X className="w-3.5 h-3.5" />
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              size="sm"
              disabled={!editedPrompt.trim() || editedPrompt === prompt}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1.5"
            >
              <Search className="w-4 h-4" />
              Get Better Results
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 rounded-2xl p-4 border border-gray-300 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex-1">{prompt}</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartEdit}
          className="flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300 gap-1.5 font-medium"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Refine Search
        </Button>
      </div>

      {/* Filters section */}
      {filters && (
        <div className="pt-3 border-t border-gray-300">
          {filters}
        </div>
      )}
    </div>
  )
}
