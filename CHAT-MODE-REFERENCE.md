# Chat Mode Implementation Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `suggest-prompts`
**Related Commits:**
- `5971c6c` - refactor: remove filters from chat API calls and add RAG ticket
- `8e60f33` - perf: switch chat model from gpt-5 to gpt-5-mini for faster responses
- `58d68bc` - feat: pass selected categories and sub-categories to chat LLM
- `d657046` - refine: enhance chat prompt with trusted sources and context

---

## Overview

**AI GENERATED, DOUBLE CHECK THINGS**

Chat Mode provides an interactive Q&A interface for Goodwill Central Texas case managers to ask questions about programs, services, training opportunities, and community resources. The system uses GPT-5 with web search capabilities and a comprehensive knowledge base to provide accurate, cited responses in real-time.

---

## Key Features

1. **Conversational Interface** - Natural Q&A with context retention
2. **Real-time Streaming** - Responses stream as they generate
3. **Web Search Integration** - Finds current information (schedules, contact details)
4. **Context-Aware** - Maintains conversation history
5. **Filter Integration** - Respects selected category/sub-category filters
6. **Suggested Prompts** - Starter questions and follow-ups
7. **Markdown Support** - Rich formatted responses with links
8. **Knowledge Base** - Built-in Goodwill program context

---

## Implementation Files & Key Locations

### **1. Chat UI Components**

**File:** `app/page.tsx`

**Tab activation:** Line 2264
```typescript
{activeTab === "chat" && (
  // Chat interface
)}
```

**State management:** Lines 538-549
```typescript
const [chatMessages, setChatMessages] = useState<
  Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
  }>
>([])
const [chatInput, setChatInput] = useState("")
const [isChatStreaming, setIsChatStreaming] = useState(false)
const [streamingChatContent, setStreamingChatContent] = useState("")
const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([])
```

**Message display:** Lines 2300-2352
- User messages: Blue background, right-aligned
- Assistant messages: Gray background, left-aligned, markdown rendered
- Streaming indicator: Shows "Responding..." with spinner
- Timestamps: Display on each message

**Chat input:** Lines 2377-2420
- Textarea with Enter to send, Shift+Enter for new line
- Disabled during streaming
- Auto-clears after sending

---

### **2. Suggested Prompts**

**File:** `app/page.tsx`

**Suggested prompts array:** Lines 213-220
```typescript
const suggestedChatPrompts = [
  "What GCTA training programs are available for clients needing career skills?",
  "Where can I refer a client for food assistance in the Austin area?",
  "How do I help a client apply for SNAP benefits?",
  "What local resources are available for clients experiencing homelessness?",
  "Tell me about Goodwill's job placement services and career coaching",
  "What are the CAT training options for clients wanting to advance their careers?",
]
```

**Display logic:** Lines 2278-2297
- Shows when `chatMessages.length === 0` (initial state)
- Grid layout: 2 columns on desktop, 1 on mobile
- Click to send predefined question
- Hidden after first message sent

**Follow-up prompts:** Lines 2356-2375
- Shows after assistant response completes
- Dynamically generated based on conversation context
- Similar UI to suggested prompts
- Helps continue the conversation

---

### **3. Message Handling Functions**

**File:** `app/page.tsx`

**Primary send function:** Lines 1320-1400 (`handleSendChatMessage`)
```typescript
const handleSendChatMessage = async () => {
  if (!chatInput.trim() || isChatStreaming) return

  const userMessage = chatInput.trim()

  // Add user message to chat
  setChatMessages((prev) => [...prev, {
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString()
  }])

  setChatInput("") // Clear input
  setIsChatStreaming(true)
  setStreamingChatContent("")
  setFollowUpPrompts([])

  // API call with streaming
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: chatMessages.slice(-10), // Last 10 for context
      selectedCategories,
      selectedSubCategories
    })
  })

  // Stream response...
}
```

**Alternative send function:** Lines 1401-1480 (`sendChatMessage`)
- Used for suggested/follow-up prompts
- Bypasses input field
- Otherwise identical to primary function

**Key features:**
- Context limit: Last 10 messages sent to API
- Streaming: Chunks displayed as they arrive
- Error handling: Shows user-friendly error messages
- Auto-scroll: Messages stay visible as they stream

---

### **4. Chat API**

**File:** `app/api/chat/route.ts`

**Request payload:** Lines 75-76
```typescript
const { message, history = [], selectedCategories = [], selectedSubCategories = [] } = await request.json()
```

**Conversation context:** Lines 84-90
```typescript
const conversationContext = history.length > 0
  ? history
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n")
  : ""
```

