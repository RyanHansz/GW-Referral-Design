# User Info Welcome Page Reference

**Branch:** `ask-for-user-name`
**Last Updated:** 2025-10-21

---

## Overview

A full-screen welcome page that collects the case manager's name and email on their first visit. The information is stored locally (localStorage) and the main application remains hidden until submitted.

### Purpose
- Track who is using the tool
- Enable support and feedback
- Prevent anonymous usage
- Future: personalized settings

---

## Design Specs

### Visual Layout

```
┌─────────────────────────────────────┐
│   Dark Gray Background (gray-800)   │
│  ┌───────────────────────────────┐  │
│  │      White Card (max-w-md)     │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Goodwill Logo (72×72)  │  │  │
│  │  └─────────────────────────┘  │  │
│  │                                │  │
│  │  Welcome to the Goodwill...    │  │
│  │  (description text)            │  │
│  │                                │  │
│  │  Your Name *                   │  │
│  │  [white input field]           │  │
│  │                                │  │
│  │  Your Goodwill Email *         │  │
│  │  [white input field]           │  │
│  │  (error message if invalid)    │  │
│  │                                │  │
│  │  [Get Started Button]          │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Colors & Typography

**Background:** `bg-gray-800` - Dark gray full-screen

**Card:**
- Background: White
- Max width: `28rem` (448px)
- Shadow: `shadow-2xl`
- Padding: `pt-8 pb-8 px-8` (32px)

**Logo:**
- Size: 72px × 72px
- Centered with `mx-auto`
- Bottom margin: 16px

**Heading:**
- Text: "Welcome to the Goodwill Referral Tool"
- Size: `text-2xl` (24px)
- Weight: `font-bold`
- Color: `text-gray-900`
- Bottom margin: 8px

**Description:**
- Text: "To help us understand how this tool is being used and make improvements, please provide your name and email."
- Size: `text-base` (16px)
- Color: `text-gray-600`

**Form Spacing:** `space-y-5` (20px between fields)

### Input Fields

**Default State:**
```css
bg-white
focus-visible:ring-blue-600
focus-visible:ring-offset-0
focus-visible:border-blue-600
```

**Error State (Email only):**
```css
border-red-500
focus-visible:ring-red-500
focus-visible:border-red-500
```

**Labels:**
- "Your Name *"
- "Your Goodwill Email *"
- Size: `text-sm`
- Color: `text-gray-700`
- Weight: `font-medium`

**Placeholders:**
- Name: "Enter your full name"
- Email: "Enter your Goodwill email address"

**Error Message:**
- Text: "Email is required" or "Please enter a valid email address"
- Size: `text-sm`
- Color: `text-red-600`
- Position: Below email input with `mt-1`

### Button

**"Get Started" Button:**
```css
w-full
bg-blue-600
hover:bg-blue-700
text-white
py-6 (24px padding)
text-base
font-semibold
```

**Disabled State:**
- Lower opacity (automatic)
- Cursor: not-allowed
- Triggers when:
  - Name is empty
  - Email is empty
  - Email format is invalid

---

## UX Behavior

### First Visit Flow
1. User loads app → Sees welcome page
2. Name field auto-focused (cursor ready)
3. User fills name
4. User fills email → Validation triggers on blur
5. Button enables when both valid
6. User clicks "Get Started" or presses Enter
7. Page transitions to main app
8. Future visits → Skip directly to main app

### Email Validation

**Triggers:**
- On blur (when user leaves email field)
- On change (after first blur - real-time feedback)

**Validation Rules:**
- Must have text before `@`
- Must have `@` symbol
- Must have domain after `@`
- Must have extension (e.g., `.org`, `.com`)

**Valid Examples:**
- `sarah@goodwill.org`
- `john.doe@goodwillcentraltexas.org`

**Invalid Examples:**
- `user` (no @)
- `user@domain` (no extension)
- `@goodwill.org` (no username)

### Keyboard Support
- **Tab/Shift+Tab:** Navigate between fields
- **Enter:** Submit form (if all fields valid)
- **Auto-focus:** Name field focused on load

### Password Manager Prevention
Prevents browser password managers from triggering:
- `name="userName"` (not "username")
- `type="text"` for name field
- `type="email"` for email field
- `autoComplete="off"` on both fields
- `data-form-type="other"` attribute

---

## Implementation Notes

### State Variables
```typescript
// Control page visibility
userName, userEmail → from localStorage

// Control form inputs
userNameInput, userEmailInput → current values

// Email validation
userEmailError → error message
userEmailTouched → whether user has interacted with email field
```

### Conditional Rendering
```typescript
if (!userName || !userEmail) {
  return <WelcomePage />
}
return <MainApp />
```

### localStorage Keys
- `userName` - Case manager's full name
- `userEmail` - Case manager's email

**Testing:** Clear with `localStorage.clear()` in browser console

---

## Accessibility (WCAG 2.1 AA)

✅ **Keyboard Navigation**
- Tab order: Name → Email → Button
- Enter key submits form

✅ **Focus Indicators**
- Visible blue ring on focus
- No ring offset for cleaner appearance

✅ **Labels & Required Fields**
- Proper `<Label>` with `htmlFor`
- Asterisk (*) indicates required
- Error messages for validation

✅ **Button States**
- Disabled state clearly communicated
- Visual and functional feedback

✅ **Color Contrast**
- Blue-600 on white meets AA standard
- Red-600 for errors meets AA standard

✅ **Screen Reader Support**
- Heading announces page title
- Labels read before inputs
- Button state announced

---

## Testing Checklist

### First Visit
- [ ] Welcome page displays with dark gray background
- [ ] Logo centered at top
- [ ] Input fields have white backgrounds
- [ ] Name field auto-focused
- [ ] Button disabled initially

### Form Validation
- [ ] Empty name → button disabled
- [ ] Empty email → button disabled
- [ ] Invalid email format → button disabled + red border + error message
- [ ] Valid inputs → button enabled

### Interaction
- [ ] Enter key submits when valid
- [ ] Enter key does nothing when invalid
- [ ] Email error shows after blur
- [ ] Email error clears when corrected
- [ ] Smooth transition to main app after submit
- [ ] Refresh page → main app loads immediately (no welcome page)

### Edge Cases
- [ ] Very long names (100+ chars) - layout doesn't break
- [ ] Special characters work (José, O'Brien, etc.)
- [ ] Copy-paste with whitespace - trimmed on save
- [ ] Incognito mode - welcome page appears each session

---

## Iframe Embedding

### Benefits
✅ No scroll conflicts
✅ No height cutoff issues
✅ No modal backdrop complexity
✅ Natural "cannot dismiss" behavior

### Recommended Dimensions
- **Width:** 400px minimum, 768px recommended
- **Height:** 600px minimum, 800px recommended

### Cross-Origin Note
If embedded on different domain, localStorage is separate. User will see welcome page on each unique embedding location. To avoid: pass user info via URL parameters.

---

## Future Enhancements

- [x] ~~Email format validation~~ ✅
- [x] ~~Inline error messages~~ ✅
- [ ] Settings panel to update user info
- [ ] Server-side analytics (with consent)
- [ ] URL parameter support for cross-origin iframes
- [ ] User avatar/initials in app header
