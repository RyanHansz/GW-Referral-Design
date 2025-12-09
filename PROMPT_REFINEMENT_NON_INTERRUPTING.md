# Prompt Refinement Feature - Non-Interrupting Design

## Design Philosophy

**Don't interrupt the user - enhance after they see results.**

Users enter a query → Get results immediately → See refinement suggestions alongside results → Choose to refine if desired

This approach:
✅ Respects user intent (they wanted to search, so search)
✅ Shows context (users can see what they got before deciding to refine)
✅ Non-intrusive (refinement is optional and visible but not blocking)
✅ Educational (users learn what better prompts look like)
✅ Fast (no extra modal or step before results)

---

## User Experience Flow

### Scenario: User searches "food Austin"

#### Step 1: User Submits Search
```
User types: "food Austin"
Clicks: "Find Resources"
→ Immediately shows loading state
→ No modal, no interruption
```

#### Step 2: Results Display with Refinement Panel

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Return to Search    Your search: "food Austin"    🖨 Print  ✉ Email │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 💡 Get Better Results                                           [Refine] │
├─────────────────────────────────────────────────────────────────────────┤
│ Your search is pretty general. Add details to find more specific        │
│ resources:                                                               │
│                                                                          │
│ [💰 Low income]  [👨‍👩‍👧‍👦 Family with kids]  [🏠 Homeless]  [⚡ Emergency]  │
│ [🚗 No transport]  [🧓 Senior (60+)]  [+ More options]                  │
│                                                                          │
│ Or type your own: _______________________________________ [Refine Search]│
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 📋 Showing 10 resources                                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  [Resource cards displayed below...]                                    │
│                                                                          │
│  1. Central Texas Food Bank                                             │
│     Emergency food assistance and SNAP enrollment...                    │
│                                                                          │
│  2. Austin Meals on Wheels                                              │
│     Home-delivered meals for seniors and people with disabilities...    │
│                                                                          │
│  [... more resources ...]                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Step 3: User Refines (Optional)

**Option A: Click suggestion chip**
```
User clicks: [💰 Low income] [👨‍👩‍👧‍👦 Family with kids]
→ Selected chips highlight
→ New search automatically triggers
→ Results update with refined prompt: "food Austin for low-income family with children"
```

**Option B: Type manual refinement**
```
User types: "single mother with 2 kids under 5"
Clicks: [Refine Search]
→ New search with: "food Austin single mother with 2 kids under 5"
→ Results update
```

#### Step 4: Refinement History Shown
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search refined from: "food Austin"                                   │
│ 📌 Now showing: "food Austin for low-income family with children"       │
│    [Undo refinement]                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Visual Design Specifications

### Refinement Panel (Collapsed State)

**Default appearance when results load:**

```
┌─────────────────────────────────────────────────────┐
│ 💡 Get more specific results?  [Show suggestions] │
└─────────────────────────────────────────────────────┘
```

**Specs:**
```css
Background: linear-gradient(to right, #EFF6FF, #DBEAFE)
Border: 1px solid #3B82F6
Border radius: 8px
Padding: 12px 16px
Display: flex
Align items: center
Justify content: space-between
Margin bottom: 24px
```

### Refinement Panel (Expanded State)

**When user clicks "Show suggestions":**

```css
Background: white
Border: 2px solid #3B82F6
Border radius: 12px
Padding: 20px
Box shadow: 0 4px 6px rgba(59, 130, 246, 0.1)
Margin bottom: 24px

Transition: all 300ms ease
```

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ 💡 Get Better Results                     [Collapse] │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Add details to narrow your search:                   │
│                                                       │
│ [Suggestion Chips Grid]                              │
│ (4-5 chips per row, wrapping)                        │
│                                                       │
│ Or describe the client's situation:                  │
│ [Text input field                              ]     │
│                                                       │
│ [Clear] [Refine Search]                              │
└──────────────────────────────────────────────────────┘
```

### Suggestion Chips

**Visual Design:**
```css
/* Default state */
chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 2px solid #CBD5E1;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

