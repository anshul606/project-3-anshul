import { useNavigate, useParams } from "react-router-dom";
import { SnippetEditor } from "../components/snippets";
import { useSnippets } from "../hooks/useSnippets";

/**
 * EditSnippet page component
 * Provides a page for editing existing code snippets
 */
const EditSnippet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { snippets, updateSnippet } = useSnippets();

  const snippet = snippets.find((s) => s.id === id);

  const handleSave = async (snippetData) => {
    try {
      await updateSnippet(id, snippetData);
      // Navigate to snippet detail after successful update
      navigate(`/snippets/${id}`);
    } catch (error) {
      console.error("Error updating snippet:", error);
      throw error; // Re-throw to let SnippetEditor handle the error display
    }
  };

  const handleCancel = () => {
    navigate(`/snippets/${id}`);
  };

  if (!snippet) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Snippet not found</p>
        <button
          onClick={() => navigate("/")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to snippets
        </button>
      </div>
    );
  }

  return (
    <SnippetEditor
      mode="edit"
      snippet={snippet}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EditSnippet;
