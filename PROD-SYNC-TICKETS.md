# Production Sync Tickets

Compare prod version with current repo to identify features/improvements to port to production.

## UI/UX Enhancements

### TICKET-001: Add Structured Resource Cards
**Priority:** High
**Status:** To Do
**Description:** Replace simple list view with detailed resource cards showing structured fields
- Current Prod: Simple list with description, address, phone
- Target: Structured cards with dedicated sections for:
  - Eligibility requirements (📋 icon)
  - Services provided (📚 icon for training, 💼 for jobs, etc.)
  - Support available (💰 icon)
  - Contact info (📞 icon)
- Reference: `app/page.tsx` lines 2687-2724

### TICKET-002: Add Resource Category Badges
**Priority:** Medium
**Status:** To Do
**Description:** Add visual category badges to resource cards
- Current Prod: Text label "External"
- Target: Color-coded badges with icons for each category:
  - GCTA Trainings (graduation cap icon, blue)
  - CAT Trainings (blue)
  - Job Postings (briefcase icon, green)
  - Government Benefits (building icon, purple)
  - Local Community Resources (users icon, orange)
  - Goodwill Resources & Programs (heart icon, pink)
- Reference: `app/page.tsx` lines 2674-2683

### TICKET-003: Add Multiple View Tabs
**Priority:** Medium
**Status:** To Do
**Description:** Add tabbed interface for different result views
- Current Prod: Single list view
- Target: Multiple tabs:
  - Text Summary (brief overview)
  - Detailed Cards (current default)
  - Chat Mode (conversational interface)
- Reference: `app/page.tsx` activeTab state

### TICKET-004: Add Language Selection Dropdown
**Priority:** High
**Status:** To Do
**Description:** Add language selector for multi-language support
- Current Prod: English only
- Target: Dropdown with 7 languages:
  - English (default)
  - Spanish
  - French
  - Mandarin Chinese
  - Vietnamese
  - Arabic
  - Italian
- Apply to both resource generation and action plans
- Reference: `app/page.tsx` lines 2170-2183, `LANGUAGE-SELECTION-REFERENCE.md`

### TICKET-005: Add Sub-Category Filters
**Priority:** Medium
**Status:** To Do
**Description:** Expand category filters to include sub-categories
- Current Prod: Top-level categories only
- Target: Two-level filtering system:
  - Main categories (existing)
  - Sub-categories that appear when main category selected
    - Example: "Local Community Resources" → "Food & Nutrition", "Housing & Shelter", "Healthcare Services", etc.
- Reference: `app/api/generate-referrals/route.ts` lines 15-71, `SUB-CATEGORY-FILTERS-REFERENCE.md`

### TICKET-006: Show Active Filters in Referral Prompt
**Priority:** Medium
**Status:** To Do
**Description:** Display active filters above search results for better context
- Current Prod: Filters are applied but not visible in results
- Target: "Active Filters:" section showing:
  - 🏛️ funnel icon
  - Categories selected (e.g., "Government Benefits")
  - Sub-categories if any
  - Other filter criteria
- Helps users understand why certain results are shown/hidden
- Reference: Screenshot shows "Active Filters: Categories: Government Benefits"

## Feature Additions

### TICKET-007: Improve Action Plan Design
**Priority:** Medium
**Status:** To Do
**Description:** Enhance action plan UI with separate components for better organization
- Current: Action plan and resource guides combined in single view
- Target: Separate components with carousel navigation:
  - Action Plan Summary (dedicated component)
  - Individual Resource Guides (carousel view for multiple resources)
  - Clear navigation between guides with indicators
  - Better visual hierarchy and spacing
- Improves readability for multi-resource action plans
- Reference: `app/api/generate-action-plan/route.ts`

### TICKET-008: Add Chat Mode
**Priority:** Medium
**Status:** To Do
**Description:** Add conversational AI chat interface for Q&A about programs
- Feature: Alternative to structured search, allows natural conversation
- Powered by GPT-5-mini with web search
- Maintains context across conversation
- Includes trusted source list for accurate information
- Reference: `app/api/chat/route.ts`, `CHAT-MODE-REFERENCE.md`

### TICKET-009: Add Follow-Up Questions for Resources
**Priority:** High
**Status:** To Do
**Description:** Add suggested follow-up questions after resource results
- Current Prod: Dead-end after results
- Target:
  - Show 3-4 suggested follow-up questions based on resources returned
  - Allow users to ask custom follow-up questions
  - Maintain conversation context
- Reference: `app/page.tsx` suggestedFollowUps state

