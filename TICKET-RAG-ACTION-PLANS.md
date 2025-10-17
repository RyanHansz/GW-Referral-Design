# Feature Request: Enhanced Action Plans & Resource Guides with RAG + Web Search

## 📋 Overview
Enhance action plans and individual resource guides to provide more comprehensive, accurate, and up-to-date information by combining:
1. **Web Search** - Real-time information about programs, schedules, contact details
2. **RAG (Retrieval Augmented Generation)** - Internal knowledge base including policies, procedures, case management best practices, program details

## 🎯 Problem Statement
Currently, action plans and resource guides rely primarily on:
- LLM knowledge (which may be outdated)
- Static context loaded from `goodwill-context.md`
- Web search for external resources (in referral generation only)

**Gaps:**
- No access to detailed internal documentation during action plan generation
- Limited ability to include up-to-date program schedules, enrollment periods, or requirements
- Cannot reference internal policies, case management procedures, or success stories
- Action plans may miss recent program changes or new resources

## 🔧 Current Implementation

### Action Plans (`/api/generate-action-plan/route.ts`)
- Model: `gpt-4o` (no web search capability)
- Context: Basic Goodwill program info from `goodwill-context.md`
- Limitation: No real-time data or internal documentation access

### Resource Guides (Generated per referral)
- Embedded in each resource card
- Static information from referral generation
- No follow-up context or detailed procedures

### Chat (`/api/chat/route.ts`)
- Model: `gpt-5-mini`
- **Already has web search**: Uses `openai.tools.webSearch()`
- Context: Goodwill program info
- Use case: Q&A, not structured action plans

## ✨ Proposed Solution

### Architecture Changes

#### 1. Vector Database / RAG Setup
**Option A: OpenAI Assistants API with File Search**
```typescript
// Create assistant with file search
const assistant = await openai.beta.assistants.create({
  name: "Goodwill Case Management Assistant",
  instructions: "You help case managers create action plans...",
  model: "gpt-4o",
  tools: [
    { type: "file_search" },
    { type: "web_search" }
  ]
})

// Create vector store with internal docs
const vectorStore = await openai.beta.vectorStores.create({
  name: "Goodwill Internal Knowledge Base"
})

// Upload documents
await openai.beta.vectorStores.fileBatches.uploadAndPoll(vectorStore.id, {
  files: [
    // Program guides
    "./knowledge-base/gcta-program-guide.pdf",
    "./knowledge-base/cat-course-catalog.pdf",

    // Policies & procedures
    "./knowledge-base/case-management-handbook.pdf",
    "./knowledge-base/eligibility-requirements.pdf",
    "./knowledge-base/referral-procedures.pdf",

    // Success stories & templates
    "./knowledge-base/case-studies.pdf",
    "./knowledge-base/action-plan-templates.pdf",

    // Partner resources
    "./knowledge-base/community-partner-directory.pdf",
    "./knowledge-base/government-benefits-guide.pdf",
  ]
})
```

**Option B: Vercel AI SDK RAG with Pinecone/Supabase**
```typescript
import { embed, embedMany } from 'ai'
import { openai } from '@ai-sdk/openai'

// Embed documents into vector DB
const documents = await loadDocuments('./knowledge-base')
const embeddings = await embedMany({
  model: openai.embedding('text-embedding-3-small'),
  values: documents.map(d => d.content)
})

// Store in vector DB (Pinecone, Supabase, etc.)
await vectorDB.upsert(embeddings)

// Query at runtime
const relevantDocs = await vectorDB.query(userQuery, topK: 5)
```

**Option C: Simple File-Based Context (Quickest)**
```typescript
// Enhance existing context-loader.ts
export function loadKnowledgeBase(query: string): string {
  const allDocs = [
    loadFile('./knowledge-base/programs/gcta-courses.md'),
    loadFile('./knowledge-base/programs/cat-trainings.md'),
    loadFile('./knowledge-base/policies/eligibility.md'),
    loadFile('./knowledge-base/procedures/referral-process.md'),
    loadFile('./knowledge-base/templates/action-plan-examples.md'),
  ]

  // Simple keyword matching or use embeddings
  return selectRelevantDocs(query, allDocs)
}
```

