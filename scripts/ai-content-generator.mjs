#!/usr/bin/env node

import 'dotenv/config'; // To load .env variables
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http'; // Added http import

// Placeholder for AI SDK imports (e.g., OpenAI, Anthropic)
// import OpenAI from 'openai';
// import Anthropic from '@anthropic-ai/sdk';

// --- Configuration ---
// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Ensure this is in your .env for Gemini

// --- Load Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let config;

// Import AI model functions
import {
    generateOutline as geminiGenerateOutline,
    generateContentFromOutline as geminiGenerateContentFromOutline,
    generateSeoMeta as geminiGenerateSeoMeta,
    analyzeImageNeedsViaGemini,
    generateImageWithGemini,
    identifyDiagramOpportunitiesViaGemini,
    generateMermaidDiagramWithGemini,
} from './ai-models/gemini.mjs';
import { simpleParser } from './utils/simpleParser.mjs'; // Assuming simpleParser is in utils
import { slugify } from './utils/slugify.mjs'; // Import slugify
import { sendReviewEmail } from './utils/emailService.mjs'; // Import email service

try {
    const configPath = path.join(__dirname, 'ai-config.json');
    const configFile = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(configFile);
} catch (error) {
    console.error("Error loading ai-config.json:", error);
    process.exit(1); // Exit if config is essential and not found/parsable
}

// --- Helper Function for Frontmatter Parsing ---
/**
 * Parses YAML frontmatter from a Markdown string.
 * Very basic parser, assumes simple key: value pairs and well-formed YAML.
 * TODO: Consider using a robust YAML parsing library (e.g., js-yaml) in the future if requirements become more complex.
 * @param {string} content - The Markdown file content.
 * @returns {object|null} - The parsed frontmatter object or null if not found.
 */
function parseFrontmatter(content) {
    const frontmatterMatch = content.match(/^---([\s\S]+?)---/);
    if (!frontmatterMatch) return null;

    const frontmatterString = frontmatterMatch[1];
    const lines = frontmatterString.split('\n');
    const data = {};

    for (const line of lines) {
        const parts = line.match(/^\s*([^:]+):\s*(.*)\s*$/);
        if (parts) {
            const key = parts[1].trim();
            let value = parts[2].trim();

            // Attempt to parse simple arrays for tags
            if (key === 'tags' && value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value.replace(/'/g, '"')); // Replace single quotes for valid JSON
                } catch (e) {
                    // If JSON.parse fails, keep as string or handle error
                    // console.warn(`Could not parse tags array: ${value}`, e);
                }
            } else if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            } else if (value.startsWith("'") && value.endsWith("'")) {
                value = value.substring(1, value.length - 1);
            }
            data[key] = value;
        }
    }
    return Object.keys(data).length > 0 ? data : null;
}

/**
 * Processes a single Markdown file to extract context.
 * @param {string} filePath - The absolute path to the Markdown file.
 * @param {string} baseDir - The base directory to make the stored path relative to.
 * @returns {Promise<object|null>} - Context object or null if processing fails.
 */
async function processMarkdownFile(filePath, baseDir) {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const frontmatter = parseFrontmatter(content);
        if (frontmatter && frontmatter.title && frontmatter.description) {
            return {
                path: path.relative(baseDir, filePath).replace(/\\/g, '/'),
                title: frontmatter.title,
                description: frontmatter.description,
                tags: frontmatter.tags || [],
                date: frontmatter.date
            };
        }
    } catch (fileReadError) {
        console.warn(`Could not read or parse frontmatter for ${filePath}:`, fileReadError.message);
    }
    return null;
}

/**
 * Loads existing content context from Markdown files.
 * @param {string} contextDir - Directory to scan for context files.
 * @returns {Promise<Array<{title: string, tags: string[]}>>} - Array of existing post data.
 */
