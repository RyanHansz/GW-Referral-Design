# User Info Modal Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `ask-for-user-name`
**Related Commits:**
- `8b94460` - feat: add user info modal on first visit
- `25593e3` - fix: prevent password autofill and use consistent blue focus color

---

## Overview

**AI GENERATED, DOUBLE CHECK THINGS**

<!-- Add screenshot here showing the modal -->

The user info modal collects the case manager's name and email on their first visit to the Goodwill Referral Tool. This information is stored locally to track usage and identify users for support purposes. The modal only appears once per browser/device and cannot be dismissed until information is provided.

---

## Purpose

### Why This Feature Exists

1. **Usage Tracking**: Identify who is using the tool and how frequently
2. **Support & Feedback**: Connect usage patterns to specific users for troubleshooting
3. **Analytics**: Track adoption across different case managers and teams
4. **User Accountability**: Encourage responsible use by identifying users
5. **Future Enhancements**: Enable personalized settings or saved preferences

### Key Requirements

- **First-visit only**: Modal appears once per browser/device
- **Required fields**: Both name and email must be provided
- **Cannot be dismissed**: Modal blocks access until submitted
- **Local storage**: Information saved in browser, not sent to server
- **No password autofill**: Prevents browser password managers from interfering
- **Consistent styling**: Uses app's blue theme for focus states

---

## Implementation Files & Key Locations

### **Main Implementation File**

**File:** `app/page.tsx`

#### **1. Import useEffect Hook**

**Location:** Line 5

```typescript
import { useState, useRef, useCallback, useMemo, useEffect } from "react"
```

**Why:** Needed for checking localStorage on component mount

---

#### **2. State Management**

**Location:** Lines 551-556

```typescript
// User info modal state
const [showUserModal, setShowUserModal] = useState(false)
const [userName, setUserName] = useState("")
const [userEmail, setUserEmail] = useState("")
const [userNameInput, setUserNameInput] = useState("")
const [userEmailInput, setUserEmailInput] = useState("")
```

**State Variables:**
- `showUserModal`: Controls modal visibility (boolean)
- `userName`: Stored user name from localStorage (string)
- `userEmail`: Stored user email from localStorage (string)
- `userNameInput`: Controlled input for name field (string)
- `userEmailInput`: Controlled input for email field (string)

**Why Two Sets of Variables?**
- `userName`/`userEmail`: Persistent values loaded from localStorage
- `userNameInput`/`userEmailInput`: Form inputs that get validated before saving

---

#### **3. First-Visit Detection Logic**

**Location:** Lines 558-569

```typescript
// Check if user has provided info on first load
useEffect(() => {
  const storedUserName = localStorage.getItem("userName")
  const storedUserEmail = localStorage.getItem("userEmail")

  if (storedUserName && storedUserEmail) {
    setUserName(storedUserName)
    setUserEmail(storedUserEmail)
  } else {
    setShowUserModal(true)
  }
}, [])
```

**Logic Flow:**
1. On component mount, check localStorage for `userName` and `userEmail`
2. If both exist, load them into state and don't show modal
3. If either is missing, show the modal (`setShowUserModal(true)`)
4. Empty dependency array `[]` ensures this runs only once on mount

---

#### **4. Form Submission Handler**

**Location:** Lines 571-579

```typescript
const handleUserInfoSubmit = () => {
  if (userNameInput.trim() && userEmailInput.trim()) {
    localStorage.setItem("userName", userNameInput.trim())
    localStorage.setItem("userEmail", userEmailInput.trim())
    setUserName(userNameInput.trim())
    setUserEmail(userEmailInput.trim())
    setShowUserModal(false)
  }
}
```

**Validation:**
- Checks both fields are non-empty after trimming whitespace
- Only saves and closes modal if both fields are valid

**Actions:**
1. Save trimmed values to localStorage
2. Update state with saved values
3. Close the modal

---

#### **5. Modal UI Component**

**Location:** Lines 1905-1965