#### 2. Update Action Plan Generation

**File:** `/app/api/generate-action-plan/route.ts`

```typescript
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { loadGoodwillContext } from "@/lib/context-loader"
import { retrieveRelevantDocs } from "@/lib/rag" // NEW

export async function POST(request: Request) {
  const { userInput, selectedCategories, referrals } = await request.json()

  // Load static context
  const goodwillContext = loadGoodwillContext()

  // NEW: Retrieve relevant internal docs using RAG
  const relevantDocs = await retrieveRelevantDocs({
    query: userInput,
    categories: selectedCategories,
    limit: 5
  })

  const result = streamText({
    model: openai("gpt-4o"), // gpt-4o supports web search
    prompt: `You are creating an action plan for a Goodwill case manager.

INTERNAL KNOWLEDGE BASE:
${relevantDocs}

GOODWILL PROGRAMS:
${goodwillContext}

CLIENT SITUATION:
${userInput}

AVAILABLE RESOURCES:
${JSON.stringify(referrals)}

Create a comprehensive action plan...`,
    tools: {
      web_search: openai.tools.webSearch({
        searchContextSize: "medium", // Get more context than chat
      }),
    },
  })

  return result.toTextStreamResponse()
}
```

#### 3. Add Resource Guide Detail View

**New API Route:** `/app/api/resource-guide/route.ts`

```typescript
export async function POST(request: Request) {
  const { resourceTitle, resourceUrl, clientContext } = await request.json()

  // Retrieve relevant internal procedures
  const procedures = await retrieveRelevantDocs({
    query: `referral procedures for ${resourceTitle}`,
    docTypes: ['procedures', 'templates'],
    limit: 3
  })

  const result = streamText({
    model: openai("gpt-4o"),
    prompt: `Create a detailed resource guide for referring a client to: ${resourceTitle}

INTERNAL PROCEDURES:
${procedures}

CLIENT CONTEXT:
${clientContext}

Include:
1. Eligibility requirements
2. Application process (step-by-step)
3. Required documents
4. Timeline expectations
5. Contact information
6. Tips for success
7. Common issues and solutions`,
    tools: {
      web_search: openai.tools.webSearch({
        searchContextSize: "high", // Deep research for specific resource
      }),
    },
  })

  return result.toTextStreamResponse()
}
```

## 📝 Knowledge Base Structure

### Recommended File Organization
```
knowledge-base/
├── programs/
│   ├── gcta-courses.md
│   ├── cat-trainings.md
│   ├── excel-center.md
│   ├── job-placement.md
│   └── career-coaching.md
├── policies/
│   ├── eligibility-requirements.md
│   ├── program-enrollment.md
│   └── documentation-requirements.md
├── procedures/
│   ├── referral-process.md
│   ├── case-management-workflow.md
│   └── follow-up-procedures.md
├── templates/
│   ├── action-plan-examples.md
│   ├── referral-letter-templates.md
│   └── success-stories.md
└── partners/
    ├── community-organizations.md
    ├── government-programs.md
    └── training-providers.md
```

### Content Examples

**`knowledge-base/procedures/referral-process.md`**
```markdown
# GCTA Course Referral Process

## Eligibility
- 18+ years old
- High school diploma or GED
- Basic computer literacy (for some courses)
- Pass Wonderlic assessment (score requirements vary by course)

## Application Steps
1. Initial assessment with case manager
2. Schedule Wonderlic test at main campus
3. Complete enrollment form
4. Attend orientation session
5. Begin coursework

## Required Documents
- Government-issued ID
- Proof of education (diploma/GED)
- Recent paystubs or unemployment verification (for some programs)

## Timeline
- Application to start: 2-3 weeks typically
- Course duration: 4-12 weeks depending on certification
- Job placement support: Available for 90 days after completion

## Contact
- GCTA Coordinator: (512) 555-0123
- Email: gcta@goodwillcentraltexas.org
- Walk-in hours: M-F 9am-4pm
```

