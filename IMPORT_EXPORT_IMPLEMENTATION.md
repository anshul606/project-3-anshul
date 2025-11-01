# Import & Export Implementation

## Overview

The import and export functionality allows users to backup their snippet collections and migrate data between different tools. The implementation supports both standard JSON format and VS Code snippet format.

## Components

### 1. Export/Import Utility (`src/utils/exportImport.js`)

Core utility functions for handling import and export operations.

#### Export Functions

- **`exportSnippetsToJSON(snippets, options)`**

  - Converts snippet array to JSON format
  - Options: `includeMetadata`, `pretty`
  - Returns formatted JSON string

- **`downloadJSON(jsonString, filename)`**
  - Triggers browser download of JSON file
  - Creates blob and temporary download link

#### Import Functions

- **`parseJSONImport(jsonString)`**

  - Parses standard JSON format
  - Validates each snippet
  - Returns result with valid snippets and errors

- **`parseVSCodeImport(jsonString, language)`**

  - Parses VS Code snippet format
  - Converts to standard format
  - Returns result with converted snippets

- **`convertVSCodeSnippets(vscodeSnippets, language)`**
  - Converts VS Code format to standard format
  - Handles prefix, body, and description fields
  - Validates converted snippets

#### Validation Functions

- **`validateImportedSnippet(snippet)`**
  - Validates required fields (title, code, language)
  - Checks field types and formats
  - Validates tag format (alphanumeric with hyphens)
  - Enforces character limits
  - Returns validation result with errors

#### Utility Functions

- **`readFileAsText(file)`**

  - Reads File object as text using FileReader
  - Returns Promise with file content

- **`detectImportFormat(content)`**
  - Auto-detects JSON format type
  - Checks for VS Code format indicators
  - Returns 'json' or 'vscode'

## Supported Formats

### Standard JSON Format

```json
[
  {
    "title": "Snippet Title",
    "description": "Description text",
    "code": "console.log('Hello');",
    "language": "javascript",
    "tags": ["tag1", "tag2"],
    "metadata": {
      "usageNotes": "Usage notes",
      "dependencies": "Dependencies",
      "author": "Author name"
    },
    "collectionId": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### VS Code Snippet Format

```json
{
  "Console Log": {
    "prefix": "log",
    "body": ["console.log('$1');"],
    "description": "Log to console",
    "scope": "javascript"
  },
  "For Loop": {
    "prefix": "for",
    "body": [
      "for (let i = 0; i < ${1:array}.length; i++) {",
      "  ${2:// code}",
      "}"
    ],
    "description": "For loop"
  }
}
```

## Components

### 2. ImportModal Component (`src/components/shared/ImportModal.jsx`)

Modal dialog for importing snippets with file upload and preview.

#### Features

- File upload with drag-and-drop support
- Automatic format detection
- Language selection for VS Code imports
- Real-time validation and preview
- Import summary with counts
- Error display with details
- Valid snippets preview (first 10)

#### Props

```javascript
{
  isOpen: boolean,        // Modal visibility
  onClose: function,      // Close handler
  onImport: function      // Import handler (receives snippets array)
}
```

#### State Management

- `file` - Selected file object
- `importFormat` - Detected format ('json' or 'vscode')
- `language` - Selected language for VS Code imports
- `parseResult` - Validation and parsing results
- `isProcessing` - Loading state
- `error` - Error message

#### User Flow

1. User clicks "Choose File" button
2. File is read and format is detected
3. Content is parsed and validated
4. Preview shows valid snippets and errors
5. User clicks "Import" to confirm
6. `onImport` callback is called with valid snippets
7. Modal closes on success

### 3. ImportExportDemo Page (`src/pages/ImportExportDemo.jsx`)

Demo page showcasing import and export functionality.

#### Features

- Sample snippet collection
- Checkbox selection for snippets
- Export all snippets
- Export selected snippets
- Import snippets with modal
- Toast notifications for feedback
- Format documentation

#### Actions

- **Export All** - Exports all snippets to JSON
- **Export Selected** - Exports only selected snippets
- **Import** - Opens import modal
- **Select All / Deselect All** - Bulk selection controls

## Validation Rules

### Required Fields

- `title` (string, max 200 characters)
- `code` (string, max 50,000 characters)
- `language` (string)

### Optional Fields

- `description` (string, max 2,000 characters)
- `tags` (array of strings, alphanumeric with hyphens)
- `metadata` (object with usageNotes, dependencies, author)
- `collectionId` (string or null)

### Tag Format

- Must be alphanumeric with hyphens only
- Pattern: `/^[a-zA-Z0-9-]+$/`
- Invalid examples: "tag with spaces", "tag_underscore", "tag.dot"
- Valid examples: "javascript", "react-hooks", "api-v2"

## Error Handling

### Import Errors

1. **Parse Errors**

   - Invalid JSON format
   - Malformed file structure
   - Display: Error message with details

2. **Validation Errors**

   - Missing required fields
   - Invalid field types
   - Character limit exceeded
   - Invalid tag format
   - Display: List of errors per snippet

3. **File Errors**
   - Wrong file type (not .json)
   - File read failure
   - Display: Error toast notification

### Export Errors

1. **No Selection**

   - User tries to export with no snippets selected
   - Display: Error toast

2. **Export Failure**
   - JSON serialization error
   - Download trigger failure
   - Display: Error toast with message

## Integration with SnippetContext

### Import Flow

```javascript
const handleImport = async (importedSnippets) => {
  const { addSnippet } = useSnippets();

  for (const snippet of importedSnippets) {
    await addSnippet(snippet);
  }

  showToast(`Imported ${importedSnippets.length} snippets`);
};
```

### Export Flow

```javascript
const handleExport = () => {
  const { snippets } = useSnippets();
  const jsonString = exportSnippetsToJSON(snippets);
  downloadJSON(jsonString, "my-snippets.json");
};
```

## Usage Examples

### Export All Snippets

```javascript
import { exportSnippetsToJSON, downloadJSON } from "../utils/exportImport";

