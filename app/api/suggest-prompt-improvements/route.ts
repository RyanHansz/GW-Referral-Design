import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return Response.json(
        { error: "Prompt is required" },
        { status: 400 }
      )
    }

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that analyzes search prompts for a social services resource referral tool and suggests specific improvements.

Your job is to read the user's current search prompt and provide 2-4 specific, actionable suggestions to make it more detailed and effective.

Focus on identifying what's MISSING from their prompt. Suggest adding:
- Age or life stage details
- Family situation (single, family with kids, etc.)
- Income level or financial situation
- Urgency or timeline
- Specific barriers or challenges (transportation, disability, language, etc.)
- Geographic details (neighborhood, zip code)
- Current situation context (homeless, at risk of eviction, unemployed, etc.)

Be specific and actionable. Don't just say "add more details" - tell them WHAT details to add.

Format your response as a simple list with 2-4 suggestions. Each suggestion should be one clear sentence.
Start each suggestion with a bullet point (•).
Keep suggestions concise (one line each).`,
        },
        {
          role: "user",
          content: `Current search prompt: "${prompt}"

What specific details should be added to this prompt to get better, more relevant results?`,
        },
      ],
      temperature: 0.7,
      maxTokens: 300,
    })

    return Response.json({ suggestions: text })
  } catch (error) {
    console.error("Error generating suggestions:", error)
    return Response.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    )
  }
}
