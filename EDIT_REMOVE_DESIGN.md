# Edit/Remove Resources Feature Design

## Overview
Allow case managers to edit or remove resources from the generated referral list before sharing with clients, ensuring they only pass along information they want their clients to see.

## Current Implementation Summary

### Data Structure (app/page.tsx:55-89)
- Resources stored in `Resource` interface with 20+ optional fields
- Stored in `conversationHistory` array as part of response objects
- Streaming resources temporarily in `streamingResources` array

### Display Location (app/page.tsx:2758-3197)
- Resource cards rendered in conversation history
- Each card shows category badge, title, and structured fields
- 6 category types with distinct styling (Goodwill, Community, Government, Jobs, GCTA, CAT)

---

## Design Goals

1. **Non-destructive editing** - Preserve original AI-generated data
2. **Clear visual feedback** - Show which resources are edited/removed
3. **Reversible actions** - Allow undo for removals
4. **Workflow integration** - Edited resources flow into action plans and PDFs
5. **Intuitive UX** - Minimal learning curve for case managers

---

## Technical Design

### 1. State Management

Add new state variables to track edits and removals:

```typescript
// Map of resource identifier to edited fields
const [editedResources, setEditedResources] = useState<Map<string, Partial<Resource>>>(new Map())

// Set of removed resource identifiers
const [removedResourceIds, setRemovedResourceIds] = useState<Set<string>>(new Set())

// Track which resource is being edited
const [editingResource, setEditingResource] = useState<{
  original: Resource
  conversationIndex: number
  resourceIndex: number
} | null>(null)
```

**Resource Identifier Strategy:**
- Use composite key: `${conversationIndex}-${resourceNumber}`
- Example: `"0-1"` for first conversation, resource #1
- Ensures uniqueness across multiple conversation exchanges

### 2. Data Flow

**Display Resources (Computed):**
```typescript
function getDisplayResources(
  conversationIndex: number,
  resources: Resource[]
): Resource[] {
  return resources
    .filter(resource => {
      const id = `${conversationIndex}-${resource.number}`
      return !removedResourceIds.has(id)
    })
    .map(resource => {
      const id = `${conversationIndex}-${resource.number}`
      const edits = editedResources.get(id)
      return edits ? { ...resource, ...edits, _isEdited: true } : resource
    })
}
```

**Workflow:**
1. Original resources remain unchanged in `conversationHistory`
2. Display layer applies filters (removal) and merges (edits)
3. Action plan generation uses display resources
4. PDF export uses display resources
5. Email functionality uses display resources

### 3. UI Components

#### A. Resource Card Actions (app/page.tsx:~2900-3000)

Add action buttons to each resource card:

```
┌─────────────────────────────────────┐
│ [#] Category Badge        [Edit] [X]│
│ Resource Title                      │
│ • Eligibility                       │
│ • Services                          │
│ • Contact                           │
│ [Source Link]          [EDITED]     │
└─────────────────────────────────────┘
```

**Button Placement:**
- **Edit button**: Top-right corner, ghost variant with pencil icon
- **Remove button**: Top-right corner next to edit, ghost variant with X icon
- **Edited badge**: Bottom-right, subtle gray badge when resource is edited

**Visual States:**
- **Normal**: Full opacity, default border
- **Edited**: Blue-tinted "Edited" badge, slightly thicker border
- **Removing**: Fade-out animation over 300ms
- **Removed**: Hidden from display (filtered out)

#### B. Edit Resource Dialog Component

Create new component: `components/EditResourceDialog.tsx`

**Features:**
- Modal dialog using existing `components/ui/dialog.tsx`
- Form fields for all editable resource properties
- Dynamic field rendering based on resource category
- Original values shown as placeholders
- Save/Cancel actions
- Reset to original option

**Form Structure:**
```
┌──────────────────────────────────────────────┐
│ Edit Resource                          [X]   │
├──────────────────────────────────────────────┤
│                                              │
│ Title                                        │
│ [________________________________]          │
│                                              │
│ Eligibility (optional)                      │
│ [________________________________]          │
│                                              │
│ Services (optional)                         │
│ [________________________________]          │
│                                              │
│ Contact                                      │
│ [________________________________]          │
│                                              │
│ Source URL                                   │
│ [________________________________]          │
│                                              │
│ ... (additional fields based on category)    │
│                                              │
│         [Reset to Original] [Cancel] [Save]  │
└──────────────────────────────────────────────┘
```

