import { useState, useRef, useEffect } from "react";
import {
  FaFolder,
  FaFolderOpen,
  FaEllipsisV,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";

/**
 * CollectionItem Component
 * Displays an individual collection with expand/collapse and context menu
 */
const CollectionItem = ({
  collection,
  isSelected = false,
  isExpanded = false,
  level = 0,
  onSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onCreateSubcollection,
  onDragStart,
  onDragOver,
  onDrop,
  hasChildren = false,
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const contextMenuRef = useRef(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setShowContextMenu(false);
      }
    };

    if (showContextMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showContextMenu]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleMenuAction = (action) => {
    setShowContextMenu(false);
    action();
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(collection.id);
    }
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (onToggleExpand) {
      onToggleExpand(collection.id);
    }
  };

  const handleDragStart = (e) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(e, collection);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDragOver) {
      onDragOver(e, collection);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDrop) {
      onDrop(e, collection);
    }
  };

  const indentStyle = {
    paddingLeft: `${level * 20 + 12}px`,
  };

  return (
    <>
      <div
        className={`
          flex items-center gap-2 py-2 px-3 cursor-pointer
          hover:bg-gray-100 dark:hover:bg-gray-700
          transition-colors duration-150
          ${
            isSelected
              ? "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500"
              : ""
          }
        `}
        style={indentStyle}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={handleToggle}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <FaChevronDown className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <FaChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}

        {/* Spacer for items without children */}
        {!hasChildren && <div className="w-5" />}

        {/* Folder Icon */}
        {isExpanded ? (
          <FaFolderOpen className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
        ) : (
          <FaFolder className="w-4 h-4 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
        )}

        {/* Collection Name */}
        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
          {collection.name}
        </span>

        {/* Team Collection Badge */}
        {collection.isTeamCollection && (
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded">
            Team
          </span>
        )}

        {/* Context Menu Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleContextMenu(e);
          }}
          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="More options"
        >
          <FaEllipsisV className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 min-w-[180px]"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
          }}
        >
          {level < 4 && (
            <button
              onClick={() =>
                handleMenuAction(() => onCreateSubcollection(collection.id))
              }
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Create Subcollection
            </button>
          )}
          <button
            onClick={() =>
              handleMenuAction(() => onRename(collection.id, collection.name))
            }
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Rename
          </button>
          <button
            onClick={() => handleMenuAction(() => onDelete(collection.id))}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </>
  );
};

export default CollectionItem;