async function loadExistingContentContext(contextDir) {
    const existingContent = [];
    try {
        const files = await fs.readdir(contextDir, { withFileTypes: true });
        for (const file of files) {
            if (file.isDirectory()) {
                const potentialIndexPath = path.join(contextDir, file.name, 'index.md');
                const potentialMdPath = path.join(contextDir, file.name, `${file.name}.md`); // Less common
                let filePath = null;

                if (await fs.access(potentialIndexPath).then(() => true).catch(() => false)) {
                    filePath = potentialIndexPath;
                } else if (await fs.access(potentialMdPath).then(() => true).catch(() => false)) {
                    filePath = potentialMdPath;
                }

                if (filePath) {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const frontmatter = simpleParser(content);
                    if (frontmatter.title && frontmatter.tags) {
                        existingContent.push({
                            title: frontmatter.title,
                            tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? frontmatter.tags.split(',').map(tag => tag.trim()) : []),
                        });
                    }
                }
            } else if (file.isFile() && (file.name.endsWith('.md') || file.name.endsWith('.mdx'))) {
                // Handle standalone files directly in contextDir (less common for this project structure)
                const filePath = path.join(contextDir, file.name);
                const content = await fs.readFile(filePath, 'utf-8');
                const frontmatter = simpleParser(content);
                if (frontmatter.title && frontmatter.tags) {
                    existingContent.push({
                        title: frontmatter.title,
                        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : (frontmatter.tags ? frontmatter.tags.split(',').map(tag => tag.trim()) : []),
                    });
                }
            }
        }
    } catch (error) {
        console.warn('Could not load existing content context:', error.message);
        // Return empty or partial context if some files fail
    }
    return existingContent;
}

/**
 * Checks for duplicate content based on title and keywords.
 * @param {{title: string}} userInput - The user's input for the new post.
 * @param {Array<{title: string, tags: string[]}>} existingContentContext - Context from existing posts.
 * @param {object} config - Loaded AI configuration.
 * @returns {{isDuplicate: boolean, reason?: string, matchedPost?: {title: string, tags: string[]}}}
 */
async function checkForDuplicates(userInput, existingContentContext, config) {
    const normalizedUserInputTitle = userInput.title.toLowerCase().trim();
    const keywordOverlapThreshold = config.duplicateDetection?.keywordOverlapThreshold || 3;

    for (const existingPost of existingContentContext) {
        const normalizedExistingTitle = existingPost.title.toLowerCase().trim();
        if (normalizedExistingTitle === normalizedUserInputTitle) {
            return {
                isDuplicate: true,
                reason: `Exact title match with existing post: "${existingPost.title}"`,
                matchedPost: existingPost,
            };
        }

        // Keyword overlap check
        const userInputKeywords = normalizedUserInputTitle.split(/\s+/); // Simple split by space
        const existingTags = existingPost.tags.map(tag => tag.toLowerCase());

        let overlapCount = 0;
        for (const keyword of userInputKeywords) {
            if (existingTags.includes(keyword)) {
                overlapCount++;
            }
        }

        if (overlapCount >= keywordOverlapThreshold) {
            return {
                isDuplicate: true,
                reason: `Significant keyword overlap (${overlapCount} keywords) with existing post: "${existingPost.title}"`,
                matchedPost: existingPost,
            };
        }
    }

    return { isDuplicate: false };
}

// --- Helper Functions / Modules (to be created later) ---

/**
 * Generates a blog post outline.
 * @param {string} topicOrKeywords - The input topic or keywords.
 * @param {Array<{title: string, tags: string[]}>} existingContent - Context from existing posts.
 * @param {object} currentConfig - The AI configuration object.
 * @returns {Promise<object>} - The generated outline.
 */
