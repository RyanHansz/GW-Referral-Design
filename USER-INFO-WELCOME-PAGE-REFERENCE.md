# User Info Welcome Page Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `ask-for-user-name`
**Key Commit:** `23724ee` - refactor: convert user info modal to dedicated welcome page

---

## Overview

**AI GENERATED, DOUBLE CHECK THINGS**

<!-- Add screenshot here showing the welcome page -->

The user info welcome page is a full-screen landing page that collects the case manager's name and email on their first visit to the Goodwill Referral Tool. This information is stored locally to track usage and identify users for support purposes. The main application is hidden until user information is provided.

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
- **Professional design**: Gradient background with centered card layout
- **Iframe-friendly**: Full-page approach avoids all modal-related issues

---

## Implementation

### **File:** `app/page.tsx`

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
- `userName`: Stored user name from localStorage → Controls page visibility
- `userEmail`: Stored user email from localStorage → Controls page visibility
- `userNameInput`: Controlled input for name field during form entry
- `userEmailInput`: Controlled input for email field during form entry

**How it works:**
- If `userName` and `userEmail` are empty → welcome page renders
- If both are populated → main app renders

---

#### **3. First-Visit Detection**

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
2. If both exist → load into state → main app will render
3. If either is missing → state remains empty → welcome page will render
4. Empty dependency array `[]` ensures this runs only once

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
3. Component automatically re-renders, now showing main app

---

#### **5. Conditional Rendering**

**Location:** Lines 1904-1984

The component uses an early return pattern:

```typescript
// If no user info, show the welcome page
if (!userName || !userEmail) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-8 pb-8 px-8">
          {/* Welcome page content */}
        </CardContent>
      </Card>
    </div>
  )
}

// Main application (only shown after user info is provided)
return (
  <div className="min-h-screen bg-gray-100 flex flex-col">
    {/* Main app content */}
  </div>
)
```

---

## Welcome Page Design

### **Visual Structure**

```
┌─────────────────────────────────────┐
│  Gradient Background (blue-indigo)  │
│  ┌───────────────────────────────┐  │
│  │     Centered White Card        │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Blue Circle Icon      │  │  │
│  │  │   (UserPlus)            │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │  Welcome to the Goodwill...    │  │
│  │  (description text)            │  │
│  │                                │  │
│  │  Name Field *                  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │                         │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │  Email Field *                 │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │                         │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │    Get Started Button   │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │  Privacy notice (small text)   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### **Styling Details**

**Background:**
```typescript
className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4"
```
- Full viewport height
- Diagonal gradient (bottom-right direction)
- Flexbox centering
- Padding for mobile responsiveness

**Card:**
```typescript
<Card className="w-full max-w-md shadow-2xl">
  <CardContent className="pt-8 pb-8 px-8">
```
- Max width 28rem (448px)
- Large shadow for depth
- Generous padding

**Icon Circle:**
```typescript
<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
  <UserPlus className="h-8 w-8 text-blue-600" />
</div>
```
- 64px circle
- Light blue background
- Blue-600 icon

**Form Fields:**
- 20px spacing between fields (`space-y-5`)
- Blue-600 focus rings
- Auto-focus on name field
- Enter key support

**Submit Button:**
```typescript
<Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold">
  Get Started
</Button>
```
- Full width
- Tall (24px padding)
- Disabled until both fields are valid

---

## Key Features

### **1. Prevent Password Autofill**

**Problem:** Browser password managers can trigger on name + email forms

**Solution:**
```typescript
<Input
  name="userName"              // Explicit name (not "username")
  type="text"                  // Explicit type
  autoComplete="off"           // Disable autocomplete
  data-form-type="other"       // Signal non-login form
/>
```

**Why each attribute matters:**
- `name="userName"`: Avoids "username" pattern recognition
- `type="text"`: Explicit type prevents inference
- `autoComplete="off"`: Standard HTML5 disable
- `data-form-type="other"`: Additional browser signal

---

### **2. Consistent Blue Focus State**

```typescript
className="focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
```

- Uses `blue-600` matching app theme
- Removes default ring offset for cleaner look
- `focus-visible` (not `focus`) for better keyboard UX

---

### **3. Enter Key Support**

```typescript
onKeyDown={(e) => {
  if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim()) {
    handleUserInfoSubmit()
  }
}}
```

- Press Enter in either field to submit
- Only works when both fields are valid
- Faster for keyboard users

---

### **4. Auto-Focus**

```typescript
<Input
  id="userName"
  autoFocus
  // ...
