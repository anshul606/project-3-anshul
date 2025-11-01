import { useState } from "react";
import { CollectionProvider } from "../contexts/CollectionContext";
import { CollectionTree } from "../components/collections";
import useCollections from "../hooks/useCollections";
import Button from "../components/shared/Button";
import Toast from "../components/shared/Toast";

/**
 * CollectionDemo Component
 * Demo page for testing collection management functionality
 */
const CollectionDemoContent = () => {
  const {
    collections,
    loading,
    error,
    addCollection,
    updateCollection,
    deleteCollection,
    clearError,
  } = useCollections();

  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const handleCreateRootCollection = async () => {
    try {
      const newCollection = await addCollection({
        name: `Collection ${collections.length + 1}`,
        parentId: null,
      });
      showNotification(`Created collection: ${newCollection.name}`);
    } catch (error) {
      showNotification(error.message || "Failed to create collection", "error");
    }
  };

  const handleCreateCollection = async (collectionData) => {
    try {
      const newCollection = await addCollection(collectionData);
      showNotification(`Created collection: ${newCollection.name}`);
    } catch (error) {
      showNotification(error.message || "Failed to create collection", "error");
    }
  };

  const handleUpdateCollection = async (collectionId, updates) => {
    try {
      await updateCollection(collectionId, updates);
      showNotification("Collection updated successfully");
    } catch (error) {
      showNotification(error.message || "Failed to update collection", "error");
    }
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(collectionId, true); // Delete with subcollections
      showNotification("Collection deleted successfully");
      if (selectedCollectionId === collectionId) {
        setSelectedCollectionId(null);
      }
    } catch (error) {
      showNotification(error.message || "Failed to delete collection", "error");
    }
  };

  const handleMoveSnippet = async (snippetId, collectionId) => {
    // This would be implemented in the snippet service
    showNotification(
      `Snippet ${snippetId} moved to collection ${collectionId}`
    );
  };

  const selectedCollection = collections.find(
    (c) => c.id === selectedCollectionId
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Collection Management Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the collection tree with expandable/collapsible hierarchy and
            drag-and-drop functionality
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-red-800 dark:text-red-200">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collection Tree Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Collections
                </h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCreateRootCollection}
                  disabled={loading}
                >
                  + New
                </Button>
              </div>

              {loading && collections.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Loading collections...
                  </p>
                </div>
              ) : (
                <CollectionTree
                  collections={collections}
                  selectedId={selectedCollectionId}
                  onSelect={setSelectedCollectionId}
                  onCreateCollection={handleCreateCollection}
                  onUpdateCollection={handleUpdateCollection}
                  onDeleteCollection={handleDeleteCollection}
                  onMoveSnippet={handleMoveSnippet}
                />
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Collection Details
              </h2>

              {selectedCollection ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedCollection.name}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      ID
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {selectedCollection.id}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Parent ID
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {selectedCollection.parentId || "None (Root)"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Path
                    </label>
                    <p className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                      {selectedCollection.path.length > 0
                        ? selectedCollection.path.join(" > ")
                        : "Root level"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Depth Level
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCollection.path.length}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Team Collection
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCollection.isTeamCollection ? "Yes" : "No"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order
                    </label>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedCollection.order}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Select a collection to view details
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                How to Use
              </h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                <li>• Click "+ New" to create a root collection</li>
                <li>• Right-click on a collection to open the context menu</li>
                <li>
                  • Use "Create Subcollection" to add nested collections (up to
                  5 levels)
                </li>
                <li>• Use "Rename" to change a collection's name</li>
                <li>
                  • Use "Delete" to remove a collection (and its subcollections)
                </li>
                <li>• Click the arrow icon to expand/collapse collections</li>
                <li>• Drag and drop collections to reorganize them</li>
                <li>• Collections support up to 5 levels of nesting</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Total Collections
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {collections.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Root Collections
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {collections.filter((c) => !c.parentId).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Team Collections
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {collections.filter((c) => c.isTeamCollection).length}
            </p>
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

const CollectionDemo = () => {
  // Mock user ID for demo purposes
  const mockUserId = "demo-user-123";

  return (
    <CollectionProvider userId={mockUserId}>
      <CollectionDemoContent />
    </CollectionProvider>
  );
};

export default CollectionDemo;