## ✅ Acceptance Criteria

### Phase 1: RAG Infrastructure
- [ ] Choose RAG implementation approach (A, B, or C)
- [ ] Set up vector database or file-based context system
- [ ] Create knowledge base directory structure
- [ ] Add initial 5-10 core documents covering:
  - [ ] GCTA course details
  - [ ] CAT training catalog
  - [ ] Referral procedures
  - [ ] Eligibility requirements
  - [ ] Action plan examples
- [ ] Implement retrieval function that returns relevant docs based on query

### Phase 2: Enhanced Action Plans
- [ ] Update `/api/generate-action-plan/route.ts` to:
  - [ ] Query RAG system for relevant internal docs
  - [ ] Enable web search tool for real-time information
  - [ ] Include both RAG context and web search results in prompt
- [ ] Action plans should reference:
  - [ ] Specific internal procedures
  - [ ] Current program schedules (from web search)
  - [ ] Contact information (from web search)
- [ ] Maintain current markdown formatting and structure

### Phase 3: Resource Guide Detail View (Optional Enhancement)
- [ ] Add "View Detailed Guide" button to resource cards
- [ ] Create `/api/resource-guide/route.ts` endpoint
- [ ] Modal or expandable section showing:
  - [ ] Step-by-step referral process
  - [ ] Required documents
  - [ ] Timeline expectations
  - [ ] Contact details (from web search)
  - [ ] Tips from internal knowledge base
- [ ] Cache guides per resource to avoid repeated API calls

### Phase 4: Testing & Quality
- [ ] Test with real case manager scenarios
- [ ] Verify action plans include:
  - [ ] Accurate, current contact information
  - [ ] Proper eligibility requirements from internal docs
  - [ ] Realistic timelines
  - [ ] Internal procedure references
- [ ] Confirm web search results are relevant and recent
- [ ] Validate RAG retrieval returns appropriate documents

## 🔍 Technical Considerations

### Model Selection
- **Action Plans**: `gpt-4o` (supports both web search and file search)
- **Resource Guides**: `gpt-4o` (same reasoning)
- **Performance**: May need to adjust `searchContextSize` to balance quality vs. speed

### Cost Management
- Web search adds ~$0.002 per search
- RAG embeddings: one-time cost per document (~$0.0001 per 1K tokens)
- Vector DB: Minimal if using file-based approach, ~$70/mo for Pinecone starter
- Monitor token usage with both RAG context + web search results

### Caching Strategy
```typescript
// Cache retrieved docs per session
const ragCache = new Map<string, string>()

function getCachedOrRetrieve(query: string) {
  const cacheKey = hashQuery(query)
  if (ragCache.has(cacheKey)) {
    return ragCache.get(cacheKey)
  }
  const docs = retrieveRelevantDocs(query)
  ragCache.set(cacheKey, docs)
  return docs
}
```

### Content Management
- **Who maintains knowledge base?**
  - Case management team lead
  - Program coordinators
- **Update frequency?**
  - Review quarterly
  - Immediate updates for policy changes
- **Version control?**
  - Store in Git alongside code
  - Use conventional file naming: `program-name-v2024-q1.md`

## 📊 Success Metrics

### Qualitative
- Case managers report action plans are more detailed and actionable
- Fewer follow-up questions about "how to" refer clients
- Action plans include current contact information and schedules

### Quantitative
- Action plan generation time < 15 seconds (including RAG + web search)
- 90%+ of action plans include at least one internal procedure reference
- 80%+ of action plans include current contact info (verified via web search)
- RAG retrieval returns relevant docs in < 1 second

