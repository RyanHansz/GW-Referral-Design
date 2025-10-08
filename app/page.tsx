"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  MapPin,
  FileText,
  Upload,
  Sparkles,
  Printer,
  CheckCircle,
  Copy,
  MessageCircle,
  Heart,
  Briefcase,
  GraduationCap,
  Menu,
  Grid3X3,
  ChevronDown,
  Star,
  UserPlus,
  Settings,
  ClipboardList,
  ArrowLeft,
  Plus,
  Building,
  Users,
  Filter,
  Eye,
  RefreshCw,
  User,
  Target,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  Landmark,
  BookOpen,
  CheckSquare,
  Globe,
  Mail,
  Share2,
} from "lucide-react"

// Import the new parseMarkdownToHTML function
import { parseMarkdownToHTML } from "@/lib/markdown"

interface Resource {
  number: number
  title: string
  service: string
  description: string
  whyItFits: string
  contact: string
  source: string
  badge: string
  category?: string // Added category to Resource interface
  // New fields for detailed information
  website?: string
  schedule?: string
  duration?: string
  cost?: string
  locations?: string
  frequency?: string
  requirements?: string
  eligibility?: string
  benefit?: string
  processing?: string
  salary?: string
  openings?: string
  benefits?: string
  startingSalary?: string
  jobPlacement?: string
  salaryIncrease?: string
  prerequisites?: string
  // Added for action plan details
  details?: Array<{ icon: string; label: string; value: string }>
  // eligibility?: string // Duplicate field, removed
  services?: string
  support?: string
}

interface ReferralResponse {
  question: string
  summary: string
  resources?: Resource[]
  suggestedFollowUps?: string[]
  content?: string
}

// Added interface for Action Plan
interface ActionPlan {
  title: string
  summary: string
  content: string
}

const resourceCategories = [
  {
    id: "goodwill",
    label: "Goodwill Resources & Programs",
    icon: Building,
    color: "border-blue-300 bg-blue-50",
    borderColor: "border-blue-300",
    description: "Job training, career services, and Goodwill-specific programs",
  },
  {
    id: "community",
    label: "Local Community Resources",
    icon: Users,
    color: "border-green-300 bg-green-50",
    borderColor: "border-green-300",
    description: "Food banks, shelters, community organizations, and local support",
  },
  {
    id: "government",
    label: "Government Benefits",
    icon: Landmark,
    color: "border-purple-300 bg-purple-50",
    borderColor: "border-purple-300",
    description: "SNAP, Medicaid, housing assistance, and federal/state programs",
  },
  {
    id: "jobs",
    label: "Job Postings",
    icon: Briefcase,
    color: "border-orange-300 bg-orange-50",
    borderColor: "border-orange-300",
    description: "Current job openings, employment opportunities, and hiring events",
  },
  {
    id: "gcta",
    label: "GCTA Trainings",
    icon: GraduationCap,
    color: "border-blue-300 bg-blue-50",
    borderColor: "border-blue-300",
    description: "Goodwill Career Training Academy programs and certifications",
  },
  {
    id: "cat",
    label: "CAT Trainings",
    icon: BookOpen,
    color: "border-teal-300 bg-teal-50",
    borderColor: "border-teal-300",
    description: "Career Advancement Training and specialized skill development",
  },
]

const translateCategory = (category: string, language: string): string => {
  const translations: Record<string, Record<string, string>> = {
    Spanish: {
      "Goodwill Resources & Programs": "Recursos y Programas de Goodwill",
      "Local Community Resources": "Recursos Comunitarios Locales",
      "Government Benefits": "Beneficios Gubernamentales",
      "Job Postings": "Ofertas de Trabajo",
      "GCTA Trainings": "Entrenamientos GCTA",
      "CAT Trainings": "Entrenamientos CAT",
    },
    French: {
      "Goodwill Resources & Programs": "Ressources et Programmes Goodwill",
      "Local Community Resources": "Ressources Communautaires Locales",
      "Government Benefits": "Prestations Gouvernementales",
      "Job Postings": "Offres d'Emploi",
      "GCTA Trainings": "Formations GCTA",
      "CAT Trainings": "Formations CAT",
    },
    German: {
      "Goodwill Resources & Programs": "Goodwill Ressourcen & Programme",
      "Local Community Resources": "Lokale Gemeinschaftsressourcen",
      "Government Benefits": "Staatliche Leistungen",
      "Job Postings": "Stellenausschreibungen",
      "GCTA Trainings": "GCTA Schulungen",
      "CAT Trainings": "CAT Schulungen",
    },
    Portuguese: {
      "Goodwill Resources & Programs": "Recursos e Programas Goodwill",
      "Local Community Resources": "Recursos Comunitários Locais",
      "Government Benefits": "Benefícios Governamentais",
      "Job Postings": "Vagas de Emprego",
      "GCTA Trainings": "Treinamentos GCTA",
      "CAT Trainings": "Treinamentos CAT",
    },
    Italian: {
      "Goodwill Resources & Programs": "Risorse e Programmi Goodwill",
      "Local Community Resources": "Risorse Comunitarie Locali",
      "Government Benefits": "Benefici Governativi",
      "Job Postings": "Offerte di Lavoro",
      "GCTA Trainings": "Formazioni GCTA",
      "CAT Trainings": "Formazioni CAT",
    },
    Chinese: {
      "Goodwill Resources & Programs": "Goodwill资源与项目",
      "Local Community Resources": "当地社区资源",
      "Government Benefits": "政府福利",
      "Job Postings": "职位发布",
      "GCTA Trainings": "GCTA培训",
      "CAT Trainings": "CAT培训",
    },
    Japanese: {
      "Goodwill Resources & Programs": "Goodwillリソース＆プログラム",
      "Local Community Resources": "地域コミュニティリソース",
      "Government Benefits": "政府給付",
      "Job Postings": "求人情報",
      "GCTA Trainings": "GCTAトレーニング",
      "CAT Trainings": "CATトレーニング",
    },
    Korean: {
      "Goodwill Resources & Programs": "Goodwill 자원 및 프로그램",
      "Local Community Resources": "지역 커뮤니티 자원",
      "Government Benefits": "정부 혜택",
      "Job Postings": "채용 공고",
      "GCTA Trainings": "GCTA 교육",
      "CAT Trainings": "CAT 교육",
    },
    Arabic: {
      "Goodwill Resources & Programs": "موارد وبرامج Goodwill",
      "Local Community Resources": "موارد المجتمع المحلي",
      "Government Benefits": "المزايا الحكومية",
      "Job Postings": "إعلانات الوظائف",
      "GCTA Trainings": "تدريبات GCTA",
      "CAT Trainings": "تدريبات CAT",
    },
    Russian: {
      "Goodwill Resources & Programs": "Ресурсы и Программы Goodwill",
      "Local Community Resources": "Местные Общественные Ресурсы",
      "Government Benefits": "Государственные Льготы",
      "Job Postings": "Вакансии",
      "GCTA Trainings": "Обучение GCTA",
      "CAT Trainings": "Обучение CAT",
    },
    Hindi: {
      "Goodwill Resources & Programs": "Goodwill संसाधन और कार्यक्रम",
      "Local Community Resources": "स्थानीय सामुदायिक संसाधन",
      "Government Benefits": " सरकारी लाभ",
      "Job Postings": "नौकरी की पोस्टिंग",
      "GCTA Trainings": "GCTA प्रशिक्षण",
      "CAT Trainings": "CAT प्रशिक्षण",
    },
    Dutch: {
      "Goodwill Resources & Programs": "Goodwill Bronnen & Programma's",
      "Local Community Resources": "Lokale Gemeenschapsbronnen",
      "Government Benefits": "Overheidsuitkeringen",
      "Job Postings": "Vacatures",
      "GCTA Trainings": "GCTA Trainingen",
      "CAT Trainings": "CAT Trainingen",
    },
  }

  // Return translated category if available, otherwise return original
  return translations[language]?.[category] || category
}

