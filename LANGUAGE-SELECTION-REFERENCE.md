# Language Selection & Multilingual Output Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `suggest-prompts`
**Related Commits:**
- `f9acafa` - feat: add bilingual titles for non-English resources
- `cb0df8a` - fix: make bilingual title format mandatory when outputLanguage is not English
- `4051d21` - feat: update model settings and UI improvements (language prioritization)

---

## Overview

**AI GENERATED, DOUBLE CHECK THINGS**
<img width="1045" height="470" alt="Screenshot 2025-10-20 at 11 33 51 AM" src="https://github.com/user-attachments/assets/af0f9168-eb6c-4019-b6ee-52c28b154e67" />


The application supports multilingual output, allowing case managers to generate resource recommendations and action plans in different languages. The system uses bilingual titles and translates field labels to make resources accessible to clients who speak languages other than English.

---

## Supported Languages

The language selector prioritizes languages commonly spoken in Austin, Texas:

1. **English** (default)
2. **Spanish** (Español) - Largest non-English speaking population
3. **Vietnamese** (Tiếng Việt) - Significant community
4. **Chinese** (中文)
5. **Korean** (한국어)
6. **Arabic** (العربية)
7. **Hindi** (हिन्दी)
8. **French** (Français)
9. **German** (Deutsch)
10. **Portuguese** (Português)
11. **Russian** (Русский)
12. **Japanese** (日本語)
13. **Italian** (Italiano)

---

## Implementation Files & Key Locations

### **1. Language Selector UI**

**File:** `app/page.tsx`

**Language selector component:** Lines 2155-2182

```typescript
<select
  value={outputLanguage}
  onChange={(e) => setOutputLanguage(e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
>
  <option value="English">English</option>
  <option value="Spanish">Español (Spanish)</option>
  <option value="Vietnamese">Tiếng Việt (Vietnamese)</option>
  // ... more languages
</select>
```

**State management:** Line 521
```typescript
const [outputLanguage, setOutputLanguage] = useState<string>("English")
```

---

### **2. Label Translation System**

**File:** `app/page.tsx`

**Translation function:** Lines 326-460

The `translateLabels()` function provides localized field labels based on:
- Selected output language
- Resource category (GCTA Trainings, Job Postings, etc.)

**Example structure:**
```typescript
const labelTranslations: Record<string, Record<string, any>> = {
  Spanish: {
    "GCTA Trainings": {
      eligibility: "📋 Quién Puede Inscribirse:",
      services: "📚 Lo Que Aprenderás:",
      support: "💰 Apoyo Financiero:",
      contact: "📞 Información de Inscripción:",
    },
    "Job Postings": {
      eligibility: "✅ Requisitos:",
      services: "💼 Detalles del Puesto:",
      support: "🎯 Beneficios y Ventajas:",
      contact: "📧 Aplicar Aquí:",
    },
    // ... more categories
  },
  French: {
    // ... French translations
  }
}
```

**Supported translations:**
- Currently implemented: **Spanish** and **French**
- Falls back to English labels for other languages

**Usage in UI:** Lines 2680-2700+
```typescript
const labels = translateLabels(resource.category, outputLanguage)

return (
  <>
    <p><span className="font-semibold">{labels.eligibility}</span> {resource.eligibility}</p>
    <p><span className="font-semibold">{labels.services}</span> {resource.services}</p>
    <p><span className="font-semibold">{labels.support}</span> {resource.support}</p>
    <p><span className="font-semibold">{labels.contact}</span> {resource.contact}</p>
  </>
)
```

---

### **3. API Integration**

#### **Generate Referrals API**
**File:** `app/api/generate-referrals/route.ts`

**Request payload:** Line 1127
```typescript
outputLanguage: outputLanguage, // Added output language to request
```

**Bilingual title format (MANDATORY for non-English):** Lines 220-223
```typescript
- **Title**: 5-6 words max${outputLanguage !== "English" ? `
  - CRITICAL: Use bilingual format: "English Title / ${outputLanguage} Title"
  - Example: "GCTA - Building Maintenance / GCTA - Maintenance avec modules HVAC"
  - Example: "Goodwill Resources & Programs / Recursos y Programas de Goodwill"` : ""}
```

**Content generation:** Line 269
```typescript
- Generate in ${outputLanguage}
```

#### **Generate Action Plan API**
**File:** `app/api/generate-action-plan/route.ts`

**Request payload:** Line 1787
```typescript
body: JSON.stringify({
  resources: selectedResources,
  outputLanguage: outputLanguage,
})
```

**Prompt instructions:** Lines 22-23, 58
```typescript
Generate a CONCISE action plan in ${outputLanguage} for accessing these ${resources.length} selected resources.
// ...
Generate a CONCISE action plan in ${outputLanguage} for accessing this resource.
```

#### **Chat API**
**File:** `app/api/chat/route.ts`

Similar implementation - all content generated in the selected language.

---

## Key Features & Patterns

### **1. Bilingual Titles (Non-English Output)**

When `outputLanguage !== "English"`, the LLM is instructed to generate titles in **bilingual format**:

```
Format: "English Title / [Target Language] Title"
```

**Examples:**
- English → Spanish: `"GCTA - Medical Assistant / GCTA - Asistente Médico"`
- English → French: `"Job Training Program / Programme de Formation Professionnelle"`
- English → Vietnamese: `"Food Assistance / Hỗ Trợ Thực Phẩm"`

**Why bilingual?**
- Helps case managers quickly identify resources
- Ensures clarity when reviewing printed/shared documents
- Supports bilingual staff members

