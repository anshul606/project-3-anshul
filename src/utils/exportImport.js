/**
 * Export and Import Utilities
 * Handles exporting snippets to JSON and importing from various formats
 */

/**
 * Export snippets to JSON format
 * @param {Array} snippets - Array of snippet objects to export
 * @param {Object} options - Export options
 * @returns {string} JSON string of exported snippets
 */
export const exportSnippetsToJSON = (snippets, options = {}) => {
  const { includeMetadata = true, pretty = true } = options;

  // Prepare snippets for export
  const exportData = snippets.map((snippet) => {
    const exported = {
      title: snippet.title,
      description: snippet.description || "",
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags || [],
    };

    // Include additional metadata if requested
    if (includeMetadata) {
      exported.metadata = {
        usageNotes: snippet.metadata?.usageNotes || "",
        dependencies: snippet.metadata?.dependencies || "",
        author: snippet.metadata?.author || "",
      };
      exported.collectionId = snippet.collectionId || null;
      exported.createdAt = snippet.createdAt?.toDate
        ? snippet.createdAt.toDate().toISOString()
        : snippet.createdAt;
      exported.updatedAt = snippet.updatedAt?.toDate
        ? snippet.updatedAt.toDate().toISOString()
        : snippet.updatedAt;
    }

    return exported;
  });

  // Convert to JSON
  const jsonString = pretty
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData);

  return jsonString;
};

/**
 * Download JSON file to user's computer
 * @param {string} jsonString - JSON string to download
 * @param {string} filename - Name of the file to download
 */
export const downloadJSON = (jsonString, filename = "snippets-export.json") => {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validate imported snippet data
 * @param {Object} snippet - Snippet object to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateImportedSnippet = (snippet) => {
  const errors = [];

  // Required fields
  if (!snippet.title || typeof snippet.title !== "string") {
    errors.push("Missing or invalid title");
  }

  if (!snippet.code || typeof snippet.code !== "string") {
    errors.push("Missing or invalid code");
  }

  if (!snippet.language || typeof snippet.language !== "string") {
    errors.push("Missing or invalid language");
  }

  // Optional fields validation
  if (snippet.description && typeof snippet.description !== "string") {
    errors.push("Invalid description format");
  }

  if (snippet.tags && !Array.isArray(snippet.tags)) {
    errors.push("Tags must be an array");
  }

  // Validate tag format
  if (snippet.tags && Array.isArray(snippet.tags)) {
    const invalidTags = snippet.tags.filter(
      (tag) => typeof tag !== "string" || !/^[a-zA-Z0-9-]+$/.test(tag)
    );
    if (invalidTags.length > 0) {
      errors.push(
        `Invalid tag format: ${invalidTags.join(
          ", "
        )}. Tags must be alphanumeric with hyphens only.`
      );
    }
  }

  // Character limits
  if (snippet.title && snippet.title.length > 200) {
    errors.push("Title exceeds 200 characters");
  }

  if (snippet.description && snippet.description.length > 2000) {
    errors.push("Description exceeds 2000 characters");
  }

  if (snippet.code && snippet.code.length > 50000) {
    errors.push("Code exceeds 50000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Parse and validate JSON import file
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} Result with snippets array and validation errors
 */
export const parseJSONImport = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);

    // Ensure data is an array
    const snippetsArray = Array.isArray(data) ? data : [data];

    const validSnippets = [];
    const errors = [];

    snippetsArray.forEach((snippet, index) => {
      const validation = validateImportedSnippet(snippet);

      if (validation.isValid) {
        // Normalize the snippet data
        validSnippets.push({
          title: snippet.title.trim(),
          description: (snippet.description || "").trim(),
          code: snippet.code,
          language: snippet.language.toLowerCase(),
          tags: snippet.tags || [],
          metadata: {
            usageNotes: snippet.metadata?.usageNotes || "",
            dependencies: snippet.metadata?.dependencies || "",
            author: snippet.metadata?.author || "",
          },
          collectionId: snippet.collectionId || null,
        });
      } else {
        errors.push({
          index: index + 1,
          title: snippet.title || "Untitled",
          errors: validation.errors,
        });
      }
    });

    return {
      success: true,
      snippets: validSnippets,
      errors,
      totalCount: snippetsArray.length,
      validCount: validSnippets.length,
      errorCount: errors.length,
    };
  } catch (error) {
    return {
      success: false,
      snippets: [],
      errors: [
        {
          index: 0,
          title: "Parse Error",
          errors: [`Invalid JSON format: ${error.message}`],
        },
      ],
      totalCount: 0,
      validCount: 0,
      errorCount: 1,
    };
  }
};

