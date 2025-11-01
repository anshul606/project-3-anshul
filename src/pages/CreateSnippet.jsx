import { useNavigate } from "react-router-dom";
import { SnippetEditor } from "../components/snippets";
import { useSnippets } from "../hooks/useSnippets";

/**
 * CreateSnippet page component
 * Provides a page for creating new code snippets
 */
const CreateSnippet = () => {
  const navigate = useNavigate();
  const { addSnippet } = useSnippets();

  const handleSave = async (snippetData) => {
    try {
      await addSnippet(snippetData);
      // Navigate to home or snippet list after successful creation
      navigate("/");
    } catch (error) {
      console.error("Error creating snippet:", error);
      throw error; // Re-throw to let SnippetEditor handle the error display
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <SnippetEditor mode="create" onSave={handleSave} onCancel={handleCancel} />
  );
};

export default CreateSnippet;
