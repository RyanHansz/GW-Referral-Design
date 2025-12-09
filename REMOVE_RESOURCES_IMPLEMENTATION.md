# Remove Resources Implementation Guide

## Quick Start

This guide covers implementing the resource removal feature for the referral tool. For full design context, see `EDIT_REMOVE_DESIGN.md`.

## Overview

Allow case managers to remove unwanted resources from the generated list with an undo option. Removals are non-destructive - original data stays in `conversationHistory`.

## Key Files

- **app/page.tsx** - Main component with resource rendering (lines 2758-3197) and state management (line 478+)
- **Resource interface** - app/page.tsx:55-89

## Implementation Steps

### 1. Add State Management (app/page.tsx:~527)

Add these state variables near the other useState declarations:

```typescript
// Set of removed resource identifiers (format: "conversationIndex-resourceNumber")
const [removedResourceIds, setRemovedResourceIds] = useState<Set<string>>(new Set())

// Track recently removed resource for undo notification
const [lastRemovedResource, setLastRemovedResource] = useState<{
  id: string
  conversationIndex: number
  resourceNumber: number
  timestamp: number
} | null>(null)
```

### 2. Create Display Resources Helper Function

Add this utility function in the component (after state declarations):

```typescript
// Filter and return displayable resources (excluding removed ones)
const getDisplayResources = useCallback((
  conversationIndex: number,
  resources: Resource[]
): Resource[] => {
  return resources.filter(resource => {
    const id = `${conversationIndex}-${resource.number}`
    return !removedResourceIds.has(id)
  })
}, [removedResourceIds])
```

### 3. Create Remove Handler

Add the removal logic:

```typescript
const handleRemoveResource = useCallback((
  conversationIndex: number,
  resource: Resource
) => {
  const id = `${conversationIndex}-${resource.number}`

  // Add to removed set
  setRemovedResourceIds(prev => new Set(prev).add(id))

  // Set up undo with 5 second timeout
  setLastRemovedResource({
    id,
    conversationIndex,
    resourceNumber: resource.number,
    timestamp: Date.now()
  })

  // Auto-clear undo notification after 5 seconds
  setTimeout(() => {
    setLastRemovedResource(prev => {
      if (prev?.id === id && Date.now() - prev.timestamp >= 5000) {
        return null
      }
      return prev
    })
  }, 5000)
}, [])
```

### 4. Create Undo Handler

```typescript
const handleUndoRemoval = useCallback(() => {
  if (!lastRemovedResource) return

  setRemovedResourceIds(prev => {
    const updated = new Set(prev)
    updated.delete(lastRemovedResource.id)
    return updated
  })

  setLastRemovedResource(null)
}, [lastRemovedResource])
```

### 5. Update Resource Card Rendering (app/page.tsx:~2758-3197)

Find the section where resource cards are rendered. Update to:

1. **Use filtered resources:**
```typescript
// Find the map function that renders resources
// Change from: response.resources?.map((resource, idx) => (
// To:
{getDisplayResources(index, response.resources || []).map((resource, idx) => (
```

2. **Add remove button to each card:**

Find the card header (should be near the category badge) and add:

```tsx
{/* Add this in the card header area, top-right corner */}
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleRemoveResource(index, resource)}
  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
  title="Remove resource"
>
  <X className="h-4 w-4" />
</Button>
```

Don't forget to import the X icon at the top:
```typescript
import { X } from "lucide-react"
```

### 6. Add Undo Notification Component

Create a simple notification at the bottom of the page (before closing main div):

```tsx
{lastRemovedResource && (
  <div className="fixed bottom-4 right-4 bg-gray-100 border border-gray-300 rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
    <Info className="h-4 w-4 text-gray-600" />
    <span className="text-sm text-gray-900">Resource removed</span>
    <Button
      variant="ghost"
      size="sm"
      onClick={handleUndoRemoval}
      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium"
    >
      <RotateCcw className="h-3.5 w-3.5 mr-1" />
      Undo
    </Button>
  </div>
)}
```

Import the icons:
```typescript
import { X, Info, RotateCcw } from "lucide-react"
```

### 7. Update Action Plan Selection (app/page.tsx:~3040-3054)

Find the section where resources are listed for action plan selection. Update to use filtered resources:

```typescript
// Change from: response.resources?.map((resource) => (
// To:
{getDisplayResources(index, response.resources || []).map((resource) => (
```

### 8. Update PDF Export (app/page.tsx:~1720-1847)

In the PDF generation function, ensure it uses filtered resources:

```typescript
// Find where resources are added to PDF
// Wrap resource iteration with getDisplayResources call
conversationHistory.forEach((item, convIndex) => {
  if (item.type === "response" && item.resources) {
    const displayResources = getDisplayResources(convIndex, item.resources)
    displayResources.forEach(resource => {
      // ... existing PDF generation code
    })
  }
})
```

## Testing Checklist

- [ ] Click remove button on a resource - card disappears
- [ ] Undo notification appears for 5 seconds
- [ ] Click "Undo" - resource reappears
- [ ] Wait 5+ seconds - notification auto-dismisses
- [ ] Remove multiple resources - all disappear correctly
- [ ] Action plan selection only shows non-removed resources
- [ ] PDF export excludes removed resources
- [ ] Removed resources don't appear in email PDFs
- [ ] Original data in conversationHistory unchanged

## Visual Design

- **Remove button**: Ghost variant, red color scheme, top-right of card
- **Icon**: X from lucide-react, 16px (h-4 w-4)
- **Undo notification**: Bottom-right corner, gray background, 5s timeout
- **Animation**: Cards fade out smoothly when removed

## Key Points

1. **Non-destructive**: Original data in `conversationHistory` never changes
2. **Resource ID format**: `"${conversationIndex}-${resource.number}"`
3. **5-second undo**: Auto-dismiss notification after timeout
4. **Filter everywhere**: All display/export functions must use `getDisplayResources()`
5. **No persistence**: Removals reset on page refresh (session-only)

## Common Issues

**Cards not disappearing?**
- Verify `getDisplayResources()` is called in render
- Check resource ID format matches `"index-number"`
- Ensure Set operations use `new Set(prev)` pattern

**Undo not working?**
- Check timeout hasn't expired (5s limit)
- Verify state update uses Set.delete correctly
- Ensure notification state cleared on undo

**Wrong resources removed?**
- Verify conversationIndex passed correctly to handler
- Check resource.number exists and is unique
- Test with multiple conversation exchanges

## Next Steps

After implementing remove functionality:
1. Test thoroughly with the checklist above
2. Consider adding edit functionality (see EDIT_REMOVE_DESIGN.md Phase 3)
3. Add loading states and error handling
4. Test mobile responsiveness
5. Add keyboard shortcuts (Delete key)

## Questions?

Refer to full design doc: `EDIT_REMOVE_DESIGN.md`
