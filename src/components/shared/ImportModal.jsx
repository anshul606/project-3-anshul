import { useState, useRef } from "react";
import Modal from "./Modal";
import Button from "./Button";
import {
  readFileAsText,
  detectImportFormat,
  parseJSONImport,
  parseVSCodeImport,
} from "../../utils/exportImport";

/**
 * ImportModal component for importing snippets from JSON files
 * Supports both standard JSON format and VS Code snippet format
 */
const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState(null);
  const [importFormat, setImportFormat] = useState("json");
  const [language, setLanguage] = useState("javascript");
  const [parseResult, setParseResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Reset state when modal closes
  const handleClose = () => {
    setFile(null);
    setImportFormat("json");
    setLanguage("javascript");
    setParseResult(null);
    setIsProcessing(false);
    setError(null);
    onClose();
  };

  // Handle file selection
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.endsWith(".json")) {
      setError("Please select a JSON file");
      return;
    }

    setFile(selectedFile);
    setError(null);
    setParseResult(null);

    try {
      setIsProcessing(true);

      // Read file content
      const content = await readFileAsText(selectedFile);

      // Detect format
      const detectedFormat = detectImportFormat(content);
      setImportFormat(detectedFormat);

      // Parse based on format
      let result;
      if (detectedFormat === "vscode") {
        result = parseVSCodeImport(content, language);
      } else {
        result = parseJSONImport(content);
      }

      setParseResult(result);
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle language change for VS Code imports
  const handleLanguageChange = async (newLanguage) => {
    setLanguage(newLanguage);

    // Re-parse if we have a file and it's VS Code format
    if (file && importFormat === "vscode") {
      try {
        setIsProcessing(true);
        const content = await readFileAsText(file);
        const result = parseVSCodeImport(content, newLanguage);
        setParseResult(result);
      } catch (err) {
        setError(`Failed to re-parse file: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handle import confirmation
  const handleImport = async () => {
    if (!parseResult || parseResult.validCount === 0) {
      setError("No valid snippets to import");
      return;
    }

    try {
      setIsProcessing(true);
      await onImport(parseResult.snippets);
      handleClose();
    } catch (err) {
      setError(`Import failed: ${err.message}`);
      setIsProcessing(false);
    }
  };

  // Trigger file input click
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleImport}
        disabled={!parseResult || parseResult.validCount === 0 || isProcessing}
      >
        {isProcessing
          ? "Importing..."
          : `Import ${parseResult?.validCount || 0} Snippets`}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Snippets"
      footer={footer}
      size="lg"
      closeOnBackdrop={!isProcessing}
    >
      <div className="space-y-4">
        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={handleSelectFile}
              disabled={isProcessing}
            >
              Choose File
            </Button>
            {file && <span className="text-sm text-gray-600">{file.name}</span>}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Supports JSON format and VS Code snippet format (.json files)
          </p>
        </div>

        {/* Format Detection */}
        {importFormat === "vscode" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              VS Code Snippet Detected - Select Language
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isProcessing}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Parse Result Preview */}
        {parseResult && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Import Summary
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Total</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {parseResult.totalCount}
                  </p>
                </div>
                <div>
                  <p className="text-green-600">Valid</p>
                  <p className="text-lg font-semibold text-green-900">
                    {parseResult.validCount}
                  </p>
                </div>
                <div>
                  <p className="text-red-600">Errors</p>
                  <p className="text-lg font-semibold text-red-900">
                    {parseResult.errorCount}
                  </p>
                </div>
              </div>
            </div>

            {/* Valid Snippets Preview */}
            {parseResult.validCount > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Snippets to Import ({parseResult.validCount})
                </h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {parseResult.snippets.slice(0, 10).map((snippet, index) => (
                      <li key={index} className="p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {snippet.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {snippet.language}
                              {snippet.tags.length > 0 &&
                                ` • ${snippet.tags.join(", ")}`}
                            </p>
                          </div>
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Valid
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {parseResult.validCount > 10 && (
                    <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                      ... and {parseResult.validCount - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Errors Display */}
            {parseResult.errorCount > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-2">
                  Validation Errors ({parseResult.errorCount})
                </h3>
                <div className="max-h-48 overflow-y-auto border border-red-200 rounded-md bg-red-50">
                  <ul className="divide-y divide-red-200">
                    {parseResult.errors.map((error, index) => (
                      <li key={index} className="p-3">
                        <p className="text-sm font-medium text-red-900">
                          {error.title}
                          {error.index > 0 && ` (Item ${error.index})`}
                        </p>
                        <ul className="mt-1 ml-4 list-disc list-inside">
                          {error.errors.map((err, errIndex) => (
                            <li key={errIndex} className="text-xs text-red-700">
                              {err}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && !parseResult && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              Processing file...
            </span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportModal;
