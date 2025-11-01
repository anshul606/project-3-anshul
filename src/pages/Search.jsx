import { useState, useEffect } from "react";
import { useSnippets } from "../hooks/useSnippets";
import { useSearchParams, useNavigate } from "react-router-dom";
import SearchBar from "../components/search/SearchBar";
import FilterPanel from "../components/search/FilterPanel";
import SearchResults from "../components/search/SearchResults";
import { searchSnippets } from "../services/searchService";
import Toast from "../components/shared/Toast";

/**
 * Search page with filters
 */
const Search = () => {
  const { snippets, deleteSnippet } = useSnippets();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    languages: [],
    tags: [],
    collections: [],
    dateRange: { start: null, end: null },
  });
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [toast, setToast] = useState(null);

  // Perform search when URL query parameter changes
  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
      const results = searchSnippets(snippets, query, filters);
      setSearchResults(results);
      setHasSearched(true);
    }
  }, [searchParams, snippets, filters]);

  const handleSearch = (query, newFilters) => {
    setSearchQuery(query);
    if (newFilters) {
      setFilters(newFilters);
    }

    const results = searchSnippets(snippets, query, newFilters || filters);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (searchQuery || hasSearched) {
      const results = searchSnippets(snippets, searchQuery, newFilters);
      setSearchResults(results);
    }
  };

  const handleCopy = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setToast({
        message: "Code copied to clipboard!",
        type: "success",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({
        message: "Failed to copy code",
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleEdit = (snippet) => {
    navigate(`/snippets/${snippet.id}/edit`);
  };

  const handleDelete = async (snippetId) => {
    if (!window.confirm("Are you sure you want to delete this snippet?")) {
      return;
    }

    try {
      await deleteSnippet(snippetId);
      setToast({
        message: "Snippet deleted successfully",
        type: "success",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (error) {
      setToast({
        message: "Failed to delete snippet",
        type: "error",
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Search Snippets
      </h1>

      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search by title, description, code, or tags..."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        </div>

        <div className="lg:col-span-3">
          {hasSearched ? (
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onCopy={handleCopy}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Enter a search query to find snippets
              </p>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Search;
