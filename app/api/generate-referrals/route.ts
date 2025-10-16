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

    // Build strict filtering instructions if filters are provided
    const hasResourceTypeFilters = filters?.resourceTypes && filters.resourceTypes.length > 0
    const strictFilterInstructions = hasResourceTypeFilters
      ? `\n\nCRITICAL FILTER REQUIREMENT - STRICT FILTERING ENABLED:
The user has filtered for ONLY these resource types: ${filters.resourceTypes.join(", ")}

YOU MUST:
- ONLY return resources that exactly match one of these filtered types
- DO NOT add other resource types to "fill slots"
- If there are fewer than 4 matching resources, return fewer resources (minimum 1)
- If you find more than 4 matching resources, return the best 4
- NEVER include resources from categories not in the filter list
- ❌ NEVER hallucinate or invent resources to reach 4 - only return REAL resources found via web search

Example: If filtered for "GCTA Trainings" ONLY → return ONLY GCTA training programs, nothing else
Example: If filtered for "Job Postings" ONLY → return ONLY job postings, no trainings or other resources\n`
      : "\n\nBased on the client description provided, try to find up to 4 relevant resources. If you cannot find 4 quality matches, return fewer (minimum 1). Quality over quantity - never hallucinate resources.\n"

    const aiPrompt = isFollowUp
      ? `You are a social services case manager AI assistant for Goodwill Central Texas. You are helping a client who is already enrolled in Goodwill's Workforce Advancement Program and receives career coaching support. This is a follow-up question based on previous conversation.

${contextPrompt}${prompt}

Provide a helpful, conversational response that directly answers the follow-up question. You can respond in any format that's most appropriate - it could be a simple explanation, additional resources, clarification, or guidance. Be natural and helpful.

CRITICAL: WEB SEARCH REQUIREMENT FOR ALL INFORMATION:
- ⚠️ ALWAYS use web search to find current, accurate information for your response
- ⚠️ DO NOT rely on foundation knowledge or memory for facts, URLs, phone numbers, addresses, or program details
- ⚠️ If mentioning any URLs, phone numbers, addresses, or specific program details, verify them through web search FIRST
- ❌ DO NOT guess, hallucinate, or construct URLs from memory
- ❌ DO NOT use URLs that just go to homepages when a specific page exists
- ✓ ONLY use information that you have verified through web search results
- ✓ Use web search for EVERY factual claim, contact detail, or link you include
- If you cannot find specific information via web search, state "Contact the organization for details" rather than guessing

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
      : `You are a helpful assistant that generates personalized resource referrals for clients seeking assistance.

IMPORTANT CONTEXT: The client is already enrolled in Goodwill Central Texas's Workforce Advancement Program and receives career coaching and case management support from a Goodwill career case manager. Do NOT recommend general career coaching, case management, or workforce advancement programs from Goodwill since they already have this support.

CRITICAL INSTRUCTION - STAY ON TOPIC:
- ONLY return resources that directly match what the user is asking for
- Do NOT add tangentially related resources to be "helpful"
- If user asks for "GCTA courses" → ONLY return GCTA courses, not food banks or other support services
- If user asks for "food assistance" → ONLY return food programs, not job training
- If user asks for "transportation help" → ONLY return transportation resources, not housing
- Stay narrowly focused on the specific topic requested
- If you cannot find 4 resources that directly match the topic, return fewer resources (minimum 1)
${strictFilterInstructions}

CRITICAL: Generate resources in STRICT NUMERICAL ORDER (1, 2, 3, 4). Start writing resource #1 first, then #2, then #3, then #4. Do NOT skip ahead to generate other resources first.

CRITICAL STREAMING REQUIREMENT:
- Generate resources in strict numerical order: 1, 2, 3, 4
- Resource #1 should be written and completed before moving to resource #2
- DO NOT skip ahead to other resources

RESOURCE PRIORITIZATION:${
        hasResourceTypeFilters
          ? `
- STRICT FILTERING IS ACTIVE - Only return resources matching the filtered types
- Within the filtered types, prioritize SPECIFIC Goodwill programs when they match`
          : `
- ALWAYS prioritize SPECIFIC Goodwill programs (GCTA Trainings, CAT Trainings, job postings, Digital Navigator) FIRST when they match the client's needs
- List Goodwill/GCTA resources as resource #1 and #2 whenever applicable
- Only use Community Resources and Government Benefits to fill remaining slots after considering all relevant specific Goodwill/GCTA options
- Example: If a client needs job training, prioritize GCTA trainings over community college programs`
      }
