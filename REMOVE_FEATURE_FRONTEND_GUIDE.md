# Remove Resources Feature - Frontend & Design Guide

## Overview

A user-friendly feature allowing case managers to remove unwanted resources from referral lists with a simple undo mechanism. This guide focuses on the UI/UX implementation and design decisions.

---

## Design Philosophy

**Core Principles:**
- **Non-destructive**: Original data never changes - removals are visual filters only
- **Reversible**: 5-second undo window for accidental removals
- **Minimal friction**: One click to remove, one click to undo
- **Clear feedback**: Instant visual confirmation of actions
- **Consistent**: Matches existing app design language

---

## User Experience Flow

### Happy Path
```
1. User sees resource card
2. Hovers over card → Remove button becomes prominent
3. Clicks "Remove" → Card remains briefly
4. Alert slides in from top: "Resource removed [Undo]"
5. Card continues to display (still in list)
6. User continues workflow with resource marked as removed
```

### Undo Path
```
1. Resource removed → Alert appears
2. User clicks "Undo" within 5 seconds
3. Alert disappears immediately
4. Resource remains in the list (un-marked)
5. User continues as if nothing happened
```

---

## Visual Design

### 1. Remove Button

**Location**: Top-right corner of resource card

**Visual Specs:**
```css
Position: absolute top-3 right-3
Colors: Red theme
  - Text: text-red-600
  - Hover text: text-red-700
  - Hover bg: hover:bg-red-50
Border: border border-red-200
Size: px-2 py-1 (compact)
Icon: X icon from lucide-react (w-3.5 h-3.5)
Label: "Remove" (hidden on mobile: hidden sm:inline)
```

**States:**
- **Default**: Subtle red text with light border
- **Hover**: Darker red text with light red background
- **Active/Click**: Brief scale-down effect (optional enhancement)
- **Disabled**: During streaming or processing (gray, not clickable)

**Responsive:**
- **Desktop**: Shows icon + "Remove" text
- **Mobile**: Icon only (saves space)
- **Touch target**: Minimum 44x44px for accessibility

### 2. Undo Notification

**Location**: Top-center of viewport (fixed positioning)

**Visual Specs:**
```css
Position: fixed top-6 left-1/2 transform -translate-x-1/2
Z-index: z-50 (above all content)
Background: bg-gray-900 (dark theme for contrast)
Text: text-white
Padding: px-4 py-3
Border radius: rounded-lg
Shadow: shadow-lg
Display: flex items-center gap-3
```

**Layout:**
```
┌─────────────────────────────────────┐
│ [ℹ️] Resource removed    [Undo ↻]  │
└─────────────────────────────────────┘
  ↑                           ↑
  Info icon                   Action button
  (gray circle bg)            (white bg, dark text)
```

**Undo Button Specs:**
```css
Background: bg-white
Text: text-gray-900
Padding: px-3 py-1.5
Hover: hover:bg-gray-100
Icon: RotateCcw from lucide-react (w-3.5 h-3.5)
Font: text-sm font-medium
```

**Behavior:**
- Auto-dismiss after 5 seconds
- Clicking "Undo" dismisses immediately
- Clicking elsewhere doesn't dismiss (user might need time to think)
- Multiple removals show last one only (stacking avoided for simplicity)

### 3. Animation & Transitions

**Undo Alert Entrance:**
```css
animate-in slide-in-from-top-5 duration-300
```
- Slides down from top edge
- 300ms duration for smooth feel
- Uses Tailwind's built-in animate-in utilities

**Card Behavior:**
- Resources are filtered but NOT animated out (they just stop rendering)
- This is intentional - cleaner UX than watching cards disappear
- On undo, resources reappear in their original position

**Performance:**
- CSS transforms for animations (GPU-accelerated)
- No layout thrashing - fixed positioning for alert
- Efficient Set lookups for removal checks (O(1))

---

## Component Architecture

### State Structure

```typescript
// Primary removal tracking
const [removedResourceIds, setRemovedResourceIds] = useState<Set<string>>(new Set())

// Undo notification state
const [recentlyRemoved, setRecentlyRemoved] = useState<{
  id: string       // Resource identifier
  timestamp: number // For timeout logic
} | null>(null)
```

**Resource Identifier Format:**
```
`${conversationIndex}-${resourceNumber}`

Examples:
  "0-1"  → First conversation, resource #1
  "2-5"  → Third conversation, resource #5
```

