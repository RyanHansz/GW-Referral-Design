# Sub-Category Filters Implementation Reference

**Repository:** [GW-Referral-Design](https://github.com/RyanHansz/GW-Referral-Design)
**Branch:** `suggest-prompts`
**Commit:** `4051d21` - feat: update model settings and UI improvements

---

## Overview

Sub-category filters allow users to narrow down resources within a main category. For example, under "GCTA Trainings", users can filter by "IT & Technology", "Healthcare Certifications", etc.

<img width="715" height="615" alt="Screenshot 2025-10-20 at 11 17 10 AM" src="https://github.com/user-attachments/assets/0136b035-3e2f-4720-9485-324a91b28570" />


---

## Implementation Files & Key Locations

### **1. Data Structure & State Management**

**File:** `app/page.tsx`

**Sub-category definitions:** Lines 106-207
- Each category in `resourceCategories` has a `subCategories` array
- Structure: `{ id: string, label: string, description: string }`

**Example:**
```typescript
{
  id: "gcta",
  label: "GCTA Trainings",
  icon: GraduationCap,
  subCategories: [
    {
      id: "it-certs",
      label: "IT & Technology",
      description: "CompTIA A+, Network+, Security+, Google IT Support"
    },
    {
      id: "healthcare-certs",
      label: "Healthcare Certifications",
      description: "CNA, phlebotomy, EKG, medical assistant, patient care"
    },
    // ...
  ]
}
```

**State management:** Line 471
```typescript
const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([])
```

---

### **2. UI Components**

**File:** `app/page.tsx`

**Sub-category selector UI:** Lines ~2000-2050
- Nested under each main category accordion
- Shows when parent category is expanded
- Uses checkboxes for multi-select
- Toggle button to show/hide sub-categories

**Active Filters display:**
- **Streaming view:** Lines 2430-2444
- **History view:** Lines 2715-2729
- Shows selected sub-categories in "Active Filters" section
- Maps IDs to labels by searching through `resourceCategories`

**Example mapping logic:**
```typescript
selectedSubCategories.map((id) => {
  for (const cat of resourceCategories) {
    const subCat = cat.subCategories.find((s) => s.id === id)
    if (subCat) return subCat.label
  }
  return null
})
.filter(Boolean)
.join(", ")
```

---

### **3. API Integration**

#### **Generate Referrals API**
**File:** `app/api/generate-referrals/route.ts`

**Request payload:** Line 113
```typescript
subCategories: selectedSubCategories,
```

**Label mappings:** Lines 15-71
```typescript
const subCategoryLabels: Record<string, string> = {
  "it-certs": "IT & Technology",
  "healthcare-certs": "Healthcare Certifications",
  // ...
}
```

**Filter context building:** Lines 114-117
```typescript
if (hasSubCategoryFilters) {
  const subCategoryNames = filters.subCategories.map((id: string) => subCategoryLabels[id] || id).join(", ")
  filterContext += `\n- Sub-Categories: ${subCategoryNames}`
}
```

**Strict filtering logic:** Lines 152-159
- Sub-category filters are more specific than category filters
- LLM is instructed to ONLY return resources matching the sub-category

#### **Chat API**
**File:** `app/api/chat/route.ts`

**Similar implementation:** Lines 104-109
```typescript
if (selectedSubCategories.length > 0) {
  const subCategoryNames = selectedSubCategories
    .map((id: string) => subCategoryLabels[id] || id)
    .join(", ")
  filterContext += `- Sub-Categories: ${subCategoryNames}\n`
}
```

---

## Key Patterns & Best Practices

### **1. ID-based Selection**
- Use string IDs (e.g., `"it-certs"`, `"healthcare-certs"`)
- Store in state as `string[]`
- Map to labels when displaying or sending to API

### **2. Hierarchical Relationship**
- Sub-categories belong to parent categories
- User can select sub-categories from multiple parent categories
- Finding a sub-category's label requires searching all categories

### **3. Filter Context**
- Both category and sub-category filters are sent to LLM
- Sub-categories provide more specific filtering
- LLM is instructed to honor sub-category specificity

### **4. UI/UX Guidelines**
- Show sub-categories when parent category is expanded
- Use checkboxes for multi-select
- Display selected sub-categories in "Active Filters" section
- Provide clear visual hierarchy (indent, smaller text)

---

## Git Commands for Reference

```bash
# View the commit that added sub-category display
git show 4051d21

# See the diff for page.tsx changes
git diff 5971c6c..4051d21 app/page.tsx

# View the full file at this commit
git show 4051d21:app/page.tsx

# Search for sub-category related code
git grep "selectedSubCategories" 4051d21
```

---

## Testing Recommendations

### **Functional Testing**
1. ✅ Select multiple sub-categories within same parent category
2. ✅ Select sub-categories from different parent categories
3. ✅ Verify filters persist during navigation/page refresh
4. ✅ Check API receives correct sub-category IDs
5. ✅ Validate Active Filters display shows all selected sub-categories

### **Integration Testing**
1. ✅ Generate referrals with sub-category filters applied
2. ✅ Verify LLM respects sub-category specificity
3. ✅ Test with single vs. multiple resources
4. ✅ Test in different output languages

### **Edge Cases**
1. ✅ No sub-categories selected (should work like before)
2. ✅ Parent category + sub-category both selected
3. ✅ Sub-category from collapsed parent category
4. ✅ Clear all filters removes sub-categories

---

## Related Features

- **Category Filters:** Main filtering by resource type (Goodwill, Community, Government, etc.)
- **Language Preference:** Output language for generated content
- **Location Filters:** Geographic filtering for local resources
- **Active Filters Display:** Shows all applied filters in UI

---

## Additional Resources

- **Vercel AI SDK:** Used for streaming LLM responses
- **Next.js 14:** App router and server actions
- **Tailwind CSS:** Styling and responsive design
- **Lucide React:** Icon library

---

## Contact & Support

For questions about this implementation, contact the development team or review the commit history in the repository.

**Last Updated:** 2025-10-20
**Author:** Claude Code + Ryan Hansz
