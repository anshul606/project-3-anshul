import { useState, useEffect, useCallback } from "react";
import CollectionItem from "./CollectionItem";
import Modal from "../shared/Modal";
import Button from "../shared/Button";

/**
 * CollectionTree Component
 * Displays collections in a hierarchical tree structure with expand/collapse
 */
const CollectionTree = ({
  collections = [],
  selectedId = null,
  onSelect,
  onCreateCollection,
  onUpdateCollection,
  onDeleteCollection,
  onMoveSnippet,
}) => {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentCollection, setCurrentCollection] = useState(null);
  const [newName, setNewName] = useState("");
  const [parentIdForNew, setParentIdForNew] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Build hierarchy from flat collection list
  const buildHierarchy = useCallback((collections) => {
    const collectionMap = new Map();
    const rootCollections = [];

    // Create map of all collections
    collections.forEach((collection) => {
      collectionMap.set(collection.id, { ...collection, children: [] });
    });

    // Build parent-child relationships
    collections.forEach((collection) => {
      const collectionNode = collectionMap.get(collection.id);
      if (collection.parentId && collectionMap.has(collection.parentId)) {
        const parent = collectionMap.get(collection.parentId);
        parent.children.push(collectionNode);
      } else {
        rootCollections.push(collectionNode);
      }
    });

    return rootCollections;
  }, []);

  const hierarchy = buildHierarchy(collections);

  // Toggle expand/collapse
  const handleToggleExpand = (collectionId) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // Expand all parent collections when a collection is selected
  useEffect(() => {
    if (selectedId) {
      const collection = collections.find((c) => c.id === selectedId);
      if (collection && collection.path) {
        setExpandedIds((prev) => {
          const newSet = new Set(prev);
          collection.path.forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    }
  }, [selectedId, collections]);

  // Handle rename
  const handleRename = (collectionId, currentName) => {
    const collection = collections.find((c) => c.id === collectionId);
    setCurrentCollection(collection);
    setNewName(currentName);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async () => {
    if (currentCollection && newName.trim()) {
      try {
        await onUpdateCollection(currentCollection.id, {
          name: newName.trim(),
        });
        setShowRenameModal(false);
        setCurrentCollection(null);
        setNewName("");
      } catch (error) {
        console.error("Error renaming collection:", error);
        alert(error.message || "Failed to rename collection");
      }
    }
  };

  // Handle delete
  const handleDelete = (collectionId) => {
    const collection = collections.find((c) => c.id === collectionId);
    setCurrentCollection(collection);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (currentCollection) {
      try {
        // Delete with subcollections option enabled
        await onDeleteCollection(currentCollection.id, true);
        setShowDeleteModal(false);
        setCurrentCollection(null);
      } catch (error) {
        console.error("Error deleting collection:", error);
        alert(error.message || "Failed to delete collection");
      }
    }
  };

  // Handle create subcollection
  const handleCreateSubcollection = (parentId) => {
    setParentIdForNew(parentId);
    setNewName("");
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async () => {
    if (newName.trim()) {
      try {
        await onCreateCollection({
          name: newName.trim(),
          parentId: parentIdForNew,
        });
        setShowCreateModal(false);
        setNewName("");
        setParentIdForNew(null);

        // Expand parent to show new subcollection
        if (parentIdForNew) {
          setExpandedIds((prev) => new Set(prev).add(parentIdForNew));
        }
      } catch (error) {
        console.error("Error creating collection:", error);
        alert(error.message || "Failed to create collection");
      }
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, collection) => {
    setDraggedItem(collection);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, collection) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, targetCollection) => {
    e.preventDefault();

    if (!draggedItem) return;

    // Check if dropping a snippet (from outside)
    const snippetId = e.dataTransfer.getData("snippetId");
    if (snippetId && onMoveSnippet) {
      try {
        await onMoveSnippet(snippetId, targetCollection.id);
      } catch (error) {
        console.error("Error moving snippet:", error);
        alert(error.message || "Failed to move snippet");
      }
      setDraggedItem(null);
      return;
    }

    // Moving a collection
    if (draggedItem.id === targetCollection.id) {
      setDraggedItem(null);
      return;
    }

    // Check if trying to move to its own descendant
    if (targetCollection.path.includes(draggedItem.id)) {
      alert("Cannot move collection to its own descendant");
      setDraggedItem(null);
      return;
    }

    // Check depth limit
    if (targetCollection.path.length >= 4) {
      alert("Cannot move collection: would exceed maximum depth of 5 levels");
      setDraggedItem(null);
      return;
    }

    try {
      await onUpdateCollection(draggedItem.id, {
        parentId: targetCollection.id,
      });

      // Expand target to show moved collection
      setExpandedIds((prev) => new Set(prev).add(targetCollection.id));
    } catch (error) {
      console.error("Error moving collection:", error);
      alert(error.message || "Failed to move collection");
    }

    setDraggedItem(null);
  };

  // Render collection tree recursively
  const renderCollectionNode = (node, level = 0) => {
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} className="group">
        <CollectionItem
          collection={node}
          isSelected={selectedId === node.id}
          isExpanded={isExpanded}
          level={level}
          hasChildren={hasChildren}
          onSelect={onSelect}
          onToggleExpand={handleToggleExpand}
          onRename={handleRename}
          onDelete={handleDelete}
          onCreateSubcollection={handleCreateSubcollection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child) =>
              renderCollectionNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="collection-tree">
      {/* Root Collections */}
      {hierarchy.length > 0 ? (
        <div>{hierarchy.map((node) => renderCollectionNode(node))}</div>
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          No collections yet. Create your first collection to organize snippets.
        </div>
      )}

      {/* Rename Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setCurrentCollection(null);
          setNewName("");
        }}
        title="Rename Collection"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="collection-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collection Name
            </label>
            <input
              id="collection-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter collection name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRenameModal(false);
                setCurrentCollection(null);
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRenameSubmit}
              disabled={!newName.trim()}
            >
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentCollection(null);
        }}
        title="Delete Collection"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete "{currentCollection?.name}"?
            {currentCollection &&
              collections.some((c) => c.parentId === currentCollection.id) && (
                <span className="block mt-2 text-red-600">
                  This collection has subcollections. All subcollections will
                  also be deleted.
                </span>
              )}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setCurrentCollection(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Subcollection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewName("");
          setParentIdForNew(null);
        }}
        title="Create Subcollection"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="new-collection-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Collection Name
            </label>
            <input
              id="new-collection-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateSubmit()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter collection name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewName("");
                setParentIdForNew(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              disabled={!newName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CollectionTree;