async function generateOutline(topicOrKeywords, existingContent, currentConfig) {
    console.log(`Generating outline for: ${topicOrKeywords} using ${currentConfig.aiModels.outlineGenerator.modelName}`);
    // Pass existingContent to the Gemini function for contextual awareness
    const outline = await geminiGenerateOutline(topicOrKeywords, existingContent, currentConfig);
    if (!outline || !outline.title || !Array.isArray(outline.sections) || outline.sections.length === 0) {
        console.error("Error: Failed to generate a valid outline from Gemini or outline is empty.");
        console.error("Received outline:", JSON.stringify(outline, null, 2));
        // Fallback or throw error
        return { title: topicOrKeywords, sections: ["Introduction", "Main Content", "Conclusion"] };
    }
    return outline;
}

/**
 * Generates content for a specific section of the blog post.
 * @param {string} sectionTitle - The title of the section.
 * @param {string} topicContext - The overall topic context.
 * @param {object} fullOutline - The full outline object for context.
 * @param {Array<{title: string, tags: string[]}>} existingContent - Context from existing posts.
 * @param {object} currentConfig - The AI configuration object.
 * @returns {Promise<string>} - The generated content for the section.
 */
async function generateSectionContent(sectionTitle, topicContext, fullOutline, existingContent, currentConfig) {
    console.log(`Generating content for section: ${sectionTitle} (Context: ${topicContext}) using ${currentConfig.aiModels.contentGenerator.modelName}`);
    const content = await geminiGenerateContentFromOutline(sectionTitle, topicContext, fullOutline, existingContent, currentConfig);
    if (!content) {
        console.error(`Error: Failed to generate content for section "${sectionTitle}".`);
        return `<p>Error generating content for ${sectionTitle}.</p>`; // Fallback
    }
    return content;
}

/**
 * Optimizes the blog post for SEO.
 * @param {string} fullContent - The complete blog post content.
 * @param {string} topicOrKeywords - The initial topic or keywords.
 * @param {object} currentConfig - The AI configuration object.
 * @returns {Promise<object>} - SEO suggestions (title, description, tags).
 */
async function optimizeSEO(fullContent, topicOrKeywords, currentConfig) {
    console.log(`Optimizing SEO for topic: ${topicOrKeywords} using ${currentConfig.aiModels.seoOptimizer.modelName}`);
    const seoData = await geminiGenerateSeoMeta(fullContent, topicOrKeywords, currentConfig);
    if (!seoData || !seoData.seoTitle || !seoData.metaDescription || !Array.isArray(seoData.tags)) {
        console.error("Error: Failed to generate valid SEO data from Gemini.");
        console.error("Received SEO data:", JSON.stringify(seoData, null, 2));
        // Fallback
        return {
            seoTitle: topicOrKeywords,
            metaDescription: `An article about ${topicOrKeywords}.`,
            tags: topicOrKeywords.toLowerCase().split(/\s+/).filter(Boolean)
        };
    }
    return seoData;
}

const GENERATE_IMAGES = false; // Toggle for image generation feature
const GENERATE_DIAGRAMS = false; // Toggle for diagram generation feature

/**
 * Formats the blog post content into Markdown with YAML frontmatter.
 * @param {string} h1Title - The main H1 title for the blog post body.
 * @param {Array<{sectionTitle: string, content: string}>} sectionsContent - Array of section titles and their content.
 * @param {object} seoData - SEO data ({ seoTitle, metaDescription, tags }).
 * @param {Array<string>} imagePaths - Array of image paths.
 * @param {Array<{sectionTitle: string, mermaidSyntax: string}>} diagramData - Array of diagram data.
 * @param {object} config - Loaded AI configuration.
 * @returns {string} - The Markdown formatted blog post with frontmatter.
 */
