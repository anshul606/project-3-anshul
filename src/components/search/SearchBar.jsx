import { useState, useEffect, useRef, useCallback } from "react";

/**
 * SearchBar Component
 * Provides search input with debounced search and keyboard shortcut support
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback when search query changes (debounced)
 * @param {string} props.placeholder - Placeholder text for search input
 * @param {number} props.debounceDelay - Debounce delay in milliseconds (default: 300)
 * @param {string} props.initialValue - Initial search value
 */
const SearchBar = ({
  onSearch,
  placeholder = "Search snippets by title, description, code, or tags...",
  debounceDelay = 300,
  initialValue = "",
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced search handler
  const debouncedSearch = useCallback(
    (value) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onSearch(value);
      }, debounceDelay);
    },
    [onSearch, debounceDelay]
  );

  // Handle input change
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  // Handle clear button
  const handleClear = () => {
    setSearchValue("");
    onSearch("");
    inputRef.current?.focus();
  };

  // Keyboard shortcut handler (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Clear on Escape when focused
      if (e.key === "Escape" && isFocused) {
        handleClear();
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        value={searchValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`
          w-full pl-10 pr-20 py-2.5 
          border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${
            isFocused
              ? "border-blue-500 bg-white shadow-md"
              : "border-gray-300 bg-white"
          }
        `}
        aria-label="Search snippets"
      />

      {/* Right side controls */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-2">
        {/* Clear button (shown when there's text) */}
        {searchValue && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
            type="button"
          >
            <svg
              className="h-5 w-5"
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
        )}

        {/* Keyboard shortcut hint */}
        {!isFocused && !searchValue && (
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </div>

      {/* Search hint (shown when focused and empty) */}
      {isFocused && !searchValue && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Search across titles, descriptions, code content, and tags
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-xs text-gray-500">Try:</span>
            <button
              onClick={() => {
                setSearchValue("react");
                debouncedSearch("react");
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              type="button"
            >
              react
            </button>
            <button
              onClick={() => {
                setSearchValue("function");
                debouncedSearch("function");
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              type="button"
            >
              function
            </button>
            <button
              onClick={() => {
                setSearchValue("api");
                debouncedSearch("api");
              }}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              type="button"
            >
              api
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
