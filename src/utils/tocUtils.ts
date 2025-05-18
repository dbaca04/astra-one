/**
 * Utility functions for handling Table of Contents generation
 */

/**
 * Represents a heading in a document
 */
export interface Heading {
    /** The heading level (1-6) */
    level: number;
    /** The ID of the heading (either extracted or generated) */
    id: string;
    /** The text content of the heading */
    text: string;
}

/**
 * Parses HTML content to extract headings
 * 
 * @param content The HTML content to parse
 * @param headingLevels Array of heading levels to extract (default: [2, 3])
 * @returns Array of Heading objects
 */
export function parseHeadings(content: string, headingLevels: number[] = [2, 3]): Heading[] {
    // If no content is provided, return an empty array
    if (!content || typeof content !== 'string') {
        return [];
    }

    // Build a regex pattern to match the specified heading levels
    const headingPattern = new RegExp(
        `<h(${headingLevels.join('|')})\\s*(?:id="([^"]*)")?[^>]*>([^<]*)<\/h\\1>`,
        'g'
    );

    const headings: Heading[] = [];
    let match;
    const existingIds = new Set<string>();

    // Use regex to extract headings with their level, id, and text
    while ((match = headingPattern.exec(content)) !== null) {
        const level = parseInt(match[1]);
        // Extract ID if present, or generate from text
        let id = match[2];
        const text = match[3].trim();

        // Skip headings with empty text
        if (!text) continue;

        // If no id, generate one based on text
        if (!id) {
            id = generateHeadingId(text);
        }

        // Ensure ID is unique by adding a suffix if needed
        let uniqueId = id;
        let counter = 1;

        while (existingIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
        }

        existingIds.add(uniqueId);
        headings.push({ level, id: uniqueId, text });
    }

    return headings;
}

/**
 * Generates a URL-friendly ID from heading text
 * 
 * @param text The heading text
 * @returns A URL-friendly ID
 */
export function generateHeadingId(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Remove consecutive hyphens
        .replace(/^-|-$/g, '')        // Remove leading/trailing hyphens
        || 'section';                 // Fallback if the result is empty
}

/**
 * Adds ID attributes to headings in HTML content if they don't already have them
 * 
 * @param content The HTML content
 * @param headingLevels Array of heading levels to process
 * @returns The HTML content with ID attributes added to headings
 */
export function addIdsToHeadings(content: string, headingLevels: number[] = [2, 3]): string {
    // If no content is provided, return it as is
    if (!content || typeof content !== 'string') {
        return content;
    }

    // Pattern to match headings without IDs
    const headingPattern = new RegExp(
        `<h(${headingLevels.join('|')})(?!\\s*id=)[^>]*>([^<]*)<\/h\\1>`,
        'g'
    );

    const existingIds = new Set<string>();

    // Extract existing IDs to avoid duplicates
    const idPattern = /<h\d+\s+[^>]*id="([^"]+)"[^>]*>/g;
    let idMatch;
    while ((idMatch = idPattern.exec(content)) !== null) {
        existingIds.add(idMatch[1]);
    }

    // Replace headings without IDs
    return content.replace(headingPattern, (match, level, text) => {
        let id = generateHeadingId(text.trim());

        // Ensure ID is unique
        let uniqueId = id;
        let counter = 1;

        while (existingIds.has(uniqueId)) {
            uniqueId = `${id}-${counter}`;
            counter++;
        }

        existingIds.add(uniqueId);
        return `<h${level} id="${uniqueId}">${text}</h${level}>`;
    });
}

/**
 * Generates a hierarchical structure for the table of contents
 * 
 * @param headings Array of headings
 * @returns Hierarchical heading structure
 */
export interface TocItem {
    heading: Heading;
    children: TocItem[];
}

export function generateTocStructure(headings: Heading[]): TocItem[] {
    const result: TocItem[] = [];

    if (!headings.length) return result;

    // Find the minimum heading level to use as the top level
    const minLevel = Math.min(...headings.map(h => h.level));

    // Create an empty stack to track the hierarchy
    let stack: TocItem[] = [];

    for (const heading of headings) {
        const tocItem: TocItem = { heading, children: [] };

        if (heading.level === minLevel) {
            // Top-level headings go directly into the result
            result.push(tocItem);
            stack = [tocItem];
        } else {
            // Find the appropriate parent for this heading
            while (
                stack.length > 0 &&
                stack[stack.length - 1].heading.level >= heading.level
            ) {
                stack.pop();
            }

            if (stack.length === 0) {
                // If we don't have a parent, add to the result
                result.push(tocItem);
            } else {
                // Add as a child to the last item on the stack
                stack[stack.length - 1].children.push(tocItem);
            }

            stack.push(tocItem);
        }
    }

    return result;
} 