/* Hover state */
chip:hover {
  border-color: #3B82F6;
  background: #F0F9FF;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* Selected state */
chip.selected {
  background: #3B82F6;
  border-color: #2563EB;
  color: white;
  font-weight: 600;
}

/* Icon within chip */
chip .icon {
  font-size: 16px;
  line-height: 1;
}
```

### Grid Layout
```css
suggestion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
}
```

### Manual Input Field

```css
input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 16px;
  transition: border-color 150ms ease;
}

input:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

input::placeholder {
  color: #9CA3AF;
}
```

### Action Buttons

```css
/* Refine Search button */
.refine-button {
  background: #3B82F6;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  border: none;
  transition: all 150ms ease;
}

.refine-button:hover {
  background: #2563EB;
  box-shadow: 0 4px 6px rgba(37, 99, 235, 0.25);
}

/* Clear button */
.clear-button {
  background: transparent;
  color: #6B7280;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #E5E7EB;
  margin-right: 12px;
}

.clear-button:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}
```

### Refinement History Banner

**Shows after refinement is applied:**

```css
.refinement-banner {
  background: #FEF3C7;
  border: 1px solid #F59E0B;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: start;
  gap: 12px;
}

.refinement-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.refinement-content {
  flex: 1;
}

.refinement-title {
  font-size: 13px;
  color: #92400E;
  font-weight: 600;
  margin-bottom: 4px;
}

.refinement-text {
  font-size: 14px;
  color: #78350F;
  line-height: 1.4;
}

.undo-button {
  color: #3B82F6;
  text-decoration: underline;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0;
}
```

---

## Smart Suggestion Logic

### Context-Based Suggestions

**Detect search category and show relevant chips:**

```typescript
interface RefinementSuggestion {
  id: string
  icon: string
  label: string
  value: string
  category: string[]
}

const SUGGESTIONS: RefinementSuggestion[] = [
  // Universal (shown for all searches)
  { id: 'low-income', icon: '💰', label: 'Low income', value: 'for low-income individual/family', category: ['*'] },
  { id: 'family', icon: '👨‍👩‍👧‍👦', label: 'Family with kids', value: 'for family with children', category: ['*'] },
  { id: 'emergency', icon: '⚡', label: 'Emergency', value: 'for emergency/immediate need', category: ['*'] },

  // Food-specific
  { id: 'snap', icon: '🍽️', label: 'SNAP eligible', value: 'SNAP/food stamps eligible', category: ['food', 'nutrition'] },
  { id: 'senior-meals', icon: '🧓', label: 'Senior (60+)', value: 'for senior citizen age 60+', category: ['food', 'nutrition', 'healthcare'] },
  { id: 'no-transport', icon: '🚗', label: 'No transport', value: 'with no transportation', category: ['food', 'nutrition', 'healthcare'] },

  // Housing-specific
  { id: 'homeless', icon: '🏠', label: 'Homeless', value: 'experiencing homelessness', category: ['housing', 'shelter'] },
  { id: 'eviction', icon: '⚠️', label: 'Eviction risk', value: 'at risk of eviction', category: ['housing'] },
  { id: 'veteran', icon: '🎖️', label: 'Veteran', value: 'military veteran', category: ['housing', 'healthcare', 'employment'] },

  // Employment-specific
  { id: 'no-hs', icon: '🎓', label: 'No diploma', value: 'without high school diploma', category: ['employment', 'job', 'training'] },
  { id: 'limited-english', icon: '🌍', label: 'Limited English', value: 'with limited English proficiency', category: ['employment', 'job', 'training', 'education'] },
  { id: 'criminal-record', icon: '📋', label: 'Criminal record', value: 'with criminal background/returning citizen', category: ['employment', 'job'] },

  // Healthcare-specific
  { id: 'uninsured', icon: '🏥', label: 'No insurance', value: 'uninsured/no health insurance', category: ['healthcare', 'health', 'medical'] },
  { id: 'mental-health', icon: '🧠', label: 'Mental health', value: 'with mental health needs', category: ['healthcare', 'health'] },
  { id: 'disability', icon: '♿', label: 'Disability', value: 'with disability', category: ['healthcare', 'health', 'housing', 'employment'] },
]