export default function ReferralTool() {
  const [userInput, setUserInput] = useState("")
  const [clientDescription, setClientDescription] = useState("") // This state is no longer directly used for user input but might be for other purposes.

  const [showResults, setShowResults] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [caseNotes, setCaseNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [processingTime, setProcessingTime] = useState("")
  const [followUpPrompt, setFollowUpPrompt] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; formatted: string }>>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("text-summary") // Set text-summary as default active tab instead of client-referrals
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessingPDF, setIsProcessingPDF] = useState(false)
  const [pdfAnalysisResult, setPdfAnalysisResult] = useState<string>("")
  const [selectedAssessments, setSelectedAssessments] = useState<string[]>([])
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [includeAssessments, setIncludeAssessments] = useState(true)
  const [includeCaseNotes, setIncludeCaseNotes] = useState(false)
  const [isGeneratingClientReferrals, setIsGeneratingClientReferrals] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      prompt: string
      response: ReferralResponse
      timestamp: string
    }>
  >([])

  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [includeDemographics, setIncludeDemographics] = useState(false)
  const [additionalNotes, setAdditionalNotes] = useState("")

  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    age: "",
    location: "",
    situation: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState<"immediate" | "within_week" | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isInteractingWithDropdown, setIsInteractingWithDropdown] = useState(false)

  // New states for filters
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([])
  const [selectedIncomeRanges, setSelectedIncomeRanges] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedAccessibilityNeeds, setSelectedAccessibilityNeeds] = useState<string[]>([])
  const [error, setError] = useState("")
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([])

  const [selectedResources, setSelectedResources] = useState<any[]>([])
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null)
  const [isGeneratingActionPlan, setIsGeneratingActionPlan] = useState(false)

  const [outputLanguage, setOutputLanguage] = useState<string>("English")

  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const mockHistory = [
    {
      id: 1,
      clientName: "Sarah Johnson",
      searchQuery: "Housing assistance for single mother with two children",
      date: "2024-01-15",
      status: "Completed",
      resourceTypes: ["Housing & Shelter", "Financial Assistance"],
      providerTypes: ["Government", "Community"],
      resultsCount: 8,
    },
    {
      id: 2,
      clientName: "Michael Rodriguez",
      searchQuery: "Employment training for veteran with PTSD",
      date: "2024-01-12",
      status: "Pending Follow-up",
      resourceTypes: ["Employment & Job Training", "Healthcare & Mental Health", "Veterans Services"],
      providerTypes: ["Government", "Goodwill Internal"],
      resultsCount: 12,
    },
    {
      id: 3,
      clientName: "Lisa Chen",
      searchQuery: "Childcare assistance for working parent",
      date: "2024-01-10",
      status: "Completed",
      resourceTypes: ["Childcare", "Financial Assistance"],
      providerTypes: ["Community", "Government"],
      resultsCount: 6,
    },
    {
      id: 4,
      clientName: "Robert Williams",
      searchQuery: "Substance abuse treatment and legal services",
      date: "2024-01-08",
      status: "In Progress",
      resourceTypes: ["Substance Abuse Treatment", "Legal Services"],
      providerTypes: ["Government", "Community"],
      resultsCount: 15,
    },
    {
      id: 5,
      clientName: "Maria Garcia",
      searchQuery: "Food assistance and transportation for elderly client",
      date: "2024-01-05",
      status: "Completed",
      resourceTypes: ["Food Assistance", "Transportation"],
      providerTypes: ["Community", "Government"],
      resultsCount: 9,
    },
  ]

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Goodwill Central Texas - Referral Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              margin: 3px 0 0 0;
              color: #666;
            }
            .exchange {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .question {
              background: #f8fafc;
              padding: 12px;
              border-radius: 8px;
              border-left: 4px solid #2563eb;
              margin-bottom: 12px;
            }
            .question h2 {
              margin: 0;
              font-size: 18px;
              color: #1e293b;
            }
            .summary {
              margin-bottom: 15px;
              font-weight: 500;
            }
            .resource {
              margin-bottom: 15px;
              padding: 12px;
              border: 1px solid #e2e8f0;
              border-radius: 6px;
            }
            .resource-header {
              display: flex;
              align-items: flex-start;
              gap: 10px;
              margin-bottom: 8px;
            }
            .resource-number {
              background: #2563eb;
              color: white;
              width: 24px;
              height: 24px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              flex-shrink: 0;
            }
            .resource-title {
              font-weight: bold;
              color: #1e293b;
            }
            .resource-detail {
              margin: 6px 0;
              color: #475569;
            }
            .resource-contact {
              color: #1e293b;
            }
            .resource-source {
              color: #64748b;
              font-size: 14px;
            }
            .action-plan {
              margin-top: 20px;
              padding: 15px;
              background: #f0f9ff;
              border: 1px solid #0ea5e9;
              border-radius: 8px;
              page-break-inside: avoid;
            }
            .action-plan h3 {
              color: #0c4a6e;
              margin: 0 0 10px 0;
              font-size: 18px;
            }
            .action-plan-summary {
              color: #0369a1;
              font-weight: 500;
              margin-bottom: 12px;
            }
            .action-plan-content {
              color: #374151;
            }
            .action-plan-content h4 {
              color: #1f2937;
              margin: 15px 0 8px 0;
            }
            .action-plan-content ul {
              margin: 8px 0;
              padding-left: 20px;
            }
            .action-plan-content li {
              margin: 4px 0;
            }
            .timestamp {
              text-align: center;
              color: #64748b;
              font-size: 14px;
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #e2e8f0;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 15px;
              }
              .header {
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .exchange { 
                page-break-inside: avoid;
                margin-bottom: 20px;
              }
              .action-plan {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Goodwill Central Texas</h1>
            <p>GenAI Referral Tool - Client Referral Report</p>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          
          ${conversationHistory
            .map(
              (exchange, index) => `
            <div class="exchange">
              <div class="question">
                <h2>${exchange.response.question}</h2>
              </div>
              
              <div class="summary">
                ${exchange.response.summary}
              </div>
              
              ${
                exchange.response.resources
                  ? exchange.response.resources
                      .map(
                        (resource) => `
                <div class="resource">
                  <div class="resource-header">
                    <div class="resource-number">${resource.number}</div>
                    <div>
                      <div class="resource-title">${resource.title} - ${resource.service}</div>
                    </div>
                  </div>
                  <div class="resource-detail"><strong>Why it fits:</strong> ${resource.whyItFits}</div>
                  <div class="resource-detail resource-contact"><strong>Contact:</strong> ${resource.contact}</div>
                  <div class="resource-source"><strong>Source:</strong> ${resource.source} - ${resource.badge}</div>
                </div>
              `,
                      )
                      .join("")
                  : ""
              }
              
              ${
                exchange.response.content
                  ? `
                <div class="content">
                  ${exchange.response.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>")}
                </div>
              `
                  : ""
              }
              
              ${/* Added action plan to print output */ ""}
              ${
                index === conversationHistory.length - 1 && actionPlan
                  ? `
                <div class="action-plan">
                  <h3>${actionPlan.title}</h3>
                  <div class="action-plan-summary">${actionPlan.summary}</div>
                  <div class="action-plan-content">
                    ${actionPlan.content
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/### (.*?)\n/g, "<h4>$1</h4>")
                      .replace(/## (.*?)\n/g, "<h3>$1</h3>")
                      .replace(/- (.*?)\n/g, "<li>$1</li>")
                      .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
                      .replace(/\n\n/g, "</p><p>")
                      .replace(/^(.)/g, "<p>$1")
                      .replace(/(.)$/g, "$1</p>")}
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          `,
            )
            .join("")}
          
          <div class="timestamp">
            Report generated by Goodwill Central Texas GenAI Referral Tool
          </div>
        </body>
      </html>
    `
  }

  const handleDirectPrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = generatePrintHTML()
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    setShowPrintDialog(false)
  }

  const handleEmailPDF = async () => {
    if (!emailAddress.trim()) {
      setEmailError("Please enter an email address")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailAddress)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsSendingEmail(true)
    setEmailError("")

    try {
      const htmlContent = generatePrintHTML()

      const response = await fetch("/api/email-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent,
          recipientEmail: emailAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to send email")
      }

      setEmailSent(true)
    } catch (error: any) {
      console.error("Error sending email:", error)
      setEmailError(error.message || "Failed to send email. Please try again.")
    } finally {
      setIsSendingEmail(false)
    }
  }

  const handlePrintChatThread = () => {
    setShowPrintDialog(true)
    setEmailError("")
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Removed old parseLocationInput function as it's replaced by API call
  // const parseLocationInput = (input: string): string[] => {
  //   const suggestions: string[] = []
  //   const lowerInput = input.toLowerCase()

  //   // Common location patterns
  //   const patterns = [
  //     { pattern: /near|close to|around/, suggestion: "within 5 miles of" },
  //     { pattern: /downtown|city center/, suggestion: "downtown area" },
  //     { pattern: /north|south|east|west/, suggestion: "area" },
  //     { pattern: /within (\d+) miles?/, suggestion: "mile radius" },
  //     { pattern: /my home|where I live/, suggestion: "home area" },
  //     { pattern: /work|office|job/, suggestion: "work area" },
  //     { pattern: /accessible by bus|public transport/, suggestion: "accessible by public transportation" },
  //   ]

  //   patterns.forEach(({ pattern, suggestion }) => {
  //     if (pattern.test(lowerInput)) {
  //       suggestions.push(`${input} (${suggestion})`)
  //     }
  //   })

  //   // Add common location completions
  //   if (input.length > 2) {
  //     const commonAreas = [
  //       `${input} - city center`,
  //       `${input} - surrounding areas`,
  //       `within 10 miles of ${input}`,
  //       `${input} and nearby communities`,
  //     ]
  //     suggestions.push(...commonAreas)
  //   }

  //   return suggestions.slice(0, 4) // Limit to 4 suggestions
  // }

  const handleLocationChange = (value: string) => {
    setLocation(value)
  }

  const selectLocationSuggestion = (suggestion: { display_name: string; formatted: string }) => {
    setLocation(suggestion.formatted)
    setShowLocationSuggestions(false)
    setIsInteractingWithDropdown(false)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setLocation("")
    // Clear other filter states as well
    setSelectedResourceTypes([])
    setSelectedLocations([])
    setSelectedAgeGroups([])
    setSelectedIncomeRanges([])
    setSelectedLanguages([])
    setSelectedAccessibilityNeeds([])
  }

  const toggleResourceType = (type: string) => {
    setSelectedResourceTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const buildPrompt = useCallback(() => {
    const parts = []

    if (selectedResourceTypes.length > 0) {
      parts.push(`Focus on these resource types: ${selectedResourceTypes.join(", ")}.`)
    }

    if (selectedLocations.length > 0) {
      parts.push(`Location preferences: ${selectedLocations.join(", ")}.`)
    }

    if (selectedAgeGroups.length > 0) {
      parts.push(`Age groups: ${selectedAgeGroups.join(", ")}.`)
    }

    if (selectedIncomeRanges.length > 0) {
      parts.push(`Income ranges: ${selectedIncomeRanges.join(", ")}.`)
    }

    if (selectedLanguages.length > 0) {
      parts.push(`Languages: ${selectedLanguages.join(", ")}.`)
    }

    if (selectedAccessibilityNeeds.length > 0) {
      parts.push(`Accessibility needs: ${selectedAccessibilityNeeds.join(", ")}.`)
    }

    return parts.join(" ")
  }, [
    selectedResourceTypes,
    selectedLocations,
    selectedAgeGroups,
    selectedIncomeRanges,
    selectedLanguages,
    selectedAccessibilityNeeds,
  ])

  const handleGenerateReferrals = async (isFollowUp = false, followUpText = "") => {
    // Add check for user input or uploaded files
    if (!isFollowUp && !userInput.trim() && uploadedFiles.length === 0) {
      alert("Please provide some information about your client or upload a file.")
      return
    }

    setIsLoading(true)
    setError("") // Clear previous errors

    try {
      const promptFromFilters = buildPrompt()
      const userText = isFollowUp ? followUpText : userInput.trim()

      const fullPrompt = `${promptFromFilters} ${userText}`.trim()

      if (!fullPrompt.trim()) {
        setError("Please provide more details to generate referrals.")
        return
      }

      const startTime = Date.now()

      const response = await fetch("/api/generate-referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          isFollowUp,
          filters: {
            resourceTypes: selectedResourceTypes,
            locations: selectedLocations,
            ageGroups: selectedAgeGroups,
            incomeRanges: selectedIncomeRanges,
            languages: selectedLanguages,
            accessibilityNeeds: selectedAccessibilityNeeds,
          },
          // Include other relevant data if needed, e.g., clientInfo, caseNotes
          outputLanguage: outputLanguage, // Added output language to request
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate referrals")
      }

      const data = await response.json()
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      const newEntry = {
        prompt: fullPrompt,
        response: data,
        timestamp: new Date().toISOString(),
      }

      setConversationHistory((prev) => [...prev, newEntry])
      setProcessingTime(`${Math.floor(duration / 60)}m ${duration % 60}s`)
      setShowResults(true)
      setSuggestedFollowUps(data.suggestedFollowUps || []) // Update suggested follow-ups

      if (isFollowUp) {
        setFollowUpPrompt("")
      }
    } catch (error: any) {
      console.error("Error generating referrals:", error)
      setError(error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUploadSingle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const supportedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"]

      if (supportedTypes.includes(file.type)) {
        setUploadedFile(file)
        setPdfAnalysisResult("")
      } else {
        alert("Please upload a PDF or image file (PNG, JPEG, WEBP, GIF).")
      }
    }
  }

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    setIsProcessingPDF(true)
    setError("") // Clear previous errors
    const startTime = Date.now()

    try {
      const formData = new FormData()
      formData.append("file", uploadedFile)
      formData.append(
        "filters",
        JSON.stringify({
          resourceTypes: selectedResourceTypes,
          locations: selectedLocations,
          ageGroups: selectedAgeGroups,
          incomeRanges: selectedIncomeRanges,
          languages: selectedLanguages,
          accessibilityNeeds: selectedAccessibilityNeeds,
        }),
      )

      const response = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to process file")
      }

      const data = await response.json()
      const endTime = Date.now()
      const duration = Math.round((endTime - startTime) / 1000)

      setPdfAnalysisResult(data.extractedText)
      setUserInput(data.extractedText)
      setProcessingTime(`${Math.floor(duration / 60)}m ${duration % 60}s`)

      // Automatically generate referrals after file processing
      if (data.extractedText) {
        await handleGenerateReferrals(false, data.extractedText) // Pass extracted text as user input
      }
    } catch (error: any) {
      console.error("Error processing file:", error)
      setError(error.message || "Error processing file. Please try again.")
      alert("Error processing file. Please try again.")
    } finally {
      setIsProcessingPDF(false)
    }
  }

  const removeUploadedFile = () => {
    setUploadedFile(null)
    setPdfAnalysisResult("")
  }

  const handleStartNew = () => {
    setShowResults(false)
    // Clear user input and other relevant states
    setUserInput("")
    setClientDescription("") // Clear if it's still being used elsewhere
    setCaseNotes("")
    setFollowUpPrompt("")
    setConversationHistory([])
    setUploadedFile(null)
    setPdfAnalysisResult("")
    setSelectedCategories([])
    setLocation("")
    setSelectedResourceTypes([])
    setSelectedLocations([])
    setSelectedAgeGroups([])
    setSelectedIncomeRanges([])
    setSelectedLanguages([])
    setSelectedAccessibilityNeeds([])
    setError("")
    setSuggestedFollowUps([])
    setActiveTab("client-referrals") // Reset to default tab
    // Clear action plan related states
    setSelectedResources([])
    setActionPlan(null)
  }

  const handleSuggestedFollowUp = (suggestion: string) => {
    handleGenerateReferrals(true, suggestion)
  }

  // This was causing the filter text to appear in the textarea

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prevFiles) => [...prevFiles, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index))
  }

  const generateReferrals = async () => {
    setIsGenerating(true)
    setError("")
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // alert("Referrals generated successfully!") // Placeholder
      // In a real scenario, this would call the API and update 'results' and 'showResults'
      setResults([
        { id: 1, name: "Sample Referral 1" },
        { id: 2, name: "Sample Referral 2" },
      ])
      setShowResults(true)
    } catch (error) {
      console.error("Error generating referrals:", error)
      setError("Failed to generate referrals. Please try again.")
      // alert("Failed to generate referrals. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const sampleReferralData = {
    question: "What resources can help a single mother with job training, childcare, and housing assistance in Austin?",
    summary:
      "Found comprehensive support including workforce development programs, financial assistance, and community resources specifically designed for single mothers in Central Texas.",
    resources: [
      {
        number: 1,
        title: "Goodwill Central Texas",
        service: "Ready to Work (RTW) Program",
        category: "Goodwill Resources & Programs",
        description:
          "Comprehensive workforce development program connecting Austin/Travis County residents to education and employment opportunities. Includes career case management, occupational training funding, and support services like transportation and professional clothing assistance.",
        whyItFits:
          "Provides complete career pathway support with case management, potential funding for certifications, and wraparound services to address barriers like transportation and professional attire needs.",
        contact: "Phone: (512) 637-7100 | 1015 Norwood Park Blvd, Austin, TX 78701",
        source: "Goodwill Central Texas Ready to Work Program",
        badge: "goodwillcentraltexas.org/ready-to-work",
        // Populate the new structured fields
        eligibility: "16+ years, Austin/Travis County resident, 200% or less Federal Poverty Guidelines",
        services: "Career case management, occupational training, job placement assistance",
        support: "Transportation assistance, professional clothing, educational incentives",
        // <END CHANGE>
        details: [
          {
            icon: "👥",
            label: "Eligibility",
            value: "16+ years, Austin/Travis County resident, 200% or less Federal Poverty Guidelines",
          },
          {
            icon: "📋",
            label: "Services",
            value: "Career case management, occupational training, job placement assistance",
          },
          {
            icon: "🎯",
            label: "Support",
            value: "Transportation assistance, professional clothing, educational incentives",
          },
        ],
      },
      {
        number: 2,
        title: "Goodwill Central Texas",
        service: "Goodwill Connect Program",
        category: "Goodwill Resources & Programs",
        description:
          "Housing stability program that provides financial assistance for rent and utilities while enrolled in occupational training. Includes educational stipends and job placement assistance after training completion.",
        whyItFits:
          "Directly addresses housing stability concerns by providing rent and utility assistance during training, ensuring you can focus on career development without housing insecurity.",
        contact: "Phone: (512) 637-7100 | 1015 Norwood Park Blvd, Austin, TX 78701",
        source: "Goodwill Central Texas Connect Program",
        badge: "goodwillcentraltexas.org/connect",
        // Populate the new structured fields
        eligibility: "Must be enrolled in an occupational training program",
        services: "Rent and utility assistance, educational stipends, job placement assistance",
        support: "Housing stability support during training",
        // <END CHANGE>
        details: [
          { icon: "🏠", label: "Housing Support", value: "Rent and utility assistance during training" },
          { icon: "💰", label: "Stipends", value: "Educational stipends while in occupational training" },
          { icon: "📍", label: "Service Area", value: "Community Initiated Solutions service area" },
        ],
      },
      {
        number: 3,
        title: "Goodwill Central Texas",
        service: "Career Advancement Training (CAT)",
        category: "CAT Trainings",
        description:
          "Essential job readiness skills training including resume building, interview preparation, digital literacy, and financial literacy. Most classes range from 45 minutes to 2 hours, with intensive week-long courses available.",
        whyItFits:
          "Builds foundational employment skills essential for job search success, with flexible scheduling options and comprehensive skill development from digital literacy to financial management.",
        contact: "Phone: (512) 637-7100 | 1015 Norwood Park Blvd, Austin, TX 78701",
        source: "Goodwill Central Texas Career Advancement Training",
        badge: "goodwillcentraltexas.org/career-advancement-training",
        // Populate the new structured fields
        eligibility: "Open to all community members seeking to improve job readiness",
        services: "Resume building, interview preparation, digital literacy, financial literacy",
        support: "Flexible class schedules, intensive courses available",
        // <END CHANGE>
        details: [
          {
            icon: "⏰",
            label: "Duration",
            value: "45 minutes to 2 hours per class, week-long intensive courses available",
          },
          {
            icon: "📚",
            label: "Skills",
            value: "Resume building, interview prep, digital literacy, financial literacy",
          },
          { icon: "💰", label: "Cost", value: "Free for program participants" },
        ],
      },
      {
        number: 4,
        title: "Central Texas Food Bank",
        service: "Mobile Food Pantry Network",
        category: "Local Community Resources",
        description:
          "Free groceries distributed at 200+ community locations throughout Central Texas. No income verification required, serves anyone in need with fresh produce, meat, dairy, and pantry staples.",
        whyItFits:
          "Reduces monthly food expenses by $150-300, allowing more budget for housing, transportation, and career development while ensuring nutritional needs are met for you and your children.",
        contact: "Phone: (512) 684-2550 | Various locations throughout Austin area",
        source: "Central Texas Food Bank Mobile Food Pantry",
        badge: "centraltexasfoodbank.org/get-food/mobile-food-pantry",
        // Populate the new structured fields
        eligibility: "Anyone in need",
        services: "Distribution of fresh produce, meat, dairy, and pantry staples",
        support: "No income verification required",
        // <END CHANGE>
        details: [
          { icon: "📍", label: "Locations", value: "200+ sites across Central Texas" },
          { icon: "🔄", label: "Frequency", value: "Weekly distributions" },
          { icon: "📋", label: "Requirements", value: "None - open to all" },
        ],
      },
      {
        number: 5,
        title: "Austin Travis County Medical Assistance Program (MAP)",
        service: "Healthcare Coverage for Uninsured",
        category: "Local Community Resources",
        description:
          "Provides healthcare coverage for uninsured Travis County residents including primary care, specialty care, prescription medications, and emergency services. Income-based eligibility with sliding fee scale.",
        whyItFits:
          "Ensures healthcare access for you and your family during career transition, removing healthcare costs as a barrier to employment and providing peace of mind for medical needs.",
        contact: "Phone: (512) 978-8130 | Multiple clinic locations throughout Travis County",
        source: "Austin Travis County Medical Assistance Program",
        badge: "austintexas.gov/department/medical-assistance-program",
        // Populate the new structured fields
        eligibility: "Uninsured Travis County residents",
        services: "Primary care, specialty care, prescription medications, emergency services",
        support: "Sliding fee scale based on income",
        // <END CHANGE>
        details: [
          { icon: "🏥", label: "Services", value: "Primary care, specialty care, prescriptions, emergency services" },
          { icon: "💰", label: "Cost", value: "Sliding fee scale based on income" },
          { icon: "📋", label: "Eligibility", value: "Uninsured Travis County residents" },
        ],
      },
      {
        number: 6,
        title: "Capital IDEA",
        service: "Career Training Scholarships",
        category: "Local Community Resources",
        description:
          "Sponsors educational opportunities for low-income adults leading to life-long financial independence. Provides full scholarships for career training programs in high-demand fields like healthcare, technology, and skilled trades.",
        whyItFits:
          "Offers comprehensive scholarship funding for career training in high-paying fields, with wraparound support services to ensure completion and job placement in careers that provide family-sustaining wages.",
        contact: "Phone: (512) 457-8610 | Multiple locations in Austin area",
        source: "Capital IDEA Career Training Scholarships",
        badge: "capitalidea.org",
        // Populate the new structured fields
        eligibility: "Low-income adults",
        services: "Scholarships for high-demand career training programs",
        support: "Wraparound support services for completion and job placement",
        // <END CHANGE>
        details: [
          { icon: "🎓", label: "Training Fields", value: "Healthcare, technology, skilled trades" },
          { icon: "💰", label: "Funding", value: "Full scholarships including tuition, books, supplies" },
          { icon: "📈", label: "Outcomes", value: "Average 300% income increase post-graduation" },
        ],
      },
    ],
  }

  const sampleFollowUpData = {
    question: "What documents do I need to apply for the Ready to Work program and how long does the process take?",
    summary:
      "Ready to Work program requires specific eligibility documentation and follows a structured timeline from intake to job placement, typically taking 2-4 weeks for initial enrollment.",
    content: `## Required Documents for Ready to Work Program

**Primary Documents Needed:**
* **Valid Identification** - Driver's license, state ID, or passport
* **Proof of Residency** - Utility bill, lease agreement, or mail showing Austin/Travis County address
* **Proof of Authorization to Work** - Social Security card, work authorization document, or birth certificate
* **Income Documentation** - Pay stubs, unemployment benefits, or income statements for last 30 days (must be 200% or less of Federal Poverty Guidelines)

**Program Timeline:**
* **Initial Contact**: Career Case Manager assigned within 5 business days
* **Assessment & Enrollment**: Complete needs assessment and Individual Career Plan within 1-2 weeks
* **Career Advancement Training**: Classes range from 45 minutes to 2 hours, week-long course required for occupational training
* **Occupational Training**: 1 week to 4 months depending on certification chosen

**Step-by-Step Process:**
1. **Intake Meeting**: Complete assessment of needs and barriers, create Individual Career Plan
2. **Career Advancement Training**: Improve soft skills, job readiness, resume and interview preparation
3. **Occupational Training** (if applicable): Industry-recognized certification with scholarship application
4. **Job Search Assistance**: Work with Business Solutions Placement Specialist
5. **Employment Support**: 30/60/90/180-day follow-up with retention services

**Important Requirements:**
* Must be at least 16 years of age
* Must live within Austin/Travis County
* Must meet income requirement (200% or less Federal Poverty Guidelines)
* Active participation in weekly career readiness activities required
* Regular communication with Career Case Manager required

**Support Services Available:**
* Transportation assistance (gas cards, bus passes)
* Professional clothing assistance
* Educational incentives for goal completion
* Childcare assistance during training (program dependent)`,
  }

  const generateSampleReferrals = async () => {
    const initialEntry = {
      prompt: "Sample referral request for demonstration purposes",
      response: sampleReferralData,
      timestamp: new Date().toISOString(),
    }

    const followUpEntry = {
      prompt: "What documents do I need to apply for the Ready to Work program and how long does the process take?",
      response: sampleFollowUpData,
      timestamp: new Date(Date.now() + 1000).toISOString(), // 1 second later
    }

    setConversationHistory([initialEntry, followUpEntry])
    // setCurrentReferralData(sampleReferralData) // This line seems to be a leftover and not used. Removed.
    setSelectedResources([])
    setActionPlan(null)
    setShowResults(true) // Ensure results are shown when sample data is loaded
    setSuggestedFollowUps(sampleFollowUpData.suggestedFollowUps || []) // Update suggested follow-ups if they were present in sampleFollowUpData

    const samplePrompt =
      "Generate sample referrals for a single mother needing job training, childcare, and housing assistance in Austin, TX."
    try {
      const response = await fetch("/api/generate-referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: samplePrompt,
          languages: [],
          outputLanguage: outputLanguage, // Added output language to request
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate sample referrals")
      }

      const data = await response.json()
      // Assuming the API returns data in a similar format to conversationHistory entries
      const newEntry = {
        prompt: samplePrompt,
        response: data,
        timestamp: new Date().toISOString(),
      }
      setConversationHistory([newEntry]) // Replace history with sample data
      setShowResults(true)
      setSuggestedFollowUps(data.suggestedFollowUps || [])
    } catch (error) {
      console.error("Error generating sample referrals:", error)
      alert("Failed to load sample referrals. Please try again.")
    }
  }

  const handleCopyToClipboard = () => {
    // This function would typically copy the content of the chat or a specific part of it.
    // For now, it's a placeholder.
    alert("Copy to clipboard functionality not yet implemented.")
  }

  const handleFileProcessed = (extractedText: string) => {
    setUserInput(extractedText)
  }

  const handleClearAll = () => {
    setUserInput("")
    setUploadedFiles([])
    setResults([]) // Assuming 'results' holds the generated referrals
    setError("")
    setSuggestedFollowUps([])
    setConversationHistory([]) // Clear history as well
    setShowResults(false) // Hide results when clearing
    // Clear action plan related states
    setSelectedResources([])
    setActionPlan(null)
  }

  const handleResourceSelection = (resource: Resource, isSelected: boolean) => {
    if (isSelected) {
      setSelectedResources((prev) => [...prev, resource])
    } else {
      setSelectedResources((prev) => prev.filter((r) => r.number !== resource.number))
    }
  }

  const handleSelectAllResources = (resources: Resource[]) => {
    if (resources && selectedResources.length === resources.length) {
      // If all are selected, deselect all
      setSelectedResources([])
    } else if (resources) {
      // Otherwise, select all
      setSelectedResources(resources)
    }
  }

  const generateActionPlan = async () => {
    if (selectedResources.length === 0) return

    setIsGeneratingActionPlan(true)
    setActionPlan(null)

    try {
      const response = await fetch("/api/generate-action-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resources: selectedResources,
          outputLanguage: outputLanguage, // Added output language to request
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate action plan")
      }

      const data: ActionPlan = await response.json()
      setActionPlan(data)
    } catch (error) {
      console.error("Error generating action plan:", error)
      alert("Failed to generate action plan. Please try again.")
    } finally {
      setIsGeneratingActionPlan(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Top Header */}
      <div className="bg-blue-600 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-blue-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">CW</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">CaseWorthy</span>
            </div>
            <div className="bg-blue-700 px-3 py-1 rounded text-sm font-medium hidden md:block">CASE MANAGEMENT</div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700">
              <Grid3X3 className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-white text-blue-600 text-sm font-semibold">RH</AvatarFallback>
              </Avatar>
              <div className="text-sm hidden sm:block">
                <div className="font-medium">Ryan Hansz</div>
                <div className="text-blue-200 text-xs">Auditor</div>
              </div>
              <ChevronDown className="w-4 h-4 text-blue-200" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 relative">
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <div
          className={`
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static fixed inset-y-0 left-0 z-50
          w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out
        `}
        >
          {/* Client Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-600 text-white">TC</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">Test Client </h3>
                <div className="text-gray-400 text-sm flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  03/14/2000
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Client ID: 26513</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 gap-3">
                <Star className="w-4 h-4" />
                Favorites
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 gap-3">
                <Search className="w-4 h-4" />
                Find Client
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 gap-3">
                <UserPlus className="w-4 h-4" />
                Add Client
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 gap-3">
                <Settings className="w-4 h-4" />
                Case Management
              </Button>
              <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-700 gap-3">
                <ClipboardList className="w-4 h-4" />
                Assessments
              </Button>
            </div>
          </nav>

          {/* Training Environment Badge */}
          <div className="p-4">
            <div className="bg-white text-black px-3 py-2 rounded text-xs font-bold text-center">
              <div>TRAINING</div>
              <div>ENVIRONMENT</div>
              <div className="text-gray-600 font-normal mt-1">Version: 8.0.143.1</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Content Header */}
          <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Client Dashboard</h1>
                <p className="text-sm text-gray-600 mt-1">Generate AI-powered referrals for your client</p>
              </div>
              <Button
                variant="outline"
                className="text-orange-600 border-orange-600 hover:bg-orange-50 text-sm px-3 py-1.5 bg-transparent"
              >
                <span className="hidden sm:inline">📄 PAGE OPTIONS</span>
                <span className="sm:hidden">OPTIONS</span>
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-white min-h-full">
              {/* Referral Tool Content */}
              <div className="max-w-4xl mx-auto">
                {showHistory ? (
                  <>
                    {/* History Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHistory(false)}
                            className="text-gray-600"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Search
                          </Button>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg">
                              <ClipboardList className="w-6 h-6" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Search History</h2>
                              <p className="text-muted-foreground">Review your past searches and referral requests</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filter Bar */}
                    <div className="mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="flex-1">
                          <Input placeholder="Search history by client name or query..." className="w-full" />
                        </div>
                        <Button variant="outline" size="sm">
                          <Filter className="w-4 h-4 mr-2" />
                          Filter
                        </Button>
                      </div>
                    </div>

                    {/* History Cards */}
                    <div className="space-y-4">
                      {mockHistory.map((item) => (
                        <Card
                          key={item.id}
                          className="p-6 hover:shadow-md transition-shadow cursor-pointer bg-transparent"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg text-gray-900">{item.clientName}</h3>
                              </div>
                              <p className="text-gray-600 mb-3">{item.searchQuery}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {item.resourceTypes.map((type) => (
                                  <span key={type} className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm">
                                    {type}
                                  </span>
                                ))}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{new Date(item.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{item.resultsCount} resources found</span>
                                <span>•</span>
                                <span>{item.providerTypes.join(", ")}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Re-run
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : !showResults ? (
                  <>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Heart className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">Find Resources </h2>
                            <p className="text-blue-600 font-medium">GenAI Referral Tool</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setShowHistory(true)}
                          className="flex items-center gap-2"
                        >
                          <ClipboardList className="w-4 h-4" />
                          View History
                        </Button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                      <TabsList className="grid w-full grid-cols-3 bg-gray-100">
                        <TabsTrigger
                          value="client-referrals"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <Users className="w-4 h-4" />
                          Suggest based on Client Info{" "}
                          {/* Renamed from "Client Referrals" to shorter "Client Record" */}
                        </TabsTrigger>
                        <TabsTrigger
                          value="text-summary"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          Find Referrals {/* Renamed from "Text Summary" to "Find Referrals" */}
                        </TabsTrigger>
                        <TabsTrigger
                          value="upload-forms"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Forms
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    {activeTab === "text-summary" && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-purple-600" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Let's Find the Right Resources Together
                          </h2>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Share some details about your client's situation, and we'll help you discover the perfect
                            resources and referrals tailored to their specific needs.
                          </p>
                        </div>

                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              {/* Resource Categories */}
                              <div>
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  What type of resource does your client need?
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  Choose the categories that best match your client&#39;s needs.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {resourceCategories.map((category) => {
                                    const Icon = category.icon
                                    const isSelected = selectedCategories.includes(category.id)
                                    return (
                                      <div
                                        key={category.id}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                                          isSelected
                                            ? `bg-blue-50 border-blue-300 border-opacity-100 shadow-md ring-2 ring-blue-200`
                                            : `bg-white border-gray-200 border-opacity-50 hover:border-opacity-75 hover:shadow-sm`
                                        }`}
                                        onClick={() => toggleCategory(category.id)}
                                      >
                                        <div className="flex items-start gap-3">
                                          <div
                                            className={`p-2 rounded-lg ${isSelected ? "bg-blue-100" : "bg-gray-50"}`}
                                          >
                                            <Icon
                                              className={`w-6 h-6 ${isSelected ? "text-blue-700" : "text-gray-600"}`}
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <h4
                                              className={`font-semibold mb-2 ${isSelected ? "text-blue-900" : "text-gray-800"}`}
                                            >
                                              {category.label}
                                            </h4>
                                            <p
                                              className={`text-sm leading-relaxed ${isSelected ? "text-blue-700" : "text-gray-600"}`}
                                            >
                                              {category.description}
                                            </p>
                                          </div>
                                          {isSelected && (
                                            <div className="flex-shrink-0">
                                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                <svg
                                                  className="w-3 h-3 text-white"
                                                  fill="currentColor"
                                                  viewBox="0 0 20 20"
                                                >
                                                  <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                  />
                                                </svg>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Location Filters */}
                              <div className="relative">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                  Location Preferences
                                </h4>
                                <Input
                                  placeholder="Enter location (city, ZIP code, area, etc.)"
                                  value={location}
                                  onChange={(e) => handleLocationChange(e.target.value)}
                                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-background"
                                />

                                <div className="mt-2 text-xs text-gray-500">
                                  <p>
                                    💡 <strong>Examples:</strong> "Round Rock", "78701", "Austin, TX", "downtown Dallas"
                                  </p>
                                </div>
                              </div>

                              {/* Language Preference Filter */}
                              <div className="relative">
                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-blue-600" />
                                  Language Preference
                                </h4>
                                <select
                                  value={outputLanguage}
                                  onChange={(e) => setOutputLanguage(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-background text-gray-900"
                                >
                                  <option value="English">English</option>
                                  <option value="Spanish">Español (Spanish)</option>
                                  <option value="French">Français (French)</option>
                                  <option value="German">Deutsch (German)</option>
                                  <option value="Italian">Italiano (Italian)</option>
                                  <option value="Portuguese">Português (Portuguese)</option>
                                  <option value="Russian">Русский (Russian)</option>
                                  <option value="Chinese">中文 (Chinese)</option>
                                  <option value="Japanese">日本語 (Japanese)</option>
                                  <option value="Korean">한국어 (Korean)</option>
                                  <option value="Arabic">العربية (Arabic)</option>
                                  <option value="Hindi">हिन्दी (Hindi)</option>
                                </select>
                                <div className="mt-2 text-xs text-gray-500">
                                  <p>🌐 Choose the language for generated referrals and action plans</p>
                                </div>
                              </div>

                              {/* Clear All Button */}
                              {(selectedCategories.length > 0 || location) && (
                                <div className="flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAllFilters}
                                    className="text-gray-600 hover:text-gray-800"
                                  >
                                    Clear All Filters
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-3">
                          <label className="font-medium text-gray-900 text-lg">
                            Add details about your client&#39;s needs{" "}
                          </label>
                          <Textarea
                            placeholder="Share anything that would help us find the perfect resources for your client - their goals, challenges, timeline, or what success looks like for them..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="min-h-[200px] text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <button
                          onClick={() => handleGenerateReferrals(false)}
                          disabled={!userInput.trim() || isLoading} // Use userInput for disabling
                          style={{
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            padding: "12px 32px",
                            fontSize: "18px",
                            fontWeight: "500",
                            borderRadius: "6px",
                            border: "none",
                            cursor: !userInput.trim() || isLoading ? "not-allowed" : "pointer",
                            opacity: !userInput.trim() || isLoading ? 0.6 : 1,
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {isLoading ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Generating Referrals...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Generate Referrals
                            </>
                          )}
                        </button>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-3 text-center">
                            Want to see how it works? Try our sample referrals:
                          </p>
                          <button
                            onClick={generateSampleReferrals}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-300"
                          >
                            <Eye className="w-5 h-5" />
                            View Sample Referrals
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "upload-forms" && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-green-600" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Form Processing Made Simple</h2>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Upload any intake form or assessment document, and our AI will automatically extract client
                            information to generate personalized referrals instantly.
                          </p>
                        </div>

                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-6 space-y-6">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className="w-8 h-8 text-blue-600" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Intake Form</h3>
                              <p className="text-gray-600 mb-6">
                                Upload a PDF or image of a handwritten or completed intake form. Our AI will
                                automatically extract client information and generate relevant referrals.
                              </p>
                            </div>

                            {!uploadedFile ? (
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                                <input
                                  type="file"
                                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif"
                                  onChange={handleFileUploadSingle}
                                  className="hidden"
                                  id="file-upload"
                                />
                                <div className="flex flex-col items-center">
                                  <FileText className="w-12 h-12 text-gray-400 mb-4" />
                                  <span className="text-lg font-medium text-gray-900 mb-2">Choose file to upload</span>
                                  <span className="text-gray-500 mb-4">PDF or image (PNG, JPEG, WEBP, GIF)</span>
                                  <Button
                                    type="button"
                                    onClick={triggerFileInput}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    Select File
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-600" />
                                    <div>
                                      <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeUploadedFile}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            )}

                            {uploadedFile && (
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    AI Processing Options
                                  </h4>
                                  <p className="text-blue-800 text-sm mb-4">
                                    The AI will extract client information from the PDF and automatically apply your
                                    selected filters below.
                                  </p>

                                  {/* Same filter options as text summary tab */}
                                  <div className="space-y-4">
                                    {/* Resource Categories */}
                                    <div>
                                      <h5 className="font-medium text-blue-900 mb-2">
                                        Focus on Specific Resource Types
                                      </h5>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {resourceCategories.slice(0, 6).map((category) => {
                                          const Icon = category.icon
                                          const isSelected = selectedCategories.includes(category.id)
                                          return (
                                            <Button
                                              key={category.id}
                                              variant={isSelected ? "default" : "outline"}
                                              size="sm"
                                              className={`text-xs ${
                                                isSelected
                                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                                  : "text-gray-600 hover:bg-gray-100"
                                              }`}
                                              onClick={() => toggleCategory(category.id)}
                                            >
                                              <Icon className="w-4 h-4 mr-1" />
                                              {category.label}
                                            </Button>
                                          )
                                        })}
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="font-medium text-blue-900 mb-2">Resource Provider Types</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <Button
                                          variant={selectedResourceTypes.includes("goodwill") ? "default" : "outline"}
                                          size="sm"
                                          className={`text-xs h-10 ${
                                            selectedResourceTypes.includes("goodwill")
                                              ? "bg-blue-600 text-white hover:bg-blue-700"
                                              : "text-gray-600 hover:bg-gray-100"
                                          }`}
                                          onClick={() => toggleResourceType("goodwill")}
                                        >
                                          <Heart className="w-3 h-3 mr-1" />
                                          Goodwill
                                        </Button>
                                        <Button
                                          variant={selectedResourceTypes.includes("government") ? "default" : "outline"}
                                          size="sm"
                                          className={`text-xs h-10 ${
                                            selectedResourceTypes.includes("government")
                                              ? "bg-blue-600 text-white hover:bg-blue-700"
                                              : "text-gray-600 hover:bg-gray-100"
                                          }`}
                                          onClick={() => toggleResourceType("government")}
                                        >
                                          <Building className="w-3 h-3 mr-1" />
                                          Government
                                        </Button>
                                        <Button
                                          variant={selectedResourceTypes.includes("community") ? "default" : "outline"}
                                          size="sm"
                                          className={`text-xs h-10 ${
                                            selectedResourceTypes.includes("community")
                                              ? "bg-blue-600 text-white hover:bg-blue-700"
                                              : "text-gray-600 hover:bg-gray-100"
                                          }`}
                                          onClick={() => toggleResourceType("community")}
                                        >
                                          <Users className="w-3 h-3 mr-1" />
                                          Community
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Location Filters */}
                                    <div>
                                      <h5 className="font-medium text-blue-900 mb-2">Location Preferences</h5>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <Input
                                          placeholder="ZIP Code"
                                          value={location}
                                          onChange={(e) => setLocation(e.target.value)}
                                          className="border-gray-300"
                                        />
                                        <Input
                                          placeholder="Location"
                                          value={location}
                                          onChange={(e) => setLocation(e.target.value)}
                                          className="border-gray-300"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  onClick={handleProcessFile}
                                  disabled={isProcessingPDF}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                                >
                                  {isProcessingPDF ? (
                                    <>
                                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                                      Processing File & Generating Referrals...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-5 h-5 mr-2" />
                                      Process File & Generate Referrals
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}

                            {pdfAnalysisResult && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  PDF Processed Successfully
                                </h4>
                                <p className="text-green-800 text-sm mb-3">
                                  Client information extracted and referrals generated in {processingTime}
                                </p>
                                <div className="bg-white border border-green-200 rounded p-3 max-h-32 overflow-y-auto">
                                  <p className="text-sm text-gray-700">{pdfAnalysisResult.substring(0, 200)}...</p>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {activeTab === "client-referrals" && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-blue-600" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Personalized Referrals from Client Records
                          </h2>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Generate targeted referrals using your client's existing assessments, case notes, and
                            demographic information for the most relevant recommendations.
                          </p>
                        </div>

                        {/* Client Description */}

                        {/* Client Info Display */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">TC</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900">Test Client</h4>
                              <p className="text-sm text-gray-600">Client ID: TC-001</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 pt-3 border-t border-gray-100">
                            <div className="text-sm">
                              <span className="text-gray-600">Age:</span>
                              <span className="ml-2 font-medium">32 years old</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Location:</span>
                              <span className="ml-2 font-medium">Austin, TX 78701</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Language:</span>
                              <span className="ml-2 font-medium">English, Spanish</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Citizenship:</span>
                              <span className="ml-2 font-medium">US Citizen</span>
                            </div>
                          </div>
                        </div>

                        {/* Information Source Selection */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Select Information Sources</h4>

                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={includeDemographics}
                                onChange={(e) => setIncludeDemographics(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900">Include Demographic Information</span>
                            </label>
                            {includeDemographics && (
                              <div className="ml-7">
                                <p className="text-xs text-gray-600">
                                  Age, location, language preferences, and citizenship status will be included in
                                  referral generation.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Assessment Selection */}
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={includeAssessments}
                                onChange={(e) => setIncludeAssessments(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900">Include Assessments</span>
                            </label>

                            {includeAssessments && (
                              <div className="ml-7 space-y-2">
                                <p className="text-sm text-gray-600 mb-3">Select which assessments to include:</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {[
                                    { id: "intake", name: "Intake Assessment", icon: "🤝" },
                                    { id: "holistic", name: "Holistic Assessment", icon: "📋" },
                                    { id: "ccm", name: "CCM Assessment", icon: "👥" },
                                    { id: "job-readiness", name: "Job Readiness Assessment", icon: "💼" },
                                    { id: "business-solution", name: "Business Solution Assessment", icon: "🧳" },
                                  ].map((assessment) => (
                                    <label key={assessment.id} className="flex items-center space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedAssessments.includes(assessment.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedAssessments([...selectedAssessments, assessment.id])
                                          } else {
                                            setSelectedAssessments(
                                              selectedAssessments.filter((id) => id !== assessment.id),
                                            )
                                          }
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      />
                                      <span className="text-sm text-gray-700 flex items-center gap-2">
                                        <span>{assessment.icon}</span>
                                        {assessment.name}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Case Notes Selection */}
                          <div className="space-y-3">
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                checked={includeCaseNotes}
                                onChange={(e) => setIncludeCaseNotes(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-900">Include Case Notes</span>
                            </label>

                            {includeCaseNotes && (
                              <div className="ml-7 space-y-3">
                                <p className="text-sm text-gray-600 mb-3">Select date range for case notes:</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                                    <Input
                                      type="date"
                                      value={dateRange.start}
                                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                      className="text-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                                    <Input
                                      type="date"
                                      value={dateRange.end}
                                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                      className="text-sm"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Additional Notes</h4>
                          <div className="space-y-2">
                            <label className="block text-sm text-gray-600">
                              Add any additional context or specific needs for referral generation:
                            </label>
                            <textarea
                              value={additionalNotes}
                              onChange={(e) => setAdditionalNotes(e.target.value)}
                              placeholder="e.g., Client has transportation challenges, prefers morning appointments, has young children at home..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                              rows={4}
                            />
                          </div>
                        </div>

                        {/* Generate Button */}
                        <button
                          onClick={async () => {
                            if (!includeAssessments && !includeCaseNotes && !includeDemographics) {
                              alert("Please select at least one information source.")
                              return
                            }

                            setIsGeneratingClientReferrals(true)

                            try {
                              const sources = []
                              if (includeDemographics) {
                                sources.push(
                                  "Client demographics: 32 years old, Austin TX 78701, English/Spanish speaking, US Citizen",
                                )
                              }
                              if (includeAssessments && selectedAssessments.length > 0) {
                                sources.push(`Selected assessments: ${selectedAssessments.join(", ")}`)
                              }
                              if (includeCaseNotes && dateRange.start && dateRange.end) {
                                sources.push(`Case notes from ${dateRange.start} to ${dateRange.end}`)
                              }

                              let prompt = `Generate personalized referrals for Test Client based on the following information sources: ${sources.join("; ")}. Focus on relevant community resources and services that would benefit this client.`

                              if (additionalNotes.trim()) {
                                prompt += ` Additional context: ${additionalNotes.trim()}`
                              }

                              const response = await fetch("/api/generate-referrals", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ prompt, zipCode: "78701", outputLanguage: outputLanguage }),
                              })

                              if (!response.ok) throw new Error("Failed to generate referrals")

                              const data = await response.json()
                              setResults(data.referrals || [])
                              setShowResults(true)
                            } catch (error) {
                              console.error("Error generating client referrals:", error)
                              alert("Failed to generate referrals. Please try again.")
                            } finally {
                              setIsGeneratingClientReferrals(false)
                            }
                          }}
                          disabled={
                            isGeneratingClientReferrals ||
                            (!includeAssessments && !includeCaseNotes && !includeDemographics)
                          }
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          {isGeneratingClientReferrals ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Generating Referrals...
                            </>
                          ) : (
                            <>
                              <Users className="w-4 h-4" />
                              Generate Client Referrals
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Empty State */}
                    {activeTab === "text-summary" && (
                      <div className="mt-12 text-center">
                        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <Search className="w-12 h-12 text-gray-400" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <Button
                        onClick={handleStartNew}
                        variant="outline"
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 bg-transparent"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button onClick={handleCopyToClipboard} variant="ghost" size="sm">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handlePrintChatThread}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-gray-100 hover:text-gray-900"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {conversationHistory.map((exchange, index) => (
                      <div key={index} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                        {/* Question Header */}
                        <div className="bg-gray-100 rounded-2xl p-4 text-center border">
                          <h2 className="text-lg font-medium text-gray-900">{exchange.response.question}</h2>
                        </div>

                        {/* Processing Time - only show for latest */}
                        {index === conversationHistory.length - 1 && (
                          <div className="text-sm text-gray-600">Thought for {processingTime}</div>
                        )}

                        {/* Summary */}
                        <div className="text-gray-900">
                          <p className="font-medium mb-4">{exchange.response.summary}</p>
                        </div>

                        {/* Updated resource display to show category prominently and use category-specific formatting */}
                        {exchange.response.resources && exchange.response.resources.length > 0 ? (
                          <div className="space-y-6">
                            {exchange.response.resources.map((resource) => {
                              // Category-specific styling and icons
                              const getCategoryStyle = (category) => {
                                switch (category) {
                                  case "Goodwill Resources & Programs":
                                    return {
                                      text: "text-blue-800",
                                      icon: "🏢",
                                    }
                                  case "Local Community Resources":
                                    return {
                                      text: "text-green-800",
                                      icon: "🤝",
                                    }
                                  case "Government Benefits":
                                    return {
                                      text: "text-purple-800",
                                      icon: "🏛️",
                                    }
                                  case "Job Postings":
                                    return {
                                      text: "text-orange-800",
                                      icon: "💼",
                                    }
                                  case "GCTA Trainings":
                                    return {
                                      text: "text-indigo-800",
                                      icon: "🎓",
                                    }
                                  case "CAT Trainings":
                                    return {
                                      text: "text-teal-800",
                                      icon: "📚",
                                    }
                                  default:
                                    return {
                                      text: "text-gray-800",
                                      icon: "📋",
                                    }
                                }
                              }

                              const categoryStyle = getCategoryStyle(resource.category)

                              return (
                                <div key={resource.number} className="p-4 rounded-lg border border-gray-200">
                                  <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                      {resource.number}
                                    </span>
                                    <div className="flex-1">
                                      {/* Category Badge */}
                                      <div
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-2 ${categoryStyle.text} bg-white border border-gray-300`}
                                      >
                                        <span>{categoryStyle.icon}</span>
                                        {translateCategory(resource.category, outputLanguage)}
                                      </div>

                                      <h3 className="font-bold text-black text-lg">
                                        {resource.title} - <span className="font-semibold">{resource.service}</span>
                                      </h3>

                                      {/* Updated to use structured fields for eligibility, services, and support */}
                                      {resource.eligibility && (
                                        <p className="text-black mt-2 leading-relaxed">
                                          <strong>Eligibility:</strong> {resource.eligibility}
                                        </p>
                                      )}
                                      {resource.services && (
                                        <p className="text-black mt-2 leading-relaxed">
                                          <strong>Services:</strong> {resource.services}
                                        </p>
                                      )}
                                      {resource.support && (
                                        <p className="text-black mt-2 leading-relaxed">
                                          <strong>Support:</strong> {resource.support}
                                        </p>
                                      )}

                                      {/* Fallback to original whyItFits if structured fields aren't sufficient or present */}
                                      {!resource.eligibility && !resource.services && !resource.support && (
                                        <p className="text-black mt-2 leading-relaxed">
                                          <strong>Why it fits:</strong> {resource.whyItFits}
                                        </p>
                                      )}

                                      {/* Category-specific details */}
                                      <div className="mt-3 space-y-2">
                                        {resource.details &&
                                          resource.details.map((detail, detailIndex) => (
                                            <div key={detailIndex} className="flex items-center gap-1 text-sm">
                                              <span className="font-medium text-black">
                                                {detail.icon} {detail.label}:
                                              </span>
                                              <span className="text-black">{detail.value}</span>
                                            </div>
                                          ))}
                                      </div>

                                      <p className="text-black mt-3">
                                        <strong>Contact:</strong> {resource.contact}
                                      </p>

                                      <p className="text-black text-sm mt-2">
                                        <strong>Source:</strong> {resource.source}
                                        <a
                                          href={`https://${resource.badge}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="ml-2 text-blue-600 hover:text-blue-800 underline text-xs"
                                        >
                                          {resource.badge}
                                        </a>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        ) : exchange.response.content ? (
                          <div className="prose max-w-none text-slate-700">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdownToHTML(exchange.response.content),
                              }}
                            />
                          </div>
                        ) : null}

                        {exchange.response.resources && exchange.response.resources.length > 0 && (
                          <div className="mt-8 p-4 bg-gray-50 rounded-lg border">
                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                              Choose resources for an action plan and individual guides:
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b">
                                <h3 className="text-sm font-medium text-gray-700">
                                  Choose resources for an action plan and individual guides:
                                </h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSelectAllResources(exchange.response.resources)}
                                  className="text-xs"
                                >
                                  {selectedResources.length === exchange.response.resources.length
                                    ? "Deselect All"
                                    : "Select All"}
                                </Button>
                              </div>
                              {exchange.response.resources.map((resource: Resource, resourceIndex: number) => (
                                <div key={resourceIndex} className="flex items-start gap-3 p-3 bg-white rounded border">
                                  <input
                                    type="checkbox"
                                    id={`resource-${resourceIndex}`}
                                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    onChange={(e) => handleResourceSelection(resource, e.target.checked)}
                                    checked={selectedResources.some((r) => r.number === resource.number)}
                                  />
                                  <label htmlFor={`resource-${resourceIndex}`} className="flex-1 cursor-pointer">
                                    <div className="font-medium text-gray-900">{resource.title}</div>
                                    <div className="text-sm text-gray-600">{resource.service}</div>
                                  </label>
                                </div>
                              ))}
                            </div>
                            {selectedResources.length > 0 && (
                              <div className="mt-4 pt-3 border-t">
                                <Button
                                  onClick={generateActionPlan}
                                  disabled={isGeneratingActionPlan}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <FileText className="w-4 h-4 mr-2" />
                                  {isGeneratingActionPlan
                                    ? "Generating Action Plan..."
                                    : `Generate Action Plan (${selectedResources.length} selected)`}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {actionPlan && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600" />
                              {actionPlan.title}
                            </h4>
                            <div className="mb-3 text-black text-base">{actionPlan.summary}</div>
                            <div
                              className="prose prose-sm max-w-none text-gray-800"
                              dangerouslySetInnerHTML={{
                                __html: parseMarkdownToHTML(actionPlan.content),
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Follow-up input */}
                    {conversationHistory.length > 0 && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium text-gray-900 mb-3">Ask a follow-up question:</h4>
                        <div className="space-y-3">
                          <Textarea
                            placeholder="Ask for more specific information, clarify details, or request additional resources..."
                            value={followUpPrompt}
                            onChange={(e) => setFollowUpPrompt(e.target.value)}
                            className="min-h-[80px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Button
                            onClick={() => handleGenerateReferrals(true)}
                            disabled={!followUpPrompt.trim() || isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {isLoading ? "Generating..." : "Ask Follow-up"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                      <Button onClick={handleCopyToClipboard} variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handlePrintChatThread}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <div className="flex justify-center pt-4">
                      <Button
                        onClick={handleStartNew}
                        variant="outline"
                        className="text-blue-600 hover:bg-blue-50 border-blue-200 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Start New Session
                      </Button>
                    </div>

                    {/* Staff Actions */}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Client Information Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={clientInfo.firstName}
                        onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                        className="mt-1"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={clientInfo.lastName}
                        onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                        className="mt-1"
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age" className="text-sm font-medium text-gray-700">
                        Age
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        value={clientInfo.age}
                        onChange={(e) => setClientInfo({ ...clientInfo, age: e.target.value })}
                        className="mt-1"
                        placeholder="Enter age"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Location
                      </Label>
                      <Input
                        id="location"
                        value={clientInfo.location}
                        onChange={(e) => setClientInfo({ ...clientInfo, location: e.target.value })}
                        className="mt-1"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="situation" className="text-sm font-medium text-gray-700">
                      Current Situation
                    </Label>
                    <Textarea
                      id="situation"
                      value={clientInfo.situation}
                      onChange={(e) => setClientInfo({ ...clientInfo, situation: e.target.value })}
                      className="mt-1 min-h-[100px]"
                      placeholder="Describe the client's current situation and needs..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Document Upload Card */}
              <Card className="bg-white shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Document Upload
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      multiple
                    />
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drop files here or{" "}
                      <button onClick={triggerFileInput} className="text-blue-600 hover:text-blue-700 font-medium">
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">Supports PDF, DOC, DOCX, TXT files</p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                            <span className="truncate flex-1 mr-2">{file.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resource Selection */}
            <Card className="bg-white shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Resource Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-blue-600" />
                    Resource Categories
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {resourceCategories.map((category) => {
                      const Icon = category.icon
                      const isSelected = selectedCategories.includes(category.id)
                      return (
                        <Button
                          key={category.id}
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`text-xs sm:text-sm flex-col justify-center px-2 h-16 sm:h-20 ${
                            isSelected
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                          onClick={() => toggleCategory(category.id)}
                        >
                          <Icon className="w-4 h-4 sm:w-6 sm:h-6 mb-1" />
                          <span className="text-center leading-tight">{category.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    Resource Provider Types
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Button
                      variant={selectedResourceTypes.includes("goodwill") ? "default" : "outline"}
                      size="sm"
                      className={`h-12 ${
                        selectedResourceTypes.includes("goodwill")
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => toggleResourceType("goodwill")}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Goodwill Programs
                    </Button>
                    <Button
                      variant={selectedResourceTypes.includes("community") ? "default" : "outline"}
                      size="sm"
                      className={`h-12 ${
                        selectedResourceTypes.includes("community")
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => toggleResourceType("community")}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Community Resources
                    </Button>
                    <Button
                      variant={selectedResourceTypes.includes("government") ? "default" : "outline"}
                      size="sm"
                      className={`h-12 ${
                        selectedResourceTypes.includes("government")
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => toggleResourceType("government")}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Government Services
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Urgency Level
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      variant={urgencyLevel === "immediate" ? "default" : "outline"}
                      size="sm"
                      className={`h-12 ${
                        urgencyLevel === "immediate"
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setUrgencyLevel("immediate")}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Immediate Need
                    </Button>
                    <Button
                      variant={urgencyLevel === "within_week" ? "default" : "outline"}
                      size="sm"
                      className={`h-12 ${
                        urgencyLevel === "within_week"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                      onClick={() => setUrgencyLevel("within_week")}
                    >
                      <Clock className="w-4 h-4 mr-2" />
                      Within a Week
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Output Language</h4>
                  <select
                    value={outputLanguage}
                    onChange={(e) => setOutputLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Italian">Italian (Italiano)</option>
                    <option value="Portuguese">Portuguese (Português)</option>
                    <option value="Chinese">Chinese (中文)</option>
                    <option value="Japanese">Japanese (日本語)</option>
                    <option value="Korean">Korean (한국어)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Russian">Russian (Русский)</option>
                    <option value="Hindi">Hindi (हिन्दी)</option>
                  </select>
                  <p className="text-xs text-gray-600">
                    Select the language for the generated referrals and action plans.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateReferrals}
                disabled={isGenerating || !clientInfo.firstName || !clientInfo.lastName}
                className="generate-referrals-button px-8 py-3 text-lg font-semibold w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Referrals...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate AI Referrals
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={showPrintDialog}
        onOpenChange={(open) => {
          setShowPrintDialog(open)
          if (!open) {
            setEmailAddress("")
            setEmailError("")
            setEmailSent(false)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Print or Email Report</DialogTitle>
            <DialogDescription>Choose how you would like to receive your referral report.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {emailSent ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">Email sent successfully!</p>
                    <p className="text-sm text-green-700 mt-1">
                      The report has been sent to <span className="font-medium">{emailAddress}</span>
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowPrintDialog(false)} className="w-full" variant="outline">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <Button
                  onClick={handleDirectPrint}
                  className="w-full flex items-center justify-center gap-2 bg-transparent"
                  variant="outline"
                >
                  <Printer className="w-4 h-4" />
                  Print Report
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value)
                      setEmailError("")
                    }}
                    disabled={isSendingEmail}
                  />
                  {emailError && <p className="text-sm text-red-600">{emailError}</p>}
                </div>

                <Button
                  onClick={handleEmailPDF}
                  className="w-full flex items-center justify-center gap-2"
                  disabled={isSendingEmail}
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Email PDF Report
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
