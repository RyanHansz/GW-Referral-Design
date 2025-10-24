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

    // Single resource: use original simple approach
    if (resources.length === 1) {
      const resource = resources[0]
      const isCATTraining = resource.category === "CAT Trainings" || resource.title?.toLowerCase().includes("cat -")

      // Simplified prompt for CAT trainings
      const catPrompt = `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program.

Generate a CONCISE action plan in ${outputLanguage} for registering for this CAT class. Use simple language (8th grade reading level max).

Selected Resource:
Title: ${resource.title}
Service: ${resource.service}
Registration URL: ${resource.source || "See resource for URL"}
${resource.classDate ? `Next Available Class: ${resource.classDate}` : ""}

STRUCTURE:
### ${resource.title}
**How to register:**
- Visit the class registration page to view details and available dates: [Format as proper markdown link using exact URL from Registration URL above]
- Fill out the online registration form with your contact information
- Select your preferred training date from the dropdown menu${resource.classDate ? ` (next class: ${resource.classDate})` : ""}
- Submit the form to complete registration

**Key tip:**
- Register early as spots fill up quickly; the registration form shows how many spots remain for each class date

🚨 CORE RULES:
1. **Keep It Simple**: CAT registration is ONLY through the Wufoo form - do NOT include general Goodwill enrollment steps
2. **Use Resource URL**: Pull the exact registration link from the resource data provided and format it as a proper markdown link
3. **Link Purpose**: The Wufoo registration link contains class details, schedules, and registration - emphasize this is where they learn more
4. **Be Brief**: 4-5 steps maximum
5. **No Extra Info**: Do NOT add sections about documents, general enrollment processes, or calling intake

Return ONLY the markdown content directly, no JSON.`

      // Standard prompt for other resources
      const standardPrompt = `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program with career coaching support.

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

      const aiPrompt = isCATTraining ? catPrompt : standardPrompt

      const result = streamText({
        model: openai("gpt-5"),
        prompt: aiPrompt,
        maxTokens: 2500,
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

    // Multiple resources: use parallel generation with structured streaming
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start async generation
    ;(async () => {
      try {
        // Launch ALL generations in parallel (summary + all resources at the same time)
        const allPromises: Promise<void>[] = []

        // Summary generation - streams as it generates
        const summaryPrompt = `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program with career coaching support.

Generate ONLY a Quick Summary in ${outputLanguage} for accessing these ${resources.length} selected resources. Use simple language (8th grade reading level max).

Selected Resources:
${resourceList}

STRUCTURE:
## Quick Summary
Provide a brief overview (3-4 sentences) covering:
- Common steps to take first (e.g., "Gather your documents before applying")
- Documents you'll need for most resources (ID, proof of address, income, etc.)
- Suggested order/priority (e.g., "Start with #1 while waiting for #2 to process")

🚨 CORE RULES:
1. **Use Web Search**: Find information about these resources to give accurate advice
2. **Plain Language**: Write at 8th grade level - short words, clear sentences, no jargon
3. **Keep It Brief**: 3-4 sentences total
4. **Simple Formatting**: Only use **bold** and bullet points (-)

Return ONLY the "## Quick Summary" section markdown, nothing else.`

        const summaryPromise = (async () => {
          const summaryResult = streamText({
            model: openai("gpt-5"),
            prompt: summaryPrompt,
            maxTokens: 500,
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

          // Stream summary chunks as they arrive
          for await (const chunk of summaryResult.textStream) {
            await writer.write(
              encoder.encode(
                JSON.stringify({
                  type: "summary",
                  content: chunk,
                }) + "\n",
              ),
            )
          }
        })()

        allPromises.push(summaryPromise)

        // Resource generations - all launch immediately
        const resourcePromises = resources.map(async (resource: any, index: number) => {
          const isCATTraining = resource.category === "CAT Trainings" || resource.title?.toLowerCase().includes("cat -")

          // Simplified prompt for CAT trainings
          const catPrompt = `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program.

Generate a CONCISE guide in ${outputLanguage} for registering for this CAT class. Use simple language (8th grade reading level max).

Resource to cover:
Title: ${resource.title}
Service: ${resource.service}
Registration URL: ${resource.source || "See resource for URL"}
${resource.classDate ? `Next Available Class: ${resource.classDate}` : ""}

STRUCTURE:
### ${resource.title}
**How to register:**
- Visit the class registration page to view details and available dates: [Format as proper markdown link using exact URL from Registration URL above]
- Fill out the online registration form with your contact information
- Select your preferred training date from the dropdown menu${resource.classDate ? ` (next class: ${resource.classDate})` : ""}
- Submit the form to complete registration

**Key tip:**
- Register early as spots fill up quickly; the registration form shows how many spots remain for each class date

🚨 CORE RULES:
1. **Keep It Simple**: CAT registration is ONLY through the Wufoo form - do NOT include general Goodwill enrollment steps
2. **Use Resource URL**: Pull the exact registration link from the resource data provided and format it as a proper markdown link
3. **Link Purpose**: The Wufoo registration link contains class details, schedules, and registration - emphasize this is where they learn more
4. **Be Brief**: 4-5 steps maximum
5. **No Extra Info**: Do NOT add sections about documents, general enrollment processes, or calling intake

Return ONLY the markdown content for this one resource (starting with ###), no JSON.`

          // Standard prompt for other resources
          const standardPrompt = `You are creating an action plan for a client enrolled in Goodwill Central Texas's Workforce Advancement Program with career coaching support.

Generate a CONCISE guide in ${outputLanguage} for accessing this specific resource. Use simple language (8th grade reading level max).

Resource to cover:
${resource.title} - ${resource.service} (${resource.providerType})

STRUCTURE:
### ${resource.title}
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

Return ONLY the markdown content for this one resource (starting with ###), no JSON.`

          const resourcePrompt = isCATTraining ? catPrompt : standardPrompt

          const resourceResult = streamText({
            model: openai("gpt-5"),
            prompt: resourcePrompt,
            maxTokens: 800,
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

          // Accumulate full resource content
          let resourceContent = ""
          for await (const chunk of resourceResult.textStream) {
            resourceContent += chunk
          }

          // Send complete resource when done
          await writer.write(
            encoder.encode(
              JSON.stringify({
                type: "resource",
                resourceIndex: index,
                content: resourceContent,
              }) + "\n",
            ),
          )
        })

        allPromises.push(...resourcePromises)

        // Wait for ALL generations to complete
        await Promise.all(allPromises)

        // Send completion
        await writer.write(encoder.encode(JSON.stringify({ type: "complete" }) + "\n"))
        await writer.close()
      } catch (error) {
        console.error("Streaming error:", error)
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: "Failed to generate action plan",
            }) + "\n",
          ),
        )
        await writer.close()
      }
    })()

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
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