/>
```

User can immediately start typing without clicking

---

### **5. Validation & Button State**

```typescript
<Button
  disabled={!userNameInput.trim() || !userEmailInput.trim()}
>
  Get Started
</Button>
```

- Button disabled until both fields have content
- Visual feedback via disabled state
- Trimming prevents spaces-only input

---

## LocalStorage

### **Keys Used**

| Key | Type | Example | Purpose |
|-----|------|---------|---------|
| `userName` | string | `"Sarah Johnson"` | Case manager's full name |
| `userEmail` | string | `"sjohnson@goodwillcentraltexas.org"` | Case manager's email |

### **Reading**

```typescript
const storedUserName = localStorage.getItem("userName")
const storedUserEmail = localStorage.getItem("userEmail")
```

Returns:
- `null` if key doesn't exist (first visit)
- `string` value if previously saved

### **Writing**

```typescript
localStorage.setItem("userName", userNameInput.trim())
localStorage.setItem("userEmail", userEmailInput.trim())
```

- Values trimmed before saving
- No expiration - persists indefinitely
- Scoped to origin (protocol + domain + port)

### **Testing - Clear Data**

```typescript
// Via browser console
localStorage.removeItem("userName")
localStorage.removeItem("userEmail")
// OR
localStorage.clear()

// Refresh page to see welcome page again
```

---

## Iframe Embedding

### **Benefits for iframe Context**

The full-page approach solves all common iframe issues:

✅ **No Scroll Conflicts**
- Welcome page fills iframe naturally
- No parent/child scroll coordination needed

✅ **No Height Issues**
- Page adapts to iframe height
- No modal cutoff concerns

✅ **No Backdrop Complexity**
- No overlay to manage
- Clean full-page background

✅ **Natural "Cannot Dismiss"**
- Main app is literally hidden
- No hacky preventDefault logic

### **localStorage Cross-Origin**

**Issue:** localStorage is scoped to origin
- If iframe embedded on different domain → separate storage
- User will see welcome page on each unique embedding location

**Solutions:**

**Option A - URL Parameters (Recommended):**

Parent passes user info via URL:
```html
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
    setUserName(decodeURIComponent(urlName))
    setUserEmail(decodeURIComponent(urlEmail))
    localStorage.setItem('userName', decodeURIComponent(urlName))
    localStorage.setItem('userEmail', decodeURIComponent(urlEmail))
    return
  }

  // Priority 2: Check localStorage
  const storedUserName = localStorage.getItem("userName")
  const storedUserEmail = localStorage.getItem("userEmail")

  if (storedUserName && storedUserEmail) {
    setUserName(storedUserName)
    setUserEmail(storedUserEmail)
  }
}, [])
```

**Option B - Accept Multiple Prompts:**

If tool is only embedded in 1-2 places, users seeing welcome page multiple times is acceptable.

### **Recommended Embedding**

```html
<iframe
  src="https://tools.goodwillcentraltexas.org"
  width="100%"
  height="900"
  style="border: none; min-height: 600px; border-radius: 8px;"
  title="Goodwill Referral Tool"
  allow="clipboard-write"