function formatToMarkdown(h1Title, sectionsContent, seoData, imagePaths = [], diagramData = [], config) {
    console.log("Formatting to Markdown with YAML frontmatter...");

    const today = new Date().toISOString().split('T')[0];
    const slug = seoData.seoTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    let frontmatter = '---\n';
    frontmatter += `title: "${seoData.seoTitle || h1Title}"\n`;
    frontmatter += `description: "${seoData.metaDescription || ''}"\n`;
    frontmatter += `publishDate: ${today}\n`;
    frontmatter += `author: "${config?.author || 'AI Assistant'}"\n`;
    frontmatter += `category: "${config?.defaultCategory || 'General'}"\n`;
    frontmatter += `tags: [${(seoData.seoKeywords || []).map(tag => `"${tag}"`).join(', ')}]\n`;
    frontmatter += `draft: true\n`; // Posts are initially drafts
    // Use a placeholder for featuredImage, to be updated after images are moved
    frontmatter += `featuredImage: "__TEMP_FEATURED_IMAGE__"\n`;
    frontmatter += '---\n\n';

    sectionsContent.forEach(section => {
        frontmatter += `## ${section.sectionTitle}\n`;
        frontmatter += `${section.content}\n\n`;
    });

    frontmatter += `---`;

    let body = `\n# ${h1Title}\n\n`;

    // Basic image integration - just listing them for now, or a simple embed of the first one
    if (imagePaths.length > 0) {
        body += `![Generated Image](${imagePaths[0]})\n\n`; // Simple embed of the first image
        // Or list all image paths for manual placement:
        // body += "Suggested images (placeholders/generated):\n";
        // imagePaths.forEach(imgPath => { body += `- ${imgPath}\n`; });
        // body += "\n";
    }

    sectionsContent.forEach(section => {
        body += `## ${section.sectionTitle}\n`;
        body += `${section.content}\n\n`;

        // Embed diagram if available for this section
        const diagramForSection = diagramData.find(d => d.sectionTitle === section.sectionTitle);
        if (diagramForSection && diagramForSection.mermaidSyntax) {
            body += '```mermaid\n';
            body += diagramForSection.mermaidSyntax + '\n';
            body += '```\n\n';
        }
    });

    return frontmatter.trim() + '\n' + body.trim() + '\n';
}

// --- Main Workflow Function ---
/**
 * Orchestrates the AI content generation process.
 * @param {string} topic - The topic for the blog post.
 * @param {object} config - Loaded AI configuration.
 */
