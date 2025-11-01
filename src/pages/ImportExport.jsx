import { useState } from "react";
import { useSnippets } from "../hooks/useSnippets";
import { useAuth } from "../contexts/AuthContext";
import { exportSnippetsToJSON, downloadJSON } from "../utils/exportImport";
import ImportModal from "../components/shared/ImportModal";
import { FiDownload, FiUpload } from "react-icons/fi";

/**
 * Import/Export page for snippet data management
 */
const ImportExport = () => {
  const { snippets, addSnippet } = useSnippets();
  const { user } = useAuth();
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);

  const handleExport = () => {
    try {
      const jsonString = exportSnippetsToJSON(snippets);
      const timestamp = new Date().toISOString().split("T")[0];
      downloadJSON(jsonString, `snippets-export-${timestamp}.json`);
      setExportStatus({
        type: "success",
        message: `Successfully exported ${snippets.length} snippets`,
      });
      setTimeout(() => setExportStatus(null), 3000);
    } catch (error) {
      setExportStatus({
        type: "error",
        message: `Export failed: ${error.message}`,
      });
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleImport = async (importedSnippets) => {
    try {
      // Import each snippet using the addSnippet function
      for (const snippet of importedSnippets) {
        await addSnippet(snippet);
      }
      setShowImportModal(false);
      // Snippets will be updated via real-time listener
    } catch (error) {
      console.error("Import error:", error);
      throw error;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Import & Export
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiDownload className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Export Snippets
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Download all your snippets as JSON
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Export all {snippets.length} snippets to a JSON file for backup or
            migration to another account.
          </p>

          <button
            onClick={handleExport}
            disabled={snippets.length === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiDownload className="w-5 h-5" />
            Export All Snippets
          </button>

          {exportStatus && (
            <div
              className={`mt-4 p-3 rounded-md ${
                exportStatus.type === "success"
                  ? "bg-green-50 text-green-800"
                  : "bg-red-50 text-red-800"
              }`}
            >
              {exportStatus.message}
            </div>
          )}
        </div>

        {/* Import Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiUpload className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Import Snippets
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload snippets from a JSON file
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Import snippets from a JSON file. Supports both our export format
            and VS Code snippet format.
          </p>

          <button
            onClick={() => setShowImportModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            <FiUpload className="w-5 h-5" />
            Import Snippets
          </button>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Import Guidelines
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• JSON files must contain valid snippet data</li>
          <li>• Required fields: title, code, language</li>
          <li>• Optional fields: description, tags, metadata</li>
          <li>• VS Code snippet format is automatically converted</li>
          <li>• Duplicate snippets will be skipped</li>
        </ul>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
};

export default ImportExport;