**Filter context:** Lines 92-112
```typescript
let filterContext = ""
if (selectedCategories.length > 0 || selectedSubCategories.length > 0) {
  filterContext = "\nUSER'S CURRENT FILTERS:\n"

  if (selectedCategories.length > 0) {
    const categoryNames = selectedCategories
      .map((id: string) => categoryLabels[id] || id)
      .join(", ")
    filterContext += `- Main Categories: ${categoryNames}\n`
  }

  if (selectedSubCategories.length > 0) {
    const subCategoryNames = selectedSubCategories
      .map((id: string) => subCategoryLabels[id] || id)
      .join(", ")
    filterContext += `- Sub-Categories: ${subCategoryNames}\n`
  }

  filterContext += "\nPlease focus your response on resources and information that match these selected categories.\n"
}
```

**System prompt:** Lines 114-183
- Role: Helpful assistant for Goodwill case managers
- Context: Goodwill Central Texas programs (loaded from file)
- Web search: Enabled with low search context
- Response format: Markdown with citations
- Writing level: 8th grade, concise, direct
- Special instructions: Include links, phone numbers, specific details

**Trusted sources:** Lines 145-169
- Web links (40+ curated sources)
- Trusted nonprofits (50+ organizations)
- Prioritized in web searches

**LLM configuration:** Lines 185-199
```typescript
const result = streamText({
  model: openai("gpt-5"),
  prompt: aiPrompt,
  maxTokens: 2000,
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
```

---

## Key Patterns & Features

### **1. Context Retention**

Chat maintains conversational context by:
- Sending last 10 messages with each request
- Building conversation history string for LLM
- Preserving user and assistant roles

**Why 10 messages?**
- Balances context vs. token usage
- Covers typical conversation depth
- Prevents context window overflow

### **2. Filter Integration**

When user has selected filters:
- Category/sub-category filters passed to API
- LLM receives filter context
- Responses focus on filtered resource types
- Example: "GCTA Trainings" filter → responses prioritize GCTA courses

### **3. Real-time Streaming**

Response streaming provides better UX:
- Shows partial response as it generates
- "Responding..." indicator during generation
- Markdown parsed incrementally
- Reduces perceived wait time

### **4. Knowledge Base Integration**

**File:** `lib/context-loader.ts` (referenced)

Loads Goodwill-specific context:
- Program details
- Service descriptions
- Eligibility requirements
- Contact information

Injected into every chat request for accurate responses.

### **5. Web Search**

LLM can search the web for:
- Current GCTA/CAT class schedules
- Updated contact information
- Recent program changes
- Community resource details

**Search context:** "low" for faster responses

### **6. Markdown Rendering**

**Parser:** `lib/markdown.ts` (referenced)

