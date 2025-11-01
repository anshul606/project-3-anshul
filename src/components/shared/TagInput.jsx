import { useState, useEffect, useRef } from "react";
import { validateTag } from "../../services/tagService";

/**
 * TagInput Component
 * A reusable tag input component with autocomplete suggestions
 *
 * @param {Object} props
 * @param {Array} props.tags - Current tags
 * @param {Function} props.onChange - Callback when tags change
 * @param {Array} props.suggestions - Available tag suggestions
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.error - Error message to display
 * @param {number} props.maxTags - Maximum number of tags allowed
 * @param {Function} props.onInputChange - Callback when input value changes (for fetching suggestions)
 */
const TagInput = ({
  tags = [],
  onChange,
  suggestions = [],
  placeholder = "Type and press Enter to add tags",
  error = null,
  maxTags = 20,
  onInputChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [validationError, setValidationError] = useState(null);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !tags.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedSuggestionIndex(-1);
  }, [inputValue, suggestions, tags]);

  // Notify parent of input changes for dynamic suggestion fetching
  useEffect(() => {
    if (onInputChange) {
      onInputChange(inputValue);
    }
  }, [inputValue, onInputChange]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setValidationError(null);
  };

  // Add a tag
  const addTag = (tagName) => {
    if (!tagName || !tagName.trim()) {
      return;
    }

    // Check max tags limit
    if (tags.length >= maxTags) {
      setValidationError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Validate tag format
    const validation = validateTag(tagName);
    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    const normalizedTag = validation.tag;

    // Check if tag already exists
    if (tags.includes(normalizedTag)) {
      setInputValue("");
      setValidationError(null);
      return;
    }

    // Add tag
    onChange([...tags, normalizedTag]);
    setInputValue("");
    setValidationError(null);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Focus back on input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0 && filteredSuggestions.length > 0) {
        // Select highlighted suggestion
        addTag(filteredSuggestions[selectedSuggestionIndex]);
      } else {
        // Add current input as tag
        addTag(inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      // Remove last tag if backspace is pressed with empty input
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  // Handle input focus
  const handleFocus = () => {
    if (inputValue && filteredSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 200);
  };

  // Get tag color based on hash of tag name
  const getTagColor = (tag) => {
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-red-100 text-red-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-cyan-100 text-cyan-800",
    ];

    // Simple hash function to get consistent color for each tag
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full">
      <div
        className={`w-full px-3 py-2 border ${
          error || validationError
            ? "border-red-300 dark:border-red-600"
            : "border-gray-300 dark:border-gray-600"
        } rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white dark:bg-gray-700`}
      >
        {/* Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${getTagColor(
                  tag
                )}`}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:opacity-70 focus:outline-none"
                  aria-label={`Remove ${tag} tag`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Input Field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className="w-full focus:outline-none text-sm text-gray-900 dark:text-gray-100"
            placeholder={tags.length === 0 ? placeholder : ""}
            disabled={tags.length >= maxTags}
          />

          {/* Autocomplete Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    index === selectedSuggestionIndex
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTagColor(
                      suggestion
                    )}`}
                  >
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {(error || validationError) && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error || validationError}
        </p>
      )}

      {/* Helper Text */}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Press Enter or comma to add a tag. Tags can only contain letters,
        numbers, and hyphens. {tags.length}/{maxTags} tags
      </p>
    </div>
  );
};

export default TagInput;
