# Improvement Backlog

Compare prod version with current repo to identify features/improvements to port to production.

## UI/UX Enhancements

### TICKET-001: Add Structure to Resource Cards
<img width="1175" height="714" alt="Screenshot 2025-10-22 at 4 10 50 PM" src="https://github.com/user-attachments/assets/7d1f49d0-61f3-4fd1-b779-e1dc0de191c9" />

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

### TICKET-002: Add More Resource Category Badges
<img width="183" height="50" alt="Screenshot 2025-10-22 at 4 11 06 PM" src="https://github.com/user-attachments/assets/ef2a65e2-fd97-4a45-826d-12030814f6d5" />

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


### TICKET-004: Add Language Selection 
<img width="1005" height="374" alt="Screenshot 2025-10-22 at 4 11 37 PM" src="https://github.com/user-attachments/assets/00f3dff2-5c91-4f25-ad8d-d294fb629ef3" />
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
<img width="1208" height="649" alt="Screenshot 2025-10-22 at 4 12 20 PM" src="https://github.com/user-attachments/assets/2fa435b0-bb6c-4533-b0db-311143bb3eb5" />
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
<img width="801" height="168" alt="Screenshot 2025-10-22 at 4 12 42 PM" src="https://github.com/user-attachments/assets/0a872368-9a11-4bf5-80a4-b86f134a885f" />
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
<img width="1407" height="916" alt="Screenshot 2025-10-22 at 4 13 29 PM" src="https://github.com/user-attachments/assets/f69ee8f8-d376-4399-90c5-b68e6a4d0145" />

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
<img width="1728" height="799" alt="Screenshot 2025-10-22 at 4 13 46 PM" src="https://github.com/user-attachments/assets/fa696a11-2cf3-459f-af0c-ae767c593359" />
**Priority:** Medium
**Status:** To Do
**Description:** Add conversational AI chat interface for Q&A about programs
- Feature: Alternative to structured search, allows natural conversation
- Powered by GPT-5-mini with web search
- Maintains context across conversation
- Includes trusted source list for accurate information
- Reference: `app/api/chat/route.ts`, `CHAT-MODE-REFERENCE.md`

### TICKET-009: Add Follow-Up Questions for Resources
<img width="899" height="471" alt="Screenshot 2025-10-22 at 4 17 45 PM" src="https://github.com/user-attachments/assets/0c8d9172-c124-43ca-a1a1-54361d3d55af" />
**Priority:** High
**Status:** To Do
**Description:** Add suggested follow-up questions after resource results
- Current Prod: Dead-end after results
- Target:
  - Show 3-4 suggested follow-up questions based on resources returned
  - Allow users to ask custom follow-up questions
  - Maintain conversation context
- Reference: `app/page.tsx` suggestedFollowUps state

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
<img width="778" height="80" alt="Screenshot 2025-10-22 at 4 18 33 PM" src="https://github.com/user-attachments/assets/e83c0f51-29c1-4013-b214-e3afa538f0ca" />

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
<img width="791" height="337" alt="Screenshot 2025-10-22 at 4 18 15 PM" src="https://github.com/user-attachments/assets/56f4fb57-3fff-4504-aaf8-b1479fb094ba" />

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