**Why Set instead of Array?**
- O(1) lookup time for checking if resource removed
- No duplicates possible
- Clean add/remove operations

### Key Functions

**1. Remove Handler**
```typescript
handleRemoveResource(conversationIndex, resourceNumber)
  ↓
1. Create resource ID
2. Add ID to removedResourceIds Set
3. Set recentlyRemoved with timestamp
4. Start 5-second timeout
5. Re-render → resource filtered out
```

**2. Undo Handler**
```typescript
handleUndoRemove()
  ↓
1. Get resource ID from recentlyRemoved
2. Remove ID from removedResourceIds Set
3. Clear recentlyRemoved state
4. Re-render → resource appears again
```

**3. Check Function**
```typescript
isResourceRemoved(conversationIndex, resourceNumber)
  ↓
Returns boolean - used in .filter() calls
```

### Rendering Pattern

**Before rendering resources:**
```jsx
{exchange.response.resources
  .filter((resource) => !isResourceRemoved(index, resource.number))
  .map((resource) => (
    // Render resource card
  ))
}
```

**Applied in 4 places:**
1. Streaming resources display (first render)
2. Conversation history resources display
3. Action plan resource selection checkboxes
4. PDF generation content compilation

---

## Interaction Details

### Remove Button Click

**What happens:**
1. `handleRemoveResource()` called with conversation index + resource number
2. Resource ID added to `removedResourceIds` Set
3. `recentlyRemoved` state updated with ID + current timestamp
4. Component re-renders
5. Resource filtered out of display everywhere
6. Undo notification slides in from top
7. 5-second timer starts

**Visual feedback:**
- Button shows quick hover effect
- Card remains visible momentarily (React render cycle)
- Notification appears smoothly at top

### Undo Button Click

**What happens:**
1. `handleUndoRemove()` called
2. Resource ID removed from Set
3. `recentlyRemoved` cleared (notification disappears)
4. Component re-renders
5. Resource reappears in original position
6. User can continue as normal

**Visual feedback:**
- Notification disappears immediately
- Resource card reappears in place
- No jarring animations

---

## Accessibility Considerations

### Keyboard Navigation
- Remove button focusable via Tab key
- Enter/Space activates removal
- Undo button keyboard-accessible
- Focus trapped in notification for clarity

### Screen Readers
```jsx
// Remove button
title="Remove resource"
aria-label="Remove resource {resource.title}"

// Undo notification
role="alert" (announces immediately)
aria-live="polite"
```

### Touch Targets
- Minimum 44x44px for buttons (iOS/Android HIG)
- Remove button sized appropriately on mobile
- Good spacing between elements (gap-3, gap-2)

### Color Contrast
- Red text on white background: WCAG AA compliant
- White text on gray-900 background: WCAG AAA compliant
- Border helps distinguish button even in color-blind modes

---

## Responsive Design

### Desktop (≥640px)
```jsx
<X className="w-3.5 h-3.5" />
<span className="hidden sm:inline">Remove</span>
```
- Full button with icon + text
- Generous spacing and padding
- Notification has ample room

### Mobile (<640px)
```jsx
<X className="w-3.5 h-3.5" />
<span className="hidden sm:inline">Remove</span>
```
- Icon-only button (text hidden via `hidden sm:inline`)
- Same touch target size maintained
- Notification stacks vertically if needed
- Top positioning ensures it doesn't block content

---

## Edge Cases & Considerations

### 1. Remove During Streaming
**Issue**: User removes resource while AI still generating
**Solution**:
- Filter is applied to `streamingResources` array too
- Resource won't reappear even as stream continues
- Clean UX - no flash of removed resource

### 2. Multiple Quick Removals
**Issue**: User removes 3 resources in 2 seconds
**Current behavior**: Only last removal shows in notification
**Rationale**: Keeps UI simple, user can undo one at a time if needed
**Future enhancement**: Could stack notifications

### 3. Undo After Timeout
**Issue**: User tries to undo after 5 seconds
**Solution**: Notification auto-dismissed, no undo option available
**Rationale**: Prevents confusion, encourages intentional removal

### 4. All Resources Removed
**Issue**: User removes every resource from a conversation
**Current behavior**: Empty space where resources were
**Future enhancement**: Show "All resources removed" message

