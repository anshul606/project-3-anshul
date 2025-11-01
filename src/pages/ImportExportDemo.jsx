import { useState } from "react";
import { Button, ImportModal, Toast } from "../components/shared";
import { exportSnippetsToJSON, downloadJSON } from "../utils/exportImport";

/**
 * ImportExportDemo - Demonstrates import and export functionality
 */
const ImportExportDemo = () => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [snippets, setSnippets] = useState([
    {
      id: "1",
      title: "React useState Hook",
      description: "Basic useState hook example",
      code: "const [count, setCount] = useState(0);",
      language: "javascript",
      tags: ["react", "hooks"],
      metadata: {
        usageNotes: "Use for managing component state",
        dependencies: "react",
        author: "Demo User",
      },
      collectionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "2",
      title: "Python List Comprehension",
      description: "Create a list of squares",
      code: "squares = [x**2 for x in range(10)]",
      language: "python",
      tags: ["python", "list-comprehension"],
      metadata: {
        usageNotes: "Efficient way to create lists",
        dependencies: "",
        author: "Demo User",
      },
      collectionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "3",
      title: "SQL Join Query",
      description: "Inner join two tables",
      code: "SELECT * FROM users u INNER JOIN orders o ON u.id = o.user_id;",
      language: "sql",
      tags: ["sql", "join"],
      metadata: {
        usageNotes: "Combine data from multiple tables",
        dependencies: "",
        author: "Demo User",
      },
      collectionId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
  const [selectedSnippets, setSelectedSnippets] = useState(new Set());
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle snippet selection
  const toggleSnippetSelection = (snippetId) => {
    const newSelection = new Set(selectedSnippets);
    if (newSelection.has(snippetId)) {
      newSelection.delete(snippetId);
    } else {
      newSelection.add(snippetId);
    }
    setSelectedSnippets(newSelection);
  };

  // Select all snippets
  const selectAll = () => {
    setSelectedSnippets(new Set(snippets.map((s) => s.id)));
  };

  // Deselect all snippets
  const deselectAll = () => {
    setSelectedSnippets(new Set());
  };

  // Export all snippets
  const handleExportAll = () => {
    try {
      const jsonString = exportSnippetsToJSON(snippets, {
        includeMetadata: true,
        pretty: true,
      });
      downloadJSON(jsonString, "all-snippets-export.json");
      showToast(`Exported ${snippets.length} snippets successfully`);
    } catch (error) {
      showToast(`Export failed: ${error.message}`, "error");
    }
  };

  // Export selected snippets
  const handleExportSelected = () => {
    try {
      const selectedSnippetsList = snippets.filter((s) =>
        selectedSnippets.has(s.id)
      );

      if (selectedSnippetsList.length === 0) {
        showToast("No snippets selected", "error");
        return;
      }

      const jsonString = exportSnippetsToJSON(selectedSnippetsList, {
        includeMetadata: true,
        pretty: true,
      });
      downloadJSON(jsonString, "selected-snippets-export.json");
      showToast(
        `Exported ${selectedSnippetsList.length} snippets successfully`
      );
    } catch (error) {
      showToast(`Export failed: ${error.message}`, "error");
    }
  };

  // Handle import
  const handleImport = async (importedSnippets) => {
    try {
      // In a real app, this would save to Firebase
      // For demo, we'll just add to local state with new IDs
      const newSnippets = importedSnippets.map((snippet, index) => ({
        ...snippet,
        id: `imported-${Date.now()}-${index}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      setSnippets([...snippets, ...newSnippets]);
      showToast(`Successfully imported ${newSnippets.length} snippets`);
    } catch (error) {
      showToast(`Import failed: ${error.message}`, "error");
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Import & Export Demo
          </h1>
          <p className="text-gray-600">
            Export your snippets to JSON or import from JSON/VS Code snippet
            format
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" onClick={handleExportAll}>
              Export All Snippets
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportSelected}
              disabled={selectedSnippets.size === 0}
            >
              Export Selected ({selectedSnippets.size})
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowImportModal(true)}
            >
              Import Snippets
            </Button>
          </div>
        </div>

        {/* Selection Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Snippets ({snippets.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Select All
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={deselectAll}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Snippets List */}
          <div className="space-y-3">
            {snippets.map((snippet) => (
              <div
                key={snippet.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedSnippets.has(snippet.id)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => toggleSnippetSelection(snippet.id)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSnippets.has(snippet.id)}
                    onChange={() => toggleSnippetSelection(snippet.id)}
                    className="mt-1"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {snippet.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {snippet.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {snippet.language}
                      </span>
                      {snippet.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <pre className="mt-3 p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                      <code>{snippet.code}</code>
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Import/Export Format Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Supported Formats
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Standard JSON Format
              </h3>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                {`[
  {
    "title": "Snippet Title",
    "description": "Description",
    "code": "console.log('Hello');",
    "language": "javascript",
    "tags": ["tag1", "tag2"],
    "metadata": {
      "usageNotes": "Usage notes",
      "dependencies": "Dependencies",
      "author": "Author name"
    }
  }
]`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                VS Code Snippet Format
              </h3>
              <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                {`{
  "Console Log": {
    "prefix": "log",
    "body": ["console.log('$1');"],
    "description": "Log to console"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ImportExportDemo;