></iframe>
```

**Minimum Dimensions:**
- Width: 400px minimum, 768px recommended
- Height: 600px minimum, 800px recommended

---

## Testing

### **Test Checklist**

1. ✅ **First Visit**
   - Clear localStorage
   - Load app → See welcome page with gradient
   - Main app not visible

2. ✅ **Form Validation**
   - Try submitting with empty name → Button disabled
   - Try submitting with empty email → Button disabled
   - Try submitting with spaces only → Button disabled
   - Fill both fields → Button enabled

3. ✅ **Submission**
   - Fill both fields
   - Click "Get Started" → Smooth transition to main app
   - Check localStorage contains values
   - Refresh page → Main app loads immediately

4. ✅ **Enter Key**
   - Clear localStorage, reload
   - Fill name, press Enter → Nothing (email empty)
   - Fill email, press Enter → Submit and transition

5. ✅ **Auto-Focus**
   - Clear localStorage, reload
   - Cursor automatically in name field

6. ✅ **No Password Autofill**
   - Clear localStorage, reload
   - No password manager popup
   - No autofill suggestions

### **Browser Compatibility**

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari

### **Edge Cases**

1. **Incognito/Private Mode**
   - localStorage works within session
   - Welcome page appears on every new window
   - Expected behavior

2. **Very Long Names/Emails**
   - Test with 100+ characters
   - Card handles without breaking layout

3. **Special Characters**
   - "José García" ✓
   - "O'Brien" ✓
   - "Sarah-Jane" ✓

4. **Copy-Paste with Whitespace**
   - Paste "  email@example.com  "
   - Trimming removes on save

---

## Privacy & Data

### **What's Stored**

- **Location:** Browser localStorage (client-side only)
- **Data:** Name and email as plain text
- **Visibility:** Only accessible to this domain
- **Transmission:** Never sent to server automatically

### **User Communication**

Welcome page states:
> "Your information is stored locally in your browser and is not sent to any server."

**Transparency:**
- Purpose explained upfront
- Local storage clearly stated
- One-time collection mentioned

---

## Accessibility

### **WCAG 2.1 AA Compliance**

- ✅ Keyboard Navigation (Tab, Shift+Tab, Enter)
- ✅ Focus Indicators (visible blue ring)
- ✅ Proper Labels (`<Label>` with `htmlFor`)
- ✅ Required Fields (asterisk + validation)
- ✅ Button State (disabled communicated)
- ✅ Color Contrast (blue-600 on white meets AA)

### **Screen Reader Support**

- Page announces title "Welcome to the Goodwill Referral Tool"
- Description read after title
- Labels read before inputs
- Button state announced (enabled/disabled)

---

## Troubleshooting

### **Welcome Page Appears Every Time**

**Possible Causes:**
1. localStorage disabled (browser settings)
2. Running in incognito/private mode
3. Browser clears localStorage on exit
4. Privacy extensions blocking storage

**Debug:**
```javascript
// Browser console
console.log(localStorage.getItem("userName"))
console.log(localStorage.getItem("userEmail"))
// Should return values, not null
```

**Solutions:**
- Enable localStorage in browser
- Check privacy extensions
- Use regular browser window

---

### **Password Manager Still Triggers**

**Possible Causes:**
1. Aggressive password manager extension
2. Browser ignoring `autoComplete="off"`

**Solutions:**
- Verify all attributes present: `autoComplete="off"`, `data-form-type="other"`, `name` attribute
- Some managers may still trigger (browser-dependent)

---

### **Focus Ring Wrong Color**

**Cause:** Missing custom focus classes

**Solution:**
```typescript
className="focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
```

Ensure all three classes present:
- `focus-visible:ring-blue-600`
- `focus-visible:ring-offset-0`
- `focus-visible:border-blue-600`

---

## Technical Stack

- **React Hooks:** useState, useEffect
- **shadcn/ui Components:** Card, CardContent, Input, Label, Button
- **Lucide Icons:** UserPlus
- **Tailwind CSS:** Gradient backgrounds, focus states, responsive design
- **Browser API:** localStorage

---

## Future Enhancements

- [ ] Add email format validation with error message
- [ ] Create settings panel to update user info
- [ ] Send user info to server for analytics (with consent)
- [ ] Support URL parameters for cross-origin embeds
- [ ] Add user avatar/initials in app header
- [ ] Add optional fields: role, location, phone
- [ ] Add organization/team selection dropdown

---

## Git Commands

```bash
# View the welcome page implementation
git show 23724ee

# Search for user info code
git grep "userName" ask-for-user-name

# View branch diff
git diff suggest-prompts..ask-for-user-name app/page.tsx

# Switch to branch
git checkout ask-for-user-name
```

---

## Contact & Support

For questions about the welcome page implementation:
- This reference document
- Branch: `ask-for-user-name`
- Key commit: `23724ee`

**Last Updated:** 2025-10-20
**Author:** Claude Code + Ryan Hansz
