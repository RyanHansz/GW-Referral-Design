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

    const aiPrompt = `You are creating an action plan for a client who is already enrolled in Goodwill Central Texas's Workforce Advancement Program and receives career coaching support from a Goodwill case manager.

Generate a CONCISE action plan for accessing the following selected resources. Keep ALL content brief and scannable. Return your response as a JSON object with the following structure:

{
  "title": "Action Plan",
  "summary": "ONE sentence overview (15-20 words max)",
  "content": "Brief markdown content with action steps"
}

Selected Resources:
${resourceList}

For the content field, provide markdown-formatted text with simple, clean formatting:

For each resource, provide:
### [Short Resource Name]
**How to apply:**
- 2-3 specific steps with actual links/locations. Use web search to find application forms, online portals, or contact info

**Documents needed:**
- 3-4 specific items

**Timeline:**
- 1 specific phrase with actual timeframe (e.g., "2-4 weeks" or "Same day")

**Key tip:**
- 1 specific, actionable tip based on web search findings

CRITICAL SPECIFICITY REQUIREMENTS:
- Use web search to find ACTUAL application links, forms, and portals
- For GCTA courses, check https://gctatraining.org/class-schedule/ for current offerings and application information
- Include specific URLs when available (e.g., "Apply at: goodwillcentraltexas.org/apply")
- Mention specific phone numbers or email addresses found via web search
- Reference actual program names, locations, or offices
- Provide ACTIONABLE steps with real-world details, not generic advice

CRITICAL FORMATTING RULES:
- Keep ALL text BRIEF and SCANNABLE
- Use SHORT phrases, not long sentences
- Each section should take 5-10 seconds to read
- Limit bullet points to 3-4 items
- Avoid repetition and unnecessary details
- DO NOT use arrows (→) or special symbols
- DO NOT add extra styling or formatting beyond basic markdown
- Keep formatting simple and clean like follow-up responses

Use markdown formatting in the content:
- Use **bold** for section labels
- Use bullet points with - for lists
- Use ### for resource headers
- Keep formatting minimal and clean

IMPORTANT:
- Generate all content in ${outputLanguage}. All instructions, steps, and explanations should be in ${outputLanguage}.
- Return ONLY a valid JSON object with title, summary, and content fields.
- The content field should contain the brief markdown-formatted action plan.
- KEEP IT CONCISE - users should be able to scan the entire plan in 30-60 seconds.`

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
