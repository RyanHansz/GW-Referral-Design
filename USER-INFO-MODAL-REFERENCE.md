# User Info Welcome Page Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `ask-for-user-name`
**Related Commits:**
- `8b94460` - feat: add user info modal on first visit
- `25593e3` - fix: prevent password autofill and use consistent blue focus color
- `ff63cd3` - docs: add comprehensive iframe embedding considerations and test page
- `23724ee` - refactor: convert user info modal to dedicated welcome page

---

## Overview

**AI GENERATED, DOUBLE CHECK THINGS**

<!-- Add screenshot here showing the welcome page -->

The user info welcome page collects the case manager's name and email on their first visit to the Goodwill Referral Tool. This information is stored locally to track usage and identify users for support purposes. The welcome page is shown instead of the main app until user information is provided.

**Key Change:** Previously implemented as a blocking modal, now implemented as a dedicated full-page welcome screen. This eliminates all modal-in-iframe issues and provides a cleaner, more professional user experience.

---

## Purpose

### Why This Feature Exists

1. **Usage Tracking**: Identify who is using the tool and how frequently
2. **Support & Feedback**: Connect usage patterns to specific users for troubleshooting
3. **Analytics**: Track adoption across different case managers and teams
4. **User Accountability**: Encourage responsible use by identifying users
5. **Future Enhancements**: Enable personalized settings or saved preferences

### Key Requirements

- **First-visit only**: Welcome page shown once per browser/device
- **Required fields**: Both name and email must be provided
- **Cannot access app**: Main application hidden until user info submitted
- **Local storage**: Information saved in browser, not sent to server
- **No password autofill**: Prevents browser password managers from interfering
- **Consistent styling**: Uses app's blue theme for focus states
- **Professional design**: Gradient background with centered card layout
- **Iframe-friendly**: No modal issues - clean full-page experience

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

**Location:** Lines 551-555

```typescript
// User info state
const [userName, setUserName] = useState("")
const [userEmail, setUserEmail] = useState("")
const [userNameInput, setUserNameInput] = useState("")
const [userEmailInput, setUserEmailInput] = useState("")
```

**State Variables:**
- `userName`: Stored user name from localStorage (string)
- `userEmail`: Stored user email from localStorage (string)
- `userNameInput`: Controlled input for name field (string)
- `userEmailInput`: Controlled input for email field (string)

**Why Two Sets of Variables?**
- `userName`/`userEmail`: Persistent values loaded from localStorage - controls which page is shown
- `userNameInput`/`userEmailInput`: Form inputs that get validated before saving

**Key Difference from Modal Approach:**
- No `showUserModal` state needed
- Conditional rendering based directly on `userName` and `userEmail`
- If empty → show welcome page
- If populated → show main app

---

#### **3. First-Visit Detection Logic**

**Location:** Lines 557-566

```typescript
// Check if user has provided info on first load
useEffect(() => {
  const storedUserName = localStorage.getItem("userName")
  const storedUserEmail = localStorage.getItem("userEmail")

  if (storedUserName && storedUserEmail) {
    setUserName(storedUserName)
    setUserEmail(storedUserEmail)
  }
}, [])
```

**Logic Flow:**
1. On component mount, check localStorage for `userName` and `userEmail`
2. If both exist, load them into state → main app will render
3. If either is missing, state remains empty → welcome page will render
4. Empty dependency array `[]` ensures this runs only once on mount

**Key Difference from Modal Approach:**
- No need to explicitly show/hide anything
- Component automatically renders appropriate view based on state
- Cleaner, more declarative code

---

#### **4. Form Submission Handler**

**Location:** Lines 568-575

```typescript
const handleUserInfoSubmit = () => {
  if (userNameInput.trim() && userEmailInput.trim()) {
    localStorage.setItem("userName", userNameInput.trim())
    localStorage.setItem("userEmail", userEmailInput.trim())
    setUserName(userNameInput.trim())
    setUserEmail(userEmailInput.trim())
  }
}
```

**Validation:**
- Checks both fields are non-empty after trimming whitespace
- Only saves if both fields are valid

**Actions:**
1. Save trimmed values to localStorage
2. Update state with saved values
3. Component automatically re-renders showing main app (no manual closing needed)

**Key Difference from Modal Approach:**
- No `setShowUserModal(false)` needed
- State update triggers automatic transition to main app
- React's conditional rendering handles the view switch

---

#### **5. Conditional Rendering & Welcome Page UI**

**Location:** Lines 1904-1987

The component uses an early return pattern for conditional rendering:

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

## Iframe Embedding Considerations

### **⚠️ Important: This Tool Will Be Embedded in an iframe**

