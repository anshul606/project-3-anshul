# Sharing and Collaboration Implementation

## Overview

This document describes the implementation of sharing and collaboration features for the Code Snippet Manager, allowing users to share snippets with team members and manage permissions.

## Features Implemented

### 1. Share Button in Snippet Detail View

- Added a "Share" button to the `SnippetDetail` component
- Button displays a share icon and opens the sharing modal
- Only visible when `onShare` prop is provided

### 2. ShareModal Component

**Location:** `src/components/shared/ShareModal.jsx`

**Features:**

- Email input field for adding users
- Permission selector (Can view / Can edit)
- Add button to add users to the sharing list
- List of users to be shared with
- Ability to update permissions for each user
- Remove user functionality
- Display of currently shared users
- Email validation
- Duplicate user detection
- Enter key support for quick user addition

**Props:**

- `isOpen` - Controls modal visibility
- `onClose` - Callback when modal is closed
- `onShare` - Callback when share button is clicked (receives array of users)
- `snippet` - The snippet being shared

### 3. Snippet Service - shareSnippet Function

**Location:** `src/services/snippetService.js`

**Function:** `shareSnippet(snippetId, userIds, permission)`

**Features:**

- Validates input parameters
- Retrieves current snippet data
- Merges new shared users with existing ones
- Updates or adds user permissions
- Sets `isShared` flag to true
- Updates snippet with sharing information
- Returns updated snippet
- Includes retry logic for network failures
- Proper error handling and categorization

**Parameters:**

- `snippetId` (string) - ID of the snippet to share
- `userIds` (array) - Array of user IDs to share with
- `permission` (string) - Permission level: 'read' or 'write'

### 4. Updated Firestore Security Rules

**Location:** `firestore.rules`

**Changes:**

- Added helper functions for checking shared access
- Updated read rules to allow access for shared users
- Updated write rules to check for write permission
- Proper array checking using `hasAny()` method
- Maintains owner-only delete permissions

**Security Features:**

- Users can read snippets they own or have been shared with
- Users can edit snippets they own or have write permission on
- Only owners can delete snippets
- Proper timestamp validation on create/update operations

### 5. Shared Snippet Indicators

**Location:** `src/components/snippets/SnippetCard.jsx`

**Features:**

- Share icon displayed next to snippet title for shared snippets
- Icon appears in both grid and list view modes
- Blue color to indicate shared status
- Tooltip on hover showing "Shared snippet"

**Location:** `src/components/snippets/SnippetDetail.jsx`

**Features:**

- "Shared" badge in snippet header
- "Shared With" section showing all users with access
- Permission level displayed for each user (read/write)
- Color-coded permission badges

### 6. Author and Last Editor Information

**Location:** `src/components/snippets/SnippetDetail.jsx`

**Features:**

- Author displayed in metadata section
- Last edited by information shown in metadata
- Timestamps for creation and last update
- Formatted dates for better readability

### 7. Team Collection Functionality

**Location:** `src/services/collectionService.js`

**New Functions:**

#### `addTeamMembers(collectionId, userIds)`

- Adds team members to a collection
- Sets `isTeamCollection` flag to true
- Prevents duplicate members
- Returns updated collection

#### `removeTeamMembers(collectionId, userIds)`

- Removes specified team members
- Automatically sets `isTeamCollection` to false if no members remain
- Returns updated collection

**Existing Support:**

- Collections already have `isTeamCollection` and `teamMembers` fields
- Firestore security rules allow team members to read/write team collections
- Only collection owner can delete collections

## Data Models

### Snippet Sharing Structure

```javascript
{
  sharing: {
    isShared: boolean,
    sharedWith: [
      {
        userId: string,      // Email or user ID
        permission: string   // 'read' or 'write'
      }
    ]
  },
  lastEditedBy: string      // User ID of last editor
}
```

### Collection Team Structure

```javascript
{
  isTeamCollection: boolean,
  teamMembers: [string],    // Array of user IDs
  userId: string            // Collection owner
}
```

