import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnippets } from "../hooks/useSnippets";
import useCollections from "../hooks/useCollections";
import SnippetList from "../components/snippets/SnippetList";
import Toast from "../components/shared/Toast";

/**
 * Collections page - displays snippets in a specific collection
 */
const Collections = () => {
  const { collectionId } = useParams();
  const { snippets, loading, deleteSnippet } = useSnippets();
  const { collections } = useCollections();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  // Find the current collection
  const collection = collections.find((c) => c.id === collectionId);

  // Filter snippets by collection
  const collectionSnippets = snippets.filter(
    (snippet) => snippet.collectionId === collectionId
  );

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

  if (!collection && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Collection not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to all snippets
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            ← Back to all snippets
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {collection?.name || "Collection"}
          </h1>
        </div>
        <p className="text-sm text-gray-600">
          {collectionSnippets.length}{" "}
          {collectionSnippets.length === 1 ? "snippet" : "snippets"}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading snippets...</p>
        </div>
      ) : collectionSnippets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 mb-4">
            No snippets in this collection yet.
          </p>
          <button
            onClick={() => navigate("/snippets/new")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Create a snippet →
          </button>
        </div>
      ) : (
        <SnippetList
          snippets={collectionSnippets}
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

export default Collections;