```typescript
{/* User Info Modal */}
<Dialog open={showUserModal} onOpenChange={() => {}}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-xl">
        <UserPlus className="h-6 w-6 text-blue-600" />
        Welcome to the Goodwill Referral Tool
      </DialogTitle>
      <DialogDescription className="text-base pt-2">
        To help us improve and track usage, please provide your information.
        This will be saved locally and only asked once.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 pt-4">
      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="userName" className="text-sm font-medium">
          Your Name *
        </Label>
        <Input
          id="userName"
          name="userName"
          type="text"
          placeholder="Enter your full name"
          value={userNameInput}
          onChange={(e) => setUserNameInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim()) {
              handleUserInfoSubmit()
            }
          }}
          autoComplete="off"
          data-form-type="other"
          className="w-full focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
          autoFocus
        />
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="userEmail" className="text-sm font-medium">
          Your Email *
        </Label>
        <Input
          id="userEmail"
          name="userEmail"
          type="email"
          placeholder="Enter your email address"
          value={userEmailInput}
          onChange={(e) => setUserEmailInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim()) {
              handleUserInfoSubmit()
            }
          }}
          autoComplete="off"
          data-form-type="other"
          className="w-full focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleUserInfoSubmit}
          disabled={!userNameInput.trim() || !userEmailInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          Get Started
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

## Key Features & Design Decisions

### **1. Cannot Be Dismissed**

**Implementation:**
```typescript
<Dialog open={showUserModal} onOpenChange={() => {}}>
```

**How it works:**
- `open={showUserModal}` controls visibility
- `onOpenChange={() => {}}` - empty function prevents closing via:
  - Clicking outside the modal
  - Pressing Escape key
  - Clicking the X button (default shadcn/ui behavior)

**Why:** Ensures all users provide information before accessing the tool

---

### **2. Prevent Password Autofill**

**Problem:** Browser password managers can trigger autofill prompts on forms with name + email fields

**Solution:** Multiple defensive attributes

```typescript
<Input
  name="userName"          // Explicit name (not "username")
  type="text"              // Explicit type (not inferred)
  autoComplete="off"       // Disable autocomplete
  data-form-type="other"   // Signal this isn't a login form
/>
```

**Why each attribute matters:**
- `name="userName"` (not "username"): Avoids common login form patterns
- `type="text"`: Explicit type prevents browser inference
- `autoComplete="off"`: Standard HTML5 attribute to disable autofill
- `data-form-type="other"`: Additional signal for browser heuristics

---

### **3. Consistent Blue Focus State**

**Implementation:**
```typescript
className="w-full focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
```

**Color Matching:**
- Uses `blue-600` to match selected category cards in the app
- Removes default ring offset for cleaner appearance
- Uses `focus-visible` (not `focus`) for better keyboard navigation UX

**Before vs After:**
- Before: Default teal/green focus ring
- After: Blue-600 matching app theme

---

### **4. Enter Key Support**

**Implementation:**
```typescript
onKeyDown={(e) => {
  if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim()) {
    handleUserInfoSubmit()
  }
}}
```

**Behavior:**
- Pressing Enter in either field submits the form
- Only submits if both fields are valid (non-empty after trim)
- Provides faster UX for keyboard users

---

### **5. Validation & Button State**

**Implementation:**
```typescript
<Button
  onClick={handleUserInfoSubmit}
  disabled={!userNameInput.trim() || !userEmailInput.trim()}
  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
>
  Get Started
</Button>
```

**Validation Rules:**
- Button disabled until both fields have non-whitespace content
- Visual feedback via disabled state
- Trimming prevents "   " (spaces only) from being valid

---

### **6. Auto-Focus Name Field**

**Implementation:**
```typescript
<Input
  id="userName"
  autoFocus
  // ...
/>
```

**Why:** User can immediately start typing their name without clicking

---

## LocalStorage Structure

### **Keys Used**

| Key | Type | Example Value | Purpose |
|-----|------|---------------|---------|
| `userName` | string | `"Sarah Johnson"` | Case manager's full name |
| `userEmail` | string | `"sjohnson@goodwillcentraltexas.org"` | Case manager's email |

### **Reading from localStorage**

```typescript
const storedUserName = localStorage.getItem("userName")
const storedUserEmail = localStorage.getItem("userEmail")
```

**Returns:**
- `null` if key doesn't exist (first visit)
- `string` value if previously saved

### **Writing to localStorage**

```typescript
localStorage.setItem("userName", userNameInput.trim())
localStorage.setItem("userEmail", userEmailInput.trim())
```

**Notes:**
- Values are trimmed before saving
- No expiration date - persists indefinitely
- Scoped to origin (protocol + domain + port)

### **Clearing localStorage (Testing)**

```typescript
// Via browser console
localStorage.removeItem("userName")
localStorage.removeItem("userEmail")
// OR
localStorage.clear()

