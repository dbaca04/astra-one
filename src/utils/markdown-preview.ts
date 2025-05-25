import { marked } from 'marked';
import DOMPurify from 'dompurify';

let markdownInput: HTMLTextAreaElement | null = null;
let htmlPreview: HTMLElement | null = null;

// Debounce function
function debounce(func: (...args: any[]) => void, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            // @ts-ignore
            func.apply(this, args);
        }, delay);
    };
}

// Function to update preview
function updatePreview() {
    console.log("updatePreview called from markdown-preview.ts");

    // Check for marked and DOMPurify should ideally not be needed here
    // if Vite bundles them correctly, but keeping for initial safety.
    if (typeof marked === 'undefined') {
        console.error("markdown-preview.ts: marked library is not loaded!");
        if (htmlPreview) htmlPreview.textContent = "Error: Markdown library (marked) not loaded.";
        return;
    }
    if (typeof DOMPurify === 'undefined') {
        console.error("markdown-preview.ts: DOMPurify library is not loaded!");
        if (htmlPreview) htmlPreview.textContent = "Error: Sanitizer library (DOMPurify) not loaded.";
        return;
    }

    if (
        markdownInput instanceof HTMLTextAreaElement &&
        htmlPreview instanceof HTMLElement
    ) {
        const markdownText = markdownInput.value;
        // console.log("Markdown text length:", markdownText.length); // Logged by original script
        try {
            const parseResult = marked.parse(markdownText);
            // console.log("marked.parse result type:", typeof parseResult); // Logged by original script
            // console.log("marked.parse result content:", parseResult); // Can be very verbose

            const processHtml = (htmlContent: any) => {
                // console.log("processHtml called with type:", typeof htmlContent); // Logged by original script
                if (typeof htmlContent === "string") {
                    try {
                        if (htmlPreview) htmlPreview.innerHTML = DOMPurify.sanitize(htmlContent);
                        else console.error("processHtml: htmlPreview element is null!");
                        // console.log("Preview updated successfully."); // Logged by original script
                    } catch (sanitizeError) {
                        console.error("Error during DOMPurify.sanitize:", sanitizeError);
                        if (htmlPreview) htmlPreview.textContent = "Error: Sanitization failed.";
                    }
                } else {
                    console.error(
                        "Processed HTML content is not a string:",
                        htmlContent,
                    );
                    if (htmlPreview) htmlPreview.textContent =
                        "Error: Preview could not be generated (invalid HTML content type).";
                }
            };

            if (parseResult && typeof (parseResult as Promise<any>).then === "function") {
                // console.log("Handling async marked.parse result (Promise)."); // Logged by original script
                (parseResult as Promise<string>)
                    .then((html) => {
                        // console.log("Async parse resolved. HTML type:", typeof html); // Logged by original script
                        processHtml(html);
                    })
                    .catch((promiseError) => {
                        console.error(
                            "Error during async Markdown parsing:",
                            promiseError,
                        );
                        if (htmlPreview) htmlPreview.textContent =
                            "Error: Preview failed due to an async parsing error.";
                    });
            } else if (typeof parseResult === "string") {
                // console.log("Handling sync marked.parse result (string)."); // Logged by original script
                processHtml(parseResult);
            } else {
                console.error(
                    "marked.parse did not return a string or a Promise:",
                    parseResult,
                );
                htmlPreview.textContent =
                    "Error: Preview could not be generated (unexpected parse result type).";
            }
        } catch (error) {
            console.error(
                "Error during Markdown parsing or initial processing:",
                error,
            );
            htmlPreview.textContent =
                "Error: Preview failed to update due to a parsing error.";
        }
    } else {
        // console.error("markdownInput or htmlPreview is not the correct HTMLElement type or is null."); // Logged by original script
        if (!(markdownInput instanceof HTMLTextAreaElement)) {
            // console.error("markdownInput is invalid:", markdownInput); // Logged by original script
        }
        if (!(htmlPreview instanceof HTMLElement)) {
            // console.error("htmlPreview is invalid:", htmlPreview); // Logged by original script
        }
    }
}

export function initMarkdownPreview() {
    markdownInput = document.getElementById("body") as HTMLTextAreaElement | null;
    htmlPreview = document.getElementById("preview") as HTMLElement | null;

    // Re-add console logs from the original script here for consistent debugging if needed
    console.log("initMarkdownPreview from markdown-preview.ts called");

    if (typeof marked === 'undefined') {
        console.error("initMarkdownPreview: marked library is not available at init!");
    }
    if (typeof DOMPurify === 'undefined') {
        console.error("initMarkdownPreview: DOMPurify library is not available at init!");
    }

    if (markdownInput instanceof HTMLTextAreaElement && htmlPreview instanceof HTMLElement) {
        console.log("Markdown preview elements found. Initializing.");
        updatePreview(); // Initial update
        const debouncedUpdatePreview = debounce(updatePreview, 300);
        markdownInput.addEventListener("input", debouncedUpdatePreview);
        console.log("Markdown preview event listener attached.");
    } else {
        console.error("Failed to initialize markdown preview: markdownInput or htmlPreview not found or invalid.");
        if (!markdownInput) console.error("markdownInput element ('body') not found.");
        if (!htmlPreview) console.error("htmlPreview element ('preview') not found.");
    }
} 