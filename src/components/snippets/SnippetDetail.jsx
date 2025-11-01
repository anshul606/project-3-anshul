import { useState } from "react";
import CodeDisplay from "./CodeDisplay";
import { Button, Modal, Toast, ShareModal } from "../shared";
import useClipboard from "../../hooks/useClipboard";

/**
 * SnippetDetail component
 * Displays full snippet information with all metadata
 * Includes copy, edit, delete, and sharing functionality
 */
const SnippetDetail = ({ snippet, onEdit, onDelete, onClose, onShare }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isDeleting, setIsDeleting] = useState(false);

  const { copyToClipboard, isCopied, error: clipboardError } = useClipboard();

  if (!snippet) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No snippet selected</p>
      </div>
    );
  }

  const handleCopy = async () => {
    const success = await copyToClipboard(snippet.code);
    if (success) {
      setToastMessage("Code copied to clipboard!");
      setToastType("success");
      setShowToast(true);
    } else {
      setToastMessage(clipboardError || "Failed to copy code");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(snippet.id);
      setShowDeleteModal(false);
      setToastMessage("Snippet deleted successfully");
      setToastType("success");
      setShowToast(true);

      // Close detail view after deletion
      if (onClose) {
        setTimeout(() => onClose(), 1000);
      }
    } catch (error) {
      console.error("Error deleting snippet:", error);
      setToastMessage("Failed to delete snippet");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async (sharedUsers) => {
    try {
      await onShare(snippet.id, sharedUsers);
      setToastMessage("Snippet shared successfully");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error sharing snippet:", error);
      throw error; // Re-throw to let ShareModal handle it
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";

    // Handle Firestore Timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isShared = snippet.sharing?.isShared || false;
  const sharedWith = snippet.sharing?.sharedWith || [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {snippet.title}
              </h1>
              {isShared && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                  </svg>
                  Shared
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-mono">
                {snippet.language}
              </span>
              {snippet.tags && snippet.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {snippet.tags.map((tag, index) => {
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
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
                      >
                        #{tag}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="flex items-center gap-2"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Copy
                </>
              )}
            </Button>

            {onShare && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-2"
                title="Share snippet"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                </svg>
                Share
              </Button>
            )}

            {onEdit && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(snippet)}
                className="flex items-center gap-2"
                title="Edit snippet"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                Edit
              </Button>
            )}

            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2"
                title="Delete snippet"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </Button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Description */}
        {snippet.description && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Description
            </h2>
            <p className="text-gray-600">{snippet.description}</p>
          </div>
        )}

        {/* Code Display */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Code</h2>
          <CodeDisplay
            code={snippet.code}
            language={snippet.language}
            showLineNumbers={true}
          />
        </div>

        {/* Usage Notes */}
        {snippet.metadata?.usageNotes && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Usage Notes
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {snippet.metadata.usageNotes}
            </p>
          </div>
        )}

        {/* Dependencies */}
        {snippet.metadata?.dependencies && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Dependencies
            </h2>
            <p className="text-gray-600 whitespace-pre-wrap">
              {snippet.metadata.dependencies}
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Metadata</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            {snippet.metadata?.author && (
              <div className="flex justify-between">
                <span className="text-gray-600">Author:</span>
                <span className="text-gray-900 font-medium">
                  {snippet.metadata.author}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="text-gray-900">
                {formatDate(snippet.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span className="text-gray-900">
                {formatDate(snippet.updatedAt)}
              </span>
            </div>
            {snippet.lastEditedBy && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Edited By:</span>
                <span className="text-gray-900">{snippet.lastEditedBy}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sharing Information */}
        {isShared && sharedWith.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Shared With
            </h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2">
                {sharedWith.map((share, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-900">{share.userId}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        share.permission === "write"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {share.permission}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Snippet"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{snippet.title}"? This action cannot
          be undone.
        </p>
      </Modal>

      {/* Share Modal */}
      {onShare && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onShare={handleShare}
          snippet={snippet}
        />
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={2000}
      />
    </div>
  );
};

export default SnippetDetail;
