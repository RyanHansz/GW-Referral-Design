import { streamObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 })
    }

    // Build conversation context from history
    const conversationContext =
      history.length > 0
        ? history
            .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n\n")
        : ""

    const aiPrompt = `You are a helpful assistant for Goodwill Central Texas, specializing in information about their programs, services, training opportunities, and community resources.

Your role is to:
1. Answer questions about Goodwill Central Texas programs, training courses (GCTA, CAT), and services
2. Provide information about local community resources, government benefits, and support services
3. Help case managers and staff understand available options for their clients
4. Use web search to find the most current and accurate information
5. Include citations and links in your responses when relevant

IMPORTANT GUIDELINES:
- Provide accurate, helpful information with proper citations
- Use web search to find current program details, schedules, contact information, and application processes
- For GCTA courses, check https://gctatraining.org/class-schedule/ for current offerings
- For Goodwill programs, reference https://goodwillcentraltexas.org/
- Include links, phone numbers, and specific contact details when available
- Format your response in markdown for readability
- Be conversational but professional
- If you don't know something, say so and suggest where to find the information

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}Current question: ${message}

Provide a helpful response in markdown format with inline citations. Use proper markdown formatting including:
- **Bold** for emphasis
- Bullet points for lists
- Headers (##) for sections
- Code blocks when relevant

CRITICAL CITATION REQUIREMENTS:
- Include inline citations in your response using numbered markers like [1], [2], [3]
- Place citations immediately after the relevant information
- Each citation should reference a specific web source you used
- Provide a complete citations array with:
  - number: The citation number as a string (e.g., "1", "2")
  - title: The title of the source page
  - url: The full URL of the source
  - description: A brief description of what information came from this source
  - quote: (optional) A relevant quote from the source if applicable

Return your response in JSON format with:
{
  "content": "Your markdown-formatted response with inline citations like [1], [2]",
  "citations": [
    {"number": "1", "title": "Source Title", "url": "https://example.com", "description": "Description of what this source provided"},
    {"number": "2", "title": "Another Source", "url": "https://example.org", "description": "Another description"}
  ]
}`

    const responseSchema = z.object({
      content: z.string().describe("The markdown-formatted response with inline citation markers like [1], [2]"),
      citations: z
        .array(
          z.object({
            number: z.string().describe("Citation number as a string"),
            title: z.string().describe("Title of the source"),
            url: z.string().describe("URL of the source"),
            description: z.string().describe("Description of what information came from this source"),
            quote: z.string().optional().describe("Optional relevant quote from the source"),
          }),
        )
        .describe("Array of citations corresponding to the numbered markers in the content"),
    })

    const result = streamObject({
      model: openai("gpt-5-mini"),
      schema: responseSchema,
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

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error in chat:", error)
    return Response.json(
      {
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        citations: [],
      },
      { status: 500 },
    )
  }
}
