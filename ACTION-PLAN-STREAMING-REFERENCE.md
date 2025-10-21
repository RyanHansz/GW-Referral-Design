# Action Plan Generation & Streaming Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `simple-actionplan-websearch`
**Last Updated:** 2025-10-21

---

## Overview

This document explains how the action plan generation and streaming system works for the Goodwill Central Texas Referral Tool. Action plans provide step-by-step guides for clients to access selected resources, with real-time web search to find current contact information, application links, and program details.

**Key Features:**
- ✅ **Single streaming container** - All content streams sequentially in one view
- ✅ **Web search integration** - Finds real links, phone numbers, and current info
- ✅ **Progressive rendering** - Content appears as it's generated
- ✅ **Multi-language support** - Generates plans in selected output language
- ✅ **Simple architecture** - No complex state management or carousel UI

---

## Screenshots

### Action Plan with Multiple Resources

![Action Plan Streaming Example](public/docs/action-plan-streaming-example.png)

*Example showing action plan generation for 4 selected resources (3 GCTA healthcare training courses and Texas RioGrande Legal Aid). The system generates a Quick Summary followed by individual guides for each resource, all streaming sequentially in a single container.*


---

## Table of Contents

1. [Screenshots](#screenshots)
2. [Architecture Overview](#architecture-overview)
3. [API Route Implementation](#api-route-implementation)
4. [Frontend Streaming Handler](#frontend-streaming-handler)
5. [LLM Configuration](#llm-configuration)
6. [Prompt Structure](#prompt-structure)
7. [Streaming Flow](#streaming-flow)
8. [Code Reference](#code-reference)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)
11. [Performance Considerations](#performance-considerations)
12. [Security](#security)
13. [Future Improvements](#future-improvements)

---

## Architecture Overview

### System Components

```
┌──────────────────────────────────────────────────────────────┐
│                         USER ACTION                           │
│         User selects 1+ resources → clicks "Generate"        │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                  FRONTEND (app/page.tsx)                     │
│  - Calls /api/generate-action-plan                          │
│  - Passes: selectedResources, outputLanguage                │
│  - Opens readable stream                                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│         API ROUTE (app/api/generate-action-plan/route.ts)   │
│  - Builds comprehensive prompt                               │
│  - Model: gpt-5-mini (o1-mini reasoning model)              │
│  - Enables web_search tool                                   │
│  - Returns streaming text response                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                      LLM GENERATION                          │
│  Sequential output:                                          │
│  1. Quick Summary (if multiple resources)                    │
│  2. Resource Guide #1                                        │
│  3. Resource Guide #2                                        │
│  4. Resource Guide #3 (etc.)                                 │
│  Each section streams as it's generated                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│              FRONTEND RENDERS STREAMING                      │
│  - Accumulates markdown chunks                               │
│  - Parses to HTML with rehype-sanitize                      │
│  - Updates UI in real-time                                   │
│  - Shows loading indicator while streaming                   │
└──────────────────────────────────────────────────────────────┘
```


---

## API Route Implementation

### File Location
**Path:** `app/api/generate-action-plan/route.ts`

### Core Logic

```typescript
export async function POST(request: Request) {
  const { resources, outputLanguage = "English" } = await request.json()

  // Build resource list for prompt
  const resourceList = resources
    .map((resource: any, index: number) =>
      `${index + 1}. ${resource.title} - ${resource.service} (${resource.providerType})`
    )
    .join("\n")

  // Create comprehensive prompt with all resources
  const aiPrompt = `[Prompt with structure for all resources]...`

  // Stream generation
  const result = streamText({
    model: openai("gpt-5-mini"),
    prompt: aiPrompt,
    maxTokens: resources.length === 1 ? 2500 : 800 * resources.length + 500,
    tools: {
      web_search: openai.tools.webSearch({
        searchContextSize: "low",
      }),
    },
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
  })

  return result.toTextStreamResponse()
}
```

### Key Features

1. **Dynamic Token Allocation**
   - Single resource: 2,500 tokens
   - Multiple resources: `800 × count + 500` tokens
   - Ensures sufficient space for all guides

2. **Web Search Tool**
   - Finds current application links
   - Gets real phone numbers and addresses
   - Verifies program availability
   - Context size: "low" for speed

3. **Reasoning Model**
   - Uses o1-mini (gpt-5-mini)
   - Low reasoning effort for speed
   - Good at following complex instructions

---

## Frontend Streaming Handler

### File Location
**Path:** `app/page.tsx` (lines 1770-1816)

### Implementation

```typescript
const generateActionPlan = async () => {
  if (selectedResources.length === 0) return

  setIsGeneratingActionPlan(true)
  setActionPlanContent("")

  try {
    const response = await fetch("/api/generate-action-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resources: selectedResources,
        outputLanguage: outputLanguage,
      }),
    })

    if (!response.ok) throw new Error("Failed to generate action plan")

    const reader = response.body?.getReader()
    if (!reader) throw new Error("No reader available")

    const decoder = new TextDecoder()
    let buffer = ""

    // Simple streaming - accumulate markdown content
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      setActionPlanContent(buffer)  // Update UI with each chunk
    }
  } catch (error) {
    console.error("Error generating action plan:", error)
    alert("Failed to generate action plan. Please try again.")
  } finally {
    setIsGeneratingActionPlan(false)
  }
}
```

### State Management

**Required state variables:**
```typescript
const [actionPlanContent, setActionPlanContent] = useState("")
const [isGeneratingActionPlan, setIsGeneratingActionPlan] = useState(false)
```

The system uses a single string to accumulate all streaming content, making state management simple and predictable.

### UI Rendering

```typescript
{/* Action Plan - streaming or complete */}
{(isGeneratingActionPlan || actionPlanContent) && (
  <div className="mt-6 p-4 bg-blue-50 border border-blue-500 rounded-lg">
    <h3 className="text-lg font-semibold text-blue-900 mb-4">Action Plan</h3>

    {isGeneratingActionPlan && (
      <div className="flex items-center gap-3 p-4 bg-white rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span className="text-blue-900 font-medium">Generating action plan...</span>
      </div>
    )}

    {/* Single streaming container for all content */}
    {actionPlanContent && (
      <div className="prose prose-slate max-w-none">
        <div dangerouslySetInnerHTML={{
          __html: parseMarkdownToHTML(actionPlanContent)
        }} />
      </div>
    )}
  </div>
)}
```

---

## LLM Configuration
**Note** We should expect to revisit this LLM setup and prompt structure after testing internally and with GW staff

### Model Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| **Model** | `gpt-5-mini` | reasoning model |
| **Max Tokens** | 2500 (single)<br>800×N+500 (multiple) | Ensures complete generation |
| **Web Search** | Enabled | Finds real links & contact info |
| **Search Context** | `low` | Optimized for speed |
| **Reasoning Effort** | `low` | Faster responses |

### Why These Settings?

**gpt-5-mini:**
- Good at following structured instructions
- Has web search capability
- Balances quality and cost
- Suitable for sequential generation

**Low reasoning effort:**
- Action plans don't need deep reasoning
- Prioritizes speed over complex thinking
- Still maintains quality for straightforward tasks

**Low search context:**
- Reduces token usage
- Faster search results
- Sufficient for finding contact info


---

## Prompt Structure

### Single Resource Prompt

```
You are creating an action plan for a client enrolled in Goodwill Central Texas's
Workforce Advancement Program with career coaching support.

Generate a CONCISE action plan in [LANGUAGE] for accessing this resource.
Use simple language (8th grade reading level max).

Selected Resource:
1. [Resource Title] - [Service] ([Provider Type])

STRUCTURE:
### [Short Resource Name]
**How to apply:**
- 2-3 simple steps with actual links/locations

**Documents needed:**
- 3-4 specific items

**Timeline:**
- 1 phrase with timeframe (e.g., "2-4 weeks")

**Key tip:**
- 1 actionable tip from web search

🚨 CORE RULES:
1. **Use Web Search**: Find REAL application links - NEVER guess URLs
2. **Be Specific**: Link to application pages, not homepages
3. **Plain Language**: Write at 8th grade level
4. **Keep It Brief**: Each section takes 5-10 seconds to read
5. **Simple Formatting**: Only use **bold**, bullet points (-), headers (###)
6. **NO INLINE CITATIONS**: Embed links naturally, not (website.com)

Return ONLY the markdown content directly, no JSON.
```

### Multiple Resources Prompt

```
You are creating an action plan for a client enrolled in Goodwill Central Texas's
Workforce Advancement Program with career coaching support.

Generate a CONCISE action plan in [LANGUAGE] for accessing these resources.
Use simple language (8th grade reading level max).

Selected Resources:
1. [Resource Title 1] - [Service] ([Provider Type])
2. [Resource Title 2] - [Service] ([Provider Type])
3. [Resource Title 3] - [Service] ([Provider Type])

STRUCTURE:
## Quick Summary
Provide a brief overview (3-4 sentences) covering:
- Common steps to take first (e.g., "Gather your documents before applying")
- Documents you'll need for most resources
- Suggested order/priority

### [Resource 1 Title]
**How to apply:**
- 2-3 simple steps with actual links/locations
[... same structure as single resource ...]

### [Resource 2 Title]
[... same structure ...]

### [Resource 3 Title]
[... same structure ...]

🚨 CORE RULES:
[... same 6 rules as single resource ...]

Return ONLY the markdown content directly, no JSON. Generate the Quick Summary
followed by each resource section in order.
```

### Dynamic Prompt Building

The prompt dynamically includes:
- **Resource count** - Adjusts language (this resource vs. these resources)
- **Quick Summary** - Only included for multiple resources
- **Resource sections** - Generated via `.map()` for each resource
- **Output language** - Injected into prompt structure
- **Token limits** - Scaled based on number of resources

---

## Streaming Flow

### Step-by-Step Process

**1. User Action**
```
User selects 2 resources:
- GCTA - CompTIA A+ Certification
- Career Closet - Professional Clothing
Clicks "Generate Action Plan"
```

**2. Frontend Initiates**
```typescript
POST /api/generate-action-plan
Body: {
  resources: [resource1, resource2],
  outputLanguage: "English"
}
```

**3. API Builds Prompt**
```
Comprehensive prompt with:
- Quick Summary section
- CompTIA A+ section structure
- Career Closet section structure
- All 6 core rules
```

**4. LLM Generates Sequentially**
```
Stream chunk 1: "## Quick"
Stream chunk 2: " Summary\n\nStart by gat"
Stream chunk 3: "hering basic documents like your ID"
Stream chunk 4: " and proof of address. Apply"
Stream chunk 5: " to GCTA first while"
[... continues ...]
Stream chunk N: "before your interview.\n"
```

**5. Frontend Accumulates**
```typescript
buffer = ""
buffer += "## Quick"
buffer += " Summary\n\nStart by gat"
buffer += "hering basic documents like your ID"
// Update UI after each chunk
setActionPlanContent(buffer)
```

**6. Markdown Parsing**
```typescript
// lib/markdown.ts
parseMarkdownToHTML(buffer)
  .use(remarkParse)     // Parse markdown
  .use(remarkGfm)       // Support GFM
  .use(remarkRehype)    // Convert to HTML
  .use(rehypeSanitize)  // Sanitize (security)
  .use(rehypeStringify) // Convert to string
```

**7. UI Renders**
```
User sees content appear progressively:
[0.5s] "## Quick Summary"
[1.0s] Full summary paragraph visible
[2.0s] "### GCTA - CompTIA A+" header appears
[3.0s] "How to apply:" section streams in
[4.5s] Complete first resource guide visible
[5.0s] Second resource guide begins...
```


---

## Code Reference

### API Route
**File:** `app/api/generate-action-plan/route.ts`

| Lines | Description |
|-------|-------------|
| 1-2 | Imports from Vercel AI SDK |
| 6 | Extract resources and language from request |
| 12-17 | Build resource list string |
| 19-56 | Construct comprehensive prompt |
| 58-72 | Configure streamText with model and tools |
| 73 | Return streaming response |

### Frontend Handler
**File:** `app/page.tsx`

| Lines | Description |
|-------|-------------|
| 515-516 | State variables (content + loading flag) |
| 1770-1816 | `generateActionPlan` function |
| 1773 | Reset state before generation |
| 1780-1789 | Fetch API request |
| 1795-1809 | Stream reading and accumulation |
| 3004-3031 | UI rendering (loading + content) |

### Markdown Parser
**File:** `lib/markdown.ts`

| Lines | Description |
|-------|-------------|
| 1-6 | Imports for unified, remark, rehype |
| 12-22 | Parsing pipeline with sanitization |
| 26-49 | Tailwind CSS class injection |

---

## Best Practices

### When Editing the Prompt

**DO:**
✅ Test with 1, 2, and 3+ resource scenarios
✅ Maintain the 6 core rules structure
✅ Keep language at 8th grade level
✅ Specify exact markdown formatting
✅ Include web search reminders
✅ Test in multiple output languages

**DON'T:**
❌ Remove web search tool
❌ Allow URL guessing or hallucination
❌ Make sections too long (>5-10 seconds to read)
❌ Use technical jargon
❌ Remove the "ONLY markdown" instruction
❌ Change structure without testing

### When Modifying Frontend

**DO:**
✅ Maintain streaming accumulation pattern
✅ Show loading indicator during generation
✅ Parse markdown with rehype-sanitize
✅ Handle errors gracefully
✅ Clear state before new generation

**DON'T:**
❌ Add navigation/pagination UI (defeats purpose of single view)
❌ Parse content as JSON (content is plain markdown)
❌ Skip error handling
❌ Remove security sanitization
❌ Block UI during streaming

---

## Security

### Input Validation

```typescript
if (!resources || resources.length === 0) {
  return Response.json(
    { error: "Selected resources are required" },
    { status: 400 }
  )
}
```

### Output Sanitization

**Library:** `rehype-sanitize`

**Removes:**
- `<script>` tags
- `onclick` and event handlers
- `javascript:` URLs
- Dangerous HTML attributes

**Allows:**
- Markdown-generated HTML
- Links with `href`
- Text formatting (bold, italic)
- Lists and headers

### XSS Prevention

✅ All LLM output sanitized before rendering
✅ No `eval()` or direct HTML injection
✅ CSP headers recommended (see `next.config.mjs`)
✅ User input escaped in API calls

---

## Related Documentation

- [LLM Prompts Reference](./LLM-PROMPTS-REFERENCE.md) - All prompt details
- [Chat Mode Reference](./CHAT-MODE-REFERENCE.md) - Chat streaming system
- [Sub-Category Filters](./SUB-CATEGORY-FILTERS-REFERENCE.md) - Resource filtering
- [RAG Action Plans](./TICKET-RAG-ACTION-PLANS.md) - Future RAG integration

---

**Last Updated:** 2025-10-21
**Maintained By:** Claude Code + Ryan Hansz
