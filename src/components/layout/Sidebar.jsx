import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  CollectionProvider,
  CollectionContext,
} from "../../contexts/CollectionContext";
import { useContext } from "react";
import CollectionTree from "../collections/CollectionTree";
import {
  FiPlus,
  FiHome,
  FiSearch,
  FiTag,
  FiShare2,
  FiDownload,
  FiX,
} from "react-icons/fi";

/**
 * Sidebar content component (separated for context usage)
 */
const SidebarContent = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const collections = useContext(CollectionContext);
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      await collections.addCollection({
        name: newCollectionName,
        parentId: null,
      });
      setNewCollectionName("");
      setShowNewCollectionModal(false);
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const navItems = [
    { path: "/", icon: FiHome, label: "All Snippets" },
    { path: "/search", icon: FiSearch, label: "Search" },
    { path: "/tags", icon: FiTag, label: "Tags" },
    { path: "/shared", icon: FiShare2, label: "Shared" },
    { path: "/import-export", icon: FiDownload, label: "Import/Export" },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Close button for mobile */}
      <div className="lg:hidden flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close sidebar"
        >
          <FiX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* New Snippet Button */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <Link
          to="/snippets/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          New Snippet
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="px-2 py-4 border-b border-gray-200 dark:border-gray-700">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-md mb-1 transition-colors ${
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Collections Section */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <div className="flex items-center justify-between px-3 mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Collections
          </h3>
          <button
            onClick={() => setShowNewCollectionModal(true)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="New collection"
          >
            <FiPlus className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {collections.loading ? (
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            Loading collections...
          </div>
        ) : collections.collections.length === 0 ? (
          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
            No collections yet
          </div>
        ) : (
          <CollectionTree
            collections={collections.collections}
            onSelect={(collectionId) => {
              navigate(`/collections/${collectionId}`);
              onClose();
            }}
            onCreateCollection={collections.addCollection}
            onUpdateCollection={collections.updateCollection}
            onDeleteCollection={collections.deleteCollection}
          />
        )}
      </div>

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              New Collection
            </h3>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleCreateCollection();
                }
              }}
              placeholder="Collection name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowNewCollectionModal(false);
                  setNewCollectionName("");
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={!newCollectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Sidebar component with collection tree and navigation
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open (mobile)
 * @param {Function} props.onClose - Callback to close sidebar
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          border-r border-gray-200 dark:border-gray-700
        `}
      >
        <CollectionProvider userId={user?.uid}>
          <SidebarContent onClose={onClose} />
        </CollectionProvider>
      </aside>
    </>
  );
};

export default Sidebar;