### TICKET-010: Add Follow-Up Questions for Action Plans
**Priority:** Medium
**Status:** To Do
**Description:** Add follow-up question interface for action plans
- Current: Action plans are one-way, no ability to ask clarifying questions
- Target: Interactive follow-up interface showing:
  - "Ask a follow-up question:" heading
  - Text area with placeholder: "Ask for more specific information, clarify details, or request additional resources..."
  - "Ask Follow-Up" button with message icon
  - Context-aware responses based on action plan content
- Allows case managers to clarify steps, get more details, or adapt plans
- Reference: Screenshot of follow-up interface

### TICKET-011: Add Streaming Resource Display
**Priority:** Medium
**Status:** To Do
**Description:** Show resources progressively as they're generated
- Current Prod: Wait for all results, then show
- Target: Display resources one-by-one as LLM generates them
- Improves perceived performance
- Shows status messages during generation
- Reference: `app/api/generate-referrals/route.ts` streaming implementation

### TICKET-012: Allow Staff to Edit/Remove Generated Listings
**Priority:** Medium
**Status:** To Do
**Description:** Give case managers ability to curate generated referral list before sharing
- Current: Generated resources are fixed, no ability to modify or remove
- Target: Interactive list management:
  - Remove button/icon on each resource card (X or trash icon)
  - Optional: Edit capability to modify specific fields
  - Optional: Reorder resources by dragging
  - Visual indication of removed items (fade out/slide away)
  - Undo capability for accidental removals
- Use cases:
  - Remove irrelevant or duplicate resources
  - Remove resources client already tried
  - Customize list for specific client needs
- Helps staff personalize recommendations before generating action plans

### TICKET-013: Add Pilot/Beta Banner
**Priority:** High
**Status:** To Do
**Description:** Add prominent banner at top of page indicating pilot status
- Current Prod: No banner visible
- Target: Amber/yellow banner with:
  - 🚧 construction emoji icon
  - "Pilot Version - Work in Progress" heading
  - Description: "This tool is being tested with Goodwill staff. Please share feedback if you spot issues or have suggestions!"
  - "Share Feedback" button that opens email to feedback@goodwillcentraltexas.org
