/**
 * Prompt Refinement Utilities
 *
 * Simple heuristic-based detection and suggestion system for refining user search prompts
 */

export interface RefinementSuggestion {
  id: string
  icon: string
  label: string
  value: string
  category: string[]
}

/**
 * All available refinement suggestions
 */
export const REFINEMENT_SUGGESTIONS: RefinementSuggestion[] = [
  // Universal (shown for all searches)
  {
    id: 'low-income',
    icon: '💰',
    label: 'Low income',
    value: 'for low-income individual or family',
    category: ['*']
  },
  {
    id: 'family',
    icon: '👨‍👩‍👧‍👦',
    label: 'Family with kids',
    value: 'for family with children',
    category: ['*']
  },
  {
    id: 'emergency',
    icon: '⚡',
    label: 'Emergency',
    value: 'with emergency or immediate need',
    category: ['*']
  },

  // Food-specific
  {
    id: 'snap',
    icon: '🍽️',
    label: 'SNAP eligible',
    value: 'eligible for SNAP/food stamps',
    category: ['food', 'nutrition']
  },
  {
    id: 'senior-meals',
    icon: '🧓',
    label: 'Senior (60+)',
    value: 'for senior citizen age 60 or older',
    category: ['food', 'nutrition', 'healthcare']
  },
  {
    id: 'no-transport',
    icon: '🚗',
    label: 'No transport',
    value: 'with no transportation',
    category: ['food', 'nutrition', 'healthcare']
  },

  // Housing-specific
  {
    id: 'homeless',
    icon: '🏠',
    label: 'Homeless',
    value: 'experiencing homelessness',
    category: ['housing', 'shelter']
  },
  {
    id: 'eviction',
    icon: '⚠️',
    label: 'Eviction risk',
    value: 'at risk of eviction',
    category: ['housing']
  },
  {
    id: 'veteran',
    icon: '🎖️',
    label: 'Veteran',
    value: 'who is a military veteran',
    category: ['housing', 'healthcare', 'employment']
  },

  // Employment-specific
  {
    id: 'no-hs',
    icon: '🎓',
    label: 'No diploma',
    value: 'without high school diploma or GED',
    category: ['employment', 'job', 'training', 'work']
  },
  {
    id: 'limited-english',
    icon: '🌍',
    label: 'Limited English',
    value: 'with limited English proficiency',
    category: ['employment', 'job', 'training', 'education', 'work']
  },
  {
    id: 'criminal-record',
    icon: '📋',
    label: 'Criminal record',
    value: 'with criminal background or returning citizen',
    category: ['employment', 'job', 'work']
  },

  // Healthcare-specific
  {
    id: 'uninsured',
    icon: '🏥',
    label: 'No insurance',
    value: 'who is uninsured or has no health insurance',
    category: ['healthcare', 'health', 'medical']
  },
  {
    id: 'mental-health',
    icon: '🧠',
    label: 'Mental health',
    value: 'with mental health needs',
    category: ['healthcare', 'health']
  },
  {
    id: 'disability',
    icon: '♿',
    label: 'Disability',
    value: 'with disability or special needs',
    category: ['healthcare', 'health', 'housing', 'employment']
  },

  // Education-specific
  {
    id: 'ged',
    icon: '📚',
    label: 'Need GED',
    value: 'seeking GED or high school equivalency',
    category: ['education', 'training']
  },

  // Transportation-specific
  {
    id: 'rural',
    icon: '🌾',
    label: 'Rural area',
    value: 'living in rural area',
    category: ['transportation', 'food', 'healthcare']
  },

  // Age-specific
  {
    id: 'youth',
    icon: '👦',
    label: 'Youth (under 18)',
    value: 'for youth under 18',
    category: ['education', 'food', 'healthcare']
  },
]

/**
 * Detect if a prompt is vague/general using simple heuristics
 */
export function isPromptVague(prompt: string): boolean {
  if (!prompt || typeof prompt !== 'string') return false

  const trimmed = prompt.trim()
  const words = trimmed.split(/\s+/)
  const wordCount = words.length

  // Very short prompts are likely vague
  if (wordCount <= 2) return true

  // Short prompts without context indicators are vague
  if (wordCount <= 4) {
    const contextIndicators = [
      'family', 'income', 'emergency', 'homeless', 'children', 'senior',
      'veteran', 'disability', 'uninsured', 'criminal', 'immigrant',
      'single', 'mother', 'father', 'parent', 'student', 'college',
      'pregnant', 'elderly', 'youth', 'teen', 'low-income', 'disabled'
    ]

    const lowerPrompt = trimmed.toLowerCase()
    const hasContext = contextIndicators.some(indicator =>
      lowerPrompt.includes(indicator)
    )

    if (!hasContext) return true
  }

  // Check if prompt is just a single word category
  const singleWordCategories = [
    'food', 'housing', 'job', 'jobs', 'work', 'health', 'healthcare',
    'shelter', 'rent', 'employment', 'training', 'education', 'transportation',
    'clothes', 'clothing', 'medical', 'dental', 'mental', 'counseling'
  ]

  if (wordCount === 1 && singleWordCategories.includes(trimmed.toLowerCase())) {
    return true
  }

  // Check if prompt is just location-based
  const locationOnlyPattern = /^(food|housing|job|jobs|health|healthcare|shelter)\s+(in\s+)?[a-z\s]+$/i
  if (locationOnlyPattern.test(trimmed) && wordCount <= 4) {
    return true
  }

  return false
}