## 🚀 Implementation Phases

### Phase 1 (Week 1-2): RAG Setup
- Choose approach and set up infrastructure
- Create knowledge base with 5-10 core documents
- Test retrieval accuracy

### Phase 2 (Week 2-3): Action Plan Integration
- Add RAG + web search to action plan generation
- Test with real scenarios
- Gather case manager feedback

### Phase 3 (Week 3-4): Resource Guides (Optional)
- Implement detailed guide view
- Add UI components
- User testing

### Phase 4 (Week 4): Polish & Deploy
- Performance optimization
- Documentation
- Training materials for case managers
- Production deployment

## 📚 Resources & References

### OpenAI Documentation
- [File Search (RAG)](https://platform.openai.com/docs/assistants/tools/file-search)
- [Web Search Tool](https://platform.openai.com/docs/guides/web-search)
- [Assistants API](https://platform.openai.com/docs/assistants/overview)

### Vercel AI SDK
- [AI SDK RAG Guide](https://sdk.vercel.ai/docs/guides/retrieval-augmented-generation)
- [Tool Usage](https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling)

### Vector Databases
- [Pinecone](https://www.pinecone.io/)
- [Supabase Vector](https://supabase.com/docs/guides/ai)
- [Weaviate](https://weaviate.io/)

### Current Codebase
- Action Plan: `/app/api/generate-action-plan/route.ts`
- Context Loader: `/lib/context-loader.ts`
- Chat (with web search): `/app/api/chat/route.ts`

## ❓ Open Questions

1. **Which RAG approach should we use?**
   - Option A (OpenAI Assistants): Easiest, managed by OpenAI
   - Option B (Custom RAG): More control, potentially better retrieval
   - Option C (File-based): Fastest to implement, good for MVP

2. **What documents do we have available?**
   - Need inventory of existing internal documentation
   - Format? (PDF, Word, Google Docs, Confluence, etc.)
   - Who owns/maintains these documents?

3. **Budget considerations?**
   - Is ~$70/mo for vector DB acceptable?
   - Are higher per-request costs (RAG + web search) acceptable?

4. **Content updates?**
   - How will case managers update the knowledge base?
   - Do we need a content management interface?
   - Or is Git-based workflow acceptable?

## 🎨 UI Mockups (Optional Phase 3)

### Resource Card with "View Guide" Button
```
┌─────────────────────────────────────┐
│ 🎓 GCTA - Medical Assistant Cert   │
│                                     │
│ Description...                      │
│                                     │
│ [View Details] [View Detailed Guide]│
└─────────────────────────────────────┘
```

### Detailed Guide Modal
```
┌──────────────────────────────────────────────┐
│ 📋 Referral Guide: GCTA Medical Assistant   │
│                                              │
│ ## Eligibility Requirements                  │
│ • High school diploma or GED                 │
│ • 18+ years old                              │
│ • Pass Wonderlic (score 15+)                 │
│                                              │
│ ## Step-by-Step Process                      │
│ 1. Complete initial assessment               │
│ 2. Schedule Wonderlic test...                │
│                                              │
│ ## Required Documents                        │
│ • Government ID                              │
│ • Proof of education                         │
│                                              │
│ ## Contact Information                       │
│ • GCTA Coordinator: (512) 555-0123          │
│ • Email: gcta@goodwillcentraltexas.org      │
│ • Hours: M-F 9am-4pm                        │
│                                              │
│                                     [Close]  │
└──────────────────────────────────────────────┘
```

---

## 💬 Discussion

**Estimated Effort:** 2-4 weeks (depending on RAG approach)
**Priority:** High - Would significantly improve action plan quality
**Risk:** Low - Additive feature, doesn't break existing functionality

**Next Steps:**
1. Approve approach (A, B, or C for RAG)
2. Inventory existing internal documentation
3. Assign engineer and set sprint goals
4. Create follow-up tickets for each phase