### **2. Complete Content Translation**

All generated content translates:
- ✅ Resource descriptions
- ✅ Eligibility requirements
- ✅ Service details
- ✅ Support information
- ✅ Contact information
- ✅ Action plan summaries
- ✅ Action plan steps

### **3. Field Label Localization**

Field labels adapt based on:
- **Output language:** Spanish/French get translated labels, others fallback to English
- **Resource category:** Different categories use contextually appropriate labels
  - Training programs: "What You'll Learn" vs "Lo Que Aprenderás"
  - Job postings: "Requirements" vs "Requisitos"
  - Government benefits: "Who Qualifies" vs "Quién Califica"

### **4. LLM-Powered Translation**

- Uses GPT-5 with low reasoning effort for fast generation
- LLM translates naturally, not word-for-word
- Maintains context and cultural appropriateness
- Adapts phrasing for target audience

---

## UI/UX Guidelines

### **Language Selector**
- Placed in the filters section (visible in left sidebar)
- Shows language names in both English and native script
- Defaults to English
- Persists across page interactions (within session)

### **Display Conventions**
- Bilingual titles always show English first, then target language
- Use slash (/) separator: `"English / Español"`
- Field labels include emoji icons for visual clarity
- Maintain consistent formatting across all languages

### **Accessibility**
- Language names displayed in native scripts for clarity
- Screen readers announce language changes
- Form fields properly labeled in all languages

---

## Testing Recommendations

### **Functional Testing**
1. ✅ Select each available language and generate referrals
2. ✅ Verify bilingual titles appear for all non-English languages
3. ✅ Check that Spanish/French get translated field labels
4. ✅ Verify other languages fallback to English labels
5. ✅ Test action plan generation in multiple languages
6. ✅ Confirm language selection persists during session

### **Content Quality Testing**
1. ✅ Spanish output reviewed by native speaker
2. ✅ French output reviewed by native speaker
3. ✅ Verify cultural appropriateness of translations
4. ✅ Check for consistent terminology across resources
5. ✅ Test with special characters (accents, non-Latin scripts)

### **Integration Testing**
1. ✅ Generate referrals → switch language → generate again
2. ✅ Print/share multilingual content
3. ✅ Test email delivery with non-English content
4. ✅ Verify PDF generation with Unicode characters

### **Edge Cases**
1. ✅ English to English (no bilingual titles)
2. ✅ Languages without label translations (fallback works)
3. ✅ Long titles in both languages (formatting maintained)
4. ✅ Special characters in URLs/contact info

---

## Adding New Language Translations

### **To add label translations for a new language:**

1. **Update `translateLabels()` function** (app/page.tsx, line 334+)

```typescript
const labelTranslations: Record<string, Record<string, any>> = {
  Spanish: { /* existing */ },
  French: { /* existing */ },
  Vietnamese: {  // NEW LANGUAGE
    "GCTA Trainings": {
      eligibility: "📋 Ai Có Thể Đăng Ký:",
      services: "📚 Những Gì Bạn Sẽ Học:",
      support: "💰 Hỗ Trợ Tài Chính:",
      contact: "📞 Thông Tin Đăng Ký:",
    },
    // ... add all categories
  }
}
```

2. **Test all resource categories:**
   - GCTA Trainings
   - CAT Trainings
   - Job Postings
   - Government Benefits
   - Local Community Resources
   - Goodwill Resources & Programs

3. **Guidelines:**
   - Keep translations concise and natural
   - Maintain emoji icons for visual consistency
   - Use culturally appropriate phrasing
   - Get native speaker review before deployment

---

## Git Commands for Reference

```bash
# View bilingual title implementation
git show f9acafa

# View mandatory bilingual format change
git show cb0df8a

# View language prioritization changes
git show 4051d21

# Search for language-related code
git grep "outputLanguage" suggest-prompts

# View label translation implementation
git show ddc9034
```

---

## Related Features

- **Sub-Category Filters:** Can be used alongside language selection
- **Active Filters Display:** Shows selected language when not English
- **Print/Share:** Preserves selected language in exported content
- **Action Plans:** Generated entirely in selected language

---

## Technical Stack

- **GPT-5:** LLM for translation and content generation
- **Vercel AI SDK:** Streaming responses in multiple languages
- **shadcn/ui:** Language selector dropdown component
- **React State:** Client-side language preference management

---

## Performance Considerations

- **No translation API calls:** Uses LLM's native multilingual capabilities
- **Single request:** Language specified in initial API call
- **Fast generation:** Low reasoning effort maintains speed
- **No caching:** Each request generates fresh translations

---

## Known Limitations

1. **Label translations:** Currently only Spanish and French implemented
2. **Manual translations:** Label translations are hardcoded, not dynamic
3. **No persistent storage:** Language preference not saved between sessions
4. **Print view:** May need CSS adjustments for non-Latin scripts
5. **Character limits:** Very long translations may affect layout

---

## Future Enhancements

- [ ] Add Vietnamese label translations
- [ ] Add Chinese, Korean, Arabic label translations
- [ ] Persist language preference in localStorage
- [ ] Add language auto-detection based on browser settings
- [ ] Implement dynamic label translation via LLM
- [ ] Add text-to-speech for multilingual content
- [ ] Support right-to-left languages (Arabic)

---

## Contact & Support

For questions about multilingual implementation, contact the development team or review the commit history in the repository.

**Last Updated:** 2025-10-20
**Author:** Claude Code + Ryan Hansz