## Demo Page

**Location:** `src/pages/SharingDemo.jsx`

**Features:**

- Interactive demo of sharing functionality
- Sample snippet with existing shared users
- Functional share modal
- Information panel explaining features
- Team collaboration workflow explanation
- Toast notifications for actions

**Access:** Navigate to `/demo/sharing` or click "Sharing & Collaboration" from the Demo Hub

## Usage Examples

### Sharing a Snippet

```javascript
import { shareSnippet } from "./services/snippetService";

// Share with multiple users
const sharedUsers = [
  { email: "user1@example.com", permission: "read" },
  { email: "user2@example.com", permission: "write" },
];

await shareSnippet(
  snippetId,
  sharedUsers.map((u) => u.email),
  "read" // default permission
);
```

### Using ShareModal

```javascript
import { ShareModal } from "./components/shared";

<ShareModal
  isOpen={showShareModal}
  onClose={() => setShowShareModal(false)}
  onShare={async (users) => {
    await handleShare(snippet.id, users);
  }}
  snippet={snippet}
/>;
```

### Adding Team Members to Collection

```javascript
import { addTeamMembers } from "./services/collectionService";

await addTeamMembers(collectionId, ["user1@example.com", "user2@example.com"]);
```

## Security Considerations

1. **Email Validation:** ShareModal validates email format before adding users
2. **Permission Levels:** Only 'read' and 'write' permissions are allowed
3. **Owner Protection:** Only snippet owners can delete snippets
4. **Firestore Rules:** Server-side validation ensures security
5. **Array Checking:** Proper use of `hasAny()` for array membership checks

## Testing

### Manual Testing Steps

1. **Share a Snippet:**

   - Open snippet detail view
   - Click "Share" button
   - Add user emails with permissions
   - Verify users appear in the list
   - Click "Share" to confirm

2. **View Shared Snippet:**

   - Check for share icon on snippet card
   - Open snippet detail
   - Verify "Shared" badge is displayed
   - Check "Shared With" section shows all users

3. **Permission Levels:**

   - Share with read permission
   - Share with write permission
   - Verify permission badges display correctly

4. **Team Collections:**
   - Create a collection
   - Add team members
   - Verify team members can access collection

### Demo Page Testing

Visit `/demo/sharing` to test all sharing features interactively.

## Future Enhancements

1. **User Search:** Autocomplete for user emails from existing users
2. **Remove Shared Users:** Ability to revoke access from shared users
3. **Notification System:** Notify users when snippets are shared with them
4. **Activity Log:** Track all sharing and editing activities
5. **Bulk Sharing:** Share multiple snippets at once
6. **Share Links:** Generate shareable links for public access
7. **Team Workspaces:** Dedicated spaces for team collaboration
8. **Real-time Collaboration:** Live editing with multiple users

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

- **7.1:** Share snippets with other users through Firebase permissions ✓
- **7.2:** Provide read-only and editable sharing options ✓
- **7.3:** Update shared snippets for all users with access ✓
- **7.4:** Display author and last editor information ✓
- **7.5:** Create team collections with multiple contributors ✓

## Files Modified/Created

### Created:

- `src/components/shared/ShareModal.jsx`
- `src/pages/SharingDemo.jsx`
- `SHARING_IMPLEMENTATION.md`

### Modified:

- `src/components/shared/index.js`
- `src/components/snippets/SnippetDetail.jsx`
- `src/components/snippets/SnippetCard.jsx`
- `src/services/snippetService.js`
- `src/services/collectionService.js`
- `firestore.rules`
- `src/pages/DemoHub.jsx`
- `src/App.jsx`

## Conclusion

The sharing and collaboration features are now fully implemented, allowing users to:

- Share snippets with team members via email
- Control access with read/write permissions
- View shared snippet indicators
- Track authorship and editing history
- Create team collections for collaborative work

All features are demonstrated in the interactive demo page at `/demo/sharing`.
