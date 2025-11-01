import { useContext } from "react";
import { SnippetContext } from "../contexts/SnippetContext";

/**
 * Custom hook for consuming snippet context
 * Provides access to snippet state and actions
 *
 * @returns {Object} Snippet context value with state, actions, and selectors
 * @throws {Error} If used outside of SnippetProvider
 */
export const useSnippets = () => {
  const context = useContext(SnippetContext);

  if (context === undefined) {
    throw new Error("useSnippets must be used within a SnippetProvider");
  }

  return context;
};

export default useSnippets;
