import { useState } from "react";
import { Modal, Button } from "./";

/**
 * ShareModal component
 * Modal for sharing snippets with other users
 * Allows entering user emails and selecting permissions (read/write)
 */
const ShareModal = ({ isOpen, onClose, onShare, snippet }) => {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState("read");
  const [sharedUsers, setSharedUsers] = useState([]);
  const [error, setError] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Reset state when modal opens/closes
  const handleClose = () => {
    setEmail("");
    setPermission("read");
    setSharedUsers([]);
    setError("");
    onClose();
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add user to the list
  const handleAddUser = () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if user is already in the list
    if (sharedUsers.some((user) => user.email === email)) {
      setError("This user is already in the list");
      return;
    }

    // Add user to the list
    setSharedUsers([...sharedUsers, { email, permission }]);
    setEmail("");
    setPermission("read");
  };

  // Remove user from the list
  const handleRemoveUser = (emailToRemove) => {
    setSharedUsers(sharedUsers.filter((user) => user.email !== emailToRemove));
  };

  // Update permission for a user
  const handleUpdatePermission = (email, newPermission) => {
    setSharedUsers(
      sharedUsers.map((user) =>
        user.email === email ? { ...user, permission: newPermission } : user
      )
    );
  };

  // Share snippet with all users in the list
  const handleShare = async () => {
    if (sharedUsers.length === 0) {
      setError("Please add at least one user to share with");
      return;
    }

    setIsSharing(true);
    setError("");

    try {
      await onShare(sharedUsers);
      handleClose();
    } catch (err) {
      setError(err.message || "Failed to share snippet");
    } finally {
      setIsSharing(false);
    }
  };

  // Handle Enter key press in email input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUser();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Share "${snippet?.title || "Snippet"}"`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSharing}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleShare}
            disabled={isSharing || sharedUsers.length === 0}
          >
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Email Input Section */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Add people by email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="user@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="read">Can view</option>
              <option value="write">Can edit</option>
            </select>
            <Button variant="primary" onClick={handleAddUser} size="sm">
              Add
            </Button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        {/* Shared Users List */}
        {sharedUsers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              People with access
            </h3>
            <div className="border border-gray-200 rounded-md divide-y divide-gray-200">
              {sharedUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-gray-900">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={user.permission}
                      onChange={(e) =>
                        handleUpdatePermission(user.email, e.target.value)
                      }
                      className="text-sm px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="read">Can view</option>
                      <option value="write">Can edit</option>
                    </select>
                    <button
                      onClick={() => handleRemoveUser(user.email)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove user"
                    >
                      <svg
                        className="w-5 h-5"
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Sharing Status */}
        {snippet?.sharing?.isShared &&
          snippet.sharing.sharedWith.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Currently shared with
              </h4>
              <ul className="space-y-1">
                {snippet.sharing.sharedWith.map((share, index) => (
                  <li key={index} className="text-sm text-blue-800">
                    {share.email || share.userId} ({share.permission})
                  </li>
                ))}
              </ul>
            </div>
          )}

        {/* Info Message */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-xs text-gray-600">
            <strong>Note:</strong> Users with "Can view" permission can only
            read the snippet. Users with "Can edit" permission can modify the
            snippet content.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
