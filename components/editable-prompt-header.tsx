"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Search, X } from "lucide-react"

interface EditablePromptHeaderProps {
  prompt: string
  onUpdate: (newPrompt: string) => void
  isEditing?: boolean
  className?: string
}

export function EditablePromptHeader({
  prompt,
  onUpdate,
  isEditing: initialEditing = false,
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
      <div className={`bg-gray-100 rounded-2xl p-4 border border-blue-400 ${className}`}>
        <div className="mb-3">
          <Textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Describe what the client needs..."
            className="w-full min-h-[80px] text-base bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            autoFocus
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 Press Cmd/Ctrl+Enter to search, Esc to cancel
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={handleCancel} className="gap-1">
            <X className="w-3.5 h-3.5" />
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            size="sm"
            disabled={!editedPrompt.trim() || editedPrompt === prompt}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            Update Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-100 rounded-2xl p-4 border border-gray-300 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-medium text-gray-900 flex-1">{prompt}</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartEdit}
          className="flex-shrink-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200 gap-1.5"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </Button>
      </div>
    </div>
  )
}