**Field Types:**
- Text inputs for: title, contact, website, salary, etc.
- Textareas for: eligibility, services, description, support
- URL validation for: source, website
- Phone validation for: contact (if phone number present)

#### C. Removed Resource Undo UI

Show subtle notification when resource is removed:

```
┌─────────────────────────────────────────────┐
│ ⓘ Resource removed [Undo]                  │
└─────────────────────────────────────────────┘
```

**Behavior:**
- Appears for 5 seconds after removal
- Click "Undo" to restore resource
- Auto-dismiss after timeout
- Stack multiple notifications if multiple removals

### 4. Integration Points

#### A. Resource Selection for Action Plans (app/page.tsx:3040-3054)

**Current**: Checkboxes list all original resources

**Updated**: Checkboxes list only display resources (filtered + edited)
- Show edited versions with "Edited" indicator
- Exclude removed resources from selection list
- Update selection state when resources edited

#### B. Action Plan Generation (app/page.tsx:1484-1582)

**Current**: Sends selected resources to `/api/generate-action-plan`

**Updated**: Send display versions of selected resources
- Apply edits before sending to API
- Ensure removed resources not included
- Maintain resource numbering for clarity

#### C. PDF Export (app/page.tsx:1720-1847)

**Current**: Exports conversation history as-is

**Updated**: Export display versions
- Include edited resource data
- Skip removed resources
- Add "(Edited)" indicator in PDF for transparency

#### D. Email Functionality (app/page.tsx:1851-1892)

**Current**: Emails PDF with original data

**Updated**: Use PDF with display data (same as export)
- No additional changes needed if PDF export updated

---

## Implementation Plan

### Phase 1: Core State & Data Flow
1. Add state variables for edits and removals
2. Create `getDisplayResources()` utility function
3. Create resource identifier utilities
4. Update display rendering to use computed resources

### Phase 2: Remove Functionality
1. Add remove button to resource cards
2. Implement remove handler
3. Add removal animation
4. Create undo notification component
5. Test removal workflow

### Phase 3: Edit Functionality
1. Create `EditResourceDialog` component
2. Add edit button to resource cards
3. Implement edit handler with validation
4. Add edited badge to modified resources
5. Test edit workflow and field validation

### Phase 4: Integration Updates
1. Update action plan selection list
2. Modify action plan generation to use display resources
3. Update PDF export to use display resources
4. Test end-to-end workflow
5. Add confirmation dialogs where appropriate

### Phase 5: Polish & Testing
1. Add loading states for edit dialog
2. Implement keyboard shortcuts (Delete for remove, E for edit)
3. Add tooltips for action buttons
4. Test with various resource categories
5. Test with multiple conversation exchanges
6. Ensure mobile responsiveness
7. Add error handling for edge cases

---

## User Workflow Examples

### Editing a Resource
1. Case manager reviews generated referrals
2. Notices phone number is outdated for Resource #2
3. Clicks "Edit" button on Resource #2 card
4. Dialog opens with all fields pre-filled
5. Updates contact field with new phone number
6. Clicks "Save"
7. Dialog closes, card shows "Edited" badge
8. Continues with action plan generation using edited version

### Removing a Resource
1. Case manager sees 4 resources generated
2. Resource #3 doesn't fit client's specific needs
3. Clicks "X" button on Resource #3 card
4. Card fades out and disappears
5. Notification appears: "Resource removed [Undo]"
6. Remaining resources renumber visually (1, 2, 4)
7. Action plan selection shows only 3 resources
8. Case manager continues workflow without #3

### Undoing Removal
1. Case manager accidentally removes Resource #2
2. Notification appears with "Undo" button
3. Clicks "Undo" within 5 seconds
4. Resource #2 fades back in
5. Original position and data restored

### Editing Multiple Resources
1. Case manager edits Resource #1 (updates eligibility)
2. Edits Resource #3 (updates services offered)
3. Both show "Edited" badges
4. Removes Resource #4
5. Action plan generation uses edited #1 and #3, skips #4
6. PDF export includes edited versions only

---

## Technical Considerations

### Data Persistence
- **In-memory only**: Edits/removals not saved between page refreshes
- **Rationale**: Referrals are session-specific, not meant for long-term storage
- **Future enhancement**: Could add localStorage persistence if needed

