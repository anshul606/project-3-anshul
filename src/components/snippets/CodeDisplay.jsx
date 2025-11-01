import { useEffect, useRef } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "./CodeDisplay.css";
import { detectLanguage } from "../../utils/languageDetector";

/**
 * CodeDisplay component with syntax highlighting
 * Displays code with language-specific formatting using highlight.js
 *
 * @param {Object} props
 * @param {string} props.code - The code content to display
 * @param {string} props.language - The programming language (optional, will auto-detect if not provided)
 * @param {boolean} props.showLineNumbers - Whether to show line numbers (default: false)
 * @param {string} props.className - Additional CSS classes
 */
const CodeDisplay = ({
  code,
  language = null,
  showLineNumbers = false,
  className = "",
}) => {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current && code) {
      // Determine the language to use
      let detectedLanguage = language;

      // Auto-detect language if not provided
      if (!detectedLanguage || detectedLanguage === "auto") {
        detectedLanguage = detectLanguage(code);
      }

      try {
        // Apply syntax highlighting
        if (detectedLanguage && detectedLanguage !== "plaintext") {
          const result = hljs.highlight(code, {
            language: detectedLanguage,
            ignoreIllegals: true,
          });
          codeRef.current.innerHTML = result.value;
        } else {
          // Fallback to plain text
          codeRef.current.textContent = code;
        }
      } catch (error) {
        console.error("Syntax highlighting failed:", error);
        // Fallback to plain text on error
        codeRef.current.textContent = code;
      }
    }
  }, [code, language]);

  if (!code) {
    return <div className="text-gray-500 italic p-4">No code to display</div>;
  }

  const lines = code.split("\n");

  return (
    <div className={`code-display-container ${className}`}>
      <pre className="hljs rounded-lg overflow-x-auto">
        {showLineNumbers ? (
          <div className="flex">
            <div className="line-numbers select-none pr-4 text-gray-500 text-right border-r border-gray-700">
              {lines.map((_, index) => (
                <div key={index} className="leading-6">
                  {index + 1}
                </div>
              ))}
            </div>
            <code ref={codeRef} className="flex-1 pl-4 block">
              {code}
            </code>
          </div>
        ) : (
          <code ref={codeRef} className="block">
            {code}
          </code>
        )}
      </pre>
    </div>
  );
};

export default CodeDisplay;
