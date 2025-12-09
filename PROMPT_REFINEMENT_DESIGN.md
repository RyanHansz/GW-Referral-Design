# Prompt Refinement Feature - Design Document

## Problem Statement

Case managers often enter vague search queries like "food Austin" which:
- Lack context about the client's specific needs
- Miss important details (income level, family size, urgency, etc.)
- Result in generic, less-targeted resource recommendations
- Require multiple search iterations to get relevant results

## Solution Overview

A **prompt refinement system** that helps users elaborate on vague queries through:
1. **AI-generated suggestions** - Contextual refinement options based on the initial prompt
2. **Quick-select chips** - One-click refinement options
3. **Manual refinement** - Users can edit and add their own details
4. **Smart merging** - Combines original prompt with selected refinements

---

## User Experience Flow

### Scenario: User enters "food Austin"

#### Step 1: Initial Detection (Optional)
```
┌─────────────────────────────────────────────────┐
│ 🔍 We noticed your search is pretty general.    │
│ Want to add more details for better results?    │
│                                                  │
│ [Yes, help me refine] [No, search as-is]       │
└─────────────────────────────────────────────────┘
```

**Behavior:**
- Shown when prompt is < 10 words or detected as vague
- Can be dismissed - user proceeds with original search
- One-time suggestion per session (don't annoy users)

#### Step 2: Refinement Interface (Main Feature)

Instead of showing results immediately, show refinement UI:

```
┌──────────────────────────────────────────────────────────────┐
│                    Refine Your Search                         │
│                                                               │
│  Your search: "food Austin"                                   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Tell us more to get better recommendations:          │   │
│  │ [                                              ]      │   │
│  │ (e.g., single mother with 2 kids, limited income)   │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  💡 Or choose from these common situations:                   │
│                                                               │
│  [💰 Low income/SNAP eligible]                               │
│  [👨‍👩‍👧‍👦 Family with children]                                    │
│  [🏠 Experiencing homelessness]                              │
│  [⚡ Emergency/immediate need]                               │
│  [🚗 No transportation]                                      │
│  [🧓 Senior citizen (60+)]                                   │
│  [🎓 College student]                                        │
│  [🌍 Limited English]                                        │
│                                                               │
│  Selected: [💰 Low income] [👨‍👩‍👧‍👦 Family with 2 kids] [×]      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Refined prompt will be:                              │   │
│  │ "food assistance in Austin for low-income family     │   │
│  │  with 2 children"                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  [Skip Refinement]  [🔍 Search with Refined Prompt]         │
└──────────────────────────────────────────────────────────────┘
```

#### Step 3: Show Results
- Proceed to normal resource generation with refined prompt
- Display both original and refined prompts in results header for context

---

## Design Specifications

### Visual Design

#### Color Scheme
```css
--refinement-bg: #F8FAFC (light blue-gray)
--refinement-border: #E2E8F0
--chip-default: #FFFFFF
--chip-border: #CBD5E1
--chip-selected: #DBEAFE (light blue)
--chip-selected-border: #3B82F6 (blue)
--chip-hover: #F1F5F9
--preview-bg: #FEF3C7 (light yellow)
--preview-border: #F59E0B (orange)
```

#### Layout Structure
```
Container:
- Max width: 800px
- Padding: 32px
- Background: white
- Border radius: 12px
- Box shadow: subtle

Section spacing:
- Between title and input: 24px
- Between input and suggestions: 32px
- Between suggestion rows: 12px
- Between preview and actions: 24px
```

#### Suggestion Chips
```css
Display: inline-flex
Align items: center
Gap: 8px (between icon and text)
Padding: 10px 16px
Border: 2px solid (chip-border)
Border radius: 24px (pill shape)
Font size: 14px
Font weight: 500
Cursor: pointer
Transition: all 150ms ease

Hover:
  Background: chip-hover
  Border color: blue-400
  Transform: translateY(-1px)

Selected:
  Background: chip-selected
  Border color: chip-selected-border
  Font weight: 600
```

#### Selected Chips Display
```css
Display: flex
Flex wrap: wrap
Gap: 8px
Padding: 12px
Background: blue-50
Border radius: 8px
Border: 1px dashed blue-300

Each chip:
  Display: inline-flex
  Align items: center
  Padding: 6px 12px
  Background: white
  Border: 1px solid blue-400
  Border radius: 16px
  Font size: 13px

  Remove button (×):
    Margin left: 8px
    Cursor: pointer
    Color: gray-500
    Hover: color red-600
```

#### Preview Box
```css
Background: preview-bg
Border: 2px solid preview-border
Border radius: 8px
Padding: 16px
Margin bottom: 24px

Label:
  Font size: 13px
  Font weight: 600
  Color: amber-900
  Margin bottom: 8px

Text:
  Font size: 15px
  Color: amber-950
  Line height: 1.5
```

---

## Smart Suggestion Generation

### Context-Aware Suggestions

Based on the search term, show relevant refinement options:

**Food/Nutrition keywords** → Show:
- Low income/SNAP eligible
- Family with children
- Senior citizen
- Emergency/immediate need
- No transportation
- Dietary restrictions (vegetarian, kosher, halal)

**Housing keywords** → Show:
- Experiencing homelessness
- Low income
- Family with children
- Veteran
- Domestic violence survivor
- First-time renter
- Eviction risk

**Job/Employment keywords** → Show:
- Limited English
- No high school diploma
- Returning citizen (criminal record)
- Disability accommodation needed
- Single parent
- Recent graduate
- Career change

**Healthcare keywords** → Show:
- Uninsured/no insurance
- Low income/Medicaid eligible
- Mental health needs
- Substance use recovery
- Chronic condition
- Pregnant/postpartum
- Disability

**Transportation keywords** → Show:
- Low income
- Senior citizen
- Disability
- Medical appointments
- Job commute
- Rural area
- No driver's license

### Dynamic Suggestion API

**Option A: Pre-defined categories (Phase 1 - Faster)**
```typescript
const suggestionMap: Record<string, Refinement[]> = {
  food: [
    { icon: "💰", text: "Low income/SNAP eligible", value: "low-income family eligible for SNAP benefits" },
    { icon: "👨‍👩‍👧‍👦", text: "Family with children", value: "family with {count} children" },
    // ...
  ],
  // ...
}
```

**Option B: AI-generated suggestions (Phase 2 - Smarter)**
```typescript
// API call to GPT to generate contextual refinements
const suggestions = await generateRefinementSuggestions(userPrompt)
```

---

## Technical Implementation

### Component Structure

```
RefinePromptModal
├── PromptInput (original search)
├── ManualRefinementTextarea
├── SuggestionGrid
│   └── SuggestionChip[]
├── SelectedRefinements
│   └── SelectedChip[]
├── RefinedPromptPreview
└── ActionButtons
    ├── SkipButton
    └── SearchButton
```

### State Management

```typescript
interface RefinementState {
  originalPrompt: string
  manualRefinement: string
  selectedSuggestions: Refinement[]
  refinedPrompt: string // computed
  showRefinement: boolean
}

interface Refinement {
  id: string
  icon: string
  text: string
  value: string // What gets added to prompt
  category?: string
}
```

### Prompt Merging Logic

```typescript
function generateRefinedPrompt(
  original: string,
  manual: string,
  suggestions: Refinement[]
): string {
  const parts = [original]

  // Add manual refinement
  if (manual.trim()) {
    parts.push(manual.trim())
  }

  // Add suggestion values
  const suggestionText = suggestions
    .map(s => s.value)
    .join(", ")

  if (suggestionText) {
    parts.push(`for ${suggestionText}`)
  }

  return parts.join(" ")
}

// Example:
// original: "food Austin"
// manual: ""
// suggestions: ["low-income family", "2 children", "no transportation"]
// Result: "food Austin for low-income family with 2 children and no transportation"
```

---

## Integration Points

### 1. Search Form Submission

**Current flow:**
```
User enters prompt → Submit → Generate resources
```

**New flow:**
```
User enters prompt → Submit → Check if refinement needed
  ├─ If vague: Show refinement modal
  │   ├─ User refines → Use refined prompt
  │   └─ User skips → Use original prompt
  └─ If detailed: Generate resources directly
```

### 2. Vagueness Detection

```typescript
function isPromptVague(prompt: string): boolean {
  const wordCount = prompt.trim().split(/\s+/).length
  const hasContext = /\b(family|income|emergency|homeless|children|senior)\b/i.test(prompt)

  return wordCount < 5 && !hasContext
}
```

### 3. Results Display

Show context in results header:

```
┌────────────────────────────────────────────────┐
│ Results for: "food Austin"                     │
│ 🔍 Refined to: "food assistance in Austin for  │
│    low-income family with 2 children"          │
│                                                │
│ [Edit Search]                                  │
└────────────────────────────────────────────────┘
```

---

## User Preferences & Settings

### Smart Defaults
- First-time users: Always show refinement modal for vague prompts
- Returning users: Remember if they prefer to skip (localStorage)
- Setting toggle: "Always ask to refine vague searches" (on by default)

### Quick Actions
- Keyboard shortcut: Ctrl/Cmd + R to open refinement
- Voice input: "Refine my search" triggers modal

---

## Accessibility Considerations

### Keyboard Navigation
- Tab through suggestion chips
- Enter/Space to select chip
- Escape to close modal
- Arrow keys to navigate suggestions

### Screen Readers
```jsx
<button
  role="checkbox"
  aria-checked={isSelected}
  aria-label="Add refinement: Low income family"
>
  💰 Low income/SNAP eligible
</button>
```

### Visual Indicators
- High contrast borders for selected chips
- Focus rings on all interactive elements
- Clear "selected" state (not just color)

---

## Analytics & Metrics

Track to measure success:
- % of searches that trigger refinement
- % of users who refine vs skip
- Most common refinement combinations
- Before/after comparison:
  - Average search word count
  - Resource relevance scores (if available)
  - User satisfaction (thumbs up/down)

---

## Implementation Phases

### Phase 1: MVP (Week 1)
- [ ] Build refinement modal UI
- [ ] Pre-defined suggestion categories
- [ ] Basic vagueness detection
- [ ] Manual text input for refinement
- [ ] Prompt merging logic
- [ ] Skip option

### Phase 2: Enhancements (Week 2)
- [ ] AI-generated suggestions (context-aware)
- [ ] User preference storage (localStorage)
- [ ] Analytics tracking
- [ ] Keyboard shortcuts
- [ ] Show original vs refined in results

### Phase 3: Advanced (Week 3+)
- [ ] Multi-step refinement wizard
- [ ] Suggested questions based on category
- [ ] Template-based refinements ("I'm looking for...")
- [ ] Voice input support
- [ ] Learning from user behavior

---

## Edge Cases & Considerations

### 1. Already Detailed Prompts
**Issue:** User enters "food pantries in Austin for single mother with 3 kids under 5 who needs immediate assistance"

**Solution:** Don't show refinement - this is already detailed enough

**Detection:**
```typescript
function isPromptDetailed(prompt: string): boolean {
  const wordCount = prompt.trim().split(/\s+/).length
  const hasMultipleContexts = (prompt.match(/\b(family|income|emergency|homeless|children|senior|disability)\b/gi) || []).length >= 2

  return wordCount > 10 || hasMultipleContexts
}
```

### 2. Multiple Refinement Passes
**Issue:** User refines once, gets results, wants to refine again

**Solution:** Add "Refine Search" button in results header

### 3. Conflicting Refinements
**Issue:** User selects "Senior citizen" and "College student"

**Solution:**
- Allow multiple selections (could be searching for someone else)
- Or show warning: "These selections might conflict. Continue anyway?"

### 4. Over-Refinement
**Issue:** Too many refinements = hyper-specific = no results

**Solution:**
- Limit to 5 selections
- Show warning if < 3 results expected
- "Try removing some refinements" suggestion

### 5. Language/Translation
**Issue:** Tool supports multiple languages

**Solution:**
- Translate suggestion chip text
- Keep refinement values in English for AI consistency
- Translate preview text

---

## Testing Scenarios

### Test Case 1: Vague Food Search
**Input:** "food"
**Expected:** Refinement modal shows
**Refinements:** Select "Low income" + "Family with 2 kids"
**Output:** "food assistance for low-income family with 2 children"

### Test Case 2: Already Detailed
**Input:** "food pantries in East Austin for homeless veteran with PTSD"
**Expected:** No refinement modal, direct to results

### Test Case 3: Skip Refinement
**Input:** "housing"
**Action:** Click "Skip Refinement"
**Expected:** Proceed with original "housing" prompt

### Test Case 4: Manual + Suggestions
**Input:** "jobs"
**Manual:** "bilingual Spanish speaker"
**Suggestions:** "No high school diploma"
**Output:** "jobs bilingual Spanish speaker for person without high school diploma"

### Test Case 5: Remove Selection
**Input:** "healthcare"
**Action:** Select 3 chips → Remove middle chip
**Expected:** Preview updates correctly, only 2 chips in refined prompt

---

## Future Enhancements

### Smart Templates
```
"I'm looking for [resource type] in [location] for a [client description]"
```

### Guided Questions
```
Step 1: What type of help does the client need?
  → Food, Housing, Job, Healthcare, etc.

Step 2: Tell us about the client's situation:
  → Age group, family size, income level

Step 3: Any urgent needs?
  → Emergency, immediate need, time-sensitive
```

### Learn from History
- Remember common refinements per user
- Suggest based on past searches
- Auto-fill common patterns

### Resource Category Hints
- If searching "food", show CAT classes aren't relevant
- If searching "job training", prioritize CAT results

---

## Summary

This prompt refinement feature will:
✅ Help case managers create more targeted searches
✅ Reduce search iteration time
✅ Improve resource recommendation relevance
✅ Provide education on what details matter
✅ Maintain user control (skip option)
✅ Be accessible and intuitive

**Key Success Metric:** Increase average prompt word count from ~3 words to ~8-10 words, resulting in more relevant resource matches.
