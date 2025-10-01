import { generateText } from "ai"
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

    const aiPrompt = `Generate a comprehensive action plan for accessing the following selected resources. Return your response as a JSON object with the following structure:

{
  "title": "Action Plan for Selected Resources",
  "summary": "A brief 2-3 sentence overview of the action plan",
  "content": "Detailed markdown content with the full action plan"
}

Selected Resources:
${resourceList}

For the content field, provide markdown-formatted text that includes:

## Action Plan Summary
- Priority order for approaching the resources
- Common preparation steps that apply to multiple resources  
- Overall timeline and coordination strategy
- Key documents or information needed across resources

## Individual Resource Details
For each resource, provide:
### [Resource Name]
1. **Step-by-step application/enrollment process**
2. **Required documents or information needed**
3. **Timeline expectations (how long it takes)**
4. **Tips for success or common pitfalls to avoid**
5. **Next steps after initial contact**

Use markdown formatting in the content:
- Use **bold** for emphasis
- Use bullet points with * for lists
- Use ## and ### for headers
- Use numbered lists for step-by-step processes

IMPORTANT: 
- Generate all content in ${outputLanguage}. All instructions, steps, and explanations should be in ${outputLanguage}.
- Return ONLY a valid JSON object with title, summary, and content fields.
- The content field should contain the full markdown-formatted action plan.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: aiPrompt,
      temperature: 0.7,
    })

    let cleanedText = text.trim()

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    cleanedText = cleanedText.trim()

    let actionPlanData
    try {
      actionPlanData = JSON.parse(cleanedText)

      if (!actionPlanData.title || !actionPlanData.summary || !actionPlanData.content) {
        throw new Error("Missing required fields in response")
      }
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      console.error("Raw response:", text)
      console.error("Cleaned response:", cleanedText)

      return Response.json({
        title: "Action Plan for Selected Resources",
        summary: "Unable to generate detailed action plan due to processing error. Please try again.",
        content: `# Action Plan Error\n\nWe encountered an issue generating your action plan. Please try again.\n\n## Selected Resources:\n${resourceList
          .split("\n")
          .map((item) => `- ${item}`)
          .join("\n")}`,
      })
    }

    return Response.json(actionPlanData)
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