- DO NOT recommend general "Goodwill Workforce Advancement" or "Career Coaching" since the client already receives this
- Generate each resource completely (with all details) before moving to the next one

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
- Goodwill Central Texas specific job postings (retail, donation center positions, etc.)
- Digital Navigator program (digital literacy training)
- Goodwill retail stores for affordable goods (if client needs clothing, furniture, household items)
- Goodwill donation centers (if relevant to client's needs)
- DO NOT recommend: General career coaching, case management, or workforce advancement (client already has this)

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

⚠️ CRITICAL WARNING FOR JOB POSTINGS:
- ❌ NEVER hallucinate or invent job postings
- ❌ NEVER create fake job titles or positions
- ❌ DO NOT assume jobs exist without web search verification
- ✓ ONLY return job postings you find via web search from TRUSTED sources
- ✓ Each job posting must have a real, verifiable application link
- If you cannot find actual job postings via web search, return FEWER resources
- It is BETTER to return 1-2 real jobs than to invent 4 fake ones
- If NO jobs are found: return 0 resources rather than hallucinating

TRUSTED SOURCES FOR JOB POSTINGS (prioritize these):
- Indeed.com - primary job board
- LinkedIn.com - professional networking and job postings
- WorkInTexas.com - Texas Workforce Commission official job board
- Company career pages: goodwillcentraltexas.org/careers, austintexas.gov/jobs, etc.
- Glassdoor.com - job listings with company reviews
- ZipRecruiter.com - aggregated job postings
- CareerBuilder.com - established job board
- ❌ DO NOT use: random company websites without verification, unverified job aggregators, or suspicious domains

**GCTA Trainings (Goodwill Career Training Academy):**
- IT certifications (CompTIA, Microsoft, Google)
- Healthcare training (CNA, pharmacy tech, medical assistant)
- Manufacturing and logistics training
- Customer service and retail training
- Entrepreneurship programs
- Financial literacy courses
- IMPORTANT: Use web search to check https://gctatraining.org/class-schedule/ for current course offerings and start dates

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
4. **Eligibility**: Maximum 3-5 short requirements separated by commas.
   - For TRAININGS/CLASSES: Include next class start date if available (e.g., "18+, HS diploma/GED, Next class starts Jan 2026")
   - For other resources: Example: "18+, Travis County, income under $50k"
5. **Services**: Maximum 3-4 key items with commas.
   - For TRAININGS/CLASSES: Include duration and schedule (e.g., "520-hour training, Mon-Fri 9am-5pm, certification prep, job coaching")
   - For other resources: Example: "Case management, financial aid, career counseling"
6. **Support**: Maximum 2-3 items. Example: "Full tuition grants, job placement assistance"
7. **Contact**: "Phone: [number] | Address: [city/area] | Hours: [brief]"
8. **Source**: Specific program page URL only

SPECIAL REQUIREMENTS FOR TRAINING/CLASS RESOURCES:
- ALWAYS use web search to find upcoming class start dates and session schedules from https://gctatraining.org/class-schedule/
- Include class timing in eligibility or services field (e.g., "Next cohort: March 2026" or "Rolling enrollment - classes start monthly")
- Include class duration and schedule in services field (e.g., "10-week course, Tuesdays/Thursdays 6-9pm")
- Be specific about enrollment windows if available (e.g., "Applications open Nov 1st")
- If exact dates aren't available via web search, use "Contact for next session dates" and continue generating the resource

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
- Source URLs must go directly to the specific program/course/service page when available
- For GCTA courses: Use web search on https://gctatraining.org/class-schedule/ to find current course offerings and dates, then link to the most specific page available
- Title must name the specific program with dates (e.g., "GCTA - CNA Certification (Oct 20, 2025)" NOT "Healthcare Training Programs")
- Badge field should show the specific page domain/path to verify it's not a homepage
- Bad example: title "GCTA Training" with generic description
- Good example: title "GCTA - Patient Care Technician (Oct 20, 2025)" with specific start date and detailed course info

CRITICAL: WEB SEARCH REQUIREMENT FOR ALL URLs:
- ❌ DO NOT guess, hallucinate, or construct URLs from memory or foundation knowledge
- ❌ DO NOT use URLs that just go to homepages when a specific program page exists
- ✓ ONLY use URLs that you have verified through web search results
- ✓ ONLY link to specific program/course/service pages, not general directories or homepages
- ✓ Use web search to find the most specific, direct URL for each resource
- If you cannot find a specific URL via web search, use the organization's main contact page and note "Contact for program details"
- Example: For "CompTIA A+ Course" → web search "GCTA CompTIA A+ course Austin" → use the specific course page URL from search results
- Example: For "Food Bank Mobile Pantry" → web search "Central Texas Food Bank mobile pantry locations" → use the specific locations/schedule page URL

TRUSTED SOURCES BY RESOURCE TYPE:
**Training Programs:**
- gctatraining.org (GCTA official site)
- goodwillcentraltexas.org (Goodwill official site)
- Official community college websites (.edu domains)
- Official certification body sites (comptia.org, microsoft.com, etc.)

**Government Benefits:**
- yourtexasbenefits.com (Texas HHS official portal)
- ssa.gov (Social Security Administration)
- austintexas.gov (City of Austin official)
- traviscountytx.gov (Travis County official)
- .gov domains in general

**Community Resources:**
- 211texas.org (United Way resource directory)
- Official non-profit websites (verify .org domains)
- centraltexasfoodbank.org
- salvationarmyaustin.org
- Local government resource pages

**Job Postings:** (see dedicated section above)
- Indeed, LinkedIn, WorkInTexas, Glassdoor, ZipRecruiter, CareerBuilder
- Official company career pages

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
- ⚠️ CRITICAL: ALL URLs must come from web search results - DO NOT guess or hallucinate links
- ⚠️ CRITICAL: Verify URLs go to specific program pages via web search, not homepages or class schedule listings
- ⚠️ CRITICAL: ONLY return resources you actually find via web search - NEVER invent or hallucinate resources
- ⚠️ CRITICAL: Returning 1-3 REAL resources is BETTER than returning 4 fake/hallucinated resources
- ⚠️ CRITICAL: If you cannot find quality matches, return fewer resources - quality over quantity ALWAYS
- Use web search for EVERY resource to find current, specific programs and their exact URLs
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

    // Use streaming for referrals with progressive resource display
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()
    const encoder = new TextEncoder()

    // Start async generation
    ;(async () => {
      try {
        // Send initial status
        await writer.write(encoder.encode(JSON.stringify({ type: "status", message: "Searching for resources..." }) + "\n"))

        const result = streamText({
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

        let buffer = ""
        const sentResources = new Set<number>()
        let metadata: any = null
        let metadataSent = false

        // Stream and parse incrementally
        for await (const chunk of result.textStream) {
          buffer += chunk

          // Try to extract complete JSON
          let cleanBuffer = buffer.trim()
          if (cleanBuffer.startsWith("```json")) {
            cleanBuffer = cleanBuffer.replace(/^```json\s*/, "")
          } else if (cleanBuffer.startsWith("```")) {
            cleanBuffer = cleanBuffer.replace(/^```\s*/, "")
          }

          // Try to extract and send metadata early (question and summary)
          if (!metadataSent) {
            try {
              const questionMatch = cleanBuffer.match(/"question"\s*:\s*"([^"]+)"/)
              const summaryMatch = cleanBuffer.match(/"summary"\s*:\s*"([^"]+)"/)

              if (questionMatch && summaryMatch) {
                await writer.write(
                  encoder.encode(
                    JSON.stringify({
                      type: "metadata",
                      data: {
                        question: questionMatch[1],
                        summary: summaryMatch[1],
                      },
                    }) + "\n",
                  ),
                )
                metadataSent = true
              }
            } catch (e) {
              // Metadata not ready yet, continue
            }
          }

          // Try to parse complete resources from buffer
          try {
            // Look for complete resource objects
            const resourceMatches = cleanBuffer.matchAll(/{[\s\S]*?"number"\s*:\s*(\d+)[\s\S]*?"badge"\s*:\s*"[^"]*"[\s\S]*?}/g)

            for (const match of resourceMatches) {
              try {
                const resource = JSON.parse(match[0])
                if (resource.number && resource.title && !sentResources.has(resource.number)) {
                  await writer.write(encoder.encode(JSON.stringify({ type: "resource", data: resource }) + "\n"))
                  sentResources.add(resource.number)
                }
              } catch (e) {
                // Invalid JSON, skip
              }
            }
          } catch (e) {
            // Parsing error, continue accumulating
          }
        }

        // Parse final complete response
        let cleanedText = buffer.trim()
        if (cleanedText.startsWith("```json")) {
          cleanedText = cleanedText.replace(/^```json\s*/, "").replace(/\s*```$/, "")
        } else if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "")
        }
        cleanedText = cleanedText.trim()

        try {
          const fullData = JSON.parse(cleanedText)

          // Send any remaining resources not yet sent
          if (fullData.resources) {
            for (const resource of fullData.resources) {
              if (!sentResources.has(resource.number)) {
                await writer.write(encoder.encode(JSON.stringify({ type: "resource", data: resource }) + "\n"))
                sentResources.add(resource.number)
              }
            }
          }

          // Send metadata
          await writer.write(
            encoder.encode(
              JSON.stringify({
                type: "metadata",
                data: {
                  question: fullData.question,
                  summary: fullData.summary,
                },
              }) + "\n",
            ),
          )

          // Send follow-ups
          if (fullData.suggestedFollowUps) {
            await writer.write(
              encoder.encode(
                JSON.stringify({
                  type: "followups",
                  data: fullData.suggestedFollowUps,
                }) + "\n",
              ),
            )
          }

          // Send completion
          await writer.write(encoder.encode(JSON.stringify({ type: "complete" }) + "\n"))
        } catch (parseError) {
          console.error("JSON parsing failed:", parseError)
          await writer.write(
            encoder.encode(
              JSON.stringify({
                type: "error",
                error: "Failed to parse AI response",
              }) + "\n",
            ),
          )
        }

        await writer.close()
      } catch (error) {
        console.error("Streaming error:", error)
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: "Failed to generate resources",
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
    console.error("Error generating referrals:", error)
    return Response.json({ error: "Failed to generate referrals" }, { status: 500 })
  }
}
