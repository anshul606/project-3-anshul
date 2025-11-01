import { useState, useCallback } from "react";

/**
 * Custom hook for clipboard operations
 * Uses the Clipboard API with fallback for unsupported browsers
 */
const useClipboard = () => {
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState(null);

  const copyToClipboard = useCallback(async (text) => {
    try {
      setError(null);

      // Check if Clipboard API is available
      if (navigator.clipboard && window.isSecureContext) {
        // Use modern Clipboard API
        await navigator.clipboard.writeText(text);
        setIsCopied(true);

        // Reset copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
        return true;
      } else {
        // Fallback for browsers without Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          const successful = document.execCommand("copy");
          textArea.remove();

          if (successful) {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            return true;
          } else {
            throw new Error("Copy command failed");
          }
        } catch (err) {
          textArea.remove();
          throw err;
        }
      }
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      setError("Failed to copy to clipboard");
      setIsCopied(false);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsCopied(false);
    setError(null);
  }, []);

  return {
    copyToClipboard,
    isCopied,
    error,
    reset,
  };
};

export default useClipboard;
