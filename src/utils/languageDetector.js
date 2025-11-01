import hljs from "highlight.js";

/**
 * Supported programming languages for syntax highlighting
 */
export const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "sql", label: "SQL" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
  { value: "json", label: "JSON" },
  { value: "xml", label: "XML" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "plaintext", label: "Plain Text" },
];

/**
 * Detects the programming language of a code snippet using highlight.js auto-detection
 * @param {string} code - The code snippet to analyze
 * @returns {string} - The detected language or 'plaintext' as fallback
 */
export const detectLanguage = (code) => {
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return "plaintext";
  }

  try {
    const result = hljs.highlightAuto(code);

    // Check if detection confidence is reasonable (relevance > 2)
    // Lower threshold for better detection of short snippets
    if (result.language && result.relevance > 2) {
      return result.language;
    }

    // Fallback to plaintext if confidence is low
    return "plaintext";
  } catch (error) {
    console.error("Language detection failed:", error);
    return "plaintext";
  }
};

/**
 * Validates if a language is supported
 * @param {string} language - The language to validate
 * @returns {boolean} - True if language is supported
 */
export const isLanguageSupported = (language) => {
  return SUPPORTED_LANGUAGES.some((lang) => lang.value === language);
};

/**
 * Gets the display label for a language
 * @param {string} language - The language value
 * @returns {string} - The display label or the language value if not found
 */
export const getLanguageLabel = (language) => {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === language);
  return lang ? lang.label : language;
};
