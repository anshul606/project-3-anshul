import SnippetList from "../snippets/SnippetList";

/**
 * SearchResults Component
 * Displays search results using SnippetList component
 *
 * @param {Object} props
 * @param {Array} props.results - Array of search result snippets
 * @param {string} props.query - Search query for highlighting
 * @param {boolean} props.loading - Whether search is in progress
 * @param {Function} props.onCopy - Callback when copy button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {string} props.emptyMessage - Custom message for no results
 */
const SearchResults = ({
  results = [],
  query = "",
  loading = false,
  onCopy,
  onEdit,
  onDelete,
  emptyMessage = "No snippets found matching your search criteria",
}) => {
  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Searching snippets...</p>
      </div>
    );
  }

  // Show no results message
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Results Found
        </h3>
        <p className="text-gray-500 text-center max-w-md">{emptyMessage}</p>
        {query && (
          <div className="mt-4 text-sm text-gray-600">
            <p>Try:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Using different keywords</li>
              <li>Checking your spelling</li>
              <li>Using more general terms</li>
              <li>Removing some filters</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Show results
  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <p className="text-sm text-gray-600">
          Found {results.length} {results.length === 1 ? "snippet" : "snippets"}
          {query && (
            <span>
              {" "}
              matching <span className="font-semibold">"{query}"</span>
            </span>
          )}
        </p>
      </div>

      {/* Results list using SnippetList */}
      <SnippetList
        snippets={results}
        onCopy={onCopy}
        onEdit={onEdit}
        onDelete={onDelete}
        viewMode="grid"
      />
    </div>
  );
};

export default SearchResults;
