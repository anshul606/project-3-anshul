import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiShare2 } from "react-icons/fi";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { COLLECTIONS } from "../services/firestoreService";
import SnippetList from "../components/snippets/SnippetList";
import Toast from "../components/shared/Toast";

/**
 * Shared snippets page - displays snippets shared with the user
 */
const Shared = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [sharedSnippets, setSharedSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch snippets shared with the current user
  useEffect(() => {
    const fetchSharedSnippets = async () => {
      if (!user?.email) {
        setSharedSnippets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const snippetsRef = collection(db, COLLECTIONS.SNIPPETS);

        // Query for snippets where sharing.isShared is true
        const q = query(snippetsRef, where("sharing.isShared", "==", true));

        const querySnapshot = await getDocs(q);
        const snippets = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Check if current user's email is in the sharedWith array
          const isSharedWithMe = data.sharing?.sharedWith?.some(
            (share) => share.email === user.email
          );

          if (isSharedWithMe && data.userId !== user.uid) {
            snippets.push({
              id: doc.id,
              ...data,
            });
          }
        });

        setSharedSnippets(snippets);
      } catch (error) {
        console.error("Error fetching shared snippets:", error);
        setToast({
          message: "Failed to load shared snippets",
          type: "error",
        });
        setTimeout(() => setToast(null), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedSnippets();
  }, [user]);

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
    setToast({
      message: "You cannot delete snippets shared with you",
      type: "error",
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FiShare2 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Shared With Me</h1>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shared snippets...</p>
        </div>
      ) : sharedSnippets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FiShare2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No shared snippets yet</p>
          <p className="text-sm text-gray-500">
            Snippets that others share with you will appear here
          </p>
        </div>
      ) : (
        <SnippetList
          snippets={sharedSnippets}
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

export default Shared;
