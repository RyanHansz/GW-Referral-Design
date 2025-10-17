import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { resources, outputLanguage = "English" } = await request.json()

    if (!resources || resources.length === 0) {
      return Response.json({ error: "Selected resources are required" }, { status: 400 })
    }

    const resourceList = resources
      .map(
        (resource: any, index: number) =>
          `${index + 1}. ${resource.title} - ${resource.service} (${resource.providerType})`,
      )
      .join("\n")

    const aiPrompt = resources.length > 1
      ? `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program with career coaching support.

Generate a CONCISE action plan in ${outputLanguage} for accessing these ${resources.length} selected resources. Use simple language (8th grade reading level max).

Selected Resources:
${resourceList}

STRUCTURE:
## Quick Summary
Provide a brief overview (3-4 sentences) covering:
- Common steps to take first (e.g., "Gather your documents before applying")
- Documents you'll need for most resources (ID, proof of address, income, etc.)
- Suggested order/priority (e.g., "Start with #1 while waiting for #2 to process")

Then for each resource:
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
1. **Use Web Search**: Find REAL application links, forms, phone numbers - NEVER guess URLs
2. **Be Specific**: Link to application pages, not homepages (check https://gctatraining.org/class-schedule/ for GCTA courses)
3. **Plain Language**: Write at 8th grade level - short words, clear sentences, no jargon
4. **Keep It Brief**: Each section takes 5-10 seconds to read
5. **Simple Formatting**: Only use **bold**, bullet points (-), and headers (###)

Return ONLY the markdown content directly, no JSON.`
      : `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program with career coaching support.

Generate a CONCISE action plan in ${outputLanguage} for accessing this resource. Use simple language (8th grade reading level max).

Selected Resource:
${resourceList}

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
1. **Use Web Search**: Find REAL application links, forms, phone numbers - NEVER guess URLs
2. **Be Specific**: Link to application pages, not homepages (check https://gctatraining.org/class-schedule/ for GCTA courses)
3. **Plain Language**: Write at 8th grade level - short words, clear sentences, no jargon
4. **Keep It Brief**: Each section takes 5-10 seconds to read
5. **Simple Formatting**: Only use **bold**, bullet points (-), and headers (###)

Return ONLY the markdown content directly, no JSON.`

    const result = streamText({
      model: openai("gpt-5-mini"),
      prompt: aiPrompt,
      maxTokens: 2500,
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "medium",
        }),
      },
      providerOptions: {
        openai: {
          reasoningEffort: "low",
        },
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error generating action plan:", error)
    return Response.json(
      {
        title: "Action Plan Error",
        summary: "Failed to generate action plan due to system error.",
        content:
          "# System Error\n\nWe encountered a system error while generating your action plan. Please try again later.",
      },
      { status: 500 },
    )
  }
}
