import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const {
      prompt,
      conversationHistory = [],
      isFollowUp = false,
      filters,
      outputLanguage = "English",
    } = await request.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    let contextPrompt = ""
    if (isFollowUp && conversationHistory.length > 0) {
      contextPrompt = "\n\nPrevious conversation context:\n"
      conversationHistory.forEach((entry: any, index: number) => {
        contextPrompt += `\nQ${index + 1}: ${entry.prompt}\nA${index + 1}: ${entry.response.question} - ${entry.response.summary}\n`
      })
      contextPrompt += "\nCurrent follow-up question: "
    }

    const aiPrompt = isFollowUp
      ? `You are a social services case manager AI assistant for Goodwill Central Texas. This is a follow-up question based on previous conversation.

${contextPrompt}${prompt}

Provide a helpful, conversational response that directly answers the follow-up question. You can respond in any format that's most appropriate - it could be a simple explanation, additional resources, clarification, or guidance. Be natural and helpful.

Use markdown formatting for better readability:
- Use **bold** for emphasis
- Use bullet points with * for lists
- Use ## for section headers
- Use ### for subsection headers

Format the response as JSON with this structure:
{
  "question": "Restate the follow-up question clearly",
  "summary": "Brief summary of your response",
  "content": "Your full response content with markdown formatting"
}

IMPORTANT: Return ONLY the JSON object, no markdown formatting or code blocks.`
      : `You are a helpful assistant that generates personalized resource referrals for clients seeking assistance. Based on the client description provided, generate exactly 4 relevant resources from the categories below.

CRITICAL SPECIFICITY REQUIREMENTS:
- Find SPECIFIC programs, courses, or services - NOT general websites or class schedule pages
- For GCTA/training programs: Identify specific course names (e.g., "CompTIA A+ Certification Course" NOT "GCTA Class Schedule")
- For food banks: Name specific locations or programs (e.g., "Central Texas Food Bank - East Austin Distribution" NOT "Food Bank Website")
- For job postings: List actual job titles or specific hiring programs (e.g., "Retail Sales Associate at Goodwill North Lamar" NOT "Goodwill Jobs Page")
- Each resource must be actionable and specific enough that the client knows exactly what to sign up for or apply to

EXAMPLES OF GOOD VS BAD RESOURCES:
❌ BAD: "GCTA Class Schedule" with link to class schedule page
✓ GOOD: "CompTIA A+ IT Certification Course" with specific course details and start date

❌ BAD: "Food Bank Services" with general food bank homepage
✓ GOOD: "Mobile Food Pantry - Dove Springs Community Center" with specific location and hours

When the client needs fall into these categories, prioritize these types of resources:

**Goodwill Resources & Programs:**
- Goodwill Central Texas job training programs (IT, healthcare, retail, manufacturing)
- Career coaching and resume services
- Digital literacy training
- Goodwill retail stores for affordable goods
- Goodwill donation centers
- Specific programs: GoodSkills, GoodCareers, Digital Navigator

**Local Community Resources:**
- Food banks: Central Texas Food Bank, local pantries, mobile food markets
- Shelters: ARCH, Salvation Army, local homeless services
- Community organizations: United Way, local churches, neighborhood centers
- Transportation assistance: Capital Metro reduced fare, rideshare programs
- Utility assistance: local energy assistance programs

**Government Benefits:**
- SNAP (food stamps) through Texas HHS
- Medicaid/CHIP enrollment
- Housing assistance: Austin Housing Authority, Section 8, rental assistance
- TANF (Temporary Assistance for Needy Families)
- WIC (Women, Infants, and Children)
- Social Security benefits and disability services

**Job Postings:**
- Current openings at Goodwill Central Texas locations
- WorkInTexas.com job board
- Local employment agencies and staffing companies
- City of Austin jobs
- Major local employers (Dell, IBM, H-E-B, etc.)
- Apprenticeship programs

**GCTA Trainings (Goodwill Career Training Academy):**
- IT certifications (CompTIA, Microsoft, Google)
- Healthcare training (CNA, pharmacy tech, medical assistant)
- Manufacturing and logistics training
- Customer service and retail training
- Entrepreneurship programs
- Financial literacy courses

**CAT Trainings (Career Advancement Training):**
- Advanced skill development programs
- Leadership training
- Professional development workshops
- Industry-specific certifications
- Soft skills training
- Career pathway planning

FORMATTING REQUIREMENTS FOR READABILITY:
Keep ALL content CONCISE and SCANNABLE. Use SHORT phrases, not full sentences.

1. **Title**: Keep SHORT and CLEAR. Maximum 5-6 words. Format: "Organization - Program Name" (e.g., "GCTA - Medical Assistant Cert", "Food Bank - Mobile Pantry")
2. **Service**: One word or short phrase (e.g., "Healthcare Training", "Food Assistance")
3. **Why it fits**: ONE sentence maximum, 15-20 words
4. **Eligibility**: Maximum 3-5 short requirements separated by commas. Example: "18+, Travis County, HS diploma/GED"
5. **Services**: Maximum 3-4 key items with commas. Example: "520-hour training, certification prep, job coaching"
6. **Support**: Maximum 2-3 items. Example: "Full tuition grants, job placement assistance"
7. **Contact**: "Phone: [number] | Address: [city/area] | Hours: [brief]"
8. **Source**: Specific program page URL only

REQUIRED STRUCTURE FOR EACH RESOURCE:
{
  "number": 1,
  "title": "Organization Name - Program Name",
  "service": "Service type",
  "category": "Exact category name from the list",
  "providerType": "Goodwill Provided | Community Resource | Government Benefit",
  "whyItFits": "Brief one-sentence explanation (15-20 words max)",
  "eligibility": "18+, Travis County, HS diploma/GED (3-5 items max)",
  "services": "520-hour training, certification prep, job coaching (3-4 items max)",
  "support": "Tuition grants, job placement (2-3 items max)",
  "contact": "Phone: [number] | Address: [city] | Hours: [brief]",
  "source": "Source reference with specific detailed URL",
  "badge": "specific-program-page.com (not homepage)"
}

CRITICAL FORMATTING RULES:
- DO NOT include "Eligibility:", "Services:", "Support:", or emoji icons in the field values
- DO NOT include "👥", "📋", or "🎯" in the field values
- The UI will add these labels and icons automatically
- Just provide the content directly (e.g., "Open to all families..." not "👥 Eligibility: Open to all families...")

PROVIDER LABELING RULES:
- "Goodwill Provided": Any Goodwill Central Texas service, program, or location
- "Community Resource": Non-profit organizations, faith-based groups, community centers, food banks, shelters
- "Government Benefit": Federal, state, or local government programs, benefits, or services

CATEGORY ASSIGNMENT RULES:
- Use "Goodwill Resources & Programs" for general Goodwill services, career coaching, retail stores, donation centers
- Use "GCTA Trainings" for Goodwill Career Training Academy programs and certifications
- Use "CAT Trainings" for Career Advancement Training programs
- Use "Local Community Resources" for food banks, shelters, community organizations, transportation
- Use "Government Benefits" for SNAP, Medicaid, housing assistance, TANF, WIC, Social Security
- Use "Job Postings" for current job openings and employment opportunities

CRITICAL RULES FOR SOURCES AND SPECIFICITY:
- Source URLs must go directly to the specific program/course/service page - NEVER to homepages, general "services" pages, or class schedule listing pages
- If you find a class schedule page, use web search to find the specific course within it and reference that specific course
- Title must name the specific program (e.g., "CNA Certification Program starting June 2025" NOT "Healthcare Training Programs")
- Badge field should show the specific page domain/path to verify it's not a homepage
- Bad example: title "GCTA Training" with source "gctatraining.org/class-schedule"
- Good example: title "GCTA - Certified Nursing Assistant (CNA) Program" with source "gctatraining.org/programs/healthcare/cna-certification"

For suggested follow-ups, create questions that ask for more details about HOW TO USE or ACCESS the specific resources you provided. Examples:
- "Write a guide to applying for reduced fare" (for transportation resources)
- "Explain the application process for food assistance" (for food resources)
- "What are the eligibility requirements for this job training program?" (for employment resources)
- "How do I schedule an appointment at this location?" (for service resources)

Format the response as JSON with this structure:
{
  "question": "What resources can help...",
  "summary": "Brief summary of what was found",
  "resources": [
    {
      "number": 1,
      "title": "Organization Name - Program Name",
      "service": "Service type",
      "category": "Exact category name from the list above",
      "providerType": "Goodwill Provided | Community Resource | Government Benefit",
      "whyItFits": "Why this resource matches the client's needs",
      "eligibility": "16+ years, Austin/Travis County resident, 200% or less Federal Poverty Guidelines",
      "services": "Career case management, occupational training, job placement assistance",
      "support": "Transportation assistance, professional clothing, educational incentives",
      "contact": "Phone: [number] | [address]",
      "source": "Source reference with specific detailed URL",
      "badge": "specific-program-page.com (not homepage)"
    }
  ],
  "suggestedFollowUps": [
    "How-to question about accessing the first resource",
    "Process question about applying for the second resource",
    "Eligibility or requirement question about the third resource"
  ]
}

IMPORTANT FINAL REMINDERS:
- Be SPECIFIC: Each resource must be a specific program/course/service, not a general website or directory
- Be BRIEF: Keep all text SHORT and SCANNABLE - users should be able to read each field in 2-3 seconds
- MAXIMUM LENGTHS:
  * whyItFits: 15-20 words (one sentence)
  * eligibility: 3-5 short items with commas
  * services: 3-4 key items with commas
  * support: 2-3 items maximum
- Use web search to find current, specific programs that match the client's needs
- Verify URLs go to specific program pages, not homepages or class schedule listings
- Generate all content in ${outputLanguage}. All resource titles, descriptions, contact information, and explanations should be in ${outputLanguage}.
- ALWAYS include the "category" field with one of the exact category names listed above
- ALWAYS include eligibility, services, and support fields WITHOUT the label prefixes or icons
- Return ONLY the JSON object, no markdown formatting or code blocks

Client description: ${prompt}`

    // Use streaming for follow-up questions
    if (isFollowUp) {
      const result = streamText({
        model: openai("gpt-5-mini"),
        prompt: aiPrompt,
        maxTokens: 2000,
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
    }

    // Use standard generation for referrals
    const { text } = await generateText({
      model: openai("gpt-5-mini"),
      prompt: aiPrompt,
      maxTokens: 3000,
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

    let cleanedText = text.trim()

    // Remove markdown code blocks if present
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
    }

    cleanedText = cleanedText.trim()

    let referralData
    try {
      referralData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error("JSON parsing failed:", parseError)
      console.error("Raw response:", text)
      console.error("Cleaned response:", cleanedText)

      // Return a fallback response
      return Response.json(
        {
          error: "Failed to parse AI response",
          rawResponse: text.substring(0, 500), // First 500 chars for debugging
        },
        { status: 500 },
      )
    }

    return Response.json(referralData)
  } catch (error) {
    console.error("Error generating referrals:", error)
    return Response.json({ error: "Failed to generate referrals" }, { status: 500 })
  }
}