The Goodwill Referral Tool is designed to be embedded in iframes across different platforms. This creates specific challenges for the user info modal that need to be addressed.

---

### **Issue #1: Parent Page Can Still Scroll** ⚠️ **HIGH PRIORITY**

**Problem:**
- Modal disables scrolling within the iframe
- Parent page can still scroll freely
- Users can scroll the iframe (with modal) out of view
- Modal is still "open" and blocking, but not visible

**Impact:** Confusing UX - user might think app is frozen

**Current Behavior:**
```
[Parent Page - Can Scroll ✓]
  ↓
  [Iframe with Modal - Cannot Scroll ✗]
```

**Solution Option A - PostMessage API (Recommended):**

Update the modal logic to communicate with parent:

```typescript
// Add to useEffect in app/page.tsx
useEffect(() => {
  if (showUserModal) {
    // Request parent to disable scroll
    window.parent.postMessage({ type: 'disableScroll' }, '*')
  } else {
    // Request parent to enable scroll
    window.parent.postMessage({ type: 'enableScroll' }, '*')
  }

  return () => {
    // Cleanup: re-enable scroll on unmount
    window.parent.postMessage({ type: 'enableScroll' }, '*')
  }
}, [showUserModal])
```

**Parent page must listen:**

```html
<script>
  window.addEventListener('message', (event) => {
    // Verify origin for security
    if (event.origin !== 'https://tools.goodwillcentraltexas.org') return

    if (event.data.type === 'disableScroll') {
      document.body.style.overflow = 'hidden'
    } else if (event.data.type === 'enableScroll') {
      document.body.style.overflow = ''
    }
  })
</script>
```

**Solution Option B - Accept Current Behavior (Simpler):**

Document this as expected behavior and ensure iframe is prominently placed so scrolling it out of view is unlikely.

---

### **Issue #2: localStorage Cross-Origin Isolation** ⚠️ **HIGH PRIORITY**

**Problem:**
- localStorage is scoped to origin (protocol + domain + port)
- If iframe is embedded on different domains, each has separate localStorage
- User will see modal multiple times across different embedding locations

**Example Scenarios:**

| Iframe URL | Embedded On | localStorage Shared? | Modal Frequency |
|-----------|-------------|---------------------|-----------------|
| `https://tools.goodwill.org` | `https://tools.goodwill.org` | ✅ Yes | Once |
| `https://tools.goodwill.org` | `https://www.goodwill.org` | ❌ No | Every embedding |
| `https://tools.goodwill.org` | `https://intranet.org` | ❌ No | Every embedding |
| `https://tools.goodwill.org` | `https://partner-site.com` | ❌ No | Every embedding |

**Impact:** Users may need to provide info multiple times if tool is embedded across different sites

**Solution Option A - URL Parameters (Recommended):**

Parent page passes user info via URL:

```html
<!-- Parent page embeds with user info -->
<iframe src="https://tools.goodwill.org?userName=Sarah%20Johnson&userEmail=sjohnson@goodwill.org"></iframe>
```

Update detection logic:

```typescript
useEffect(() => {
  // Priority 1: Check URL parameters
  const params = new URLSearchParams(window.location.search)
  const urlName = params.get('userName')
  const urlEmail = params.get('userEmail')

  if (urlName && urlEmail) {
    const decodedName = decodeURIComponent(urlName)
    const decodedEmail = decodeURIComponent(urlEmail)

    setUserName(decodedName)
    setUserEmail(decodedEmail)
    localStorage.setItem('userName', decodedName)
    localStorage.setItem('userEmail', decodedEmail)
    return // Don't show modal
  }

  // Priority 2: Check localStorage (same-origin embeddings)
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

**Security Note:** Don't trust URL parameters blindly - validate email format, sanitize inputs.

**Solution Option B - PostMessage API:**

Parent page sends user info via postMessage:

```javascript
// Parent page
const iframe = document.getElementById('goodwillTool')
iframe.addEventListener('load', () => {
  iframe.contentWindow.postMessage({
    type: 'setUserInfo',
    userName: 'Sarah Johnson',
    userEmail: 'sjohnson@goodwill.org'
  }, 'https://tools.goodwillcentraltexas.org')
})
```

Update detection logic:

```typescript
useEffect(() => {
  let userInfoReceived = false

  // Listen for parent sending user info
  const handleMessage = (event) => {
    // Verify origin for security
    if (event.origin !== 'https://parent-site.com') return

    if (event.data.type === 'setUserInfo') {
      userInfoReceived = true
      setUserName(event.data.userName)
      setUserEmail(event.data.userEmail)
      localStorage.setItem('userName', event.data.userName)
      localStorage.setItem('userEmail', event.data.userEmail)
    }
  }

  window.addEventListener('message', handleMessage)

  // Fallback: Show modal if no message received within 500ms
  const timeout = setTimeout(() => {
    if (!userInfoReceived) {
      const storedUserName = localStorage.getItem("userName")
      const storedUserEmail = localStorage.getItem("userEmail")

      if (!storedUserName || !storedUserEmail) {
        setShowUserModal(true)
      }
    }
  }, 500)

  return () => {
    window.removeEventListener('message', handleMessage)
    clearTimeout(timeout)
  }
}, [])
```

**Solution Option C - Accept Multiple Prompts (Simplest):**

Document that users will see modal once per embedding location. Acceptable if tool is only embedded in 1-2 places.

---

### **Issue #3: Modal Height vs Iframe Height** ⚠️ **MEDIUM PRIORITY**

**Problem:**
- Modal is ~450-500px tall
- If iframe has fixed height < 500px, modal may be cut off
- Scrolling within modal works, but not ideal

**Solution:**

Add to DialogContent:

```typescript
<DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
```

**Document iframe requirements:**

```markdown
### Minimum Iframe Dimensions