// Refresh page to see modal again
```

---

## UI/UX Guidelines

### **Modal Appearance**

- **Width:** `sm:max-w-md` (medium modal size)
- **Icon:** UserPlus icon in blue-600
- **Title:** "Welcome to the Goodwill Referral Tool"
- **Description:** Explains purpose and privacy (local storage only)

### **Field Labels**

- Both fields marked with asterisk (*) indicating required
- Labels use `text-sm font-medium`
- Clear hierarchy with proper spacing (`space-y-2`, `space-y-4`)

### **Button Styling**

- Primary blue button: `bg-blue-600 hover:bg-blue-700`
- Disabled state when fields are empty
- Right-aligned for natural flow
- Text: "Get Started" (not "Submit" or "Continue")

### **Accessibility**

- Proper `<Label>` components with `htmlFor` matching input `id`
- Auto-focus on name field for keyboard users
- `focus-visible` for keyboard navigation feedback
- Disabled state properly communicated to screen readers

---

## Testing Recommendations

### **Functional Testing**

1. ✅ **First Visit Experience**
   - Clear localStorage
   - Load app
   - Verify modal appears
   - Cannot dismiss by clicking outside or pressing Escape

2. ✅ **Form Validation**
   - Try submitting with empty name → Button disabled
   - Try submitting with empty email → Button disabled
   - Try submitting with only spaces → Button disabled
   - Fill both fields → Button enabled

3. ✅ **Submission**
   - Fill both fields
   - Click "Get Started" → Modal closes
   - Check localStorage contains `userName` and `userEmail`
   - Refresh page → Modal does not appear

4. ✅ **Enter Key**
   - Clear localStorage, reload
   - Fill name field, press Enter → Nothing happens (email empty)
   - Fill email field, press Enter → Modal closes and saves

5. ✅ **Auto-Focus**
   - Clear localStorage, reload
   - Verify cursor is in name field automatically

6. ✅ **No Password Autofill**
   - Clear localStorage, reload
   - Verify no password manager popup appears
   - Verify no autofill suggestions from password manager

### **Browser Compatibility Testing**

Test in multiple browsers to verify localStorage behavior:

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

### **Edge Cases**

1. **Incognito/Private Mode**
   - localStorage still works within session
   - Modal appears on every new incognito window
   - Expected behavior (by design)

2. **Very Long Names/Emails**
   - Test with 100+ character names
   - Modal should handle without breaking layout
   - Input fields will scroll horizontally if needed

3. **Special Characters**
   - Test with accented characters: "José García"
   - Test with apostrophes: "O'Brien"
   - Test with hyphens: "Sarah-Jane"
   - All should save and load correctly

4. **Multiple Spaces**
   - Input: "   Sarah   Johnson   "
   - Saved: "Sarah   Johnson"
   - Trimming removes leading/trailing only, preserves internal spaces

5. **Copy-Paste with Whitespace**
   - Copy email with trailing space from another app
   - Paste into field
   - Verify trimming removes it on save

---

## Privacy & Data Handling

### **What's Stored**

- **Location:** Browser's localStorage (client-side only)
- **Data:** Name and email as plain text
- **Visibility:** Only accessible to this domain
- **Transmission:** Never sent to server automatically

### **User Communication**

The modal description clearly states:
> "To help us improve and track usage, please provide your information. This will be saved locally and only asked once."

**Key Points:**
- "saved locally" - clarifies client-side storage
- "only asked once" - sets expectation
- Purpose stated upfront - transparency

### **Future Server Integration**

If you want to send this data to a server for tracking:

```typescript
const handleUserInfoSubmit = async () => {
  if (userNameInput.trim() && userEmailInput.trim()) {
    const userData = {
      name: userNameInput.trim(),
      email: userEmailInput.trim(),
      timestamp: new Date().toISOString(),
    }

    // Save to localStorage
    localStorage.setItem("userName", userData.name)
    localStorage.setItem("userEmail", userData.email)

    // Send to server (optional)
    try {
      await fetch("/api/track-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
    } catch (error) {
      console.error("Failed to track user:", error)
      // Don't block user if tracking fails
    }

    setUserName(userData.name)
    setUserEmail(userData.email)
    setShowUserModal(false)
  }
}
```

**Note:** If implementing server tracking, update privacy disclosure in modal description.

---

## Technical Stack

- **React Hooks:** useState, useEffect
- **shadcn/ui Components:**
  - Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
  - Input, Label, Button
- **Lucide Icons:** UserPlus
- **Tailwind CSS:** Styling and focus states
- **Browser API:** localStorage

---

## Related Features

### **Future Enhancements**

1. **Settings Panel:**
   - Allow users to update their name/email
   - View saved information
   - Clear data and restart

2. **Personalization:**
   - Display case manager's name in header
   - "Welcome back, Sarah!"
   - Personalized resource recommendations based on past usage

3. **Usage Analytics:**
   - Track which case managers use which features
   - Identify power users for feedback
   - Correlate user info with action logs

4. **Multi-User Support:**
   - Switch user profiles
   - Different settings per case manager
   - Shared device support

5. **Session Tracking:**
   - Log user sessions with timestamps
   - Track resource generation history per user
   - Export user activity reports

---

## Troubleshooting

### **Modal Appears Every Time**

**Problem:** Modal shows on every page load

**Possible Causes:**
1. localStorage is disabled (browser settings or extensions)
2. Running in incognito/private mode
3. Browser automatically clears localStorage on exit
4. Third-party cookies/storage blocked

**Debugging:**
```javascript
// Open browser console
console.log(localStorage.getItem("userName"))
console.log(localStorage.getItem("userEmail"))
// Should return the saved values, not null
```

**Solutions:**
- Enable localStorage in browser settings
- Check for privacy extensions blocking storage
- Use regular browser window (not incognito)

---

### **Password Manager Still Triggers**

**Problem:** Browser offers to save/autofill passwords despite attributes

**Possible Causes:**
1. Aggressive password manager extensions
2. Browser ignoring `autoComplete="off"`
3. Missing `name` attributes

**Solutions:**
- Verify all attributes are present: `autoComplete="off"`, `data-form-type="other"`, `name` attribute
- Some password managers may still trigger (browser-dependent behavior)
- Consider different input names: `caseManagerName`, `workEmail`

---

### **Focus State Wrong Color**

**Problem:** Focus ring is green/teal instead of blue

**Cause:** Missing custom focus classes

**Solution:**
```typescript
className="w-full focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
```

Ensure all three focus classes are present:
- `focus-visible:ring-blue-600`
- `focus-visible:ring-offset-0`
- `focus-visible:border-blue-600`

---

## Git Commands for Reference

```bash
# View initial modal implementation
git show 8b94460

# View autofill fix and styling updates
git show 25593e3

# Search for modal-related code
git grep "showUserModal" ask-for-user-name

# View branch diff
git diff suggest-prompts..ask-for-user-name

# Switch to the branch
git checkout ask-for-user-name

# View commit history for this feature
git log --oneline --grep="user info"
```

---

## Code Comments

### **Recommended Comments to Add**

```typescript
// ============================================
// USER INFO MODAL - First-time user tracking
// ============================================
// Collects case manager name and email on first visit
// Stored in localStorage, only appears once per browser
// See: USER-INFO-MODAL-REFERENCE.md
// ============================================

const [showUserModal, setShowUserModal] = useState(false)
// ... rest of state
```

### **Function Documentation**

```typescript
/**
 * Handles user info form submission
 * Validates both fields are non-empty, saves to localStorage,
 * updates state, and closes the modal
 */
const handleUserInfoSubmit = () => {
  // ...
}
```

---

## Performance Considerations

### **Impact on Load Time**

- **Minimal:** One localStorage read on mount (~1ms)
- **Non-blocking:** useEffect runs after initial render
- **No network requests:** All client-side

### **Memory Usage**

- **localStorage:** ~100 bytes (name + email strings)
- **React state:** 6 state variables (negligible)
- **No persistence layer:** No database overhead

---

## Accessibility Compliance

### **WCAG 2.1 AA Compliance**

- ✅ **Keyboard Navigation:** Tab, Shift+Tab, Enter work correctly
- ✅ **Focus Indicators:** Visible blue focus ring
- ✅ **Labels:** All inputs have associated `<Label>` elements
- ✅ **Required Fields:** Marked with asterisk, enforced via validation
- ✅ **Button State:** Disabled state properly communicated
- ✅ **Color Contrast:** Blue-600 on white meets AA standards

### **Screen Reader Support**

- Dialog announces "Welcome to the Goodwill Referral Tool"
- Description read after title
- Labels read before input fields
- Button state announced (enabled/disabled)
- "Get Started" button clearly labeled

---

## Known Limitations

1. **No Email Validation:** Only checks non-empty, doesn't verify format
   - Could add regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

2. **No Server-Side Tracking:** Data only stored locally
   - Users can clear localStorage
   - No cross-device persistence

3. **No Update Mechanism:** Once saved, no UI to change info
   - Would need settings panel or "Edit Profile" feature

4. **Single User Per Browser:** No multi-user support
   - Shared computers would need user switching

5. **Incognito Mode:** Modal appears every session
   - By design (localStorage isolated per session)

---

## Future Improvements

- [ ] Add email format validation with helpful error message
- [ ] Create settings panel to view/edit user info
- [ ] Send user info to server for analytics (with consent)
- [ ] Add "Remember me on this device" checkbox
- [ ] Support multiple user profiles per browser
- [ ] Add user avatar/initials display in header
- [ ] Export user activity logs for administrators
- [ ] Add optional fields: role, location, phone number
- [ ] Implement "Skip" option with limited functionality
- [ ] Add organization/team selection dropdown

---

## Contact & Support

For questions about the user info modal implementation, review:
- This reference document
- Branch: `ask-for-user-name`
- Commits: `8b94460`, `25593e3`

**Last Updated:** 2025-10-20
**Author:** Claude Code + Ryan Hansz