async function generateBlogContent(topic, config) {
    console.log(`Starting blog content generation for topic: "${topic}"`);
    let existingContentContext = [];
    let duplicateCheckResult = { isDuplicate: false };
    let outline = null;
    let sectionsContent = [];
    let seoMeta = null;
    let generatedImagePaths = [];
    let generatedDiagrams = [];
    let markdownOutput = "";
    let markdownFilePath = null; // Define here for broader scope

    try {
        // 1. Load existing content context
        try {
            console.log("Loading existing content context...");
            existingContentContext = await loadExistingContentContext(config.paths.contextDir || 'src/content/blog');
            console.log(`Found ${existingContentContext.length} existing posts for context.`);
        } catch (error) {
            console.warn(`Warning: Could not load existing content context: ${error.message}. Proceeding without it.`);
            existingContentContext = []; // Ensure it's an empty array
        }

        // 2. Check for Duplicates
        try {
            console.log("Checking for duplicates...");
            duplicateCheckResult = await checkForDuplicates({ title: topic }, existingContentContext, config);
        } catch (error) {
            console.warn(`Warning: Duplicate check failed: ${error.message}. Proceeding with generation, assuming not a duplicate.`);
            duplicateCheckResult = { isDuplicate: false }; // Default to not duplicate on error
        }

        if (duplicateCheckResult.isDuplicate) {
            console.error(`Duplicate content detected for topic "${topic}". Reason: ${duplicateCheckResult.reason}`);
            if (duplicateCheckResult.matchedPost) {
                console.error(`Matched Post: ${duplicateCheckResult.matchedPost.title} (Path: ${duplicateCheckResult.matchedPost.path})`);
            }
            // Optional: Add user interaction here to override or stop.
            // For now, we stop generation if a duplicate is found.
            return; // Stop generation
        }
        console.log("No significant duplicates found. Proceeding with content generation.");

        // 3. Outline Generation
        console.log("Generating outline...");
        outline = await generateOutline(topic, existingContentContext, config);
        if (!outline) {
            console.error("Failed to generate outline. Terminating content generation.");
            return;
        }
        console.log("Outline generated:", JSON.stringify(outline, null, 2));

        // 4. Content Generation for each section
        console.log("Generating content for sections...");
        for (const sectionTitle of outline.sections) {
            console.log(`Generating content for section: "${sectionTitle}"...`);
            const content = await generateSectionContent(sectionTitle, topic, outline, existingContentContext, config);
            if (content) {
                sectionsContent.push({ sectionTitle, content });
            } else {
                console.warn(`Warning: No content generated for section "${sectionTitle}". Skipping.`);
                sectionsContent.push({ sectionTitle, content: "<!-- Content generation failed for this section -->" });
            }
        }
        if (sectionsContent.length === 0) {
            console.error("No content generated for any section. Terminating.");
            return;
        }

        const fullGeneratedTextForSeo = sectionsContent.map(s => s.content).join("\n\n");

        // 5. SEO Optimization
        console.log("Optimizing SEO...");
        seoMeta = await optimizeSEO(fullGeneratedTextForSeo, topic, config);
        if (!seoMeta) {
            console.warn("Failed to generate SEO meta. Using fallback values.");
            seoMeta = { seoTitle: topic, seoDescription: "Generated blog post.", seoKeywords: [topic.toLowerCase()] };
        }
        console.log("SEO Data:", JSON.stringify(seoMeta, null, 2));

        // Additional steps for images and diagrams (wrapped in their own try/catch where appropriate)
        // 3.1 Image Analysis and Generation (Optional)
        if (GENERATE_IMAGES) {
            try {
                console.log("Analyzing image needs...");
                const imageSuggestions = await analyzeImageNeedsViaGemini(topic, fullGeneratedTextForSeo, outline, config);
                if (imageSuggestions && imageSuggestions.length > 0) {
                    console.log(`Found ${imageSuggestions.length} image suggestions.`);
                    for (const suggestion of imageSuggestions) {
                        if (suggestion.necessity_score >= (config.imageGeneration?.necessityThreshold || 0.7)) {
                            console.log(`Generating image for section "${suggestion.section_title}": ${suggestion.image_description}`);
                            const imagePath = await generateImageWithGemini(suggestion.image_description, config.aiModels.imageGenerator, config.paths.imageOutputDir);
                            if (imagePath) {
                                generatedImagePaths.push(imagePath);
                            } else {
                                console.warn(`Failed to generate image for prompt: ${suggestion.image_description}`);
                            }
                        }
                    }
                } else {
                    console.log("No compelling image needs identified or image analysis failed.");
                }
            } catch (imgError) {
                console.error(`Error during image analysis/generation: ${imgError.message}`);
            }
        } else {
            console.log("Image generation is currently disabled (GENERATE_IMAGES is false).");
        }

        // 3.5 Diagram Analysis and Generation (Optional)
        if (GENERATE_DIAGRAMS) {
            try {
                console.log("Analyzing diagram needs...");
                const diagramOpportunities = await identifyDiagramOpportunitiesViaGemini(topic, fullGeneratedTextForSeo, outline, config);
                if (diagramOpportunities && diagramOpportunities.length > 0) {
                    console.log(`Found ${diagramOpportunities.length} diagram opportunities.`);
                    let diagramsGeneratedCount = 0;
                    for (const opp of diagramOpportunities) {
                        if (diagramsGeneratedCount >= (config.diagramGeneration?.maxDiagramsPerPost || 2)) break;
                        if (opp.necessity_score >= (config.diagramGeneration?.necessityThreshold || 0.7)) {
                            console.log(`Generating diagram for section "${opp.section_title}" on "${opp.diagram_topic}" (type: ${opp.diagram_type})`);
                            const diagramPrompt = `Create a ${opp.diagram_type} diagram about ${opp.diagram_topic} relevant to the section titled "${opp.section_title}".`;
                            const mermaidSyntax = await generateMermaidDiagramWithGemini(diagramPrompt, config);
                            if (mermaidSyntax && !mermaidSyntax.includes("Error generating diagram") && !mermaidSyntax.includes("Invalid response from AI")) {
                                generatedDiagrams.push({ sectionTitle: opp.section_title, mermaidSyntax });
                                diagramsGeneratedCount++;
                            } else {
                                console.warn(`Failed to generate valid Mermaid syntax for: ${opp.diagram_topic}`);
                            }
                        }
                    }
                } else {
                    console.log("No compelling diagram needs identified or diagram analysis failed.");
                }
            } catch (diagError) {
                console.error(`Error during diagram analysis/generation: ${diagError.message}`);
            }
        } else {
            console.log("Diagram generation is currently disabled (GENERATE_DIAGRAMS is false).");
        }

        // 6. Formatting
        console.log("Formatting final Markdown output...");
        markdownOutput = formatToMarkdown(outline.title || topic, sectionsContent, seoMeta, generatedImagePaths, generatedDiagrams, config);
        // console.log("\n--- Generated Markdown ---");
        // console.log(markdownOutput);
        // console.log("--- End of Markdown ---");

        // 6. Save to file (Initial save)
        const postSlug = slugify(seoMeta.seoTitle || topic || "untitled-post");
        const outputPostDir = path.join(config.paths.outputDir, postSlug);

        try {
            await fs.promises.mkdir(outputPostDir, { recursive: true });
            markdownFilePath = path.join(outputPostDir, 'index.md');
            await fs.promises.writeFile(markdownFilePath, markdownOutput);
            console.log(`Initial blog post draft saved to: ${markdownFilePath.replace(/\\/g, '/')}`);
        } catch (error) {
            console.error(`CRITICAL: Error saving initial blog post draft to ${markdownFilePath || outputPostDir}: ${error.message}. Further processing stopped.`);
            return; // Stop if we can't save the main file
        }

        // 6.5 Move images and update paths
        let tempMarkdownContentHolder = markdownOutput; // Use a temp holder for manipulations

        const finalImageRelativePaths = [];
        if (GENERATE_IMAGES && generatedImagePaths.length > 0) {
            console.log("Moving images to post directory and updating paths...");
            const postImagesDir = path.join(outputPostDir, 'images');
            try {
                await fs.promises.mkdir(postImagesDir, { recursive: true });
            } catch (error) {
                console.warn(`Warning: Could not create images directory ${postImagesDir}: ${error.message}. Images might not be saved correctly.`);
            }

            for (const tempImagePath of generatedImagePaths) {
                const imageName = path.basename(tempImagePath);
                const finalImagePathInRepo = path.join(postImagesDir, imageName);
                const relativeImagePathForMarkdown = `./images/${imageName}`;
                try {
                    await fs.promises.rename(tempImagePath, finalImagePathInRepo);
                    console.log(`Moved ${tempImagePath} to ${finalImagePathInRepo.replace(/\\/g, '/')}`);
                    const tempImagePathRegex = new RegExp(tempImagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
                    tempMarkdownContentHolder = tempMarkdownContentHolder.replace(tempImagePathRegex, relativeImagePathForMarkdown);
                    finalImageRelativePaths.push(relativeImagePathForMarkdown);
                } catch (moveError) {
                    console.error(`Error moving image ${tempImagePath} to ${finalImagePathInRepo}: ${moveError.message}. Keeping original path in Markdown.`);
                    finalImageRelativePaths.push(tempImagePath);
                }
            }
        }

        if (finalImageRelativePaths.length > 0) {
            const featuredImageActualPath = finalImageRelativePaths[0];
            tempMarkdownContentHolder = tempMarkdownContentHolder.replace('featuredImage: "__TEMP_FEATURED_IMAGE__"\n', `featuredImage: "${featuredImageActualPath}"\n`);
        } else {
            tempMarkdownContentHolder = tempMarkdownContentHolder.replace('featuredImage: "__TEMP_FEATURED_IMAGE__"\n', 'featuredImage: ""\n');
        }

        try {
            await fs.promises.writeFile(markdownFilePath, tempMarkdownContentHolder);
            console.log(`Blog post updated with final image paths: ${markdownFilePath.replace(/\\/g, '/')}`);
            markdownOutput = tempMarkdownContentHolder; // Final markdown for email
        } catch (writeError) {
            console.error(`Error saving blog post with updated image paths to ${markdownFilePath}: ${writeError.message}`);
            // If this fails, email will get the version before image path correction.
        }

        // 7. Send for Review (Optional)
        if (config.emailReview && config.emailReview.enabled) {
            console.log("Attempting to send email for review...");
            if (markdownFilePath && fs.existsSync(markdownFilePath)) { // Check if file exists before trying to attach
                const emailSubject = `${config.emailReview.subjectPrefix} ${seoMeta.seoTitle || topic}`;
                const plainTextEmailBody = `A new AI-generated blog post draft is ready for review.\n\nTitle: ${seoMeta.seoTitle || topic}\nFile: ${postSlug}/index.md\n\nContent snippet (see attachment for full Markdown):\n${sectionsContent.map(s => `## ${s.sectionTitle}\n${s.content}`).join('\n\n').substring(0, 500)}...`;
                const htmlEmailBody = `<p>A new AI-generated blog post draft is ready for review.</p><p><b>Title:</b> ${seoMeta.seoTitle || topic}</p><p><b>File:</b> ${postSlug}/index.md</p><p><i>See attached Markdown file for full content.</i></p>`;
                const attachments = [{
                    filename: `${postSlug}_index.md`,
                    content: markdownOutput, // Use the potentially updated markdownOutput
                    contentType: 'text/markdown'
                }];
                try {
                    const emailSent = await sendReviewEmail(config.emailReview, emailSubject, htmlEmailBody, plainTextEmailBody, attachments);
                    if (!emailSent) {
                        console.warn("Email review notification failed to send (see previous errors from emailService).");
                    }
                } catch (emailError) {
                    console.error(`Error sending review email: ${emailError.message}`);
                }
            } else {
                console.warn("Could not send review email because the output Markdown file was not found.");
            }
        } else {
            console.log("Email review notification is disabled in the configuration.");
        }

        console.log("Blog content generation process completed successfully.");

    } catch (error) {
        // This is the top-level catch for generateBlogContent
        console.error(`FATAL ERROR during blog content generation for topic "${topic}": ${error.message}`);
        console.error(error.stack); // Log stack for more details
        // Optionally, rethrow or process.exit(1) if this script is run standalone
    }
}

// Main execution block
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
    const topic = process.argv[2];
    if (!topic) {
        console.error("Please provide a topic as a command-line argument.");
        process.exit(1);
    }

    (async () => {
        try {
            await generateBlogContent(topic, config);
        } catch (e) {
            // This catch is for the async wrapper around generateBlogContent in CLI mode
            console.error(`Unhandled error in CLI execution: ${e.message}`);
            process.exit(1);
        }
    })();
} else {
    // Start HTTP server if not run as a CLI script
    const PORT = process.env.PORT || 3000;
    const server = http.createServer(async (req, res) => {
        if (req.method === 'POST' && req.url === '/generate-content') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', async () => {
                try {
                    const { topic } = JSON.parse(body);
                    if (!topic) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Topic is required' }));
                        return;
                    }
                    console.log(`Received request to generate content for topic: "${topic}"`);
                    await generateBlogContent(topic, config); // Pass config
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Content generation process started.' }));
                } catch (error) {
                    console.error('Error processing request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Failed to process request', details: error.message }));
                }
            });
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    });

    server.listen(PORT, () => {
        console.log(`Content generation server listening on port ${PORT}`);
        console.log(`To trigger generation, send a POST request to http://localhost:${PORT}/generate-content with JSON body: { "topic": "your topic here" }`);
    });
} 