### 5. Page Refresh
**Issue**: User refreshes page after removals
**Current behavior**: All removals lost (Set state clears)
**Rationale**: Removals are session-temporary, data never persisted
**Note**: This is intentional - fresh start on each session

---

## Integration Points

### Action Plan Generation
- Removed resources excluded from selection list
- Checkboxes only show non-removed resources
- Action plan API receives filtered list only

### PDF Export
- Removed resources not included in PDF
- Page formatting adjusts for fewer resources
- Numbering stays consistent with displayed list

### Email Functionality
- Uses same PDF as export (removed resources excluded)
- No additional logic needed

### Case Notes
- Should reference only non-removed resources
- Compilation function uses same filter

---

## Design Tokens (Color Scheme)

### Red Accent (Remove/Danger)
```
Primary:   text-red-600    (#dc2626)
Hover:     text-red-700    (#b91c1c)
Hover bg:  hover:bg-red-50 (#fef2f2)
Border:    border-red-200  (#fecaca)
```

### Dark Notification
```
Background: bg-gray-900    (#111827)
Text:       text-white     (#ffffff)
Icon bg:    bg-gray-700    (#374151)
```

### Undo Button (Light)
```
Background:  bg-white       (#ffffff)
Text:        text-gray-900  (#111827)
Hover bg:    hover:bg-gray-100 (#f3f4f6)
```

---

## Performance Optimizations

### Efficient Filtering
```typescript
// O(1) lookup time
removedResourceIds.has(resourceId)

// vs O(n) array search
removedResourceIds.includes(resourceId) // ❌ Slower
```

### Minimal Re-renders
- State changes only affect specific component
- Set updates are immutable (`new Set(prev)`)
- React can efficiently diff changes

### CSS Animations
- Use `transform` and `opacity` (GPU-accelerated)
- Avoid animating `height`, `width`, `top` (causes reflow)
- Fixed positioning prevents layout shifts

---

## Testing Checklist

### Visual Testing
- [ ] Remove button appears in correct position (top-right)
- [ ] Remove button has proper hover states
- [ ] Undo notification appears at top-center
- [ ] Undo notification has proper styling and spacing
- [ ] Animations smooth at 60fps
- [ ] Colors match design system
- [ ] Mobile view shows icon-only button

### Interaction Testing
- [ ] Click remove → resource filtered out
- [ ] Notification appears within 300ms
- [ ] Click undo → resource reappears
- [ ] Notification dismisses after 5 seconds
- [ ] Multiple removals work correctly
- [ ] Can't undo after timeout

### Integration Testing
- [ ] Action plan excludes removed resources
- [ ] PDF export excludes removed resources
- [ ] Email uses filtered resource list
- [ ] Filtering works across multiple conversations

### Accessibility Testing
- [ ] Tab navigation reaches remove button
- [ ] Enter/Space activates removal
- [ ] Undo button keyboard-accessible
- [ ] Screen reader announces removal
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets ≥44x44px

### Responsive Testing
- [ ] Desktop shows full button text
- [ ] Mobile shows icon-only
- [ ] Notification doesn't overflow on small screens
- [ ] Touch interactions work smoothly

---

## Future Enhancements

### Phase 2 Ideas
1. **Fade-out animation**: Smooth card removal instead of instant filter
2. **Stack notifications**: Show multiple undo options simultaneously
3. **Bulk remove**: Select multiple resources, remove all at once
4. **Persistent removals**: Save to localStorage for session recovery
5. **Remove all**: Quick button to clear entire resource list
6. **Keyboard shortcuts**: Delete key to remove focused resource
7. **Confirmation dialog**: For irreversible removals (if persistence added)

### Advanced UX
- Swipe gesture to remove (mobile)
- Drag resource off-screen to remove
- "Recently removed" panel to see history
- Undo stack (undo multiple removals in sequence)

---

## Summary

The remove feature provides a **clean, intuitive, and reversible** way for case managers to filter out unwanted resources. The design prioritizes:

✅ **Speed**: One-click removal, minimal friction
✅ **Safety**: 5-second undo window
✅ **Clarity**: Clear visual feedback and positioning
✅ **Consistency**: Matches app's design language
✅ **Accessibility**: Keyboard, screen reader, and touch-friendly
✅ **Performance**: Efficient Set operations and CSS animations

The implementation is **non-destructive** - original data remains untouched in `conversationHistory`, making the feature safe and reversible at any scale.
