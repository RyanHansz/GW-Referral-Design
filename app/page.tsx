"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Sparkles,
  Printer,
  CheckCircle,
  MessageCircle,
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
  Loader2,
  Landmark,
  BookOpen,
  CheckSquare,
  Globe,
  Mail,
  Share2,
  Handshake,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  StickyNote,
  Save,
} from "lucide-react"
import Image from "next/image"

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
  classDate?: string // For GCTA/CAT training start dates and schedules
}

interface ReferralResponse {
  question: string
  summary: string
  resources?: Resource[]
  suggestedFollowUps?: string[]
  content?: string
}

// Component for rendering action plan with collapsible resource sections (removed - now using simple markdown streaming)

const resourceCategories = [
  {
    id: "goodwill",
    label: "Goodwill Resources & Programs",
    icon: Building,
    color: "border-blue-300 bg-blue-50",
    borderColor: "border-blue-300",
    description: "Job training, career services, and Goodwill-specific programs",
    subCategories: [
      { id: "job-placement", label: "Job Placement Services", description: "Job matching, placement assistance, hiring events" },
      { id: "career-coaching", label: "Career Coaching", description: "One-on-one career guidance and goal setting" },
      { id: "interview-prep", label: "Interview Preparation", description: "Mock interviews, interview skills training" },
      { id: "resume-building", label: "Resume & Cover Letter", description: "Resume writing, editing, and professional documents" },
      { id: "excel-center", label: "Excel Center High School", description: "Free adult high school diploma program" },
      { id: "workforce-dev", label: "Workforce Development", description: "Job readiness, soft skills, workplace preparation" },
      { id: "financial-coaching", label: "Financial Coaching", description: "Budgeting, financial literacy, credit counseling" },
      { id: "support-services", label: "Support Services", description: "Case management, wraparound services, barrier removal" },
    ],
  },
  {
    id: "community",
    label: "Local Community Resources",
    icon: Users,
    color: "border-green-300 bg-green-50",
    borderColor: "border-green-300",
    description: "Food banks, shelters, community organizations, and local support",
    subCategories: [
      { id: "food", label: "Food & Nutrition", description: "Food banks, meal programs, SNAP enrollment" },
      { id: "housing", label: "Housing & Shelter", description: "Emergency shelter, rental assistance, utilities" },
      { id: "healthcare", label: "Healthcare Services", description: "Clinics, mental health, dental care" },
      { id: "transportation", label: "Transportation", description: "Bus passes, rides, gas assistance" },
      { id: "childcare", label: "Child Care & Education", description: "Daycare, after-school programs" },
      { id: "legal", label: "Legal Services", description: "Legal aid, immigration assistance" },
      { id: "financial", label: "Financial Assistance", description: "Cash assistance, bill payment help" },
      { id: "clothing", label: "Clothing & Household", description: "Clothing closets, furniture, household items" },
      { id: "employment", label: "Employment Support", description: "Job search help, resume assistance" },
    ],
  },
  {
    id: "government",
    label: "Government Benefits",
    icon: Landmark,
    color: "border-purple-300 bg-purple-50",
    borderColor: "border-purple-300",
    description: "SNAP, Medicaid, housing assistance, and federal/state programs",
    subCategories: [
      { id: "food-benefits", label: "Food Assistance", description: "SNAP, WIC, food stamps" },
      { id: "healthcare-benefits", label: "Healthcare Coverage", description: "Medicaid, CHIP, Medicare" },
      { id: "housing-benefits", label: "Housing Assistance", description: "Section 8, rental assistance, public housing" },
      { id: "cash-benefits", label: "Cash Assistance", description: "TANF, SSI, disability benefits" },
      { id: "family-benefits", label: "Child & Family Services", description: "Child care subsidies, family support" },
    ],
  },
  {
    id: "jobs",
    label: "Job Postings",
    icon: Briefcase,
    color: "border-orange-300 bg-orange-50",
    borderColor: "border-orange-300",
    description: "Current job openings, employment opportunities, and hiring events",
    subCategories: [
      { id: "entry-level", label: "Entry-Level Positions", description: "Jobs requiring little to no experience" },
      { id: "part-time", label: "Part-Time Jobs", description: "Flexible scheduling, under 30 hours per week" },
      { id: "full-time", label: "Full-Time Jobs", description: "40+ hours per week, benefits eligible" },
      { id: "seasonal", label: "Seasonal & Temporary", description: "Short-term, contract, or seasonal positions" },
      { id: "warehouse", label: "Warehouse & Logistics", description: "Warehouse, shipping, delivery, forklift operators" },
      { id: "retail", label: "Retail & Customer Service", description: "Sales associates, cashiers, customer service reps" },
      { id: "food-service", label: "Food Service", description: "Restaurant, kitchen, food prep, catering" },
      { id: "administrative", label: "Administrative & Office", description: "Clerical, data entry, receptionist, office support" },
      { id: "healthcare-jobs", label: "Healthcare & Medical", description: "CNA, medical assistant, home health, dental" },
      { id: "skilled-trades", label: "Skilled Trades", description: "HVAC, welding, electrical, plumbing, construction" },
    ],
  },
  {
    id: "gcta",
    label: "GCTA Trainings",
    icon: GraduationCap,
    color: "border-blue-300 bg-blue-50",
    borderColor: "border-blue-300",
    description: "Goodwill Career Training Academy programs and certifications",
    subCategories: [
      { id: "it-certs", label: "IT & Technology", description: "CompTIA A+, Network+, Security+, Google IT Support" },
      { id: "healthcare-certs", label: "Healthcare Certifications", description: "CNA, phlebotomy, EKG, medical assistant, patient care" },
      { id: "customer-service", label: "Customer Service", description: "Call center training, customer relations, service skills" },
      { id: "logistics-training", label: "Logistics & Warehouse", description: "Supply chain, inventory management, warehouse operations" },
      { id: "manufacturing", label: "Manufacturing", description: "Production, quality control, machine operation" },
      { id: "welding", label: "Welding", description: "Basic and advanced welding techniques and certifications" },
      { id: "hvac", label: "HVAC", description: "Heating, ventilation, and air conditioning certification" },
      { id: "forklift", label: "Forklift Certification", description: "OSHA-compliant forklift operator training" },
      { id: "cdl", label: "CDL Training", description: "Commercial driver's license preparation" },
    ],
  },
  {
    id: "cat",
    label: "CAT Trainings",
    icon: BookOpen,
    color: "border-teal-300 bg-teal-50",
    borderColor: "border-teal-300",
    description: "Career Advancement Training and specialized skill development",
    subCategories: [
      { id: "career-essentials", label: "Career Advancement Essentials", description: "Required workshop series before GCTA enrollment" },
      { id: "computer-basics", label: "Computer Basics & Keyboarding", description: "Foundational computer skills and typing" },
      { id: "digital-skills", label: "Digital Skills 1:1", description: "Personalized digital literacy training" },
      { id: "financial-empowerment", label: "Financial Empowerment", description: "Personal finance, budgeting, financial wellness" },
      { id: "job-search", label: "Job Search & Indeed Lab", description: "Online job searching and Indeed platform training" },
      { id: "interview-prep", label: "Interview Preparation", description: "Interview skills, practice, and preparation" },
      { id: "job-prep", label: "Job Preparation 1:1", description: "Personalized job readiness coaching" },
      { id: "assessment-prep", label: "Assessment Prep (Wonderlic)", description: "Cognitive assessment preparation for GCTA" },
      { id: "ai-basics", label: "AI Basics", description: "Introduction to artificial intelligence tools" },
      { id: "online-safety", label: "Online Safety", description: "Internet safety and cybersecurity basics" },
    ],
  },
]

