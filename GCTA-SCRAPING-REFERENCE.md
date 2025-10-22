# GCTA Course Scraping Reference

## Overview

This document defines what data to extract when scraping GCTA (Goodwill Central Texas Apprenticeship) courses from https://gctatraining.org/class-schedule/ for display in the referral tool's resource listings.

## Target URL

**Primary Source:** https://gctatraining.org/class-schedule/

## Required Fields for Referral Listing

### 1. **Course Title**
- **Field Name:** `title`
- **Format:** `"GCTA - [Course Name]"`
- **Example:** `"GCTA - CompTIA A+ Certification"`
- **Notes:** Keep concise (5-6 words max)

### 2. **Service Type**
- **Field Name:** `service`
- **Format:** 1-2 word category
- **Examples:**
  - "IT Training"
  - "Healthcare Training"
  - "Manufacturing"
  - "Logistics Training"
  - "Welding"
  - "HVAC"

### 3. **Category**
- **Field Name:** `category`
- **Value:** `"GCTA Trainings"` (always)

### 4. **Provider Type**
- **Field Name:** `providerType`
- **Value:** `"Goodwill Provided"` (always)

### 5. **Start Date**
- **Field Name:** Include in `eligibility`
- **Format:** "Starts [Month] [Day], [Year]"
- **Example:** "Starts Jan 15, 2026"
- **Notes:** Critical for case managers to know timing

### 6. **Duration**
- **Field Name:** Include in `services`
- **Format:** "[X] weeks" or "[X] months"
- **Example:** "8-week program", "3-month training"

### 7. **Schedule**
- **Field Name:** Include in `services`
- **Format:** "[Days] [Time]"
- **Example:** "Mon-Fri 9am-5pm", "Tues/Thurs 6pm-9pm"

### 8. **Prerequisites**
- **Field Name:** Include in `eligibility`
- **Format:** Comma-separated list
- **Examples:**
  - "18+, HS diploma or GED"
  - "Valid driver's license, background check"
  - "Basic computer skills"

### 9. **Cost/Financial Info**
- **Field Name:** Include in `support`
- **Format:** Brief statement
- **Examples:**
  - "Free for eligible participants"
  - "Tuition assistance available"
  - "No cost, income requirements apply"

### 10. **Contact Information**
- **Field Name:** `contact`
- **Format:** `"Phone: [number] | Address: [city] | Hours: [brief]"`
- **Example:** `"Phone: 512-637-7100 | Address: Austin, TX | Hours: Mon-Fri 8am-5pm"`

### 11. **Source URL**
- **Field Name:** `source`
- **Format:** Direct link to course page (if available) or class schedule page
- **Example:** `"https://gctatraining.org/class-schedule/"`
- **Notes:** Prefer specific course pages over generic schedule page

### 12. **Badge**
- **Field Name:** `badge`
- **Format:** Domain/path extracted from source URL
- **Example:** `"gctatraining.org/class-schedule"`

## Secondary Fields (Scraped but Transformed)

### Course Description
- **Not displayed directly** but used to generate `whyItFits` (15-20 words explaining fit)
- Extract for context but don't include in final output

### Certifications Earned
- **Include in:** `services` field
- **Format:** "Earns [certification name]"
- **Example:** "Earns CompTIA A+ certification"

### Job Placement Rate (if available)
- **Include in:** `support` field
- **Format:** "[X]% job placement rate"
- **Example:** "85% job placement rate"

### Salary Expectations (if available)
- **Include in:** `support` field
- **Format:** "$[X]-$[Y] starting salary"
- **Example:** "$45K-$55K starting salary"

## Data Structure Example

