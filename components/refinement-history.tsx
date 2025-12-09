"use client"

import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface RefinementHistoryProps {
  originalPrompt: string
  refinedPrompt: string
  onUndo: () => void
  className?: string
}

export function RefinementHistory({ originalPrompt, refinedPrompt, onUndo, className = "" }: RefinementHistoryProps) {
  return (
    <div className={`bg-amber-50 border border-amber-300 rounded-lg p-4 flex items-start gap-3 ${className}`}>
      {/* Icon */}
      <div className="flex-shrink-0 text-2xl mt-0.5">🔍</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-amber-900 mb-1">Search refined from:</div>
        <div className="text-sm text-amber-950 space-y-1">
          <div className="line-through opacity-60">&quot;{originalPrompt}&quot;</div>
          <div className="flex items-start gap-1.5">
            <span className="flex-shrink-0 mt-0.5">📌</span>
            <span>
              <span className="font-medium">Now showing:</span>{" "}
              <span className="font-semibold">&quot;{refinedPrompt}&quot;</span>
            </span>
          </div>
        </div>
      </div>

      {/* Undo Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        className="flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium"
      >
        <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
        Undo
      </Button>
    </div>
  )
}