const snippets = [
  /* snippet array */
];
const jsonString = exportSnippetsToJSON(snippets, {
  includeMetadata: true,
  pretty: true,
});
downloadJSON(jsonString, "snippets-backup.json");
```

### Import with Validation

```javascript
import { readFileAsText, parseJSONImport } from "../utils/exportImport";

const handleFileUpload = async (file) => {
  const content = await readFileAsText(file);
  const result = parseJSONImport(content);

  if (result.success) {
    console.log(`Valid: ${result.validCount}, Errors: ${result.errorCount}`);
    // Import valid snippets
    await importSnippets(result.snippets);
  } else {
    console.error("Parse failed:", result.errors);
  }
};
```

### VS Code Import

```javascript
import { parseVSCodeImport } from "../utils/exportImport";

const content = await readFileAsText(file);
const result = parseVSCodeImport(content, "javascript");

if (result.success) {
  // Import converted snippets
  await importSnippets(result.snippets);
}
```

## Testing

### Unit Tests

Test the utility functions:

```javascript
describe("exportImport", () => {
  test("exports snippets to JSON", () => {
    const snippets = [{ title: "Test", code: "test", language: "js" }];
    const json = exportSnippetsToJSON(snippets);
    expect(JSON.parse(json)).toHaveLength(1);
  });

  test("validates snippet with missing title", () => {
    const snippet = { code: "test", language: "js" };
    const result = validateImportedSnippet(snippet);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Missing or invalid title");
  });

  test("converts VS Code snippets", () => {
    const vscode = {
      Log: { prefix: "log", body: ["console.log()"], description: "Log" },
    };
    const snippets = convertVSCodeSnippets(vscode, "javascript");
    expect(snippets).toHaveLength(1);
    expect(snippets[0].title).toBe("Log");
  });
});
```

### Integration Tests

Test the import/export flow:

```javascript
describe("Import/Export Flow", () => {
  test("exports and re-imports snippets", async () => {
    // Export
    const original = [
      { title: "Test", code: "test", language: "js", tags: [] },
    ];
    const json = exportSnippetsToJSON(original);

    // Import
    const result = parseJSONImport(json);
    expect(result.success).toBe(true);
    expect(result.validCount).toBe(1);
    expect(result.snippets[0].title).toBe("Test");
  });
});
```

## Requirements Satisfied

This implementation satisfies the following requirements from the specification:

- **9.1**: Import accepts JSON files with snippet data (title, code, language, tags)
- **9.2**: Import validates data and reports formatting errors
- **9.3**: Export generates JSON file with all snippets and complete metadata
- **9.4**: Supports importing from VS Code snippet format
- **9.5**: Allows selective export of specific collections or filtered snippets

## Future Enhancements

1. **Bulk Import Progress**

   - Progress bar for large imports
   - Batch processing with pause/resume

2. **Export Formats**

   - Export to VS Code format
   - Export to Markdown
   - Export to GitHub Gist

3. **Import Sources**

   - Import from URL
   - Import from GitHub Gist
   - Import from clipboard

4. **Conflict Resolution**

   - Detect duplicate snippets
   - Merge or skip options
   - Smart conflict resolution

5. **Scheduled Backups**
   - Automatic export on schedule
   - Cloud backup integration
   - Version history

## Demo Access

Visit `/demo/import-export` to test the import and export functionality with sample data.