/**
 * Convert VS Code snippet format to our format
 * @param {Object} vscodeSnippets - VS Code snippets object
 * @param {string} language - Programming language for the snippets
 * @returns {Array} Array of normalized snippets
 */
export const convertVSCodeSnippets = (
  vscodeSnippets,
  language = "javascript"
) => {
  const snippets = [];

  Object.entries(vscodeSnippets).forEach(([key, value]) => {
    // VS Code snippet format:
    // {
    //   "Snippet Name": {
    //     "prefix": "trigger",
    //     "body": ["line1", "line2"],
    //     "description": "Description"
    //   }
    // }

    if (value && typeof value === "object") {
      const code = Array.isArray(value.body)
        ? value.body.join("\n")
        : value.body || "";

      const snippet = {
        title: key,
        description: value.description || value.prefix || "",
        code: code,
        language: value.scope || language,
        tags: value.prefix ? [value.prefix] : [],
        metadata: {
          usageNotes: value.prefix ? `Trigger: ${value.prefix}` : "",
          dependencies: "",
          author: "",
        },
        collectionId: null,
      };

      const validation = validateImportedSnippet(snippet);
      if (validation.isValid) {
        snippets.push(snippet);
      }
    }
  });

  return snippets;
};

/**
 * Parse VS Code snippet file
 * @param {string} jsonString - VS Code snippet JSON string
 * @param {string} language - Programming language
 * @returns {Object} Result with snippets array and validation errors
 */
export const parseVSCodeImport = (jsonString, language = "javascript") => {
  try {
    const data = JSON.parse(jsonString);
    const snippets = convertVSCodeSnippets(data, language);

    return {
      success: true,
      snippets,
      errors: [],
      totalCount: Object.keys(data).length,
      validCount: snippets.length,
      errorCount: Object.keys(data).length - snippets.length,
    };
  } catch (error) {
    return {
      success: false,
      snippets: [],
      errors: [
        {
          index: 0,
          title: "Parse Error",
          errors: [`Invalid VS Code snippet format: ${error.message}`],
        },
      ],
      totalCount: 0,
      validCount: 0,
      errorCount: 1,
    };
  }
};

/**
 * Read file content as text
 * @param {File} file - File object to read
 * @returns {Promise<string>} File content as string
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      resolve(event.target.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsText(file);
  });
};

/**
 * Detect import format from file content
 * @param {string} content - File content
 * @returns {string} Format type: 'json' or 'vscode'
 */
export const detectImportFormat = (content) => {
  try {
    const data = JSON.parse(content);

    // Check if it's VS Code format
    // VS Code snippets have objects with "prefix" and "body" properties
    if (typeof data === "object" && !Array.isArray(data)) {
      const firstKey = Object.keys(data)[0];
      if (firstKey && data[firstKey].prefix && data[firstKey].body) {
        return "vscode";
      }
    }

    // Otherwise assume it's our JSON format
    return "json";
  } catch (error) {
    return "json"; // Default to JSON format
  }
};

export default {
  exportSnippetsToJSON,
  downloadJSON,
  validateImportedSnippet,
  parseJSONImport,
  convertVSCodeSnippets,
  parseVSCodeImport,
  readFileAsText,
  detectImportFormat,
};
