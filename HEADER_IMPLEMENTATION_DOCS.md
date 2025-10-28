# Header and Feedback Banner Implementation Guide

## Overview
This document specifies the implementation requirements for the feedback banner and page header components for the GenAI Referral Tool.

---

## 1. Feedback Banner Component

### Description
A full-width banner displayed at the top of the page to communicate pilot status and collect user feedback.

### Layout
- Position: Fixed at top of viewport or first element in page layout
- Full width (100% of viewport)
- Background: Light yellow/cream (#FEF3C7 or similar)
- Padding: 16px vertical, 24px horizontal
- Flexbox layout with space-between alignment

### Content

#### Left Section
**Icon:**
- Construction/warning stripes icon
- Size: 40x40px
- Colors: Black stripes on yellow/orange background
- Alternative: Use emoji "🚧" or similar warning icon

**Text Content:**
```
Primary text: "Pilot Version - Work in Progress"
- Font weight: 600 (semibold)
- Font size: 16px
- Color: #92400E (dark orange/brown)

Secondary text: "This tool is being tested with Goodwill staff. Please share feedback if you spot issues or have suggestions!"
- Font weight: 400 (normal)
- Font size: 14px
- Color: #92400E (dark orange/brown)
- Margin top: 4px
```

#### Right Section
**Feedback Button:**
```
Text: "Share Feedback"
Icon: Speech bubble icon (💬) or custom icon, positioned to the left of text
Style:
  - Background: White (#FFFFFF)
  - Border: 1px solid #D97706 (orange)
  - Border radius: 8px
  - Padding: 10px 20px
  - Font size: 14px
  - Font weight: 500 (medium)
  - Color: #92400E (dark orange/brown)
  - Cursor: pointer
  - Shadow: Optional subtle shadow (0 1px 2px rgba(0, 0, 0, 0.05))

Hover state:
  - Background: #FEF3C7 (light yellow)
  - Border color: #B45309 (darker orange)

Active state:
  - Background: #FDE68A (slightly darker yellow)
```

### Responsive Behavior
- Desktop (>768px): Horizontal layout as described
- Mobile (<768px):
  - Stack icon+text and button vertically
  - Button full width
  - Reduce padding to 12px vertical, 16px horizontal

---

## 2. Page Header Component

### Description
The main page header containing the page title, tool branding, and pilot badge.

### Layout
- Background: White (#FFFFFF)
- Padding: 32px horizontal, 24px vertical
- Position: Below feedback banner
- Border bottom: Optional 1px solid #E5E7EB (light gray)

### Content

#### Icon
- Goodwill "G" logo or placeholder
- Size: 60x60px
- Background: Dark blue/teal
- Border radius: 8px
- Position: Inline with text, left side

#### Heading Text
```
"Find Resources"
- Font size: 36px (3xl)
- Font weight: 700 (bold)
- Color: #111827 (near black)
- Line height: 1.2
- Margin bottom: 8px
```

#### Subtitle with Badge
```
"GenAI Referral Tool"
- Display: Inline
- Font size: 20px
- Font weight: 500 (medium)
- Color: #2563EB (blue)
- Text decoration: Underline
- Cursor: pointer (if clickable)

"PILOT" Badge:
- Display: Inline-block
- Background: #FDE68A (light yellow/tan)
- Color: #92400E (dark orange/brown)
- Font size: 12px
- Font weight: 600 (semibold)
- Padding: 4px 12px
- Border radius: 6px
- Margin left: 12px
- Text transform: Uppercase
- Letter spacing: 0.5px
```

### Spacing
- Gap between icon and text: 16px
- Margin bottom of heading: 8px
- Vertical alignment: Center icon with first line of text

### Responsive Behavior
- Desktop (>768px): Layout as described
- Mobile (<768px):
  - Reduce heading to 28px
  - Reduce subtitle to 18px
  - Reduce padding to 16px horizontal

---

## 3. Tab Controls

**Note:** As mentioned by the user, tab controls are already implemented. This section is for reference only.

### Existing Tabs
1. "Find Referrals" - with sparkle/wand icon (✨)
2. "Chat" - with chat bubble icon (💬)

The tabs should be positioned below the header content with appropriate spacing (24px margin top).

---

## 4. Technical Implementation Notes

### Component Structure (React Example)
```jsx
<FeedbackBanner>
  <BannerContent>
    <IconAndText>
      <WarningIcon />
      <TextContent>
        <Title>Pilot Version - Work in Progress</Title>
        <Description>This tool is being tested...</Description>
      </TextContent>
    </IconAndText>
    <FeedbackButton onClick={handleFeedbackClick}>
      <ChatIcon /> Share Feedback
    </FeedbackButton>
  </BannerContent>
</FeedbackBanner>

<PageHeader>
  <LogoAndHeading>
    <Logo />
    <div>
      <Heading>Find Resources</Heading>
      <Subtitle>
        <Link>GenAI Referral Tool</Link>
        <Badge>PILOT</Badge>
      </Subtitle>
    </div>
  </LogoAndHeading>
</PageHeader>
```

### Accessibility Requirements
- Feedback banner should have role="banner" or role="alert" if dynamic
- Feedback button must have clear focus states (outline: 2px solid #2563EB)
- All interactive elements must be keyboard accessible
- Icon alternatives: Use aria-label for icon-only elements
- Color contrast: Ensure text meets WCAG AA standards (4.5:1 for normal text)

### State Management
- Feedback banner dismissible: Consider adding close button (optional)
- Store dismissed state in localStorage to prevent showing on every page load
- Feedback button click handler should open modal/form or navigate to feedback page

---

## 5. CSS Variables (Recommended)

```css
:root {
  /* Banner colors */
  --banner-bg: #FEF3C7;
  --banner-text: #92400E;
  --banner-border: #D97706;

  /* Badge colors */
  --badge-bg: #FDE68A;
  --badge-text: #92400E;

  /* Primary colors */
  --primary-blue: #2563EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

---

## 6. Testing Checklist

- [ ] Banner displays correctly on all screen sizes
- [ ] Feedback button is clickable and triggers expected action
- [ ] Banner is dismissible (if implemented)
- [ ] Header text is readable and properly aligned
- [ ] PILOT badge displays correctly
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] Color contrast meets accessibility standards
- [ ] Component renders correctly in all supported browsers
- [ ] Responsive breakpoints work as expected
