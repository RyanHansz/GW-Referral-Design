import fs from "fs"
import path from "path"

/**
 * Load context from a markdown file in the lib/context directory
 * @param filename - Name of the context file (e.g., "goodwill-context.md")
 * @returns The contents of the context file as a string
 */
export function loadContext(filename: string): string {
  try {
    const contextPath = path.join(process.cwd(), "lib", "context", filename)
    const content = fs.readFileSync(contextPath, "utf-8")
    return content
  } catch (error) {
    console.error(`Error loading context file ${filename}:`, error)
    return ""
  }
}

/**
 * Load the Goodwill Central Texas program context
 * @returns Detailed information about Goodwill programs and services
 */
export function loadGoodwillContext(): string {
  return loadContext("goodwill-context.md")
}