```json
{
  "number": 1,
  "title": "GCTA - CompTIA A+ Certification",
  "service": "IT Training",
  "category": "GCTA Trainings",
  "providerType": "Goodwill Provided",
  "whyItFits": "Comprehensive IT training leading to industry-recognized certification with job placement support.",
  "eligibility": "18+, HS diploma or GED, Basic computer skills, Starts Mar 10, 2026",
  "services": "12-week program, Mon-Fri 9am-5pm, Hands-on labs, Earns CompTIA A+ cert",
  "support": "Free tuition, Job placement assistance, 80% job placement rate",
  "contact": "Phone: 512-637-7100 | Address: Austin, TX | Hours: Mon-Fri 8am-5pm",
  "source": "https://gctatraining.org/class-schedule/",
  "badge": "gctatraining.org/class-schedule"
}
```

## Scraping Priority

### High Priority (Always Extract)
1. Course title
2. Start date
3. Duration
4. Prerequisites
5. Contact info

### Medium Priority (Extract if Available)
1. Schedule (days/times)
2. Certifications earned
3. Cost/tuition info
4. Specific course URL

### Low Priority (Nice to Have)
1. Job placement rate
2. Salary expectations
3. Course description (for context)

## Course Categories to Track

Map scraped courses to these sub-categories:

| GCTA Course Area | Sub-Category ID | Display Name |
|-----------------|-----------------|--------------|
| IT/Computer courses | `it-certs` | IT & Technology |
| CNA, Medical Assistant, etc. | `healthcare-certs` | Healthcare Certifications |
| Call center, retail training | `customer-service` | Customer Service |
| Forklift, warehouse | `logistics-training` | Logistics & Warehouse |
| General manufacturing | `manufacturing` | Manufacturing |
| Welding programs | `welding` | Welding |
| HVAC programs | `hvac` | HVAC |
| Forklift only | `forklift` | Forklift Certification |
| CDL programs | `cdl` | CDL Training |

## Scraping Considerations

### Frequency
- **Recommended:** Weekly scrape (courses update regularly)
- **Minimum:** Monthly scrape
- **Critical periods:** Start of each quarter (Jan, Apr, Jul, Oct)

### Data Validation
- Verify start dates are in the future
- Check URLs are not 404
- Ensure phone numbers follow (XXX) XXX-XXXX format
- Validate course names don't contain HTML artifacts

### Handling Closed/Past Courses
- **Do not include** courses with past start dates
- **Do not include** "applications closed" courses
- **Flag** courses starting within 2 weeks (may be too late to apply)

### Error Handling
- If course page structure changes, fall back to class schedule page URL
- If specific field missing (e.g., duration), omit from output rather than guessing
- Log missing fields for manual review

## Output Format

Scraped data should be formatted as JSON array matching the resource structure used by `/api/generate-referrals`:

```json
{
  "gcta_courses": [
    {
      "title": "GCTA - Course Name",
      "service": "Training Type",
      "category": "GCTA Trainings",
      "providerType": "Goodwill Provided",
      "eligibility": "Requirements, Start date",
      "services": "Duration, Schedule, Certifications",
      "support": "Cost info, Job placement",
      "contact": "Phone | Address | Hours",
      "source": "https://...",
      "badge": "domain/path",
      "subcategory_id": "it-certs"
    }
  ],
  "scraped_at": "2026-01-15T10:30:00Z",
  "total_courses": 12
}
```

## Integration with Referral Tool

### Current Approach (No Scraping)
- LLM uses web search to find GCTA courses in real-time
- Prompt instructs: "Check https://gctatraining.org/class-schedule/"
- Relies on GPT-5's web search accuracy

### With Scraping (Future Enhancement)
- Pre-scraped courses stored in database or JSON file
- LLM references scraped data instead of web search
- Benefits:
  - Faster response times
  - More accurate course details
  - Consistent formatting
  - Reduced API costs (fewer web searches)

## Notes
- Keep scraped data concise - detailed info is fetched during action plan generation
- Focus on information needed for initial resource card display
- LLM will still use web search for action plans to get current application processes

**Last Updated:** 2025-10-22
**Author:** Claude Code + Ryan Hansz
