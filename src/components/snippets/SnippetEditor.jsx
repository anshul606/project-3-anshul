import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePreferences } from "../../contexts/PreferencesContext";
import useCollections from "../../hooks/useCollections";
import { SUPPORTED_LANGUAGES } from "../../utils/languageDetector";
import { TagInput } from "../shared";
import { getTagSuggestions, updateTagUsage } from "../../services/tagService";

/**
 * SnippetEditor component for creating and editing code snippets
 * Features:
 * - Code textarea with tab support
 * - Language selector with 20+ languages
 * - Metadata fields (title, description, usage notes, dependencies)
 * - Tag input with autocomplete
 * - Auto-save draft functionality
 * - Save and cancel buttons with loading states
 */

const DRAFT_KEY_PREFIX = "snippet_draft_";
const AUTO_SAVE_DELAY = 2000; // 2 seconds

const SnippetEditor = ({ snippet, onSave, onCancel, mode = "create" }) => {
  const { user: currentUser } = useAuth();
  const { preferences } = usePreferences();
  const { collections } = useCollections();

  // Get default language from preferences
  const defaultLanguage = preferences?.defaultLanguage || "javascript";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: defaultLanguage,
    tags: [],
    collectionId: null,
    metadata: {
      usageNotes: "",
      dependencies: "",
      author: "",
    },
  });

  const [tagSuggestions, setTagSuggestions] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);

  // Draft key for localStorage
  const draftKey = `${DRAFT_KEY_PREFIX}${
    mode === "edit" ? snippet?.id : "new"
  }`;

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && snippet) {
      // Editing existing snippet
      setFormData({
        title: snippet.title || "",
        description: snippet.description || "",
        code: snippet.code || "",
        language: snippet.language || defaultLanguage,
        tags: snippet.tags || [],
        collectionId: snippet.collectionId || null,
        metadata: {
          usageNotes: snippet.metadata?.usageNotes || "",
          dependencies: snippet.metadata?.dependencies || "",
          author: snippet.metadata?.author || "",
        },
      });
    } else if (mode === "create") {
      // Check for saved draft
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          setFormData(draftData);
        } catch (error) {
          console.error("Error loading draft:", error);
        }
      } else {
        // Set default language from preferences for new snippets
        setFormData((prev) => ({
          ...prev,
          language: defaultLanguage,
        }));
      }
    }
  }, [snippet, mode, draftKey, defaultLanguage]);

  // Auto-save draft functionality
  useEffect(() => {
    if (mode === "create") {
      // Clear existing timeout
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }

      // Set new timeout for auto-save
      const timeout = setTimeout(() => {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      }, AUTO_SAVE_DELAY);

      setAutoSaveTimeout(timeout);

      // Cleanup
      return () => {
        if (timeout) {
          clearTimeout(timeout);
        }
      };
    }
  }, [formData, mode, draftKey]);

  // Load tag suggestions from Firestore
  useEffect(() => {
    const loadTagSuggestions = async () => {
      if (currentUser?.uid) {
        try {
          const suggestions = await getTagSuggestions(currentUser.uid, 50);
          setTagSuggestions(suggestions);
        } catch (error) {
          console.error("Error loading tag suggestions:", error);
          // Fallback to common tags if loading fails
          setTagSuggestions([
            "algorithm",
            "api",
            "authentication",
            "database",
            "frontend",
            "backend",
            "utility",
            "helper",
            "component",
            "hook",
            "function",
            "class",
            "testing",
            "validation",
            "formatting",
          ]);
        }
      }
    };

    loadTagSuggestions();
  }, [currentUser]);

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle metadata changes
  const handleMetadataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
    }));
  };

  // Handle tab key in textarea
  const handleCodeKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;

      // Insert tab character
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      handleChange("code", newValue);

      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Handle tag changes
  const handleTagsChange = (newTags) => {
    setFormData((prev) => ({
      ...prev,
      tags: newTags,
    }));

    // Clear tag error
    if (errors.tags) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.tags;
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
    }

    if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code content is required";
    }

    if (!formData.language) {
      newErrors.language = "Programming language is required";
    }

    if (formData.metadata.usageNotes.length > 2000) {
      newErrors.usageNotes = "Usage notes must be less than 2000 characters";
    }

    if (formData.metadata.dependencies.length > 2000) {
      newErrors.dependencies = "Dependencies must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Add author if not set
      const snippetData = {
        ...formData,
        metadata: {
          ...formData.metadata,
          author:
            formData.metadata.author ||
            currentUser?.displayName ||
            currentUser?.email ||
            "",
        },
      };

      await onSave(snippetData);

      // Update tag usage in Firestore
      if (currentUser?.uid && snippetData.tags.length > 0) {
        await updateTagUsage(currentUser.uid, snippetData.tags);
      }

      // Clear draft after successful save
      if (mode === "create") {
        localStorage.removeItem(draftKey);
      }
    } catch (error) {
      console.error("Error saving snippet:", error);
      setErrors({ submit: error.message || "Failed to save snippet" });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    // Optionally clear draft
    if (mode === "create" && window.confirm("Discard draft?")) {
      localStorage.removeItem(draftKey);
    }
    onCancel();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          {mode === "create" ? "Create New Snippet" : "Edit Snippet"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.title
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
              placeholder="Enter snippet title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Language Selector */}
          <div>
            <label
              htmlFor="language"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Programming Language <span className="text-red-500">*</span>
            </label>
            <select
              id="language"
              value={formData.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className={`w-full px-3 py-2 border ${
                errors.language ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language}</p>
            )}
          </div>

          {/* Collection Selector */}
          <div>
            <label
              htmlFor="collection"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Collection (Optional)
            </label>
            <select
              id="collection"
              value={formData.collectionId || ""}
              onChange={(e) =>
                handleChange("collectionId", e.target.value || null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.path
                    ?.map((id) => collections.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(" / ") || collection.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Organize this snippet into a collection
            </p>
          </div>

          {/* Code Textarea */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Code <span className="text-red-500">*</span>
            </label>
            <textarea
              id="code"
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              onKeyDown={handleCodeKeyDown}
              rows={12}
              className={`w-full px-3 py-2 border ${
                errors.code ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm`}
              placeholder="Paste or type your code here..."
            />
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border ${
                errors.description ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Brief description of what this snippet does"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Tags
            </label>
            <TagInput
              tags={formData.tags}
              onChange={handleTagsChange}
              suggestions={tagSuggestions}
              error={errors.tags}
              maxTags={20}
            />
          </div>

          {/* Usage Notes */}
          <div>
            <label
              htmlFor="usageNotes"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Usage Notes
            </label>
            <textarea
              id="usageNotes"
              value={formData.metadata.usageNotes}
              onChange={(e) =>
                handleMetadataChange("usageNotes", e.target.value)
              }
              rows={3}
              className={`w-full px-3 py-2 border ${
                errors.usageNotes ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="How to use this snippet, examples, etc."
            />
            {errors.usageNotes && (
              <p className="mt-1 text-sm text-red-600">{errors.usageNotes}</p>
            )}
          </div>

          {/* Dependencies */}
          <div>
            <label
              htmlFor="dependencies"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Dependencies
            </label>
            <textarea
              id="dependencies"
              value={formData.metadata.dependencies}
              onChange={(e) =>
                handleMetadataChange("dependencies", e.target.value)
              }
              rows={2}
              className={`w-full px-3 py-2 border ${
                errors.dependencies ? "border-red-300" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              placeholder="Required libraries, packages, or dependencies"
            />
            {errors.dependencies && (
              <p className="mt-1 text-sm text-red-600">{errors.dependencies}</p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : mode === "create" ? (
                "Create Snippet"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetEditor;
