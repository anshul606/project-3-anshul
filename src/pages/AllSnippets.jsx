import { useState } from "react";
import { useSnippets } from "../hooks/useSnippets";
import SnippetList from "../components/snippets/SnippetList";
import { useNavigate } from "react-router-dom";
import Toast from "../components/shared/Toast";

/**
 * All Snippets page - displays all user snippets
 */
const AllSnippets = () => {
  const { snippets, loading, deleteSnippet } = useSnippets();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Snippets</h1>
        <p className="text-sm text-gray-600">
          {snippets.length} {snippets.length === 1 ? "snippet" : "snippets"}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading snippets...</p>
        </div>
      ) : snippets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            You haven't created any snippets yet.
          </p>
          <button
            onClick={() => navigate("/snippets/new")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create your first snippet →
          </button>
        </div>
      ) : (
        <SnippetList
          snippets={snippets}
          onCopy={handleCopy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          viewMode="grid"
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default AllSnippets;
