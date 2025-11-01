import { useState, useMemo } from "react";
import { SearchBar, FilterPanel, SearchResults } from "../components/search";
import { searchSnippets } from "../services/searchService";

/**
 * SearchDemo Component
 * Demonstrates the search and filter functionality
 */
const SearchDemo = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    languages: [],
    tags: [],
    dateRange: { start: null, end: null },
  });

  // Mock snippet data for demonstration
  const mockSnippets = useMemo(
    () => [
      {
        id: "1",
        title: "React useState Hook Example",
        description: "A simple example of using the useState hook in React",
        code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`,
        language: "javascript",
        tags: ["react", "hooks", "state"],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        title: "Python List Comprehension",
        description: "Create a list of squares using list comprehension",
        code: `# List comprehension example\nsquares = [x**2 for x in range(10)]\nprint(squares)  # [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]`,
        language: "python",
        tags: ["python", "list", "comprehension"],
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
      },
      {
        id: "3",
        title: "Async/Await API Call",
        description: "Fetch data from an API using async/await",
        code: `async function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}`,
        language: "javascript",
        tags: ["javascript", "async", "api", "fetch"],
        createdAt: new Date("2024-03-05"),
        updatedAt: new Date("2024-03-05"),
      },
      {
        id: "4",
        title: "CSS Flexbox Center",
        description: "Center content using flexbox",
        code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}`,
        language: "css",
        tags: ["css", "flexbox", "layout"],
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-20"),
      },
      {
        id: "5",
        title: "SQL Join Query",
        description: "Join two tables to get related data",
        code: `SELECT users.name, orders.total\nFROM users\nINNER JOIN orders ON users.id = orders.user_id\nWHERE orders.status = 'completed';`,
        language: "sql",
        tags: ["sql", "join", "database"],
        createdAt: new Date("2024-02-28"),
        updatedAt: new Date("2024-02-28"),
      },
      {
        id: "6",
        title: "React useEffect Hook",
        description: "Side effects in React components",
        code: `import { useEffect, useState } from 'react';\n\nfunction DataFetcher() {\n  const [data, setData] = useState(null);\n  \n  useEffect(() => {\n    fetch('/api/data')\n      .then(res => res.json())\n      .then(setData);\n  }, []);\n  \n  return <div>{data}</div>;\n}`,
        language: "javascript",
        tags: ["react", "hooks", "useEffect", "api"],
        createdAt: new Date("2024-03-10"),
        updatedAt: new Date("2024-03-10"),
      },
      {
        id: "7",
        title: "Python Dictionary Comprehension",
        description: "Create dictionaries using comprehension syntax",
        code: `# Dictionary comprehension\nsquares_dict = {x: x**2 for x in range(5)}\nprint(squares_dict)  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}`,
        language: "python",
        tags: ["python", "dictionary", "comprehension"],
        createdAt: new Date("2024-02-15"),
        updatedAt: new Date("2024-02-15"),
      },
      {
        id: "8",
        title: "JavaScript Array Methods",
        description: "Common array methods: map, filter, reduce",
        code: `const numbers = [1, 2, 3, 4, 5];\n\n// Map\nconst doubled = numbers.map(n => n * 2);\n\n// Filter\nconst evens = numbers.filter(n => n % 2 === 0);\n\n// Reduce\nconst sum = numbers.reduce((acc, n) => acc + n, 0);`,
        language: "javascript",
        tags: ["javascript", "array", "functional"],
        createdAt: new Date("2024-01-25"),
        updatedAt: new Date("2024-01-25"),
      },
    ],
    []
  );

  // Get available languages and tags from mock data
  const availableLanguages = useMemo(() => {
    const languages = new Set(mockSnippets.map((s) => s.language));
    return Array.from(languages).sort();
  }, [mockSnippets]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    mockSnippets.forEach((s) => s.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags).sort();
  }, [mockSnippets]);

  // Perform search and filtering
  const searchResults = useMemo(() => {
    return searchSnippets(mockSnippets, searchQuery, filters);
  }, [mockSnippets, searchQuery, filters]);

  const handleSnippetClick = (snippet) => {
    console.log("Snippet clicked:", snippet);
    alert(`Clicked: ${snippet.title}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Search & Filter Demo
          </h1>
          <p className="text-gray-600">
            Test the search and filter functionality with sample snippets
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search snippets by title, description, code, or tags..."
          />
        </div>

        {/* Layout with Filter Panel and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <FilterPanel
              onFilterChange={setFilters}
              availableLanguages={availableLanguages}
              availableTags={availableTags}
            />
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3">
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onSnippetClick={handleSnippetClick}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Features Demonstrated
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Debounced Search:</strong> Search input is debounced
                with 300ms delay for better performance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Multi-field Search:</strong> Searches across title,
                description, code content, and tags
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Result Highlighting:</strong> Matched text is
                highlighted in yellow for easy identification
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Multiple Filters:</strong> Filter by language, tags, and
                date range simultaneously
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Keyboard Shortcuts:</strong> Press Cmd/Ctrl + K to focus
                search, Escape to clear
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Result Caching:</strong> Search results are cached for 5
                minutes to improve performance
              </span>
            </li>
            <li className="flex items-start gap-2">
              <svg
                className="h-5 w-5 text-blue-600 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>No Results Message:</strong> Clear feedback when no
                snippets match the search criteria
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