Supports:
- Headers (##)
- Bold (**text**)
- Links ([text](url))
- Bullet points (-)
- Code blocks
- Emphasis

Rendered with `dangerouslySetInnerHTML` after parsing.

---

## UI/UX Guidelines

### **Chat Layout**
- Full-width interface with centered content
- Max width: 3xl for readability
- Message bubbles: User right, assistant left
- Scrollable message area

### **Message Styling**
- **User messages:** Blue background (`bg-blue-600`), white text
- **Assistant messages:** Gray background (`bg-gray-100`), dark text
- **Streaming:** Gray with spinner, "Responding..." label
- **Timestamps:** Small, light text below each message

### **Input Area**
- Large textarea (min-height: 100px)
- Placeholder text guides usage
- Keyboard shortcuts: Enter to send, Shift+Enter for new line
- Disabled state during streaming

### **Suggested Prompts**
- Grid layout: responsive columns
- Sparkle icon for visual appeal
- Hover states: Indigo accent
- Disabled during streaming

### **Accessibility**
- ARIA live regions for screen readers
- Status announcements during streaming
- Proper role attributes (`role="log"`)
- Keyboard navigation support

---

## Testing Recommendations

### **Functional Testing**
1. ✅ Send various question types (programs, resources, benefits)
2. ✅ Test multi-turn conversations (3-5 exchanges)
3. ✅ Verify context retention across messages
4. ✅ Test with category/sub-category filters active
5. ✅ Try all suggested prompts
6. ✅ Click follow-up prompts after responses
7. ✅ Test keyboard shortcuts (Enter, Shift+Enter)
8. ✅ Send very long messages (token limits)
9. ✅ Test rapid successive sends

### **Content Quality Testing**
1. ✅ Verify web search finds current information
2. ✅ Check citation accuracy and link validity
3. ✅ Test responses stay on-topic
4. ✅ Verify 8th grade reading level
5. ✅ Check markdown rendering (links, bold, lists)
6. ✅ Test responses respect active filters

### **Streaming & Performance**
1. ✅ Streaming displays smoothly (no stuttering)
2. ✅ Response time acceptable (<5s to start)
3. ✅ Long responses complete successfully
4. ✅ Network errors handled gracefully
5. ✅ Concurrent chat sessions (multiple tabs)

### **Edge Cases**
1. ✅ Empty messages (should be blocked)
2. ✅ Extremely long conversations (10+ messages)
3. ✅ Rapid filter changes mid-conversation
4. ✅ Tab switching during streaming
5. ✅ Browser back/forward navigation
6. ✅ Connection loss during streaming

---

## Integration with Other Features

### **Filters**
- Selected category/sub-category filters apply to chat
- Filter changes persist across tab switches
- Chat responses adapt to current filter selection

### **Knowledge Base**
- Same Goodwill context used in referral generation
- Consistent information across features
- File-based context system (easy updates)

### **Tab Navigation**
- Chat state persists when switching tabs
- Messages retained during session
- Can switch to referral mode and back

---

## Known Limitations

1. **No persistent history:** Messages cleared on page refresh
2. **10-message context limit:** Earlier context lost in long conversations
3. **No message editing:** Can't edit sent messages
4. **No export:** Can't save chat transcripts (yet)
5. **Single session:** No multi-device synchronization

---

## Future Enhancements

- [ ] Save chat history to localStorage
- [ ] Export chat transcripts (PDF/text)
- [ ] Message editing/deletion
- [ ] Voice input support
- [ ] Chat history search
- [ ] Share chat conversations
- [ ] Typing indicators
- [ ] Message reactions
- [ ] Multi-modal support (images, files)
- [ ] Suggested follow-ups powered by LLM

---

## Performance Considerations

### **Optimizations**
- **Model:** GPT-5 with low reasoning effort
- **Search context:** Low for faster responses
- **Token limit:** 2000 max tokens per response
- **Context limit:** 10 messages maximum
- **Streaming:** Reduces perceived latency

### **Resource Usage**
- **API calls:** One per message sent
- **Web searches:** On-demand, not every response
- **Memory:** Message history grows with conversation
- **Network:** Streaming reduces bandwidth needs

---

## Git Commands for Reference

```bash
# View chat API changes (filters removed)
git show 5971c6c

# View model performance optimization
git show 8e60f33

# View filter integration
git show 58d68bc

# View prompt enhancements
git show d657046

# Search for chat-related code
git grep "chatMessages\|handleSendChatMessage" suggest-prompts
```

---

## Related Features

- **Referral Generation:** Main tab for finding resources
- **Filter System:** Applies to both chat and referrals
- **Knowledge Base:** Shared context across features
- **Action Plans:** Can ask follow-up questions about resources

---

## Technical Stack

- **GPT-5:** Primary LLM for conversations
- **Vercel AI SDK:** Streaming text responses
- **shadcn/ui:** Chat UI components (Textarea, Button, Card)
- **Markdown Parser:** Custom parser for rich formatting
- **Web Search:** OpenAI web search tool integration
- **React State:** Client-side message management

---

## Suggested Prompts Explained

1. **"What GCTA training programs..."** → Explores training offerings
2. **"Where can I refer a client for food..."** → Community resources
3. **"How do I help a client apply..."** → Process guidance
4. **"What local resources are available..."** → Specific need targeting
5. **"Tell me about Goodwill's job placement..."** → Goodwill services
6. **"What are the CAT training options..."** → Career advancement

These prompts are:
- **Case manager focused:** Phrased from case manager perspective
- **Action-oriented:** Asking "how" and "what"
- **Diverse topics:** Cover training, resources, services
- **Specific:** Reference actual programs (GCTA, CAT)

---

## Troubleshooting

### **Responses not streaming:**
- Check network connection
- Verify API endpoint is reachable
- Check browser console for errors

### **Context not retained:**
- Verify `history` parameter sent to API
- Check message array length (max 10)
- Confirm state updates correctly

### **Filters not applying:**
- Ensure filters selected before asking question
- Check API receives `selectedCategories`/`selectedSubCategories`
- Verify filter context injected into prompt

### **Web search not working:**
- Check OpenAI API key has web search enabled
- Verify `searchContextSize` set correctly
- Test with questions requiring current info

---

## Contact & Support

For questions about Chat Mode implementation, contact the development team or review the commit history in the repository.

**Last Updated:** 2025-10-20
**Author:** Claude Code + Ryan Hansz