- **Width:** 400px minimum, 768px recommended
- **Height:** 600px minimum, 800px recommended
- **Scrolling:** Enable with `scrolling="yes"` or CSS `overflow: auto`

### Example Embedding Code

<iframe
  src="https://tools.goodwillcentraltexas.org"
  width="100%"
  height="800"
  style="border: none; min-height: 600px;"
  scrolling="yes"
></iframe>
```

---

### **Issue #4: Focus Trap Boundary** ✅ **NO ISSUE**

**Good News:** Focus trapping works correctly in iframes. Tabbing stays within the modal and cannot escape to parent page.

---

### **Issue #5: Modal Backdrop Coverage** ✅ **NO ISSUE**

**Good News:** Modal backdrop only covers the iframe viewport, not the entire parent page. This is expected and correct behavior.

---

### **Issue #6: Portal Rendering** ✅ **NO ISSUE**

**Good News:** shadcn/ui Dialog uses Radix UI Portal which renders at the end of `document.body`. In an iframe, this is the iframe's body, which is correct.

---

### **Testing in Iframe Context**

A test page has been created at `iframe-test.html` in the project root.

**To test:**

```bash
# Ensure dev server is running
npm run dev

# Open iframe-test.html in browser
open iframe-test.html
# or
firefox iframe-test.html
```

**Test checklist:**

1. ✅ Modal appears on first iframe load
2. ✅ Try scrolling parent page while modal is open
3. ✅ Submit modal, reload iframe → modal should not appear
4. ✅ Clear localStorage, reload → modal appears again
5. ✅ Test different iframe heights (400px, 600px, 800px)
6. ✅ Verify modal is fully visible at 600px+ height
7. ✅ Test in multiple browsers

---

### **Recommended Iframe Embedding Guidelines**

**For Same-Origin Embeddings:**

```html
<iframe
  src="https://tools.goodwillcentraltexas.org"
  width="100%"
  height="900"
  style="border: none; min-height: 600px; border-radius: 8px;"
  title="Goodwill Referral Tool"
  allow="clipboard-write"
></iframe>

<script>
  // Listen for scroll control requests
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://tools.goodwillcentraltexas.org') return

    if (event.data.type === 'disableScroll') {
      document.body.style.overflow = 'hidden'
    } else if (event.data.type === 'enableScroll') {
      document.body.style.overflow = ''
    }
  })
</script>
```

**For Cross-Origin Embeddings:**

```html
<iframe
  src="https://tools.goodwillcentraltexas.org?userName=Sarah%20Johnson&userEmail=sjohnson@goodwill.org"
  width="100%"
  height="900"
  style="border: none; min-height: 600px; border-radius: 8px;"
  title="Goodwill Referral Tool"
  allow="clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
></iframe>
```

**Security Considerations:**

- Always validate `event.origin` in postMessage listeners
- Sanitize and validate URL parameters
- Use HTTPS for iframe src
- Consider CSP (Content Security Policy) headers
- Use `sandbox` attribute with minimal required permissions

---

### **Decision Matrix**

| Approach | Pros | Cons | Recommended? |
|----------|------|------|--------------|
| **URL Parameters** | Simple, works cross-origin, no parent JS needed | Visible in URL, requires parent to know user info | ✅ Yes |
| **PostMessage API** | Secure, flexible, works cross-origin | Requires parent JS, more complex | ✅ Yes |
| **Accept Multiple Prompts** | No changes needed, simplest | Annoying for users | ⚠️ Only if 1-2 embeddings |
| **Parent Scroll Control** | Better UX, prevents confusion | Requires parent cooperation | ✅ Yes |

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