function getSuggestionsForSearch(query: string): RefinementSuggestion[] {
  const lowerQuery = query.toLowerCase()

  // Detect category
  const categories = {
    food: /\b(food|meal|pantry|hunger|eat|nutrition|snap|grocery)\b/i,
    housing: /\b(housing|shelter|homeless|apartment|rent|eviction|home)\b/i,
    employment: /\b(job|work|employment|career|resume|training)\b/i,
    healthcare: /\b(health|medical|doctor|clinic|hospital|medicine|insurance|mental)\b/i,
  }

  let matchedCategories: string[] = ['*'] // Always include universal

  for (const [category, regex] of Object.entries(categories)) {
    if (regex.test(lowerQuery)) {
      matchedCategories.push(category)
    }
  }

  // Filter suggestions by category
  const filtered = SUGGESTIONS.filter(s =>
    s.category.includes('*') ||
    s.category.some(c => matchedCategories.includes(c))
  )

  // Return top 8 suggestions
  return filtered.slice(0, 8)
}
```

---

## Component Architecture

### RefinePromptPanel Component

```typescript
interface RefinePromptPanelProps {
  originalPrompt: string
  onRefine: (refinedPrompt: string) => void
  isExpanded?: boolean
}

const RefinePromptPanel: React.FC<RefinePromptPanelProps> = ({
  originalPrompt,
  onRefine,
  isExpanded = false
}) => {
  const [expanded, setExpanded] = useState(isExpanded)
  const [selectedChips, setSelectedChips] = useState<string[]>([])
  const [manualInput, setManualInput] = useState('')

  const suggestions = getSuggestionsForSearch(originalPrompt)

  const handleChipClick = (chipId: string) => {
    setSelectedChips(prev =>
      prev.includes(chipId)
        ? prev.filter(id => id !== chipId)
        : [...prev, chipId]
    )
  }

  const handleRefine = () => {
    const selectedValues = suggestions
      .filter(s => selectedChips.includes(s.id))
      .map(s => s.value)
      .join(', ')

    const refinedPrompt = [
      originalPrompt,
      manualInput.trim(),
      selectedValues
    ].filter(Boolean).join(' ')

    onRefine(refinedPrompt)
  }

  const handleClear = () => {
    setSelectedChips([])
    setManualInput('')
  }

  if (!expanded) {
    return (
      <div className="refinement-collapsed">
        <span>💡 Get more specific results?</span>
        <Button onClick={() => setExpanded(true)}>
          Show suggestions
        </Button>
      </div>
    )
  }

  return (
    <div className="refinement-panel">
      <div className="refinement-header">
        <span>💡 Get Better Results</span>
        <Button variant="ghost" onClick={() => setExpanded(false)}>
          Collapse
        </Button>
      </div>

      <p className="refinement-description">
        Add details to narrow your search:
      </p>

      <div className="suggestion-grid">
        {suggestions.map(suggestion => (
          <button
            key={suggestion.id}
            className={`suggestion-chip ${selectedChips.includes(suggestion.id) ? 'selected' : ''}`}
            onClick={() => handleChipClick(suggestion.id)}
          >
            <span className="chip-icon">{suggestion.icon}</span>
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>

      <div className="manual-input-section">
        <label>Or describe the client's situation:</label>
        <input
          type="text"
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder="e.g., single mother with 2 kids under 5"
          onKeyPress={(e) => e.key === 'Enter' && handleRefine()}
        />
      </div>

      <div className="refinement-actions">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button
          onClick={handleRefine}
          disabled={selectedChips.length === 0 && !manualInput.trim()}
        >
          Refine Search
        </Button>
      </div>
    </div>
  )
}
```

### RefinementHistory Component

```typescript
interface RefinementHistoryProps {
  originalPrompt: string
  refinedPrompt: string
  onUndo: () => void
}

const RefinementHistory: React.FC<RefinementHistoryProps> = ({
  originalPrompt,
  refinedPrompt,
  onUndo
}) => {
  return (
    <div className="refinement-banner">
      <div className="refinement-icon">🔍</div>
      <div className="refinement-content">
        <div className="refinement-title">Search refined from:</div>
        <div className="refinement-text">
          <span style={{ textDecoration: 'line-through', opacity: 0.6 }}>
            "{originalPrompt}"
          </span>
          <br />
          📌 Now showing: <strong>"{refinedPrompt}"</strong>
        </div>
      </div>
      <button className="undo-button" onClick={onUndo}>
        Undo refinement
      </button>
    </div>
  )
}
```

---

## Integration into Existing Flow

### Current Results Page Structure

```jsx
// app/page.tsx - Results display section
return (
  <div>
    {/* Header */}
    <div className="results-header">
      <Button onClick={handleReturnToSearch}>← Return to Search</Button>
      <div>Your search: "{userPrompt}"</div>
      <Button onClick={handlePrint}>🖨 Print</Button>
      <Button onClick={handleEmail}>✉ Email</Button>
    </div>

    {/* NEW: Refinement Panel */}
    {!isRefined && (
      <RefinePromptPanel
        originalPrompt={userPrompt}
        onRefine={handlePromptRefinement}
      />
    )}

    {/* NEW: Refinement History */}
    {isRefined && (
      <RefinementHistory
        originalPrompt={originalPrompt}
        refinedPrompt={userPrompt}
        onUndo={handleUndoRefinement}
      />
    )}

    {/* Existing resources display */}
    <div className="resources-section">
      {streamingResources.map(resource => (
        <ResourceCard key={resource.number} resource={resource} />
      ))}
    </div>
  </div>
)
```

### State Management

```typescript
// Add to existing state in app/page.tsx
const [originalPrompt, setOriginalPrompt] = useState<string>('')
const [isRefined, setIsRefined] = useState(false)

// Modify existing handleSubmitSearch
const handleSubmitSearch = (prompt: string) => {
  setOriginalPrompt(prompt) // Store original
  setIsRefined(false) // Reset refinement flag
  // ... existing search logic
}

// New: Handle refinement
const handlePromptRefinement = (refinedPrompt: string) => {
  setIsRefined(true)
  // Trigger new search with refined prompt
  handleSubmitSearch(refinedPrompt)
}

// New: Handle undo
const handleUndoRefinement = () => {
  setIsRefined(false)
  // Trigger search with original prompt
  handleSubmitSearch(originalPrompt)
}
```

---

## Responsive Design

### Desktop (≥1024px)
```
┌────────────────────────────────────────────────────┐
│ Refinement panel: Full width, all chips visible    │
│ 6-8 chips per row                                  │
│ Input field: 600px max width                       │
└────────────────────────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌────────────────────────────────────────────────────┐
│ Refinement panel: Full width                       │
│ 4-5 chips per row                                  │
│ Input field: 100% width                            │
└────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌───────────────────────────┐
│ Refinement panel:         │
│ - Collapsed by default    │
│ - 2-3 chips per row       │
│ - Smaller chip text       │
│ - Stack buttons vertical  │
└───────────────────────────┘
```

**Mobile-specific CSS:**
```css
@media (max-width: 768px) {
  .refinement-panel {
    padding: 16px;
  }

  .suggestion-chip {
    font-size: 13px;
    padding: 6px 12px;
  }

  .chip-icon {
    font-size: 14px;
  }

  .refinement-actions {
    flex-direction: column;
    gap: 8px;
  }

  .refinement-actions button {
    width: 100%;
  }

  /* Collapsed state is default on mobile */
  .refinement-panel[data-mobile="true"] {
    max-height: 0;
    overflow: hidden;
    transition: max-height 300ms ease;
  }

  .refinement-panel[data-mobile="true"][data-expanded="true"] {
    max-height: 1000px;
  }
}
```

---

## Smart Defaults & Personalization

### Auto-collapse Behavior

**First search of session:**
- Show refinement panel **expanded** (educate user)
- After 1-2 uses, remember preference

**Subsequent searches:**
- Show **collapsed** by default
- User can expand if needed

```typescript
// localStorage tracking
const STORAGE_KEY = 'refinement-panel-preference'

useEffect(() => {
  const preference = localStorage.getItem(STORAGE_KEY)
  if (preference === 'collapsed') {
    setExpanded(false)
  } else if (!preference) {
    // First time - show expanded, track usage
    setExpanded(true)
    const usageCount = parseInt(localStorage.getItem('refinement-usage') || '0')
    if (usageCount >= 2) {
      localStorage.setItem(STORAGE_KEY, 'collapsed')
    }
  }
}, [])

const handleRefine = () => {
  // ... refinement logic

  // Track usage
  const usageCount = parseInt(localStorage.getItem('refinement-usage') || '0')
  localStorage.setItem('refinement-usage', String(usageCount + 1))
}
```

### Smart Chip Pre-selection

**If user previously selected certain chips, pre-select them:**

```typescript
// Track frequently used refinements
const getFrequentRefinements = (): string[] => {
  const history = JSON.parse(localStorage.getItem('refinement-history') || '[]')
  const frequency: Record<string, number> = {}

  history.forEach((chipId: string) => {
    frequency[chipId] = (frequency[chipId] || 0) + 1
  })

  // Return top 3 most frequent
  return Object.entries(frequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id)
}

// Pre-select in component
const [selectedChips, setSelectedChips] = useState<string[]>(
  getFrequentRefinements()
)
```

---

## Accessibility

### Keyboard Navigation

```typescript
// Add keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl/Cmd + R: Toggle refinement panel
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault()
      setExpanded(!expanded)
    }

    // Escape: Collapse panel
    if (e.key === 'Escape' && expanded) {
      setExpanded(false)
    }
  }

  window.addEventListener('keydown', handleKeyPress)
  return () => window.removeEventListener('keydown', handleKeyPress)
}, [expanded])
```

### ARIA Labels

```jsx
<button
  role="checkbox"
  aria-checked={selectedChips.includes(suggestion.id)}
  aria-label={`Add refinement: ${suggestion.label}`}
  className="suggestion-chip"