- Visual: Amber background (#FEF3C7), amber border, amber text
- Reference: `app/page.tsx` lines 1885-1911

### TICKET-014: Add Header with Goodwill Branding
**Priority:** High
**Status:** To Do
**Description:** Add header section with logo and tool title
- Current Prod: Missing header content
- Target: Header showing:
  - Goodwill logo (white rounded square with shadow)
  - "Find Resources" heading (h2, bold)
  - "GenAI Referral Tool" subtitle (blue text)
  - "PILOT" badge (amber badge with border)
- Reference: `app/page.tsx` lines 1920-1942

## LLM Prompt Improvements

### TICKET-015: Add GCTA Class Dates Field
**Priority:** High
**Status:** To Do
**Description:** Separate class start/end dates from eligibility for GCTA/CAT courses
- Current: Dates mixed with eligibility requirements
- Target: Dedicated "Class Dates" field showing:
  - Start and end dates
  - Schedule (Mon-Fri 7am-3pm, etc.)
- Makes scheduling information more visible
- Reference: PR #4 (`gcta-resource-updates` branch)

### TICKET-016: Require Full Campus Addresses for GCTA/CAT
**Priority:** Medium
**Status:** To Do
**Description:** Update LLM prompt to require specific campus addresses
- Current: Generic "Austin, TX" addresses
- Target: Full street address with ZIP code
- Example: "1015 Norwood Park Blvd, Austin, TX 78758"
- Prompt includes explicit search instructions
- Reference: PR #4, `app/api/generate-referrals/route.ts` lines 211-212

### TICKET-017: Require Authoritative .gov Sources for Government Benefits
**Priority:** High
**Status:** To Do
**Description:** Ensure government benefit listings link to official .gov websites only
- Current: May link to third-party explanation sites
- Target: Only official government sources:
  - SNAP: hhs.texas.gov/services/food/snap-food-benefits
  - Medicaid: hhs.texas.gov/services/health/medicaid-chip
  - TANF, WIC, Housing, Social Security, Unemployment (all official .gov)
- Include specific eligibility details (income limits, household size)
- Include specific benefit amounts
- Reference: `gov-services-improve-listings` branch (not yet merged)

### TICKET-018: Prevent Generic Hours Text for GCTA
**Priority:** Low
**Status:** To Do
**Description:** Remove unhelpful "Hours: Varies by class; call for details" from contact info
- Handled through LLM prompt instructions, not frontend filtering
- Reference: PR #4

## Backend Improvements

### TICKET-019: Switch to GPT-5-mini for Resource Generation
**Priority:** Medium
**Status:** To Do
**Description:** Update model from gpt-5 to gpt-5-mini for cost/speed optimization
- Current: May be using older or different model
- Target: gpt-5-mini for:
  - Resource generation
  - Follow-up questions
  - Chat mode
- Still use gpt-5 for action plans (if quality needed)
- Reference: PR #4, `LLM-PROMPTS-REFERENCE.md`

### TICKET-020: Add Web Search Integration
**Priority:** High
**Status:** To Do
**Description:** Enable web search for LLM to verify URLs and find current information
- Critical for preventing hallucinated/404 URLs
- Search context size: "low" for speed
- Used for all endpoints (referrals, follow-ups, action plans, chat)
- Reference: All route files use `openai.tools.webSearch()`

### TICKET-021: Implement Progressive Streaming for Multiple Resources
**Priority:** Medium
**Status:** To Do
**Description:** Stream resources individually as they're generated (not all at once)
- Improves UX by showing results faster
- Technical implementation using TransformStream
- Sends JSON chunks: metadata, resources (one at a time), followups, complete
- Reference: `app/api/generate-referrals/route.ts` lines 296-459

## Content/Data Improvements

### TICKET-022: Add Goodwill Program Context File
**Priority:** High
**Status:** To Do
**Description:** Load Goodwill program details from external file instead of inline
- Allows updating program info without code changes
- File: `lib/goodwill-context.txt`
- Loaded via `lib/context-loader.ts`
- Injected into all LLM prompts
- Reference: `lib/context-loader.ts`

### TICKET-023: Add Trusted Sources List to Chat Mode
**Priority:** Medium
**Status:** To Do
**Description:** Provide chat LLM with curated list of trusted organizations/websites
- Helps LLM prioritize reliable information sources
- Includes Texas HHS, TWC, ACC, GCTA, nonprofit organizations
- Reference: `app/api/chat/route.ts` lines 143-169

## Testing & Quality

### TICKET-024: Test Multi-Language Output
**Priority:** Medium
**Status:** To Do
**Description:** Verify all 7 languages generate properly formatted resources
- Test each language for:
  - Bilingual titles
  - Translated field labels
  - Proper character encoding
- Reference: `LANGUAGE-SELECTION-REFERENCE.md`

### TICKET-025: Test Government Benefits Generation
**Priority:** High
**Status:** To Do
**Description:** Verify government benefit resources use .gov sources only
- Test SNAP, Medicaid, TANF, WIC, Housing, SSA, Unemployment
- Verify income limits, household size requirements included
- Verify specific benefit amounts included
- No third-party sites like benefits.gov

### TICKET-026: Test GCTA/CAT Resource Format
**Priority:** High
**Status:** To Do
**Description:** Verify GCTA/CAT resources show proper structure
- Class dates appear separately (not in eligibility)
- Full campus address included (not "Austin, TX")
- No generic "Hours: Varies by class" text
- Actual class schedules from web search

---

## Summary by Priority

**High Priority (11 tickets):**
- TICKET-001: Structured Resource Cards
- TICKET-004: Language Selection
- TICKET-009: Follow-Up Questions for Resources
- TICKET-013: Pilot/Beta Banner
- TICKET-014: Header with Goodwill Branding
- TICKET-015: GCTA Class Dates Field
- TICKET-017: Government .gov Sources
- TICKET-020: Web Search Integration
- TICKET-022: Goodwill Context File
- TICKET-025: Test Government Benefits
- TICKET-026: Test GCTA/CAT Format

**Medium Priority (13 tickets):**
- TICKET-002: Category Badges
- TICKET-003: Multiple View Tabs
- TICKET-005: Sub-Category Filters
- TICKET-006: Show Active Filters
- TICKET-007: Improve Action Plan Design
- TICKET-008: Chat Mode
- TICKET-010: Follow-Up Questions for Action Plans
- TICKET-011: Streaming Display
- TICKET-012: Allow Staff to Edit/Remove Listings
- TICKET-016: Full Campus Addresses
- TICKET-019: Switch to GPT-5-mini
- TICKET-021: Progressive Streaming
- TICKET-023: Trusted Sources List
- TICKET-024: Test Multi-Language

**Low Priority (1 ticket):**
- TICKET-018: Prevent Generic Hours

---

**Last Updated:** 2025-10-22
**Created By:** Claude Code Analysis
