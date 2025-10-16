import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

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

Provide a helpful response in markdown format with citations. Return your response as a JSON object:
{
  "content": "Your markdown-formatted response here with [links](urls) and **emphasis**"
}`

    const result = streamText({
      model: openai("gpt-5-mini"),
      prompt: aiPrompt,
      maxTokens: 2000,
      tools: {
        web_search: openai.tools.webSearch({
          searchContextSize: "large",
        }),
      },
      providerOptions: {
        openai: {
          reasoningEffort: "medium",
        },
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error in chat:", error)
    return Response.json(
      {
        content: "I apologize, but I encountered an error processing your request. Please try again.",
      },
      { status: 500 },
    )
  }
}
