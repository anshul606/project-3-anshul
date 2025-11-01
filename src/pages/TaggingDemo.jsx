import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSnippets } from "../hooks/useSnippets";
import SnippetEditor from "../components/snippets/SnippetEditor";
import SnippetCard from "../components/snippets/SnippetCard";
import { Toast } from "../components/shared";
import { getUserTags } from "../services/tagService";

/**
 * TaggingDemo Page
 * Demonstrates the tagging system functionality
 */
const TaggingDemo = () => {
  const { currentUser } = useAuth();
  const { addSnippet, snippets, loading } = useSnippets();
  const [showEditor, setShowEditor] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [userTags, setUserTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // Load user tags
  useEffect(() => {
    const loadUserTags = async () => {
      if (currentUser?.uid) {
        try {
          const tags = await getUserTags(currentUser.uid, {
            sortBy: "usageCount",
            sortDirection: "desc",
          });
          setUserTags(tags);
        } catch (error) {
          console.error("Error loading user tags:", error);
        }
      }
    };

    loadUserTags();
  }, [currentUser, snippets]);

  const handleSaveSnippet = async (snippetData) => {
    try {
      await addSnippet(snippetData);
      setShowEditor(false);
      setToastMessage("Snippet created successfully with tags!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error creating snippet:", error);
      setToastMessage("Failed to create snippet");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleCopy = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setToastMessage("Code copied to clipboard!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      setToastMessage("Failed to copy code");
      setToastType("error");
      setShowToast(true);
    }
  };

  // Filter snippets by selected tag
  const filteredSnippets = selectedTag
    ? snippets.filter((snippet) => snippet.tags.includes(selectedTag))
    : snippets;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tagging System Demo
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Create snippets with tags, view tag statistics, and filter by
                tags
              </p>
            </div>
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showEditor ? "Cancel" : "Create Snippet"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Tag Statistics */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Your Tags
              </h2>

              {userTags.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tags yet. Create a snippet with tags to get started!
                </p>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTag === null
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    All Snippets ({snippets.length})
                  </button>

                  {userTags.map((tag) => {
                    // Generate consistent color for each tag
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
                    let hash = 0;
                    for (let i = 0; i < tag.name.length; i++) {
                      hash = tag.name.charCodeAt(i) + ((hash << 5) - hash);
                    }
                    const colorClass = colors[Math.abs(hash) % colors.length];

                    const snippetCount = snippets.filter((s) =>
                      s.tags.includes(tag.name)
                    ).length;

                    return (
                      <button
                        key={tag.id}
                        onClick={() => setSelectedTag(tag.name)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedTag === tag.name
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
                          >
                            {tag.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {snippetCount}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Used {tag.usageCount} times
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tag Statistics */}
            {userTags.length > 0 && (
              <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Statistics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tags:</span>
                    <span className="font-medium text-gray-900">
                      {userTags.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Snippets:</span>
                    <span className="font-medium text-gray-900">
                      {snippets.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Tags/Snippet:</span>
                    <span className="font-medium text-gray-900">
                      {snippets.length > 0
                        ? (
                            snippets.reduce(
                              (sum, s) => sum + s.tags.length,
                              0
                            ) / snippets.length
                          ).toFixed(1)
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showEditor ? (
              <SnippetEditor
                mode="create"
                onSave={handleSaveSnippet}
                onCancel={() => setShowEditor(false)}
              />
            ) : (
              <div>
                {/* Filter Info */}
                {selectedTag && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-800">
                          Filtering by tag:
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800">
                          {selectedTag}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTag(null)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Clear filter
                      </button>
                    </div>
                  </div>
                )}

                {/* Snippets Grid */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredSnippets.length === 0 ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {selectedTag
                        ? `No snippets with tag "${selectedTag}"`
                        : "No snippets yet"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedTag
                        ? "Try selecting a different tag or create a new snippet."
                        : "Get started by creating your first snippet with tags."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSnippets.map((snippet) => (
                      <SnippetCard
                        key={snippet.id}
                        snippet={snippet}
                        onCopy={handleCopy}
                        viewMode="grid"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default TaggingDemo;
