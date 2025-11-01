import { useState, useEffect } from "react";
import { useSnippets } from "../hooks/useSnippets";
import { useNavigate } from "react-router-dom";
import SnippetList from "../components/snippets/SnippetList";
import Toast from "../components/shared/Toast";

/**
 * Tags page - displays all tags and snippets by tag
 */
const Tags = () => {
  const { snippets, deleteSnippet } = useSnippets();
  const navigate = useNavigate();
  const [tagCounts, setTagCounts] = useState({});
  const [selectedTag, setSelectedTag] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Calculate tag counts
    const counts = {};
    snippets.forEach((snippet) => {
      if (snippet.tags && Array.isArray(snippet.tags)) {
        snippet.tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    setTagCounts(counts);
  }, [snippets]);

  const tags = Object.keys(tagCounts).sort();
  const filteredSnippets = selectedTag
    ? snippets.filter(
        (snippet) => snippet.tags && snippet.tags.includes(selectedTag)
      )
    : [];

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
        Tags
      </h1>

      {tags.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            No tags found. Add tags to your snippets to organize them.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tag list */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                All Tags ({tags.length})
              </h2>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedTag === tag
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="flex justify-between items-center">
                      <span>{tag}</span>
                      <span className="text-xs text-gray-500">
                        {tagCounts[tag]}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Snippets with selected tag */}
          <div className="lg:col-span-3">
            {selectedTag ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Snippets tagged with "{selectedTag}" (
                  {filteredSnippets.length})
                </h2>
                <SnippetList
                  snippets={filteredSnippets}
                  onCopy={handleCopy}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  viewMode="grid"
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Select a tag to view snippets
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default Tags;
