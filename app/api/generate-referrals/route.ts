import { generateText, streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { loadGoodwillContext } from "@/lib/context-loader"

// Category and sub-category mappings
const categoryLabels: Record<string, string> = {
  goodwill: "Goodwill Resources & Programs",
  community: "Local Community Resources",
  government: "Government Benefits",
  jobs: "Job Postings",
  gcta: "GCTA Trainings",
  cat: "CAT Trainings",
}

const subCategoryLabels: Record<string, string> = {
  // Goodwill sub-categories
  "job-placement": "Job Placement Services",
  "career-coaching": "Career Coaching",
  "interview-prep": "Interview Preparation",
  "resume-building": "Resume & Cover Letter",
  "excel-center": "Excel Center High School",
  "workforce-dev": "Workforce Development",
  "financial-coaching": "Financial Coaching",
  "support-services": "Support Services",
  // Community sub-categories
  food: "Food & Nutrition",
  housing: "Housing & Shelter",
  healthcare: "Healthcare Services",
  transportation: "Transportation",
  childcare: "Child Care & Education",
  legal: "Legal Services",
  financial: "Financial Assistance",
  clothing: "Clothing & Household",
  employment: "Employment Support",
  // Government sub-categories
  "food-benefits": "Food Assistance",
  "healthcare-benefits": "Healthcare Coverage",
  "housing-benefits": "Housing Assistance",
  "cash-benefits": "Cash Assistance",
  "family-benefits": "Child & Family Services",
  // Job Postings sub-categories
  "entry-level": "Entry-Level Positions",
  "part-time": "Part-Time Jobs",
  "full-time": "Full-Time Jobs",
  seasonal: "Seasonal & Temporary",
  warehouse: "Warehouse & Logistics",
  retail: "Retail & Customer Service",
  "food-service": "Food Service",
  administrative: "Administrative & Office",
  "healthcare-jobs": "Healthcare & Medical",
  "skilled-trades": "Skilled Trades",
  // GCTA sub-categories
  "it-certs": "IT & Technology",
  "healthcare-certs": "Healthcare Certifications",
  "customer-service": "Customer Service",
  "logistics-training": "Logistics & Warehouse",
  manufacturing: "Manufacturing",
  welding: "Welding",
  hvac: "HVAC",
  forklift: "Forklift Certification",
  cdl: "CDL Training",
  // CAT sub-categories
  "computer-skills": "Computer Skills",
  "microsoft-office": "Microsoft Office",
  "professional-dev": "Professional Development",
  leadership: "Leadership Training",
  communication: "Communication Skills",
  "time-management": "Time Management",
  "financial-literacy": "Financial Literacy",
  "digital-literacy": "Digital Literacy",
}

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

    // Load Goodwill program context
    const goodwillContext = loadGoodwillContext()

    let contextPrompt = ""
    if (isFollowUp && conversationHistory.length > 0) {
      contextPrompt = "\n\nPrevious conversation context:\n"
      conversationHistory.forEach((entry: any, index: number) => {
        contextPrompt += `\nQ${index + 1}: ${entry.prompt}\nA${index + 1}: ${entry.response.question} - ${entry.response.summary}\n`
      })
      contextPrompt += "\nCurrent follow-up question: "
    }

    // Build filter context and instructions
    const hasResourceTypeFilters = filters?.resourceTypes && filters.resourceTypes.length > 0
    const hasCategoryFilters = filters?.categories && filters.categories.length > 0
    const hasSubCategoryFilters = filters?.subCategories && filters?.subCategories.length > 0
    const hasLocationFilter = filters?.location

    let filterContext = ""
    if (hasCategoryFilters || hasSubCategoryFilters || hasResourceTypeFilters || hasLocationFilter) {
      filterContext += "\n\nFILTER INFORMATION PROVIDED BY USER:"

      if (hasCategoryFilters) {
        const categoryNames = filters.categories.map((id: string) => categoryLabels[id] || id).join(", ")
        filterContext += `\n- Main Categories: ${categoryNames}`
      }

      if (hasSubCategoryFilters) {
        const subCategoryNames = filters.subCategories.map((id: string) => subCategoryLabels[id] || id).join(", ")
        filterContext += `\n- Sub-Categories: ${subCategoryNames}`
      }

      if (hasResourceTypeFilters) {
        filterContext += `\n- Resource Types: ${filters.resourceTypes.join(", ")}`
      }
      if (hasLocationFilter) {
        filterContext += `\n- Location: ${filters.location} (ZIP code or city)`
      }
      filterContext += "\n\n⚠️ CRITICAL: DO NOT ask the user for this information - it has already been provided! Use it directly in your web searches."
    }

    // Build filter descriptions for instructions
    let filterTypeDescription = ""
    if (hasSubCategoryFilters) {
      const subCategoryNames = filters.subCategories.map((id: string) => subCategoryLabels[id] || id).join(", ")
      filterTypeDescription = subCategoryNames
    } else if (hasCategoryFilters) {
      const categoryNames = filters.categories.map((id: string) => categoryLabels[id] || id).join(", ")
      filterTypeDescription = categoryNames
    } else if (hasResourceTypeFilters) {
      filterTypeDescription = filters.resourceTypes.join(", ")
    }

    const strictFilterInstructions = (hasCategoryFilters || hasSubCategoryFilters || hasResourceTypeFilters)
      ? `\n\nCRITICAL FILTER REQUIREMENT - STRICT FILTERING ENABLED:
The user has filtered for ONLY these resource types: ${filterTypeDescription}

YOU MUST:
- ONLY return resources that exactly match one of these filtered types
- DO NOT add other resource types to "fill slots"
- If there are fewer than 4 matching resources, return fewer resources
- If you find more than 4 matching resources, return the best 4
- NEVER include resources from categories not in the filter list
- ❌ NEVER hallucinate or invent resources to reach 4 - only return REAL resources found via web search

${hasSubCategoryFilters ? `⚠️ CRITICAL SUB-CATEGORY FILTERING:
- Sub-category filters are VERY SPECIFIC - they narrow down the main category to a specific type
- Example: "Housing & Shelter" means ONLY homeless shelters, transitional housing, emergency housing - NOT food banks, NOT job training
- Example: "Food & Nutrition" means ONLY food banks, food pantries, meal programs - NOT housing, NOT healthcare
- Example: "Healthcare Services" means ONLY medical clinics, health services - NOT food assistance, NOT housing
- DO NOT return resources from the main category that don't match the sub-category
- If sub-category is "Housing & Shelter" → return shelters and housing ONLY, not other community resources
` : ""}
Example: If filtered for "GCTA Trainings" ONLY → return ONLY GCTA training programs, nothing else
Example: If filtered for "Job Postings" ONLY → return ONLY job postings, no trainings or other resources
Example: If filtered for "Housing & Shelter" sub-category → return ONLY housing/shelter resources, NOT food banks or training programs\n`
      : "\n\nBased on the client description provided, try to find up to 4 relevant resources. If you cannot find 4 quality matches, return fewer (minimum 1). Quality over quantity - never hallucinate resources.\n"

    const aiPrompt = isFollowUp
      ? `You are a career case manager AI assistant for Goodwill Central Texas helping a client already enrolled in Goodwill's Workforce Advancement Program with career coaching support.

GOODWILL CENTRAL TEXAS PROGRAM CONTEXT:
${goodwillContext}

${contextPrompt}${prompt}

Provide a helpful, conversational response. Use markdown formatting and web search for ALL factual information (URLs, phone numbers, addresses, program details). Never guess - if you can't find info via web search, say "Contact the organization for details".

Format response as JSON:
{
  "question": "Restate the follow-up question clearly",
  "summary": "Brief summary of your response",
  "content": "Your full response content with markdown formatting"
}

Return ONLY the JSON object, no markdown code blocks.`
      : `You are a resource referral assistant for Goodwill Central Texas. Client is already enrolled in Goodwill's Workforce Advancement Program with career coaching, so DO NOT recommend general Goodwill career coaching/case management.

GOODWILL CENTRAL TEXAS PROGRAM CONTEXT:
${goodwillContext}

${filterContext}
${strictFilterInstructions}

🚨 CORE RULES - READ FIRST 🚨
1. **URL VERIFICATION**: Use web_search to find organizations, copy EXACT URLs from results. NEVER guess/construct URLs - causes 404 errors and harms users. Better 1 real resource than 4 broken links.
2. **STAY ON TOPIC**: Only return resources matching user's request and filters. If filtered for "Housing & Shelter" → ONLY shelters, NOT food banks or training.
3. **BE SPECIFIC**: Find actual programs (e.g., "GCTA - CNA Certification" with dates) NOT generic pages (e.g., "GCTA Class Schedule").
4. **QUALITY OVER QUANTITY**: Return 1-3 REAL resources found via web search, NOT 4 fake/hallucinated ones.
5. **USE PROVIDED FILTERS**: Never ask for location/filters if already provided - use them immediately in searches.
6. **GEOGRAPHIC SPECIFICITY**: Include ZIP/city in all searches (e.g., "shelter Round Rock 78664").

RESOURCE PRIORITIZATION:${
        hasResourceTypeFilters
          ? `\n- STRICT FILTERING ACTIVE - Only return resources matching filtered types\n- Within filtered types, prioritize Goodwill programs (GCTA/CAT/jobs)`
          : `\n- Prioritize Goodwill programs (GCTA Trainings, CAT, job postings) when they match needs\n- Example: Job training need → GCTA courses before community colleges`
      }

RESOURCE TYPES & EXAMPLES:
**Goodwill**: Job postings, retail stores, donation centers (NOT career coaching - client has this)
**Community**: Food banks (specific locations, not homepages), shelters (near client ZIP), transportation, childcare
**Government**: SNAP, Medicaid, housing assistance, TANF, WIC, Social Security
**Job Postings**: ONLY real jobs from Indeed, LinkedIn, WorkInTexas, Glassdoor - NEVER invent jobs
**GCTA/CAT**: Check https://gctatraining.org/class-schedule/ for current offerings with dates

EXAMPLES:
❌ BAD: "GCTA Class Schedule" linking to schedule page
✓ GOOD: "GCTA - CompTIA A+ (Jan 15, 2026)" with course details

❌ BAD: "Food Bank Services" with homepage
✓ GOOD: "Mobile Food Pantry - Dove Springs" with location/hours

FORMATTING (keep BRIEF & SCANNABLE):
- **Title**: 5-6 words max${outputLanguage !== "English" ? `
  - CRITICAL: Use bilingual format: "English Title / ${outputLanguage} Title"
  - Example: "GCTA - Building Maintenance / GCTA - Maintenance avec modules HVAC"
  - Example: "Goodwill Resources & Programs / Recursos y Programas de Goodwill"` : " (e.g., \"GCTA - Medical Assistant Cert\")"}
- **Service**: 1-2 words (e.g., "Healthcare Training")
- **whyItFits**: 15-20 words max
- **eligibility**: 3-5 items, comma-separated (basic requirements ONLY - DO NOT include dates/schedules)
- **classDate**: (GCTA/CAT ONLY) "Starts MM/DD/YYYY-MM/DD/YYYY (schedule)" - e.g., "Starts 1/12/2026-2/20/2026 (Mon-Fri 7am-3pm)"
- **services**: 3-4 items, comma-separated (include duration/what's learned)
- **support**: 2-3 items max
- **contact**: Phone | Address (DO NOT include generic "Hours: Varies by class" text)
- **category**: Exact name from list (Goodwill Resources & Programs, Local Community Resources, Government Benefits, Job Postings, GCTA Trainings, CAT Trainings)
- **providerType**: Goodwill Provided | Community Resource | Government Benefit

⚠️ PRE-GENERATION CHECKLIST (for each resource):
1. Web search "organization + program + location"
2. Copy EXACT URL from search results
3. Verify URL works (not 404)
4. If no specific page found, use main site + "Contact for details"

REQUIRED JSON STRUCTURE:
{
  "question": "What resources can help...",
  "summary": "Brief summary",
  "resources": [
    {
      "number": 1,
      "title": "Org - Program Name",
      "service": "Service type",
      "category": "Exact category name",
      "providerType": "Type from list",
      "whyItFits": "One sentence (15-20 words)",
      "eligibility": "18+, Travis County, HS diploma (3-5 items, NO dates)",
      "classDate": "Starts 1/12/2026-2/20/2026 (Mon-Fri 7am-3pm)" // ONLY for GCTA/CAT
      "services": "Training, certification, coaching (3-4 items)",
      "support": "Grants, placement (2-3 items)",
      "contact": "Phone: [#] | Address: [city]", // NO "Hours: Varies by class"
      "source": "EXACT URL from web search",
      "badge": "domain/path from search"
    }
  ],
  "suggestedFollowUps": [
    "How-to question about accessing first resource",
    "Process question about second resource",
    "Requirement question about third resource"
  ]
}

CRITICAL NOTES:
- DO NOT include "Eligibility:", "Services:", emoji icons in values - UI adds these
- For GCTA/CAT: Put class dates in "classDate" field, NOT in "eligibility"
- For GCTA/CAT: DO NOT include "Hours: Varies by class; call for details" in contact
- Generate resources in order (1, 2, 3, 4) - complete each before next
- Generate in ${outputLanguage}
- Return ONLY JSON, no markdown code blocks

Client description: ${prompt}`

    // Use streaming for follow-up questions
    if (isFollowUp) {
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
          model: openai("gpt-5"),
          prompt: aiPrompt,
          maxTokens: 3000,
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
