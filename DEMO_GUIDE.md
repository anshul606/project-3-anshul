# Demo Guide - Snippet Manager Components

## Quick Start

The development server is running. You can now test all the new components!

## How to Access the Demos

### Option 1: Demo Hub (Recommended)

Navigate to: **http://localhost:5173/demos**

This is a central hub where you can access all component demos:

- Code Display Demo
- Snippet List Demo
- Snippet Detail Demo (NEW!)

### Option 2: Direct Links

1. **Snippet Detail Demo**: http://localhost:5173/demo/snippet-detail

   - View full snippet details
   - Test copy to clipboard
   - Test edit and delete actions
   - See sharing status and metadata

2. **Snippet List Demo**: http://localhost:5173/demo/snippet-list

   - Browse snippets with virtual scrolling
   - Test filtering and sorting
   - View snippet cards

3. **Code Display Demo**: http://localhost:5173/demo/code-display
   - Test syntax highlighting
   - View different languages

### Option 3: From Home Page

1. Go to: http://localhost:5173
2. Click the "View Demos" button in the top right

## What's New - Snippet Detail Component

The newly implemented SnippetDetail component includes:

### Features to Test:

1. **Copy to Clipboard**

   - Click the "Copy" button
   - Watch for the success toast notification
   - Button changes to "Copied!" temporarily

2. **Edit Action**

   - Click the "Edit" button
   - See the alert (in demo mode)
   - In production, this would open the editor

3. **Delete Action**

   - Click the "Delete" button
   - Confirmation modal appears
   - Click "Delete" to confirm or "Cancel" to abort
   - Success toast appears on deletion

4. **Metadata Display**

   - View all snippet information
   - See author, creation date, last updated
   - View usage notes and dependencies

5. **Sharing Status**

   - Shared snippets show a "Shared" badge
   - View list of users with access
   - See their permission levels (read/write)

6. **Syntax Highlighting**
   - Code is displayed with proper syntax highlighting
   - Line numbers are shown
   - Supports multiple languages

## Sample Data

The demo includes 3 sample snippets:

1. **React useState Hook** - JavaScript example
2. **Python List Comprehension** - Python example (shared with 2 users)
3. **SQL JOIN Query** - SQL example (shared with 1 user)

## Testing Workflow

1. Start at the Demo Hub: `/demos`
2. Click "Snippet Detail" card
3. Select different snippets from the left sidebar
4. Test all the features:
   - Copy code
   - Try to edit (shows alert)
   - Try to delete (shows confirmation)
   - View metadata and sharing info
5. Close the detail view with the X button

## Components Created

### New Components:

- `SnippetDetail.jsx` - Main detail view component
- `Button.jsx` - Reusable button component
- `Modal.jsx` - Modal dialog component
- `Toast.jsx` - Toast notification component
- `useClipboard.js` - Clipboard hook

### Demo Pages:

- `SnippetDetailDemo.jsx` - Interactive demo with sample data
- `DemoHub.jsx` - Central navigation for all demos

## Next Steps

After testing, you can:

1. Integrate SnippetDetail into the main app
2. Connect it to real Firebase data
3. Wire up the edit functionality to SnippetEditor
4. Add more features as needed

## Troubleshooting

If you don't see the components:

1. Make sure the dev server is running: `npm run dev`
2. Check the browser console for errors
3. Try refreshing the page
4. Clear browser cache if needed

## URLs Summary

- **Demo Hub**: http://localhost:5173/demos
- **Snippet Detail**: http://localhost:5173/demo/snippet-detail
- **Snippet List**: http://localhost:5173/demo/snippet-list
- **Code Display**: http://localhost:5173/demo/code-display
- **Home**: http://localhost:5173

Enjoy testing! 🚀