### Performance
- Computed resources calculated on each render
- Optimize with `useMemo` for large conversation histories
- Map and Set operations are O(1) for lookups

### Accessibility
- Edit/Remove buttons keyboard accessible
- Dialog form fields properly labeled
- Screen reader announcements for edit/remove actions
- Focus management when dialog opens/closes

### Mobile Considerations
- Edit/Remove buttons sized for touch targets (min 44x44px)
- Dialog form scrollable on small screens
- Undo notification positioned to not block content
- Swipe gesture consideration for removal (future)

### Edge Cases
1. **Editing while streaming**: Disable edit/remove during active streaming
2. **Removing all resources**: Show message "All resources removed" with reset option
3. **Editing then generating action plan**: Ensure latest edits always used
4. **Multiple conversation exchanges**: Edits isolated per conversation
5. **Resource numbering**: Display numbering updates when resources removed

---

## Visual Design Specifications

### Colors (matching existing theme)
- **Edit button**: `text-blue-600 hover:text-blue-700 hover:bg-blue-50`
- **Remove button**: `text-red-600 hover:text-red-700 hover:bg-red-50`
- **Edited badge**: `bg-blue-50 text-blue-700 border-blue-200`
- **Undo notification**: `bg-gray-100 border-gray-300 text-gray-900`

### Icons (using lucide-react)
- **Edit**: `Pencil` icon (16px)
- **Remove**: `X` icon (16px)
- **Undo**: `RotateCcw` icon (14px)
- **Info**: `Info` icon (14px)

### Animations
- **Remove**: `transition-opacity duration-300 ease-out`
- **Restore**: `transition-opacity duration-300 ease-in`
- **Undo notification**: `animate-in slide-in-from-bottom-5 duration-300`

### Spacing
- **Button gap**: 2px between edit and remove buttons
- **Badge margin**: ml-2 from last element
- **Dialog padding**: p-6 for content, p-4 for footer

---

## Testing Checklist

- [ ] Remove single resource
- [ ] Remove multiple resources
- [ ] Undo removal within timeout
- [ ] Undo removal after timeout (should not work)
- [ ] Edit single field in resource
- [ ] Edit multiple fields in resource
- [ ] Edit multiple resources in same conversation
- [ ] Reset resource to original after editing
- [ ] Generate action plan with edited resources
- [ ] Generate action plan with removed resources excluded
- [ ] Export PDF with edited resources
- [ ] Export PDF without removed resources
- [ ] Edit resource from first conversation in multi-exchange session
- [ ] Remove resource from middle conversation in multi-exchange session
- [ ] Verify original data unchanged in conversationHistory
- [ ] Verify edits persist through action plan generation
- [ ] Verify edits persist through PDF export
- [ ] Test keyboard navigation in edit dialog
- [ ] Test form validation in edit dialog
- [ ] Test mobile touch targets
- [ ] Test with screen reader
- [ ] Test rapid edit/remove/undo actions
- [ ] Test with empty/null field values
- [ ] Test with very long text in fields
- [ ] Test with invalid URLs
- [ ] Test with invalid phone formats

---

## Future Enhancements

1. **Bulk operations**: Select and remove multiple resources at once
2. **Edit history**: Track changes over time with timestamps
3. **Templates**: Save common edits as templates for future use
4. **Collaboration**: Share edited versions with other case managers
5. **Persistent storage**: Save edits to database for recall later
6. **Audit trail**: Log all edits for compliance/review
7. **Smart suggestions**: AI suggestions for improving resource descriptions
8. **Duplicate detection**: Warn if editing creates duplicate resources
9. **Add new resources**: Allow case managers to manually add resources
10. **Reorder resources**: Drag-and-drop to change resource priority

---

## Summary

This design provides case managers with flexible control over generated referrals while maintaining data integrity and a smooth user experience. The non-destructive approach ensures original AI-generated content is preserved, while the intuitive edit/remove UI makes it easy to customize referrals before sharing with clients.

**Key Benefits:**
- Quick removal of irrelevant resources
- Easy correction of outdated information
- Clear visibility into which resources have been modified
- Seamless integration with existing action plan and PDF workflows
- Reversible actions reduce errors
- No impact on original data integrity
