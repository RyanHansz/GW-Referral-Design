# JIRA Ticket: Implement Feedback Banner and Page Header

## Title
Add Pilot Feedback Banner and Update Page Header

## Type
Task / Feature

## Priority
Medium

## Description

Implement a feedback collection banner at the top of the GenAI Referral Tool to inform users this is a pilot version and collect their feedback via a Google Form. The banner should appear site-wide and provide a clear call-to-action for users to share their experiences.

This ticket also includes ensuring the page header properly displays the Goodwill logo, page title, and pilot badge according to the design specifications.

## Background

The GenAI Referral Tool is currently in pilot testing with Goodwill staff. We need a visible way to:
1. Communicate that this is a work-in-progress pilot version
2. Encourage users to provide feedback about their experience
3. Direct feedback to a centralized Google Form for analysis

## Acceptance Criteria

### Feedback Banner
- [ ] Banner appears at the top of all pages
- [ ] Banner has construction/warning icon on the left
- [ ] Banner displays text: "Pilot Version - Work in Progress" as primary heading
- [ ] Banner displays subtext: "This tool is being tested with Goodwill staff. Please share feedback if you spot issues or have suggestions!"
- [ ] Banner includes "Share Feedback" button with speech bubble icon
- [ ] Clicking "Share Feedback" opens Google Form (https://forms.gle/nfBWHpVbXT1kdSX3A) in new tab
- [ ] Button shows pointer cursor on hover
- [ ] Banner uses amber/yellow color scheme (#FEF3C7 background)
- [ ] Banner is responsive and stacks vertically on mobile (<768px)

### Page Header
- [ ] Goodwill logo displays from `/goodwill-logo.svg`
- [ ] Logo appears in white rounded container with shadow
- [ ] Page title "Find Resources" displays prominently
- [ ] Subtitle "GenAI Referral Tool" appears with blue underline
- [ ] "PILOT" badge displays next to subtitle in tan/yellow (#FDE68A)
- [ ] Header is responsive on mobile devices

### Technical Requirements
- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are clearly visible
- [ ] WCAG AA color contrast standards met
- [ ] Works in all supported browsers (Chrome, Firefox, Safari, Edge)
- [ ] No console errors or warnings

## Technical Details

### Implementation Notes

**Feedback Banner Component:**
```jsx
<div className="bg-amber-50 border-b border-amber-200 px-6 py-4">
  <div className="flex items-center justify-between gap-4">
    {/* Left section with icon and text */}
    <div className="flex items-start gap-3">
      <div className="text-2xl">🚧</div>
      <div>
        <p className="font-semibold text-amber-900">Pilot Version - Work in Progress</p>
        <p className="text-sm text-amber-900">
          This tool is being tested with Goodwill staff. Please share feedback if you spot issues or have suggestions!
        </p>
      </div>
    </div>

    {/* Right section with button */}
    <Button
      variant="outline"
      className="bg-white hover:bg-amber-50 border-amber-300 text-amber-900 cursor-pointer"
      onClick={() => window.open("https://forms.gle/nfBWHpVbXT1kdSX3A", "_blank")}
    >
      <MessageCircle className="w-4 h-4" />
      Share Feedback
    </Button>
  </div>
</div>
```

**Logo Implementation:**
- File path: `public/goodwill-logo.svg`
- Import using Next.js Image component
- Source: `/goodwill-logo.svg`
- Dimensions: 48x48px
- Alt text: "Goodwill Central Texas"

### Color Specifications

**Banner:**
- Background: `#FEF3C7` (bg-amber-50)
- Text: `#92400E` (text-amber-900)
- Button border: `#D97706` (border-amber-300)
- Button hover: `#FEF3C7` (hover:bg-amber-50)

**Badge:**
- Background: `#FDE68A`
- Text: `#92400E`

### Responsive Breakpoints
- Desktop: `>768px` - Horizontal layout
- Mobile: `<768px` - Vertical stack, full-width button

## Resources

### Documentation
- Full implementation guide: [HEADER_IMPLEMENTATION_DOCS.md](https://github.com/RyanHansz/GW-Referral-Design/blob/main/HEADER_IMPLEMENTATION_DOCS.md)
- Contains complete styling specs, accessibility requirements, and testing checklist

### Design Reference
- Screenshot provided by product team showing final design
- Google Form link: https://forms.gle/nfBWHpVbXT1kdSX3A

### Assets
- Logo file: [goodwill-logo.svg](https://github.com/RyanHansz/GW-Referral-Design/blob/main/public/goodwill-logo.svg) in `public/` directory
- Icons: MessageCircle from existing icon library

## Testing Instructions

1. **Visual Testing:**
   - Verify banner appears on all pages
   - Check responsive behavior at 768px breakpoint
   - Confirm all colors match specifications
   - Verify logo displays correctly

2. **Functional Testing:**
   - Click "Share Feedback" button
   - Confirm Google Form opens in new tab
   - Verify correct form loads (https://forms.gle/nfBWHpVbXT1kdSX3A)
   - Test button cursor changes to pointer on hover

3. **Accessibility Testing:**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Check color contrast with accessibility tools
   - Test with screen reader

4. **Cross-browser Testing:**
   - Test in Chrome, Firefox, Safari, and Edge
   - Verify consistent appearance and behavior

## Definition of Done

- [ ] Code implemented and passes all acceptance criteria
- [ ] Visual design matches specifications
- [ ] All tests pass (visual, functional, accessibility, cross-browser)
- [ ] Code reviewed and approved
- [ ] No accessibility violations
- [ ] Documentation updated if needed
- [ ] Deployed to staging environment
- [ ] Product owner approval obtained

## Estimated Effort
3-5 hours

## Dependencies
- Existing Button component
- MessageCircle icon from icon library
- Goodwill logo SVG (already available)

## Notes for QA
- Focus on testing the feedback button - it must open the correct Google Form
- Verify cursor changes to pointer on button hover (this was an issue in initial implementation)
- Test banner visibility across different pages/routes
- Confirm banner doesn't interfere with existing page content or navigation

## Related Documentation
- [HEADER_IMPLEMENTATION_DOCS.md](https://github.com/RyanHansz/GW-Referral-Design/blob/main/HEADER_IMPLEMENTATION_DOCS.md) - Complete implementation guide
- [Repository](https://github.com/RyanHansz/GW-Referral-Design) - GW Referral Design
- Design system documentation (if applicable)
