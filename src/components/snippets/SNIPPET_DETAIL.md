# SnippetDetail Component

## Overview

The `SnippetDetail` component displays comprehensive information about a code snippet, including its code with syntax highlighting, metadata, sharing status, and action buttons for copying, editing, and deleting.

## Features

- **Full Snippet Display**: Shows title, description, code, tags, and language
- **Syntax Highlighting**: Uses CodeDisplay component with line numbers
- **Metadata Display**: Shows author, creation date, last updated date, and last editor
- **Copy to Clipboard**: One-click code copying with visual feedback
- **Edit & Delete Actions**: Integrated buttons with confirmation modal for deletion
- **Sharing Information**: Displays shared status and list of users with access
- **Toast Notifications**: User feedback for actions (copy, delete)
- **Responsive Design**: Works on desktop and tablet devices

## Usage

```jsx
import { SnippetDetail } from "../components/snippets";

function MyComponent() {
  const snippet = {
    id: "snippet-1",
    title: "Example Snippet",
    description: "A sample code snippet",
    code: "console.log('Hello World');",
    language: "javascript",
    tags: ["example", "demo"],
    metadata: {
      usageNotes: "Use this for...",
      dependencies: "None",
      author: "John Doe",
    },
    sharing: {
      isShared: false,
      sharedWith: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastEditedBy: "user123",
  };

  const handleEdit = (snippet) => {
    // Handle edit action
  };

  const handleDelete = async (snippetId) => {
    // Handle delete action
  };

  const handleClose = () => {
    // Handle close action
  };

  return (
    <SnippetDetail
      snippet={snippet}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClose={handleClose}
    />
  );
}
```

## Props

| Prop       | Type     | Required | Description                                                   |
| ---------- | -------- | -------- | ------------------------------------------------------------- |
| `snippet`  | Object   | Yes      | The snippet object to display                                 |
| `onEdit`   | Function | No       | Callback when edit button is clicked, receives snippet object |
| `onDelete` | Function | No       | Callback when delete is confirmed, receives snippet ID        |
| `onClose`  | Function | No       | Callback when close button is clicked                         |

## Snippet Object Structure

```typescript
{
  id: string;
  userId: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  collectionId?: string;
  metadata: {
    usageNotes?: string;
    dependencies?: string;
    author?: string;
  };
  sharing: {
    isShared: boolean;
    sharedWith: Array<{
      userId: string;
      permission: 'read' | 'write';
    }>;
  };
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  lastEditedBy?: string;
}
```

## Dependencies

- `CodeDisplay` - For syntax-highlighted code display
- `Button` - Reusable button component
- `Modal` - Confirmation modal for delete action
- `Toast` - Notification component for user feedback
- `useClipboard` - Custom hook for clipboard operations

## Demo

A demo page is available at `src/pages/SnippetDetailDemo.jsx` that showcases the component with sample data.

To view the demo:

1. Import the demo page in your router
2. Navigate to the demo route
3. Select different snippets to see the detail view

## Testing

The component includes comprehensive tests in `SnippetDetail.test.jsx`:

- Rendering of snippet information
- Code display with syntax highlighting
- Metadata and tag display
- Copy to clipboard functionality
- Edit and delete actions
- Delete confirmation modal
- Sharing status display
- Empty state handling

Run tests with:

```bash
npm test -- src/components/snippets/SnippetDetail.test.jsx
```

## Styling

The component uses Tailwind CSS for styling and follows the application's design system:

- Responsive layout with proper spacing
- Consistent color scheme
- Hover and focus states for interactive elements
- Smooth transitions and animations

## Accessibility

- Semantic HTML structure
- ARIA labels for icon buttons
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **1.2**: Display all stored snippets with their titles and languages
- **5.3**: Display all associated metadata in a readable format
- **6.1**: Copy code content to clipboard
- **6.2**: Display confirmation message after copy
- **6.3**: Preserve code formatting when copying
- **7.4**: Display author and last editor for shared snippets
