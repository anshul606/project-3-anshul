# Snippet Components

## SnippetEditor

A comprehensive component for creating and editing code snippets with rich features.

### Features

- **Code Input**: Textarea with tab key support for proper code indentation
- **Language Selection**: Dropdown with 20+ programming languages
- **Metadata Fields**: Title, description, usage notes, and dependencies
- **Tag Management**: Tag input with autocomplete suggestions from existing tags
- **Auto-save Draft**: Automatically saves drafts to localStorage every 2 seconds (create mode only)
- **Form Validation**: Client-side validation for all required fields
- **Loading States**: Visual feedback during save operations
- **Error Handling**: Clear error messages for validation and submission failures

### Props

| Prop       | Type     | Required | Default    | Description                                  |
| ---------- | -------- | -------- | ---------- | -------------------------------------------- |
| `snippet`  | Object   | No       | -          | Existing snippet data (for edit mode)        |
| `onSave`   | Function | Yes      | -          | Callback function called when saving snippet |
| `onCancel` | Function | Yes      | -          | Callback function called when canceling      |
| `mode`     | String   | No       | `"create"` | Editor mode: `"create"` or `"edit"`          |

### Usage

#### Create Mode

```jsx
import { SnippetEditor } from "../components/snippets";
import { useSnippets } from "../hooks/useSnippets";

const CreateSnippetPage = () => {
  const { addSnippet } = useSnippets();

  const handleSave = async (snippetData) => {
    await addSnippet(snippetData);
    // Navigate or show success message
  };

  const handleCancel = () => {
    // Navigate back or close editor
  };

  return (
    <SnippetEditor mode="create" onSave={handleSave} onCancel={handleCancel} />
  );
};
```

#### Edit Mode

```jsx
import { SnippetEditor } from "../components/snippets";
import { useSnippets } from "../hooks/useSnippets";

const EditSnippetPage = ({ snippetId }) => {
  const { getSnippetById, updateSnippet } = useSnippets();
  const snippet = getSnippetById(snippetId);

  const handleSave = async (snippetData) => {
    await updateSnippet(snippetId, snippetData);
    // Navigate or show success message
  };

  const handleCancel = () => {
    // Navigate back or close editor
  };

  return (
    <SnippetEditor
      mode="edit"
      snippet={snippet}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};
```

### Supported Languages

The component supports 25+ programming languages:

- JavaScript, TypeScript
- Python, Java, C++, C, C#
- Go, Rust, PHP, Ruby
- Swift, Kotlin, Dart, R
- HTML, CSS, SCSS
- SQL, Bash, PowerShell
- JSON, YAML, XML, Markdown

### Auto-save Draft

In create mode, the component automatically saves form data to localStorage every 2 seconds. The draft is:

- Loaded automatically when the component mounts
- Cleared when the snippet is successfully saved
- Optionally cleared when the user cancels (with confirmation)

Draft key format: `snippet_draft_new` (create) or `snippet_draft_{snippetId}` (edit)

### Tag Input

Tags support:

- Autocomplete from existing tags
- Custom tag creation
- Validation (alphanumeric and hyphens only)
- Add tags by pressing Enter or comma
- Remove tags by clicking the × button
- Remove last tag by pressing Backspace with empty input

### Form Validation

The component validates:

- Title: Required, max 200 characters
- Code: Required
- Language: Required
- Description: Max 2000 characters
- Usage Notes: Max 2000 characters
- Dependencies: Max 2000 characters
- Tags: Alphanumeric and hyphens only

### Keyboard Support

- **Tab**: Insert 2 spaces in code textarea (prevents focus loss)
- **Enter/Comma**: Add tag in tag input
- **Backspace**: Remove last tag when tag input is empty

### Styling

The component uses Tailwind CSS for styling and follows the application's design system:

- Responsive layout
- Focus states for accessibility
- Error states with red borders and messages
- Loading states with spinner animation
- Consistent spacing and typography
