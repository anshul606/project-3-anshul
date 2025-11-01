import { useState } from "react";
import { useSnippets } from "../hooks/useSnippets";
import { SnippetList } from "../components/snippets";
import useClipboard from "../hooks/useClipboard";
import Toast from "../components/shared/Toast";

/**
 * SnippetListDemo Page
 * Demonstrates the SnippetList component with grid and list view modes
 * Includes copy, edit, and delete functionality
 */
const SnippetListDemo = () => {
  const { snippets, loading, deleteSnippet } = useSnippets();
  const [viewMode, setViewMode] = useState("grid");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const { copyToClipboard, error: clipboardError } = useClipboard();

  // Handle copy action
  const handleCopy = async (snippet) => {
    const success = await copyToClipboard(snippet.code);
    if (success) {
      showToastMessage("Code copied to clipboard!", "success");
    } else {
      showToastMessage(clipboardError || "Failed to copy code", "error");
    }
  };

  // Handle edit action
  const handleEdit = (snippet) => {
    // Navigate to edit page or open edit modal
    console.log("Edit snippet:", snippet.id);
    showToastMessage(`Editing: ${snippet.title}`);
    // In a real app, you would navigate to edit page:
    // navigate(`/snippet/${snippet.id}/edit`);
  };

  // Handle delete action
  const handleDelete = async (snippetId) => {
    try {
      await deleteSnippet(snippetId);
      showToastMessage("Snippet deleted successfully");
    } catch (error) {
      console.error("Failed to delete:", error);
      showToastMessage("Failed to delete snippet", "error");
    }
  };

  // Show toast notification
  const showToastMessage = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Snippets</h1>
              <p className="text-sm text-gray-600 mt-1">
                {snippets.length} snippet{snippets.length !== 1 ? "s" : ""} in
                your collection
              </p>
            </div>

            {/* View mode toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="Grid view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                title="List view"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SnippetList
          snippets={snippets}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
          viewMode={viewMode}
          emptyMessage="No snippets found. Create your first snippet to get started!"
        />
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
};

export default SnippetListDemo;
