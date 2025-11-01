import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnippets } from "../hooks/useSnippets";
import SnippetDetail from "../components/snippets/SnippetDetail";
import useKeyboard from "../hooks/useKeyboard";
import useClipboard from "../hooks/useClipboard";

/**
 * Snippet Detail Page - displays full snippet information
 */
const SnippetDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snippets, deleteSnippet, shareSnippet } = useSnippets();
  const { copyToClipboard } = useClipboard();

  const snippet = snippets.find((s) => s.id === id);

  // Keyboard shortcut for copying current snippet - memoize to prevent infinite loops
  const keyboardShortcuts = useMemo(
    () => ({
      "ctrl+c": () => {
        if (snippet?.code) {
          copyToClipboard(snippet.code);
        }
      },
    }),
    [snippet?.code, copyToClipboard]
  );

  useKeyboard(keyboardShortcuts);

  const handleEdit = () => {
    navigate(`/snippets/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this snippet?")) {
      try {
        await deleteSnippet(id);
        navigate("/");
      } catch (error) {
        console.error("Error deleting snippet:", error);
      }
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  const handleShare = async (snippetId, userIds) => {
    try {
      await shareSnippet(snippetId, userIds, "view");
    } catch (error) {
      console.error("Error sharing snippet:", error);
      throw error;
    }
  };

  if (!snippet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Snippet not found</p>
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to snippets
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleBack}
        className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
      >
        ← Back to snippets
      </button>
      <SnippetDetail
        snippet={snippet}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onShare={handleShare}
      />
    </div>
  );
};

export default SnippetDetailPage;