/**
 * Detect the category of a search prompt
 */
export function detectSearchCategory(prompt: string): string[] {
  const lowerPrompt = prompt.toLowerCase()
  const categories: string[] = []

  const categoryPatterns: Record<string, RegExp> = {
    food: /\b(food|meal|pantry|hunger|eat|nutrition|snap|grocery|groceries|feed|feeding)\b/i,
    housing: /\b(housing|shelter|homeless|apartment|rent|eviction|home|housing|lease)\b/i,
    employment: /\b(job|jobs|work|employment|career|resume|interview|hiring|position|opportunity)\b/i,
    training: /\b(training|class|classes|course|learn|skill|certification|certificate)\b/i,
    healthcare: /\b(health|medical|doctor|clinic|hospital|medicine|insurance|mental|dental|therapy)\b/i,
    education: /\b(education|school|ged|diploma|college|university|tutor|literacy)\b/i,
    transportation: /\b(transportation|transport|bus|ride|travel|commute|transit)\b/i,
  }

  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(lowerPrompt)) {
      categories.push(category)
    }
  }

  // Always include universal category
  categories.push('*')

  return categories
}

/**
 * Get relevant refinement suggestions based on search prompt
 */
export function getSuggestionsForSearch(prompt: string, maxSuggestions = 8): RefinementSuggestion[] {
  const categories = detectSearchCategory(prompt)

  // Filter suggestions by matching categories
  const filtered = REFINEMENT_SUGGESTIONS.filter(suggestion =>
    suggestion.category.includes('*') ||
    suggestion.category.some(cat => categories.includes(cat))
  )

  // Prioritize universal suggestions, then category-specific
  const universal = filtered.filter(s => s.category.includes('*'))
  const specific = filtered.filter(s => !s.category.includes('*'))

  // Return mix of universal and specific suggestions
  return [...universal, ...specific].slice(0, maxSuggestions)
}

/**
 * Build a refined prompt from original prompt, manual input, and selected chips
 *
 * Logic:
 * - If manual input provided: Use manual input + chips (REPLACE original)
 * - If only chips selected: Use original + chips (ENHANCE original)
 */
export function buildRefinedPrompt(
  originalPrompt: string,
  manualInput: string,
  selectedSuggestions: RefinementSuggestion[]
): string {
  const suggestionText = selectedSuggestions
    .map(s => s.value)
    .join(', ')

  // If user provided manual input, use that as the base (replaces original)
  if (manualInput.trim()) {
    const parts: string[] = [manualInput.trim()]
    if (suggestionText) {
      parts.push(suggestionText)
    }
    return parts.join(' ')
  }

  // If only chips selected, enhance the original prompt
  if (suggestionText) {
    return `${originalPrompt.trim()} ${suggestionText}`
  }

  // Fallback to original (shouldn't happen, but just in case)
  return originalPrompt.trim()
}

/**
 * Get frequently used refinements from localStorage
 */
export function getFrequentRefinements(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const history = JSON.parse(localStorage.getItem('refinement-history') || '[]')
    const frequency: Record<string, number> = {}

    history.forEach((chipId: string) => {
      frequency[chipId] = (frequency[chipId] || 0) + 1
    })

    // Return top 3 most frequent
    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([id]) => id)
  } catch {
    return []
  }
}

/**
 * Track refinement usage in localStorage
 */
export function trackRefinementUsage(chipIds: string[]): void {
  if (typeof window === 'undefined') return

  try {
    const history = JSON.parse(localStorage.getItem('refinement-history') || '[]')
    const updated = [...history, ...chipIds]

    // Keep last 100 refinements
    const trimmed = updated.slice(-100)

    localStorage.setItem('refinement-history', JSON.stringify(trimmed))

    // Increment usage count
    const usageCount = parseInt(localStorage.getItem('refinement-usage-count') || '0')
    localStorage.setItem('refinement-usage-count', String(usageCount + 1))
  } catch {
    // Fail silently if localStorage unavailable
  }
}

/**
 * Check if user prefers collapsed refinement panel
 */
export function shouldCollapseByDefault(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const preference = localStorage.getItem('refinement-panel-preference')
    if (preference === 'collapsed') return true

    // Auto-collapse after 2 uses
    const usageCount = parseInt(localStorage.getItem('refinement-usage-count') || '0')
    if (usageCount >= 2) {
      localStorage.setItem('refinement-panel-preference', 'collapsed')
      return true
    }

    return false
  } catch {
    return false
  }
}
