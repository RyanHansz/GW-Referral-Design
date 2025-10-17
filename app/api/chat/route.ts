import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

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
    const { message, history = [], selectedCategories = [], selectedSubCategories = [] } = await request.json()

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

    // Build filter context from selected categories and sub-categories
    let filterContext = ""
    if (selectedCategories.length > 0 || selectedSubCategories.length > 0) {
      filterContext = "\nUSER'S CURRENT FILTERS:\n"

      if (selectedCategories.length > 0) {
        const categoryNames = selectedCategories
          .map((id: string) => categoryLabels[id] || id)
          .join(", ")
        filterContext += `- Main Categories: ${categoryNames}\n`
      }

      if (selectedSubCategories.length > 0) {
        const subCategoryNames = selectedSubCategories
          .map((id: string) => subCategoryLabels[id] || id)
          .join(", ")
        filterContext += `- Sub-Categories: ${subCategoryNames}\n`
      }

      filterContext += "\nPlease focus your response on resources and information that match these selected categories.\n"
    }

    const aiPrompt = `You are a helpful assistant for Goodwill Central Texas career case managers, specializing in information about their programs, services, training opportunities, and community resources.

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
- Keep answers concise and at an 8th grade reading level
- Be direct; avoid introductions.


IMPORTANT CONTEXT
- Location: You Support Goodwill Central Texas career case managers working with low-income job seekers and learners in Austin and surrounding counties (Bastrop, Blanco, Burnet, Caldwell, DeWitt, Fayette, Gillespie, Gonzales, Hays, Lavaca, Lee, Llano, Mason, Travis, Williamson).
- Note that whenever someone asks about GED (GED classes/courses, getting a GED), include Goodwill's Excel Center High School as it may also be a good fit. 

TRUSTED SOURCES
Use these first when trying to find information to respond to a user's request
## Web Links
- https://austindiapers.org/ — Austin Diaper Bank
- https://www.austintexas.gov/ — City of Austin
- https://www.capmetro.org/ — CapMetro (transit)
- https://childcare.hhs.texas.gov/Public/ChildCareSearch — Texas HHS Child Care
- https://coautilities.com/wps/wcm/connect/occ/coa/util/support/customer-assistance — Utilities Assistance
- https://continue.austincc.edu/ — ACC Continuing Education
- https://excelcenterhighschool.org/ — Excel Center High School
- https://www.feedingamerica.org/find-your-local-foodbank — Feeding America
- https://www.gctatraining.org/ — GCTA Training
- https://www.ged.com/ — GED Testing
- https://www.goodwillcentraltexas.org/ — Goodwill Central Texas
- https://www.gsgtalentsolutions.com/ — GSG Talent Solutions
- https://www.hhs.texas.gov/ — Texas Health & Human Services
- https://www.indeed.com/cmp/Goodwill-Central-Texas/jobs — Indeed (GCT Jobs)
- https://library.austintexas.gov/ — Austin Public Library
- https://www.centraltexasfoodbank.org/ — Central TX Food Bank
- https://texaswic.org/ — Texas WIC
- https://www.twc.texas.gov/ — Texas Workforce Commission
- https://www.va.gov/ — U.S. Department of Veterans Affairs
- https://www.wfscapitalarea.com/our-services/childcare/for-parents/ — WFS Capital Area Child Care
- https://wonderlic.com/ — Wonderlic

## Trusted Nonprofits
Foundation Communities, Salvation Army, Any Baby Can, Safe Alliance, Manos de Cristo, El Buen Samaritano, Workforce Solutions (Capital & Rural Area), Lifeworks, American YouthWorks, Skillpoint Alliance, Literacy Coalition, Austin Area Urban League, Austin Career Institute, Capital IDEA, Central Texas Food Bank, St. Vincent De Paul, Southside Community Center, San Marcos Area Food Bank, Community Action, Catholic Charities, Saint Louise House, Jeremiah Program, United Way, Caritas, Austin FreeNet, AUTMHQ, Austin Public Library, ACC, Latinitas, TWC Voc Rehab, Travis County Health & Human Services, Mobile Loaves and Fishes, Community First, Other Ones Foundation, Austin Integral Care, Bluebonnet Trails, Round Rock Area Serving Center, Maximizing Hope, Texas Baptist Children's Home, Hope Alliance, Austin Clubhouse, NAMI, Austin Tenants Council, St. John Community Center, Trinity Center, Blackland Community Center, Rosewood-Zaragoza Community Center, Austin Public Health, The Caring Place, Samaritan Center, Christi Center, The NEST Empowerment Center, Georgetown Project, MAP - Central Texas, Opportunities for Williamson & Burnet Counties.




${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}${filterContext}Current question: ${message}

Provide a helpful response in markdown format with citations. Use proper markdown formatting including:
- **Bold** for emphasis
- [Links](url) for references
- Bullet points for lists
- Headers (##) for sections
- Code blocks when relevant

Respond directly with the markdown content - do not wrap it in JSON or any other format.`

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
