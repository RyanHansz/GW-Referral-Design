# `parseMarkdownToHTML` Function Documentation

## Location
`lib/markdown.ts:12-52`

## Purpose
Converts raw markdown content into styled HTML suitable for display in the Goodwill Referral Tool UI. This function is the bridge between AI-generated markdown responses and the styled, user-facing content.

## Signature
```typescript
function parseMarkdownToHTML(content: string): string
```

**Parameters:**
- `content` (string): Raw markdown text from LLM responses

**Returns:**
- (string): Styled HTML with Tailwind CSS classes

## Processing Pipeline

The function uses a unified/remark/rehype pipeline with 5 stages:

### 1. **remarkParse**
Parses raw markdown string into an Abstract Syntax Tree (AST)

### 2. **remarkGfm** (GitHub Flavored Markdown)
Adds support for GFM extensions:
- Tables
- Strikethrough
- Task lists
- Autolinks
- Footnotes

### 3. **remarkRehype**
Converts markdown AST → HTML AST

### 4. **rehypeSanitize**
Sanitizes HTML to prevent XSS attacks
- Strips dangerous tags/attributes
- Essential for user-generated or AI-generated content

### 5. **rehypeStringify**
Converts HTML AST → HTML string

## Style Transformations

After processing, the function applies **Tailwind CSS classes** via regex replacements:

### Headers
```typescript
<h1> → text-2xl font-bold mb-4 text-slate-900
<h2> → text-xl font-semibold mb-3 text-slate-800
<h3> → text-lg font-semibold mb-2 text-slate-800
<h4-h6> → progressively smaller with consistent slate-800 color
```

### Text Elements
```typescript
<p> → mb-3 leading-relaxed
<strong> → font-semibold text-slate-900
<em> → italic
```

### Links
```typescript
<a> → text-blue-600 hover:text-blue-800 underline
      + target="_blank" rel="noopener noreferrer"
```
All links open in new tabs with security attributes.

### Lists
```typescript
<ul> → list-disc ml-6 mb-4 space-y-1
<ol> → list-decimal ml-6 mb-4 space-y-1
<li> → mb-1 leading-relaxed
```

### Special Elements
```typescript
<blockquote> → border-l-4 border-gray-300 pl-4 italic my-4
<code> → bg-gray-100 px-1 py-0.5 rounded text-sm font-mono
<pre> → bg-gray-100 p-4 rounded-lg overflow-x-auto my-4
```

## Usage in Application

The function is called in **3 main contexts** in `app/page.tsx`:

### 1. **Action Plan Rendering** (lines 3079, 3093, 3118)
```tsx
<div dangerouslySetInnerHTML={{
  __html: parseMarkdownToHTML(actionPlanContent)
}} />
```
Converts streamed action plan markdown from `/api/generate-action-plan`

### 2. **Chat Mode Messages** (lines 2317, 2347)
```tsx
<div dangerouslySetInnerHTML={{
  __html: parseMarkdownToHTML(message.content)
}} />
```
Renders AI chat responses with proper formatting

### 3. **Follow-Up Content** (line 3195)
```tsx
<div dangerouslySetInnerHTML={{
  __html: parseMarkdownToHTML(streamingFollowUpContent)
}} />
```
Displays follow-up question responses

### 4. **PDF Generation** (line 888)
Used when printing/exporting action plans to PDF format

## Design Decisions

### Why Process Client-Side?
- **Streaming compatibility**: Backend streams raw markdown; frontend renders progressively
- **Performance**: HTML generation happens in browser, reducing server load
- **Flexibility**: Easy to adjust styling without backend changes

### Why Regex Over Component-Level Styling?
- **Simplicity**: Direct HTML manipulation for `dangerouslySetInnerHTML`
- **Consistency**: Centralized styling for all markdown content
- **AI-generated content**: Unknown structure requires catch-all styling

### Security Considerations
- **rehypeSanitize**: Prevents XSS from malicious markdown
- **noopener noreferrer**: Prevents reverse tabnabbing attacks on external links

## Example Transformation

**Input Markdown:**
```markdown
### Austin Area Urban League
**How to apply:**
- Visit [application portal](https://areaul.org/apply)
- Complete intake form
```

**Output HTML:**
```html
<h3 class="text-lg font-semibold mb-2 text-slate-800">Austin Area Urban League</h3>
<p class="mb-3 leading-relaxed">
  <strong class="font-semibold text-slate-900">How to apply:</strong>
</p>
<ul class="list-disc ml-6 mb-4 space-y-1">
  <li class="mb-1 leading-relaxed">
    Visit <a target="_blank" rel="noopener noreferrer"
       class="text-blue-600 hover:text-blue-800 underline"
       href="https://areaul.org/apply">application portal</a>
  </li>
  <li class="mb-1 leading-relaxed">Complete intake form</li>
</ul>
```

## Dependencies

```json
{
  "unified": "latest",        // Plugin ecosystem core
  "remark-parse": "latest",   // Markdown → AST
  "remark-gfm": "latest",     // GitHub Flavored Markdown
  "remark-rehype": "latest",  // Markdown AST → HTML AST
  "rehype-sanitize": "latest",// XSS protection
  "rehype-stringify": "latest" // HTML AST → String
}
```

## Potential Improvements

1. **Memoization**: Cache processed HTML for identical markdown
2. **Progressive Enhancement**: Add syntax highlighting for code blocks
3. **Accessibility**: Add ARIA attributes to generated HTML
4. **Table Styling**: Add Tailwind classes for GFM tables (currently unstyled)
5. **Custom Markdown Extensions**: Support for callouts, footnotes with custom styling