// Suggested chat prompts for users to get started
const suggestedChatPrompts = [
  "What GCTA training programs are available for clients needing career skills?",
  "Where can I refer a client for food assistance in the Austin area?",
  "How do I help a client apply for SNAP benefits?",
  "What local resources are available for clients experiencing homelessness?",
  "Tell me about Goodwill's job placement services and career coaching",
  "What are the CAT training options for clients wanting to advance their careers?",
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

const translateLabels = (category: string, language: string) => {
  const defaultLabels = {
    eligibility: "📋 Eligibility:",
    services: "🔧 Services:",
    support: "🤲 Support:",
    contact: "📞 Contact:",
    classDate: "📅 Class Dates:",
    website: "🌐 Website:",
  }

  const labelTranslations: Record<string, Record<string, any>> = {
    Spanish: {
      "GCTA Trainings": {
        eligibility: "📋 Quién Puede Inscribirse:",
        services: "📚 Lo Que Aprenderás:",
        support: "💰 Apoyo Financiero:",
        contact: "📞 Información de Inscripción:",
        classDate: "📅 Fechas de Clase:",
      },
      "CAT Trainings": {
        eligibility: "📋 Quién Puede Inscribirse:",
        services: "📚 Lo Que Aprenderás:",
        support: "💰 Apoyo Financiero:",
        contact: "📞 Información de Inscripción:",
        classDate: "📅 Fechas de Clase:",
      },
      "Job Postings": {
        eligibility: "✅ Requisitos:",
        services: "💼 Detalles del Puesto:",
        support: "🎯 Beneficios y Ventajas:",
        contact: "📧 Aplicar Aquí:",
      },
      "Government Benefits": {
        eligibility: "👥 Quién Califica:",
        services: "🏛️ Beneficios Incluidos:",
        support: "📝 Ayuda con la Solicitud:",
        contact: "📍 Comenzar:",
      },
      "Local Community Resources": {
        eligibility: "🎫 Quién Puede Usar Esto:",
        services: "🤝 Servicios Proporcionados:",
        support: "💙 Apoyo Adicional:",
        contact: "📍 Ubicación y Horario:",
      },
      "Goodwill Resources & Programs": {
        eligibility: "✨ Elegibilidad:",
        services: "🛠️ Servicios Ofrecidos:",
        support: "🎁 Qué Está Incluido:",
        contact: "📞 Información de Contacto:",
      },
    },
    French: {
      "GCTA Trainings": {
        eligibility: "📋 Qui Peut S'Inscrire:",
        services: "📚 Ce Que Vous Apprendrez:",
        support: "💰 Soutien Financier:",
        contact: "📞 Informations d'Inscription:",
        classDate: "📅 Dates de Cours:",
      },
      "CAT Trainings": {
        eligibility: "📋 Qui Peut S'Inscrire:",
        services: "📚 Ce Que Vous Apprendrez:",
        support: "💰 Soutien Financier:",
        contact: "📞 Informations d'Inscription:",
        classDate: "📅 Dates de Cours:",
      },
      "Job Postings": {
        eligibility: "✅ Exigences:",
        services: "💼 Détails du Poste:",
        support: "🎯 Avantages:",
        contact: "📧 Postuler Ici:",
      },
      "Government Benefits": {
        eligibility: "👥 Qui Est Admissible:",
        services: "🏛️ Prestations Incluses:",
        support: "📝 Aide à la Demande:",
        contact: "📍 Commencer:",
      },
      "Local Community Resources": {
        eligibility: "🎫 Qui Peut Utiliser Ceci:",
        services: "🤝 Services Fournis:",
        support: "💙 Soutien Supplémentaire:",
        contact: "📍 Lieu et Horaires:",
      },
      "Goodwill Resources & Programs": {
        eligibility: "✨ Admissibilité:",
        services: "🛠️ Services Offerts:",
        support: "🎁 Ce Qui Est Inclus:",
        contact: "📞 Coordonnées:",
      },
    },
  }

  const categoryLabels = labelTranslations[language]?.[category]

  if (categoryLabels) {
    return categoryLabels
  }

  // Return default English labels based on category
  switch (category) {
    case "GCTA Trainings":
    case "CAT Trainings":
      return {
        eligibility: "📋 Who Can Enroll:",
        services: "📚 What You'll Learn:",
        support: "💰 Financial Support:",
        contact: "📞 Enrollment Info:",
        classDate: "📅 Class Dates:",
        website: "🌐 Website:",
      }
    case "Job Postings":
      return {
        eligibility: "✅ Requirements:",
        services: "💼 Position Details:",
        support: "🎯 Benefits & Perks:",
        contact: "📧 Apply Here:",
        website: "🌐 Website:",
      }
    case "Government Benefits":
      return {
        eligibility: "👥 Who Qualifies:",
        services: "🏛️ Benefits Included:",
        support: "📝 Application Help:",
        contact: "📍 Get Started:",
        website: "🌐 Website:",
      }
    case "Local Community Resources":
      return {
        eligibility: "🎫 Who Can Use This:",
        services: "🤝 Services Provided:",
        support: "💙 Additional Support:",
        contact: "📍 Location & Hours:",
        website: "🌐 Website:",
      }
    case "Goodwill Resources & Programs":
      return {
        eligibility: "✨ Eligibility:",
        services: "🛠️ Services Offered:",
        support: "🎁 What's Included:",
        contact: "📞 Contact Info:",
        website: "🌐 Website:",
      }
    default:
      return defaultLabels
  }
}

export default function ReferralTool() {
  const [userInput, setUserInput] = useState("")
  const [clientDescription, setClientDescription] = useState("") // This state is no longer directly used for user input but might be for other purposes.

  const [showResults, setShowResults] = useState(false)
  const [caseNotes, setCaseNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [processingTime, setProcessingTime] = useState("")
  const [followUpPrompt, setFollowUpPrompt] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([])
  const [location, setLocation] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{ display_name: string; formatted: string }>>([])
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("text-summary")
  const [conversationHistory, setConversationHistory] = useState<
    Array<{
      prompt: string
      response: ReferralResponse
      timestamp: string
    }>
  >([])

  const [selectedResourceTypes, setSelectedResourceTypes] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [filtersExpanded, setFiltersExpanded] = useState(false)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    age: "",
    location: "",
    situation: "",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [urgencyLevel, setUrgencyLevel] = useState<"immediate" | "within_week" | null>(null)

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
  const [actionPlanContent, setActionPlanContent] = useState("")
  const [isGeneratingActionPlan, setIsGeneratingActionPlan] = useState(false)
  const [actionPlanSummary, setActionPlanSummary] = useState("")
  const [actionPlanGuides, setActionPlanGuides] = useState<string[]>([])
  const [currentGuideIndex, setCurrentGuideIndex] = useState(0)

  const [outputLanguage, setOutputLanguage] = useState<string>("English")

  const [showPrintDialog, setShowPrintDialog] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  // Streaming state
  const [streamingStatus, setStreamingStatus] = useState("")
  const [streamingResources, setStreamingResources] = useState<any[]>([])
  const [streamingQuestion, setStreamingQuestion] = useState("")
  const [streamingSummary, setStreamingSummary] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [showActionPlanSection, setShowActionPlanSection] = useState(false)
  const [streamingFollowUpContent, setStreamingFollowUpContent] = useState("")

  // Remove functionality state
  const [removedResourceIds, setRemovedResourceIds] = useState<Set<string>>(new Set())
  const [recentlyRemoved, setRecentlyRemoved] = useState<{
    id: string
    timestamp: number
  } | null>(null)

  // Notes functionality state
  const [resourceNotes, setResourceNotes] = useState<Map<string, string>>(new Map())
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)

  // Chat mode state
  const [chatMessages, setChatMessages] = useState<
    Array<{
      role: "user" | "assistant"
      content: string
      timestamp: string
    }>
  >([])
  const [chatInput, setChatInput] = useState("")
  const [isChatStreaming, setIsChatStreaming] = useState(false)
  const [streamingChatContent, setStreamingChatContent] = useState("")
  const [followUpPrompts, setFollowUpPrompts] = useState<string[]>([])

  // User info state
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [userNameInput, setUserNameInput] = useState("")
  const [userEmailInput, setUserEmailInput] = useState("")
  const [userEmailError, setUserEmailError] = useState("")
  const [userEmailTouched, setUserEmailTouched] = useState(false)
  const [isCheckingUser, setIsCheckingUser] = useState(true)

  // Check if user has provided info on first load
  useEffect(() => {
    const storedUserName = localStorage.getItem("userName")
    const storedUserEmail = localStorage.getItem("userEmail")

    if (storedUserName && storedUserEmail) {
      setUserName(storedUserName)
      setUserEmail(storedUserEmail)
    }
    setIsCheckingUser(false)
  }, [])

  // Simple email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Validate user email and set error message
  const validateUserEmail = (email: string) => {
    if (!email.trim()) {
      setUserEmailError("Email is required")
      return false
    }
    if (!isValidEmail(email)) {
      setUserEmailError("Please enter a valid email address")
      return false
    }
    setUserEmailError("")
    return true
  }

  // Handle user email blur to show validation errors
  const handleUserEmailBlur = () => {
    setUserEmailTouched(true)
    validateUserEmail(userEmailInput)
  }

  // Handle user email change and clear error if valid
  const handleUserEmailChange = (email: string) => {
    setUserEmailInput(email)
    // If email was touched and user is now typing, validate in real-time
    if (userEmailTouched) {
      validateUserEmail(email)
    }
  }

  const handleUserInfoSubmit = () => {
    if (userNameInput.trim() && userEmailInput.trim() && isValidEmail(userEmailInput)) {
      localStorage.setItem("userName", userNameInput.trim())
      localStorage.setItem("userEmail", userEmailInput.trim())
      setUserName(userNameInput.trim())
      setUserEmail(userEmailInput.trim())
    }
  }

  // Generate contextual follow-up prompts based on assistant response
  const generateFollowUpPrompts = (responseContent: string): string[] => {
    const content = responseContent.toLowerCase()

    // Score each topic based on keyword frequency to find the most relevant one
    const topics = [
      {
        name: "housing",
        score: 0,
        keywords: ["housing", "shelter", "homeless", "rent", "eviction", "apartment"],
        prompts: [
          "What emergency shelter options are available in Austin?",
          "How can clients get help with rent or utility assistance?",
          "What documents do clients need for housing assistance?",
          "Are there transitional housing programs available?"
        ]
      },
      {
        name: "food",
        score: 0,
        keywords: ["food", "snap", "nutrition", "meal", "food bank", "hunger", "wic"],
        prompts: [
          "Where are the nearest food banks or food pantries?",
          "What's the process for helping a client apply for SNAP?",
          "Are there meal programs for children or families?",
          "What emergency food resources are available today?"
        ]
      },
      {
        name: "training",
        score: 0,
        keywords: ["gcta", "cat training", "training program", "skill development", "certification"],
        prompts: [
          "What are the enrollment requirements for GCTA programs?",
          "How long do these training programs typically take?",
          "Are there prerequisites for CAT training courses?",
          "What certifications can clients earn through these programs?"
        ]
      },
      {
        name: "employment",
        score: 0,
        keywords: ["resume", "interview", "job search", "job placement", "career coaching", "employment"],
        prompts: [
          "Does Goodwill offer mock interview practice for clients?",
          "How can I access job placement services for my client?",
          "What resume assistance is available?",
          "Are there job fairs or hiring events coming up?"
        ]
      },
      {
        name: "healthcare",
        score: 0,
        keywords: ["medicaid", "health", "medical", "clinic", "insurance", "doctor"],
        prompts: [
          "How do I help a client apply for Medicaid or healthcare?",
          "Where are free or low-cost health clinics in the area?",
          "What mental health resources are available?",
          "Are there dental care resources for clients?"
        ]
      },
      {
        name: "transportation",
        score: 0,
        keywords: ["transportation", "bus", "ride", "transit", "car", "gas"],
        prompts: [
          "How can clients get help with transportation costs?",
          "Are there free bus passes or transit vouchers available?",
          "What transportation resources exist for job interviews?",
          "Are there programs that help with car repairs?"
        ]
      }
    ]

    // Score each topic based on keyword matches
    topics.forEach(topic => {
      topic.keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}`, "gi")
        const matches = content.match(regex)
        if (matches) {
          topic.score += matches.length
        }
      })
    })

    // Find the highest scoring topic
    const topTopic = topics.reduce((max, topic) => topic.score > max.score ? topic : max, topics[0])

    // If we have a clear winner (score > 0), return those prompts
    if (topTopic.score > 0) {
      return topTopic.prompts
    }

    // Fallback general prompts if no topic matches
    return [
      "Can you provide more details about eligibility requirements?",
      "What documents should clients bring?",
      "Are there any income or residency requirements?",
      "How long does the application process typically take?"
    ]
  }

  const generatePrintHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Goodwill Central Texas - Referral Report</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
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
            @page {
              margin: 0.75in 0.5in;
              size: letter;
            }
            @media print {
              * {
                margin: 0;
                padding: 0;
              }
              html, body {
                width: 100%;
                height: 100%;
                margin: 0 !important;
                padding: 0 !important;
              }
              body {
                padding: 0 15px !important;
              }
              .header {
                padding-bottom: 10px;
                margin-bottom: 15px;
                page-break-after: avoid;
                margin-top: 0;
              }
              .header h1 {
                margin: 0;
                padding: 0;
              }
              .header p {
                margin: 3px 0 0 0;
                padding: 0;
              }
              .exchange {
                page-break-inside: avoid;
                margin-bottom: 20px;
              }
              .action-plan {
                page-break-inside: avoid;
              }
            }
            .resource-note {
              margin-top: 12px;
              padding: 10px;
              background: #fef3c7;
              border-left: 3px solid #f59e0b;
              border-radius: 4px;
            }
            .resource-note-label {
              font-weight: 600;
              color: #92400e;
              font-size: 13px;
              margin-bottom: 4px;
            }
            .resource-note-text {
              color: #78350f;
              font-size: 14px;
              line-height: 1.5;
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
                      .filter((resource) => !isResourceRemoved(index, resource.number))
                      .map(
                        (resource) => {
                          const note = getResourceNote(index, resource.number)
                          return `
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
                  ${
                    note
                      ? `
                  <div class="resource-note">
                    <div class="resource-note-label">📝 Case Manager's Note:</div>
                    <div class="resource-note-text">${note.replace(/\n/g, "<br>")}</div>
                  </div>`
                      : ""
                  }
                </div>
              `
                        },
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
                index === conversationHistory.length - 1 && actionPlanContent
                  ? `
                <div class="action-plan">
                  <h3>Action Plan</h3>
                  <div class="action-plan-content">
                    ${parseMarkdownToHTML(actionPlanContent)}
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

  // Remove resource handler
  const handleRemoveResource = (conversationIndex: number, resourceNumber: number) => {
    const resourceId = `${conversationIndex}-${resourceNumber}`
    setRemovedResourceIds((prev) => {
      const newSet = new Set(prev)
      newSet.add(resourceId)
      return newSet
    })
    setRecentlyRemoved({ id: resourceId, timestamp: Date.now() })

    // Auto-clear the undo notification after 5 seconds
    setTimeout(() => {
      setRecentlyRemoved((current) => {
        if (current && current.id === resourceId) {
          return null
        }
        return current
      })
    }, 5000)
  }

  // Undo remove handler
  const handleUndoRemove = () => {
    if (recentlyRemoved) {
      setRemovedResourceIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(recentlyRemoved.id)
        return newSet
      })
      setRecentlyRemoved(null)
    }
  }

  // Check if resource is removed
  const isResourceRemoved = (conversationIndex: number, resourceNumber: number): boolean => {
    const resourceId = `${conversationIndex}-${resourceNumber}`
    return removedResourceIds.has(resourceId)
  }

  // Notes handlers
  const handleSaveNote = (conversationIndex: number, resourceNumber: number, note: string) => {
    const resourceId = `${conversationIndex}-${resourceNumber}`
    setResourceNotes((prev) => {
      const newMap = new Map(prev)
      if (note.trim()) {
        newMap.set(resourceId, note)
      } else {
        newMap.delete(resourceId)
      }
      return newMap
    })
    setEditingNoteId(null)
  }

  const getResourceNote = (conversationIndex: number, resourceNumber: number): string => {
    const resourceId = `${conversationIndex}-${resourceNumber}`
    return resourceNotes.get(resourceId) || ""
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

  const toggleSubCategory = (subCategoryId: string) => {
    setSelectedSubCategories((prev) =>
      prev.includes(subCategoryId) ? prev.filter((id) => id !== subCategoryId) : [...prev, subCategoryId],
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
    // Add check for user input
    if (!isFollowUp && !userInput.trim()) {
      alert("Please provide some information about your client.")
      return
    }

    setIsLoading(true)
    setError("") // Clear previous errors

    // Only clear action plan when starting new search, not for follow-ups
    if (!isFollowUp) {
      setActionPlanContent("")
      setSelectedResources([])
    }

    try {
      const promptFromFilters = buildPrompt()
      const userText = isFollowUp ? followUpText : userInput.trim()

      const fullPrompt = promptFromFilters ? `${userText} ${promptFromFilters}`.trim() : userText.trim()

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
            categories: selectedCategories,
            subCategories: selectedSubCategories,
            location: location,
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

      // Handle streaming for regular referrals
      if (!isFollowUp) {
        setIsStreaming(true)
        setStreamingResources([])
        setStreamingQuestion(userText) // Set to original user input immediately
        setStreamingSummary("")
        setStreamingStatus("Starting...")
        setShowResults(true)
        setShowActionPlanSection(false)

        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader available")

        const decoder = new TextDecoder()
        let buffer = ""
        const resources: any[] = []
        let metadata: any = {}
        let followups: string[] = []

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })

            // Split by newlines to get individual messages
            const lines = buffer.split("\n")
            buffer = lines.pop() || "" // Keep incomplete line in buffer

            for (const line of lines) {
              if (!line.trim()) continue

              try {
                const message = JSON.parse(line)

                switch (message.type) {
                  case "status":
                    setStreamingStatus(message.message)
                    break

                  case "resource":
                    resources.push(message.data)
                    setStreamingResources([...resources])
                    break

                  case "metadata":
                    metadata = message.data
                    // Don't overwrite question - keep original user input
                    setStreamingSummary(message.data.summary || "")
                    break

                  case "followups":
                    followups = message.data
                    setSuggestedFollowUps(message.data)
                    break

                  case "complete":
                    setIsStreaming(false)
                    break

                  case "error":
                    throw new Error(message.error)
                }
              } catch (e) {
                console.error("Failed to parse message:", line, e)
              }
            }
          }

          const endTime = Date.now()
          const duration = Math.round((endTime - startTime) / 1000)

          // Create final conversation entry
          const newEntry = {
            prompt: fullPrompt,
            userPrompt: userText, // Store original user input
            response: {
              question: userText, // Use original user input instead of AI restatement
              summary: metadata.summary || "",
              resources: resources,
              suggestedFollowUps: followups,
            },
            timestamp: new Date().toISOString(),
          }

          setConversationHistory((prev) => [...prev, newEntry])
          setProcessingTime(`${Math.floor(duration / 60)}m ${duration % 60}s`)

          // Show action plan section after a brief delay to let resources render first
          setTimeout(() => {
            setShowActionPlanSection(true)
          }, 500)
        } catch (streamError) {
          console.error("Streaming error:", streamError)
          setError("Error while streaming results")
          setIsStreaming(false)
        }
      } else {
        // Handle follow-up with streaming
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader available")

        const decoder = new TextDecoder()
        let fullContent = ""
        let buffer = ""
        setStreamingFollowUpContent("")

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            buffer += chunk

            // Try to extract the content field from the JSON as it streams
            try {
              // Look for content field in the buffer
              const contentMatch = buffer.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)/)
              if (contentMatch) {
                // Unescape the content
                const extractedContent = contentMatch[1]
                  .replace(/\\n/g, "\n")
                  .replace(/\\"/g, '"')
                  .replace(/\\\\/g, "\\")
                setStreamingFollowUpContent(extractedContent)
              }
            } catch (e) {
              // If parsing fails, continue accumulating
            }

            fullContent = buffer
          }

          const endTime = Date.now()
          const duration = Math.round((endTime - startTime) / 1000)

          // Parse the complete JSON response
          let parsedData
          try {
            // Clean up any markdown code blocks
            let cleanContent = fullContent.trim()
            if (cleanContent.startsWith("```json")) {
              cleanContent = cleanContent.replace(/^```json\s*/, "").replace(/\s*```$/, "")
            } else if (cleanContent.startsWith("```")) {
              cleanContent = cleanContent.replace(/^```\s*/, "").replace(/\s*```$/, "")
            }
            parsedData = JSON.parse(cleanContent)
            // Override question with original user input
            parsedData.question = userText
          } catch (parseError) {
            console.error("Failed to parse follow-up response:", parseError)
            parsedData = {
              question: userText, // Use original user input
              summary: "Response received",
              content: fullContent,
            }
          }

          const newEntry = {
            prompt: fullPrompt,
            userPrompt: userText, // Store original user input
            response: parsedData,
            timestamp: new Date().toISOString(),
          }

          setConversationHistory((prev) => [...prev, newEntry])
          setProcessingTime(`${Math.floor(duration / 60)}m ${duration % 60}s`)
          setStreamingFollowUpContent("")
          setFollowUpPrompt("")
        } catch (streamError) {
          console.error("Follow-up streaming error:", streamError)
          setError("Error while streaming follow-up response")
        }
      }
    } catch (error: any) {
      console.error("Error generating referrals:", error)
      setError(error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatStreaming) return

    const userMessage = chatInput.trim()
    const timestamp = new Date().toISOString()

    // Add user message to chat
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
      },
    ])
    setChatInput("")
    setIsChatStreaming(true)
    setStreamingChatContent("")
    setFollowUpPrompts([]) // Clear follow-ups when sending new message

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.slice(-10), // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get chat response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Update streaming content directly with accumulated buffer
          setStreamingChatContent(buffer)
        }
      }

      // Add the final assistant message with the complete buffer
      if (buffer.trim()) {
        const assistantMessage = {
          role: "assistant" as const,
          content: buffer.trim(),
          timestamp: new Date().toISOString(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])
        // Generate contextual follow-up prompts
        setFollowUpPrompts(generateFollowUpPrompts(buffer.trim()))
      }
    } catch (error) {
      console.error("Error sending chat message:", error)
      // Don't alert - the streaming content should have been displayed
      const errorMessage = {
        role: "assistant" as const,
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
      setFollowUpPrompts([]) // Clear follow-ups on error
    } finally {
      setIsChatStreaming(false)
      setStreamingChatContent("")
    }
  }

  // Helper function to send a specific message (used by suggested prompts)
  const sendChatMessage = async (message: string) => {
    if (!message.trim() || isChatStreaming) return

    const userMessage = message.trim()
    const timestamp = new Date().toISOString()

    // Add user message to chat
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userMessage,
        timestamp,
      },
    ])
    setChatInput("")
    setIsChatStreaming(true)
    setStreamingChatContent("")
    setFollowUpPrompts([]) // Clear follow-ups when sending new message

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.slice(-10), // Send last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get chat response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Update streaming content directly with accumulated buffer
          setStreamingChatContent(buffer)
        }
      }

      // Add the final assistant message with the complete buffer
      if (buffer.trim()) {
        const assistantMessage = {
          role: "assistant" as const,
          content: buffer.trim(),
          timestamp: new Date().toISOString(),
        }
        setChatMessages((prev) => [...prev, assistantMessage])
        // Generate contextual follow-up prompts
        setFollowUpPrompts(generateFollowUpPrompts(buffer.trim()))
      }
    } catch (error) {
      console.error("Error sending chat message:", error)
      const errorMessage = {
        role: "assistant" as const,
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setChatMessages((prev) => [...prev, errorMessage])
      setFollowUpPrompts([]) // Clear follow-ups on error
    } finally {
      setIsChatStreaming(false)
      setStreamingChatContent("")
    }
  }

  const handleStartNew = () => {
    setShowResults(false)
    // Clear user input and other relevant states
    setUserInput("")
    setClientDescription("") // Clear if it's still being used elsewhere
    setCaseNotes("")
    setFollowUpPrompt("")
    setConversationHistory([])
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
    setActiveTab("text-summary") // Reset to default tab
    // Clear action plan related states
    setSelectedResources([])
    setActionPlanContent("")
  }

  const handleSuggestedFollowUp = (suggestion: string) => {
    handleGenerateReferrals(true, suggestion)
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
      timestamp: new Date(Date.now() + 1000).toISOString(),
    }

    setConversationHistory([initialEntry, followUpEntry])
    setSelectedResources([])
    setActionPlanContent("")
    setShowResults(true)
    setSuggestedFollowUps(sampleFollowUpData.suggestedFollowUps || [])
    // </CHANGE>
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
    setActionPlanContent("")
  }

  const handleResourceSelection = (resource: Resource, isSelected: boolean) => {
    if (isSelected) {
      setSelectedResources((prev) => [...prev, resource])
    } else {
      setSelectedResources((prev) => prev.filter((r) => r.number !== resource.number))
    }
  }

  const handleSelectAllResources = (resources: Resource[], conversationIndex: number) => {
    if (resources) {
      // Filter out removed resources
      const availableResources = resources.filter(
        (resource) => !isResourceRemoved(conversationIndex, resource.number)
      )

      if (selectedResources.length === availableResources.length) {
        // If all available resources are selected, deselect all
        setSelectedResources([])
      } else {
        // Otherwise, select all available resources
        setSelectedResources(availableResources)
      }
    }
  }

  const generateActionPlan = async () => {
    if (selectedResources.length === 0) return

    setIsGeneratingActionPlan(true)
    setActionPlanContent("")
    setActionPlanSummary("")
    setActionPlanGuides([])
    setCurrentGuideIndex(0)

    try {
      // Find conversation index for selected resources and add notes
      const resourcesWithNotes = selectedResources.map((resource) => {
        // Find the conversation index for this resource
        let conversationIndex = 0
        conversationHistory.forEach((exchange, idx) => {
          if (exchange.response.resources?.some((r) => r.number === resource.number && r.title === resource.title)) {
            conversationIndex = idx
          }
        })

        const note = getResourceNote(conversationIndex, resource.number)
        return {
          ...resource,
          caseManagerNote: note || undefined,
        }
      })

      const response = await fetch("/api/generate-action-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resources: resourcesWithNotes,
          outputLanguage: outputLanguage,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate action plan")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No reader available")

      const decoder = new TextDecoder()
      let buffer = ""

      // For single resources, we get plain markdown streaming
      // For multiple resources, we get structured JSON chunks
      const isSingleResource = selectedResources.length === 1

      if (isSingleResource) {
        // Handle plain markdown streaming
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk
          setActionPlanContent(buffer)
        }
      } else {
        // Handle structured JSON streaming
        let summaryContent = ""
        const resourceContents: string[] = new Array(selectedResources.length).fill("")

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // Process complete lines
          const lines = buffer.split("\n")
          buffer = lines.pop() || "" // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.trim()) continue

            try {
              const data = JSON.parse(line)

              if (data.type === "summary") {
                summaryContent += data.content
                setActionPlanSummary(summaryContent)
                // Update legacy content for backward compatibility
                const fullContent = summaryContent + "\n\n" + resourceContents.filter((r) => r).join("\n\n")
                setActionPlanContent(fullContent)
              } else if (data.type === "resource") {
                resourceContents[data.resourceIndex] = data.content
                setActionPlanGuides([...resourceContents])
                // Update legacy content for backward compatibility
                const fullContent = summaryContent + "\n\n" + resourceContents.filter((r) => r).join("\n\n")
                setActionPlanContent(fullContent)
              } else if (data.type === "complete") {
                // Final assembly
                setActionPlanSummary(summaryContent)
                setActionPlanGuides(resourceContents.filter((r) => r))
                const fullContent = summaryContent + "\n\n" + resourceContents.filter((r) => r).join("\n\n")
                setActionPlanContent(fullContent)
              } else if (data.type === "error") {
                throw new Error(data.error)
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn("Failed to parse line:", line, e)
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating action plan:", error)
      alert("Failed to generate action plan. Please try again.")
    } finally {
      setIsGeneratingActionPlan(false)
    }
  }

  // Show nothing while checking localStorage to prevent flash
  if (isCheckingUser) {
    return null
  }

  // If no user info, show the welcome page
  if (!userName || !userEmail) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center mb-8">
              <div className="mb-4">
                <Image src="/goodwill-logo.svg" alt="Goodwill Logo" width={72} height={72} className="mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to the Goodwill Referral Tool
              </h1>
              <p className="text-gray-600 text-base">
                To help us understand how this tool is being used and make improvements, please provide your name and
                email.
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-sm font-medium text-gray-700">
                  Your Name *
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  placeholder="Enter your full name"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim() && isValidEmail(userEmailInput)) {
                      handleUserInfoSubmit()
                    }
                  }}
                  autoComplete="off"
                  data-form-type="other"
                  className="w-full bg-white focus-visible:ring-blue-600 focus-visible:ring-offset-0 focus-visible:border-blue-600"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userEmail" className="text-sm font-medium text-gray-700">
                  Your Goodwill Email *
                </Label>
                <Input
                  id="userEmail"
                  name="userEmail"
                  type="email"
                  placeholder="Enter your Goodwill email address"
                  value={userEmailInput}
                  onChange={(e) => handleUserEmailChange(e.target.value)}
                  onBlur={handleUserEmailBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && userNameInput.trim() && userEmailInput.trim() && isValidEmail(userEmailInput)) {
                      handleUserInfoSubmit()
                    }
                  }}
                  autoComplete="off"
                  data-form-type="other"
                  className={`w-full bg-white focus-visible:ring-offset-0 ${
                    userEmailTouched && userEmailError
                      ? "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500"
                      : "focus-visible:ring-blue-600 focus-visible:border-blue-600"
                  }`}
                />
                {userEmailTouched && userEmailError && (
                  <p className="text-sm text-red-600 mt-1">{userEmailError}</p>
                )}
              </div>

              <Button
                onClick={handleUserInfoSubmit}
                disabled={!userNameInput.trim() || !userEmailInput.trim() || !isValidEmail(userEmailInput)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main application (only shown after user info is provided)
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex flex-1 relative">
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Pilot Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚧</span>
                  <div>
                    <h3 className="font-semibold text-amber-900 text-sm">Pilot Version - Work in Progress</h3>
                    <p className="text-amber-800 text-xs">
                      This tool is being tested with Goodwill staff. Please share feedback if you spot issues or have suggestions!
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-amber-50 border-amber-300 text-amber-900 hover:text-amber-950 flex items-center gap-2 whitespace-nowrap cursor-pointer"
                onClick={() => {
                  window.open("https://forms.gle/nfBWHpVbXT1kdSX3A", "_blank")
                }}
              >
                <MessageCircle className="w-4 h-4" />
                Share Feedback
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-auto">
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-white min-h-full">
              {/* Referral Tool Content */}
              <div className="max-w-4xl mx-auto">
                {!showResults ? (
                  <>
                    {/* Header */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-2">
                          <Image
                            src="/goodwill-logo.svg"
                            alt="Goodwill Central Texas"
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">Find Resources </h2>
                          <div className="flex items-center gap-2">
                            <p className="text-blue-600 font-medium">GenAI Referral Tool</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                              PILOT
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                        <TabsTrigger
                          value="text-summary"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          Find Referrals
                        </TabsTrigger>
                        <TabsTrigger
                          value="chat"
                          className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
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
                            Let's Find the Right Resources for Your Clients
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
                                  <Filter className="w-4 h-4 text-blue-600" />
                                  What type of resource does your client need?
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                  <span className="font-medium">Optional:</span> Select categories to get more targeted results, or leave unselected for broader recommendations.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {resourceCategories.map((category) => {
                                    const Icon = category.icon
                                    const isSelected = selectedCategories.includes(category.id)

                                    return (
                                      <button
                                        type="button"
                                        key={category.id}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                          isSelected
                                            ? `bg-blue-50 border-blue-300 border-opacity-100 shadow-md ring-2 ring-blue-200`
                                            : `bg-white border-gray-200 border-opacity-50 hover:border-opacity-75 hover:shadow-sm`
                                        }`}
                                        onClick={() => toggleCategory(category.id)}
                                        aria-pressed={isSelected}
                                        aria-label={`${isSelected ? 'Deselect' : 'Select'} ${category.label} category`}
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
                                                  aria-hidden="true"
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
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>

                              {/* Sub-Categories Section */}
                              {selectedCategories.some(catId => {
                                const cat = resourceCategories.find(c => c.id === catId)
                                return cat?.subCategories && cat.subCategories.length > 0
                              }) && (
                                <div className="pt-4 border-t border-gray-200">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-blue-600" />
                                    Refine by Sub-Category
                                  </h4>
                                  <p className="text-sm text-gray-600 mb-4">
                                    <span className="font-medium">Optional:</span> Select specific types for even more targeted results.
                                  </p>
                                  <div className="space-y-4">
                                    {selectedCategories.map(catId => {
                                      const category = resourceCategories.find(c => c.id === catId)
                                      if (!category?.subCategories || category.subCategories.length === 0) return null

                                      return (
                                        <div key={catId} className="space-y-2">
                                          <p className="text-sm font-medium text-gray-700">{category.label}</p>
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            {category.subCategories.map((subCat) => {
                                              const isSubSelected = selectedSubCategories.includes(subCat.id)
                                              return (
                                                <button
                                                  type="button"
                                                  key={subCat.id}
                                                  onClick={() => toggleSubCategory(subCat.id)}
                                                  className={`p-3 rounded-lg border cursor-pointer transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                                    isSubSelected
                                                      ? "bg-indigo-50 border-indigo-300 shadow-sm"
                                                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                                                  }`}
                                                  aria-pressed={isSubSelected}
                                                  aria-label={`${isSubSelected ? 'Deselect' : 'Select'} ${subCat.label} sub-category`}
                                                >
                                                  <div className="flex items-start gap-2">
                                                    <div className="flex-1">
                                                      <p
                                                        className={`text-sm font-medium ${
                                                          isSubSelected ? "text-indigo-900" : "text-gray-800"
                                                        }`}
                                                      >
                                                        {subCat.label}
                                                      </p>
                                                      <p
                                                        className={`text-xs mt-1 ${
                                                          isSubSelected ? "text-indigo-600" : "text-gray-600"
                                                        }`}
                                                      >
                                                        {subCat.description}
                                                      </p>
                                                    </div>
                                                    {isSubSelected && (
                                                      <div className="flex-shrink-0">
                                                        <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                                                          <svg
                                                            className="w-2.5 h-2.5 text-white"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                            aria-hidden="true"
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
                                                </button>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Location Filters */}
                              <div className="relative">
                                <Label htmlFor="location-input" className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                  Location Preferences
                                </Label>
                                <p className="text-sm text-gray-600 mb-3">
                                  <span className="font-medium">Optional:</span> Specify a location to find resources nearby.
                                </p>
                                <Input
                                  id="location-input"
                                  placeholder="Enter location (city, ZIP code, area, etc.)"
                                  value={location}
                                  onChange={(e) => handleLocationChange(e.target.value)}
                                  className="border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-background"
                                />

                                <div className="mt-2 text-xs text-gray-600">
                                  <p>
                                    💡 <strong>Examples:</strong> "Round Rock", "78701", "Austin, TX", "San Marcos"
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
                                  <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
                                  <option value="Chinese">中文 (Chinese)</option>
                                  <option value="Korean">한국어 (Korean)</option>
                                  <option value="Arabic">العربية (Arabic)</option>
                                  <option value="Hindi">हिन्दी (Hindi)</option>
                                  <option value="French">Français (French)</option>
                                  <option value="German">Deutsch (German)</option>
                                  <option value="Portuguese">Português (Portuguese)</option>
                                  <option value="Russian">Русский (Russian)</option>
                                  <option value="Japanese">日本語 (Japanese)</option>
                                  <option value="Italian">Italiano (Italian)</option>
                                </select>
                                <div className="mt-2 text-xs text-gray-600">
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
                          <Label htmlFor="client-details-input" className="font-medium text-gray-900 text-lg">
                            Add details about your client&#39;s needs{" "}
                          </Label>
                          <Textarea
                            id="client-details-input"
                            placeholder="Share anything that would help us find the perfect resources for your client - their goals, challenges, timeline, or what success looks like for them..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            className="min-h-[100px] text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                              Finding Resources...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-5 h-5" />
                              Find Resources
                            </>
                          )}
                        </button>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 mb-3 text-center">
                            Want to see how it works? Try example resources:
                          </p>
                          <button
                            onClick={generateSampleReferrals}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border border-gray-300"
                          >
                            <Eye className="w-5 h-5" />
                            View Example Resources
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === "chat" && (
                      <div className="space-y-6">
                        <div className="text-center py-8">
                          <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-8 h-8 text-indigo-600" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">Chat About Goodwill Resources</h2>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Ask questions about Goodwill programs, services, and community resources. Get helpful information
                            with citations from our knowledge base.
                          </p>
                        </div>

                        {/* Suggested Prompts - Show when no messages */}
                        {chatMessages.length === 0 && !isChatStreaming && (
                          <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested questions to get started:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {suggestedChatPrompts.map((prompt, index) => (
                                <button
                                  key={index}
                                  onClick={() => sendChatMessage(prompt)}
                                  disabled={isChatStreaming}
                                  className="text-left p-3 rounded-lg border border-gray-300 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-sm text-gray-700 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                                    <span>{prompt}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chat Messages */}
                        <div className="space-y-4" role="log" aria-live="polite" aria-atomic="false">
                          {chatMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-3xl rounded-lg p-4 ${
                                  message.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-900 border border-gray-200"
                                }`}
                              >
                                {message.role === "assistant" ? (
                                  <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{
                                      __html: parseMarkdownToHTML(message.content),
                                    }}
                                  />
                                ) : (
                                  <p className="whitespace-pre-wrap">{message.content}</p>
                                )}
                                <p
                                  className={`text-xs mt-2 ${message.role === "user" ? "text-blue-100" : "text-gray-600"}`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* Streaming Message */}
                          {isChatStreaming && streamingChatContent && (
                            <div className="flex justify-start" aria-live="off">
                              {/* Screen reader only status announcement */}
                              <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                                Generating response, please wait...
                              </span>
                              <div className="max-w-3xl rounded-lg p-4 bg-gray-100 text-gray-900 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" aria-hidden="true" />
                                  <span className="text-sm text-indigo-600 font-medium">Responding...</span>
                                </div>
                                <div
                                  className="prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{
                                    __html: parseMarkdownToHTML(streamingChatContent),
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Follow-up Prompts - Show after messages if available */}
                        {followUpPrompts.length > 0 && chatMessages.length > 0 && !isChatStreaming && (
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Related questions you might have:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {followUpPrompts.map((prompt, index) => (
                                <button
                                  key={index}
                                  onClick={() => sendChatMessage(prompt)}
                                  disabled={isChatStreaming}
                                  className="text-left p-3 rounded-lg border border-gray-300 bg-white hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-sm text-gray-700 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <span className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                                    <span>{prompt}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chat Input */}
                        <Card className="bg-gray-50 border-gray-200">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="chat-input" className="text-sm font-medium text-gray-700 mb-2 block">
                                  Your Question
                                </Label>
                                <Textarea
                                  id="chat-input"
                                  placeholder="Ask about Goodwill programs, training opportunities, community resources, or any other questions..."
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                      e.preventDefault()
                                      handleSendChatMessage()
                                    }
                                  }}
                                  className="min-h-[100px] resize-none"
                                  disabled={isChatStreaming}
                                />
                                <p className="text-xs text-gray-600 mt-2">Press Enter to send, Shift+Enter for new line</p>
                              </div>
                              <Button
                                onClick={handleSendChatMessage}
                                disabled={!chatInput.trim() || isChatStreaming}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                              >
                                {isChatStreaming ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Responding...
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Send Message
                                  </>
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
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

                    {/* Show streaming metadata (question and summary) */}
                    {isStreaming && (streamingQuestion || streamingSummary) && (
                      <div className="space-y-4 pb-6">
                        {/* Question Header */}
                        {streamingQuestion && (
                          <div className="bg-gray-100 rounded-2xl p-4 border">
                            <h2 className="text-lg font-medium text-gray-900 text-center mb-3">{streamingQuestion}</h2>

                            {/* Active Filters - show when filters are applied (only for first prompt, not follow-ups) */}
                            {conversationHistory.length === 0 &&
                              (outputLanguage !== "English" ||
                                selectedCategories.length > 0 ||
                                selectedSubCategories.length > 0 ||
                                selectedResourceTypes.length > 0 ||
                                location ||
                                selectedLocations.length > 0 ||
                                selectedLanguages.length > 0) && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                  <Filter className="w-4 h-4" />
                                  Active Filters:
                                </div>
                                <div className="space-y-1 text-gray-700 text-sm">
                                  {outputLanguage !== "English" && (
                                    <div>
                                      <span className="font-medium">Output Language:</span> {outputLanguage}
                                    </div>
                                  )}
                                  {selectedCategories.length > 0 && (
                                    <div>
                                      <span className="font-medium">Categories:</span>{" "}
                                      {selectedCategories
                                        .map((id) => resourceCategories.find((c) => c.id === id)?.label)
                                        .filter(Boolean)
                                        .join(", ")}
                                    </div>
                                  )}
                                  {selectedSubCategories.length > 0 && (
                                    <div>
                                      <span className="font-medium">Sub-Categories:</span>{" "}
                                      {selectedSubCategories
                                        .map((id) => {
                                          for (const cat of resourceCategories) {
                                            const subCat = cat.subCategories.find((s) => s.id === id)
                                            if (subCat) return subCat.label
                                          }
                                          return null
                                        })
                                        .filter(Boolean)
                                        .join(", ")}
                                    </div>
                                  )}
                                  {selectedResourceTypes.length > 0 && (
                                    <div>
                                      <span className="font-medium">Resource Types:</span>{" "}
                                      {selectedResourceTypes.join(", ")}
                                    </div>
                                  )}
                                  {location && (
                                    <div>
                                      <span className="font-medium">Location:</span> {location}
                                    </div>
                                  )}
                                  {selectedLocations.length > 0 && (
                                    <div>
                                      <span className="font-medium">Locations:</span> {selectedLocations.join(", ")}
                                    </div>
                                  )}
                                  {selectedLanguages.length > 0 && (
                                    <div>
                                      <span className="font-medium">Languages:</span> {selectedLanguages.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Processing Time - shown during streaming */}
                        <div className="text-sm text-gray-600">Thinking...</div>

                        {/* Summary */}
                        {streamingSummary && (
                          <div className="text-gray-900">
                            <p className="font-medium mb-4">{streamingSummary}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Show empty loading state when streaming starts */}
                    {isStreaming && streamingResources.length === 0 && (
                      <div className="space-y-4 pb-6">
                        {/* Status Message */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-blue-900 font-medium">{streamingStatus}</span>
                        </div>

                        {/* Placeholder cards for all 4 resources */}
                        <div className="space-y-6">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={`initial-placeholder-${i}`} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                <div className="flex-1 space-y-3">
                                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                                  <div className="h-4 bg-gray-200 rounded w-full" />
                                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Show streaming resources while generating */}
                    {isStreaming && streamingResources.length > 0 && (
                      <div className="space-y-4 pb-6 border-b border-gray-200">
                        {/* Status Message */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-blue-900 font-medium">{streamingStatus}</span>
                        </div>

                        {/* Streaming Resources - sorted by number */}
                        <div className="space-y-6">
                          {streamingResources
                            .slice()
                            .sort((a, b) => Number(a.number) - Number(b.number))
                            .filter((resource) => !isResourceRemoved(0, resource.number))
                            .map((resource, idx) => {
                            const getCategoryStyle = (category) => {
                              switch (category) {
                                case "Goodwill Resources & Programs":
                                  return {
                                    text: "text-blue-700",
                                    bg: "bg-white",
                                    border: "border-blue-700",
                                    icon: (
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="4" y="4" width="7" height="7" rx="1" />
                                        <rect x="13" y="4" width="7" height="7" rx="1" />
                                        <rect x="4" y="13" width="7" height="7" rx="1" />
                                        <rect x="13" y="13" width="7" height="7" rx="1" />
                                      </svg>
                                    ),
                                  }
                                case "Local Community Resources":
                                  return {
                                    text: "text-green-700",
                                    bg: "bg-white",
                                    border: "border-green-700",
                                    icon: <Users className="w-4 h-4" />,
                                  }
                                case "Government Benefits":
                                  return {
                                    text: "text-purple-700",
                                    bg: "bg-white",
                                    border: "border-purple-700",
                                    icon: <Landmark className="w-4 h-4" />,
                                  }
                                case "Job Postings":
                                  return {
                                    text: "text-orange-700",
                                    bg: "bg-white",
                                    border: "border-orange-700",
                                    icon: <Briefcase className="w-4 h-4" />,
                                  }
                                case "GCTA Trainings":
                                  return {
                                    text: "text-red-700",
                                    bg: "bg-white",
                                    border: "border-red-700",
                                    icon: <GraduationCap className="w-4 h-4" />,
                                  }
                                case "CAT Trainings":
                                  return {
                                    text: "text-teal-700",
                                    bg: "bg-white",
                                    border: "border-teal-700",
                                    icon: <BookOpen className="w-4 h-4" />,
                                  }
                                default:
                                  return {
                                    text: "text-gray-700",
                                    bg: "bg-white",
                                    border: "border-gray-700",
                                    icon: <Building className="w-4 h-4" />,
                                  }
                              }
                            }

                            const categoryStyle = getCategoryStyle(resource.category)

                            return (
                              <div
                                key={resource.number}
                                className="p-4 rounded-lg border border-gray-200 animate-fadeIn relative"
                                style={{
                                  animation: `fadeIn 0.3s ease-in ${(resource.number - 1) * 0.1}s both`,
                                }}
                              >
                                {/* Remove button */}
                                <button
                                  onClick={() => handleRemoveResource(0, resource.number)}
                                  className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-xs font-medium border border-red-200"
                                  title="Remove resource"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Remove</span>
                                </button>

                                <div className="flex items-start gap-4">
                                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                                    {resource.number}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 ${categoryStyle.text} ${categoryStyle.bg}`}
                                    >
                                      {typeof categoryStyle.icon === "string" ? (
                                        <span>{categoryStyle.icon}</span>
                                      ) : (
                                        categoryStyle.icon
                                      )}
                                      {resource.category}
                                    </div>

                                    <h3 className="font-bold text-black text-lg mb-3">{resource.title}</h3>

                                    {(() => {
                                      const labels = translateLabels(resource.category, outputLanguage)

                                      return (
                                        <>
                                          {resource.eligibility && (
                                            <p className="text-black mt-2 text-sm leading-relaxed">
                                              <span className="font-semibold">{labels.eligibility}</span>{" "}
                                              {resource.eligibility}
                                            </p>
                                          )}
                                          {resource.classDate && (
                                            <p className="text-black mt-1 text-sm leading-relaxed">
                                              <span className="font-semibold">{labels.classDate}</span> {resource.classDate}
                                            </p>
                                          )}
                                          {resource.services && (
                                            <p className="text-black mt-1 text-sm leading-relaxed">
                                              <span className="font-semibold">{labels.services}</span> {resource.services}
                                            </p>
                                          )}
                                          {resource.support && (
                                            <p className="text-black mt-1 text-sm leading-relaxed">
                                              <span className="font-semibold">{labels.support}</span> {resource.support}
                                            </p>
                                          )}
                                          {resource.contact && (
                                            <p className="text-black mt-3 text-sm">
                                              <span className="font-semibold">{labels.contact}</span> {resource.contact}
                                            </p>
                                          )}
                                          <p className="text-black mt-3 text-sm">
                                            <span className="font-semibold">{labels.website}</span>{" "}
                                            <a
                                              href={`https://${resource.badge}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                              {resource.badge}
                                            </a>
                                          </p>
                                        </>
                                      )
                                    })()}

                                    {/* Notes Section */}
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      {editingNoteId === `0-${resource.number}` ? (
                                        <div className="space-y-2">
                                          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <StickyNote className="w-4 h-4" />
                                            Add Note for Client:
                                          </label>
                                          <Textarea
                                            placeholder="Add instructions, reminders, or important details for your client..."
                                            defaultValue={getResourceNote(0, resource.number)}
                                            className="min-h-[80px] text-sm"
                                            id={`note-textarea-0-${resource.number}`}
                                          />
                                          <div className="flex gap-2">
                                            <Button
                                              size="sm"
                                              onClick={() => {
                                                const textarea = document.getElementById(
                                                  `note-textarea-0-${resource.number}`
                                                ) as HTMLTextAreaElement
                                                handleSaveNote(0, resource.number, textarea?.value || "")
                                              }}
                                              className="flex items-center gap-1"
                                            >
                                              <Save className="w-3.5 h-3.5" />
                                              Save Note
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() => setEditingNoteId(null)}
                                            >
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      ) : getResourceNote(0, resource.number) ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                              <StickyNote className="w-4 h-4" />
                                              Note for Client:
                                            </label>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setEditingNoteId(`0-${resource.number}`)}
                                              className="text-xs h-7"
                                            >
                                              Edit
                                            </Button>
                                          </div>
                                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-gray-800">
                                            {getResourceNote(0, resource.number)}
                                          </div>
                                        </div>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setEditingNoteId(`0-${resource.number}`)}
                                          className="flex items-center gap-1.5"
                                        >
                                          <StickyNote className="w-3.5 h-3.5" />
                                          Add Note for Client
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}

                          {/* Placeholder cards for remaining resources */}
                          {streamingResources.length < 4 &&
                            Array.from({ length: 4 - streamingResources.length }).map((_, i) => (
                              <div key={`placeholder-${i}`} className="p-4 rounded-lg border border-gray-200 animate-pulse">
                                <div className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                                  <div className="flex-1 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {conversationHistory.map((exchange, index) => (
                      <div key={index} className="space-y-4 pb-6 border-b border-gray-200 last:border-b-0">
                        {/* Question Header */}
                        <div className="bg-gray-100 rounded-2xl p-4 border">
                          <h2 className="text-lg font-medium text-gray-900 text-center mb-3">{exchange.response.question}</h2>

                          {/* Active Filters - show when filters are applied (only for first prompt, not follow-ups) */}
                          {index === 0 &&
                            (outputLanguage !== "English" ||
                              selectedCategories.length > 0 ||
                              selectedSubCategories.length > 0 ||
                              selectedResourceTypes.length > 0 ||
                              location ||
                              selectedLocations.length > 0 ||
                              selectedLanguages.length > 0) && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2 text-sm">
                                  <Filter className="w-4 h-4" />
                                  Active Filters:
                                </div>
                                <div className="space-y-1 text-gray-700 text-sm">
                                  {outputLanguage !== "English" && (
                                    <div>
                                      <span className="font-medium">Output Language:</span> {outputLanguage}
                                    </div>
                                  )}
                                  {selectedCategories.length > 0 && (
                                    <div>
                                      <span className="font-medium">Categories:</span>{" "}
                                      {selectedCategories
                                        .map((id) => resourceCategories.find((c) => c.id === id)?.label)
                                        .filter(Boolean)
                                        .join(", ")}
                                    </div>
                                  )}
                                  {selectedSubCategories.length > 0 && (
                                    <div>
                                      <span className="font-medium">Sub-Categories:</span>{" "}
                                      {selectedSubCategories
                                        .map((id) => {
                                          for (const cat of resourceCategories) {
                                            const subCat = cat.subCategories.find((s) => s.id === id)
                                            if (subCat) return subCat.label
                                          }
                                          return null
                                        })
                                        .filter(Boolean)
                                        .join(", ")}
                                    </div>
                                  )}
                                  {selectedResourceTypes.length > 0 && (
                                    <div>
                                      <span className="font-medium">Resource Types:</span>{" "}
                                      {selectedResourceTypes.join(", ")}
                                    </div>
                                  )}
                                  {location && (
                                    <div>
                                      <span className="font-medium">Location:</span> {location}
                                    </div>
                                  )}
                                  {selectedLocations.length > 0 && (
                                    <div>
                                      <span className="font-medium">Locations:</span> {selectedLocations.join(", ")}
                                    </div>
                                  )}
                                  {selectedLanguages.length > 0 && (
                                    <div>
                                      <span className="font-medium">Languages:</span> {selectedLanguages.join(", ")}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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
                            {exchange.response.resources
                              .slice()
                              .sort((a, b) => Number(a.number) - Number(b.number))
                              .filter((resource) => !isResourceRemoved(index, resource.number))
                              .map((resource) => {
                              const getCategoryStyle = (category) => {
                                switch (category) {
                                  case "Goodwill Resources & Programs":
                                    return {
                                      text: "text-blue-700",
                                      bg: "bg-white",
                                      border: "border-blue-700",
                                      icon: (
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                          <rect x="4" y="4" width="7" height="7" rx="1" />
                                          <path d="M14 6h4v2h-4V6zm0 4h4v2h-4v-2zm0 4h4v2h-4v-2z" />
                                          <path d="M4 14h7v6H4v-6z" />
                                        </svg>
                                      ),
                                    }
                                  case "Local Community Resources":
                                    return {
                                      text: "text-green-700",
                                      bg: "bg-white",
                                      border: "border-green-700",
                                      icon: <Handshake className="w-4 h-4" />,
                                    }
                                  case "Government Benefits":
                                    return {
                                      text: "text-gray-900",
                                      bg: "bg-white",
                                      border: "border-gray-900",
                                      icon: <Landmark className="w-4 h-4" />,
                                    }
                                  case "Job Postings":
                                    return {
                                      text: "text-orange-800",
                                      bg: "bg-white",
                                      border: "border-orange-800",
                                      icon: "💼",
                                    }
                                  case "GCTA Trainings":
                                    return {
                                      text: "text-indigo-800",
                                      bg: "bg-white",
                                      border: "border-indigo-800",
                                      icon: "🎓",
                                    }
                                  case "CAT Trainings":
                                    return {
                                      text: "text-teal-800",
                                      bg: "bg-white",
                                      border: "border-teal-800",
                                      icon: "📚",
                                    }
                                  default:
                                    return {
                                      text: "text-gray-800",
                                      bg: "bg-white",
                                      border: "border-gray-800",
                                      icon: "📋",
                                    }
                                }
                              }

                              const categoryStyle = getCategoryStyle(resource.category)

                              return (
                                <div key={resource.number} className="p-4 rounded-lg border border-gray-200 relative">
                                  {/* Remove button */}
                                  <button
                                    onClick={() => handleRemoveResource(index, resource.number)}
                                    className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-xs font-medium border border-red-200"
                                    title="Remove resource"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Remove</span>
                                  </button>

                                  <div className="flex items-start gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mt-1">
                                      {resource.number}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold mb-3 ${categoryStyle.text} ${categoryStyle.bg}`}
                                      >
                                        {typeof categoryStyle.icon === "string" ? (
                                          <span>{categoryStyle.icon}</span>
                                        ) : (
                                          categoryStyle.icon
                                        )}
                                        {translateCategory(resource.category, outputLanguage)}
                                      </div>

                                      <h3 className="font-bold text-black text-lg mb-3">
                                        {resource.title}
                                      </h3>

                                      {(() => {
                                        const labels = translateLabels(resource.category, outputLanguage)

                                        return (
                                          <>
                                            {resource.eligibility && (
                                              <p className="text-black mt-2 text-sm leading-relaxed">
                                                <span className="font-semibold">{labels.eligibility}</span>{" "}
                                                {resource.eligibility}
                                              </p>
                                            )}
                                            {resource.classDate && (
                                              <p className="text-black mt-1 text-sm leading-relaxed">
                                                <span className="font-semibold">{labels.classDate}</span> {resource.classDate}
                                              </p>
                                            )}
                                            {resource.services && (
                                              <p className="text-black mt-1 text-sm leading-relaxed">
                                                <span className="font-semibold">{labels.services}</span> {resource.services}
                                              </p>
                                            )}
                                            {resource.support && (
                                              <p className="text-black mt-1 text-sm leading-relaxed">
                                                <span className="font-semibold">{labels.support}</span> {resource.support}
                                              </p>
                                            )}

                                            {/* Fallback to original whyItFits if structured fields aren't sufficient or present */}
                                            {!resource.eligibility && !resource.services && !resource.support && (
                                              <p className="text-black mt-2 text-sm leading-relaxed">{resource.whyItFits}</p>
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

                                            {resource.contact && (
                                              <p className="text-black mt-3 text-sm">
                                                <span className="font-semibold">{labels.contact}</span> {resource.contact}
                                              </p>
                                            )}
                                            <p className="text-black mt-3 text-sm">
                                              <span className="font-semibold">{labels.website}</span>{" "}
                                              <a
                                                href={`https://${resource.badge}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                              >
                                                {resource.badge}
                                              </a>
                                            </p>
                                          </>
                                        )
                                      })()}

                                      {/* Notes Section */}
                                      <div className="mt-4 pt-4 border-t border-gray-200">
                                        {editingNoteId === `${index}-${resource.number}` ? (
                                          <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                              <StickyNote className="w-4 h-4" />
                                              Add Note for Client:
                                            </label>
                                            <Textarea
                                              placeholder="Add instructions, reminders, or important details for your client..."
                                              defaultValue={getResourceNote(index, resource.number)}
                                              className="min-h-[80px] text-sm"
                                              id={`note-textarea-${index}-${resource.number}`}
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                onClick={() => {
                                                  const textarea = document.getElementById(
                                                    `note-textarea-${index}-${resource.number}`
                                                  ) as HTMLTextAreaElement
                                                  handleSaveNote(index, resource.number, textarea?.value || "")
                                                }}
                                                className="flex items-center gap-1"
                                              >
                                                <Save className="w-3.5 h-3.5" />
                                                Save Note
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditingNoteId(null)}
                                              >
                                                Cancel
                                              </Button>
                                            </div>
                                          </div>
                                        ) : getResourceNote(index, resource.number) ? (
                                          <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                <StickyNote className="w-4 h-4" />
                                                Note for Client:
                                              </label>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setEditingNoteId(`${index}-${resource.number}`)}
                                                className="text-xs h-7"
                                              >
                                                Edit
                                              </Button>
                                            </div>
                                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-gray-800">
                                              {getResourceNote(index, resource.number)}
                                            </div>
                                          </div>
                                        ) : (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setEditingNoteId(`${index}-${resource.number}`)}
                                            className="flex items-center gap-1.5"
                                          >
                                            <StickyNote className="w-3.5 h-3.5" />
                                            Add Note for Client
                                          </Button>
                                        )}
                                      </div>
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

                        {showActionPlanSection && exchange.response.resources && exchange.response.resources.length > 0 && (
                          <div className="mt-8 p-4 bg-gray-50 rounded-lg border animate-fadeIn">
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
                                  onClick={() => handleSelectAllResources(exchange.response.resources, index)}
                                  className="text-xs"
                                >
                                  {(() => {
                                    const availableResources = exchange.response.resources.filter(
                                      (resource) => !isResourceRemoved(index, resource.number)
                                    )
                                    return selectedResources.length === availableResources.length
                                      ? "Deselect All"
                                      : "Select All"
                                  })()}
                                </Button>
                              </div>
                              {exchange.response.resources
                                .slice()
                                .sort((a, b) => Number(a.number) - Number(b.number))
                                .filter((resource) => !isResourceRemoved(index, resource.number))
                                .map((resource: Resource, resourceIndex: number) => (
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
                                  {isGeneratingActionPlan ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <FileText className="w-4 h-4 mr-2" />
                                  )}
                                  {isGeneratingActionPlan
                                    ? "Generating Action Plan..."
                                    : `Generate Action Plan (${selectedResources.length} selected)`}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Action Plan - streaming or complete */}
                        {(isGeneratingActionPlan || actionPlanContent || actionPlanSummary || actionPlanGuides.length > 0) && (
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-500 rounded-lg max-w-4xl">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4">Action Plan</h3>
                            <div className="space-y-4">
                              {isGeneratingActionPlan && (
                                <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                                  {/* Screen reader only status announcement */}
                                  <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                                    Generating action plan, please wait...
                                  </span>
                                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden="true" />
                                  <span className="text-blue-900 font-medium">Generating action plan...</span>
                                </div>
                              )}

                              {/* Single resource or legacy view */}
                              {actionPlanContent && selectedResources.length === 1 && (
                                <div className="prose prose-slate max-w-none" role="region" aria-live={isGeneratingActionPlan ? "off" : "polite"} aria-atomic="true">
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: parseMarkdownToHTML(actionPlanContent),
                                    }}
                                  />
                                </div>
                              )}

                              {/* Multiple resources with carousel */}
                              {selectedResources.length > 1 && (actionPlanSummary || actionPlanGuides.length > 0) && (
                                <div className="space-y-4">
                                  {/* Quick Summary */}
                                  {actionPlanSummary && (
                                    <div className="prose prose-slate max-w-none p-4 bg-white rounded-lg border border-blue-200">
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: parseMarkdownToHTML(actionPlanSummary),
                                        }}
                                      />
                                    </div>
                                  )}

                                  {/* Individual Resource Guides Carousel */}
                                  {actionPlanGuides.length > 0 && (
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-md font-semibold text-blue-900">
                                          Individual Resource Guides
                                        </h4>
                                        <div className="text-sm text-blue-700">
                                          {currentGuideIndex + 1} of {actionPlanGuides.filter(g => g).length}
                                        </div>
                                      </div>

                                      {/* Carousel Container */}
                                      <div className="relative">
                                        {/* Current Guide */}
                                        <div className="prose prose-slate max-w-none p-4 bg-white rounded-lg border border-blue-200">
                                          {actionPlanGuides[currentGuideIndex] ? (
                                            <div
                                              dangerouslySetInnerHTML={{
                                                __html: parseMarkdownToHTML(actionPlanGuides[currentGuideIndex]),
                                              }}
                                            />
                                          ) : (
                                            <div className="flex items-center gap-3 py-8 justify-center text-blue-600">
                                              <Loader2 className="w-5 h-5 animate-spin" />
                                              <span>Loading resource guide...</span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Navigation Arrows */}
                                        <div className="flex items-center justify-between mt-4">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentGuideIndex(Math.max(0, currentGuideIndex - 1))}
                                            disabled={currentGuideIndex === 0}
                                            className="flex items-center gap-2"
                                          >
                                            <ChevronLeft className="w-4 h-4" />
                                            Previous
                                          </Button>

                                          {/* Dots indicator */}
                                          <div className="flex items-center gap-2">
                                            {actionPlanGuides.map((_, index) => (
                                              <button
                                                key={index}
                                                onClick={() => setCurrentGuideIndex(index)}
                                                className={`w-2 h-2 rounded-full transition-all ${
                                                  index === currentGuideIndex
                                                    ? "bg-blue-600 w-6"
                                                    : "bg-blue-300 hover:bg-blue-400"
                                                }`}
                                                aria-label={`Go to guide ${index + 1}`}
                                              />
                                            ))}
                                          </div>

                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentGuideIndex(Math.min(actionPlanGuides.length - 1, currentGuideIndex + 1))}
                                            disabled={currentGuideIndex === actionPlanGuides.length - 1}
                                            className="flex items-center gap-2"
                                          >
                                            Next
                                            <ChevronRight className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show streaming follow-up content */}
                    {streamingFollowUpContent && (
                      <div className="space-y-4 pb-6 border-b border-gray-200" aria-live="off">
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          {/* Screen reader only status announcement */}
                          <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                            Generating follow-up response, please wait...
                          </span>
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden="true" />
                          <span className="text-blue-900 font-medium">Generating response...</span>
                        </div>

                        <div className="prose max-w-none text-slate-700">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: parseMarkdownToHTML(streamingFollowUpContent),
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Follow-up input */}
                    {showActionPlanSection && conversationHistory.length > 0 && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50 animate-fadeIn">
                        <Label htmlFor="follow-up-input" className="font-medium text-gray-900 mb-3 block">
                          Ask a follow-up question:
                        </Label>
                        <div className="space-y-3">
                          <Textarea
                            id="follow-up-input"
                            placeholder="Ask for more specific information, clarify details, or request additional resources..."
                            value={followUpPrompt}
                            onChange={(e) => setFollowUpPrompt(e.target.value)}
                            className="min-h-[80px] border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <Button
                            onClick={() => handleGenerateReferrals(true, followUpPrompt)}
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
          </div>
      </main>
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
                    autoComplete="email"
                    placeholder="your.email@example.com"
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value)
                      setEmailError("")
                    }}
                    disabled={isSendingEmail}
                  />
                  {emailError && <p className="text-sm text-red-600" role="alert">{emailError}</p>}
                </div>

                <Button
                  onClick={handleEmailPDF}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
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

      {/* Undo Notification */}
      {recentlyRemoved && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 duration-300">
          <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-xs">ℹ️</span>
              </div>
              <span className="text-sm font-medium">Resource removed</span>
            </div>
            <button
              onClick={handleUndoRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
