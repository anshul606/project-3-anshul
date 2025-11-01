import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * SnippetCard Component
 * Displays a snippet in card format with title, language, tags, and code preview
 * Includes quick action buttons for copy, edit, and delete
 *
 * @param {Object} props
 * @param {Object} props.snippet - The snippet object to display
 * @param {Function} props.onCopy - Callback when copy button is clicked
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @param {Function} props.onDelete - Callback when delete button is clicked
 * @param {string} props.viewMode - Display mode: 'grid' or 'list'
 */
const SnippetCard = ({
  snippet,
  onCopy,
  onEdit,
  onDelete,
  viewMode = "grid",
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Generate code preview (first 3 lines)
  const getCodePreview = () => {
    if (!snippet.code) return "No code available";
    const lines = snippet.code.split("\n").slice(0, 3);
    return lines.join("\n");
  };

  // Handle copy action
  const handleCopy = async (e) => {
    e.stopPropagation();
    if (onCopy) {
      await onCopy(snippet);
    }
  };

  // Handle edit action
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(snippet);
    }
  };

  // Handle delete action with confirmation
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(snippet.id);
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle card click to view details
  const handleCardClick = () => {
    navigate(`/snippets/${snippet.id}`);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "";
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get language badge color
  const getLanguageBadgeColor = (language) => {
    const colors = {
      javascript: "bg-yellow-100 text-yellow-800",
      typescript: "bg-blue-100 text-blue-800",
      python: "bg-green-100 text-green-800",
      java: "bg-red-100 text-red-800",
      cpp: "bg-purple-100 text-purple-800",
      go: "bg-cyan-100 text-cyan-800",
      rust: "bg-orange-100 text-orange-800",
      html: "bg-pink-100 text-pink-800",
      css: "bg-indigo-100 text-indigo-800",
      sql: "bg-gray-100 text-gray-800",
    };
    return colors[language?.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (viewMode === "list") {
    return (
      <div
        onClick={handleCardClick}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer mb-2"
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left section: Title and metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {snippet.title}
              </h3>
              {snippet.sharing?.isShared && (
                <svg
                  className="w-4 h-4 text-blue-600 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  title="Shared snippet"
                >
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
              )}
              {snippet.language && (
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getLanguageBadgeColor(
                    snippet.language
                  )}`}
                >
                  {snippet.language}
                </span>
              )}
            </div>

            {snippet.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                {snippet.description}
              </p>
            )}

            {/* Tags */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {snippet.tags.slice(0, 5).map((tag, index) => {
                  // Generate consistent color for each tag
                  const colors = [
                    "bg-blue-100 text-blue-800",
                    "bg-green-100 text-green-800",
                    "bg-yellow-100 text-yellow-800",
                    "bg-red-100 text-red-800",
                    "bg-purple-100 text-purple-800",
                    "bg-pink-100 text-pink-800",
                    "bg-indigo-100 text-indigo-800",
                    "bg-cyan-100 text-cyan-800",
                  ];
                  let hash = 0;
                  for (let i = 0; i < tag.length; i++) {
                    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
                  }
                  const colorClass = colors[Math.abs(hash) % colors.length];

                  return (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}
                    >
                      {tag}
                    </span>
                  );
                })}
                {snippet.tags.length > 5 && (
                  <span className="px-2 py-0.5 text-xs text-gray-500">
                    +{snippet.tags.length - 5} more
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Updated {formatDate(snippet.updatedAt)}
            </p>
          </div>

          {/* Right section: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Copy code"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>

            <button
              onClick={handleEdit}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
              title="Edit snippet"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-2 rounded transition-colors ${
                showDeleteConfirm
                  ? "text-white bg-red-600 hover:bg-red-700"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
              title={
                showDeleteConfirm ? "Click again to confirm" : "Delete snippet"
              }
            >
              {isDeleting ? (
                <svg
                  className="w-5 h-5 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 mr-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {snippet.title}
          </h3>
          {snippet.sharing?.isShared && (
            <svg
              className="w-4 h-4 text-blue-600 flex-shrink-0"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              title="Shared snippet"
            >
              <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
            </svg>
          )}
        </div>
        {snippet.language && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap ${getLanguageBadgeColor(
              snippet.language
            )}`}
          >
            {snippet.language}
          </span>
        )}
      </div>

      {/* Description */}
      {snippet.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {snippet.description}
        </p>
      )}

      {/* Code Preview */}
      <div className="bg-gray-900 rounded p-3 mb-3 flex-1 overflow-hidden">
        <pre className="text-xs text-gray-300 font-mono overflow-hidden">
          <code className="line-clamp-3">{getCodePreview()}</code>
        </pre>
      </div>

      {/* Tags */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {snippet.tags.slice(0, 3).map((tag, index) => {
            // Generate consistent color for each tag
            const colors = [
              "bg-blue-100 text-blue-800",
              "bg-green-100 text-green-800",
              "bg-yellow-100 text-yellow-800",
              "bg-red-100 text-red-800",
              "bg-purple-100 text-purple-800",
              "bg-pink-100 text-pink-800",
              "bg-indigo-100 text-indigo-800",
              "bg-cyan-100 text-cyan-800",
            ];
            let hash = 0;
            for (let i = 0; i < tag.length; i++) {
              hash = tag.charCodeAt(i) + ((hash << 5) - hash);
            }
            const colorClass = colors[Math.abs(hash) % colors.length];

            return (
              <span
                key={index}
                className={`px-2 py-0.5 text-xs font-medium rounded ${colorClass}`}
              >
                {tag}
              </span>
            );
          })}
          {snippet.tags.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-gray-500">
              +{snippet.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500">{formatDate(snippet.updatedAt)}</p>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Copy code"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>

          <button
            onClick={handleEdit}
            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Edit snippet"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-1.5 rounded transition-colors ${
              showDeleteConfirm
                ? "text-white bg-red-600 hover:bg-red-700"
                : "text-gray-600 hover:text-red-600 hover:bg-red-50"
            } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
            title={
              showDeleteConfirm ? "Click again to confirm" : "Delete snippet"
            }
          >
            {isDeleting ? (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SnippetCard;