>
  {suggestion.icon} {suggestion.label}
</button>

<div
  role="region"
  aria-label="Search refinement options"
  aria-expanded={expanded}
>
  {/* Refinement content */}
</div>
```

### Screen Reader Announcements

```jsx
// Announce when refinement is applied
const [announcement, setAnnouncement] = useState('')

const handleRefine = () => {
  // ... refinement logic
  setAnnouncement('Search refined. Loading new results.')
}

return (
  <>
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
    {/* Rest of component */}
  </>
)
```

---

## Analytics & Metrics

### Track Refinement Usage

```typescript
interface RefinementAnalytics {
  originalPrompt: string
  refinedPrompt: string
  chipsSelected: string[]
  manualInput: string
  timestamp: number
  resultsImprovement?: number // If we can calculate relevance
}

const trackRefinement = (data: RefinementAnalytics) => {
  // Send to analytics service
  fetch('/api/analytics/refinement', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}
```

### Success Metrics
- % of searches that use refinement
- Most common chip combinations
- Average word count: before vs after refinement
- User session length (do refined searches reduce iterations?)
- Resource engagement (are users selecting more resources after refinement?)

---

## Testing Scenarios

### Test Case 1: Vague Food Search
**Input:** "food"
**Expected:**
- Results show immediately
- Refinement panel shows collapsed with "Get more specific results?"
- When expanded, shows chips: Low income, Family, Emergency, SNAP, Senior, No transport

### Test Case 2: Already Detailed Search
**Input:** "food pantries in East Austin for homeless veteran with PTSD"
**Expected:**
- Results show immediately
- Refinement panel still available but less prominent
- Fewer chip suggestions (already detailed)

### Test Case 3: User Refines with Chips
**Input:** "housing"
**Action:** User clicks [Homeless] [Family with kids]
**Expected:**
- New search: "housing for experiencing homelessness, family with children"
- Results reload
- Refinement history banner shows original vs refined
- Undo option available

### Test Case 4: User Types Manual Refinement
**Input:** "jobs"
**Action:** User types "bilingual Spanish, college degree"
**Expected:**
- New search: "jobs bilingual Spanish, college degree"
- Results reload
- Refinement history shows change

### Test Case 5: User Undoes Refinement
**Action:** User clicks [Undo refinement]
**Expected:**
- Original results reload
- Refinement panel reappears (collapsed)
- No refinement history banner

---

## Implementation Phases

### Phase 1: MVP (Week 1)
- [ ] Build RefinePromptPanel component (collapsed/expanded states)
- [ ] Pre-defined suggestion chips with category detection
- [ ] Manual text input for refinement
- [ ] Refinement history banner
- [ ] Undo functionality
- [ ] Basic responsive design

### Phase 2: Polish (Week 2)
- [ ] Smart defaults (auto-collapse after usage)
- [ ] Keyboard shortcuts and accessibility
- [ ] Analytics tracking
- [ ] Mobile optimization
- [ ] Animation and transitions
- [ ] User preference storage

### Phase 3: Intelligence (Week 3+)
- [ ] AI-generated suggestions based on prompt
- [ ] Pre-select frequently used chips
- [ ] Learn from user patterns
- [ ] "Quick refine" shortcuts in results
- [ ] A/B test collapsed vs expanded default

---

## Advantages of This Approach

### ✅ User Benefits
1. **No friction** - Users get results immediately
2. **Context-aware** - Users see what they got before deciding to refine
3. **Educational** - Users learn what makes a good prompt
4. **Optional** - Users can ignore refinement entirely
5. **Fast iteration** - Quick to refine and see new results

### ✅ Technical Benefits
1. **Non-blocking** - Doesn't interrupt search flow
2. **Gradual adoption** - Users discover feature over time
3. **Easy to ignore** - Won't annoy experienced users
4. **Measurable** - Clear metrics on usage and impact
5. **Backwards compatible** - Existing search flow unchanged

### ✅ Product Benefits
1. **Higher engagement** - Users more likely to refine when they see mediocre results
2. **Better data** - Track what refinements work best
3. **User education** - Teaches users how to search better
4. **Reduced support** - Users self-serve to better results
5. **Scalable** - Can add more suggestions over time

---

## Edge Cases

### 1. No Results After Refinement
**Issue:** User refines, gets zero results

**Solution:**
- Show message: "Your refined search was too specific. Try removing some details."
- Suggest removing last refinement
- Quick "Return to original search" button

### 2. Same Results After Refinement
**Issue:** Refinement doesn't change results

**Solution:**
- Detect identical results (compare resource IDs)
- Show message: "These are the same results. Try different refinement details."
- Auto-undo refinement or suggest alternative chips

### 3. Multiple Refinements in Sequence
**Issue:** User refines multiple times

**Solution:**
- Track full refinement history chain
- Allow undo to any point in chain
- Show: Original → Refinement 1 → Refinement 2

### 4. Refinement During Streaming
**Issue:** User refines while results still loading

**Solution:**
- Cancel current stream
- Start new search immediately
- Show loading indicator

### 5. Very Long Refined Prompts
**Issue:** User adds too many details, prompt becomes unwieldy

**Solution:**
- Limit to 5 chip selections
- Character limit on manual input (300 chars)
- Show warning: "Try to keep refinements focused"

---

## Summary

This non-interrupting approach:
- **Respects user intent** - Search happens immediately
- **Provides help when needed** - Refinement available but optional
- **Educates gradually** - Users learn better searching over time
- **Measures impact** - Clear before/after comparison
- **Scales with user sophistication** - Beginners see expanded, experts can collapse

**Key Success Metric:** Increase in refinement usage correlates with higher resource engagement (selections, actions, exports).
