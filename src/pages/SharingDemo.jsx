import { useState } from "react";
import { Link } from "react-router-dom";
import { SnippetDetail } from "../components/snippets";
import { Toast } from "../components/shared";

/**
 * Sharing Demo Page
 * Demonstrates snippet sharing and collaboration features
 */
const SharingDemo = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Sample snippet with sharing information
  const [sampleSnippet, setSampleSnippet] = useState({
    id: "demo-snippet-1",
    userId: "user123",
    title: "React Custom Hook - useLocalStorage",
    description:
      "A custom React hook for managing state synchronized with localStorage",
    code: `import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage;`,
    language: "javascript",
    tags: ["react", "hooks", "localStorage", "custom-hook"],
    collectionId: "react-hooks",
    metadata: {
      usageNotes:
        "Use this hook to persist state in localStorage. Perfect for user preferences, form data, or any state that should survive page refreshes.",
      dependencies: "React 16.8+",
      author: "John Doe",
    },
    sharing: {
      isShared: true,
      sharedWith: [
        { userId: "jane@example.com", permission: "write" },
        { userId: "bob@example.com", permission: "read" },
        { userId: "alice@example.com", permission: "write" },
      ],
    },
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-20"),
    lastEditedBy: "jane@example.com",
  });

  // Handle share action
  const handleShare = async (snippetId, sharedUsers) => {
    console.log("Sharing snippet:", snippetId, "with users:", sharedUsers);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update snippet with new shared users
    const newSharedWith = [
      ...sampleSnippet.sharing.sharedWith,
      ...sharedUsers.map((user) => ({
        userId: user.email,
        permission: user.permission,
      })),
    ];

    setSampleSnippet({
      ...sampleSnippet,
      sharing: {
        isShared: true,
        sharedWith: newSharedWith,
      },
    });

    setToastMessage(
      `Snippet shared with ${sharedUsers.length} user${
        sharedUsers.length > 1 ? "s" : ""
      }`
    );
    setToastType("success");
    setShowToast(true);
  };

  // Handle edit action
  const handleEdit = (snippet) => {
    console.log("Edit snippet:", snippet);
    setToastMessage("Edit functionality would open the snippet editor");
    setToastType("info");
    setShowToast(true);
  };

  // Handle delete action
  const handleDelete = async (snippetId) => {
    console.log("Delete snippet:", snippetId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setToastMessage("Snippet deleted successfully");
    setToastType("success");
    setShowToast(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/demo"
                className="text-blue-600 hover:text-blue-700 font-medium mb-2 inline-flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M15 19l-7-7 7-7"></path>
                </svg>
                Back to Demo Hub
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Sharing & Collaboration Demo
              </h1>
              <p className="text-gray-600 mt-2">
                Test snippet sharing features with multiple users and
                permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Sharing Features
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share Button
                  </h3>
                  <p className="text-sm text-gray-600">
                    Click the "Share" button in the snippet detail view to open
                    the sharing modal
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-green-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    Add Users
                  </h3>
                  <p className="text-sm text-gray-600">
                    Enter email addresses and select permissions (Can view or
                    Can edit)
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    Permissions
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Can view:</strong> Read-only access
                    <br />
                    <strong>Can edit:</strong> Full edit permissions
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-orange-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Shared Indicator
                  </h3>
                  <p className="text-sm text-gray-600">
                    Shared snippets display a share icon and list of users with
                    access
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-red-600"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Last Edited By
                  </h3>
                  <p className="text-sm text-gray-600">
                    Track who made the most recent changes to shared snippets
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Try it:</strong> Click the Share button to add new
                  users and manage permissions. The snippet is already shared
                  with 3 users.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Snippet Detail */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <SnippetDetail
                snippet={sampleSnippet}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onShare={handleShare}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Team Collaboration
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Share Snippets
                    </h3>
                    <p className="text-sm text-gray-600">
                      Share individual snippets with team members by email
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-semibold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Team Collections
                    </h3>
                    <p className="text-sm text-gray-600">
                      Create team collections where multiple members can
                      contribute snippets
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Permission Control
                    </h3>
                    <p className="text-sm text-gray-600">
                      Grant read-only or edit access to maintain control over
                      your snippets
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-orange-600 font-semibold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Track Changes
                    </h3>
                    <p className="text-sm text-gray-600">
                      See who created and last edited each snippet for better
                      collaboration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
};

export default SharingDemo;
