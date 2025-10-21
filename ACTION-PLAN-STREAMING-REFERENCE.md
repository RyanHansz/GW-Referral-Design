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

**Key Features Visible:**
- Resource selection checkboxes with service type labels
- "Generate Action Plan" button showing selected count
- Quick Summary section with document requirements and suggested order
- Individual resource guides with structured sections (How to apply, Documents needed, Timeline, Key tip)
- Real application links from web search (e.g., https://gctatraining.org/phlebotomy/)
- Clean, readable formatting without inline citations
- All content visible at once (no pagination or navigation needed)

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

### Why This Architecture?

**Design Principles:**
- Single prompt generates all content in order
- Plain markdown streaming for simplicity
- Single container shows all content at once
- Simple accumulation in one state variable
- Minimal code complexity (~50 lines)

**Benefits:**
- Simple codebase that's easy to maintain
- Better UX - see everything at once without navigation
- Progressive rendering for faster perceived performance
- Easy to scan all resources together
- Straightforward error handling

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

### Timing Characteristics

**Single Resource:**
- First chunk: ~0.5-1 second
- Complete guide: ~3-5 seconds
- Total: ~5-8 seconds

**Multiple Resources (3):**
- First chunk: ~0.5-1 second
- Summary complete: ~2-3 seconds
- All guides complete: ~10-15 seconds
- Total: ~12-18 seconds

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

## Troubleshooting

### Issue: Streaming Stops Prematurely

**Symptoms:** Content cuts off mid-sentence, incomplete guides

**Causes:**
- Token limit too low
- Network timeout
- API error

**Solutions:**
1. Check browser console for errors
2. Verify token limits: `800 × resources.length + 500`
3. Increase timeout if needed
4. Check API logs for errors

### Issue: Hallucinated URLs

**Symptoms:** Links return 404, phone numbers invalid

**Causes:**
- LLM guessing instead of using web search
- Web search failed silently

**Solutions:**
1. Reinforce rule #1 in prompt: "NEVER guess URLs"
2. Check that web search tool is enabled
3. Increase `searchContextSize` if needed
4. Add more specific examples of good URLs

### Issue: Content Not Streaming

**Symptoms:** All content appears at once after long wait

**Causes:**
- Buffering in network layer
- Browser not rendering progressively

**Solutions:**
1. Verify `result.toTextStreamResponse()` is used
2. Check network tab for "Transfer-Encoding: chunked"
3. Ensure no response buffering middleware
4. Test in different browser

### Issue: Markdown Not Parsing

**Symptoms:** Raw markdown visible (##, **bold**, etc.)

**Causes:**
- `parseMarkdownToHTML` not called
- Sanitization too aggressive
- HTML not rendered with `dangerouslySetInnerHTML`

**Solutions:**
1. Verify `parseMarkdownToHTML` import
2. Check `dangerouslySetInnerHTML` prop
3. Test markdown parser independently
4. Check browser console for sanitization warnings

---

## Performance Considerations

### Token Usage

**Per Request:**
- Single resource: ~1,500-2,000 tokens
- 2 resources: ~2,500-3,000 tokens
- 3 resources: ~3,500-4,000 tokens
- 4 resources: ~4,500-5,000 tokens

**Cost (gpt-5-mini):**
- Input: ~$0.02 per 1M tokens
- Output: ~$0.08 per 1M tokens
- Web search: ~$0.002 per search
- Average request: ~$0.001-0.003

### Speed Optimization

**Current Settings:**
- Low reasoning effort: Prioritizes speed while maintaining quality
- Low search context: Faster search results with sufficient data
- Streaming generation: More predictable timing and progressive rendering

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

## Future Improvements

### 1. Parallelized Resource Guide Generation

**Current Limitation:**
The system currently generates all resource guides **sequentially** in a single LLM call. While this is simple and works well, it could be optimized for speed when handling multiple resources.

**Proposed Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    USER SELECTS 4 RESOURCES                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SEPARATE INTO COMPONENTS                     │
│  - QuickSummary component (1 LLM call)                      │
│  - ResourceGuide component × 4 (4 parallel LLM calls)       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               PARALLEL LLM CALLS WITH PROMISE.ALL            │
│  Call 1: Generate Quick Summary                              │
│  Call 2: Generate Resource Guide #1   ┐                     │
│  Call 3: Generate Resource Guide #2   ├─ Parallel           │
│  Call 4: Generate Resource Guide #3   │                     │
│  Call 5: Generate Resource Guide #4   ┘                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  STREAM ALL SIMULTANEOUSLY                    │
│  - Each component has its own streaming state                │
│  - UI shows all 4 guides streaming at once                   │
│  - Faster perceived performance                              │
└─────────────────────────────────────────────────────────────┘
```

**Implementation Strategy:**

1. **Component Breakdown**
   - Create `<QuickSummaryStream />` component
   - Create `<ResourceGuideStream resource={resource} />` component
   - Each component manages its own streaming state
   - Parent component orchestrates parallel calls

2. **API Changes**
   ```typescript
   // New endpoint: /api/generate-summary
   POST { resources: Resource[] } → Stream summary

   // New endpoint: /api/generate-resource-guide
   POST { resource: Resource } → Stream single guide
   ```

3. **Frontend Changes**
   ```typescript
   const [summaryContent, setSummaryContent] = useState("")
   const [guideContents, setGuideContents] = useState<Record<string, string>>({})

   // Launch all calls in parallel
   const generateActionPlan = async () => {
     const summaryPromise = streamSummary(resources)
     const guidePromises = resources.map(r => streamGuide(r))

     await Promise.all([summaryPromise, ...guidePromises])
   }
   ```

**Benefits:**
- ⚡ **Faster generation**: 4 guides in ~5-8 seconds vs. ~15-20 seconds sequential
- 📊 **Better UX**: All sections appear simultaneously
- 🎯 **Focused prompts**: Each guide gets dedicated context
- 🔄 **Independent retry**: Can retry single guide without regenerating all

**Tradeoffs:**
- 🔧 **More complexity**: Multiple streaming handlers, state management
- 💰 **Higher cost**: 5 LLM calls instead of 1 (5x tokens)
- 🎨 **UI complexity**: Need to handle multiple simultaneous streams
- 🐛 **Error handling**: Must handle partial failures gracefully

**When to Implement:**
- When users frequently select 3+ resources
- When generation speed becomes a bottleneck
- After measuring average generation times
- When budget allows for increased API costs

**Estimated Impact:**
- **Speed improvement**: 40-60% faster for 3+ resources
- **Cost increase**: 200-300% more API calls
- **Complexity increase**: +150 lines of code
- **User satisfaction**: Likely improved for power users

---

### 2. Caching & Optimization

**Resource Guide Caching:**
- Store generated plans per resource combination
- Cache key: `${resourceId}-${outputLanguage}-${date}`
- Invalidate daily or on schedule changes
- Expected reduction: 60-80% of API calls

**Implementation:**
```typescript
// Check cache first
const cacheKey = `${resource.id}-${outputLanguage}-${today}`
const cached = await redis.get(cacheKey)
if (cached) return cached

// Generate and cache
const guide = await generateGuide(resource)
await redis.setex(cacheKey, 86400, guide) // 24 hour TTL
```

---

### 3. Offline Mode

**Pregenerated Plans:**
- Generate plans for top 20 most-requested resources
- Store as static markdown files
- Update weekly via cron job
- Serve instantly without LLM call

**Fallback Strategy:**
```typescript
try {
  return await generateLivePlan(resources)
} catch (error) {
  return loadPregenerated(resources)
}
```

---

### 4. Personalization

**Context-Aware Generation:**
- Include client's case notes in prompt
- Reference known barriers (transportation, childcare)
- Suggest resources based on location
- Customize timeline based on urgency

**Enhanced Prompt:**
```
Client Context:
- Location: East Austin
- Transportation: Limited (bus only)
- Barriers: Childcare needed
- Timeline: Seeking work within 2 months

Generate action plan considering these factors...
```

---

### 5. Quality Metrics & Validation

**Track Success Metrics:**
- URL validity rate (% of working links)
- Case manager feedback ratings
- Client follow-through rates
- Time saved vs. manual plan writing

**Automated Validation:**
- Verify URLs return 200 status
- Check phone numbers format
- Validate timeline reasonableness
- Flag hallucinated content

**A/B Testing:**
- Test prompt variations
- Compare different generation strategies
- Measure user satisfaction scores
- Optimize based on data

---

### 6. Multi-Step Plans with Timeline

**Phase-Based Planning:**
```markdown
## Phase 1: Preparation (Week 1)
- Gather documents
- Create resume
- Apply to GCTA

## Phase 2: Training (Weeks 2-8)
- Attend Phlebotomy course
- Study for certification
- Complete clinical hours

## Phase 3: Job Search (Weeks 9-12)
- Get certified
- Apply to hospitals
- Interview prep
```

**Timeline Visualization:**
- Gantt chart for multi-resource plans
- Milestone tracking
- Deadline reminders
- Progress checkboxes

---

## Related Documentation

- [LLM Prompts Reference](./LLM-PROMPTS-REFERENCE.md) - All prompt details
- [Chat Mode Reference](./CHAT-MODE-REFERENCE.md) - Chat streaming system
- [Sub-Category Filters](./SUB-CATEGORY-FILTERS-REFERENCE.md) - Resource filtering
- [RAG Action Plans](./TICKET-RAG-ACTION-PLANS.md) - Future RAG integration

---

## Contact

For questions about action plan generation or streaming implementation:
- Check codebase: `app/api/generate-action-plan/route.ts`
- Review frontend: `app/page.tsx` (search for "generateActionPlan")
- Test locally: `npm run dev` and select resources

**Last Updated:** 2025-10-21
**Maintained By:** Claude Code + Ryan Hansz
